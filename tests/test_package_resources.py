import tempfile
import unittest
from pathlib import Path

from wobble.cli import main


class PackageResourceTests(unittest.TestCase):
    def test_dockerfile_export_matches_project_recipe(self):
        expected = (Path(__file__).resolve().parents[1] / "Dockerfile.runner").read_text()
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "runner.Dockerfile"
            self.assertEqual(main(["dockerfile", "--output", str(output)]), 0)
            self.assertEqual(output.read_text(), expected)
            self.assertEqual(main(["dockerfile", "--output", str(output)]), 2)
            self.assertEqual(main(["dockerfile", "--output", str(output), "--force"]), 0)


if __name__ == "__main__":
    unittest.main()
