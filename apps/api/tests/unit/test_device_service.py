"""Tests for device management service."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.device_service import DeviceService
from app.infra.sa_models import User, UserDevice, UserSession


class TestDeviceService:
    """Test suite for DeviceService."""

    @pytest.fixture
    def device_service(self, db_session: AsyncSession) -> DeviceService:
        """Create DeviceService instance."""
        return DeviceService(db_session)

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
    async def test_register_device(
        self,
        device_service: DeviceService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test device registration."""
        device = await device_service.register_device(
            user_id=test_user.id,
            device_name="My iPhone",
            browser="Safari",
            os="iOS",
            location_region="San Francisco, CA",
        )

        assert device.user_id == test_user.id
        assert device.device_name == "My iPhone"
        assert device.browser == "Safari"
        assert device.os == "iOS"
        assert device.location_region == "San Francisco, CA"
        assert device.trusted is False  # New devices start untrusted
        assert device.last_seen_at is not None
        assert device.created_at is not None

    @pytest.mark.asyncio()
    async def test_list_user_devices(
        self,
        device_service: DeviceService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test listing user devices."""
        # Create multiple devices
        device1 = await device_service.register_device(
            test_user.id, "iPhone", "Safari", "iOS"
        )
        device2 = await device_service.register_device(
            test_user.id, "MacBook", "Chrome", "macOS"
        )

        devices = await device_service.list_user_devices(test_user.id)

        assert len(devices) == 2
        device_names = [d.device_name for d in devices]
        assert "iPhone" in device_names
        assert "MacBook" in device_names

    @pytest.mark.asyncio()
    async def test_get_device_with_valid_user(
        self,
        device_service: DeviceService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test getting device that belongs to user."""
        device = await device_service.register_device(
            test_user.id, "Test Device", "Chrome", "Linux"
        )

        retrieved = await device_service.get_device(device.id, test_user.id)

        assert retrieved is not None
        assert retrieved.id == device.id
        assert retrieved.device_name == "Test Device"

    @pytest.mark.asyncio()
    async def test_get_device_with_wrong_user(
        self,
        device_service: DeviceService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test getting device with wrong user ID."""
        device = await device_service.register_device(
            test_user.id, "Test Device", "Chrome", "Linux"
        )

        # Try to get device with different user ID
        wrong_user_id = uuid4()
        retrieved = await device_service.get_device(device.id, wrong_user_id)

        assert retrieved is None

    @pytest.mark.asyncio()
    async def test_update_device_name(
        self,
        device_service: DeviceService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test updating device name."""
        device = await device_service.register_device(
            test_user.id, "Old Name", "Chrome", "Linux"
        )

        success = await device_service.update_device_name(
            device.id, test_user.id, "New Name"
        )
        
        assert success is True

        updated = await device_service.get_device(device.id, test_user.id)
        assert updated is not None
        assert updated.device_name == "New Name"

    @pytest.mark.asyncio()
    async def test_mark_device_trusted(
        self,
        device_service: DeviceService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test marking device as trusted."""
        device = await device_service.register_device(
            test_user.id, "Test Device", "Chrome", "Linux"
        )
        
        assert device.trusted is False

        success = await device_service.mark_device_trusted(
            device.id, test_user.id, True
        )
        
        assert success is True

        updated = await device_service.get_device(device.id, test_user.id)
        assert updated is not None
        assert updated.trusted is True

        # Test untrusting
        success = await device_service.mark_device_trusted(
            device.id, test_user.id, False
        )
        
        assert success is True

        updated = await device_service.get_device(device.id, test_user.id)
        assert updated is not None
        assert updated.trusted is False

    @pytest.mark.asyncio()
    async def test_delete_device_and_revoke_sessions(
        self,
        device_service: DeviceService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test deleting device and revoking its sessions."""
        device = await device_service.register_device(
            test_user.id, "Test Device", "Chrome", "Linux"
        )

        # Create a session for this device
        session = UserSession(
            user_id=test_user.id,
            device_id=device.id,
            expires_at=datetime.now(UTC),
            revoked_at=None,
        )
        db_session.add(session)
        await db_session.flush()

        success = await device_service.delete_device(device.id, test_user.id)
        
        assert success is True

        # Device should be deleted
        deleted = await device_service.get_device(device.id, test_user.id)
        assert deleted is None

        # Session should be revoked
        await db_session.refresh(session)
        assert session.revoked_at is not None

    @pytest.mark.asyncio()
    async def test_get_device_sessions(
        self,
        device_service: DeviceService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test getting sessions for a device."""
        device = await device_service.register_device(
            test_user.id, "Test Device", "Chrome", "Linux"
        )

        # Create sessions for this device
        session1 = UserSession(
            user_id=test_user.id,
            device_id=device.id,
            expires_at=datetime.now(UTC),
            revoked_at=None,
        )
        session2 = UserSession(
            user_id=test_user.id,
            device_id=device.id,
            expires_at=datetime.now(UTC),
            revoked_at=datetime.now(UTC),  # This one is revoked
        )
        db_session.add_all([session1, session2])
        await db_session.flush()

        sessions = await device_service.get_device_sessions(device.id, test_user.id)

        # Should only return non-revoked sessions
        assert len(sessions) == 1
        assert sessions[0].id == session1.id

    @pytest.mark.asyncio()
    async def test_revoke_device_sessions(
        self,
        device_service: DeviceService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test revoking all sessions for a device."""
        device = await device_service.register_device(
            test_user.id, "Test Device", "Chrome", "Linux"
        )

        # Create multiple sessions
        sessions = []
        for i in range(3):
            session = UserSession(
                user_id=test_user.id,
                device_id=device.id,
                expires_at=datetime.now(UTC),
                revoked_at=None,
            )
            sessions.append(session)
            db_session.add(session)
        await db_session.flush()

        count = await device_service.revoke_device_sessions(device.id, test_user.id)

        assert count == 3

        # All sessions should be revoked
        for session in sessions:
            await db_session.refresh(session)
            assert session.revoked_at is not None

    @pytest.mark.asyncio()
    async def test_format_device_info(
        self,
        device_service: DeviceService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test formatting device info for display."""
        device = await device_service.register_device(
            user_id=test_user.id,
            device_name="Test Device",
            browser="Chrome",
            os="Linux",
            location_region="New York, NY",
        )

        info = device_service.format_device_info(device)

        assert info["id"] == str(device.id)
        assert info["device_name"] == "Test Device"
        assert info["browser"] == "Chrome"
        assert info["os"] == "Linux"
        assert info["location_region"] == "New York, NY"
        assert info["trusted"] is False
        assert "last_seen_at" in info
        assert "created_at" in info