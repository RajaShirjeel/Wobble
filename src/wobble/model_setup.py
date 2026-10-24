"""Explicit setup and health checks for a local Ollama model."""

import json
import os
import sys
from collections.abc import Callable
from importlib import metadata
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


DEFAULT_MODEL = "qwen3:4b-instruct"
DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434"
OLLAMA_INSTALL_URL = "https://ollama.com/download"


class SetupError(RuntimeError):
    """Ollama setup could not complete."""


def resolve_ollama_url(value: str | None = None) -> str:
    """Return the explicit endpoint, or the configured local default."""
    url = value or os.environ.get("WOBBLE_OLLAMA_URL", DEFAULT_OLLAMA_URL)
    try:
        parts = urlsplit(url)
        port = parts.port
    except ValueError as error:
        raise SetupError("Ollama URL must have a valid host and port") from error
    if (
        parts.scheme not in ("http", "https") or not parts.hostname
        or parts.username or parts.password or parts.path not in ("", "/")
        or parts.query or parts.fragment or port == 0
    ):
        raise SetupError("Ollama URL must be an HTTP(S) server address without a path or credentials")
    return url.rstrip("/")


def _request_json(base_url: str, path: str, payload: dict | None, timeout: float) -> dict:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    request = Request(
        base_url + path, data=data,
        headers={"Content-Type": "application/json"} if data is not None else {},
    )
    try:
        with urlopen(request, timeout=timeout) as response:
            result = json.load(response)
    except (HTTPError, URLError, TimeoutError, OSError) as error:
        raise SetupError(
            f"Cannot reach Ollama at {base_url}: {error}. Install and start Ollama: {OLLAMA_INSTALL_URL}"
        ) from error
    except (ValueError, UnicodeError) as error:
        raise SetupError("Ollama returned invalid JSON") from error
    if not isinstance(result, dict):
        raise SetupError("Ollama returned an invalid response")
    return result


def list_models(base_url: str, timeout: float = 10) -> list[dict]:
    result = _request_json(base_url, "/api/tags", None, timeout)
    models = result.get("models")
    if not isinstance(models, list) or any(not isinstance(item, dict) for item in models):
        raise SetupError("Ollama returned an invalid model list")
    return models


def installed_model(models: list[dict], name: str) -> dict | None:
    """Cloud placeholders do not count as locally installed model weights."""
    if name.endswith(":cloud"):
        return None
    return next(
        (
            item for item in models
            if name in (item.get("name"), item.get("model"))
            and isinstance(item.get("size"), int) and item["size"] > 0
        ),
        None,
    )


def pull_model(
    base_url: str, name: str, timeout: float = 120,
    progress: Callable[[str], None] | None = None,
) -> None:
    """Download only after the caller has obtained explicit consent."""
    request = Request(
        base_url + "/api/pull",
        data=json.dumps({"model": name, "stream": True}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    complete = False
    last_message = ""
    try:
        with urlopen(request, timeout=timeout) as response:
            for line in response:
                if not line.strip():
                    continue
                event = json.loads(line)
                if not isinstance(event, dict):
                    raise SetupError("Ollama returned an invalid pull event")
                if event.get("error"):
                    raise SetupError(f"Ollama could not download {name}: {event['error']}")
                status = str(event.get("status", ""))
                if status == "success":
                    complete = True
                completed, total = event.get("completed"), event.get("total")
                if isinstance(completed, int) and isinstance(total, int) and total > 0:
                    percent = min(100, completed * 100 // total)
                    message = f"{status}: {(percent // 10) * 10}%"
                else:
                    message = status
                if progress and message and message != last_message:
                    progress(message)
                    last_message = message
    except (HTTPError, URLError, TimeoutError, OSError) as error:
        raise SetupError(f"Ollama model download failed: {error}") from error
    except (ValueError, UnicodeError) as error:
        raise SetupError("Ollama returned invalid model download data") from error
    if not complete:
        raise SetupError("Ollama ended the download without confirming success")


def check_inference(base_url: str, name: str, timeout: float = 180) -> None:
    """Confirm that the installed model answers a small structured request."""
    result = _request_json(base_url, "/api/chat", {
        "model": name,
        "messages": [{"role": "user", "content": "Return JSON with status set to ready."}],
        "format": {
            "type": "object",
            "properties": {"status": {"type": "string", "enum": ["ready"]}},
            "required": ["status"],
            "additionalProperties": False,
        },
        "stream": False,
        "options": {"temperature": 0, "num_predict": 32},
    }, timeout)
    try:
        answer = json.loads(result["message"]["content"])
    except (KeyError, TypeError, ValueError) as error:
        raise SetupError("The model did not return valid structured output") from error
    if not isinstance(answer, dict) or answer.get("status") != "ready":
        raise SetupError("The model did not pass the structured-output check")


def doctor(model: str, url: str | None, timeout: float, check_response: bool = False) -> int:
    base_url = resolve_ollama_url(url)
    print(f"Python: {sys.version_info.major}.{sys.version_info.minor} ({sys.executable})")
    try:
        pytest_version = metadata.version("pytest")
    except metadata.PackageNotFoundError:
        print("pytest: missing from this Python environment")
        return 1
    print(f"pytest: {pytest_version}")
    print(f"Ollama server: {base_url}")
    models = list_models(base_url, timeout)
    found = installed_model(models, model)
    if found is None:
        print(f"Model {model}: missing locally. Run: wobble setup --model {model}")
        return 1
    print(f"Model {model}: installed ({found.get('size', 0):,} bytes; digest {found.get('digest', 'unknown')})")
    if check_response:
        check_inference(base_url, model, timeout)
        print("Structured inference: passed")
    return 0


def setup(model: str, url: str | None, timeout: float, yes: bool) -> int:
    if model.endswith(":cloud"):
        raise SetupError("Choose a local model; cloud models do not meet Wobble's local-model setup")
    base_url = resolve_ollama_url(url)
    found = installed_model(list_models(base_url, timeout), model)
    if found is None:
        print(f"Model {model} is not installed. Ollama will download it to its model storage.")
        if not yes:
            if not sys.stdin.isatty():
                print("No download started. Run 'wobble setup --yes' to approve it in a noninteractive session.")
                return 1
            try:
                answer = input("Download this model now? [y/N] ").strip().lower()
            except EOFError:
                answer = ""
            if answer not in ("y", "yes"):
                print("No download started.")
                return 1
        pull_model(base_url, model, timeout, lambda status: print(f"Ollama: {status}"))
        found = installed_model(list_models(base_url, timeout), model)
        if found is None:
            raise SetupError("Ollama did not list the model after downloading it")
    else:
        print(f"Model {model} is already installed; no download is needed.")
    check_inference(base_url, model, timeout)
    print(f"Model {model} is ready for Wobble.")
    return 0
