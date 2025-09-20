---
id: user-management-orchestratev6
title: Open the three PRs
type: api
version: 1.0.0
created: '2025-09-10'
updated: '2025-09-10'
author: Journal Team
tags:
- api
- docker
priority: high
status: approved
visibility: internal
schema_version: v1
---

Yes—please open all three PRs formally and attach reviewer checklists. Then we’ll move to M4 (cookie refresh) and the small metrics PR.

Here’s everything you need:

---

# Open the three PRs

```bash
# 1) Docs PR
codex open-pr \
  --base main \
  --head docs/user-management-report \
  --title "docs(auth): user management plan + starter diffs" \
  --labels docs,auth,planning \
  --body "Adds phased implementation plan and starter diffs; no runtime changes."

# 2) M1.T1 (Users + Sessions schema)
codex open-pr \
  --base main \
  --head feat/auth-M1.T1-users-sessions \
  --title "feat(auth): add User & UserSession models and migration (M1.T1)" \
  --labels auth,db,migrations,backend \
  --body "$(cat <<'MD'
### What
- Adds `User` and `UserSession` tables (UUID PKs, JSONB roles).
- Alembic migration (0009_*).
- Unit test for default values.

### Guardrails
- Pure schema + unit test. No runtime changes. `JOURNAL_USER_MGMT_ENABLED=false`.

### Validation
- `alembic upgrade head` ✅
- `pytest -q apps/api/tests/unit/test_user_model.py` ✅
MD
)"

# 3) M1.T2 (Register/Verify/Login behind flag)
codex open-pr \
  --base main \
  --head feat/auth-M1.T2-register-login \
  --title "feat(auth): register/verify/login behind flag (M1.T2)" \
  --labels auth,backend,feature-flag,security \
  --body "$(cat <<'MD'
### What
- Password-based register → verify → login behind `JOURNAL_USER_MGMT_ENABLED`.
- Argon2id hashing; simple rate limit for /register & /login.

### Guardrails
- Demo endpoints intact; flag off returns 404 for new routes.

### Validation
- Start DB: `cd apps/api && docker compose up -d db`
- `uv run pytest -q apps/api/tests/integration/test_auth_password_flow.py` ✅
MD
)"

# 4) M1.T3 (Rotation + logout revocation behind flag)
codex open-pr \
  --base main \
  --head feat/auth-M1.T3-rotation \
  --title "feat(auth): refresh rotation, server sessions, logout revocation (M1.T3)" \
  --labels auth,sessions,security,backend,feature-flag \
  --body "$(cat <<'MD'
### What
- Server-side `UserSession` bound to refresh (`rid` claim).
- `/refresh` rotates `rid` and returns new access+refresh.
- `/logout` revokes the session. All behind `JOURNAL_USER_MGMT_ENABLED`.

### Validation
- `docker compose up -d db`
- `uv run pytest -q apps/api/tests/integration/test_refresh_rotation.py` ✅
MD
)"

# 5) Web M1 (Rotated refresh + demo guard)
codex open-pr \
  --base main \
  --head feat/web-M1-auth-rotation \
  --title "feat(web): rotated refresh persistence + demo guard, cross-tab sync (M1)" \
  --labels frontend,auth,feature-flag \
  --body "$(cat <<'MD'
### What
- Access token kept in memory; refresh persisted & rotated on `/auth/refresh`.
- BroadcastChannel cross-tab updates & logout.
- When `VITE_USER_MGMT_ENABLED=true`, demo auto-login disabled; minimal unauth state.

### Validation
- Playwright e2e: `apps/web/tests/e2e/auth-rotation.spec.ts` ✅
- Flag OFF: legacy behavior intact.
MD
)"
```

---

# Reviewer checklists (drop these as review comments)

## M1.T1 — Models & migration

* [ ] Only `users` and `user_sessions` added; indexes and FK correct.
* [ ] `roles` JSONB defaults to `["user"]`.
* [ ] `alembic upgrade head` on clean DB passes.
* [ ] Unit test green.

## M1.T2 — Register/Verify/Login

* [ ] Endpoints 404 when `JOURNAL_USER_MGMT_ENABLED=false`.
* [ ] Argon2id hashing; no plaintext persistence.
* [ ] Register does **not** enumerate existing emails.
* [ ] Verify token `typ=verify`, `aud/iss` validated.
* [ ] Login respects `auth_require_email_verify`.
* [ ] Rate limit returns generic 429.
* [ ] Integration test green.

## M1.T3 — Rotation & logout

* [ ] `/login` issues refresh with `rid` linked to `user_sessions.refresh_id`.
* [ ] `/refresh` rotates `rid`; old refresh rejected.
* [ ] `/logout` revokes session; subsequent refresh fails.
* [ ] All guarded by `JOURNAL_USER_MGMT_ENABLED`.
* [ ] Integration test green.

## Web M1 — Client wiring

* [ ] Access token **not** stored in localStorage.
* [ ] On 401, exactly **one** retry after refresh; rotated refresh persisted.
* [ ] BroadcastChannel logout clears tokens across tabs.
* [ ] `VITE_USER_MGMT_ENABLED=true` disables demo auto-login.
* [ ] E2E tests green with flags on.

---

# Merge order & staging flags

1. **M1.T1** → **M1.T2** → **M1.T3** → **Web M1**.
2. In **staging** set:

   * API: `JOURNAL_USER_MGMT_ENABLED=true`
   * Web: `VITE_USER_MGMT_ENABLED=true` (rebuild web)
3. Staging smoke:

   * Register → verify → login.
   * Force expired access → 401 → refresh → success; refresh rotated.
   * Logout → refresh fails.
   * Cross-tab logout works.

Backout: flip both flags to `false` (schema remains; behavior returns to demo).

---

# Small polish (fast follow, optional before prod)

1. **Server metrics PR** (tiny):

   * Counters: `auth_login_success_total`, `auth_login_fail_total`, `auth_refresh_rotations_total`, `auth_revocations_total`.
   * Increment in `/login`, `/refresh`, `/logout`.

2. **Client robustness**:

   * Ensure we **only retry once** on 401 (already done; add a unit test for this path).
   * Add a small jittered backoff for burst 401s (optional).

3. **Security sweep**:

   * Confirm JWT `aud/iss/typ` validated in all paths.
   * CORS locked in staging/prod.
   * No access token ever written to storage.

---

# Next milestone proposal

After these PRs are merged to staging & validated:

* **M4.T1**: Move refresh → httpOnly cookie + CSRF token; access stays in memory.
* **M5.T1**: Devices/Sessions page consuming `user_sessions` (list + revoke).

I’ll prep the codex briefs for **M4.T1 cookie refresh** and a **metrics micro-PR** the moment you confirm the PRs are open.

