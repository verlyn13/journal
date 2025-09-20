---
id: user-management-orchestratev8
title: 1) Open the PRs
type: reference
version: 1.0.0
created: '2025-09-10'
updated: '2025-09-10'
author: Journal Team
tags:
- reference
priority: medium
status: approved
visibility: internal
schema_version: v1
---

Yes—please open both PRs now. Here’s everything prepped so you can move fast: PR titles/bodies, reviewer checklists, merge order, staging rollout flags, smoke tests, and backout.

---

# 1) Open the PRs

## A) Cookie refresh + CSRF (M4.T1)

**Title:** `feat(auth): cookie-based refresh + CSRF (M4.T1)`
**Labels:** `auth`, `security`, `sessions`, `feature-flag`, `frontend`

**Body (paste):**

```
### What
- Moves refresh tokens to **httpOnly cookies** when `JOURNAL_AUTH_COOKIE_REFRESH=true`.
- Adds **double-submit CSRF**: `csrftoken` cookie + `X-CSRF-Token` header.
- `/login` (flag on): sets `refresh_token` cookie + `csrftoken`; returns **access_token only**.
- `/refresh` (flag on): reads cookie, rotates `rid`, **returns access_token only**, resets cookie.
- `/logout` (flag on): requires CSRF header; revokes session; **clears cookie**; 204.
- Frontend: `credentials: 'include'` in cookie mode; no refresh stored in JS; auto-sets `X-CSRF-Token` for unsafe verbs; fallback to M1 body flow when flag off.

### Why
Reduce token exfiltration risk (httpOnly), add CSRF protection, keep access in memory.

### Flags
- API: `JOURNAL_AUTH_COOKIE_REFRESH=true` enables cookie mode.
- Web: `VITE_AUTH_COOKIE_REFRESH=true` enables client cookie path.

### Validation
- Login sets cookie: Path=`/api/auth`, SameSite=`Lax`, HttpOnly, Secure per env.
- Refresh rotates `rid`; response has only `access_token`.
- Logout requires `X-CSRF-Token` matching `csrftoken`; clears cookie.
- Flag OFF → legacy (body refresh) unchanged.

### Follow-ups
- Optionally apply CSRF guard to non-auth write routes under same flag.
```

**Reviewer checklist (comment this on the PR):**

* [ ] `Set-Cookie: refresh_token` has `HttpOnly`, `SameSite=Lax`, `Path=/api/auth`, `Secure` in non-dev.
* [ ] `/refresh` reads cookie only (no body token), rotates `rid`, returns **access only**.
* [ ] `/logout` 403 without CSRF header; 204 with correct header; cookie cleared.
* [ ] Web sends `credentials:'include'`, adds `X-CSRF-Token` on unsafe verbs.
* [ ] No refresh token written to localStorage in cookie mode.
* [ ] Flag off preserves prior behavior and tests.

---

## B) Auth metrics micro-PR

**Title:** `feat(metrics): auth counters for login/refresh/logout`
**Labels:** `observability`, `metrics`, `backend`, `security`

**Body (paste):**

```
### What
Adds Prometheus counters and wires them to auth lifecycle:
- `auth_login_success_total{provider}`
- `auth_login_fail_total{reason}`
- `auth_refresh_rotations_total`
- `auth_revocations_total`

### Why
Operational visibility for login success/fail, refresh rotations, and session revocations.

### Validation
- Counters increment on password login success/failure, /refresh (flag on), and /logout (flag on).
- `/metrics` exposes samples via existing exporter (dev/staging).
```

**Reviewer checklist:**

* [ ] Counters present and incremented in the expected code paths.
* [ ] No behavior changes if exporter disabled.
* [ ] `/metrics` shows samples in dev/staging.

---

# 2) Merge order

1. **M1.T1** → **M1.T2** → **M1.T3** → **Web M1** (these should already be queued).
2. **M4.T1 Cookie Refresh**
3. **Auth Metrics**

---

# 3) Staging rollout (exact flags)

**API (.env or env vars):**

```
JOURNAL_USER_MGMT_ENABLED=true
JOURNAL_AUTH_COOKIE_REFRESH=true
COOKIE_SAMESITE=lax        # (if configurable)
COOKIE_SECURE_DEFAULT=true # ensure https in staging/prod
```

**Web (.env):**

```
VITE_USER_MGMT_ENABLED=true
VITE_AUTH_COOKIE_REFRESH=true
```

Rebuild/deploy web after toggling VITE flags.

---

# 4) Staging smoke tests (quick script)

* Register → verify → login → confirm:

  * `Set-Cookie: refresh_token` (HttpOnly, SameSite=Lax, Path=/api/auth, Secure in staging).
  * JSON has **access\_token only**.
* Force an access 401 → client `/auth/refresh` (credentials included) → returns **access only**, sets new cookie → original request retried once and succeeds.
* Call `/api/auth/logout` **without** `X-CSRF-Token` → **403**.
* Fetch `/api/auth/csrf`, then send `X-CSRF-Token` → **204**, cookie cleared.
* Check `/metrics`: counters incremented (login, refresh, revoke).

---

# 5) Backout plan

* Flip **web** `VITE_AUTH_COOKIE_REFRESH=false` (rebuild) and **API** `JOURNAL_AUTH_COOKIE_REFRESH=false`.
* M1 (body refresh) path continues to work; no DB rollback needed.

---

# 6) Nice-to-haves (tiny PRs you can queue next)

* **Unsafe-verb CSRF guard** on entries create/update/delete when cookie flag is on (reuse `require_csrf`).
* **Devices/Sessions page (M5.T1)** listing `UserSession`s with revoke; uses your existing rotation model.
* **Security dashboard panel** for the new auth counters.

---

# 7) One-liners for local test runs

```bash
# API: run with flags enabled
JOURNAL_USER_MGMT_ENABLED=true JOURNAL_AUTH_COOKIE_REFRESH=true uv run uvicorn apps.api.app.main:app --reload

# Web: run with flags enabled
VITE_USER_MGMT_ENABLED=true VITE_AUTH_COOKIE_REFRESH=true pnpm -C apps/web dev

# Playwright (cookie mode)
pnpm -C apps/web exec playwright test tests/e2e/auth-cookie.spec.ts
```

---

Once these PRs are open, merge them in the order above and flip the staging flags. After the staging smoke is green, we’ll proceed to M5 (Devices/Sessions UI) and optional CSRF guard on entries.

