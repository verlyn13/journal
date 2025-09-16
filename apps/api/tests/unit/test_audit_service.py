"""Tests for audit log service."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.infra.sa_models import AuditLogEntry, User, UserDevice


class TestAuditService:
    """Test suite for AuditService."""

    @pytest.fixture()
    def audit_service(self, db_session: AsyncSession) -> AuditService:
        """Create AuditService instance."""
        return AuditService(db_session)

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
    async def test_device(self, db_session: AsyncSession, test_user: User) -> UserDevice:
        """Create test device."""
        device = UserDevice(
            id=uuid4(),
            user_id=test_user.id,
            device_name="Test Device",
            browser="Chrome",
            os="Linux",
            trusted=False,
            last_seen_at=datetime.now(UTC),
            created_at=datetime.now(UTC),
        )
        db_session.add(device)
        await db_session.flush()
        return device

    @pytest.mark.asyncio()
    async def test_log_event_creates_entry(
        self,
        audit_service: AuditService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test that logging an event creates an audit entry."""
        entry = await audit_service.log_event(
            user_id=test_user.id,
            event_type=AuditService.EVENT_LOGIN,
            event_data={"method": "password", "success": True},
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
        )

        assert entry.user_id == test_user.id
        assert entry.event_type == AuditService.EVENT_LOGIN
        assert entry.event_data == {"method": "password", "success": True}
        assert entry.ip_address == "192.168.1.1"
        assert entry.user_agent == "Mozilla/5.0"
        assert entry.prev_hash == "0" * 64  # First entry
        assert len(entry.entry_hash) == 64  # SHA-256 hash

    @pytest.mark.asyncio()
    async def test_hash_chain_links_entries(
        self,
        audit_service: AuditService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test that entries are properly linked in hash chain."""
        # Create first entry
        entry1 = await audit_service.log_event(
            user_id=test_user.id,
            event_type=AuditService.EVENT_LOGIN,
            event_data={"session": "abc123"},
        )

        # Create second entry
        entry2 = await audit_service.log_event(
            user_id=test_user.id,
            event_type=AuditService.EVENT_LOGOUT,
            event_data={"session": "abc123"},
        )

        # Second entry should link to first
        assert entry2.prev_hash == entry1.entry_hash
        assert entry2.entry_hash != entry1.entry_hash

    @pytest.mark.asyncio()
    async def test_verify_audit_integrity_valid(
        self,
        audit_service: AuditService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test integrity verification for valid chain."""
        # Create a chain of entries
        for i in range(3):
            await audit_service.log_event(
                user_id=test_user.id,
                event_type=AuditService.EVENT_LOGIN,
                event_data={"attempt": i},
            )

        # Verify integrity
        is_valid, error = await audit_service.verify_audit_integrity(test_user.id)
        assert is_valid is True
        assert error is None

    @pytest.mark.asyncio()
    async def test_verify_audit_integrity_detects_tampering(
        self,
        audit_service: AuditService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test that integrity verification detects tampering."""
        # Create entries
        await audit_service.log_event(
            user_id=test_user.id,
            event_type=AuditService.EVENT_LOGIN,
            event_data={"original": True},
        )

        # Tamper with an entry directly
        from sqlalchemy import select

        entry = await db_session.scalar(
            select(AuditLogEntry).where(AuditLogEntry.user_id == test_user.id)
        )
        if entry:
            entry.event_data = {"tampered": True}
            await db_session.flush()

        # Verify integrity should fail
        is_valid, error = await audit_service.verify_audit_integrity(test_user.id)
        assert is_valid is False
        assert error is not None
        assert "entry_hash mismatch" in error

    @pytest.mark.asyncio()
    async def test_get_user_audit_log(
        self,
        audit_service: AuditService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test retrieving user audit log."""
        # Create various entries
        await audit_service.log_event(
            user_id=test_user.id,
            event_type=AuditService.EVENT_LOGIN,
            event_data={},
        )
        await audit_service.log_event(
            user_id=test_user.id,
            event_type=AuditService.EVENT_PASSWORD_CHANGE,
            event_data={},
        )
        await audit_service.log_event(
            user_id=test_user.id,
            event_type=AuditService.EVENT_LOGOUT,
            event_data={},
        )

        # Get all entries
        entries = await audit_service.get_user_audit_log(test_user.id)
        assert len(entries) == 3

        # Test filtering by event type
        login_entries = await audit_service.get_user_audit_log(
            test_user.id, event_types=[AuditService.EVENT_LOGIN]
        )
        assert len(login_entries) == 1
        assert login_entries[0].event_type == AuditService.EVENT_LOGIN

    @pytest.mark.asyncio()
    async def test_get_device_audit_log(
        self,
        audit_service: AuditService,
        test_user: User,
        test_device: UserDevice,
        db_session: AsyncSession,
    ) -> None:
        """Test retrieving device-specific audit log."""
        # Create entries with and without device
        await audit_service.log_event(
            user_id=test_user.id,
            event_type=AuditService.EVENT_LOGIN,
            event_data={},
            device_id=test_device.id,
        )
        await audit_service.log_event(
            user_id=test_user.id,
            event_type=AuditService.EVENT_LOGOUT,
            event_data={},
            device_id=None,  # No device
        )

        # Get device entries
        entries = await audit_service.get_device_audit_log(test_device.id, test_user.id)
        assert len(entries) == 1
        assert entries[0].device_id == test_device.id

    @pytest.mark.asyncio()
    async def test_format_audit_entry(
        self,
        audit_service: AuditService,
        test_user: User,
        test_device: UserDevice,
        db_session: AsyncSession,
    ) -> None:
        """Test formatting audit entry for display."""
        entry = await audit_service.log_event(
            user_id=test_user.id,
            event_type=AuditService.EVENT_DEVICE_TRUSTED,
            event_data={"device_name": "My Phone"},
            device_id=test_device.id,
            ip_address="10.0.0.1",
            user_agent="TestAgent",
        )

        formatted = audit_service.format_audit_entry(entry)

        assert formatted["id"] == str(entry.id)
        assert formatted["event_type"] == AuditService.EVENT_DEVICE_TRUSTED
        assert formatted["event_data"] == {"device_name": "My Phone"}
        assert formatted["ip_address"] == "10.0.0.1"
        assert formatted["user_agent"] == "TestAgent"
        assert formatted["device_id"] == str(test_device.id)
        assert formatted["entry_hash"] == entry.entry_hash

    @pytest.mark.asyncio()
    async def test_event_constants(
        self,
        audit_service: AuditService,
    ) -> None:
        """Test that event type constants are defined."""
        # Just verify the constants exist and are strings
        assert isinstance(AuditService.EVENT_LOGIN, str)
        assert isinstance(AuditService.EVENT_LOGOUT, str)
        assert isinstance(AuditService.EVENT_PASSWORD_CHANGE, str)
        assert isinstance(AuditService.EVENT_DATA_EXPORT, str)
        assert isinstance(AuditService.EVENT_DELETION_REQUESTED, str)
        assert isinstance(AuditService.EVENT_DELETION_CANCELLED, str)
