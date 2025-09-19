"""Enhanced authentication dependencies with EdDSA JWT support."""

from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.auth_service import AuthService
from app.infra.auth import get_current_user as legacy_get_current_user
from app.infra.db import get_session
from app.infra.redis import get_redis_client
from app.infra.secrets.enhanced_infisical_client import EnhancedInfisicalClient
from app.settings import settings


logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)


async def get_auth_service_dependency(
    session: AsyncSession = Depends(get_session),
) -> AuthService:
    """Get authentication service dependency.

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
            infisical_client = EnhancedInfisicalClient()
        except Exception as e:
            logger.warning("Failed to initialize Infisical client: %s", e)

    auth_service = AuthService(session, redis, infisical_client)

    # Initialize on first use (with caching to avoid repeated initialization)
    try:
        await auth_service.initialize()
    except Exception as e:
        logger.warning("Auth service initialization warning: %s", e)

    return auth_service


async def require_user_enhanced(
    request: Request,
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    auth_service: AuthService = Depends(get_auth_service_dependency),
) -> str:
    """Enhanced user authentication supporting both EdDSA and legacy tokens.

    Tries the new JWT service first, falls back to legacy auth for compatibility.

    Args:
        request: FastAPI request object
        creds: Bearer token credentials
        auth_service: Authentication service

    Returns:
        User ID string

    Raises:
        HTTPException: If authentication fails
    """
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing auth",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = creds.credentials

    # Try new JWT service first
    try:
        claims = await auth_service.verify_token(
            token,
            expected_type="access",
        )

        # Extract user ID
        sub = claims.get("sub")
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
            )

        # Store claims in request state for potential use by other middleware
        request.state.jwt_claims = claims
        request.state.user_id = sub
        request.state.token_type = claims.get("type", "access")
        request.state.scopes = claims.get("scope", "").split() if claims.get("scope") else []

        logger.debug("Authenticated user with new JWT service: %s", sub)
        return sub

    except Exception as e:
        logger.debug("New JWT service verification failed: %s", e)

        # Fall back to legacy authentication
        try:
            user_id = legacy_get_current_user(creds)
            logger.debug("Authenticated user with legacy service: %s", user_id)

            # Store minimal state for legacy tokens
            request.state.jwt_claims = {"sub": user_id, "type": "access"}
            request.state.user_id = user_id
            request.state.token_type = "access"
            request.state.scopes = []

            return user_id

        except Exception as legacy_error:
            logger.warning(
                "Both new and legacy JWT verification failed: new=%s, legacy=%s", e, legacy_error
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
            ) from legacy_error


async def require_user_uuid(
    request: Request,
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    auth_service: AuthService = Depends(get_auth_service_dependency),
) -> UUID:
    """Enhanced user authentication returning UUID.

    Args:
        request: FastAPI request object
        creds: Bearer token credentials
        auth_service: Authentication service

    Returns:
        User ID as UUID

    Raises:
        HTTPException: If authentication fails
    """
    user_id_str = await require_user_enhanced(request, creds, auth_service)
    try:
        return UUID(user_id_str)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        ) from e


async def require_scopes(*required_scopes: str) -> Any:
    """Dependency factory for requiring specific scopes.

    Args:
        required_scopes: Required scopes for access

    Returns:
        Dependency function
    """

    async def check_scopes(
        request: Request,
        user_id: str = Depends(require_user_enhanced),
    ) -> dict[str, Any]:
        """Check if user has required scopes.

        Args:
            request: FastAPI request
            user_id: Authenticated user ID

        Returns:
            JWT claims

        Raises:
            HTTPException: If scopes are insufficient
        """
        # Get claims from request state
        claims = getattr(request.state, "jwt_claims", {})
        user_scopes = getattr(request.state, "scopes", [])

        # Check if all required scopes are present
        missing_scopes = [scope for scope in required_scopes if scope not in user_scopes]
        if missing_scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Insufficient scopes. Required: {list(required_scopes)}, "
                    f"Missing: {missing_scopes}"
                ),
            )

        return claims

    return check_scopes


async def optional_user(
    request: Request,
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    auth_service: AuthService = Depends(get_auth_service_dependency),
) -> str | None:
    """Optional user authentication.

    Args:
        request: FastAPI request object
        creds: Bearer token credentials
        auth_service: Authentication service

    Returns:
        User ID string or None if not authenticated
    """
    if creds is None:
        return None

    try:
        return await require_user_enhanced(request, creds, auth_service)
    except HTTPException:
        # Authentication failed but it's optional
        return None


# Convenience aliases for backward compatibility
require_user = require_user_enhanced
get_current_user = require_user_enhanced
