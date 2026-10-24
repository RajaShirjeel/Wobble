# Wobble

Wobble is a local tool that hunts order-dependent pytest failures. It runs a test suite in shuffled orders, reports an observed failure rate with a 95% Wilson interval, and reduces a failing order to a small set of earlier tests.

The first version is a CLI.

## Features

- **Hunt:** run a suite in shuffled, repeatable orders and report per-test pass and fail counts.
- **Minimize:** reduce a failing order to a 1-minimal set of earlier tests (the "polluters").
- **Isolate:** run each experiment in a fresh local Python process, or in a disposable Docker container with CPU, memory, and process limits and an optional wall-clock shift.
- **Investigate:** let a local model (via Ollama) choose a bounded sequence of follow-up experiments.
- **Repair:** let a local model propose a small source insertion. Wobble verifies every candidate patch in a disposable copy and never touches your repository.

See [the architecture](docs/architecture.md) for the build order.

## Contents

- [Install](#install)
- [Install Wobble as a Python package](#install-wobble-as-a-python-package)
- [Run the included demo](#run-the-included-demo)
- [Run in Docker](#run-in-docker)
- [Verify a patch](#verify-a-patch)
- [Repair limits and baseline](#repair-limits-and-baseline)
- [Reading the statistics](#reading-the-statistics)
- [Command reference](#command-reference)
- [Exit codes](#exit-codes)
- [Run checks](#run-checks)

## Install

Requires Python 3.11 or newer. Run these commands from the Wobble project directory. If `.venv` already exists and Wobble is installed, skip the first two commands.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -e .
.venv/bin/wobble --help
```

The install needs access to pytest. If the target repository has other dependencies, install them in the same environment before a local hunt. For Docker runs, put those dependencies in the runner image instead.

All commands below use paths relative to the Wobble project directory.

### Install Wobble as a Python package

Install Wobble in the **target project's Python environment**. The local runner uses that environment to run pytest, so the target's dependencies must be installed there too. The package is not yet published on PyPI. Install it from a Wobble checkout or from a wheel:

```sh
# Run this with the target project's Python interpreter.
python -m pip install "/path/to/Wobble"
python -m wobble --help
```

To install a wheel, use `python -m pip install /path/to/wobble_flaky-0.1.0-py3-none-any.whl` instead. The distribution name is `wobble-flaky`; the Python module and command remain `wobble`. `pip install` installs Wobble and its Python dependency, pytest. It does not install Ollama or download model weights. Install and start [Ollama](https://ollama.com/download) separately. Then run:

```sh
python -m wobble setup
python -m wobble hunt /path/to/target-project --runs 20 --minimize --output hunt.json
```

`wobble setup` checks for the default `qwen3:4b-instruct` model. It skips the download when the model is already installed. If the model is missing, it asks before downloading. Use `wobble setup --yes` only when you want to approve that download without a prompt. Use `wobble doctor --check-inference` to check that the model can answer a short structured request. A plain hunt and `verify` do not need Ollama.

The examples below use `.venv/bin/wobble` from this checkout. In an installed environment, run its `wobble` command instead. The `examples/` folders are part of the source checkout, not the installed wheel.

## Run the included demo

This demo uses local Python processes and the Qwen3 model already installed in Ollama. Before steps 2 and 3, check that Ollama is running and lists `qwen3:4b-instruct`:

```sh
ollama list
```

### 1. Hunt and minimize

Find a flaky test and save a minimized reproducer:

```sh
.venv/bin/wobble hunt examples/order_dependent \
  --runs 20 --seed 0 --minimize --output reports/live-demo-hunt.json
```

The command should report `test_b_victim` as observed flaky. In the recorded demo, it failed in 7 of 20 orders. Wobble reduced the failure to `test_a_polluter` followed by `test_b_victim`. The hunt file records every order, outcome, and minimization replay.

### 2. Let the model investigate

Run a separate hunt that lets Qwen3 choose follow-up experiments:

```sh
.venv/bin/wobble hunt examples/order_dependent \
  --runs 20 --seed 0 --agent --model qwen3:4b-instruct \
  --output reports/live-demo-agent.json
```

This command starts its own 20 shuffled runs. It does not continue step 1. The model can request `run_isolated`, `run_before_victim`, or `minimize_order`. Wobble executes each request and records the observation.

`--agent` and `--minimize` cannot be used in the same hunt. Step 3 uses the reliable minimized report from step 1.

### 3. Propose and verify a repair

Give the minimized hunt file to the local model:

```sh
.venv/bin/wobble repair examples/order_dependent \
  --evidence reports/live-demo-hunt.json \
  --model qwen3:4b-instruct --no-baseline \
  --screen-runs 5 --verify-runs 100 \
  --output reports/live-demo-repair.json \
  --patch-output reports/live-demo-fix.diff
```

- `--evidence` is an input file.
- `--output` is the detailed result file.
- `--patch-output` is the proposed fix.
- `--no-baseline` skips the rule-based fixer so this run shows the model's result alone.

Wobble writes the patch file only after the model patch passes final verification. It applies the patch to a temporary copy, not the target folder.

### Read the results

| File | What to inspect |
| --- | --- |
| `reports/live-demo-hunt.json` | `tests` has pass and fail counts. `runs` has each test order and outcome. `investigation.minimized_prefix` names the earlier test needed to reproduce the failure. |
| `reports/live-demo-agent.json` | `agent.steps` pairs each model action with the result Wobble observed. `agent.diagnosis` is a supported hypothesis, not a verified fix. |
| `reports/live-demo-repair.json` | `model_attempts` has the model's rationale, candidate patch, screening result, and final verification result. |
| `reports/live-demo-fix.diff` | The verified model patch. This file exists only after a successful final check. |

In the recorded demo, Qwen3 chose to run the victim alone, minimize a failing order, and run the polluter before the victim. It proposed cleanup after the polluter changed a shared dictionary. The original reproducer failed, the patched reproducer passed, and the full suite passed 100 shuffled reruns.

> **Note:** Your model output can vary. Review the diff before applying it to a real project.

### Try your own project

Replace `examples/order_dependent` with the local path of your project, and use `--select` to narrow the test set. The local runner executes target tests in place, so **use it only with code you trust**.

## Run in Docker

Build the runner image once:

```sh
docker build -f Dockerfile.runner -t wobble-pytest:py311 .
```

After installing the wheel, export the same recipe and build the image only when you choose to use Docker:

```sh
wobble dockerfile --output runner.Dockerfile
docker build -f runner.Dockerfile -t wobble-pytest:py311 .
```

Then run a hunt with container isolation:

```sh
.venv/bin/wobble hunt examples/order_dependent --runner docker \
  --runs 20 --seed 0 --minimize --output reports/docker-hunt.json
```

To test time or CPU behavior, use a fixed profile for each hunt. The JSON report records the profile for every run.

```sh
.venv/bin/wobble hunt examples/order_dependent --runner docker --runs 20 --seed 0 \
  --cpus 0.5 --memory-mb 256 --clock-shift-seconds 3600 \
  --output reports/shifted.json
```

### Isolation details

- The image must contain pytest and the target project's dependencies. For extra packages, build a derived image and pass its name with `--image`.
- The runner mounts the target repository read-only and does not pass the host environment into the container.
- Network access is disabled and each run gets a new container.
- The result directory is the only writable host mount.
- Docker runs use `--pull=never`: build or provide the named image before the hunt.
- `--timeout` limits the total container run and removes a timed-out container.

> **Warning:** Docker isolation reduces risk, but it is not a guarantee that arbitrary hostile code is safe.

### Clock shift

The clock shift uses `libfaketime`. Some programs bypass its time hooks, so confirm a time-sensitive failure with a targeted test. The offset changes wall-clock readings; monotonic time stays real.

## Verify a patch

Start with a hunt that saved a minimized reproducer, then give Wobble a unified diff:

```sh
.venv/bin/wobble hunt examples/order_dependent --runner docker --runs 20 \
  --seed 0 --minimize --output reports/docker-hunt.json
.venv/bin/wobble verify examples/order_dependent \
  --patch examples/patches/clear_cache.diff --evidence reports/docker-hunt.json \
  --runs 100 --output reports/verification.json
```

The verifier works on a copy of the repository. It:

1. Checks that the patch applies, collected tests remain, the victim test function is unchanged, and existing assertion expressions remain in the source.
2. Confirms the old reproducer fails before the patch and passes after it.
3. Runs the full patched suite in 100 shuffled orders under the conditions saved by the hunt, stopping on the first nonpassing run.

The original repository is never patched.

> **Limits:** The assertion check is a basic guard. It cannot prove that a patch preserves every test's meaning. Even 100 passing runs do not prove the failure rate is zero.

## Repair limits and baseline

By default, `repair` tries a narrow deterministic baseline before the local model. The baseline handles one module-level dictionary pattern. The demo above uses `--no-baseline` to show the model result alone.

For each candidate, Wobble checks Python syntax, applies the patch in a copy, runs a short screen, and then runs the full verification budget. The model can see feedback from a rejected attempt.

The three-case model check found three verified repairs from Qwen3 4B Instruct and none from the previous Qwen2.5 Coder 7B installation. A separate environment-variable case also passed 100 Docker reruns. **These small results do not establish general repair quality.** The [model selection check](docs/model-selection.md) runs three fixed demo cases under the same Docker verification budget.

To run only the baseline while testing a local model setup:

```sh
.venv/bin/wobble repair examples/order_dependent \
  --evidence reports/live-demo-hunt.json --baseline-only --verify-runs 100 \
  --output reports/baseline.json
```

## Reading the statistics

- The **failure rate** is the fraction of observed runs that failed.
- The **confidence interval** describes sampling uncertainty. A zero failure count does not prove a test is stable.
- The minimizer returns a *1-minimal* prefix: removing any one remaining test stops the reproduced failure. It does not promise the shortest possible prefix.

## Command reference

Run `.venv/bin/wobble --help` for the command list. Add `--help` to any command for its current syntax. You can also start the CLI with `.venv/bin/python -m wobble`. All commands accept `-h` or `--help`.

### `wobble doctor`, `wobble setup`, and `wobble dockerfile`

`doctor` checks this Python environment, the Ollama server, and whether the selected model is installed. It never downloads a model. `setup` installs a missing local model only after consent and then checks structured inference. Both use the local Ollama server by default. Set `WOBBLE_OLLAMA_URL` or pass `--ollama-url URL` for a different server. A nonlocal server receives model requests and, during investigation and repair, relevant test source.

| Command and flag | Default | What it does |
| --- | --- | --- |
| `doctor --model NAME` | `qwen3:4b-instruct` | Check this model. |
| `doctor --ollama-url URL` | `http://127.0.0.1:11434` | Check this Ollama server. |
| `doctor --timeout SECONDS` | `180` | Limit each server request. |
| `doctor --check-inference` | off | Ask the installed model for a short structured reply. |
| `setup --model NAME` | `qwen3:4b-instruct` | Check or install this local model. |
| `setup --ollama-url URL` | `http://127.0.0.1:11434` | Use this Ollama server. |
| `setup --timeout SECONDS` | `180` | Limit each server request or stalled download read. |
| `setup --yes` | off | Approve a missing model download without an interactive prompt. |
| `dockerfile --output FILE` | required | Export the Docker runner recipe from the installed package. |
| `dockerfile --force` | off | Replace an existing output file. |

### `wobble hunt`

```
hunt REPO [OPTIONS]
```

Collects tests in `REPO`, runs shuffled orders, and prints a pass and failure summary for every collected test. `REPO` is a required local directory. The CLI investigates the first observed flaky test when you add `--minimize` or `--agent`.

| Flag | Default | What it does |
| --- | --- | --- |
| `--select PATH_OR_NODE_ID` | `.` | Collect only this pytest path or exact test ID, relative to `REPO`. |
| `--runs N` | `20` | Run N shuffled orders. N must be at least 2. |
| `--seed N` | `0` | Set the shuffle seed so the sequence of test orders can be repeated. |
| `--timeout SECONDS` | `120` | Limit each pytest invocation. |
| `--runner local\|docker` | `local` | Use fresh local Python processes or fresh Docker containers. |
| `--image NAME` | `wobble-pytest:py311` | Use this existing Docker image. It must contain pytest and the target dependencies. |
| `--cpus NUMBER` | `1.0` | Set the Docker CPU limit. |
| `--memory-mb N` | `512` | Set the Docker memory limit in MiB. |
| `--pids-limit N` | `64` | Set the Docker process limit. |
| `--clock-shift-seconds N` | `0` | Shift Docker wall-clock time by N seconds. A nonzero shift requires Docker. |
| `--minimize` | off | Replay a failed order and reduce the earlier tests to a 1-minimal reproducer. |
| `--agent` | off | Let the local model choose and run bounded follow-up experiments. Do not combine with `--minimize`. |
| `--agent-steps N` | `5` | Limit the model's experiment and finish decisions. Used with `--agent`. |
| `--model NAME` | `qwen3:4b-instruct` | Select an installed Ollama model for `--agent`. |
| `--ollama-url URL` | local server | Use this Ollama server for `--agent`. |
| `--model-timeout SECONDS` | `90` | Limit each model request during `--agent`. |
| `--replay-budget N` | `80` | Limit pytest replays during `--minimize`. |
| `--output FILE` | none | Save the full hunt evidence as JSON. |

Docker-only flags have no effect with `--runner local`, except a nonzero clock shift, which the CLI rejects.

### `wobble verify`

```
verify REPO --patch FILE --evidence FILE [OPTIONS]
```

Checks a unified diff in a disposable copy of `REPO`. The evidence file must come from a hunt with a successfully minimized reproducer. Verification uses the runner conditions saved in that file.

| Flag | Default | What it does |
| --- | --- | --- |
| `--patch FILE` | required | Read this unified diff and apply it to a temporary copy. |
| `--evidence FILE` | required | Read the victim, minimized earlier tests, seed, and run conditions from a hunt JSON file. |
| `--runs N` | `100` | Require N passing shuffled full-suite runs after the reproducer passes. |
| `--timeout SECONDS` | `120` | Limit each pytest invocation. |
| `--image NAME` | `wobble-pytest:py311` | Use this image when the evidence came from a Docker hunt. |
| `--output FILE` | none | Save the full verification result as JSON. |

### `wobble repair`

```
repair REPO --evidence FILE [OPTIONS]
```

Tries the narrow deterministic baseline and asks a local Ollama model for a cleanup insertion. Each candidate is screened, and passing candidates are verified with the final run budget. It uses the runner conditions saved in the hunt evidence.

| Flag | Default | What it does |
| --- | --- | --- |
| `--evidence FILE` | required | Read a hunt JSON file with a successfully minimized reproducer. |
| `--model NAME` | `qwen3:4b-instruct` | Select an installed local Ollama model. |
| `--ollama-url URL` | local server | Use this Ollama server. |
| `--model-timeout SECONDS` | `180` | Limit each model request. |
| `--attempts N` | `2` | Limit model repair proposals. |
| `--screen-runs N` | `5` | Run this many shuffled full-suite checks before final verification. |
| `--verify-runs N` | `100` | Require this many shuffled full-suite runs for final verification. Set it to at least `--screen-runs`. |
| `--no-baseline` | off | Skip the deterministic baseline comparison. |
| `--baseline-only` | off | Run only the deterministic baseline, without Ollama. Do not combine with `--no-baseline`. |
| `--timeout SECONDS` | `120` | Limit each pytest invocation. |
| `--image NAME` | `wobble-pytest:py311` | Use this image when the evidence came from a Docker hunt. |
| `--output FILE` | none | Save candidate patches, feedback, and verification results as JSON. |
| `--patch-output FILE` | none | Save the model's diff only after that model patch passes final verification. |

### Model comparison script

`scripts/evaluate_models.py` runs three prepared cases in Docker and compares each named model with the deterministic baseline. It uses installed models and an existing runner image.

```sh
.venv/bin/python scripts/evaluate_models.py \
  --model qwen3:4b-instruct --output reports/model-benchmark.json
```

| Flag | Default | What it does |
| --- | --- | --- |
| `--model NAME` | required; repeatable | Evaluate one or more installed Ollama models. |
| `--hunt-runs N` | `20` | Use N shuffled hunt runs per case. |
| `--screen-runs N` | `5` | Use N screening runs per candidate. |
| `--verify-runs N` | `100` | Use N final verification runs per candidate. |
| `--output FILE` | `reports/model-benchmark.json` | Save the detailed comparison report. |

Paths passed to `--output` are created as needed. The `reports/` directory is ignored by Git.

## Exit codes

| Command | Status | Meaning |
| --- | --- | --- |
| `hunt` | `0` | Success, even when no flaky test is found. |
| `verify` | `0` | Verified patch only. |
| `repair` | `0` | Verified model patch, or verified baseline when `--baseline-only` is set. |
| `repair` | `1` | Any other unverified outcome. |
| any | `2` | CLI or runner error. |

## Run checks

```sh
.venv/bin/python -m pytest -q tests
```
