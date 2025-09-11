"""Tests for privacy dashboard service."""

from __future__ import annotations

import json

from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.privacy_service import PrivacyService
from app.infra.sa_models import Entry, User, UserDevice, UserSession


class TestPrivacyService:
    """Test suite for PrivacyService."""

    @pytest.fixture
    def privacy_service(self, db_session: AsyncSession) -> PrivacyService:
        """Create PrivacyService instance."""
        return PrivacyService(db_session)

    @pytest.fixture
    async def test_user(self, db_session: AsyncSession) -> User:
        """Create test user."""
        user = User(
            id=uuid4(),
            email="test@example.com",
            username="testuser",
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow(),  # Use naive datetime for DB
            updated_at=datetime.utcnow(),  # Use naive datetime for DB
        )
        db_session.add(user)
        await db_session.flush()
        return user

    @pytest.fixture
    async def test_entry(self, db_session: AsyncSession, test_user: User) -> Entry:
        """Create test entry."""
        entry = Entry(
            id=uuid4(),
            author_id=test_user.id,
            title="Test Entry",
            content="This is test content",
            markdown_content="# Test Entry\n\nThis is test content",
            word_count=4,
            char_count=20,
            created_at=datetime.utcnow(),  # Use naive datetime for DB
            updated_at=datetime.utcnow(),  # Use naive datetime for DB
        )
        db_session.add(entry)
        await db_session.flush()
        return entry

    @pytest.fixture
    async def test_device(self, db_session: AsyncSession, test_user: User) -> UserDevice:
        """Create test device."""
        device = UserDevice(
            id=uuid4(),
            user_id=test_user.id,
            device_name="Test Device",
            browser="Chrome",
            os="Linux",
            location_region="New York, NY",
            trusted=True,
            last_seen_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
        )
        db_session.add(device)
        await db_session.flush()
        return device

    @pytest.fixture
    async def test_session(
        self, db_session: AsyncSession, test_user: User, test_device: UserDevice
    ) -> UserSession:
        """Create test session."""
        session = UserSession(
            id=uuid4(),
            user_id=test_user.id,
            device_id=test_device.id,
            refresh_id=uuid4(),
            user_agent="Mozilla/5.0",
            ip_address="192.168.1.1",
            issued_at=datetime.utcnow(),
            last_used_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=30),
            revoked_at=None,
        )
        db_session.add(session)
        await db_session.flush()
        return session

    @pytest.mark.asyncio()
    async def test_export_user_data_json(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        test_entry: Entry,
        test_device: UserDevice,
        test_session: UserSession,
        db_session: AsyncSession,
    ) -> None:
        """Test exporting user data as JSON."""
        filename, content_type, data_bytes = await privacy_service.export_user_data(
            test_user.id, export_format="json"
        )

        assert filename.startswith(f"user_data_{test_user.id}_")
        assert filename.endswith(".json")
        assert content_type == "application/json"

        # Parse exported data
        data = json.loads(data_bytes.decode())
        assert data["user"]["email"] == "test@example.com"
        assert len(data["entries"]) == 1
        assert data["entries"][0]["title"] == "Test Entry"
        assert len(data["devices"]) == 1
        assert data["devices"][0]["device_name"] == "Test Device"
        assert len(data["sessions"]) == 1

    @pytest.mark.asyncio()
    async def test_export_user_data_csv(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        test_entry: Entry,
        db_session: AsyncSession,
    ) -> None:
        """Test exporting user data as CSV."""
        filename, content_type, data_bytes = await privacy_service.export_user_data(
            test_user.id, export_format="csv"
        )

        assert filename.startswith(f"user_entries_{test_user.id}_")
        assert filename.endswith(".csv")
        assert content_type == "text/csv"

        # Check CSV content
        csv_content = data_bytes.decode()
        assert "Test Entry" in csv_content
        assert "This is test content" in csv_content

    @pytest.mark.asyncio()
    async def test_schedule_deletion(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test scheduling account deletion."""
        deletion_request = await privacy_service.schedule_deletion(
            test_user.id, days_until_deletion=30
        )

        assert deletion_request.user_id == test_user.id
        assert deletion_request.scheduled_for > datetime.now(UTC)
        assert deletion_request.undo_token is not None
        assert len(deletion_request.undo_token) > 20
        assert deletion_request.undo_expires_at > datetime.now(UTC)
        assert deletion_request.cancelled_at is None
        assert deletion_request.executed_at is None

    @pytest.mark.asyncio()
    async def test_schedule_deletion_prevents_duplicate(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test that duplicate deletion requests are prevented."""
        # Schedule first deletion
        await privacy_service.schedule_deletion(test_user.id)

        # Try to schedule another
        with pytest.raises(ValueError, match="Deletion already scheduled"):
            await privacy_service.schedule_deletion(test_user.id)

    @pytest.mark.asyncio()
    async def test_cancel_deletion_success(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test successfully cancelling a deletion."""
        # Schedule deletion
        deletion_request = await privacy_service.schedule_deletion(test_user.id)
        undo_token = deletion_request.undo_token

        # Cancel it
        success = await privacy_service.cancel_deletion(test_user.id, undo_token)
        assert success is True

        # Verify it's cancelled
        await db_session.refresh(deletion_request)
        assert deletion_request.cancelled_at is not None

    @pytest.mark.asyncio()
    async def test_cancel_deletion_wrong_token(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test cancellation fails with wrong token."""
        # Schedule deletion
        await privacy_service.schedule_deletion(test_user.id)

        # Try to cancel with wrong token
        success = await privacy_service.cancel_deletion(test_user.id, "wrong_token")
        assert success is False

    @pytest.mark.asyncio()
    async def test_cancel_deletion_expired(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test cancellation fails after undo period expires."""
        # Schedule deletion with immediate expiry
        deletion_request = await privacy_service.schedule_deletion(test_user.id)

        # Manually expire the undo period
        deletion_request.undo_expires_at = datetime.now(UTC) - timedelta(days=1)
        await db_session.flush()

        # Try to cancel
        success = await privacy_service.cancel_deletion(
            test_user.id, deletion_request.undo_token
        )
        assert success is False

    @pytest.mark.asyncio()
    async def test_get_deletion_status(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test getting deletion status."""
        # No deletion scheduled
        status = await privacy_service.get_deletion_status(test_user.id)
        assert status is None

        # Schedule deletion
        await privacy_service.schedule_deletion(test_user.id, days_until_deletion=30)

        # Get status
        status = await privacy_service.get_deletion_status(test_user.id)
        assert status is not None
        assert status["status"] == "scheduled"
        assert status["can_undo"] is True
        assert status["days_remaining"] >= 29

    @pytest.mark.asyncio()
    async def test_get_deletion_status_cancelled(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test deletion status for cancelled request."""
        # Schedule and cancel
        deletion_request = await privacy_service.schedule_deletion(test_user.id)
        await privacy_service.cancel_deletion(test_user.id, deletion_request.undo_token)

        # Get status
        status = await privacy_service.get_deletion_status(test_user.id)
        assert status is not None
        assert status["status"] == "cancelled"
        assert status["can_undo"] is False

    @pytest.mark.asyncio()
    async def test_get_privacy_summary(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        test_entry: Entry,
        test_device: UserDevice,
        test_session: UserSession,
        db_session: AsyncSession,
    ) -> None:
        """Test getting privacy dashboard summary."""
        summary = await privacy_service.get_privacy_summary(test_user.id)

        assert summary["data_summary"]["entries"] == 1
        assert summary["data_summary"]["devices"] == 1
        assert summary["data_summary"]["active_sessions"] == 1
        assert summary["deletion_status"] is None
        assert summary["audit_log_integrity"] is True
        assert "json" in summary["export_formats"]
        assert "csv" in summary["export_formats"]

    @pytest.mark.asyncio()
    async def test_privacy_summary_with_deletion(
        self,
        privacy_service: PrivacyService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test privacy summary includes deletion status."""
        # Schedule deletion
        await privacy_service.schedule_deletion(test_user.id)

        # Get summary
        summary = await privacy_service.get_privacy_summary(test_user.id)
        assert summary["deletion_status"] is not None
        assert summary["deletion_status"]["status"] == "scheduled"
