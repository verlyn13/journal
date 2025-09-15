"""Session cookie management service with enhanced security.

Implements secure session cookies per the token enhancement plan with proper
HttpOnly, Secure, and SameSite flags, idle timeout, and rotation on privilege changes.
"""

from __future__ import annotations

import json
import logging
import secrets

from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

from fastapi import Request, Response
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.settings import settings
from app.types.utilities import validate_cookie_samesite


logger = logging.getLogger(__name__)

# Session constants
SESSION_IDLE_TIMEOUT = timedelta(minutes=30)  # 30 min idle timeout
SESSION_HARD_LIMIT = timedelta(hours=12)  # 12 hour hard cap
SESSION_COOKIE_NAME = "sid"
SESSION_PREFIX = "sess:"


class SessionData:
    """Session data model."""

    def __init__(
        self,
        session_id: str,
        user_id: UUID,
        created_at: datetime,
        last_activity: datetime,
        ip_address: str,
        user_agent: str,
        is_elevated: bool = False,
        elevation_expires: datetime | None = None,
        rotation_count: int = 0,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.session_id = session_id
        self.user_id = user_id
        self.created_at = created_at
        self.last_activity = last_activity
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.is_elevated = is_elevated
        self.elevation_expires = elevation_expires
        self.rotation_count = rotation_count
        self.metadata = metadata or {}

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for storage."""
        return {
            "session_id": self.session_id,
            "user_id": str(self.user_id),
            "created_at": self.created_at.isoformat(),
            "last_activity": self.last_activity.isoformat(),
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "is_elevated": self.is_elevated,
            "elevation_expires": (
                self.elevation_expires.isoformat() if self.elevation_expires else None
            ),
            "rotation_count": self.rotation_count,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> SessionData:
        """Create from dictionary."""
        return cls(
            session_id=data["session_id"],
            user_id=UUID(data["user_id"]),
            created_at=datetime.fromisoformat(data["created_at"]),
            last_activity=datetime.fromisoformat(data["last_activity"]),
            ip_address=data["ip_address"],
            user_agent=data["user_agent"],
            is_elevated=data.get("is_elevated", False),
            elevation_expires=(
                datetime.fromisoformat(data["elevation_expires"])
                if data.get("elevation_expires")
                else None
            ),
            rotation_count=data.get("rotation_count", 0),
            metadata=data.get("metadata", {}),
        )

    def is_expired(self) -> bool:
        """Check if session is expired."""
        now = datetime.now(UTC)

        # Check hard limit
        if now - self.created_at > SESSION_HARD_LIMIT:
            return True

        # Check idle timeout
        return now - self.last_activity > SESSION_IDLE_TIMEOUT

    def needs_rotation(self) -> bool:
        """Check if session needs rotation."""
        # Rotate after every 10 requests or 15 minutes
        if self.rotation_count >= 10:
            return True

        return datetime.now(UTC) - self.last_activity > timedelta(minutes=15)


class SessionService:
    """Service for managing secure session cookies."""

    def __init__(self, session: AsyncSession, redis: Redis) -> None:
        self.session = session
        self.redis = redis
        self.audit_service = AuditService(session)

    async def create_session(
        self,
        user_id: UUID,
        request: Request,
        response: Response,
    ) -> SessionData:
        """Create a new session with secure cookie.

        Args:
            user_id: User ID for the session
            request: FastAPI request object
            response: FastAPI response object

        Returns:
            Created session data
        """
        # Generate secure session ID
        session_id = secrets.token_urlsafe(32)

        # Extract client info
        ip_address = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        # Create session data
        now = datetime.now(UTC)
        session_data = SessionData(
            session_id=session_id,
            user_id=user_id,
            created_at=now,
            last_activity=now,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        # Store in Redis with TTL
        await self._store_session(session_data)

        # Set secure cookie
        self._set_session_cookie(response, session_id)

        # Audit log
        await self.audit_service.log_event(
            user_id=user_id,
            event_type="session_created",
            event_data={
                "session_id": session_id[:8] + "...",
                "ip_address": ip_address,
            },
        )

        logger.info("Session created for user %s", user_id)
        return session_data

    async def get_session(self, request: Request) -> SessionData | None:
        """Get session from cookie.

        Args:
            request: FastAPI request object

        Returns:
            Session data if valid, None otherwise
        """
        # Get session ID from cookie
        session_id = request.cookies.get(SESSION_COOKIE_NAME)
        if not session_id:
            return None

        # Retrieve from Redis
        session_data = await self._get_session(session_id)
        if not session_data:
            return None

        # Check expiration
        if session_data.is_expired():
            await self.destroy_session(session_data.session_id)
            return None

        # Update last activity
        session_data.last_activity = datetime.now(UTC)
        await self._store_session(session_data)

        return session_data

    async def rotate_session(
        self,
        session_data: SessionData,
        response: Response,
        reason: str = "periodic",
    ) -> SessionData:
        """Rotate session ID while preserving session data.

        Args:
            session_data: Current session data
            response: FastAPI response object
            reason: Reason for rotation

        Returns:
            New session data with rotated ID
        """
        # Generate new session ID
        new_session_id = secrets.token_urlsafe(32)
        old_session_id = session_data.session_id

        # Update session data
        session_data.session_id = new_session_id
        session_data.rotation_count += 1
        session_data.last_activity = datetime.now(UTC)

        # Delete old session
        await self.redis.delete(f"{SESSION_PREFIX}{old_session_id}")

        # Store with new ID
        await self._store_session(session_data)

        # Update cookie
        self._set_session_cookie(response, new_session_id)

        # Audit log
        await self.audit_service.log_event(
            user_id=session_data.user_id,
            event_type="session_rotated",
            event_data={
                "old_session_id": old_session_id[:8] + "...",
                "new_session_id": new_session_id[:8] + "...",
                "reason": reason,
                "rotation_count": session_data.rotation_count,
            },
        )

        logger.info("Session rotated for user %s: %s", session_data.user_id, reason)
        return session_data

    async def elevate_session(
        self,
        session_data: SessionData,
        response: Response,
        duration: timedelta = timedelta(minutes=5),
    ) -> SessionData:
        """Elevate session privileges after step-up authentication.

        Args:
            session_data: Current session data
            response: FastAPI response object
            duration: How long elevation lasts

        Returns:
            Updated session data with elevation
        """
        # Set elevation
        session_data.is_elevated = True
        session_data.elevation_expires = datetime.now(UTC) + duration

        # Rotate session on privilege change
        session_data = await self.rotate_session(session_data, response, "privilege_elevation")

        # Store updated session
        await self._store_session(session_data)

        # Audit log
        await self.audit_service.log_event(
            user_id=session_data.user_id,
            event_type="session_elevated",
            event_data={
                "session_id": session_data.session_id[:8] + "...",
                "elevation_duration": duration.total_seconds(),
            },
        )

        return session_data

    async def check_elevation(self, session_data: SessionData) -> bool:
        """Check if session has valid elevation.

        Args:
            session_data: Session to check

        Returns:
            True if elevated and not expired
        """
        if not session_data.is_elevated:
            return False

        if not session_data.elevation_expires:
            return False

        if datetime.now(UTC) > session_data.elevation_expires:
            # Elevation expired, clear it
            session_data.is_elevated = False
            session_data.elevation_expires = None
            await self._store_session(session_data)
            return False

        return True

    async def destroy_session(
        self,
        session_id: str,
        response: Response | None = None,
    ) -> None:
        """Destroy a session and clear cookie.

        Args:
            session_id: Session ID to destroy
            response: Optional response to clear cookie
        """
        # Get session for audit logging
        session_data = await self._get_session(session_id)

        # Delete from Redis
        await self.redis.delete(f"{SESSION_PREFIX}{session_id}")

        # Clear cookie if response provided
        if response:
            self._clear_session_cookie(response)

        # Audit log if we had session data
        if session_data:
            await self.audit_service.log_event(
                user_id=session_data.user_id,
                event_type="session_destroyed",
                event_data={
                    "session_id": session_id[:8] + "...",
                },
            )

    async def destroy_all_user_sessions(self, user_id: UUID) -> int:
        """Destroy all sessions for a user.

        Args:
            user_id: User whose sessions to destroy

        Returns:
            Number of sessions destroyed
        """
        # Find all user sessions
        pattern = f"{SESSION_PREFIX}*"
        destroyed_count = 0

        async for key in self.redis.scan_iter(pattern):
            # Get session data
            try:
                data = await self.redis.get(key)
                if data:
                    session_dict = json.loads(data)
                    if session_dict.get("user_id") == str(user_id):
                        await self.redis.delete(key)
                        destroyed_count += 1
            except (json.JSONDecodeError, KeyError):
                continue

        # Audit log
        if destroyed_count > 0:
            await self.audit_service.log_event(
                user_id=user_id,
                event_type="all_sessions_destroyed",
                event_data={
                    "count": destroyed_count,
                },
            )

        logger.info("Destroyed %d sessions for user %s", destroyed_count, user_id)
        return destroyed_count

    async def _store_session(self, session_data: SessionData) -> None:
        """Store session data in Redis.

        Args:
            session_data: Session data to store
        """
        key = f"{SESSION_PREFIX}{session_data.session_id}"
        value = json.dumps(session_data.to_dict())

        # Use shorter of idle timeout or remaining hard limit
        remaining_hard_limit = SESSION_HARD_LIMIT - (datetime.now(UTC) - session_data.created_at)
        ttl = min(SESSION_IDLE_TIMEOUT, remaining_hard_limit)

        await self.redis.setex(key, int(ttl.total_seconds()), value)

    async def _get_session(self, session_id: str) -> SessionData | None:
        """Get session data from Redis.

        Args:
            session_id: Session ID to retrieve

        Returns:
            Session data if found
        """
        key = f"{SESSION_PREFIX}{session_id}"
        data = await self.redis.get(key)

        if not data:
            return None

        try:
            session_dict = json.loads(data)
            return SessionData.from_dict(session_dict)
        except (json.JSONDecodeError, KeyError, ValueError):
            logger.exception("Invalid session data")
            # Delete corrupted session
            await self.redis.delete(key)
            return None

    @staticmethod
    def _set_session_cookie(response: Response, session_id: str) -> None:
        """Set session cookie with secure flags.

        Args:
            response: FastAPI response object
            session_id: Session ID to set
        """
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_id,
            max_age=int(SESSION_IDLE_TIMEOUT.total_seconds()),
            httponly=True,
            secure=settings.cookie_secure_default,
            samesite=validate_cookie_samesite(settings.cookie_samesite),
            path="/",
        )

    @staticmethod
    def _clear_session_cookie(response: Response) -> None:
        """Clear session cookie.

        Args:
            response: FastAPI response object
        """
        response.delete_cookie(
            key=SESSION_COOKIE_NAME,
            path="/",
            samesite=validate_cookie_samesite(settings.cookie_samesite),
        )
