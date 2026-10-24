import unittest
from pathlib import Path

from wobble.agent import run_agent
from wobble.hunt import hunt
from wobble.ollama_client import Decision, ModelError, OllamaClient, parse_decision
from wobble.runner import RunResult


class FakeRunner:
    repo = Path("/example")

    def collect(self, selector):
        return ["polluter", "victim", "noise"]

    def run(self, order):
        fails = "polluter" in order and order.index("polluter") < order.index("victim")
        outcomes = {
            nodeid: {"status": "failed" if nodeid == "victim" and fails else "passed"}
            for nodeid in order
        }
        return RunResult(order, outcomes, int(fails), 0.01)


class ScriptedModel:
    def __init__(self, decisions):
        self.decisions = iter(decisions)

    def decide(self, evidence):
        return next(self.decisions)


class AgentTests(unittest.TestCase):
    def test_model_drives_experiment_and_minimization(self):
        runner = FakeRunner()
        report = hunt(runner, ".", 12, 0)
        model = ScriptedModel([
            Decision("run_isolated", "", "unknown"),
            Decision("minimize_order", "", "shared_state"),
            Decision("finish", "", "shared_state"),
        ])
        result = run_agent(runner, report, "victim", model)
        self.assertEqual(result.status, "hypothesis")
        self.assertEqual(result.diagnosis, "shared_state")
        self.assertEqual(result.steps[0].observation["victim_status"], "passed")
        self.assertEqual(result.steps[1].observation["minimized_prefix"], ["polluter"])

    def test_invalid_model_schema_is_rejected(self):
        with self.assertRaises(ModelError):
            parse_decision({
                "action": "shell", "test_id": "", "diagnosis": "unknown",
            })

    def test_cloud_and_empty_model_tags_are_rejected_before_inference(self):
        for name in ("minimax-m3:cloud", ""):
            with self.subTest(name=name), self.assertRaisesRegex(ModelError, "local model"):
                OllamaClient(name)

    def test_model_cannot_select_unobserved_test(self):
        runner = FakeRunner()
        report = hunt(runner, ".", 12, 0)
        model = ScriptedModel([
            Decision("run_before_victim", "not_collected", "unknown"),
        ])
        with self.assertRaises(ValueError):
            run_agent(runner, report, "victim", model)

    def test_unsupported_cause_is_not_reported_as_diagnosis(self):
        runner = FakeRunner()
        report = hunt(runner, ".", 12, 0)
        model = ScriptedModel([
            Decision("run_isolated", "", "unknown"),
            Decision("run_before_victim", "polluter", "time"),
            Decision("finish", "", "time"),
        ])
        result = run_agent(runner, report, "victim", model)
        self.assertEqual(result.status, "insufficient_evidence")
        self.assertEqual(result.diagnosis, "unknown")
        self.assertEqual(result.model_diagnosis, "time")


if __name__ == "__main__":
    unittest.main()
