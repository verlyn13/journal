"""Advanced rate limiting for authentication endpoints."""

from __future__ import annotations

import hashlib

from collections.abc import Awaitable
from dataclasses import dataclass
from typing import Any, ClassVar, cast
from uuid import UUID

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService


@dataclass
class RateLimitConfig:
    """Configuration for rate limiting."""

    attempts: int
    window: int  # seconds


class AuthRateLimiter:
    """Advanced rate limiting for authentication endpoints."""

    # Default rate limit configurations
    LIMITS: ClassVar[dict[str, RateLimitConfig]] = {
        "login": RateLimitConfig(attempts=5, window=300),  # 5 attempts per 5 min
        "login_failed": RateLimitConfig(attempts=3, window=900),  # 3 fails per 15 min
        "totp": RateLimitConfig(attempts=5, window=300),
        "recovery_code": RateLimitConfig(attempts=3, window=600),  # 3 per 10 min
        "password_reset": RateLimitConfig(attempts=3, window=3600),  # 3 per hour
        "webauthn_register": RateLimitConfig(attempts=5, window=3600),  # 5 per hour
        "webauthn_verify": RateLimitConfig(attempts=10, window=300),  # 10 per 5 min
        "stepup": RateLimitConfig(attempts=5, window=300),
        "data_export": RateLimitConfig(attempts=3, window=3600),  # 3 per hour
        "account_deletion": RateLimitConfig(attempts=2, window=86400),  # 2 per day
    }

    def __init__(self, redis: Redis, session: AsyncSession | None = None) -> None:
        self.redis = redis
        self.session = session

    async def check_rate_limit(self, action: str, identifier: str) -> tuple[bool, int | None]:
        """Check if an action is rate limited.

        Args:
            action: The action being performed
            identifier: Unique identifier (user_id, IP, or combination)

        Returns:
            Tuple of (allowed, seconds_until_reset)
        """
        limit_config = self.LIMITS.get(action)
        if not limit_config:
            # No limit configured for this action
            return True, None

        # Create a hashed key to prevent key length issues
        key = self._make_key(action, identifier)

        # Get current count
        current = await self.redis.incr(key)

        # Set expiry on first attempt
        if current == 1:
            await self.redis.expire(key, limit_config.window)

        # Check if limit exceeded
        if current > limit_config.attempts:
            ttl = await self.redis.ttl(key)
            return False, max(0, ttl)

        return True, None

    async def check_combined_limit(
        self, action: str, user_id: UUID | None, ip_address: str
    ) -> tuple[bool, int | None]:
        """Check rate limits by both user ID and IP address.

        Args:
            action: The action being performed
            user_id: Optional user ID
            ip_address: Client IP address

        Returns:
            Tuple of (allowed, seconds_until_reset)
        """
        # Check IP-based limit
        ip_allowed, ip_ttl = await self.check_rate_limit(action, ip_address)
        if not ip_allowed:
            return False, ip_ttl

        # Check user-based limit if user is known
        if user_id:
            user_allowed, user_ttl = await self.check_rate_limit(action, str(user_id))
            if not user_allowed:
                return False, user_ttl

        return True, None

    async def record_failed_attempt(
        self,
        action: str,
        user_id: UUID | None,
        ip_address: str,
        reason: str = "invalid_credentials",
    ) -> None:
        """Record a failed authentication attempt.

        Args:
            action: The action that failed
            user_id: Optional user ID
            ip_address: Client IP address
            reason: Reason for failure
        """
        # Apply rate limiting for the failed attempt
        await self.check_combined_limit(f"{action}_failed", user_id, ip_address)

        # Log to audit trail if we have a session and user
        if self.session and user_id:
            audit_service = AuditService(self.session)
            await audit_service.log_event(
                user_id=user_id,
                event_type=f"{action}_failed",
                event_data={"reason": reason, "ip": ip_address},
                ip_address=ip_address,
            )

        # Track failure patterns for anomaly detection
        await self._track_failure_pattern(action, ip_address, user_id)

    async def _track_failure_pattern(
        self, action: str, ip_address: str, user_id: UUID | None
    ) -> None:
        """Track failure patterns for anomaly detection.

        Args:
            action: The failed action
            ip_address: Client IP
            user_id: Optional user ID
        """
        # Track failures by IP
        ip_key = f"failures:ip:{self._hash_identifier(ip_address)}"
        await cast("Awaitable[int]", self.redis.hincrby(ip_key, action, 1))
        await self.redis.expire(ip_key, 3600)  # 1 hour TTL

        # Track failures by user if known
        if user_id:
            user_key = f"failures:user:{user_id}"
            await cast("Awaitable[int]", self.redis.hincrby(user_key, action, 1))
            await self.redis.expire(user_key, 3600)

    async def is_blocked(
        self, identifier: str, action: str | None = None
    ) -> tuple[bool, int | None]:
        """Check if an identifier is currently blocked.

        Args:
            identifier: The identifier to check
            action: Optional specific action to check

        Returns:
            Tuple of (is_blocked, seconds_until_unblock)
        """
        if action:
            # Check specific action
            allowed, ttl = await self.check_rate_limit(action, identifier)
            return not allowed, ttl

        # Check all actions
        for action_name in self.LIMITS:
            allowed, ttl = await self.check_rate_limit(action_name, identifier)
            if not allowed:
                return True, ttl

        return False, None

    async def reset_limits(self, identifier: str, action: str | None = None) -> int:
        """Reset rate limits for an identifier.

        Args:
            identifier: The identifier to reset
            action: Optional specific action to reset

        Returns:
            Number of keys reset
        """
        if action:
            # Reset specific action
            key = self._make_key(action, identifier)
            return await cast("Awaitable[int]", self.redis.delete(key))

        # Reset all actions
        count = 0
        for action_name in self.LIMITS:
            key = self._make_key(action_name, identifier)
            count += await self.redis.delete(key)

        return count

    async def get_limit_status(self, identifier: str, action: str) -> dict[str, Any]:
        """Get current rate limit status for an identifier.

        Args:
            identifier: The identifier to check
            action: The action to check

        Returns:
            Status dictionary with current count and limits
        """
        limit_config = self.LIMITS.get(action)
        if not limit_config:
            return {"limited": False, "action": action}

        key = self._make_key(action, identifier)
        current = await self.redis.get(key)
        current_count = int(current) if current else 0

        ttl = await self.redis.ttl(key) if current else 0

        return {
            "action": action,
            "current_attempts": current_count,
            "max_attempts": limit_config.attempts,
            "window_seconds": limit_config.window,
            "limited": current_count >= limit_config.attempts,
            "reset_in_seconds": max(0, ttl) if ttl > 0 else None,
        }

    @staticmethod
    def _make_key(action: str, identifier: str) -> str:
        """Create a Redis key for rate limiting.

        Args:
            action: The action being limited
            identifier: The identifier

        Returns:
            Redis key
        """
        hashed = AuthRateLimiter._hash_identifier(identifier)
        return f"ratelimit:{action}:{hashed}"

    @staticmethod
    def _hash_identifier(identifier: str) -> str:
        """Hash an identifier for use in Redis keys.

        Args:
            identifier: The identifier to hash

        Returns:
            Hashed identifier
        """
        return hashlib.sha256(identifier.encode()).hexdigest()[:16]
