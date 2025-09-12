"""Token validation and claims processing service."""

from __future__ import annotations

import logging

from datetime import UTC, datetime
from typing import Any, Literal
from uuid import UUID

from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.sa_models import User


logger = logging.getLogger(__name__)

# Scope categories
ScopeCategory = Literal["read", "write", "admin", "service"]


class TokenValidator:
    """Advanced token validation with claims processing."""

    # Standard scopes
    STANDARD_SCOPES = {
        # User scopes
        "entries:read": "Read journal entries",
        "entries:write": "Create and edit entries",
        "entries:delete": "Delete entries",
        "profile:read": "Read user profile",
        "profile:write": "Update user profile",

        # Admin scopes
        "admin:users": "Manage users",
        "admin:system": "System administration",
        "admin:audit": "Access audit logs",

        # Service scopes
        "service:embedding": "Embedding service access",
        "service:search": "Search service access",
        "service:export": "Export service access",
    }

    def __init__(self, session: AsyncSession, redis: Redis) -> None:
        """Initialize token validator.

        Args:
            session: Database session
            redis: Redis client for caching
        """
        self.session = session
        self.redis = redis

    async def validate_claims(
        self,
        claims: dict[str, Any],
        required_claims: list[str] | None = None,
        validate_user: bool = True,
    ) -> dict[str, Any]:
        """Validate token claims and enrich with user data.

        Args:
            claims: JWT claims to validate
            required_claims: List of required claim keys
            validate_user: Whether to validate user exists

        Returns:
            Validated and enriched claims

        Raises:
            ValueError: If validation fails
        """
        # Check required claims
        if required_claims:
            missing = [claim for claim in required_claims if claim not in claims]
            if missing:
                raise ValueError(f"Missing required claims: {missing}")

        # Validate standard claims
        validated = {
            "sub": claims.get("sub"),
            "type": claims.get("type"),
            "exp": claims.get("exp"),
            "iat": claims.get("iat"),
            "jti": claims.get("jti"),
            "scope": claims.get("scope", ""),
            "aud": claims.get("aud", []),
        }

        # Validate subject
        if not validated["sub"]:
            raise ValueError("Missing subject claim")

        # Parse user ID
        try:
            user_id = UUID(validated["sub"])
            validated["user_id"] = user_id
        except (ValueError, TypeError) as e:
            # Might be a service identifier
            if not validated["type"] == "m2m":
                raise ValueError(f"Invalid subject format: {e}") from e
            validated["service_id"] = validated["sub"]

        # Validate user exists if needed
        if validate_user and "user_id" in validated:
            user = await self._get_user(validated["user_id"])
            if not user:
                raise ValueError("User not found")

            # Check if user is active
            if not user.is_active:
                raise ValueError("User account is not active")

            # Add user info to validated claims
            validated["user"] = {
                "id": str(user.id),
                "email": user.email,
                "username": user.username,
                "is_active": user.is_active,
            }

        # Parse and validate scopes
        if validated["scope"]:
            scopes = validated["scope"].split() if isinstance(validated["scope"], str) else validated["scope"]
            validated["scopes"] = self._validate_scopes(scopes)
        else:
            validated["scopes"] = []

        # Validate audience
        if validated["aud"]:
            if isinstance(validated["aud"], str):
                validated["aud"] = [validated["aud"]]

        return validated

    def check_scope(
        self,
        claims: dict[str, Any],
        required_scope: str,
        allow_admin: bool = True,
    ) -> bool:
        """Check if claims have a required scope.

        Args:
            claims: Token claims
            required_scope: Required scope
            allow_admin: Whether admin scope satisfies requirement

        Returns:
            True if scope is present
        """
        token_scopes = claims.get("scopes", [])

        # Check exact scope
        if required_scope in token_scopes:
            return True

        # Check admin override
        if allow_admin and "admin:system" in token_scopes:
            return True

        # Check wildcard scopes (e.g., "entries:*" matches "entries:read")
        scope_prefix = required_scope.split(":")[0]
        # Do not allow admin:* to satisfy admin:system unless allow_admin is True
        if not (scope_prefix == "admin" and not allow_admin):
            if f"{scope_prefix}:*" in token_scopes:
                return True

        return False

    def check_all_scopes(
        self,
        claims: dict[str, Any],
        required_scopes: list[str],
        allow_admin: bool = True,
    ) -> bool:
        """Check if claims have all required scopes.

        Args:
            claims: Token claims
            required_scopes: List of required scopes
            allow_admin: Whether admin scope satisfies requirements

        Returns:
            True if all scopes are present
        """
        return all(
            self.check_scope(claims, scope, allow_admin)
            for scope in required_scopes
        )

    def check_any_scope(
        self,
        claims: dict[str, Any],
        required_scopes: list[str],
        allow_admin: bool = True,
    ) -> bool:
        """Check if claims have any of the required scopes.

        Args:
            claims: Token claims
            required_scopes: List of required scopes
            allow_admin: Whether admin scope satisfies requirements

        Returns:
            True if any scope is present
        """
        return any(
            self.check_scope(claims, scope, allow_admin)
            for scope in required_scopes
        )

    def get_user_permissions(self, claims: dict[str, Any]) -> dict[str, bool]:
        """Get user permissions based on token scopes.

        Args:
            claims: Token claims

        Returns:
            Dictionary of permission flags
        """
        return {
            "can_read": self.check_scope(claims, "entries:read"),
            "can_write": self.check_scope(claims, "entries:write"),
            "can_delete": self.check_scope(claims, "entries:delete"),
            "can_export": self.check_scope(claims, "service:export"),
            "can_search": self.check_scope(claims, "service:search"),
            "is_admin": self.check_scope(claims, "admin:system", allow_admin=False),
        }

    def validate_audience(
        self,
        claims: dict[str, Any],
        expected_audience: str,
    ) -> bool:
        """Validate token audience.

        Args:
            claims: Token claims
            expected_audience: Expected audience value

        Returns:
            True if audience is valid
        """
        audiences = claims.get("aud", [])
        if isinstance(audiences, str):
            audiences = [audiences]

        return expected_audience in audiences

    def validate_token_type(
        self,
        claims: dict[str, Any],
        expected_type: str,
    ) -> bool:
        """Validate token type.

        Args:
            claims: Token claims
            expected_type: Expected token type

        Returns:
            True if type matches
        """
        return claims.get("type") == expected_type

    def is_token_expired(self, claims: dict[str, Any]) -> bool:
        """Check if token is expired.

        Args:
            claims: Token claims

        Returns:
            True if token is expired
        """
        exp = claims.get("exp")
        if not exp:
            return True

        now = datetime.now(UTC).timestamp()
        return bool(now >= exp)

    def get_token_age(self, claims: dict[str, Any]) -> int:
        """Get token age in seconds.

        Args:
            claims: Token claims

        Returns:
            Age in seconds
        """
        iat = claims.get("iat")
        if not iat:
            return 0

        now = datetime.now(UTC).timestamp()
        return int(now - iat)

    def get_token_remaining_ttl(self, claims: dict[str, Any]) -> int:
        """Get remaining TTL in seconds.

        Args:
            claims: Token claims

        Returns:
            Remaining TTL in seconds (0 if expired)
        """
        exp = claims.get("exp")
        if not exp:
            return 0

        now = datetime.now(UTC).timestamp()
        remaining = exp - now
        return max(0, int(remaining))

    async def validate_service_token(
        self,
        claims: dict[str, Any],
        expected_service: str,
    ) -> dict[str, Any]:
        """Validate machine-to-machine service token.

        Args:
            claims: Token claims
            expected_service: Expected service identifier

        Returns:
            Validated service claims

        Raises:
            ValueError: If validation fails
        """
        # Check token type
        if claims.get("type") != "m2m":
            raise ValueError("Not a service token")

        # Check service identifier
        if claims.get("sub") != expected_service:
            raise ValueError(f"Invalid service: expected {expected_service}")

        # Check service audience
        if not self.validate_audience(claims, "services"):
            raise ValueError("Invalid service audience")

        # Add service metadata
        validated = claims.copy()
        validated["service"] = {
            "id": expected_service,
            "type": "m2m",
            "scopes": claims.get("scopes", []),
        }

        return validated

    @staticmethod
    def _validate_scopes(scopes: list[str]) -> list[str]:
        """Validate and normalize scopes.

        Args:
            scopes: List of scope strings

        Returns:
            Validated scope list
        """
        validated = []
        for scope in scopes:
            # Check format (resource:action)
            if ":" in scope:
                validated.append(scope)
            # Skip invalid scopes silently

        return validated

    async def _get_user(self, user_id: UUID) -> User | None:
        """Get user from database.

        Args:
            user_id: User ID

        Returns:
            User object or None
        """
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def cache_validation_result(
        self,
        jti: str,
        validation_result: dict[str, Any],
        ttl: int = 60,
    ) -> None:
        """Cache validation result for performance.

        Args:
            jti: JWT ID
            validation_result: Validation result to cache
            ttl: Cache TTL in seconds
        """
        import json

        cache_key = f"jwt:validated:{jti}"
        await self.redis.setex(
            cache_key,
            ttl,
            json.dumps(validation_result),
        )

    async def get_cached_validation(self, jti: str) -> dict[str, Any] | None:
        """Get cached validation result.

        Args:
            jti: JWT ID

        Returns:
            Cached validation result or None
        """
        import json

        cache_key = f"jwt:validated:{jti}"
        cached = await self.redis.get(cache_key)

        if cached:
            try:
                result = json.loads(cached.decode())
                return result if isinstance(result, dict) else None
            except (json.JSONDecodeError, AttributeError):
                pass

        return None
