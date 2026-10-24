import json
import tempfile
import unittest
from pathlib import Path

from wobble.ollama_client import InsertionProposal, PatchProposal, parse_insertion
from wobble.repair import deterministic_baseline, patch_from_insertion, patch_from_proposal, repair
from wobble.runner import PytestRunner


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT / "examples" / "order_dependent"
VICTIM = "test_order.py::test_b_victim"
PREFIX = ["test_order.py::test_a_polluter"]


class FakeModel:
    model = "fake-model"

    def __init__(self):
        self.evidence = []

    def propose_insertion(self, evidence):
        self.evidence.append(evidence)
        if len(self.evidence) == 1:
            return InsertionProposal("test_order.py", 99, "    cache.clear()", "Bad line")
        source = (REPO / "test_order.py").read_text(encoding="utf-8")
        line = source.splitlines().index('    cache["user"] = "bob"') + 1
        return InsertionProposal("test_order.py", line, "    cache.clear()", "Clear leaked state")


class RepairTests(unittest.TestCase):
    def test_rejects_outside_file_and_nonunique_source(self):
        source = (REPO / "test_order.py").read_text(encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "exactly once"):
            patch_from_proposal(REPO, PatchProposal("test_order.py", "\n", "\n\n", "test"), {"test_order.py": source})
        with self.assertRaisesRegex(Exception, "allowed file"):
            parse_insertion({
                "file": "../other.py", "after_line": 1, "code": "pass", "rationale": "test",
            }, ["test_order.py"])
        patch = patch_from_insertion(
            REPO, InsertionProposal("test_order.py", 7, "    cache.clear()", "test"),
            {"test_order.py": source},
        )
        self.assertIn("+    cache.clear()", patch)
        repeated = patch_from_insertion(
            REPO,
            InsertionProposal("test_order.py", 7, '    cache["user"] = "bob"\n    cache.clear()', "test"),
            {"test_order.py": source},
        )
        self.assertEqual(repeated, patch)
        with self.assertRaisesRegex(ValueError, "another test function"):
            patch_from_insertion(
                REPO, InsertionProposal("test_order.py", 7, "    test_c_cleanup()", "test"),
                {"test_order.py": source},
            )

    def test_repeated_context_can_leave_one_conditional_cleanup(self):
        repo = ROOT / "examples" / "order_with_environment"
        source = (repo / "test_environment.py").read_text(encoding="utf-8")
        patch = patch_from_insertion(
            repo,
            InsertionProposal(
                "test_environment.py", 8,
                '    os.environ["WOBBLE_DEMO_READY"] = "1"\n'
                '    assert os.environ["WOBBLE_DEMO_READY"] == "1"\n'
                '    if "WOBBLE_DEMO_READY" in os.environ:\n'
                '        os.environ.pop("WOBBLE_DEMO_READY", None)',
                "Remove state left by the polluter",
            ),
            {"test_environment.py": source},
        )
        self.assertIn('+    if "WOBBLE_DEMO_READY" in os.environ:', patch)
        self.assertIn('+        os.environ.pop("WOBBLE_DEMO_READY", None)', patch)

    def test_conditional_delete_and_duplicate_branches_are_accepted(self):
        repo = ROOT / "examples" / "order_with_assertion"
        source = (repo / "test_state.py").read_text(encoding="utf-8")
        patch = patch_from_insertion(
            repo, InsertionProposal(
                "test_state.py", 8,
                "    if 'ready' in cache:\n        del cache['ready']", "Remove the key",
            ), {"test_state.py": source},
        )
        self.assertIn("+        del cache['ready']", patch)
        direct = patch_from_insertion(
            repo, InsertionProposal(
                "test_state.py", 8,
                "    if 'ready' in cache:\n        cache.clear()\n"
                "    else:\n        cache.clear()", "Clear state",
            ), {"test_state.py": source},
        )
        self.assertIn("+    cache.clear()", direct)
        self.assertNotIn("+    if", direct)

    def test_failed_patch_feedback_then_verified_model_and_baseline(self):
        original = (REPO / "test_order.py").read_text(encoding="utf-8")
        with tempfile.TemporaryDirectory() as directory:
            evidence = Path(directory) / "evidence.json"
            evidence.write_text(json.dumps({
                "seed": 0,
                "runs": [{"conditions": {"cpu_limit": None}}],
                "investigation": {"victim": VICTIM, "minimized_prefix": PREFIX},
            }), encoding="utf-8")
            model = FakeModel()
            report = repair(REPO, evidence, PytestRunner, model, attempts=2, screen_runs=2, verify_runs=3)
        self.assertEqual(report.baseline[0].status, "verified")
        self.assertEqual([item.status for item in report.model_attempts], ["rejected", "verified"])
        self.assertEqual(report.model_attempts[1].final.completed_runs, 3)
        self.assertEqual(model.evidence[1]["previous_attempts"][0]["status"], "rejected")
        self.assertEqual(model.evidence[0]["allowed_insertions"], {"test_order.py": [7]})
        self.assertIn(
            {"file": "test_order.py", "line": 15, "code": "    cache.clear()"},
            model.evidence[0]["cleanup_examples"],
        )
        self.assertEqual((REPO / "test_order.py").read_text(encoding="utf-8"), original)


if __name__ == "__main__":
    unittest.main()
