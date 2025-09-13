"""Enhanced authentication endpoints using integrated auth service.

This module replaces the legacy HS256-based auth with EdDSA signing,
refresh token rotation with reuse detection, and session management.
"""

from __future__ import annotations

import logging

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.cookies_v2 import ensure_csrf_cookie_v2, require_csrf_v2
from app.infra.db import get_session
from app.infra.ip_extraction import get_client_ip
from app.infra.redis import get_redis
from app.infra.sa_models import User
from app.infra.security import verify_password
from app.middleware.enhanced_jwt_middleware import require_scopes
from app.services.integrated_auth_service import IntegratedAuthService
from app.services.m2m_token_service import M2MTokenService
from app.settings import settings


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth-enhanced"])


# Request/Response models
class LoginRequest(BaseModel):
    """Login request with username/email and password."""

    username: str = Field(..., min_length=1, description="Username or email")
    password: str = Field(..., min_length=1, description="Password")
    use_session_cookie: bool = Field(True, description="Use session cookies")


class RefreshRequest(BaseModel):
    """Refresh token request."""

    refresh_token: str | None = Field(None, description="Refresh token (if not in cookie)")


class M2MTokenRequest(BaseModel):
    """M2M token exchange request."""

    identity_token: str = Field(..., description="Machine Identity token")
    requested_scopes: list[str] | None = Field(None, description="Requested scopes")
    ttl_seconds: int | None = Field(None, ge=300, le=3600, description="TTL in seconds")


class TokenResponse(BaseModel):
    """Token response."""

    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    expires_in: int
    scope: str | None = None


class M2MTokenResponse(BaseModel):
    """M2M token response."""

    access_token: str
    token_type: str = "Bearer"
    expires_in: int
    expires_at: str
    scopes: list[str]
    service: str


class LogoutRequest(BaseModel):
    """Request body for logout endpoint."""

    revoke_all: bool = Field(default=False, description="Revoke all user sessions")
    environment: str | None = None


# Dependency to get integrated auth service
async def get_auth_service(
    session: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis),
) -> IntegratedAuthService:
    """Get integrated auth service."""
    return IntegratedAuthService(session, redis, use_infisical=not settings.testing)


# Dependency to get M2M token service
async def get_m2m_service(
    session: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis),
) -> M2MTokenService:
    """Get M2M token service."""
    from app.infra.secrets import InfisicalSecretsClient

    if settings.testing:
        return M2MTokenService(session, redis)

    infisical_client = InfisicalSecretsClient.from_env(redis)
    return M2MTokenService(session, redis, infisical_client)


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    response: Response,
    body: LoginRequest,
    session: AsyncSession = Depends(get_session),
    auth_service: IntegratedAuthService = Depends(get_auth_service),
) -> TokenResponse:
    """Login with username/email and password.

    Uses EdDSA signing and creates session cookies if enabled.
    """
    # Find user by username or email
    result = await session.execute(
        select(User).where((User.username == body.username) | (User.email == body.username))
    )
    user = result.scalar_one_or_none()

    if not user:
        # Don't reveal whether user exists
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Verify password
    if not verify_password(user.password_hash, body.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    # Perform login with integrated service
    auth_result = await auth_service.login(
        user_id=user.id,
        request=request,
        response=response,
        use_session_cookie=body.use_session_cookie,
        scopes=["api.read", "api.write"],  # Default scopes
    )

    return TokenResponse(**auth_result)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    body: RefreshRequest | None = None,
    auth_service: IntegratedAuthService = Depends(get_auth_service),
) -> TokenResponse:
    """Refresh access token using refresh token.

    Implements rotation with reuse detection. On reuse, all sessions are revoked.
    """
    # Get refresh token from cookie or body
    refresh_token = None

    if settings.auth_cookie_refresh:
        # CSRF protection for cookie-based refresh (v2-scoped cookie)
        require_csrf_v2(request)
        refresh_token = request.cookies.get(settings.refresh_cookie_name)

    if not refresh_token and body:
        refresh_token = body.refresh_token

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
        )

    # Perform refresh with integrated service
    try:
        auth_result = await auth_service.refresh(
            refresh_token=refresh_token,
            request=request,
            response=response,
        )
        return TokenResponse(**auth_result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Refresh failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from e


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    body: LogoutRequest | None = None,
    session: AsyncSession = Depends(get_session),
    auth_service: IntegratedAuthService = Depends(get_auth_service),
) -> dict[str, str]:
    """Logout and optionally revoke all sessions.

    Args:
        body: Optional request body with revoke_all flag
    """
    # Get user from access token
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization required",
        )

    token = auth_header[7:]  # Remove "Bearer " prefix

    try:
        # Verify token and get user ID
        claims = await auth_service.verify_access_token(token)
        user_id = UUID(claims["sub"])

        # Extract revoke_all from body if provided
        revoke_all = body.revoke_all if body else False

        # Perform logout
        await auth_service.logout(
            user_id=user_id,
            request=request,
            response=response,
            revoke_all=revoke_all,
        )

        return {"message": "Logged out successfully"}

    except Exception as e:
        logger.error("Logout failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed",
        ) from e


@router.get("/csrf")
async def get_csrf_token(request: Request, response: Response) -> dict[str, str]:
    """Get CSRF token and ensure cookie is set.

    Used when cookie-based refresh is enabled.
    """
    if not settings.auth_cookie_refresh:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CSRF not required (cookie refresh disabled)",
        )

    token = ensure_csrf_cookie_v2(response, request)
    return {"csrf_token": token}


# Also support POST /verify for clients using POST
@router.post("/verify")
async def verify_token_post(
    request: Request,
    auth_service: IntegratedAuthService = Depends(get_auth_service),
) -> dict[str, Any]:
    return await verify_token(request, auth_service)


@router.post("/m2m/token", response_model=M2MTokenResponse)
async def exchange_m2m_token(
    body: M2MTokenRequest,
    request: Request,
    m2m_service: M2MTokenService = Depends(get_m2m_service),
) -> M2MTokenResponse:
    """Exchange Machine Identity token for M2M JWT.

    Used for service-to-service authentication.
    """
    try:
        # Extract client IP safely (handles trusted proxies)
        ip_address = get_client_ip(request)

        # Fallback for tests that only provide X-Forwarded-For
        if not ip_address and settings.testing and "X-Forwarded-For" in request.headers:
            ip_address = request.headers["X-Forwarded-For"].split(",")[0].strip()

        # Convert TTL to timedelta if provided
        from datetime import timedelta

        ttl = timedelta(seconds=body.ttl_seconds) if body.ttl_seconds else None

        # Exchange identity for token
        token, expiration = await m2m_service.exchange_identity_for_token(
            identity_token=body.identity_token,
            requested_scopes=body.requested_scopes,
            ttl=ttl,
            ip_address=ip_address,
        )

        # Parse token to get claims for response
        import jwt

        claims = jwt.decode(token, options={"verify_signature": False})

        return M2MTokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=body.ttl_seconds or 1800,
            expires_at=expiration.isoformat(),
            scopes=claims.get("scopes", []),
            service=claims.get("sub", "").replace("svc:", ""),
        )

    except ValueError as e:
        # Invalid IP or scopes → treat as forbidden
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e
    except Exception as e:
        logger.error("M2M token exchange failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token exchange failed",
        ) from e


@router.post("/m2m/validate")
async def validate_m2m_token(
    token: str,
    required_scope: str | None = None,
    required_env: str | None = None,
    m2m_service: M2MTokenService = Depends(get_m2m_service),
) -> dict[str, Any]:
    """Validate an M2M token.

    Args:
        token: M2M token to validate
        required_scope: Optional required scope
        required_env: Optional required environment

    Returns:
        Token claims if valid
    """
    try:
        claims = await m2m_service.validate_m2m_token(
            token=token,
            required_scope=required_scope,
            required_env=required_env,
        )

        return {
            "valid": True,
            "claims": claims,
        }

    except ValueError as e:
        return {
            "valid": False,
            "error": str(e),
        }
    except Exception as e:
        logger.error("M2M validation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Validation failed",
        ) from e


@router.post("/m2m/revoke")
async def revoke_m2m_token(
    token_id: str | None = None,
    service_name: str | None = None,
    m2m_service: M2MTokenService = Depends(get_m2m_service),
) -> dict[str, Any]:
    """Revoke M2M token(s).

    Args:
        token_id: Specific token ID to revoke
        service_name: Revoke all tokens for a service

    Returns:
        Revocation result
    """
    if not token_id and not service_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either token_id or service_name required",
        )

    try:
        if token_id:
            await m2m_service.revoke_m2m_token(token_id)
            return {"revoked": 1, "type": "token"}

        if service_name:
            count = await m2m_service.revoke_all_service_tokens(service_name)
            return {"revoked": count, "type": "service"}

        # Should never reach here due to validation above
        return {"revoked": 0, "type": "none"}

    except Exception as e:
        logger.error("M2M revocation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Revocation failed",
        ) from e


@router.get("/verify")
async def verify_token(
    request: Request,
    auth_service: IntegratedAuthService = Depends(get_auth_service),
) -> dict[str, Any]:
    """Verify current access token.

    Returns token claims if valid.
    """
    # Get token from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header[7:]

    # Verify with integrated service
    claims = await auth_service.verify_access_token(token)

    # Parse scopes from OAuth2 standard "scope" claim (space-delimited string)
    scope_claim = claims.get("scope", "")
    scopes = scope_claim.split() if scope_claim else []

    return {
        "valid": True,
        "user_id": claims["sub"],
        "issued_at": claims["iat"],
        "expires_at": claims["exp"],
        "scopes": scopes,
        "claims": claims,  # Include full claims for debugging
    }


@router.get("/protected")
async def protected_example(
    request: Request,
) -> dict[str, str]:
    """Example protected endpoint requiring api.read scope.

    Demonstrates require_scopes helper for per-route authorization.
    """
    # Enforce required scopes
    await require_scopes(["api.read"], request)
    return {"status": "ok"}


@router.get("/health")
async def v2_auth_health() -> dict[str, str]:
    """Lightweight v2 auth health endpoint."""
    return {"status": "ok"}
