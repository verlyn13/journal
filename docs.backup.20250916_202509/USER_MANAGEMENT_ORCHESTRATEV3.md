Fantastic progress. ✅ M1.T1 is in and green. Let’s immediately execute **M1.T2 — register/verify/login (behind flag)**. Below is everything the agent needs: exact codex steps, focused diffs, tests, and the PR template. This stays fully **feature-flagged** (`JOURNAL_USER_MGMT_ENABLED=true` enables it).

---

# M1.T2 — Registration + Email Verify + Password Login (Argon2id)

## 1) Create branch

```bash
git checkout -b feat/auth-M1.T2-register-login
```

## 2) Apply changes with codex (single brief)

```bash
codex edit <<'BRIEF'
Goal: Implement flagged password-based auth: register → verify email → login. Keep demo endpoints intact. No session rotation yet (that’s M1.T3).

Constraints:
- Behind JOURNAL_USER_MGMT_ENABLED (404 if false).
- Use Argon2id hashing.
- Issue access + refresh (temporary non-rotating).
- Provide dev-only verify token for convenience.
- Minimal rate-limiting on /register and /login.
- Integration test for happy path.

Files to modify/add:

1) apps/api/app/settings.py
- Ensure flag exists: user_mgmt_enabled: bool = False
- Add:
  auth_require_email_verify: bool = True
  rate_limit_window_seconds: int = 60
  rate_limit_max_attempts: int = 5

2) apps/api/app/infra/security.py (new)
- Argon2id helpers:
  hash_password(pw: str) -> str
  verify_password(hash_: str, pw: str) -> bool

3) apps/api/app/infra/auth.py
- Add create_verify_token(sub: str, minutes: int = 30) -> str
- (Keep existing create_access_token/create_refresh_token)

4) apps/api/app/infra/ratelimit.py (new, lightweight)
- In-memory per-key sliding window or fixed window counter using time.time():
  allow(key: str, max_attempts: int, window_seconds: int) -> bool
- Key examples: f"register:{ip_or_email}", f"login:{ip_or_email}"
- NOTE: This is acceptable for dev/staging; production can swap to Redis later.

5) apps/api/app/api/v1/auth.py
- Import settings, db session, models.User, infra.security, infra.auth, ratelimit.
- Add schemas:
  RegisterIn { email: EmailStr, password: constr(min_length=8), username?: str }
  VerifyIn { token: str }
  LoginIn { email: EmailStr, password: str }
- New routes (404 if settings.user_mgmt_enabled is False):
  POST /api/v1/auth/register -> 202 { message, dev_verify_token? }
    * if user exists, return 202 with generic message (no enumeration)
    * save hashed password; is_verified False
    * create verify token with create_verify_token(user.id)
  POST /api/v1/auth/verify-email -> 204
    * decode token; ensure typ == "verify"; set is_verified True
  POST /api/v1/auth/login -> 200 { access_token, refresh_token, token_type }
    * verify user exists, active, (verified if require_email_verify), password matches
    * issue access + refresh (no rotation yet)
- Rate limit /register and /login using ratelimit.allow with IP or email.

6) apps/api/tests/integration/test_auth_password_flow.py (new)
- Happy path: register → verify-email → login → tokens present
- Set JOURNAL_USER_MGMT_ENABLED=true (env) for the test

Acceptance:
- pytest -q apps/api/tests/integration/test_auth_password_flow.py passes
- No impact to demo endpoints when flag is false
BRIEF
```

## 3) Suggested diffs (if you prefer to paste manually)

### `apps/api/app/settings.py` (add fields if missing)

```diff
@@
 class Settings(BaseSettings):
@@
     user_mgmt_enabled: bool = False
+    auth_require_email_verify: bool = True
+    rate_limit_window_seconds: int = 60
+    rate_limit_max_attempts: int = 5
@@
 settings = Settings()
```

### `apps/api/app/infra/security.py` (new)

```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

_ph = PasswordHasher()  # Argon2id defaults

def hash_password(pw: str) -> str:
    return _ph.hash(pw)

def verify_password(hash_: str, pw: str) -> bool:
    try:
        return _ph.verify(hash_, pw)
    except VerifyMismatchError:
        return False
    except Exception:
        return False
```

### `apps/api/app/infra/auth.py` (add verify token)

```diff
 from datetime import datetime, timedelta, timezone
@@
 def create_refresh_token(sub: str, days: Optional[int] = None, refresh_id: Optional[str] = None) -> str:
@@
     return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")

+def create_verify_token(sub: str, minutes: int = 30) -> str:
+    now = datetime.now(timezone.utc)
+    exp = now + timedelta(minutes=minutes)
+    payload = {
+        "iss": settings.jwt_iss,
+        "aud": settings.jwt_aud,
+        "iat": int(now.timestamp()),
+        "nbf": int(now.timestamp()),
+        "exp": int(exp.timestamp()),
+        "sub": sub,
+        "typ": "verify",
+    }
+    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
```

### `apps/api/app/infra/ratelimit.py` (new, simple fixed-window)

```python
import time
from collections import defaultdict
from typing import Dict, Tuple

# key -> (window_start_ts, count)
_state: Dict[str, Tuple[float, int]] = defaultdict(lambda: (0.0, 0))

def allow(key: str, max_attempts: int, window_seconds: int) -> bool:
    now = time.time()
    win_start, count = _state[key]
    if now - win_start > window_seconds:
        _state[key] = (now, 1)
        return True
    if count < max_attempts:
        _state[key] = (win_start, count + 1)
        return True
    return False
```

### `apps/api/app/api/v1/auth.py` (new endpoints under flag)

```diff
 from fastapi import APIRouter, Depends, HTTPException, Request, status
 from pydantic import BaseModel, EmailStr, constr
 from uuid import UUID
-from datetime import datetime, timedelta, timezone
+from datetime import datetime
 from sqlmodel import Session, select
-from apps.api.app.infra.auth import (
-    create_access_token,
-    create_refresh_token,
-    require_user,
-)
-from apps.api.app.infra.security import hash_password, verify_password
-from apps.api.app.infra.models_user import User
-from apps.api.app.settings import settings
-from apps.api.app.db import get_session  # your app's session provider
+import jwt
+from apps.api.app.infra.auth import create_access_token, create_refresh_token, create_verify_token, require_user
+from apps.api.app.infra.security import hash_password, verify_password
+from apps.api.app.infra.models import User  # consolidated models file per repo convention
+from apps.api.app.infra.ratelimit import allow
+from apps.api.app.settings import settings
+from apps.api.app.db import get_session

 router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

+class RegisterIn(BaseModel):
+    email: EmailStr
+    password: constr(min_length=8)
+    username: str | None = None
+
+class VerifyIn(BaseModel):
+    token: str
+
+class LoginIn(BaseModel):
+    email: EmailStr
+    password: str
+
+def _guard_enabled():
+    if not settings.user_mgmt_enabled:
+        raise HTTPException(status.HTTP_404_NOT_FOUND)
+
 @router.post("/register", status_code=202)
 def register(body: RegisterIn, request: Request, db: Session = Depends(get_session)):
-    # existing demo endpoints live elsewhere; no-op here
-    raise HTTPException(status.HTTP_404_NOT_FOUND)
+    _guard_enabled()
+    key = f"register:{request.client.host if request.client else 'unknown'}"
+    if not allow(key, settings.rate_limit_max_attempts, settings.rate_limit_window_seconds):
+        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Please try again later.")
+    existing = db.exec(select(User).where(User.email == body.email)).first()
+    if existing:
+        return {"message": "If this address can register, a verification will be sent."}
+    user = User(email=body.email, username=body.username, password_hash=hash_password(body.password))
+    db.add(user); db.commit(); db.refresh(user)
+    token = create_verify_token(str(user.id))
+    return {"message": "Verification required", "dev_verify_token": token if settings.testing else None}

 @router.post("/verify-email", status_code=204)
 def verify_email(body: VerifyIn, db: Session = Depends(get_session)):
-    raise HTTPException(status.HTTP_404_NOT_FOUND)
+    _guard_enabled()
+    try:
+        payload = jwt.decode(body.token, settings.jwt_secret, audience=settings.jwt_aud, algorithms=["HS256"])
+    except jwt.PyJWTError:
+        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid token")
+    if payload.get("typ") != "verify":
+        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid token type")
+    user = db.get(User, UUID(payload["sub"]))
+    if not user:
+        raise HTTPException(status.HTTP_400_BAD_REQUEST, "User not found")
+    user.is_verified = True
+    user.updated_at = datetime.utcnow()
+    db.add(user); db.commit()
+    return

 @router.post("/login")
 def login(body: LoginIn, request: Request, db: Session = Depends(get_session)):
-    raise HTTPException(status.HTTP_404_NOT_FOUND)
+    _guard_enabled()
+    key = f"login:{body.email}"
+    if not allow(key, settings.rate_limit_max_attempts, settings.rate_limit_window_seconds):
+        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Please try again later.")
+    user = db.exec(select(User).where(User.email == body.email)).first()
+    ok = bool(
+        user and user.is_active and user.password_hash and verify_password(user.password_hash, body.password) and
+        (user.is_verified or not settings.auth_require_email_verify)
+    )
+    if not ok:
+        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
+    access = create_access_token(str(user.id), scopes=user.roles)
+    refresh = create_refresh_token(str(user.id))  # rotation comes in M1.T3
+    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}
```

### `apps/api/tests/integration/test_auth_password_flow.py` (new)

```python
import os
import pytest

pytestmark = pytest.mark.integration

def test_register_verify_login(api_client):
    os.environ["JOURNAL_USER_MGMT_ENABLED"] = "true"
    # Register
    r = api_client.post("/api/v1/auth/register", json={
        "email": "auth.t2@example.com",
        "password": "CorrectHorse9!",
        "username": "auth2"
    })
    assert r.status_code == 202
    token = r.json().get("dev_verify_token")
    assert token, "dev verify token should be present in testing/dev"
    # Verify email
    r = api_client.post("/api/v1/auth/verify-email", json={"token": token})
    assert r.status_code == 204
    # Login
    r = api_client.post("/api/v1/auth/login", json={
        "email": "auth.t2@example.com",
        "password": "CorrectHorse9!"
    })
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data and "refresh_token" in data and data["token_type"] == "bearer"
```

> If your test harness doesn’t set `settings.testing` automatically, it’s fine—the test only requires the endpoints to function; the `dev_verify_token` expectation can be relaxed. Keep it as-is if your CI uses testing mode; otherwise, conditionally assert.

## 4) Run tests

```bash
# Apply DB if needed (no new migration in T2)
uv run pytest -q apps/api/tests/integration/test_auth_password_flow.py
```

## 5) Open PR

```bash
codex open-pr \
  --base main \
  --head feat/auth-M1.T2-register-login \
  --title "feat(auth): register/verify/login behind flag (M1.T2)" \
  --labels auth,backend,feature-flag,security \
  --body "$(cat <<'MD'
### What
- Adds password-based register → verify email → login flows under `JOURNAL_USER_MGMT_ENABLED=true`.
- Argon2id password hashing.
- Lightweight rate limiting for `/register` and `/login`.
- Issues access + refresh (non-rotating; rotation lands in M1.T3).

### Why
Foundation for real user identities while preserving demo mode off-flag.

### Guardrails
- 404 when `JOURNAL_USER_MGMT_ENABLED=false`.
- No change to demo endpoints.
- Minimal in-memory rate limiting; production can swap to Redis later.

### Validation
- `pytest -q apps/api/tests/integration/test_auth_password_flow.py` ✅

### Follow-ups
- M1.T3: server-side sessions, refresh rotation, and logout revocation.
MD
)"
```

## 6) Reviewer checklist (drop as PR comment)

* [ ] Endpoints 404 when flag is false.
* [ ] Argon2id hashing present; no plaintext passwords.
* [ ] Register doesn’t enumerate existing emails.
* [ ] Verify token type is `verify`; audience & issuer checked.
* [ ] Login respects `auth_require_email_verify`.
* [ ] Integration test green.

## 7) Backout

* Close PR; no DB changes in T2. Feature flag remains off by default.

---

If you want, I’ll immediately stage **M1.T3 (refresh rotation + logout + server sessions)** after you confirm T2 is in review.

