"""Propose bounded source edits and measure them with the existing verifier."""

import ast
import difflib
import json
import tempfile
import textwrap
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Callable, Protocol

from wobble.ollama_client import InsertionProposal, ModelError, PatchProposal
from wobble.runner import PytestRunner, RunnerError
from wobble.verify import VerificationResult, reproducer_from_evidence, verify_patch


class PatchModel(Protocol):
    model: str

    def propose_insertion(self, evidence: dict) -> InsertionProposal: ...


@dataclass(frozen=True)
class RepairAttempt:
    source: str
    rationale: str
    patch: str
    status: str
    reason: str
    screen: VerificationResult | None = None
    final: VerificationResult | None = None


@dataclass(frozen=True)
class RepairReport:
    model: str
    victim: str
    prefix: list[str]
    screen_runs: int
    verify_runs: int
    baseline: list[RepairAttempt]
    model_attempts: list[RepairAttempt]

    def to_dict(self) -> dict:
        result = asdict(self)
        result["comparison"] = {
            "baseline_verified": any(item.status == "verified" for item in self.baseline),
            "model_verified": any(item.status == "verified" for item in self.model_attempts),
        }
        return result


def _allowed_source(repo: Path, victim: str, prefix: list[str]) -> dict[str, str]:
    result = {}
    for nodeid in [victim, *prefix]:
        relative = nodeid.split("::", 1)[0]
        original_path = repo / relative
        path = original_path.resolve()
        if (
            not path.is_relative_to(repo) or original_path.is_symlink() or path.suffix != ".py"
            or not path.is_file() or path.stat().st_size > 8000
        ):
            continue
        result[relative] = path.read_text(encoding="utf-8")
    return result


def _allowed_insertions(prefix: list[str], source: dict[str, str]) -> dict[str, list[int]]:
    points: dict[str, set[int]] = {}
    for nodeid in prefix:
        parts = nodeid.split("::")
        file = parts[0]
        if file not in source or len(parts) < 2:
            continue
        scope = ast.parse(source[file]).body
        selected = None
        parts[-1] = parts[-1].split("[", 1)[0]
        for name in parts[1:]:
            matches = [
                node for node in scope
                if isinstance(node, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef))
                and node.name == name
            ]
            if len(matches) != 1:
                selected = None
                break
            selected = matches[0]
            scope = selected.body
        if isinstance(selected, (ast.FunctionDef, ast.AsyncFunctionDef)):
            points.setdefault(file, set()).update(
                statement.end_lineno for statement in selected.body
            )
    return {file: sorted(lines) for file, lines in points.items() if lines}


def _cleanup_examples(source: dict[str, str]) -> list[dict]:
    """Show the model short cleanup statements that existing tests already use."""
    examples = []
    methods = {"clear", "pop", "discard", "remove", "unlink", "close"}
    for file, contents in source.items():
        for node in ast.walk(ast.parse(contents)):
            if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) or not node.name.startswith("test_"):
                continue
            for statement in node.body:
                call = statement.value if isinstance(statement, ast.Expr) else None
                if not (
                    isinstance(statement, ast.Delete)
                    or isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute)
                    and call.func.attr in methods
                ):
                    continue
                code = ast.get_source_segment(contents, statement)
                if code and "\n" not in code and len(code) <= 200:
                    examples.append({
                        "file": file, "line": statement.lineno,
                        "code": " " * statement.col_offset + code,
                    })
                    if len(examples) == 8:
                        return examples
    return examples


def patch_from_proposal(repo: Path, proposal: PatchProposal, allowed: dict[str, str]) -> str:
    if proposal.file not in allowed:
        raise ValueError("Proposal targets a file outside the minimized reproducer")
    relative = proposal.file
    path = repo / relative
    if path.is_symlink() or not path.resolve().is_relative_to(repo.resolve()):
        raise ValueError("Proposal targets a linked or external file")
    original = allowed[relative]
    if original.count(proposal.old) != 1:
        raise ValueError("Old source block must occur exactly once")
    revised = original.replace(proposal.old, proposal.new, 1)
    if revised == original or len(revised) > 12000:
        raise ValueError("Proposal did not make a bounded source change")
    try:
        ast.parse(revised, filename=relative)
    except SyntaxError as error:
        raise ValueError(f"Proposal produced invalid Python: {error.msg}") from error
    diff = "".join(difflib.unified_diff(
        original.splitlines(keepends=True), revised.splitlines(keepends=True),
        fromfile=f"a/{relative}", tofile=f"b/{relative}",
    ))
    if not diff:
        raise ValueError("Proposal produced no patch")
    return diff


def patch_from_insertion(repo: Path, proposal: InsertionProposal, allowed: dict[str, str]) -> str:
    if proposal.file not in allowed:
        raise ValueError("Insertion targets a file outside the minimized reproducer")
    path = repo / proposal.file
    if path.is_symlink() or not path.resolve().is_relative_to(repo.resolve()):
        raise ValueError("Insertion targets a linked or external file")
    original = allowed[proposal.file]
    lines = original.splitlines(keepends=True)
    if proposal.after_line < 1 or proposal.after_line > len(lines):
        raise ValueError("Insertion line is outside the source file")
    if not lines[proposal.after_line - 1].endswith("\n"):
        raise ValueError("Cannot insert after an unterminated source line")
    code = proposal.code
    dedented = textwrap.dedent(code)
    try:
        inserted_tree = ast.parse(dedented)
    except SyntaxError as error:
        if "\\n" not in code:
            raise ValueError(f"Insertion is invalid Python: {error.msg}") from error
        code = code.replace("\\n", "\n")
        dedented = textwrap.dedent(code)
        try:
            inserted_tree = ast.parse(dedented)
        except SyntaxError:
            raise ValueError(f"Insertion is invalid Python: {error.msg}") from error
    if len(inserted_tree.body) > 1:
        original_tree = ast.parse(original)
        existing_statements = {
            ast.dump(node, include_attributes=False)
            for node in ast.walk(original_tree)
            if isinstance(node, ast.stmt) and node.end_lineno <= proposal.after_line
        }
        remaining = inserted_tree.body.copy()
        while len(remaining) > 1 and ast.dump(remaining[0], include_attributes=False) in existing_statements:
            remaining.pop(0)
        if len(remaining) == 1:
            statement = ast.get_source_segment(dedented, remaining[0])
            if statement is not None:
                indent = lines[proposal.after_line - 1][:len(lines[proposal.after_line - 1]) - len(lines[proposal.after_line - 1].lstrip())]
                code = textwrap.indent(statement, indent)
                inserted_tree = ast.parse(textwrap.dedent(code))
    if len(inserted_tree.body) != 1:
        raise ValueError("Insert one cleanup action; do not add tests or assertions")
    action = inserted_tree.body[0]
    simple_cleanup = lambda node: isinstance(node, (ast.Expr, ast.Assign, ast.Delete))
    conditional_cleanup = (
        isinstance(action, ast.If) and len(action.body) == 1
        and simple_cleanup(action.body[0])
        and (not action.orelse or (
            len(action.orelse) == 1
            and ast.dump(action.body[0], include_attributes=False)
            == ast.dump(action.orelse[0], include_attributes=False)
        ))
    )
    if conditional_cleanup and action.orelse:
        anchor = lines[proposal.after_line - 1]
        indent = anchor[:len(anchor) - len(anchor.lstrip())]
        code = textwrap.indent(ast.unparse(action.body[0]), indent)
        inserted_tree = ast.parse(textwrap.dedent(code))
        action = inserted_tree.body[0]
    if not isinstance(action, (ast.Expr, ast.Assign, ast.Delete)) and not conditional_cleanup:
        raise ValueError("Insert one cleanup action; do not add tests or assertions")
    if any(
        isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
        and node.func.id.startswith("test_")
        for node in ast.walk(inserted_tree)
    ):
        raise ValueError("Do not call another test function from a repair")
    inserted = code.rstrip("\n") + "\n"
    revised = "".join(lines[:proposal.after_line]) + inserted + "".join(lines[proposal.after_line:])
    try:
        ast.parse(revised, filename=proposal.file)
    except SyntaxError as error:
        raise ValueError(f"Insertion produced invalid Python: {error.msg}") from error
    return "".join(difflib.unified_diff(
        original.splitlines(keepends=True), revised.splitlines(keepends=True),
        fromfile=f"a/{proposal.file}", tofile=f"b/{proposal.file}",
    ))


def deterministic_baseline(repo: Path, victim: str, prefix: list[str]) -> PatchProposal | None:
    """Handle only a one-statement test that writes a module-level dictionary."""
    if len(prefix) != 1:
        return None
    polluter_file, polluter_name = prefix[0].split("::", 1)
    victim_file, victim_name = victim.split("::", 1)
    if polluter_file != victim_file or "::" in polluter_name or "::" in victim_name:
        return None
    source = _allowed_source(repo.resolve(), victim, prefix).get(polluter_file)
    if source is None:
        return None
    tree = ast.parse(source)
    functions = {node.name: node for node in tree.body if isinstance(node, ast.FunctionDef)}
    polluter, target = functions.get(polluter_name), functions.get(victim_name)
    if polluter is None or target is None or len(polluter.body) != 1:
        return None
    statement = polluter.body[0]
    if not isinstance(statement, ast.Assign) or len(statement.targets) != 1:
        return None
    target_expr = statement.targets[0]
    if not isinstance(target_expr, ast.Subscript) or not isinstance(target_expr.value, ast.Name):
        return None
    state_name = target_expr.value.id
    globals_are_dicts = any(
        isinstance(node, ast.Assign) and isinstance(node.value, ast.Dict)
        and any(isinstance(item, ast.Name) and item.id == state_name for item in node.targets)
        for node in tree.body
    )
    victim_reads_state = any(isinstance(node, ast.Name) and node.id == state_name for node in ast.walk(target))
    if not globals_are_dicts or not victim_reads_state:
        return None
    old = ast.get_source_segment(source, polluter)
    if old is None or source.count(old) != 1:
        return None
    lines = source.splitlines()
    indent = lines[statement.lineno - 1][:statement.col_offset]
    new = old + f"\n{indent}{state_name}.clear()"
    return PatchProposal(polluter_file, old, new, "Clear the module dictionary after the polluter test")


def _evaluate(
    source: str,
    proposal: PatchProposal | InsertionProposal,
    repo: Path,
    allowed: dict[str, str],
    victim: str,
    prefix: list[str],
    runner_factory: Callable[[Path], PytestRunner],
    seed: int,
    screen_runs: int,
    verify_runs: int,
) -> RepairAttempt:
    patch = ""
    try:
        patch = (
            patch_from_insertion(repo, proposal, allowed)
            if isinstance(proposal, InsertionProposal)
            else patch_from_proposal(repo, proposal, allowed)
        )
        with tempfile.TemporaryDirectory(prefix="wobble-repair-") as directory:
            path = Path(directory) / "candidate.diff"
            path.write_text(patch, encoding="utf-8")
            screen = verify_patch(repo, path, victim, prefix, runner_factory, screen_runs, seed)
            if screen.status != "verified":
                return RepairAttempt(source, proposal.rationale, patch, screen.status, screen.reason, screen)
            final = screen if verify_runs == screen_runs else verify_patch(
                repo, path, victim, prefix, runner_factory, verify_runs, seed,
            )
            return RepairAttempt(source, proposal.rationale, patch, final.status, final.reason, screen, final)
    except (ValueError, RunnerError) as error:
        return RepairAttempt(source, proposal.rationale, patch, "rejected", str(error))


def repair(
    repo: Path,
    evidence_path: Path,
    runner_factory: Callable[[Path], PytestRunner],
    model: PatchModel | None,
    attempts: int = 2,
    screen_runs: int = 5,
    verify_runs: int = 100,
    compare_baseline: bool = True,
) -> RepairReport:
    if attempts < 1 or screen_runs < 1 or verify_runs < screen_runs:
        raise ValueError("Repair budgets must be positive, with verify-runs at least screen-runs")
    repo = repo.resolve()
    victim, prefix, seed, _ = reproducer_from_evidence(evidence_path)
    hunt_evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
    failed_run = next((
        run for run in hunt_evidence["runs"]
        if run.get("outcomes", {}).get(victim, {}).get("status") == "failed"
    ), None)
    allowed = _allowed_source(repo, victim, prefix)
    if not allowed:
        raise ValueError("The minimized reproducer has no small, editable Python file")
    insertion_points = _allowed_insertions(prefix, allowed)
    baseline: list[RepairAttempt] = []
    if compare_baseline:
        candidate = deterministic_baseline(repo, victim, prefix)
        if candidate is not None:
            baseline.append(_evaluate(
                "deterministic", candidate, repo, allowed, victim, prefix,
                runner_factory, seed, screen_runs, verify_runs,
            ))
    feedback: list[dict[str, str]] = []
    seen: set[str] = set()
    model_attempts: list[RepairAttempt] = []
    for _ in range(attempts if model is not None else 0):
        candidate_evidence = {
            "victim": victim,
            "minimized_prefix": prefix,
            "failing_log": (
                failed_run["outcomes"][victim].get("failure", "")[-2000:]
                if failed_run else ""
            ),
            "allowed_files": list(insertion_points),
            "allowed_insertions": insertion_points,
            "cleanup_examples": _cleanup_examples(allowed),
            "numbered_source": {
                file: "\n".join(f"{number}: {line}" for number, line in enumerate(source.splitlines(), 1))
                for file, source in allowed.items()
            },
            "previous_attempts": feedback,
        }
        try:
            if not insertion_points:
                raise ModelError("No safe insertion point exists in the minimized prefix")
            candidate = model.propose_insertion(candidate_evidence)
        except ModelError as error:
            model_attempts.append(RepairAttempt("model", "", "", "rejected", str(error)))
            break
        candidate_key = repr(candidate)
        if candidate_key in seen:
            model_attempts.append(RepairAttempt("model", candidate.rationale, "", "rejected", "Model repeated a candidate edit"))
            feedback.append({"status": "rejected", "reason": "Repeated edit", "file": candidate.file})
            continue
        seen.add(candidate_key)
        if candidate.after_line not in insertion_points.get(candidate.file, []):
            attempt = RepairAttempt(
                "model", candidate.rationale, "", "rejected",
                "Model selected a line outside the earlier tests",
            )
            model_attempts.append(attempt)
            feedback.append({"status": attempt.status, "reason": attempt.reason, "file": candidate.file})
            continue
        attempt = _evaluate(
            "model", candidate, repo, allowed, victim, prefix,
            runner_factory, seed, screen_runs, verify_runs,
        )
        model_attempts.append(attempt)
        if attempt.status == "verified":
            break
        feedback.append({
            "status": attempt.status, "reason": attempt.reason, "file": candidate.file,
            "proposed_edit": str(candidate)[:1200],
            "test_failure": (
                attempt.screen.patched_reproducer.outcomes[victim].get("failure", "")[-1200:]
                if attempt.screen and attempt.screen.patched_reproducer else ""
            ),
        })
    return RepairReport(model.model if model is not None else "none", victim, prefix, screen_runs, verify_runs, baseline, model_attempts)
