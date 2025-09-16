"""Privacy dashboard service for data export and deletion scheduling."""

from __future__ import annotations

import csv
from datetime import UTC, datetime, timedelta
import io
import json
import secrets
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.infra.sa_models import AuditLogEntry, DeletionRequest, Entry, User, UserDevice, UserSession


class PrivacyService:
    """Service for privacy-related operations: data export and deletion."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.audit_service = AuditService(session)

    async def export_user_data(
        self, user_id: UUID, export_format: str = "json"
    ) -> tuple[str, str, bytes]:
        """Export all user data in requested format.

        Args:
            user_id: User ID to export data for
            export_format: Export format ("json" or "csv")

        Returns:
            Tuple of (filename, content_type, data_bytes)
        """
        # Collect all user data
        user_data = await self._collect_user_data(user_id)

        # Log the export event
        await self.audit_service.log_event(
            user_id=user_id,
            event_type=AuditService.EVENT_DATA_EXPORT,
            event_data={"format": export_format, "timestamp": datetime.now(UTC).isoformat()},
        )

        # Format the data
        if export_format == "csv":
            return PrivacyService._export_as_csv(user_data, user_id)
        return PrivacyService._export_as_json(user_data, user_id)

    async def _collect_user_data(self, user_id: UUID) -> dict[str, Any]:
        """Collect all user data from various tables.

        Args:
            user_id: User ID

        Returns:
            Dictionary containing all user data
        """
        # Get user profile
        user = await self.session.scalar(select(User).where(User.id == user_id))
        if not user:
            raise ValueError("User not found")

        # Get entries (journal content)
        entries_result = await self.session.scalars(select(Entry).where(Entry.author_id == user_id))
        entries = list(entries_result)

        # Get devices
        devices_result = await self.session.scalars(
            select(UserDevice).where(UserDevice.user_id == user_id)
        )
        devices = list(devices_result)

        # Get sessions
        sessions_result = await self.session.scalars(
            select(UserSession).where(UserSession.user_id == user_id)
        )
        sessions = list(sessions_result)

        # Get audit log
        audit_result = await self.session.scalars(
            select(AuditLogEntry).where(AuditLogEntry.user_id == user_id)
        )
        audit_log = list(audit_result)

        return {
            "export_timestamp": datetime.now(UTC).isoformat(),
            "user": {
                "id": str(user.id),
                "email": user.email,
                "username": user.username,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat(),
            },
            "entries": [
                {
                    "id": str(entry.id),
                    "title": entry.title,
                    "content": entry.content,
                    "markdown_content": entry.markdown_content,
                    "word_count": entry.word_count,
                    "char_count": entry.char_count,
                    "created_at": entry.created_at.isoformat(),
                    "updated_at": entry.updated_at.isoformat(),
                }
                for entry in entries
            ],
            "devices": [
                {
                    "id": str(device.id),
                    "device_name": device.device_name,
                    "browser": device.browser,
                    "os": device.os,
                    "location_region": device.location_region,
                    "trusted": device.trusted,
                    "last_seen_at": device.last_seen_at.isoformat(),
                    "created_at": device.created_at.isoformat(),
                }
                for device in devices
            ],
            "sessions": [
                {
                    "id": str(session.id),
                    "device_id": str(session.device_id) if session.device_id else None,
                    "user_agent": session.user_agent,
                    "ip_address": session.ip_address,
                    "issued_at": session.issued_at.isoformat(),
                    "last_used_at": session.last_used_at.isoformat(),
                    "expires_at": session.expires_at.isoformat(),
                    "revoked_at": session.revoked_at.isoformat() if session.revoked_at else None,
                }
                for session in sessions
            ],
            "audit_log": [
                {
                    "id": str(log.id),
                    "event_type": log.event_type,
                    "event_data": log.event_data,
                    "ip_address": log.ip_address,
                    "user_agent": log.user_agent,
                    "device_id": str(log.device_id) if log.device_id else None,
                    "created_at": log.created_at.isoformat(),
                }
                for log in audit_log
            ],
        }

    @staticmethod
    def _export_as_json(data: dict[str, Any], user_id: UUID) -> tuple[str, str, bytes]:
        """Export data as JSON.

        Args:
            data: User data dictionary
            user_id: User ID for filename

        Returns:
            Tuple of (filename, content_type, data_bytes)
        """
        json_data = json.dumps(data, indent=2, sort_keys=True)
        filename = f"user_data_{user_id}_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}.json"
        return filename, "application/json", json_data.encode()

    @staticmethod
    def _export_as_csv(data: dict[str, Any], user_id: UUID) -> tuple[str, str, bytes]:
        """Export data as CSV (simplified format).

        Args:
            data: User data dictionary
            user_id: User ID for filename

        Returns:
            Tuple of (filename, content_type, data_bytes)
        """
        output = io.StringIO()

        # Export entries as main CSV content
        if data["entries"]:
            writer = csv.DictWriter(
                output,
                fieldnames=[
                    "id",
                    "title",
                    "content",
                    "markdown_content",
                    "word_count",
                    "created_at",
                    "updated_at",
                ],
            )
            writer.writeheader()
            for entry in data["entries"]:
                writer.writerow({
                    "id": entry["id"],
                    "title": entry["title"],
                    "content": entry["content"] or "",
                    "markdown_content": entry["markdown_content"] or "",
                    "word_count": entry["word_count"] or 0,
                    "created_at": entry["created_at"],
                    "updated_at": entry["updated_at"],
                })

        csv_data = output.getvalue()
        filename = f"user_entries_{user_id}_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}.csv"
        return filename, "text/csv", csv_data.encode()

    async def schedule_deletion(
        self, user_id: UUID, days_until_deletion: int = 30
    ) -> DeletionRequest:
        """Schedule account deletion with undo window.

        Args:
            user_id: User ID to schedule for deletion
            days_until_deletion: Days until deletion (default 30)

        Returns:
            Created deletion request
        """
        # Check if there's already a pending deletion
        existing = await self.session.scalar(
            select(DeletionRequest)
            .where(DeletionRequest.user_id == user_id)
            .where(DeletionRequest.executed_at.is_(None))
            .where(DeletionRequest.cancelled_at.is_(None))
        )
        if existing:
            raise ValueError("Deletion already scheduled for this user")

        # Create deletion request
        now = datetime.now(UTC)
        deletion_request = DeletionRequest(
            user_id=user_id,
            requested_at=now,
            scheduled_for=now + timedelta(days=days_until_deletion),
            undo_token=secrets.token_urlsafe(32),
            undo_expires_at=now + timedelta(days=7),  # 7-day undo window
        )

        self.session.add(deletion_request)
        await self.session.flush()

        # Log the event
        await self.audit_service.log_event(
            user_id=user_id,
            event_type=AuditService.EVENT_DELETION_REQUESTED,
            event_data={
                "scheduled_for": deletion_request.scheduled_for.isoformat(),
                "undo_expires_at": deletion_request.undo_expires_at.isoformat(),
            },
        )

        return deletion_request

    async def cancel_deletion(self, user_id: UUID, undo_token: str) -> bool:
        """Cancel a scheduled deletion using the undo token.

        Args:
            user_id: User ID
            undo_token: Undo token provided during scheduling

        Returns:
            True if cancelled, False if not found or expired
        """
        deletion_request = await self.session.scalar(
            select(DeletionRequest)
            .where(DeletionRequest.user_id == user_id)
            .where(DeletionRequest.undo_token == undo_token)
            .where(DeletionRequest.executed_at.is_(None))
            .where(DeletionRequest.cancelled_at.is_(None))
        )

        if not deletion_request:
            return False

        # Check if undo period has expired
        if datetime.now(UTC) > deletion_request.undo_expires_at:
            return False

        # Cancel the deletion
        deletion_request.cancelled_at = datetime.now(UTC)
        await self.session.flush()

        # Log the event
        await self.audit_service.log_event(
            user_id=user_id,
            event_type=AuditService.EVENT_DELETION_CANCELLED,
            event_data={"cancelled_at": deletion_request.cancelled_at.isoformat()},
        )

        return True

    async def get_deletion_status(self, user_id: UUID) -> dict[str, Any] | None:
        """Get the status of a deletion request.

        Args:
            user_id: User ID

        Returns:
            Deletion status or None if no request exists
        """
        deletion_request = await self.session.scalar(
            select(DeletionRequest)
            .where(DeletionRequest.user_id == user_id)
            .order_by(DeletionRequest.requested_at.desc())
            .limit(1)
        )

        if not deletion_request:
            return None

        now = datetime.now(UTC)
        return {
            "requested_at": deletion_request.requested_at.isoformat(),
            "scheduled_for": deletion_request.scheduled_for.isoformat(),
            "can_undo": (
                deletion_request.cancelled_at is None
                and deletion_request.executed_at is None
                and now <= deletion_request.undo_expires_at
            ),
            "undo_expires_at": deletion_request.undo_expires_at.isoformat(),
            "status": PrivacyService._get_deletion_status(deletion_request),
            "days_remaining": max(0, (deletion_request.scheduled_for - now).days),
        }

    @staticmethod
    def _get_deletion_status(request: DeletionRequest) -> str:
        """Get human-readable deletion status.

        Args:
            request: Deletion request

        Returns:
            Status string
        """
        if request.executed_at:
            return "executed"
        if request.cancelled_at:
            return "cancelled"
        if datetime.now(UTC) > request.scheduled_for:
            return "pending_execution"
        return "scheduled"

    async def get_privacy_summary(self, user_id: UUID) -> dict[str, Any]:
        """Get privacy dashboard summary for a user.

        Args:
            user_id: User ID

        Returns:
            Privacy summary dictionary
        """
        # Count data across tables
        entries_count = await self.session.scalar(
            select(func.count()).select_from(Entry).where(Entry.author_id == user_id)
        )
        devices_count = await self.session.scalar(
            select(func.count()).select_from(UserDevice).where(UserDevice.user_id == user_id)
        )
        sessions_count = await self.session.scalar(
            select(func.count())
            .select_from(UserSession)
            .where(UserSession.user_id == user_id)
            .where(UserSession.revoked_at.is_(None))
        )

        # Get deletion status
        deletion_status = await self.get_deletion_status(user_id)

        # Verify audit log integrity
        integrity_valid, _ = await self.audit_service.verify_audit_integrity(user_id)

        return {
            "data_summary": {
                "entries": entries_count or 0,
                "devices": devices_count or 0,
                "active_sessions": sessions_count or 0,
            },
            "deletion_status": deletion_status,
            "audit_log_integrity": integrity_valid,
            "export_formats": ["json", "csv"],
        }
