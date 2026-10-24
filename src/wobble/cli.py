"""Command line interface for local hunts."""

import argparse
import json
import sys
from dataclasses import asdict
from importlib import resources
from pathlib import Path

from wobble.agent import run_agent
from wobble.container_runner import ContainerPytestRunner
from wobble.hunt import hunt
from wobble.investigate import investigate
from wobble.model_setup import DEFAULT_MODEL, SetupError, doctor, setup
from wobble.ollama_client import ModelError, OllamaClient
from wobble.repair import repair
from wobble.runner import PytestRunner, RunnerError
from wobble.verify import reproducer_from_evidence, verify_patch


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="wobble", description="Hunt flaky pytest tests")
    commands = parser.add_subparsers(dest="command", required=True)
    doctor_command = commands.add_parser("doctor", help="Check the local Ollama model without downloading")
    doctor_command.add_argument("--model", default=DEFAULT_MODEL)
    doctor_command.add_argument("--ollama-url", help="Ollama server URL (default: local server)")
    doctor_command.add_argument("--timeout", type=float, default=180)
    doctor_command.add_argument("--check-inference", action="store_true", help="Ask the model for a short structured reply")
    setup_command = commands.add_parser("setup", help="Install and check a local model with consent")
    setup_command.add_argument("--model", default=DEFAULT_MODEL)
    setup_command.add_argument("--ollama-url", help="Ollama server URL (default: local server)")
    setup_command.add_argument("--timeout", type=float, default=180)
    setup_command.add_argument("--yes", action="store_true", help="Approve a model download without a prompt")
    dockerfile_command = commands.add_parser("dockerfile", help="Export the packaged Docker runner recipe")
    dockerfile_command.add_argument("--output", type=Path, required=True)
    dockerfile_command.add_argument("--force", action="store_true", help="Replace an existing output file")
    hunt_command = commands.add_parser("hunt", help="Repeat tests in shuffled orders")
    hunt_command.add_argument("repo", type=Path, help="Trusted repository to test")
    hunt_command.add_argument("--select", default=".", help="pytest path or node ID")
    hunt_command.add_argument("--runs", type=int, default=20)
    hunt_command.add_argument("--seed", type=int, default=0)
    hunt_command.add_argument("--timeout", type=float, default=120)
    hunt_command.add_argument("--runner", choices=("local", "docker"), default="local")
    hunt_command.add_argument("--image", default="wobble-pytest:py311", help="Docker image with pytest and target dependencies")
    hunt_command.add_argument("--cpus", type=float, default=1.0, help="Docker CPU limit")
    hunt_command.add_argument("--memory-mb", type=int, default=512, help="Docker memory limit")
    hunt_command.add_argument("--pids-limit", type=int, default=64, help="Docker process limit")
    hunt_command.add_argument("--clock-shift-seconds", type=int, default=0, help="Shift container wall clock")
    hunt_command.add_argument("--minimize", action="store_true")
    hunt_command.add_argument("--agent", action="store_true", help="Let a local model choose investigation experiments")
    hunt_command.add_argument("--agent-steps", type=int, default=5)
    hunt_command.add_argument("--model", default=DEFAULT_MODEL)
    hunt_command.add_argument("--ollama-url", help="Ollama server URL for --agent")
    hunt_command.add_argument("--model-timeout", type=float, default=90)
    hunt_command.add_argument("--replay-budget", type=int, default=80)
    hunt_command.add_argument("--output", type=Path, help="Save full JSON evidence")
    verify_command = commands.add_parser("verify", help="Check a patch in a disposable repository copy")
    verify_command.add_argument("repo", type=Path)
    verify_command.add_argument("--patch", type=Path, required=True)
    verify_command.add_argument("--evidence", type=Path, required=True, help="JSON hunt with a minimized reproducer")
    verify_command.add_argument("--runs", type=int, default=100)
    verify_command.add_argument("--timeout", type=float, default=120)
    verify_command.add_argument("--image", default="wobble-pytest:py311")
    verify_command.add_argument("--output", type=Path)
    repair_command = commands.add_parser("repair", help="Ask a local model for a patch and verify it")
    repair_command.add_argument("repo", type=Path)
    repair_command.add_argument("--evidence", type=Path, required=True)
    repair_command.add_argument("--model", default=DEFAULT_MODEL)
    repair_command.add_argument("--ollama-url", help="Ollama server URL")
    repair_command.add_argument("--model-timeout", type=float, default=180)
    repair_command.add_argument("--attempts", type=int, default=2)
    repair_command.add_argument("--screen-runs", type=int, default=5)
    repair_command.add_argument("--verify-runs", type=int, default=100)
    repair_command.add_argument("--no-baseline", action="store_true")
    repair_command.add_argument("--baseline-only", action="store_true", help="Run the deterministic baseline without a model")
    repair_command.add_argument("--timeout", type=float, default=120)
    repair_command.add_argument("--image", default="wobble-pytest:py311")
    repair_command.add_argument("--output", type=Path)
    repair_command.add_argument("--patch-output", type=Path, help="Save the verified model patch")
    return parser


def _verify_command(args: argparse.Namespace) -> int:
    victim, prefix, seed, conditions = reproducer_from_evidence(args.evidence)
    make_runner = _runner_factory(conditions, args.timeout, args.image)
    result = verify_patch(args.repo, args.patch, victim, prefix, make_runner, args.runs, seed)
    print(f"Patch verification: {result.status} ({result.completed_runs}/{result.requested_runs} full-suite runs)")
    print(result.reason)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result.to_dict(), indent=2) + "\n", encoding="utf-8")
        print(f"Saved evidence to {args.output}")
    return 0 if result.status == "verified" else 1


def _dockerfile_command(args: argparse.Namespace) -> int:
    if args.output.exists() and not args.force:
        raise ValueError(f"Output already exists: {args.output}; use --force to replace it")
    recipe = resources.files("wobble").joinpath("resources/Dockerfile.runner").read_text(encoding="utf-8")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(recipe, encoding="utf-8")
    print(f"Saved Docker runner recipe to {args.output}")
    return 0


def _runner_factory(conditions: dict, timeout: float, image: str):
    def make_runner(repo: Path):
        if conditions.get("cpu_limit") is None:
            return PytestRunner(repo, timeout)
        return ContainerPytestRunner(
            repo, timeout, image,
            conditions["cpu_limit"], conditions["memory_mb"],
            conditions["pids_limit"], conditions["clock_shift_seconds"],
        )
    return make_runner


def _repair_command(args: argparse.Namespace) -> int:
    _, _, _, conditions = reproducer_from_evidence(args.evidence)
    if args.baseline_only and args.no_baseline:
        raise ValueError("--baseline-only requires the baseline")
    client = None if args.baseline_only else OllamaClient(args.model, args.model_timeout, args.ollama_url)
    report = repair(
        args.repo, args.evidence, _runner_factory(conditions, args.timeout, args.image),
        client, args.attempts, args.screen_runs, args.verify_runs,
        not args.no_baseline,
    )
    for label, attempts in (("Baseline", report.baseline), (f"Model {report.model}", report.model_attempts)):
        if not attempts:
            print(f"{label}: no candidate")
        for index, attempt in enumerate(attempts, 1):
            completed = attempt.final.completed_runs if attempt.final else 0
            print(f"{label} attempt {index}: {attempt.status} ({completed}/{report.verify_runs} final reruns)")
            print(attempt.reason)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        data = report.to_dict()
        data["model_calls"] = client.calls if client else []
        args.output.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        print(f"Saved repair evidence to {args.output}")
    verified_model = next((item for item in report.model_attempts if item.status == "verified"), None)
    if args.patch_output and verified_model:
        args.patch_output.parent.mkdir(parents=True, exist_ok=True)
        args.patch_output.write_text(verified_model.patch, encoding="utf-8")
        print(f"Saved verified model patch to {args.patch_output}")
    verified_baseline = any(item.status == "verified" for item in report.baseline)
    return 0 if verified_model or (args.baseline_only and verified_baseline) else 1


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.command == "doctor":
            return doctor(args.model, args.ollama_url, args.timeout, args.check_inference)
        if args.command == "setup":
            return setup(args.model, args.ollama_url, args.timeout, args.yes)
        if args.command == "dockerfile":
            return _dockerfile_command(args)
        if args.command == "verify":
            return _verify_command(args)
        if args.command == "repair":
            return _repair_command(args)
        if args.agent and args.minimize:
            raise ValueError("Use either --agent or --minimize for one investigation")
        client = OllamaClient(args.model, args.model_timeout, args.ollama_url) if args.agent else None
        if args.runner == "docker":
            runner = ContainerPytestRunner(
                args.repo, args.timeout, args.image, args.cpus, args.memory_mb,
                args.pids_limit, args.clock_shift_seconds,
            )
        else:
            if args.clock_shift_seconds:
                raise ValueError("Clock shifts require --runner docker")
            runner = PytestRunner(args.repo, args.timeout)
        report = hunt(runner, args.select, args.runs, args.seed)
        print(f"Ran {len(report.tests)} tests in {len(report.runs)} shuffled orders")
        for test in report.tests:
            if test.failure_rate is None:
                print(f"{test.nodeid}: only skipped")
                continue
            print(
                f"{test.nodeid}: {test.failed}/{test.passed + test.failed} failed "
                f"({test.failure_rate:.1%}; 95% CI {test.confidence_low:.1%}–"
                f"{test.confidence_high:.1%}) — {test.classification}"
            )

        evidence = report.to_dict()
        flaky = next((test for test in report.tests if test.classification == "observed flaky"), None)
        if args.minimize:
            if flaky:
                result = investigate(runner, report, flaky.nodeid, args.replay_budget)
                evidence["investigation"] = asdict(result)
                print(f"Investigation: {result.conclusion}")
                if result.minimized_prefix is not None:
                    print(f"Victim: {result.victim}")
                    print(f"Earlier tests needed: {result.minimized_prefix}")
            else:
                print("No test showed both a pass and a failure; nothing to minimize")
        if args.agent:
            if flaky:
                try:
                    result = run_agent(
                        runner, report, flaky.nodeid, client, args.agent_steps,
                    )
                    evidence["agent"] = asdict(result)
                    for step in result.steps:
                        print(f"Agent action: {step.decision.action} → {step.observation}")
                    print(f"Agent result: {result.status}; diagnosis: {result.diagnosis}")
                    if result.status == "insufficient_evidence":
                        print(f"Model proposed {result.model_diagnosis}, but the experiments did not support it")
                except (ModelError, ValueError) as error:
                    evidence["agent_error"] = str(error)
                    print(f"Agent stopped: {error}", file=sys.stderr)
                evidence["model_calls"] = client.calls
            else:
                print("No test showed both a pass and a failure; agent has no victim")

        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
            print(f"Saved evidence to {args.output}")
        return 2 if "agent_error" in evidence else 0
    except (OSError, RunnerError, ValueError, ModelError, SetupError) as error:
        print(f"wobble: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
