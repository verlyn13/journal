"""Enhanced JWT middleware using EdDSA verification.

This middleware validates tokens using the integrated auth service with
proper EdDSA verification and security policy enforcement.
"""

from __future__ import annotations

import logging

from fastapi import HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis.asyncio import Redis

from app.config.token_rotation_config import SecurityPolicies
from app.infra.db import build_engine, sessionmaker_for
from app.infra.redis import get_redis_pool
from app.services.integrated_auth_service import IntegratedAuthService
from app.settings import settings


logger = logging.getLogger(__name__)

# Security scheme
bearer_scheme = HTTPBearer(auto_error=False)


class EnhancedJWTMiddleware:
    """Middleware for EdDSA JWT validation with security policies."""

    def __init__(self) -> None:
        """Initialize middleware with database and Redis connections."""
        self._session_maker = sessionmaker_for(build_engine())
        self._redis: Redis | None = None
        self._auth_service: IntegratedAuthService | None = None

    async def _get_auth_service(self) -> IntegratedAuthService:
        """Get or create auth service instance."""
        if self._auth_service is None:
            if self._redis is None:
                self._redis = get_redis_pool()

            # Create a session for this request
            async with self._session_maker() as session:
                self._auth_service = IntegratedAuthService(
                    session, self._redis, use_infisical=not settings.testing
                )

        return self._auth_service

    async def __call__(self, request: Request) -> dict | None:
        """Validate JWT token from request.

        Args:
            request: FastAPI request

        Returns:
            Validated claims if token is valid, None for public endpoints

        Raises:
            HTTPException: If token is invalid on protected endpoint
        """
        # Skip validation for public endpoints
        path = request.url.path
        if self._is_public_endpoint(path):
            return None

        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            # Check if endpoint requires authentication
            if self._requires_auth(path):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authorization required",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None

        # Validate Bearer format
        if not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization format",
                headers={"WWW-Authenticate": 'Bearer error="invalid_request"'},
            )

        token = auth_header[7:]  # Remove "Bearer " prefix

        # Validate token with integrated auth service
        auth_service = await self._get_auth_service()

        try:
            claims = await auth_service.verify_access_token(token)

            # Enforce security policies
            if SecurityPolicies.REQUIRE_AUDIENCE_VALIDATION and (
                not claims.get("aud") or settings.jwt_aud not in claims["aud"]
            ):
                raise ValueError("Invalid audience")

            if (
                SecurityPolicies.REQUIRE_ISSUER_VALIDATION
                and claims.get("iss") != settings.jwt_iss
            ):
                raise ValueError("Invalid issuer")

            # Check token type using payload 'type' (primary), supporting legacy aliases
            token_type = (
                claims.get("type") or claims.get("token_type") or claims.get("typ")
            )
            if token_type not in {"access", "m2m", "at+jwt"}:
                raise ValueError(f"Invalid token type: {token_type}")

            # For M2M tokens, validate environment
            if token_type in {"m2m", "at+jwt"}:
                token_env = claims.get("env")
                if token_env and token_env != settings.env:
                    raise ValueError(f"Token not valid for environment: {settings.env}")

            # Store claims in request state for downstream use
            request.state.user_id = claims.get("sub")
            request.state.token_claims = claims
            request.state.token_type = token_type

            return claims

        except HTTPException:
            raise
        except Exception as e:
            logger.warning("Token validation failed: %s", e)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={
                    "WWW-Authenticate": f'Bearer error="invalid_token", error_description="{e!s}"'
                },
            ) from e

    @staticmethod
    def _is_public_endpoint(path: str) -> bool:
        """Check if endpoint is public (no auth required).

        Args:
            path: Request path

        Returns:
            True if public endpoint
        """
        public_paths = [
            "/",
            "/health",
            "/metrics",
            "/.well-known/jwks.json",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/auth/csrf",
            "/api/v2/auth/login",
            "/api/v2/auth/refresh",
            "/api/v2/auth/csrf",
            "/api/v2/auth/m2m/token",
            "/docs",
            "/redoc",
            "/openapi.json",
        ]

        # Exact match
        if path in public_paths:
            return True

        # Prefix match for documentation
        return bool(path.startswith(("/docs/", "/redoc/")))

    @staticmethod
    def _requires_auth(path: str) -> bool:
        """Check if endpoint requires authentication.

        Args:
            path: Request path

        Returns:
            True if authentication is required
        """
        # API endpoints require auth by default
        if path.startswith("/api/"):
            # Except for auth endpoints themselves
            return "/auth/" not in path

        # Internal endpoints require auth
        return bool(path.startswith("/internal/"))


# Dependency for FastAPI routes
async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = bearer_scheme,
) -> str:
    """Get current authenticated user ID.

    Args:
        request: FastAPI request
        credentials: Bearer token credentials

    Returns:
        User ID from validated token

    Raises:
        HTTPException: If not authenticated
    """
    # Check if already validated by middleware
    if hasattr(request.state, "user_id") and request.state.user_id:
        return request.state.user_id

    # Otherwise validate now
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create middleware instance and validate
    middleware = EnhancedJWTMiddleware()

    # Mock request with authorization header
    mock_request = Request({
        "type": "http",
        "method": request.method,
        "url": str(request.url),
        "headers": [(b"authorization", f"Bearer {credentials.credentials}".encode())],
    })

    claims = await middleware(mock_request)

    if not claims or "sub" not in claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return claims["sub"]


async def get_current_user_optional(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = bearer_scheme,
) -> str | None:
    """Get current user ID if authenticated, None otherwise.

    Args:
        request: FastAPI request
        credentials: Bearer token credentials

    Returns:
        User ID if authenticated, None otherwise
    """
    try:
        return await get_current_user(request, credentials)
    except HTTPException:
        return None


async def require_scopes(
    required_scopes: list[str],
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = bearer_scheme,
) -> str:
    """Require specific scopes in the token.

    Args:
        required_scopes: List of required scopes
        request: FastAPI request
        credentials: Bearer token credentials

    Returns:
        User ID if authorized

    Raises:
        HTTPException: If not authorized or missing scopes
    """
    # Get user first
    user_id = await get_current_user(request, credentials)

    # Check scopes from request state or token
    if hasattr(request.state, "token_claims"):
        # Handle both 'scope' (OAuth2 standard) and 'scopes' (legacy) claims
        scope_claim = request.state.token_claims.get(
            "scope", request.state.token_claims.get("scopes", "")
        )
        if isinstance(scope_claim, list):
            token_scopes = scope_claim
        elif isinstance(scope_claim, str):
            token_scopes = scope_claim.split(" ") if scope_claim else []
        else:
            token_scopes = []
    else:
        # Need to decode token again to get scopes
        # This shouldn't happen if middleware ran
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token claims not available",
        )

    # Check if all required scopes are present
    missing_scopes = [s for s in required_scopes if s not in token_scopes]

    if missing_scopes:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Missing required scopes: {', '.join(missing_scopes)}",
            headers={
                "WWW-Authenticate": (
                    f'Bearer error="insufficient_scope", scope="{" ".join(required_scopes)}"'
                )
            },
        )

    return user_id
