from __future__ import annotations

from datetime import UTC, datetime
import logging
import os
from typing import Any
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
import jwt
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.auth_service import AuthService
from app.infra.auth import (
    create_access_token,
    create_refresh_token,
    create_verify_token,
    get_current_user,
)
from app.infra.auth_counters import login_fail, login_success, refresh_rotated, session_revoked
from app.infra.cookies import (
    clear_refresh_cookie,
    ensure_csrf_cookie,
    require_csrf,
    set_refresh_cookie,
)
from app.infra.db import get_session
from app.infra.ratelimit import allow
from app.infra.redis import get_redis_client
from app.infra.sa_models import User
from app.infra.secrets.enhanced_infisical_client import EnhancedInfisicalClient
from app.infra.security import hash_password, verify_password
from app.infra.sessions import (
    create_session as create_user_session,
    get_session_by_refresh_id,
    revoke_session,
    touch_session,
)
from app.settings import settings


router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


async def get_auth_service(
    session: AsyncSession = Depends(get_session),
) -> AuthService:
    """Get authentication service instance.

    Args:
        session: Database session

    Returns:
        Configured AuthService instance
    """
    redis = get_redis_client()

    # Initialize Infisical client if in production
    infisical_client = None
    if settings.infisical_enabled and settings.env == "production":
        try:
            # Get token from environment or configuration
            token = os.getenv("INFISICAL_TOKEN", "")
            if token:
                infisical_client = EnhancedInfisicalClient(
                    base_url=settings.infisical_server_url,
                    token=token,
                    redis=redis,
                    cache_ttl=settings.infisical_cache_ttl,
                    timeout=int(settings.infisical_timeout),
                    max_retries=settings.infisical_max_retries,
                )
        except Exception as e:
            # Log warning but continue with simple key manager
            logger.warning("Failed to initialize Infisical client: %s", e)

    auth_service = AuthService(session, redis, infisical_client)

    # Initialize on first use
    try:
        await auth_service.initialize()
    except Exception as e:
        logger.warning("Auth service initialization warning: %s", e)

    return auth_service


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    username: str | None = None


class VerifyEmailRequest(BaseModel):
    token: str


class LoginRequest(BaseModel):
    email: str | None = None
    username: str | None = None
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/login")
async def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    s: AsyncSession = Depends(get_session),
    auth_service: AuthService = Depends(get_auth_service),
) -> dict[str, str]:
    """Login endpoint supports two modes: demo (flag off) and real (flag on).

    Now uses enhanced JWT service with EdDSA signing for improved security.
    """
    if not settings.user_mgmt_enabled:
        # Demo login with new JWT service
        expected_user = settings.demo_username or "demo"
        expected_pass = settings.demo_password or ("demo" + "123")  # not a real secret
        if (body.username or body.email) == expected_user and body.password == expected_pass:
            demo_user_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        else:
            login_fail("invalid_credentials")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
            )

        # Use new JWT service for demo mode
        try:
            access_token = await auth_service.create_access_token(
                user_id=demo_user_id,
                scopes=["entries:read", "entries:write"],
            )
            refresh_token = await auth_service.create_refresh_token(
                user_id=demo_user_id,
            )
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
            }
        except Exception as e:
            # Fallback to legacy tokens if new service fails
            logger.warning("New JWT service failed, using legacy: %s", e)
            return {
                "access_token": create_access_token(str(demo_user_id)),
                "refresh_token": create_refresh_token(str(demo_user_id)),
                "token_type": "bearer",
            }

    # Real login (flag on)
    key = f"login:{(body.email or body.username or '').lower()}"
    if not allow(key, settings.rate_limit_max_attempts, settings.rate_limit_window_seconds):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Please try again later"
        )

    stmt = select(User).where(User.email == (body.email or ""))
    res = await s.execute(stmt)
    user = res.scalars().first()
    ok = bool(
        user
        and user.is_active
        and user.password_hash
        and verify_password(user.password_hash, body.password)
        and (user.is_verified or not settings.auth_require_email_verify)
    )
    if not ok or user is None:  # Type guard: after this check, user is guaranteed non-None
        reason = (
            "not_verified"
            if user and not user.is_verified and settings.auth_require_email_verify
            else "invalid_credentials"
        )
        login_fail(reason)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # At this point, user is guaranteed to be non-None due to the check above
    # Create server-side session and include rid in refresh
    ua = request.headers.get("user-agent")
    ip = request.client.host if request.client else None
    sess = await create_user_session(s, user.id, ua, ip)

    # Use new JWT service for token creation
    try:
        access = await auth_service.create_access_token(
            user_id=user.id,
            scopes=user.roles or ["entries:read", "entries:write"],
        )
        refresh = await auth_service.create_refresh_token(
            user_id=user.id,
            refresh_id=str(sess.refresh_id),
        )
    except Exception as e:
        # Fallback to legacy tokens
        logger.warning("New JWT service failed for real login, using legacy: %s", e)
        access = create_access_token(str(user.id), scopes=user.roles)
        refresh = create_refresh_token(str(user.id), refresh_id=str(sess.refresh_id))

    login_success("password")
    if settings.auth_cookie_refresh:
        max_age = settings.refresh_token_days * 24 * 60 * 60
        set_refresh_cookie(response, refresh, max_age)
        ensure_csrf_cookie(response, request)
        return {"access_token": access, "token_type": "bearer"}
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


@router.post("/register", status_code=202)
async def register(
    body: RegisterRequest,
    request: Request,
    s: AsyncSession = Depends(get_session),
    auth_service: AuthService = Depends(get_auth_service),
) -> dict[str, str | None]:
    if not settings.user_mgmt_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    key = f"register:{request.client.host if request.client else 'unknown'}"
    if not allow(key, settings.rate_limit_max_attempts, settings.rate_limit_window_seconds):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Please try again later"
        )

    # Do not enumerate existing emails
    res = await s.execute(select(User).where(User.email == body.email))
    existing = res.scalars().first()
    if existing:
        return {
            "message": "If this address can register, a verification will be sent.",
            "dev_verify_token": None,
        }

    user = User(
        email=body.email, username=body.username, password_hash=hash_password(body.password)
    )
    s.add(user)
    await s.commit()
    await s.refresh(user)

    # Use new JWT service for verification token
    try:
        token = await auth_service.create_verify_token(user_id=user.id)
    except Exception as e:
        # Fallback to legacy token
        logger.warning("New JWT service failed for verify token, using legacy: %s", e)
        token = create_verify_token(str(user.id))

    return {
        "message": "Verification required",
        "dev_verify_token": token if settings.testing else None,
    }


@router.post("/verify-email", status_code=204, response_class=Response)
async def verify_email(
    body: VerifyEmailRequest, s: AsyncSession = Depends(get_session)
) -> Response:
    if not settings.user_mgmt_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    try:
        decoded = jwt.decode(
            body.token,
            settings.jwt_secret,
            algorithms=["HS256"],
            audience=settings.jwt_aud,
            options={"require": ["exp", "iat"]},
        )
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token") from e

    if decoded.get("typ") != "verify":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type")

    uid = decoded.get("sub")
    if not uid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    res = await s.execute(select(User).where(User.id == uuid.UUID(uid)))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")

    user.is_verified = True
    await s.merge(user)
    await s.commit()
    return Response(status_code=204)


@router.post("/demo")
async def demo_login(
    auth_service: AuthService = Depends(get_auth_service),
) -> dict[str, str]:
    """Return tokens for a fixed demo user (no credentials).

    Now uses enhanced JWT service with EdDSA signing.
    """
    demo_user_id = UUID("123e4567-e89b-12d3-a456-426614174000")

    try:
        access_token = await auth_service.create_access_token(
            user_id=demo_user_id,
            scopes=["entries:read", "entries:write"],
        )
        refresh_token = await auth_service.create_refresh_token(
            user_id=demo_user_id,
        )
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    except Exception as e:
        # Fallback to legacy tokens
        logger.warning("New JWT service failed for demo, using legacy: %s", e)
        user_id = str(demo_user_id)
        return {
            "access_token": create_access_token(user_id),
            "refresh_token": create_refresh_token(user_id),
            "token_type": "bearer",
        }


@router.get("/csrf")
async def get_csrf(request: Request, response: Response) -> dict[str, str]:
    """Return a CSRF token and ensure CSRF cookie is set.

    When cookie-based refresh is enabled, the frontend may call this to warm
    the CSRF cookie and receive the token to echo in `X-CSRF-Token`.
    """
    token = ensure_csrf_cookie(response, request)
    return {"csrfToken": token}


@router.post("/refresh")
async def refresh(
    request: Request,
    response: Response,
    body: RefreshRequest | None = None,
    s: AsyncSession = Depends(get_session),
    auth_service: AuthService = Depends(get_auth_service),
) -> dict[str, str]:
    """Exchange a valid refresh token for a new access token.

    Now supports both new EdDSA tokens and legacy HMAC tokens for backward compatibility.
    """
    # Extract token from cookie or body
    token_src = None
    if settings.auth_cookie_refresh:
        token_src = request.cookies.get(settings.refresh_cookie_name)
    if not token_src:
        if not body:
            raise HTTPException(status_code=401, detail="Invalid token")
        token_src = body.refresh_token

    # Try to verify with new JWT service first
    try:
        claims = await auth_service.verify_token(
            token_src,
            expected_type="refresh",
        )

        # Extract user info from new format
        sub = claims.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_id = UUID(sub)
        rid = claims.get("rid")

        # Handle new JWT service refresh logic
        if not settings.user_mgmt_enabled:
            # Demo mode - generate new tokens
            try:
                access_new = await auth_service.create_access_token(
                    user_id=user_id,
                    scopes=["entries:read", "entries:write"],
                )
                refresh_new = await auth_service.create_refresh_token(
                    user_id=user_id,
                    refresh_id=rid,
                )
                return {
                    "access_token": access_new,
                    "refresh_token": refresh_new,
                    "token_type": "bearer",
                }
            except Exception as e:
                # Fall through to legacy handling
                logger.warning("New JWT refresh failed, trying legacy: %s", e)
                raise ValueError("New service failed") from e

    except (ValueError, HTTPException):
        # New service failed, try legacy JWT verification
        try:
            decoded = jwt.decode(
                token_src,
                settings.jwt_secret,
                algorithms=["HS256"],
                audience=settings.jwt_aud,
                options={"require": ["exp", "iat"]},
            )
        except jwt.PyJWTError as e:
            raise HTTPException(status_code=401, detail="Invalid token") from e

        if decoded.get("typ") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        sub = decoded.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid token")

    # If feature disabled, return legacy behavior (no rotation)
    if not settings.user_mgmt_enabled:
        return {
            "access_token": create_access_token(sub),
            "refresh_token": token_src,
            "token_type": "bearer",
        }

    rid = decoded.get("rid")
    if not rid:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Look up session by refresh_id
    sess = await get_session_by_refresh_id(s, uuid.UUID(rid))
    if not sess or sess.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Rotate rid
    new_rid = uuid.uuid4()
    sess.refresh_id = new_rid
    await touch_session(s, sess)
    refresh_rotated()

    access_new = create_access_token(sub)
    refresh_new = create_refresh_token(sub, refresh_id=str(new_rid))
    if settings.auth_cookie_refresh:
        max_age = settings.refresh_token_days * 24 * 60 * 60
        set_refresh_cookie(response, refresh_new, max_age)
        return {"access_token": access_new, "token_type": "bearer"}
    return {"access_token": access_new, "refresh_token": refresh_new, "token_type": "bearer"}


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)) -> dict[str, str]:
    demo_uuid = "123e4567-e89b-12d3-a456-426614174000"
    return {
        "id": user_id,
        "username": "demo" if user_id == demo_uuid else f"user_{user_id[:8]}",
        "email": "demo@example.com" if user_id == demo_uuid else f"user_{user_id[:8]}@example.com",
    }


@router.post("/logout", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    body: RefreshRequest | None = None,
    user_id: str = Depends(get_current_user),
    s: AsyncSession = Depends(get_session),
) -> Response | dict[str, str]:
    # Demo mode: preserve legacy behavior
    if not settings.user_mgmt_enabled:
        return {"message": "Logged out successfully"}

    # Flag on: revoke session by provided refresh token (cookie or body)
    token_src = None
    if settings.auth_cookie_refresh:
        require_csrf(request)
        token_src = request.cookies.get(settings.refresh_cookie_name)
    if not token_src:
        if not body:
            raise HTTPException(status_code=400, detail="Missing refresh_token")
        token_src = body.refresh_token
    try:
        decoded = jwt.decode(
            token_src,
            settings.jwt_secret,
            algorithms=["HS256"],
            audience=settings.jwt_aud,
            options={"require": ["exp", "iat"]},
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if decoded.get("typ") != "refresh" or not decoded.get("rid"):
        raise HTTPException(status_code=401, detail="Invalid token type")
    sess = await get_session_by_refresh_id(s, uuid.UUID(decoded["rid"]))
    if sess:
        await revoke_session(s, sess)
        session_revoked()
    if settings.auth_cookie_refresh:
        clear_refresh_cookie(response)
    return Response(status_code=204)


@router.get("/jwks")
async def get_jwks(
    auth_service: AuthService = Depends(get_auth_service),
) -> dict[str, Any]:
    """Get JSON Web Key Set for token verification.

    Returns public keys used to verify JWT tokens.
    Used by clients and services for token validation.
    """
    try:
        return await auth_service.get_jwks()
    except Exception as e:
        logger.exception("Failed to get JWKS")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve verification keys",
        ) from e


@router.get("/health")
async def auth_health(
    auth_service: AuthService = Depends(get_auth_service),
) -> dict[str, Any]:
    """Get authentication system health status.

    Returns health information about JWT keys, services, and configuration.
    """
    try:
        return await auth_service.get_system_health()
    except Exception as e:
        logger.exception("Auth health check failed")
        return {
            "healthy": False,
            "error": str(e),
            "timestamp": datetime.now(UTC).isoformat(),
        }
