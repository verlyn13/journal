"""JWT authentication middleware for FastAPI."""

from __future__ import annotations

import json
import logging
import time

from typing import Any

from fastapi import HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.domain.auth.jwt_service import JWTService
from app.domain.auth.token_validator import TokenValidator
from app.infra.db import get_session
from app.infra.redis import get_redis_client
from app.settings import settings


logger = logging.getLogger(__name__)

# Security scheme for OpenAPI
bearer_scheme = HTTPBearer(auto_error=False)


class JWTMiddleware:
    """Middleware for JWT authentication and authorization."""

    def __init__(
        self,
        jwt_service: JWTService | None = None,
        token_validator: TokenValidator | None = None,
        require_auth: bool = True,
        required_scopes: list[str] | None = None,
        allow_expired_for_refresh: bool = False,
        expected_token_type: str | None = None,
    ) -> None:
        """Initialize JWT middleware.

        Args:
            jwt_service: Optional JWT service instance
            token_validator: Optional token validator instance
            require_auth: Whether authentication is required
            required_scopes: Optional list of required scopes
            allow_expired_for_refresh: Allow expired tokens for refresh endpoint
            expected_token_type: Expected token type (e.g., 'access', 'refresh')
        """
        self.jwt_service = jwt_service
        self.token_validator = token_validator
        self.require_auth = require_auth
        self.required_scopes = required_scopes or []
        self.allow_expired_for_refresh = allow_expired_for_refresh
        self.expected_token_type = expected_token_type

    async def __call__(self, request: Request) -> dict[str, Any] | None:
        """Process JWT authentication for a request.

        Args:
            request: FastAPI request object

        Returns:
            Validated token claims or None

        Raises:
            HTTPException: If authentication fails
        """
        # Extract token from Authorization header
        token = await self._extract_token(request)

        if not token:
            if self.require_auth:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing authentication token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None

        # Get services if not injected
        if not self.jwt_service or not self.token_validator:
            async with get_session() as session:
                redis = get_redis_client()
                self.jwt_service = JWTService(session, redis)
                self.token_validator = TokenValidator(session, redis)

        try:
            # Measure verification time
            start_time = time.perf_counter()

            # Verify JWT
            claims = await self.jwt_service.verify_jwt(
                token,
                expected_type=self.expected_token_type or "access",
                expected_audience=settings.jwt_aud,
            )

            # Validate claims
            validated_claims = await self.token_validator.validate_claims(
                claims,
                required_claims=["sub", "type", "exp"],
                validate_user=claims.get("type") != "m2m",
            )

            # Check required scopes
            if self.required_scopes and not self.token_validator.check_all_scopes(validated_claims, self.required_scopes):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient scopes. Required: {self.required_scopes}",
                )

            # Log verification time
            verification_time = (time.perf_counter() - start_time) * 1000
            if verification_time > 10:  # Log slow verifications
                logger.warning("Slow JWT verification: %.2fms", verification_time)

            # Store claims in request state
            request.state.jwt_claims = validated_claims
            request.state.user_id = validated_claims.get("user_id")
            request.state.token_type = validated_claims.get("type")

            return validated_claims

        except ValueError as e:
            # Handle expired token for refresh endpoint
            if self.allow_expired_for_refresh and "expired" in str(e).lower():
                # Still decode but mark as expired
                try:
                    # Decode without verification for refresh
                    parts = token.split(".")
                    if len(parts) == 3:
                        import base64  # noqa: PLC0415
                        import json  # noqa: PLC0415

                        payload = parts[1]
                        # Add padding if needed
                        padding = 4 - (len(payload) % 4)
                        if padding != 4:
                            payload += "=" * padding

                        claims = json.loads(base64.urlsafe_b64decode(payload))
                        claims["expired"] = True
                        request.state.jwt_claims = claims
                        return claims
                except (KeyError, ValueError):  # JSONDecodeError ⊂ ValueError
                    pass  # Fallback if manual decode fails

            # Authentication failed
            logger.debug("JWT verification failed: %s", e)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception:
            logger.exception("JWT middleware error")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication service error",
            )

    @staticmethod
    async def _extract_token(request: Request) -> str | None:
        """Extract JWT token from request.

        Args:
            request: FastAPI request

        Returns:
            Token string or None
        """
        # Check Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header[7:]

        # Check cookie (for session tokens)
        session_cookie = request.cookies.get("session_token")
        if session_cookie:
            return session_cookie

        # Check query parameter (for websocket connections)
        token_param = request.query_params.get("token")
        if token_param:
            return token_param

        return None


class RequireAuth:
    """Dependency for requiring authentication."""

    def __init__(
        self,
        scopes: list[str] | None = None,
        allow_expired: bool = False,
        token_types: list[str] | None = None,
    ) -> None:
        """Initialize auth requirement.

        Args:
            scopes: Required scopes
            allow_expired: Allow expired tokens (for refresh)
            token_types: Allowed token types
        """
        self.scopes = scopes or []
        self.allow_expired = allow_expired
        self.token_types = token_types or ["access", "session"]

    async def __call__(
        self,
        request: Request,
        credentials: HTTPAuthorizationCredentials | None = None,
    ) -> dict[str, Any]:
        """Validate authentication for a request.

        Args:
            request: FastAPI request
            credentials: Optional bearer credentials

        Returns:
            Validated claims

        Raises:
            HTTPException: If authentication fails
        """
        # Get token from credentials or request
        token = None
        if credentials and credentials.credentials:
            token = credentials.credentials
        else:
            token = await JWTMiddleware._extract_token(request)

        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Use middleware for validation; pass expected_type when unambiguous
        expected_type = self.token_types[0] if len(self.token_types) == 1 else None
        middleware = JWTMiddleware(
            require_auth=True,
            required_scopes=self.scopes,
            allow_expired_for_refresh=self.allow_expired,
            expected_token_type=expected_type,
        )

        claims = await middleware(request)

        if not claims:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check token type
        if self.token_types and claims.get("type") not in self.token_types:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Invalid token type. Expected: {self.token_types}",
            )

        return claims


class OptionalAuth:
    """Dependency for optional authentication."""

    def __init__(self, scopes: list[str] | None = None) -> None:
        """Initialize optional auth.

        Args:
            scopes: Required scopes if authenticated
        """
        self.scopes = scopes or []

    async def __call__(
        self,
        request: Request,
        credentials: HTTPAuthorizationCredentials | None = None,
    ) -> dict[str, Any] | None:
        """Optionally validate authentication.

        Args:
            request: FastAPI request
            credentials: Optional bearer credentials

        Returns:
            Validated claims or None
        """
        # Get token from credentials or request
        token = None
        if credentials and credentials.credentials:
            token = credentials.credentials
        else:
            token = await JWTMiddleware._extract_token(request)

        if not token:
            return None

        try:
            # Use middleware for validation
            middleware = JWTMiddleware(
                require_auth=False,
                required_scopes=self.scopes,
            )

            return await middleware(request)
        except HTTPException:
            # Authentication failed but it's optional
            return None


class RequireScopes:
    """Dependency for requiring specific scopes."""

    def __init__(self, *scopes: str, match_all: bool = True) -> None:
        """Initialize scope requirement.

        Args:
            scopes: Required scopes
            match_all: Whether all scopes are required (vs any)
        """
        self.scopes = list(scopes)
        self.match_all = match_all

    async def __call__(self, request: Request) -> dict[str, Any]:
        """Check scopes for authenticated request.

        Args:
            request: FastAPI request

        Returns:
            Validated claims

        Raises:
            HTTPException: If scopes are insufficient
        """
        # Get claims from request state
        claims = getattr(request.state, "jwt_claims", None)

        if not claims:
            # Not authenticated yet, run auth first
            auth = RequireAuth(scopes=self.scopes)
            claims = await auth(request)

        # Check scopes
        async with get_session() as session:
            redis = get_redis_client()
            validator = TokenValidator(session, redis)

            if self.match_all:
                has_scopes = validator.check_all_scopes(claims, self.scopes)
            else:
                has_scopes = validator.check_any_scope(claims, self.scopes)

            if not has_scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient scopes. Required: {self.scopes}",
                )

        return claims


# Convenience dependencies
require_auth = RequireAuth()
optional_auth = OptionalAuth()
require_admin = RequireAuth(scopes=["admin:system"])

# Scope dependencies
require_read = RequireScopes("entries:read")
require_write = RequireScopes("entries:write")
require_delete = RequireScopes("entries:delete")
