"""WebAuthn step-up authentication for sensitive actions."""

from __future__ import annotations

import base64
import secrets

from datetime import UTC, datetime, timedelta
from typing import Any, Literal
from uuid import UUID

from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.infra.sa_models import AuditLogEntry


SensitiveAction = Literal[
    "delete_account",
    "export_data",
    "change_email",
    "disable_2fa",
    "view_recovery_codes",
    "add_passkey",
    "remove_passkey",
    "change_password",
    "revoke_all_sessions",
]


class StepUpAuthService:
    """Require fresh WebAuthn authentication for sensitive actions."""

    # Time window for considering auth "fresh"
    FRESH_AUTH_WINDOW = timedelta(minutes=5)

    # Challenge TTL
    CHALLENGE_TTL = 300  # 5 minutes

    def __init__(self, session: AsyncSession, redis: Redis) -> None:
        self.session = session
        self.redis = redis
        self.audit_service = AuditService(session)

    async def require_fresh_auth(
        self, user_id: UUID, action: SensitiveAction, ip_address: str | None = None
    ) -> dict[str, Any]:
        """Check if fresh authentication is required for an action.

        Args:
            user_id: User ID
            action: The sensitive action being performed
            ip_address: Client IP address for audit logging

        Returns:
            Dictionary with authentication requirements
        """
        # Check for recent WebAuthn authentication
        recent_auth = await self._get_recent_auth(user_id, action)

        if recent_auth:
            # User has recent auth for this action
            return {
                "required": False,
                "recent_auth": recent_auth.created_at.isoformat(),
                "action": action,
            }

        # Generate fresh challenge
        challenge = await self._generate_challenge(user_id, action)

        # Log step-up requirement
        await self.audit_service.log_event(
            user_id=user_id,
            event_type="stepup_required",
            event_data={"action": action, "challenge_issued": True},
            ip_address=ip_address,
        )

        return {
            "required": True,
            "challenge": challenge,
            "action": action,
            "expires_at": (datetime.now(UTC) + timedelta(seconds=self.CHALLENGE_TTL)).isoformat(),
        }

    async def verify_step_up(
        self,
        user_id: UUID,
        action: SensitiveAction,
        challenge: str,
        ip_address: str | None = None,
    ) -> bool:
        """Verify a step-up authentication challenge.

        Args:
            user_id: User ID
            action: The action being authorized
            challenge: The challenge that was completed
            ip_address: Client IP for audit logging

        Returns:
            True if verification successful
        """
        # Verify challenge exists and matches
        stored_challenge = await self._get_stored_challenge(user_id, action)

        if not stored_challenge or stored_challenge != challenge:
            # Log failed attempt
            await self.audit_service.log_event(
                user_id=user_id,
                event_type="stepup_failed",
                event_data={
                    "action": action,
                    "reason": "invalid_challenge",
                },
                ip_address=ip_address,
            )
            return False

        # Clear the challenge
        await self._clear_challenge(user_id, action)

        # Log successful step-up
        await self.audit_service.log_event(
            user_id=user_id,
            event_type="stepup_verified",
            event_data={"action": action},
            ip_address=ip_address,
        )

        # Store verification for the fresh auth window
        await self._store_verification(user_id, action)

        return True

    async def _get_recent_auth(
        self, user_id: UUID, _action: SensitiveAction
    ) -> AuditLogEntry | None:
        """Check for recent step-up authentication.

        Args:
            user_id: User ID
            action: The action to check

        Returns:
            Recent auth entry if found
        """
        cutoff_time = datetime.now(UTC) - self.FRESH_AUTH_WINDOW

        result = await self.session.scalar(
            select(AuditLogEntry)
            .where(
                AuditLogEntry.user_id == user_id,
                AuditLogEntry.event_type == "stepup_verified",
                AuditLogEntry.created_at > cutoff_time,
            )
            .order_by(AuditLogEntry.created_at.desc())
            .limit(1)
        )
        return result

    async def _generate_challenge(self, user_id: UUID, action: SensitiveAction) -> str:
        """Generate and store a new challenge.

        Args:
            user_id: User ID
            action: The action requiring auth

        Returns:
            Base64-encoded challenge
        """
        # Generate cryptographically secure challenge
        challenge_bytes = secrets.token_bytes(32)
        challenge = base64.b64encode(challenge_bytes).decode()

        # Store with TTL
        key = f"stepup:{user_id}:{action}"
        await self.redis.setex(key, self.CHALLENGE_TTL, challenge)

        return challenge

    async def _get_stored_challenge(self, user_id: UUID, action: SensitiveAction) -> str | None:
        """Retrieve a stored challenge.

        Args:
            user_id: User ID
            action: The action

        Returns:
            Stored challenge or None
        """
        key = f"stepup:{user_id}:{action}"
        value = await self.redis.get(key)
        return value.decode() if value else None

    async def _clear_challenge(self, user_id: UUID, action: SensitiveAction) -> None:
        """Clear a stored challenge.

        Args:
            user_id: User ID
            action: The action
        """
        key = f"stepup:{user_id}:{action}"
        await self.redis.delete(key)

    async def _store_verification(self, user_id: UUID, action: SensitiveAction) -> None:
        """Store successful verification for fresh auth window.

        Args:
            user_id: User ID
            action: The verified action
        """
        key = f"stepup_verified:{user_id}:{action}"
        ttl = int(self.FRESH_AUTH_WINDOW.total_seconds())
        await self.redis.setex(key, ttl, "1")

    async def clear_all_challenges(self, user_id: UUID) -> int:
        """Clear all pending challenges for a user.

        Args:
            user_id: User ID

        Returns:
            Number of challenges cleared
        """
        pattern = f"stepup:{user_id}:*"
        cursor = 0
        cleared = 0

        while True:
            cursor, keys = await self.redis.scan(cursor, match=pattern, count=100)
            if keys:
                await self.redis.delete(*keys)
                cleared += len(keys)
            if cursor == 0:
                break

        if cleared > 0:
            await self.audit_service.log_event(
                user_id=user_id,
                event_type="stepup_cleared",
                event_data={"challenges_cleared": cleared},
            )

        return cleared

    async def get_pending_challenges(self, user_id: UUID) -> list[str]:
        """Get list of pending challenge actions for a user.

        Args:
            user_id: User ID

        Returns:
            List of actions with pending challenges
        """
        pattern = f"stepup:{user_id}:*"
        cursor = 0
        actions = []

        while True:
            cursor, keys = await self.redis.scan(cursor, match=pattern, count=100)
            for key in keys:
                # Extract action from key
                parts = key.decode().split(":")
                if len(parts) >= 3:
                    actions.append(parts[2])
            if cursor == 0:
                break

        return actions
