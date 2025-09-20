# User Management — Status (2025-09-10)

This snapshot reflects the current reality in-code and branches for the user management upgrade.

## Branches / PRs

- PR #19 → `feat/auth-M4.T1-cookie-refresh`
  - Cookie-based refresh (flagged), CSRF helpers, refresh rotation, server-side sessions
  - Import paths standardized (`from app.infra.cookies ...`), endpoint signatures sane (no optional Request/Response)
  - Web autosave test seam added (`autosaveMs`, `__TEST__`) — deterministic unit

- PR #20 → `feat/auth-metrics`
  - Metrics-only deltas layered on top of #19 (`login_success/login_fail/refresh_rotated/session_revoked`)
  - `apps/api/app/api/v1/auth.py` has no conflict markers and matches #19 behavior + counters

## Code Health

- API
  - Models present: `User`, `UserSession` (SQLAlchemy 2.0 typed) and rotation flow is implemented
  - Cookie helpers in `app.infra.cookies` and session helpers in `app.infra.sessions`
  - Settings: `user_mgmt_enabled`, `auth_cookie_refresh`, CSRF/refresh cookie names and attributes
  - Mypy scoped to `app/` via `apps/api/mypy.ini`; tests excluded short‑term
  - Pre-commit hooks enabled at repo root (merge-conflict detection, ruff, format, biome)

- Web
  - Autosave tests stable; component exposes `autosaveMs` and uses test‑friendly scheduling
  - Client persists rotated refresh tokens when provided (cookie path planned behind flag)

## Remaining Work (to close #19/#20)

1) Merge order
   - Land #19 first; re-run CI
   - Rebase `feat/auth-metrics` on `main` and merge #20 once #19 is green

2) Configuration/Docs
   - Ensure CONTRIBUTING uses uv/bun flows (legacy pip/npm mentions remain in top sections)
   - Optionally add short README in `docs/status/` pointing to this file and `USER_MANAGEMENT_ORCHESTRATEV9.md`

3) Next feature tickets (post-merge)
   - Frontend: switch to cookie refresh when `auth_cookie_refresh` is enabled; stop storing refresh in localStorage; echo CSRF header
   - Sessions UI endpoints (`/auth/sessions`, revoke specific session)
   - Ownership enforcement across entries update/delete; tests
   - Optional providers (OAuth/WebAuthn), RBAC

## Cleanup Recommendations

- Keep only `USER_MANAGEMENT_ORCHESTRATEV9.md` as source of truth for sequencing; leave earlier versions as archive
- Remove or quarantine ad‑hoc debug helpers not used in CI (e.g., `apps/api/test_debug.py`) if no longer needed
- Avoid committing coverage artifacts (`apps/web/coverage`, `apps/api/htmlcov`) in future — consider `.gitignore` update in a separate housekeeping PR

## Quick Verifications

- No conflict markers in `apps/api/app/api/v1/auth.py`
- Cookie imports use `from app.infra.cookies ...`
- Integration tests: `cd apps/api && uv run pytest -m integration -q` (requires local DB services)

