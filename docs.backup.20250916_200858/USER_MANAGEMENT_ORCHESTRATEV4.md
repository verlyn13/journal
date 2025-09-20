Yes—proceed to **M1.T3: refresh rotation + server sessions + logout revocation**. Here’s the exact, ready-to-run orchestration for the codex CLI. It’s small, test-first, and fully behind `JOURNAL_USER_MGMT_ENABLED`.

---

# M1.T3 — Refresh rotation, sessions, logout (flagged)

## 1) Branch

```bash
git checkout -b feat/auth-M1.T3-rotation
```

## 2) Implement (single codex brief)

```bash
codex edit <<'BRIEF'
Goal: Implement server-side session tracking with rotating refresh tokens and logout revocation. Keep everything behind JOURNAL_USER_MGMT_ENABLED. Do not break demo flow when flag is false.

Context:
- Models already exist (User, UserSession in apps/api/app/infra/models.py).
- T2 added register/verify/login (non-rotating). Now we: (1) create a UserSession at login, (2) embed its refresh_id (UUID) as "rid" claim in refresh JWT, (3) /refresh rotates to a new rid + issues new tokens, (4) /logout revokes session.

Changes:

1) apps/api/app/infra/sessions.py  (new)
- create_session(db, user_id: UUID, ua: str|None, ip: str|None) -> UserSession
- touch_session(db, sess: UserSession) -> None  (updates last_used_at=now)
- revoke_session(db, sess: UserSession) -> None  (sets revoked_at=now)
- get_session_by_refresh_id(db, rid: UUID) -> UserSession|None

2) apps/api/app/infra/auth.py
- Ensure create_refresh_token accepts refresh_id (rid) and includes it in payload.
  If signature already supports refresh_id, keep as-is.

3) apps/api/app/api/v1/auth.py
- In flagged /login path:
  - Create a UserSession (capture UA/IP).
  - Issue access token and refresh token with "rid" = session.refresh_id (string).
- Add schema: RefreshIn { refresh_token: str }
- Implement flagged /refresh:
  - Verify refresh token (typ="refresh", aud ok).
  - Extract rid; load session; if missing or revoked -> 401.
  - Rotate: assign new UUID to sess.refresh_id, persist, touch last_used_at.
  - Issue new access + refresh with new rid.
  - Old rid becomes invalid by virtue of DB change (no grace period).
- Implement flagged /logout:
  - Verify provided refresh; find session by rid; revoke; return 204.

4) Tests: apps/api/tests/integration/test_refresh_rotation.py (new)
- Flow:
  - Register → verify → login → get refresh1
  - POST /refresh with refresh1 -> 200 + refresh2 (different)
  - POST /refresh with refresh1 again -> 401
  - POST /logout with refresh2 -> 204
  - POST /refresh with refresh2 -> 401

5) Guard:
- If JOURNAL_USER_MGMT_ENABLED is false, /refresh and /logout should mirror current demo behavior (existing endpoints), or return 404—mirror your current pattern consistently. Prefer 404 to avoid accidental use.

Acceptance:
- pytest -q apps/api/tests/integration/test_refresh_rotation.py passes (with DB up)
- No behavior change when flag is false.
BRIEF
```

## 3) Suggested code (paste if codex needs snippets)

### `apps/api/app/infra/sessions.py` (new)

```python
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Session, select
from apps.api.app.infra.models import UserSession
from apps.api.app.settings import settings

def create_session(db: Session, user_id: UUID, ua: Optional[str], ip: Optional[str]) -> UserSession:
    now = datetime.now(timezone.utc)
    sess = UserSession(
        user_id=user_id,
        refresh_id=uuid4(),
        user_agent=ua,
        ip_address=ip,
        issued_at=now,
        last_used_at=now,
        expires_at=now + timedelta(days=settings.refresh_token_days),
        revoked_at=None,
    )
    db.add(sess); db.commit(); db.refresh(sess)
    return sess

def get_session_by_refresh_id(db: Session, rid: UUID) -> Optional[UserSession]:
    return db.exec(select(UserSession).where(UserSession.refresh_id == rid)).first()

def touch_session(db: Session, sess: UserSession) -> None:
    sess.last_used_at = datetime.now(timezone.utc)
    db.add(sess); db.commit()

def revoke_session(db: Session, sess: UserSession) -> None:
    if not sess.revoked_at:
        sess.revoked_at = datetime.now(timezone.utc)
        db.add(sess); db.commit()
```

### `apps/api/app/api/v1/auth.py` (login → create session; refresh/logout)

```diff
@@
-from apps.api.app.infra.auth import create_access_token, create_refresh_token, create_verify_token, require_user
+from apps.api.app.infra.auth import create_access_token, create_refresh_token, create_verify_token, require_user
+from apps.api.app.infra.sessions import create_session, get_session_by_refresh_id, touch_session, revoke_session
+import jwt
+from uuid import UUID, uuid4
@@
 @router.post("/login")
 def login(body: LoginIn, request: Request, db: Session = Depends(get_session)):
     _guard_enabled()
@@
-    access = create_access_token(str(user.id), scopes=user.roles)
-    refresh = create_refresh_token(str(user.id))  # rotation comes in M1.T3
+    # Create server-side session
+    ua = request.headers.get("user-agent")
+    ip = request.client.host if request.client else None
+    sess = create_session(db, user.id, ua, ip)
+    access = create_access_token(str(user.id), scopes=user.roles)
+    refresh = create_refresh_token(str(user.id), refresh_id=str(sess.refresh_id))
     return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}
+
+class RefreshIn(BaseModel):
+    refresh_token: str
+
+@router.post("/refresh")
+def refresh_tokens(body: RefreshIn, request: Request, db: Session = Depends(get_session)):
+    _guard_enabled()
+    try:
+        payload = jwt.decode(body.refresh_token, settings.jwt_secret, audience=settings.jwt_aud, algorithms=["HS256"])
+    except jwt.PyJWTError:
+        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh")
+    if payload.get("typ") != "refresh" or not payload.get("rid"):
+        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token type")
+    rid = UUID(payload["rid"])
+    sess = get_session_by_refresh_id(db, rid)
+    if not sess or sess.revoked_at:
+        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session revoked")
+    # Rotate rid and issue new tokens
+    sess.refresh_id = uuid4()
+    touch_session(db, sess)
+    access = create_access_token(payload["sub"])
+    refresh = create_refresh_token(payload["sub"], refresh_id=str(sess.refresh_id))
+    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}
+
+@router.post("/logout", status_code=204)
+def logout(body: RefreshIn, db: Session = Depends(get_session)):
+    _guard_enabled()
+    try:
+        payload = jwt.decode(body.refresh_token, settings.jwt_secret, audience=settings.jwt_aud, algorithms=["HS256"])
+    except jwt.PyJWTError:
+        raise HTTPException(status.HTTP_401_UNAUTHORIZED)
+    if payload.get("typ") != "refresh" or not payload.get("rid"):
+        raise HTTPException(status.HTTP_401_UNAUTHORIZED)
+    sess = get_session_by_refresh_id(db, UUID(payload["rid"]))
+    if sess:
+        revoke_session(db, sess)
+    return
```

> If your code uses a different `get_session` import or path, keep it consistent with T2.

### `apps/api/tests/integration/test_refresh_rotation.py` (new)

```python
import os
import pytest

pytestmark = pytest.mark.integration

def _register_verify_login(api):
    os.environ["JOURNAL_USER_MGMT_ENABLED"] = "true"
    r = api.post("/api/v1/auth/register", json={
        "email":"rot@example.com","password":"CorrectHorse9!","username":"rot"
    })
    token = r.json().get("dev_verify_token")
    api.post("/api/v1/auth/verify-email", json={"token": token})
    r = api.post("/api/v1/auth/login", json={"email":"rot@example.com","password":"CorrectHorse9!"})
    assert r.status_code == 200
    return r.json()

def test_refresh_rotation_and_logout(api_client):
    tokens = _register_verify_login(api_client)
    refresh1 = tokens["refresh_token"]
    r = api_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh1})
    assert r.status_code == 200
    refresh2 = r.json()["refresh_token"]
    assert refresh2 != refresh1
    r2 = api_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh1})
    assert r2.status_code == 401
    r3 = api_client.post("/api/v1/auth/logout", json={"refresh_token": refresh2})
    assert r3.status_code == 204
    r4 = api_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh2})
    assert r4.status_code == 401
```

## 4) Run tests (with DB up)

```bash
# Start DB if needed (align to your compose)
( cd apps/api && docker compose up -d db )
uv run pytest -q apps/api/tests/integration/test_refresh_rotation.py
```

## 5) Open PR

```bash
codex open-pr \
  --base main \
  --head feat/auth-M1.T3-rotation \
  --title "feat(auth): refresh rotation, server sessions, logout revocation (M1.T3)" \
  --labels auth,sessions,security,backend,feature-flag \
  --body "$(cat <<'MD'
### What
- Server-side `UserSession` used to bind refresh tokens (`rid` in JWT).
- `/login` creates session; `/refresh` rotates `rid` and issues new tokens.
- `/logout` revokes the session.
- All behind `JOURNAL_USER_MGMT_ENABLED`.

### Why
Secure session lifecycle: rotation prevents replay; revocation ends sessions reliably.

### Guardrails
- Flag off → demo flow unaffected (404 for flagged endpoints if not enabled).
- No grace period (old refresh invalid immediately) for simpler, safer semantics.

### Validation
- `pytest -q apps/api/tests/integration/test_refresh_rotation.py` ✅
- Manual: register → verify → login → refresh → logout → refresh fails.

### Follow-ups
- Frontend: persist rotated refresh, retry on 401 (M1 frontend task).
- Metrics: counters for login/refresh/revoke (tiny PR).
MD
)"
```

## 6) Reviewer checklist (drop as PR comment)

* [ ] `/login` sets `rid` in refresh JWT and DB has matching `user_sessions` row.
* [ ] `/refresh` rotates `rid`; old refresh rejected.
* [ ] `/logout` revokes session; subsequent refresh rejected.
* [ ] Endpoints guarded by `JOURNAL_USER_MGMT_ENABLED`.
* [ ] Tests pass with DB running.

## 7) After merge

* Enable in **staging** only:

```bash
mise env set JOURNAL_USER_MGMT_ENABLED=true
```

* Run integration smoke in staging pipeline.

---

When you confirm M1.T3 is opened/green, I’ll queue the **frontend mini-PR** to store rotated refresh tokens and remove demo auto-login under the flag, plus a Playwright smoke test for 401→refresh→retry.

