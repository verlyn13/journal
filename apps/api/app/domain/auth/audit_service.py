"""Audit log service with hash-chaining for tamper evidence."""

from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.sa_models import AuditLogEntry, UserDevice


class AuditService:
    """Service for managing hash-chained audit logs."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def log_event(
        self,
        user_id: UUID,
        event_type: str,
        event_data: dict[str, Any],
        ip_address: str | None = None,
        user_agent: str | None = None,
        device_id: UUID | None = None,
    ) -> AuditLogEntry:
        """Log an event with hash-chaining for tamper evidence.

        Args:
            user_id: User ID who triggered the event
            event_type: Type of event (e.g., "login", "logout", "password_change")
            event_data: JSON-serializable event details
            ip_address: Client IP address
            user_agent: Client user agent string
            device_id: Device ID if available

        Returns:
            Created audit log entry
        """
        # Get previous entry's hash for this user
        prev_entry = await self.session.scalar(
            select(AuditLogEntry)
            .where(AuditLogEntry.user_id == user_id)
            .order_by(AuditLogEntry.created_at.desc())
            .limit(1)
        )
        prev_hash = prev_entry.entry_hash if prev_entry else "0" * 64

        # Create new entry
        entry = AuditLogEntry(
            user_id=user_id,
            event_type=event_type,
            event_data=event_data,
            ip_address=ip_address,
            user_agent=user_agent,
            device_id=device_id,
            prev_hash=prev_hash,
            created_at=datetime.now(UTC),
            entry_hash="",  # Will be computed below
        )

        # Compute entry hash
        entry.entry_hash = AuditService._compute_entry_hash(entry)

        self.session.add(entry)
        await self.session.flush()
        return entry

    @staticmethod
    def _compute_entry_hash(entry: AuditLogEntry) -> str:
        """Compute SHA-256 hash for audit log entry.

        Args:
            entry: Audit log entry to hash

        Returns:
            Hex-encoded SHA-256 hash
        """
        # Create deterministic content string
        content = json.dumps(
            {
                "user_id": str(entry.user_id),
                "event_type": entry.event_type,
                "event_data": entry.event_data,
                "ip_address": entry.ip_address,
                "user_agent": entry.user_agent,
                "device_id": str(entry.device_id) if entry.device_id else None,
                "prev_hash": entry.prev_hash,
                "created_at": entry.created_at.isoformat(),
            },
            sort_keys=True,
            separators=(",", ":"),
            default=str,
        )
        return hashlib.sha256(content.encode()).hexdigest()

    async def verify_audit_integrity(self, user_id: UUID) -> tuple[bool, str | None]:
        """Verify the hash chain integrity for a user's audit log.

        Args:
            user_id: User ID to verify

        Returns:
            Tuple of (is_valid, error_message)
        """
        entries = await self.session.scalars(
            select(AuditLogEntry)
            .where(AuditLogEntry.user_id == user_id)
            .order_by(AuditLogEntry.created_at.asc())
        )

        prev_hash = "0" * 64
        for entry in entries:
            # Check that prev_hash matches
            if entry.prev_hash != prev_hash:
                return False, f"Hash chain broken at entry {entry.id}: prev_hash mismatch"

            # Recompute and verify entry hash
            expected_hash = AuditService._compute_entry_hash(entry)
            if entry.entry_hash != expected_hash:
                return False, f"Hash chain broken at entry {entry.id}: entry_hash mismatch"

            prev_hash = entry.entry_hash

        return True, None

    async def get_user_audit_log(
        self,
        user_id: UUID,
        limit: int = 100,
        offset: int = 0,
        event_types: list[str] | None = None,
    ) -> list[AuditLogEntry]:
        """Get audit log entries for a user.

        Args:
            user_id: User ID
            limit: Maximum number of entries to return
            offset: Number of entries to skip
            event_types: Optional filter by event types

        Returns:
            List of audit log entries
        """
        query = (
            select(AuditLogEntry)
            .where(AuditLogEntry.user_id == user_id)
            .order_by(AuditLogEntry.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        if event_types:
            query = query.where(AuditLogEntry.event_type.in_(event_types))

        result = await self.session.scalars(query)
        return list(result)

    async def get_device_audit_log(self, device_id: UUID, user_id: UUID) -> list[AuditLogEntry]:
        """Get audit log entries for a specific device.

        Args:
            device_id: Device ID
            user_id: User ID (for verification)

        Returns:
            List of audit log entries for the device
        """
        # Verify device belongs to user
        device = await self.session.scalar(
            select(UserDevice)
            .where(UserDevice.id == device_id)
            .where(UserDevice.user_id == user_id)
        )
        if not device:
            return []

        result = await self.session.scalars(
            select(AuditLogEntry)
            .where(AuditLogEntry.device_id == device_id)
            .order_by(AuditLogEntry.created_at.desc())
        )
        return list(result)

    @staticmethod
    def format_audit_entry(entry: AuditLogEntry) -> dict[str, Any]:
        """Format audit log entry for display.

        Args:
            entry: Audit log entry

        Returns:
            Formatted entry dictionary
        """
        return {
            "id": str(entry.id),
            "event_type": entry.event_type,
            "event_data": entry.event_data,
            "ip_address": entry.ip_address,
            "user_agent": entry.user_agent,
            "device_id": str(entry.device_id) if entry.device_id else None,
            "created_at": entry.created_at.isoformat(),
            "entry_hash": entry.entry_hash,
        }

    # Common event types as constants
    EVENT_LOGIN = "login"
    EVENT_LOGOUT = "logout"
    EVENT_LOGIN_FAILED = "login_failed"
    EVENT_PASSWORD_CHANGE = "password_change"  # noqa: S105
    EVENT_EMAIL_CHANGE = "email_change"
    EVENT_PASSKEY_ADDED = "passkey_added"
    EVENT_PASSKEY_REMOVED = "passkey_removed"
    EVENT_DEVICE_ADDED = "device_added"
    EVENT_DEVICE_REMOVED = "device_removed"
    EVENT_DEVICE_TRUSTED = "device_trusted"
    EVENT_RECOVERY_CODES_GENERATED = "recovery_codes_generated"
    EVENT_RECOVERY_CODE_USED = "recovery_code_used"
    EVENT_ACCOUNT_LOCKED = "account_locked"
    EVENT_ACCOUNT_UNLOCKED = "account_unlocked"
    EVENT_DATA_EXPORT = "data_export"
    EVENT_DELETION_REQUESTED = "deletion_requested"
    EVENT_DELETION_CANCELLED = "deletion_cancelled"
