"""OAuth token rotation detection service (RFC 9700)."""

from __future__ import annotations

import hashlib

from collections.abc import Awaitable as _Awaitable
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from redis.asyncio import Redis
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.infra.sa_models import UserSession


class TokenRotationService:
    """Detect and prevent refresh token reuse attacks per RFC 9700."""

    def __init__(self, session: AsyncSession, redis: Redis) -> None:
        self.session = session
        self.redis = redis
        self.audit_service = AuditService(session)

    @staticmethod
    async def _resolve(value: Any) -> Any:
        """Resolve possibly awaitable Redis operations for unit test mocks."""
        if isinstance(value, _Awaitable) or hasattr(value, "__await__"):
            return await value
        return value

    async def check_refresh_token_reuse(self, token_hash: str, user_id: UUID) -> bool:
        """Detect if a refresh token has been reused.

        Args:
            token_hash: SHA-256 hash of the refresh token
            user_id: User ID associated with the token

        Returns:
            True if token was reused (security incident), False otherwise
        """
        used_key = f"used_refresh:{token_hash}"

        # Check if token has been used before
        if await self._resolve(self.redis.exists(used_key)):
            # SECURITY ALERT: Token reuse detected
            await self._handle_token_reuse_incident(user_id, token_hash)
            return True

        # Mark token as used with 24hr TTL
        await self._resolve(self.redis.setex(used_key, 86400, "1"))
        return False

    async def mark_token_rotated(
        self, old_token_hash: str, new_token_hash: str, user_id: UUID
    ) -> None:
        """Mark a token as rotated and track the new token.

        Args:
            old_token_hash: Hash of the old refresh token
            new_token_hash: Hash of the new refresh token
            user_id: User ID for audit logging
        """
        # Mark old token as rotated
        await self._resolve(self.redis.setex(f"rotated:{old_token_hash}", 86400, new_token_hash))

        # Track rotation in audit log
        await self.audit_service.log_event(
            user_id=user_id,
            event_type="token_rotated",
            event_data={
                "old_hash": old_token_hash[:8] + "...",  # Log partial hash
                "new_hash": new_token_hash[:8] + "...",
            },
        )

    async def _handle_token_reuse_incident(self, user_id: UUID, token_hash: str) -> None:
        """Handle a detected token reuse incident.

        Args:
            user_id: User whose token was reused
            token_hash: Hash of the reused token
        """
        # Revoke all user sessions immediately
        await self.revoke_all_user_tokens(user_id)

        # Log security incident with high priority
        await self.audit_service.log_event(
            user_id=user_id,
            event_type="security_incident",
            event_data={
                "incident_type": "refresh_token_reuse",
                "token_hash": token_hash[:8] + "...",  # Log partial hash
                "action_taken": "all_sessions_revoked",
                "severity": "high",
            },
        )

        # Could trigger additional alerts here (email, monitoring, etc.)

    async def revoke_all_user_tokens(self, user_id: UUID) -> int:
        """Revoke all tokens and sessions for a user.

        Args:
            user_id: User whose tokens should be revoked

        Returns:
            Number of sessions revoked
        """
        # Revoke all database sessions
        result = await self.session.execute(
            update(UserSession)
            .where(UserSession.user_id == user_id)
            .where(UserSession.revoked_at.is_(None))
            .values(revoked_at=datetime.now(UTC))
        )
        revoked_count = result.rowcount or 0

        # Clear all Redis-stored OAuth tokens
        oauth_keys = [
            f"oauth_tokens:{user_id}",
            f"oauth_refresh:{user_id}",
            f"oauth_access:{user_id}",
        ]
        for key in oauth_keys:
            await self._resolve(self.redis.delete(key))

        # Clear any step-up auth challenges
        pattern = f"stepup:{user_id}:*"
        cursor = 0
        keys_to_delete: list[bytes] = []
        while True:
            cursor, keys = await self._resolve(self.redis.scan(cursor, match=pattern, count=100))
            if keys:
                keys_to_delete.extend(keys)
            if cursor == 0:
                break
        if keys_to_delete:
            await self._resolve(self.redis.delete(*keys_to_delete))

        return revoked_count

    async def get_token_rotation_history(self, user_id: UUID, limit: int = 10) -> list[dict[str, Any]]:
        """Get recent token rotation history for a user.

        Args:
            user_id: User ID
            limit: Maximum number of entries to return

        Returns:
            List of rotation events from audit log
        """
        entries = await self.audit_service.get_user_audit_log(
            user_id=user_id,
            event_types=["token_rotated", "security_incident"],
            limit=limit,
        )

        return [
            {
                "timestamp": entry.created_at.isoformat(),
                "event_type": entry.event_type,
                "details": entry.event_data,
            }
            for entry in entries
        ]

    @staticmethod
    def hash_token(token: str) -> str:
        """Create a SHA-256 hash of a token.

        Args:
            token: The token to hash

        Returns:
            Hex-encoded SHA-256 hash
        """
        return hashlib.sha256(token.encode()).hexdigest()
