import io
import tempfile
import unittest
from contextlib import redirect_stderr
from pathlib import Path
from unittest.mock import patch

from wobble.cli import main


class CliErrorTests(unittest.TestCase):
    def test_missing_repair_evidence_returns_a_cli_error(self):
        repo = Path(__file__).resolve().parents[1] / "examples" / "order_dependent"
        with tempfile.TemporaryDirectory() as directory:
            missing = Path(directory) / "missing.json"
            stderr = io.StringIO()
            with redirect_stderr(stderr):
                status = main(["repair", str(repo), "--evidence", str(missing), "--baseline-only"])
        self.assertEqual(status, 2)
        self.assertIn("missing.json", stderr.getvalue())
        self.assertNotIn("Traceback", stderr.getvalue())

    def test_cloud_model_is_rejected_before_hunt_runs(self):
        repo = Path(__file__).resolve().parents[1] / "examples" / "order_dependent"
        stderr = io.StringIO()
        with patch("wobble.cli.hunt") as hunt, redirect_stderr(stderr):
            status = main(["hunt", str(repo), "--agent", "--model", "minimax-m3:cloud"])
        self.assertEqual(status, 2)
        self.assertIn("local model", stderr.getvalue())
        hunt.assert_not_called()


if __name__ == "__main__":
    unittest.main()
