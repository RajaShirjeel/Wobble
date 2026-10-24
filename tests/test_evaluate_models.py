import subprocess
import sys
import unittest
from pathlib import Path


class EvaluateModelsCliTests(unittest.TestCase):
    def test_invalid_model_flags_fail_before_benchmark_runs(self):
        script = Path(__file__).resolve().parents[1] / "scripts" / "evaluate_models.py"
        for flags, message in (
            (["--model", "qwen3:4b-instruct", "--model", "qwen3:4b-instruct"], "only once"),
            (["--model", "minimax-m3:cloud"], "not a cloud tag"),
        ):
            with self.subTest(flags=flags):
                result = subprocess.run(
                    [sys.executable, str(script), *flags],
                    text=True, capture_output=True, timeout=5, check=False,
                )
                self.assertEqual(result.returncode, 2)
                self.assertIn(message, result.stderr)


if __name__ == "__main__":
    unittest.main()
