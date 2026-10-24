"""Compare local repair models on three fixed, reproducible demo cases."""

import argparse
import json
from dataclasses import asdict
from pathlib import Path

from wobble.container_runner import ContainerPytestRunner
from wobble.hunt import hunt
from wobble.investigate import investigate
from wobble.model_setup import SetupError, installed_model, list_models, resolve_ollama_url
from wobble.ollama_client import OllamaClient
from wobble.repair import repair


ROOT = Path(__file__).resolve().parents[1]
CASES = (
    ("dictionary", ROOT / "examples/order_dependent"),
    ("polluter_assertion", ROOT / "examples/order_with_assertion"),
    ("list", ROOT / "examples/order_with_list"),
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", action="append", required=True, help="Local Ollama model; repeat to compare models")
    parser.add_argument("--hunt-runs", type=int, default=20)
    parser.add_argument("--screen-runs", type=int, default=5)
    parser.add_argument("--verify-runs", type=int, default=100)
    parser.add_argument("--output", type=Path, default=ROOT / "reports/model-benchmark.json")
    args = parser.parse_args()
    if args.hunt_runs < 2 or args.screen_runs < 1 or args.verify_runs < args.screen_runs:
        parser.error("Run budgets must be positive; verify-runs must be at least screen-runs")
    if len(set(args.model)) != len(args.model):
        parser.error("Each --model name may appear only once")
    if any(not name.strip() or name.endswith(":cloud") for name in args.model):
        parser.error("--model requires an installed local model, not a cloud tag")
    try:
        models = list_models(resolve_ollama_url())
    except SetupError as error:
        parser.error(str(error))
    missing = [name for name in args.model if installed_model(models, name) is None]
    if missing:
        parser.error(f"Models are not installed on the configured Ollama server: {', '.join(missing)}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    detailed = {}
    counts = {model: 0 for model in args.model}
    baseline_count = 0
    for name, repo in CASES:
        runner = ContainerPytestRunner(repo)
        found = hunt(runner, ".", args.hunt_runs, seed=0)
        flaky = next((test for test in found.tests if test.classification == "observed flaky"), None)
        if flaky is None:
            raise RuntimeError(f"{name}: no observed flaky test")
        minimized = investigate(runner, found, flaky.nodeid)
        if minimized.minimized_prefix is None:
            raise RuntimeError(f"{name}: no minimized reproducer")
        evidence_path = args.output.parent / f"{name}-hunt.json"
        evidence = found.to_dict()
        evidence["investigation"] = asdict(minimized)
        evidence_path.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
        make_runner = lambda path: ContainerPytestRunner(path)
        baseline = repair(repo, evidence_path, make_runner, model=None,
                          screen_runs=args.screen_runs, verify_runs=args.verify_runs)
        baseline_ok = any(item.status == "verified" for item in baseline.baseline)
        baseline_count += baseline_ok
        case_result = {"baseline": baseline.to_dict(), "models": {}}
        print(f"{name}: baseline {'verified' if baseline_ok else 'no verified fix'}", flush=True)
        for model_name in args.model:
            client = OllamaClient(model_name, timeout_seconds=180)
            result = repair(repo, evidence_path, make_runner, client, attempts=3,
                            screen_runs=args.screen_runs, verify_runs=args.verify_runs,
                            compare_baseline=False)
            ok = any(item.status == "verified" for item in result.model_attempts)
            counts[model_name] += ok
            case_result["models"][model_name] = {**result.to_dict(), "model_calls": client.calls}
            print(f"{name}: {model_name} {'verified' if ok else 'no verified fix'}", flush=True)
        detailed[name] = case_result
        args.output.write_text(json.dumps({
            "case_count": len(CASES), "baseline_verified": baseline_count,
            "model_verified": counts, "cases": detailed,
        }, indent=2) + "\n", encoding="utf-8")
    print(f"Baseline: {baseline_count}/{len(CASES)}; models: {counts}")
    print(f"Saved {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
