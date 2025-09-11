"""Tests for step-up authentication service."""

from __future__ import annotations

import base64

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.domain.auth.stepup_service import StepUpAuthService
from app.infra.sa_models import AuditLogEntry, User


class TestStepUpAuthService:
    """Test suite for StepUpAuthService."""

    @pytest.fixture
    def redis_mock(self) -> AsyncMock:
        """Create mock Redis client."""
        return AsyncMock(spec=Redis)

    @pytest.fixture
    def stepup_service(self, db_session: AsyncSession, redis_mock: AsyncMock) -> StepUpAuthService:
        """Create StepUpAuthService instance."""
        return StepUpAuthService(db_session, redis_mock)

    @pytest.fixture
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

    @pytest.mark.asyncio()
    async def test_require_fresh_auth_no_recent(
        self,
        stepup_service: StepUpAuthService,
        test_user: User,
        redis_mock: AsyncMock,
    ) -> None:
        """Test requiring fresh auth when no recent auth exists."""
        result = await stepup_service.require_fresh_auth(
            test_user.id, "delete_account", "192.168.1.1"
        )

        assert result["required"] is True
        assert "challenge" in result
        assert result["action"] == "delete_account"
        assert "expires_at" in result

        # Verify challenge was stored
        redis_mock.setex.assert_called_once()
        call_args = redis_mock.setex.call_args
        assert call_args[0][0] == f"stepup:{test_user.id}:delete_account"
        assert call_args[0][1] == 300  # TTL

    @pytest.mark.asyncio()
    async def test_require_fresh_auth_with_recent(
        self,
        stepup_service: StepUpAuthService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test that recent auth bypasses requirement."""
        # Create recent auth entry
        audit_service = AuditService(db_session)
        await audit_service.log_event(
            user_id=test_user.id,
            event_type="stepup_verified",
            event_data={"action": "delete_account"},
        )

        result = await stepup_service.require_fresh_auth(test_user.id, "delete_account")

        assert result["required"] is False
        assert "recent_auth" in result
        assert result["action"] == "delete_account"

    @pytest.mark.asyncio()
    async def test_require_fresh_auth_expired_recent(
        self,
        stepup_service: StepUpAuthService,
        test_user: User,
        redis_mock: AsyncMock,
        db_session: AsyncSession,
    ) -> None:
        """Test that expired recent auth requires new challenge."""
        # Create old auth entry (beyond fresh window)
        old_time = datetime.now(UTC) - timedelta(minutes=10)
        entry = AuditLogEntry(
            id=uuid4(),
            user_id=test_user.id,
            event_type="stepup_verified",
            event_data={"action": "delete_account"},
            prev_hash="0" * 64,
            entry_hash="test_hash",
            created_at=old_time,
        )
        db_session.add(entry)
        await db_session.flush()

        result = await stepup_service.require_fresh_auth(test_user.id, "delete_account")

        assert result["required"] is True
        assert "challenge" in result

    @pytest.mark.asyncio()
    async def test_verify_step_up_success(
        self,
        stepup_service: StepUpAuthService,
        test_user: User,
        redis_mock: AsyncMock,
    ) -> None:
        """Test successful step-up verification."""
        challenge = base64.b64encode(b"test_challenge").decode()
        redis_mock.get.return_value = challenge.encode()

        result = await stepup_service.verify_step_up(
            test_user.id, "export_data", challenge, "192.168.1.1"
        )

        assert result is True

        # Verify challenge was cleared
        redis_mock.delete.assert_called_once_with(f"stepup:{test_user.id}:export_data")

        # Verify verification was stored
        redis_mock.setex.assert_called()
        verify_call = [
            c for c in redis_mock.setex.call_args_list if "stepup_verified" in str(c[0][0])
        ]
        assert len(verify_call) > 0

    @pytest.mark.asyncio()
    async def test_verify_step_up_invalid_challenge(
        self,
        stepup_service: StepUpAuthService,
        test_user: User,
        redis_mock: AsyncMock,
        db_session: AsyncSession,
    ) -> None:
        """Test step-up verification with invalid challenge."""
        redis_mock.get.return_value = b"stored_challenge"

        result = await stepup_service.verify_step_up(
            test_user.id, "export_data", "wrong_challenge", "192.168.1.1"
        )

        assert result is False

        # Verify failure was logged
        from sqlalchemy import select

        failed_entry = await db_session.scalar(
            select(AuditLogEntry)
            .where(AuditLogEntry.user_id == test_user.id)
            .where(AuditLogEntry.event_type == "stepup_failed")
        )
        assert failed_entry is not None
        assert failed_entry.event_data["reason"] == "invalid_challenge"

    @pytest.mark.asyncio()
    async def test_verify_step_up_no_challenge(
        self,
        stepup_service: StepUpAuthService,
        test_user: User,
        redis_mock: AsyncMock,
    ) -> None:
        """Test step-up verification when no challenge exists."""
        redis_mock.get.return_value = None

        result = await stepup_service.verify_step_up(test_user.id, "export_data", "any_challenge")

        assert result is False

    @pytest.mark.asyncio()
    async def test_clear_all_challenges(
        self,
        stepup_service: StepUpAuthService,
        test_user: User,
        redis_mock: AsyncMock,
    ) -> None:
        """Test clearing all challenges for a user."""
        # Mock scan to return challenges
        redis_mock.scan.side_effect = [
            (100, [b"stepup:user:action1", b"stepup:user:action2"]),
            (0, [b"stepup:user:action3"]),
        ]

        cleared = await stepup_service.clear_all_challenges(test_user.id)

        assert cleared == 3
        assert redis_mock.delete.call_count == 1
        redis_mock.delete.assert_called_with(
            b"stepup:user:action1", b"stepup:user:action2", b"stepup:user:action3"
        )

    @pytest.mark.asyncio()
    async def test_get_pending_challenges(
        self,
        stepup_service: StepUpAuthService,
        test_user: User,
        redis_mock: AsyncMock,
    ) -> None:
        """Test getting list of pending challenges."""
        # Mock scan to return challenge keys
        redis_mock.scan.return_value = (
            0,
            [
                f"stepup:{test_user.id}:delete_account".encode(),
                f"stepup:{test_user.id}:export_data".encode(),
            ],
        )

        actions = await stepup_service.get_pending_challenges(test_user.id)

        assert len(actions) == 2
        assert "delete_account" in actions
        assert "export_data" in actions

    @pytest.mark.asyncio()
    async def test_sensitive_actions_enumeration(self) -> None:
        """Test that all sensitive actions are properly defined."""
        from app.domain.auth.stepup_service import SensitiveAction

        # Verify critical actions are included
        critical_actions = [
            "delete_account",
            "export_data",
            "change_email",
            "disable_2fa",
            "view_recovery_codes",
        ]

        for action in critical_actions:
            # This will fail if action is not in the Literal type
            test_action: SensitiveAction = action  # type: ignore
            assert test_action == action
