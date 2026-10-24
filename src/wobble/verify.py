"""Apply a candidate patch in a copy and check repeated pytest outcomes."""

import ast
import hashlib
import json
import random
import shutil
import subprocess
import tempfile
from copy import copy as shallow_copy
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Callable

from wobble.runner import PytestRunner, RunResult, RunnerError


@dataclass(frozen=True)
class VerificationResult:
    status: str
    reason: str
    victim: str
    prefix: list[str]
    patch_sha256: str
    requested_runs: int
    completed_runs: int
    baseline: RunResult | None
    patched_reproducer: RunResult | None
    full_suite_runs: list[RunResult]

    def to_dict(self) -> dict:
        return asdict(self)


def reproducer_from_evidence(path: Path) -> tuple[str, list[str], int, dict]:
    evidence = json.loads(path.read_text(encoding="utf-8"))
    investigation = evidence.get("investigation")
    if not investigation:
        for step in evidence.get("agent", {}).get("steps", []):
            if step["decision"]["action"] == "minimize_order":
                investigation = step["observation"]
                break
    if not investigation or investigation.get("minimized_prefix") is None:
        raise ValueError("Evidence has no reproduced, minimized prefix")
    conditions = evidence["runs"][0].get("conditions", {})
    return investigation["victim"], investigation["minimized_prefix"], evidence["seed"], conditions


def _assertions(path: Path) -> Counter[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    result: Counter[str] = Counter()
    for node in ast.walk(tree):
        if isinstance(node, ast.Assert):
            result[ast.dump(node, include_attributes=False)] += 1
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
            if node.func.attr.startswith("assert") or node.func.attr == "raises":
                result[ast.dump(node, include_attributes=False)] += 1
    return result


def _test_function(tree: ast.Module, nodeid: str) -> ast.FunctionDef | ast.AsyncFunctionDef | None:
    parts = nodeid.split("::")[1:]
    if not parts:
        return None
    parts[-1] = parts[-1].split("[", 1)[0]
    scope = tree.body
    selected = None
    for name in parts:
        matches = [
            node for node in scope
            if isinstance(node, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef))
            and node.name == name
        ]
        if len(matches) != 1:
            return None
        selected = matches[0]
        scope = selected.body
    if not isinstance(selected, (ast.FunctionDef, ast.AsyncFunctionDef)):
        return None
    return selected


def _victim_function(path: Path, nodeid: str) -> str | None:
    selected = _test_function(ast.parse(path.read_text(encoding="utf-8")), nodeid)
    return ast.dump(selected, include_attributes=False) if selected is not None else None


def _preserves_test_body(
    original: ast.FunctionDef | ast.AsyncFunctionDef,
    changed: ast.FunctionDef | ast.AsyncFunctionDef,
) -> bool:
    """Allow appended cleanup, but preserve each original test statement and its header."""
    old_header, new_header = shallow_copy(original), shallow_copy(changed)
    old_header.body, new_header.body = [], []
    if ast.dump(old_header, include_attributes=False) != ast.dump(new_header, include_attributes=False):
        return False
    if len(changed.body) < len(original.body):
        return False
    return all(
        ast.dump(before, include_attributes=False) == ast.dump(after, include_attributes=False)
        for before, after in zip(original.body, changed.body)
    )


def _apply_patch(copy: Path, patch: Path) -> None:
    for operation in (["git", "apply", "--check", str(patch)], ["git", "apply", str(patch)]):
        completed = subprocess.run(operation, cwd=copy, text=True, capture_output=True, check=False)
        if completed.returncode:
            raise RunnerError(f"Patch could not be applied: {completed.stderr.strip()}")


def verify_patch(
    repo: Path,
    patch: Path,
    victim: str,
    prefix: list[str],
    runner_factory: Callable[[Path], PytestRunner],
    runs: int = 100,
    seed: int = 0,
) -> VerificationResult:
    if runs < 1:
        raise ValueError("Verification runs must be positive")
    repo, patch = repo.resolve(), patch.resolve()
    patch_hash = hashlib.sha256(patch.read_bytes()).hexdigest()

    def result(status, reason, baseline=None, patched=None, full=None):
        full = full or []
        return VerificationResult(
            status, reason, victim, prefix, patch_hash, runs, len(full),
            baseline, patched, full,
        )

    with tempfile.TemporaryDirectory(prefix="wobble-verify-") as directory:
        copy = Path(directory) / "repo"
        shutil.copytree(
            repo, copy, symlinks=True,
            ignore=shutil.ignore_patterns(".git", ".venv", ".pytest_cache", "__pycache__"),
        )
        _apply_patch(copy, patch)
        original_runner, patched_runner = runner_factory(repo), runner_factory(copy)
        before, after = original_runner.collect(), patched_runner.collect()
        removed = set(before) - set(after)
        if removed:
            return result("rejected", f"Patch removed collected tests: {sorted(removed)[:5]}")
        victim_file = victim.split("::", 1)[0]
        old_victim, new_victim = _victim_function(repo / victim_file, victim), _victim_function(copy / victim_file, victim)
        if old_victim is None or old_victim != new_victim:
            return result("rejected", "Patch changed or shadowed the victim test")
        for file in {nodeid.split("::", 1)[0] for nodeid in before}:
            old_file, new_file = repo / file, copy / file
            if old_file.suffix == ".py" and old_file.is_file() and new_file.is_file():
                if _assertions(old_file) - _assertions(new_file):
                    return result("rejected", f"Patch changed or removed assertions from {file}")
                original_tree = ast.parse(old_file.read_text(encoding="utf-8"))
                changed_tree = ast.parse(new_file.read_text(encoding="utf-8"))
                for nodeid in before:
                    if nodeid == victim or nodeid.split("::", 1)[0] != file:
                        continue
                    original_test = _test_function(original_tree, nodeid)
                    changed_test = _test_function(changed_tree, nodeid)
                    if original_test is not None and (
                        changed_test is None or not _preserves_test_body(original_test, changed_test)
                    ):
                        return result("rejected", f"Patch changed original test behavior in {nodeid}")

        baseline = original_runner.run([*prefix, victim])
        if baseline.outcomes[victim]["status"] != "failed":
            return result("inconclusive", "Original reproducer did not fail", baseline)
        patched = patched_runner.run([*prefix, victim])
        if patched.outcomes[victim]["status"] != "passed":
            return result("failed", "Patched reproducer still fails", baseline, patched)

        randomizer = random.Random(seed)
        full_runs = []
        for _ in range(runs):
            order = after.copy()
            randomizer.shuffle(order)
            run = patched_runner.run(order)
            full_runs.append(run)
            if any(outcome["status"] != "passed" for outcome in run.outcomes.values()):
                return result("failed", "A full-suite rerun did not pass", baseline, patched, full_runs)
        return result("verified", "Reproducer and all full-suite reruns passed", baseline, patched, full_runs)
