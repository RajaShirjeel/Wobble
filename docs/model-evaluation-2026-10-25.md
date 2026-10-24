# Local model evaluation — 2026-10-25

This report measures Wobble on small pytest demos. It does not measure performance on real projects.

## Setup

- Branch: `package-distribution`.
- Model: local `qwen3:4b-instruct`, Ollama digest `0edcdef34593`.
- Runner: existing `wobble-pytest:py311` Docker image.
- Hunt: 20 shuffled orders with seed 0, followed by order minimization.
- Repair: at most 3 model proposals, 3 screening reruns, and 100 final reruns.
- Success rule: count a fix only when the verifier accepts the patch after all 100 final reruns.

## Repair results

| Test case | Failure found and minimized | Deterministic baseline | Qwen3 repair | Model patch |
| --- | --- | --- | --- | --- |
| Shared dictionary | Yes | Verified | Verified, 100/100; repeated twice | Clear the dictionary after the polluter writes to it. |
| Polluter with an assertion | Yes | No candidate | Verified, 100/100; repeated twice | Remove the key after the polluter's assertion. |
| Shared list | Yes | No candidate | Verified, 100/100; repeated twice | Clear the list after the polluter adds an item. |
| Environment variable | Yes | No candidate | Verified, 100/100 | Delete the variable after the polluter's assertion. |
| Shared set in a new temporary test folder | Yes | No candidate | No verified fix | Three model proposals repeated or guarded the polluter's work. The patch validator rejected all three. |

Qwen3 fixed **4 of 5 distinct cases** in this run. The deterministic baseline fixed **1 of 5**. The first three cases passed a second full benchmark, so Qwen3 made **6 of 6 verified repairs** across those repeated case runs. Repeated runs of the same small cases do not add new test coverage.

The fifth case was created outside the repository for this evaluation. Its essential test code was:

```python
flags = set()

def test_a_writes_flag():
    flags.add("ready")
    assert "ready" in flags

def test_b_requires_empty_flags():
    assert not flags

def test_c_clears_flags():
    flags.clear()
```

## Repair follow-up

The model initially failed the shared-set case. Wobble now includes simple cleanup statements from the relevant tests in the model evidence. The repair prompt tells the model to undo the polluter's state change. On a new run of the same case, Qwen3 added `flags.clear()` after the polluter's assertion. The patch passed 100 final reruns on the first attempt. This is one successful rerun of the case, not a measured success rate.

After this change, the three standard benchmark cases ran again with the same hunt and repair settings. Qwen3 verified **3 of 3** repairs; the deterministic baseline verified **1 of 3**. Each model fix passed 100 final reruns. These results add a before-and-after check, but the cases remain small demos.

The model-driven hunt also ran on the dictionary case twice. It tested the victim alone, replayed the polluter before the victim, and selected `shared_state`. The recorded experiments supported that diagnosis.

## Model flag and edge checks

- `doctor --model qwen3:4b-instruct --check-inference` found the installed model and passed a structured response check.
- `doctor` reported a missing model. `setup` did not download that model without consent.
- `setup`, `repair`, and `hunt --agent` rejected a `:cloud` model tag. The benchmark now rejects cloud, missing, and duplicate model names before it starts.
- A missing repair evidence file now produces a CLI error without a traceback.
- A suite with one passing test, one failing test, and one skipped test produced the expected classifications. Wobble did not try to minimize it because no test changed outcome.
- Empty and missing repositories, a one-run hunt, and a local clock-shift request produced controlled errors.
- The complete test suite passed: **33 tests and 12 subtests**, including the Docker integration test.

## Limits

These cases are short, controlled examples. They mostly test order-dependent shared state. This result does not establish an 80% fix rate on real repositories, time failures, asynchronous races, or resource leaks. A prior live Qwen3 repair attempt on the dictionary case also failed to produce a valid patch, so model output can vary even with temperature set to zero. Wobble must continue to report rejected proposals and require execution-based verification.

No model or Docker image was downloaded for this evaluation. No proposed patch was applied to an example repository.
