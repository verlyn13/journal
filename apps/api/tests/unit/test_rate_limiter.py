"""Tests for authentication rate limiter."""

from __future__ import annotations

from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.rate_limiter import AuthRateLimiter


class TestAuthRateLimiter:
    """Test suite for AuthRateLimiter."""

    @pytest.fixture()
    def redis_mock(self) -> AsyncMock:
        """Create mock Redis client."""
        mock = AsyncMock(spec=Redis)
        # Set default return values
        mock.incr.return_value = 1
        mock.ttl.return_value = 60
        mock.get.return_value = None
        mock.delete.return_value = 1
        return mock

    @pytest.fixture()
    def rate_limiter(self, redis_mock: AsyncMock, db_session: AsyncSession) -> AuthRateLimiter:
        """Create AuthRateLimiter instance."""
        return AuthRateLimiter(redis_mock, db_session)

    @pytest.mark.asyncio()
    async def test_check_rate_limit_first_attempt(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test rate limit check on first attempt."""
        redis_mock.incr.return_value = 1

        allowed, ttl = await rate_limiter.check_rate_limit("login", "user123")

        assert allowed is True
        assert ttl is None
        redis_mock.incr.assert_called_once()
        redis_mock.expire.assert_called_once()

    @pytest.mark.asyncio()
    async def test_check_rate_limit_within_limit(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test rate limit check within allowed attempts."""
        redis_mock.incr.return_value = 3  # Below login limit of 5

        allowed, ttl = await rate_limiter.check_rate_limit("login", "user123")

        assert allowed is True
        assert ttl is None

    @pytest.mark.asyncio()
    async def test_check_rate_limit_exceeded(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test rate limit check when limit exceeded."""
        redis_mock.incr.return_value = 6  # Above login limit of 5
        redis_mock.ttl.return_value = 120  # 2 minutes remaining

        allowed, ttl = await rate_limiter.check_rate_limit("login", "user123")

        assert allowed is False
        assert ttl == 120

    @pytest.mark.asyncio()
    async def test_check_rate_limit_unknown_action(self, rate_limiter: AuthRateLimiter) -> None:
        """Test rate limit check for unknown action."""
        allowed, ttl = await rate_limiter.check_rate_limit("unknown_action", "user123")

        assert allowed is True
        assert ttl is None

    @pytest.mark.asyncio()
    async def test_check_combined_limit_ip_blocked(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test combined limit when IP is blocked."""
        # IP is blocked
        redis_mock.incr.side_effect = [10, 1]  # IP over limit, user under
        redis_mock.ttl.return_value = 60

        user_id = uuid4()
        allowed, ttl = await rate_limiter.check_combined_limit("login", user_id, "192.168.1.1")

        assert allowed is False
        assert ttl == 60

    @pytest.mark.asyncio()
    async def test_check_combined_limit_user_blocked(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test combined limit when user is blocked."""
        # User is blocked
        redis_mock.incr.side_effect = [1, 10]  # IP under limit, user over
        redis_mock.ttl.return_value = 120

        user_id = uuid4()
        allowed, ttl = await rate_limiter.check_combined_limit("login", user_id, "192.168.1.1")

        assert allowed is False
        assert ttl == 120

    @pytest.mark.asyncio()
    async def test_check_combined_limit_both_allowed(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test combined limit when both are allowed."""
        redis_mock.incr.side_effect = [2, 3]  # Both under limits

        user_id = uuid4()
        allowed, ttl = await rate_limiter.check_combined_limit("login", user_id, "192.168.1.1")

        assert allowed is True
        assert ttl is None

    @pytest.mark.asyncio()
    async def test_record_failed_attempt(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test recording a failed authentication attempt."""
        redis_mock.incr.side_effect = [1, 1, 1, 1]  # All increments succeed
        user_id = uuid4()

        await rate_limiter.record_failed_attempt(
            "login", user_id, "192.168.1.1", "invalid_password"
        )

        # Verify failure tracking
        assert redis_mock.hincrby.call_count == 2  # IP and user tracking
        redis_mock.expire.assert_called()  # TTL set on tracking keys

    @pytest.mark.asyncio()
    async def test_is_blocked_not_blocked(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test checking if identifier is not blocked."""
        redis_mock.incr.return_value = 2  # Under all limits

        blocked, ttl = await rate_limiter.is_blocked("user123", "login")

        assert blocked is False
        assert ttl is None

    @pytest.mark.asyncio()
    async def test_is_blocked_specific_action(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test checking if identifier is blocked for specific action."""
        redis_mock.incr.return_value = 10  # Over limit
        redis_mock.ttl.return_value = 180

        blocked, ttl = await rate_limiter.is_blocked("user123", "login")

        assert blocked is True
        assert ttl == 180

    @pytest.mark.asyncio()
    async def test_is_blocked_any_action(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test checking if identifier is blocked for any action."""
        # Mock different responses for different actions
        redis_mock.incr.side_effect = [2, 2, 10, 3]  # Third action over limit
        redis_mock.ttl.return_value = 90

        blocked, ttl = await rate_limiter.is_blocked("user123")

        assert blocked is True
        assert ttl == 90

    @pytest.mark.asyncio()
    async def test_reset_limits_specific_action(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test resetting limits for specific action."""
        redis_mock.delete.return_value = 1

        count = await rate_limiter.reset_limits("user123", "login")

        assert count == 1
        redis_mock.delete.assert_called_once()

    @pytest.mark.asyncio()
    async def test_reset_limits_all_actions(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test resetting limits for all actions."""
        redis_mock.delete.return_value = 1

        count = await rate_limiter.reset_limits("user123")

        # Should attempt to delete keys for all configured actions
        assert count == len(AuthRateLimiter.LIMITS)
        assert redis_mock.delete.call_count == len(AuthRateLimiter.LIMITS)

    @pytest.mark.asyncio()
    async def test_get_limit_status(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test getting current limit status."""
        redis_mock.get.return_value = b"3"
        redis_mock.ttl.return_value = 240

        status = await rate_limiter.get_limit_status("user123", "login")

        assert status["action"] == "login"
        assert status["current_attempts"] == 3
        assert status["max_attempts"] == 5
        assert status["window_seconds"] == 300
        assert status["limited"] is False
        assert status["reset_in_seconds"] == 240

    @pytest.mark.asyncio()
    async def test_get_limit_status_exceeded(
        self, rate_limiter: AuthRateLimiter, redis_mock: AsyncMock
    ) -> None:
        """Test getting limit status when exceeded."""
        redis_mock.get.return_value = b"6"
        redis_mock.ttl.return_value = 120

        status = await rate_limiter.get_limit_status("user123", "login")

        assert status["current_attempts"] == 6
        assert status["limited"] is True
        assert status["reset_in_seconds"] == 120

    @pytest.mark.asyncio()
    async def test_hash_identifier_consistency(self) -> None:
        """Test that identifier hashing is consistent."""
        identifier = "test_user_123"

        hash1 = AuthRateLimiter._hash_identifier(identifier)
        hash2 = AuthRateLimiter._hash_identifier(identifier)

        assert hash1 == hash2
        assert len(hash1) == 16  # Truncated to 16 chars

    @pytest.mark.asyncio()
    async def test_rate_limit_configurations(self) -> None:
        """Test that all critical actions have rate limit configs."""
        critical_actions = [
            "login",
            "totp",
            "recovery_code",
            "password_reset",
            "webauthn_verify",
            "data_export",
        ]

        for action in critical_actions:
            assert action in AuthRateLimiter.LIMITS
            config = AuthRateLimiter.LIMITS[action]
            assert config.attempts > 0
            assert config.window > 0
