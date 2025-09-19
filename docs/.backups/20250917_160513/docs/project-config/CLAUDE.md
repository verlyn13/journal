---
id: claude
title: Claude
type: configuration
created: '2025-09-17T09:15:07.162894'
updated: '2025-09-17T09:15:07.162900'
author: documentation-system
tags:
- python
- javascript
- typescript
- react
- database
status: active
description: 'This repository uses:'
---

# CLAUDE.md – Assistant Usage Policy (Journal)

This repository uses:

- uv for Python (NEVER uv uv pip install in CI or dev)
- bun for frontend tooling (NEVER npm/bun)
- ruff for linting; mypy strict by default (selected ignores for integration layers)
- Infisical for secrets; Universal Auth (UA) and GitHub OIDC
- gopass locally for UA credential storage

Rules:

1) Use `uv run` for all Python commands; `uv sync --all-extras --dev` to install.
2) Do not commit secrets. UA credentials live in gopass; CI uses OIDC; no static tokens.
3) Prefer short PRs; keep changes isolated to scope.
4) For Infisical:
   - Runtime: call UA at boot (lifespan already wired) – do not embed static tokens.
   - CI: USE SHIM ALWAYS - located at `.github/scripts/infisical-shim.sh`
   - Version parsing: ALWAYS use `app/infra/secrets/version.py` - single source of truth
5) Respect canonical secret paths: `/auth/jwt/*`, `/auth/aes/*`, `/auth/oauth/*`.
6) CI/CD Critical Rules:
   - NEVER download binaries during CI (use shims or pre-installed tools)
   - ONLY use `journal` PostgreSQL user (never postgres/root)
   - ONE database URL per job: `DATABASE_URL_SYNC`
   - Alembic ALWAYS with `-x` flag: `alembic -x sqlalchemy.url=${DATABASE_URL_SYNC}`
   - Container images MUST be pinned by SHA256 (see `.github/WORKFLOW_VARS.md`)

Quick Commands:

```bash
# Development
uv sync --all-extras --dev
uv run pytest -m "unit or component"
uv run fastapi run app/main.py --host 0.0.0.0 --port 5000

# Linting (auto-fix)
uv run ruff check --fix .
uv run ruff format .

# Type checking
uv run mypy app

# Database migrations
DATABASE_URL_SYNC="postgresql+psycopg://journal:journal@localhost:5433/journal" \
  uv run alembic -x sqlalchemy.url=${DATABASE_URL_SYNC} upgrade head
```

## Architecture Documentation

- **Infisical Integration**: See `docs/INFISICAL_ARCHITECTURE.md` for complete details
- **CI/CD Patterns**: Deterministic testing with shims, no external dependencies
- **Version Management**: Centralized in `app/infra/secrets/version.py`
- **Security Framework**: Least privilege, journal-user-only, no superuser operations

