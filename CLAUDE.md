# Project Development Configuration

This repository is configured for a dual-language stack (Python + TypeScript) using uv, Ruff, Bun, and Biome. These conventions ensure fast, reproducible workflows and prevent tool drift.

## CRITICAL: Python Package Management with uv
NEVER use pip, pip-tools, poetry, or conda directly in this project.

Required commands:
- Install deps: `uv add <package>`
- Remove deps: `uv remove <package>`
- Sync deps: `uv sync --frozen`
- Run tools: `uv run ruff …`, `uv run pytest …`, `uv run mypy …`

Shortcuts (Bun/NPM):
- Lint all: `bun run lint:all`
- Format all: `bun run format:all`
- Check all (CI parity): `bun run check:all`
- Python autofix: `bun run py:fix` (ruff fix + format)

## Linting and Formatting
- Python: `uv run ruff check --fix .` and `uv run ruff format .`
- TypeScript/JS/CSS/JSON: `bun run check` (Biome GitHub reporter), `bun run format`
- Pre-commit: `uv run pre-commit run --all-files`

## Build and Runtime
- TypeScript: Bun 1.2.21 exclusively (no npm/yarn for scripts)
- Python: uv 0.8.14 with Python 3.13.7 (pinned in `.python-version`)
- Observability: structured logs (structlog), optional OTLP via env (`OTEL_ENABLED=true`)

## Testing
- Python unit/integration tests: `uv run pytest --cov` (live logs enabled via pytest.ini)
- Frontend tests (if added): `bun test`

## Agent Usage
- Claude Code: prefer running with `--profile agent` and use this CLAUDE.md as authoritative rules
- Codex CLI: prefer project-level config in `.codex/config.toml`; avoid destructive commands; follow uv-only policy

## Do Not
- Do not run `pip install`, `pip3`, `poetry`, or `conda`
- Do not run `npm install` for project scripts (use `bun install`)
