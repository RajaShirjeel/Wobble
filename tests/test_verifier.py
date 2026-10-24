import unittest
import difflib
import tempfile
from pathlib import Path

from wobble.runner import PytestRunner
from wobble.verify import verify_patch


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT / "examples" / "order_dependent"


class VerifierTests(unittest.TestCase):
    def test_valid_patch_passes_and_original_repo_stays_unchanged(self):
        original = (REPO / "test_order.py").read_text(encoding="utf-8")
        result = verify_patch(
            REPO, ROOT / "examples" / "patches" / "clear_cache.diff",
            "test_order.py::test_b_victim", ["test_order.py::test_a_polluter"],
            PytestRunner, runs=5, seed=0,
        )
        self.assertEqual(result.status, "verified")
        self.assertEqual(result.completed_runs, 5)
        self.assertEqual((REPO / "test_order.py").read_text(encoding="utf-8"), original)

    def test_patch_that_removes_assertion_is_rejected(self):
        result = verify_patch(
            REPO, ROOT / "examples" / "patches" / "weaken_test.diff",
            "test_order.py::test_b_victim", ["test_order.py::test_a_polluter"],
            PytestRunner, runs=2,
        )
        self.assertEqual(result.status, "rejected")
        self.assertIn("changed or shadowed the victim", result.reason)

    def test_patch_that_keeps_assert_count_but_weakens_it_is_rejected(self):
        original = (REPO / "test_order.py").read_text(encoding="utf-8")
        changed = original.replace('assert "user" not in cache', "assert True")
        diff = "".join(difflib.unified_diff(
            original.splitlines(keepends=True), changed.splitlines(keepends=True),
            fromfile="a/test_order.py", tofile="b/test_order.py",
        ))
        with tempfile.TemporaryDirectory() as directory:
            patch = Path(directory) / "weaken.diff"
            patch.write_text(diff, encoding="utf-8")
            result = verify_patch(
                REPO, patch, "test_order.py::test_b_victim",
                ["test_order.py::test_a_polluter"], PytestRunner, runs=2,
            )
        self.assertEqual(result.status, "rejected")
        self.assertIn("changed or shadowed the victim", result.reason)

    def test_patch_that_changes_a_polluter_assertion_is_rejected(self):
        repo = ROOT / "examples" / "order_with_assertion"
        original = (repo / "test_state.py").read_text(encoding="utf-8")
        changed = original.replace('assert cache["ready"] is True', "assert True")
        diff = "".join(difflib.unified_diff(
            original.splitlines(keepends=True), changed.splitlines(keepends=True),
            fromfile="a/test_state.py", tofile="b/test_state.py",
        ))
        with tempfile.TemporaryDirectory() as directory:
            patch = Path(directory) / "weaken.diff"
            patch.write_text(diff, encoding="utf-8")
            result = verify_patch(
                repo, patch, "test_state.py::test_b_victim",
                ["test_state.py::test_a_polluter"], PytestRunner, runs=2,
            )
        self.assertEqual(result.status, "rejected")
        self.assertIn("changed or removed assertions", result.reason)

    def test_patch_that_disables_polluter_without_removing_assertions_is_rejected(self):
        original = (REPO / "test_order.py").read_text(encoding="utf-8")
        for replacement in ("    pass", '    return\n    cache["user"] = "bob"'):
            with self.subTest(replacement=replacement), tempfile.TemporaryDirectory() as directory:
                changed = original.replace('    cache["user"] = "bob"', replacement)
                diff = "".join(difflib.unified_diff(
                    original.splitlines(keepends=True), changed.splitlines(keepends=True),
                    fromfile="a/test_order.py", tofile="b/test_order.py",
                ))
                patch = Path(directory) / "weaken-polluter.diff"
                patch.write_text(diff, encoding="utf-8")
                result = verify_patch(
                    REPO, patch, "test_order.py::test_b_victim",
                    ["test_order.py::test_a_polluter"], PytestRunner, runs=2,
                )
                self.assertEqual(result.status, "rejected")
                self.assertIn("changed original test behavior", result.reason)

    def test_patch_that_returns_before_victim_assertion_is_rejected(self):
        original = (REPO / "test_order.py").read_text(encoding="utf-8")
        changed = original.replace(
            'def test_b_victim():\n    assert "user" not in cache',
            'def test_b_victim():\n    return\n    assert "user" not in cache',
        )
        diff = "".join(difflib.unified_diff(
            original.splitlines(keepends=True), changed.splitlines(keepends=True),
            fromfile="a/test_order.py", tofile="b/test_order.py",
        ))
        with tempfile.TemporaryDirectory() as directory:
            patch = Path(directory) / "early-return.diff"
            patch.write_text(diff, encoding="utf-8")
            result = verify_patch(
                REPO, patch, "test_order.py::test_b_victim",
                ["test_order.py::test_a_polluter"], PytestRunner, runs=2,
            )
        self.assertEqual(result.status, "rejected")
        self.assertIn("changed or shadowed the victim", result.reason)


if __name__ == "__main__":
    unittest.main()
