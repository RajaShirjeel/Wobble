# Package release checks — 2026-10-25

These checks used branch `package-distribution` and Python 3.11. They did not upload a package, download a model, or build a new Docker image.

## Distribution name

The name `wobble` belongs to a different project on PyPI. Wobble now uses `wobble-flaky` as its distribution name. The import name and CLI command remain `wobble`. The PyPI JSON endpoint returned 404 for `wobble-flaky` on 2026-10-25. This check does not reserve the name. PyPI makes the final decision when the owner uploads the first release.

## Build and install

- Built `wobble_flaky-0.1.0.tar.gz` and `wobble_flaky-0.1.0-py3-none-any.whl` with `python -m build` in isolated build environments.
- Ran `python -m twine check` on both files. Both passed.
- Installed the wheel in a fresh Python environment. The install brought in the declared `pytest` dependency. `pip check` found no broken requirements.
- Installed the source archive in a second fresh environment. Its build, install, `pip check`, and `wobble --help` passed.
- Confirmed that the wheel provides the `wobble` Python module and `wobble` command.

## Installed-package checks

- Ran a local hunt from the wheel install against a copy of the order-dependent demo outside the repository. The victim failed in 7 of 20 shuffled runs. Wobble reduced the reproducer to one earlier polluter test.
- Exported the packaged Docker runner recipe. Its checksum matched the source recipe.
- Ran `wobble doctor --model qwen3:4b-instruct --check-inference` from the wheel install. It found the existing local model and passed structured inference.
- Ran `wobble repair` from the wheel install against the copied demo. Qwen3's first patch passed 20 final reruns, and Wobble saved the verified diff.
- Ran the full repository suite. It passed: 33 tests and 12 subtests, including the Docker integration test.

## Repair check

With the revised repair evidence and prompt, the local Qwen3 model verified fixes in all three standard demo cases. Each fix passed 100 final reruns. The deterministic baseline verified one of these three cases. The shared-set case that failed before the change passed 100 reruns after the model added a cleanup call. See [the model evaluation](model-evaluation-2026-10-25.md) for the case details and limits.

## Release boundary

The package has not been uploaded to PyPI. The first upload must confirm that PyPI accepts `wobble-flaky` for this account. The test cases are small demos. They do not establish a repair rate on real repositories.
