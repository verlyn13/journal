# CLAUDE.md – Assistant Usage Policy (Journal)

This repository uses:

- uv for Python (NEVER pip install in CI or dev)
- bun for frontend tooling (NEVER npm/yarn)
- ruff for linting; mypy strict by default (selected ignores for integration layers)
- Infisical for secrets; Universal Auth (UA) and GitHub OIDC
- gopass locally for UA credential storage

Rules:

1) Use `uv run` for all Python commands; `uv sync --all-extras --dev` to install.
2) Do not commit secrets. UA credentials live in gopass; CI uses OIDC; no static tokens.
3) Prefer short PRs; keep changes isolated to scope.
4) For Infisical:
   - Runtime: call UA at boot (lifespan already wired) – do not embed static tokens.
   - CI: prefer OIDC; fallback is temporary.
5) Respect canonical secret paths: `/auth/jwt/*`, `/auth/aes/*`, `/auth/oauth/*`.

Quick Commands:

```
uv sync --all-extras --dev
uv run pytest -m "unit or component"
uv run fastapi run app/main.py --host 0.0.0.0 --port 5000
```

