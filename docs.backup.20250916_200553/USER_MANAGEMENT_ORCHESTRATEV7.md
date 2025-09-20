Yes—green-light both next steps. Below are **ready-to-run codex briefs** for (A) **M4.T1 cookie refresh + CSRF** and (B) the **metrics micro-PR**. They’re small, reversible, and align with everything you’ve shipped in M1.

---

# A) M4.T1 — httpOnly **cookie refresh** + **CSRF** (access in memory)

## Branch

```bash
git checkout -b feat/auth-M4.T1-cookie-refresh
```

## codex brief (paste into one `codex edit`)

```
Goal: Move refresh tokens to secure httpOnly cookies and add double-submit CSRF. Keep access token in memory (frontend). Ship behind `JOURNAL_AUTH_COOKIE_REFRESH=true`. Preserve M1 rotation semantics.

Server changes (FastAPI):
1) settings.py
   - Add: auth_cookie_refresh: bool = False
   - Add: csrf_cookie_name="csrftoken", refresh_cookie_name="refresh_token"
   - Add: cookie_secure_default=True (prod), cookie_samesite="lax", cookie_path="/api/v1/auth"
2) api/v1/auth.py
   - In flagged paths (when JOURNAL_AUTH_COOKIE_REFRESH=True):
     a) /login: issue access as JSON; write rotated refresh cookie:
        Set-Cookie: refresh_token=<jwt>; HttpOnly; Secure?; SameSite=Lax; Path=/api/v1/auth; Max-Age=…
        Also set CSRF cookie if missing: csrftoken=<rand>; HttpOnly=false (readable), SameSite=Lax; Path=/ (or /api)
     b) /refresh: read refresh from cookie; rotate session rid; Set-Cookie new refresh; return new access in JSON ONLY (no refresh in body).
     c) /logout: read refresh from cookie + JSON (either ok), revoke session, Set-Cookie refresh_token=""; Max-Age=0.
     d) For unsafe methods (POST/PUT/PATCH/DELETE) require header `X-CSRF-Token` equal to `csrftoken` cookie value (double submit). Implement a small dependency `require_csrf()` used by /auth/logout and expose helper for other routes later.
   - When flag is false → keep existing M1 behavior (body refresh).
3) New endpoint: GET /api/v1/auth/csrf
   - If CSRF cookie absent, set a new random token; return { csrfToken } for clients that prefer explicit fetch.
4) CORS/credentials:
   - If your app serves API and web on different origins in dev, ensure CORSMiddleware allows credentials and exact origins.
5) Tests (integration):
   - test_cookie_refresh_flow.py:
     - login → response sets httpOnly refresh cookie (+ samesite/path)
     - refresh without body refresh_token (cookie only) → returns new access; Set-Cookie new refresh
     - logout clears cookie; subsequent refresh fails
     - CSRF: logout without header → 403; with header matching cookie → 204

Frontend (React):
6) config/flags.ts
   - Add FLAG: AUTH_COOKIE_REFRESH = VITE_AUTH_COOKIE_REFRESH === 'true'
7) services/authStore.ts
   - Remove persistence of refresh token when AUTH_COOKIE_REFRESH is true (do not read/write localStorage). Keep access token in memory. Broadcast remains.
8) services/api.ts
   - For all requests to API origin: set `credentials: 'include'` when AUTH_COOKIE_REFRESH is true.
   - refreshTokens(): if AUTH_COOKIE_REFRESH true, POST /auth/refresh with empty body (or {}), credentials: 'include'; on 200, setAccessToken(data.access_token). No refresh_token in body.
   - Unsafe verbs: include CSRF header:
     - Get `csrftoken` from `document.cookie` (parse) or call GET /auth/csrf once and cache. Send `X-CSRF-Token` on POST/PUT/PATCH/DELETE when flag on.
   - Remove any localStorage access for refresh when flag on.
9) Playwright e2e (auth-cookie.spec.ts):
   - With flags on:
     * Login → expect `refresh_token` cookie with HttpOnly (cannot be read via JS), SameSite=Lax, Path=/api/v1/auth
     * Make an unsafe request (DELETE /auth/logout) without header → 403; add header from cookie value → 204
     * Trigger 401 on /entries → client calls /auth/refresh (credentials include) → retry succeeds and no refresh in localStorage.

Acceptance:
- All existing M1 tests still pass with flag off.
- New cookie tests pass with both flags on (API & web).
- No access/refresh token readable from JS when cookie mode is on.
```

## Minimal server snippets (if the agent wants examples)

**helpers (csrf + cookie)**:

```python
# apps/api/app/infra/cookies.py
from fastapi import Response, Request, HTTPException, status, Depends
from secrets import token_urlsafe
from apps.api.app.settings import settings

def set_refresh_cookie(resp: Response, value: str, max_age: int):
    resp.set_cookie(
        key=settings.refresh_cookie_name,
        value=value,
        httponly=True,
        secure=settings.cookie_secure_default,
        samesite=settings.cookie_samesite.capitalize(),  # "Lax"
        path=settings.cookie_path,
        max_age=max_age,
    )

def clear_refresh_cookie(resp: Response):
    resp.delete_cookie(
        key=settings.refresh_cookie_name,
        path=settings.cookie_path,
        samesite=settings.cookie_samesite.capitalize(),
    )

def ensure_csrf_cookie(resp: Response, req: Request) -> str:
    name = settings.csrf_cookie_name
    val = req.cookies.get(name) or token_urlsafe(24)
    resp.set_cookie(
        key=name, value=val, httponly=False,
        secure=settings.cookie_secure_default,
        samesite=settings.cookie_samesite.capitalize(),
        path="/",
        max_age=60*60*24*180,
    )
    return val

def require_csrf(req: Request):
    name = settings.csrf_cookie_name
    cookie = req.cookies.get(name)
    header = req.headers.get("x-csrf-token")
    if not cookie or not header or cookie != header:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "CSRF validation failed")
```

**auth endpoints (flagged path)**: set cookie on `/login`, rotate on `/refresh`, clear on `/logout`.

## Frontend notes

* Add `VITE_AUTH_COOKIE_REFRESH=true` in staging `.env` and set `credentials:'include'` only when flag on.
* Parse CSRF cookie:

```ts
function getCookie(name: string) {
  return (`; ${document.cookie}`).split(`; ${name}=`).pop()?.split(';')[0] ?? null;
}
```

---

# B) Micro-PR — **Auth metrics counters** (Prometheus)

## Branch

```bash
git checkout -b feat/auth-metrics
```

## codex brief

```
Goal: Add minimal Prometheus counters for auth lifecycle. No behavior change; optional /metrics exposure assumed.

Server:
1) apps/api/app/infra/metrics.py (new)
   - Expose Prometheus counters:
     from prometheus_client import Counter
     AUTH_LOGIN_SUCCESS = Counter("auth_login_success_total","login successes", ["provider"])
     AUTH_LOGIN_FAIL    = Counter("auth_login_fail_total","login failures", ["reason"])
     AUTH_REFRESH_ROT   = Counter("auth_refresh_rotations_total","refresh rotations")
     AUTH_REVOCATIONS   = Counter("auth_revocations_total","session revocations")
2) Wire increments:
   - /login:
     * success → AUTH_LOGIN_SUCCESS.labels(provider="password").inc()
     * failure → AUTH_LOGIN_FAIL.labels(reason="invalid_credentials" or "not_verified").inc()
   - /refresh (flag on) → AUTH_REFRESH_ROT.inc()
   - /logout (flag on) → AUTH_REVOCATIONS.inc()
3) Optional: if not present, add /metrics route guarded by env (dev/staging), otherwise reuse existing exporter middleware.

Tests:
- Unit: import metrics and call .inc(); assert registry contains expected sample names.
- Integration (optional): GET /metrics returns the counters (skip in prod CI if exporter not enabled).

Acceptance:
- No regression to existing endpoints.
- Metrics appear in /metrics when enabled.
```

---

# Rollout & Backout

* **Staging enablement**
  API:

  ```
  JOURNAL_USER_MGMT_ENABLED=true
  JOURNAL_AUTH_COOKIE_REFRESH=true
  ```

  Web:

  ```
  VITE_USER_MGMT_ENABLED=true
  VITE_AUTH_COOKIE_REFRESH=true
  ```

  Ensure CORS allows credentials if cross-origin in dev.

* **Smoke (staging)**

  * Register → verify → login → check Set-Cookie (httpOnly refresh).
  * Force 401 → client refresh (credentials included) → success; no refresh in localStorage.
  * `DELETE /api/v1/auth/logout` without `X-CSRF-Token` → 403; with header → 204.
  * `/metrics` shows counters incrementing on login/refresh/logout.

* **Backout**
  Flip `JOURNAL_AUTH_COOKIE_REFRESH=false` and rebuild web with `VITE_AUTH_COOKIE_REFRESH=false`. M1 rotation remains intact (body refresh path).

---

If you want, I can also add a **tiny “unsafe verb guard”** PR that applies `require_csrf` to your existing write routes (entries create/update/delete) when cookie mode is on—kept behind the same cookie-refresh flag so you can phase it in.

