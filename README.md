# journal

A personal journal tool for documenting progress. Built with Flask, HTMX, and Alpine.js.

## Documentation

All project documentation, including planning, implementation details, and status updates, can be found in the [docs/](./docs/) directory.

Start with the [Comprehensive Guide](./docs/initial-planning/comprehensive-guide-personal.md) for a full overview of the planned system.
# Test trigger Wed Apr  9 02:31:04 PM AKDT 2025

test

## Tooling

- Biome 2.2.2: formatting, linting, import organization
  - Format: `npm run format` or `bun run format`
  - Lint: `npm run lint` or `bun run lint`
  - CI Check: `npm run check`
- TypeScript (latest): type-only checks for TS scripts
  - `npm run typecheck`
- Bun 1.2.21: runs TS utilities and docs fetchers
  - Fetch docs: `npm run docs:fetch` or `bun run docs:fetch`
  - Enhanced fetch: `npm run docs:fetch:enhanced`
  - Update docs (backup + fetch): `npm run docs:update`

## CI/CD

- GitHub Actions workflow in `.github/workflows/ci.yml` runs on pushes and PRs to `main`:
  - Bun/Biome: `bun run check`, `bun run typecheck`
  - Python: `uv sync --frozen`, Ruff lint/format check, mypy, pytest with coverage
  - Caching: uv cache keyed by `pyproject.toml` + `uv.lock`
  - Artifacts: uploads `coverage.xml`
  - UI workflows: installs Playwright browsers, runs `test:a11y` and `test:visual`, builds Storybook and uploads `storybook-static`


See `bunfig.toml`, `.biome.json`, and `tsconfig.json` for configuration details.

## Python Tooling

This repo uses uv for Python package management and Ruff for linting/formatting.

- Install uv: see https://docs.astral.sh/uv/
- Sync env: `uv sync` (creates `.venv` and installs deps from `pyproject.toml`)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format .`
- Autofix: `uv run ruff check . --fix --unsafe-fixes && uv run ruff format .`
- Type-check: `uv run mypy .`
- Tests: `uv run pytest -q`

You can also run via Bun/NPM tasks:

- Bun: `bun run py:sync`, `bun run py:lint`, `bun run py:format`, `bun run py:typecheck`, `bun run py:test`
- Quick fix: `bun run py:fix`
- NPM: `npm run py:sync`, `npm run py:lint`, `npm run py:format`, `npm run py:typecheck`, `npm run py:test`
  - Quick fix: `npm run py:fix`

Pre-commit is configured for Ruff and uv export. Enable it with:

```
uv run pre-commit install
```

Python version is pinned locally in `.python-version` (3.13.7). If missing, run:

```
uv python install 3.13.7 && uv python pin 3.13.7
```

## Development

- Frontend watch (Rollup): `make dev` or `make dev-web`
- Backend dev server (Flask): `make dev-py` or `bun run py:dev`
- One-shot checks: `bun run check:all`

UI/UX workflows:
- Storybook: `make storybook`, build static: `make storybook-build`
- Playwright: `make e2e`, `make a11y`, `make visual`

Generated assets under `journal/static/gen/` are ignored in Git. Use Rollup build to regenerate: `npm run build`.

## Error Handling & Logging

- Structured logging via `structlog` with per-request correlation IDs.
  - Dev: human-friendly console output; Prod/Test: JSON lines.
  - Correlation header: `X-Correlation-ID` is accepted from clients and echoed on responses.
- Unified error handlers:
  - For `/api/**` routes, errors return JSON: `{ error: {code,message}, correlation_id }`.
  - For non-API routes, plain text messages are returned with appropriate status.
- Where configured:
  - Initialization and handlers live in `journal/observability.py`.
  - The app factory wires it via `setup_logging()`, `register_request_context()`, and `register_error_handlers()`.
- Tuning:
  - Set `FLASK_ENV=development` for pretty console rendering; otherwise logs are JSON.
  - Extend processors or sampling strategies in `journal/observability.py` as needed.

Ruff config captures conventions and exceptions we’ve decided on:
- Keep blueprint imports inside factory modules (ignore `PLC0415` in `journal/__init__.py`).
- Import blueprint routes at module end (ignore `E402` in `journal/*/__init__.py`).
- Preserve documented commented examples in `config.py` (ignore `ERA001`).
- Allow `print` in utility scripts under `scripts/`.
