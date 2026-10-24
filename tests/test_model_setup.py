import io
import json
import unittest
from unittest.mock import patch

from wobble.model_setup import (
    SetupError, check_inference, doctor, installed_model, pull_model,
    resolve_ollama_url, setup,
)


MODEL = {"name": "qwen3:4b-instruct", "size": 2500000000, "digest": "example-digest"}


class ModelSetupTests(unittest.TestCase):
    def test_existing_local_model_skips_download_and_checks_inference(self):
        with (
            patch("wobble.model_setup.list_models", return_value=[MODEL]),
            patch("wobble.model_setup.pull_model") as pull,
            patch("wobble.model_setup.check_inference") as inference,
        ):
            self.assertEqual(setup(MODEL["name"], None, 30, False), 0)
        pull.assert_not_called()
        inference.assert_called_once()

    def test_missing_model_needs_consent_in_noninteractive_session(self):
        with (
            patch("wobble.model_setup.list_models", return_value=[]),
            patch("wobble.model_setup.sys.stdin.isatty", return_value=False),
            patch("wobble.model_setup.pull_model") as pull,
        ):
            self.assertEqual(setup(MODEL["name"], None, 30, False), 1)
        pull.assert_not_called()

    def test_explicit_yes_pulls_then_checks_installed_model(self):
        with (
            patch("wobble.model_setup.list_models", side_effect=[[], [MODEL]]),
            patch("wobble.model_setup.pull_model") as pull,
            patch("wobble.model_setup.check_inference") as inference,
        ):
            self.assertEqual(setup(MODEL["name"], None, 30, True), 0)
        pull.assert_called_once()
        inference.assert_called_once()

    def test_doctor_does_not_download(self):
        with (
            patch("wobble.model_setup.list_models", return_value=[MODEL]),
            patch("wobble.model_setup.pull_model") as pull,
        ):
            self.assertEqual(doctor(MODEL["name"], None, 30), 0)
        pull.assert_not_called()

    def test_cloud_placeholder_is_not_a_local_model(self):
        self.assertIsNone(installed_model([{"name": "qwen3:cloud", "size": 0}], "qwen3:cloud"))
        with self.assertRaisesRegex(SetupError, "local model"):
            setup("qwen3:cloud", None, 30, True)

    def test_invalid_server_address_is_rejected(self):
        for address in (
            "file:///tmp/ollama", "http://host/path", "http://user:secret@host",
            "http://127.0.0.1:invalid", "http://[invalid", "http://host:0",
        ):
            with self.subTest(address=address), self.assertRaises(SetupError):
                resolve_ollama_url(address)

    def test_pull_requires_a_success_event(self):
        class Response(io.BytesIO):
            def __enter__(self):
                return self

            def __exit__(self, *_):
                self.close()

        events = b"".join(json.dumps(item).encode() + b"\n" for item in (
            {"status": "pulling manifest"}, {"status": "success"},
        ))
        with patch("wobble.model_setup.urlopen", return_value=Response(events)) as request:
            pull_model("http://127.0.0.1:11434", MODEL["name"])
        self.assertEqual(json.loads(request.call_args.args[0].data)["model"], MODEL["name"])
        with patch("wobble.model_setup.urlopen", return_value=Response(b'{"status":"pulling"}\n')):
            with self.assertRaisesRegex(SetupError, "without confirming success"):
                pull_model("http://127.0.0.1:11434", MODEL["name"])

    def test_structured_inference_check_rejects_wrong_response(self):
        with patch("wobble.model_setup._request_json", return_value={"message": {"content": '{"status":"ready"}'}}):
            check_inference("http://127.0.0.1:11434", MODEL["name"])
        with patch("wobble.model_setup._request_json", return_value={"message": {"content": "not JSON"}}):
            with self.assertRaisesRegex(SetupError, "structured output"):
                check_inference("http://127.0.0.1:11434", MODEL["name"])


if __name__ == "__main__":
    unittest.main()
