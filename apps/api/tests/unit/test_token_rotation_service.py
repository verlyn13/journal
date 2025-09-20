"""Tests for token rotation service."""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.token_rotation_service import TokenRotationService
from app.infra.sa_models import User, UserSession


class TestTokenRotationService:
    """Test suite for TokenRotationService."""

    @pytest.fixture()
    def redis_mock(self) -> AsyncMock:
        """Create mock Redis client."""
        return AsyncMock(spec=Redis)

    @pytest.fixture()
    def token_service(
        self, db_session: AsyncSession, redis_mock: AsyncMock
    ) -> TokenRotationService:
        """Create TokenRotationService instance."""
        return TokenRotationService(db_session, redis_mock)

    @pytest.fixture()
    async def test_user(self, db_session: AsyncSession) -> User:
        """Create test user."""
        user = User(
            id=uuid4(),
            email="test@example.com",
            username="testuser",
            is_active=True,
            is_verified=True,
        )
        db_session.add(user)
        await db_session.flush()
        return user

    @pytest.fixture()
    async def test_session(
        self, db_session: AsyncSession, test_user: User
    ) -> UserSession:
        """Create test session."""
        session = UserSession(
            id=uuid4(),
            user_id=test_user.id,
            refresh_id=uuid4(),
            expires_at=datetime.now(UTC),
        )
        db_session.add(session)
        await db_session.flush()
        return session

    @pytest.mark.asyncio()
    async def test_check_refresh_token_reuse_first_use(
        self,
        token_service: TokenRotationService,
        test_user: User,
        redis_mock: AsyncMock,
    ) -> None:
        """Test that first use of refresh token is allowed."""
        token_hash = "test_token_hash"
        redis_mock.exists.return_value = False

        result = await token_service.check_refresh_token_reuse(token_hash, test_user.id)

        assert result is False  # Not a reuse
        redis_mock.exists.assert_called_once_with(f"used_refresh:{token_hash}")
        redis_mock.setex.assert_called_once_with(
            f"used_refresh:{token_hash}", 86400, "1"
        )

    @pytest.mark.asyncio()
    async def test_check_refresh_token_reuse_detected(
        self,
        token_service: TokenRotationService,
        test_user: User,
        test_session: UserSession,
        redis_mock: AsyncMock,
        db_session: AsyncSession,
    ) -> None:
        """Test that token reuse is detected and handled."""
        token_hash = "reused_token_hash"
        redis_mock.exists.return_value = True
        redis_mock.scan.return_value = (0, [])  # No step-up keys

        result = await token_service.check_refresh_token_reuse(token_hash, test_user.id)

        assert result is True  # Reuse detected
        redis_mock.exists.assert_called_once_with(f"used_refresh:{token_hash}")

        # Verify sessions were revoked
        await db_session.refresh(test_session)
        assert test_session.revoked_at is not None

        # Verify Redis tokens were cleared
        expected_deletes = [
            f"oauth_tokens:{test_user.id}",
            f"oauth_refresh:{test_user.id}",
            f"oauth_access:{test_user.id}",
        ]
        for key in expected_deletes:
            redis_mock.delete.assert_any_call(key)

    @pytest.mark.asyncio()
    async def test_mark_token_rotated(
        self,
        token_service: TokenRotationService,
        test_user: User,
        redis_mock: AsyncMock,
    ) -> None:
        """Test marking a token as rotated."""
        old_hash = "old_token_hash"
        new_hash = "new_token_hash"

        await token_service.mark_token_rotated(old_hash, new_hash, test_user.id)

        redis_mock.setex.assert_called_once_with(f"rotated:{old_hash}", 86400, new_hash)

    @pytest.mark.asyncio()
    async def test_revoke_all_user_tokens(
        self,
        token_service: TokenRotationService,
        test_user: User,
        redis_mock: AsyncMock,
        db_session: AsyncSession,
    ) -> None:
        """Test revoking all tokens for a user."""
        # Create multiple sessions
        sessions = []
        for _ in range(3):
            session = UserSession(
                id=uuid4(),
                user_id=test_user.id,
                refresh_id=uuid4(),
                expires_at=datetime.now(UTC),
            )
            db_session.add(session)
            sessions.append(session)
        await db_session.flush()

        # Mock Redis scan for step-up keys
        redis_mock.scan.return_value = (
            0,
            [b"stepup:user:action1", b"stepup:user:action2"],
        )

        revoked_count = await token_service.revoke_all_user_tokens(test_user.id)

        assert revoked_count == 3

        # Verify all sessions revoked
        for session in sessions:
            await db_session.refresh(session)
            assert session.revoked_at is not None

        # Verify Redis cleanup
        assert redis_mock.delete.call_count >= 3  # OAuth keys + step-up keys

    @pytest.mark.asyncio()
    async def test_get_token_rotation_history(
        self,
        token_service: TokenRotationService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test getting token rotation history."""
        # Create audit log entries
        from app.domain.auth.audit_service import AuditService

        audit_service = AuditService(db_session)

        await audit_service.log_event(
            user_id=test_user.id,
            event_type="token_rotated",
            event_data={"old_hash": "abc...", "new_hash": "def..."},
        )

        await audit_service.log_event(
            user_id=test_user.id,
            event_type="security_incident",
            event_data={"incident_type": "refresh_token_reuse"},
        )

        history = await token_service.get_token_rotation_history(test_user.id)

        assert len(history) == 2
        assert history[0]["event_type"] == "security_incident"
        assert history[1]["event_type"] == "token_rotated"

    @pytest.mark.asyncio()
    async def test_hash_token(self) -> None:
        """Test token hashing."""
        token = "test_token_value"
        hashed = TokenRotationService.hash_token(token)

        assert len(hashed) == 64  # SHA-256 produces 64 hex chars
        assert hashed == TokenRotationService.hash_token(token)  # Consistent

    @pytest.mark.asyncio()
    async def test_handle_token_reuse_clears_stepup_challenges(
        self,
        token_service: TokenRotationService,
        test_user: User,
        test_session: UserSession,
        redis_mock: AsyncMock,
    ) -> None:
        """Test that token reuse incident clears step-up challenges."""
        token_hash = "reused_token"
        redis_mock.exists.return_value = True

        # Mock scan to return step-up keys
        redis_mock.scan.side_effect = [
            (100, [b"stepup:user:delete_account"]),
            (0, [b"stepup:user:export_data"]),
        ]

        await token_service.check_refresh_token_reuse(token_hash, test_user.id)

        # Verify step-up keys were deleted
        assert redis_mock.scan.call_count == 2
        redis_mock.delete.assert_any_call(
            b"stepup:user:delete_account", b"stepup:user:export_data"
        )
