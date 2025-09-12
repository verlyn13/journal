"""Device management service with no browser fingerprinting."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.sa_models import UserDevice, UserSession


class DeviceService:
    """Service for managing user devices and sessions (no fingerprinting)."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def register_device(
        self,
        user_id: UUID,
        device_name: str,
        browser: str | None = None,
        os: str | None = None,
        location_region: str | None = None,
    ) -> UserDevice:
        """Register a new device for a user.

        Args:
            user_id: User ID
            device_name: User-provided friendly name for the device
            browser: Browser name for display only (not for fingerprinting)
            os: OS name for display only (not for fingerprinting)
            location_region: Coarse location (city/region, not precise)

        Returns:
            Created UserDevice
        """
        device = UserDevice(
            user_id=user_id,
            device_name=device_name,
            browser=browser,
            os=os,
            location_region=location_region,
            trusted=False,  # New devices start untrusted
            last_seen_at=datetime.now(UTC),
            created_at=datetime.now(UTC),
        )

        self.session.add(device)
        await self.session.flush()
        return device

    async def list_user_devices(self, user_id: UUID) -> list[UserDevice]:
        """List all devices for a user."""
        result = await self.session.scalars(
            select(UserDevice)
            .where(UserDevice.user_id == user_id)
            .order_by(UserDevice.last_seen_at.desc())
        )
        return list(result)

    async def get_device(self, device_id: UUID, user_id: UUID) -> UserDevice | None:
        """Get a device by ID, ensuring it belongs to the user."""
        return await self.session.scalar(  # type: ignore[no-any-return]
            select(UserDevice)
            .where(UserDevice.id == device_id)
            .where(UserDevice.user_id == user_id)
        )

    async def update_device_name(self, device_id: UUID, user_id: UUID, new_name: str) -> bool:
        """Update device name."""
        device = await self.get_device(device_id, user_id)
        if not device:
            return False

        device.device_name = new_name
        await self.session.flush()
        return True

    async def mark_device_trusted(
        self, device_id: UUID, user_id: UUID, trusted: bool = True
    ) -> bool:
        """Mark a device as trusted or untrusted."""
        device = await self.get_device(device_id, user_id)
        if not device:
            return False

        device.trusted = trusted
        await self.session.flush()
        return True

    async def update_device_last_seen(self, device_id: UUID) -> None:
        """Update device last seen timestamp."""
        device = await self.session.scalar(select(UserDevice).where(UserDevice.id == device_id))
        if device:
            device.last_seen_at = datetime.now(UTC)
            await self.session.flush()

    async def delete_device(self, device_id: UUID, user_id: UUID) -> bool:
        """Delete a device and revoke associated sessions."""
        device = await self.get_device(device_id, user_id)
        if not device:
            return False

        # Revoke all sessions for this device
        sessions = await self.session.scalars(
            select(UserSession).where(UserSession.device_id == device_id)
        )
        for session in sessions:
            session.revoked_at = datetime.now(UTC)

        # Delete the device
        await self.session.delete(device)
        await self.session.flush()
        return True

    async def get_device_sessions(self, device_id: UUID, user_id: UUID) -> list[UserSession]:
        """Get all sessions for a device."""
        # Verify device belongs to user
        device = await self.get_device(device_id, user_id)
        if not device:
            return []

        result = await self.session.scalars(
            select(UserSession)
            .where(UserSession.device_id == device_id)
            .where(UserSession.revoked_at.is_(None))
            .order_by(UserSession.last_used_at.desc())
        )
        return list(result)

    async def revoke_device_sessions(self, device_id: UUID, user_id: UUID) -> int:
        """Revoke all active sessions for a device."""
        # Verify device belongs to user
        device = await self.get_device(device_id, user_id)
        if not device:
            return 0

        sessions = await self.session.scalars(
            select(UserSession)
            .where(UserSession.device_id == device_id)
            .where(UserSession.revoked_at.is_(None))
        )

        count = 0
        for session in sessions:
            session.revoked_at = datetime.now(UTC)
            count += 1

        await self.session.flush()
        return count

    @staticmethod
    def format_device_info(device: UserDevice) -> dict[str, Any]:
        """Format device info for display (privacy-safe)."""
        return {
            "id": str(device.id),
            "device_name": device.device_name,
            "browser": device.browser,
            "os": device.os,
            "location_region": device.location_region,
            "trusted": device.trusted,
            "last_seen_at": device.last_seen_at.isoformat(),
            "created_at": device.created_at.isoformat(),
        }
