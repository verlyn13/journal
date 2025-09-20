# User Management Starter Diffs

This document provides minimal, focused diffs to bootstrap the user management implementation while keeping changes aligned with current architecture. These diffs are illustrative and should be adapted during development/migration review.

Note: Paths reflect current code locations (e.g., models live in `app/infra/models.py`).

---

## 1) Models: User and RefreshSession

File: `apps/api/app/infra/models.py`

```diff
@@
 from sqlmodel import SQLModel, Field
+from typing import Optional
+from uuid import UUID, uuid4
+from datetime import datetime

@@
 class Entry(SQLModel, table=True):
     # ... existing fields ...
     author_id: UUID = Field(index=True)

+
+class User(SQLModel, table=True):
+    __tablename__ = "users"
+
+    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
+    email: str = Field(index=True, unique=True, nullable=False)
+    username: Optional[str] = Field(default=None, unique=True)
+    password_hash: str = Field(nullable=False)
+    is_active: bool = Field(default=True)
+    is_verified: bool = Field(default=False)
+    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
+    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
+
+
+class RefreshSession(SQLModel, table=True):
+    __tablename__ = "refresh_sessions"
+
+    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
+    user_id: UUID = Field(foreign_key="users.id", index=True, nullable=False)
+    jti: str = Field(unique=True, index=True, nullable=False)
+    revoked: bool = Field(default=False, nullable=False)
+    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
+    expires_at: datetime = Field(nullable=False)
+    user_agent: Optional[str] = None
+    ip_address: Optional[str] = None
```

Migration: `uv run alembic revision --autogenerate -m "add user and refresh sessions"` then review and `uv run alembic upgrade head`.

---

## 2) Settings: Feature flags and cookie toggles

File: `apps/api/app/settings.py`

```diff
@@
 class Settings(BaseSettings):
@@
     refresh_token_days: int = 30
@@
     user_mgmt_enabled: bool = False
@@
     demo_username: str = "demo"
     demo_password: str = ""  # Set JOURNAL_DEMO_PASSWORD in env for non-empty
+
+    # User management additions
+    password_hash_scheme: str = "argon2"  # or "bcrypt"
+    refresh_cookie_enabled: bool = False
+    refresh_cookie_name: str = "jr_refresh"
+    refresh_cookie_secure: bool = True
+    refresh_cookie_samesite: str = "lax"
```

---

## 3) Auth Infra: jti, rotation scaffolds

File: `apps/api/app/infra/auth.py`

```diff
@@
 from datetime import UTC, datetime, timedelta
 from typing import Any
@@
 def create_access_token(sub: str, scopes: list[str] | None = None) -> str:
@@
     return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")

-
 def create_refresh_token(sub: str) -> str:
-    now = _utcnow()
-    payload = {
-        "iss": settings.jwt_iss,
-        "aud": settings.jwt_aud,
-        "iat": int(now.timestamp()),
-        "nbf": int(now.timestamp()),
-        "exp": int((now + timedelta(days=settings.refresh_token_days)).timestamp()),
-        "sub": sub,
-        "typ": "refresh",
-    }
-    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
+    """Issue a refresh token with unique jti for session tracking."""
+    now = _utcnow()
+    jti = jwt.utils.base64url_encode(jwt.utils.force_bytes(str(now.timestamp()))).decode()
+    payload = {
+        "iss": settings.jwt_iss,
+        "aud": settings.jwt_aud,
+        "iat": int(now.timestamp()),
+        "nbf": int(now.timestamp()),
+        "exp": int((now + timedelta(days=settings.refresh_token_days)).timestamp()),
+        "sub": sub,
+        "jti": jti,
+        "typ": "refresh",
+    }
+    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")

@@
 def require_user(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
@@
     except jwt.PyJWTError as e:
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from e

 # Alias for compatibility
 get_current_user = require_user
```

Note: In implementation, persist `jti` to `RefreshSession` on login and verify on refresh, then rotate (re-issue refresh token with new `jti`).

---

## 4) Auth API: login/refresh/logout scaffolds with sessions

File: `apps/api/app/api/v1/auth.py`

```diff
@@
 router = APIRouter(prefix="/auth", tags=["auth"])
@@
 @router.post("/login")
 async def login(body: LoginRequest) -> dict[str, str]:
-    """Password login (demo: credentials via settings, defaults for dev)."""
-    expected_user = settings.demo_username or "demo"
-    expected_pass = settings.demo_password or ("demo" + "123")  # not a real secret
-    if body.username == expected_user and body.password == expected_pass:
-        user_id = "123e4567-e89b-12d3-a456-426614174000"
-    else:
-        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
-    return {
-        "access_token": create_access_token(user_id),
-        "refresh_token": create_refresh_token(user_id),
-        "token_type": "bearer",
-    }
+    """Password login (demo fallback when user_mgmt_disabled)."""
+    if not settings.user_mgmt_enabled:
+        expected_user = settings.demo_username or "demo"
+        expected_pass = settings.demo_password or ("demo" + "123")
+        if body.username != expected_user or body.password != expected_pass:
+            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
+        user_id = "123e4567-e89b-12d3-a456-426614174000"
+        return {"access_token": create_access_token(user_id), "refresh_token": create_refresh_token(user_id), "token_type": "bearer"}
+
+    # TODO: Replace with DB lookup of User + password verification (argon2/bcrypt)
+    # user = await users_repo.get_by_email_or_username(body.username)
+    # if not user or not verify_password(body.password, user.password_hash):
+    #     raise HTTPException(status_code=401, detail="Invalid credentials")
+    # session = await sessions_repo.create_for_user(user.id, jti)
+    # return tokens with jti embedded in refresh token

@@
 @router.post("/refresh")
 async def refresh(body: RefreshRequest) -> dict[str, str]:
-    """Exchange a valid refresh token for a new access token."""
+    """Exchange a valid refresh token for a new access token (rotation planned)."""
@@
-    return {
--        "access_token": create_access_token(sub),
--        "refresh_token": body.refresh_token,
--        "token_type": "bearer",
--    }
+    # TODO: Verify jti against RefreshSession, ensure not revoked, rotate jti and return new refresh token
+    return {"access_token": create_access_token(sub), "refresh_token": body.refresh_token, "token_type": "bearer"}

@@
 @router.post("/logout")
 async def logout(user_id: str = Depends(get_current_user)) -> dict[str, str]:
-    # In a real app, you might invalidate the token in Redis
-    return {"message": "Logged out successfully"}
+    # TODO: Revoke current refresh session (by jti) if available
+    return {"message": "Logged out successfully"}
```

---

## 5) Entries API: enforce ownership on update/delete

File: `apps/api/app/api/v1/entries.py`

```diff
@@
 async def update_entry(
@@
     repo = EntryRepository(s)
+    # Ownership check (starter): ensure current user is the author
+    # TODO: Consider moving this to service/repository layer for reuse
+    existing = await repo.get_by_id(eid)
+    if not existing or existing.author_id != UUID(user_id):
+        raise HTTPException(status_code=403, detail="Forbidden")

@@
 async def delete_entry(
@@
     repo = EntryRepository(s)

+    # Ownership check (starter)
+    row = await repo.get_by_id(eid)
+    if not row or row.author_id != UUID(user_id):
+        raise HTTPException(status_code=403, detail="Forbidden")

     try:
         await repo.soft_delete(eid, expected_version)
         await s.commit()
```

Note: In a refined implementation, centralize ownership checks and return 404 instead of 403 to avoid leaking existence.

---

## 6) Frontend: refresh rotation support (already compatible)

File: `apps/web/src/services/api.ts`

```diff
@@
   private setTokens(tokens: AuthTokens) {
     localStorage.setItem('access_token', tokens.access_token);
-    if (tokens.refresh_token) {
-      localStorage.setItem('refresh_token', tokens.refresh_token);
-    }
+    // Store rotated refresh tokens when returned
+    if (tokens.refresh_token) localStorage.setItem('refresh_token', tokens.refresh_token);
   }
@@
   private async refreshToken(): Promise<void> {
     const refreshToken = localStorage.getItem('refresh_token');
     if (!refreshToken) return;
@@
       const tokens = await this.request<AuthTokens>(
         '/v1/auth/refresh',
@@
       );
       this.setTokens(tokens);
     } catch (_error) {
       this.clearTokens();
     }
   }
```

Optional (later): When refresh is moved to httpOnly cookies, remove storage/passing of `refresh_token` and rely on cookie.

---

## 7) JournalApp: remove demo auto-login when feature enabled

File: `apps/web/src/components/JournalApp.tsx`

```diff
@@
   useEffect(() => {
     const initializeApp = async () => {
       try {
         const authStatus = await api.checkAuthStatus();
 
-        if (!authStatus.authenticated) {
-          // Try demo login for development
-          await api.demoLogin();
-          const newAuthStatus = await api.checkAuthStatus();
-          setState((prev) => ({
-            ...prev,
-            authenticated: newAuthStatus.authenticated,
-            user: newAuthStatus.user,
-            loading: false,
-          }));
-        } else {
-          setState((prev) => ({
-            ...prev,
-            authenticated: authStatus.authenticated,
-            user: authStatus.user,
-            loading: false,
-          }));
-        }
+        setState((prev) => ({
+          ...prev,
+          authenticated: authStatus.authenticated,
+          user: authStatus.user,
+          loading: false,
+        }));
```

If demo login is still desired in dev, guard with an env/flag exposed from the backend (`/auth/config` or `settings.user_mgmt_enabled`).

---

## 8) Tests: unskip scaffolds incrementally

Files:
- `apps/api/tests/integration/test_auth_user_management_scaffold.py`
- `apps/api/tests/integration/test_permissions_scaffold.py`

Actions:
- As features land, remove `@pytest.mark.skip` and adapt assertions to real implementations.
- Add unit coverage for hashing, token issuance/verify, session repo logic.

---

## 9) Migration Backfill (Optional)

If existing entries use the demo UUID, choose one:
- Map demo UUID to a created `demo@local` user (dev only), or
- Keep demo data separate and only enforce ownership for new entries when user management is enabled.

---

## 10) Operational Notes

- Require `JOURNAL_JWT_SECRET` in production; rotate on compromise.
- Consider moving refresh to secure httpOnly cookie in Phase 3.
- Rate limit `/auth/login`, `/auth/refresh`.
- Add metrics and basic audit logs.

---

These diffs provide a safe starting point. Flesh out repositories/services, add migrations, and wire tests as the next concrete steps.

