"""SQLAlchemy 2.0 models with proper typing.

These models mirror the existing SQLModel tables but use pure SQLAlchemy 2.0
with Mapped[...] typing for full mypy compatibility.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infra.base import Base


if TYPE_CHECKING:
    from app.infra.webauthn_models import WebAuthnCredential


class User(Base):
    """User model with SQLAlchemy 2.0 typing."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    username: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    roles: Mapped[list[str]] = mapped_column(JSONB, default=lambda: ["user"], nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    sessions: Mapped[list[UserSession]] = relationship(back_populates="user")
    entries: Mapped[list[Entry]] = relationship(back_populates="author")
    webauthn_credentials: Mapped[list[WebAuthnCredential]] = relationship(back_populates="user")
    devices: Mapped[list[UserDevice]] = relationship(back_populates="user")
    recovery_codes: Mapped[list[RecoveryCode]] = relationship(back_populates="user")
    audit_log: Mapped[list[AuditLogEntry]] = relationship(back_populates="user")
    deletion_request: Mapped[DeletionRequest | None] = relationship(back_populates="user")


class UserSession(Base):
    """User session model with SQLAlchemy 2.0 typing."""

    __tablename__ = "user_sessions"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    device_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("user_devices.id", ondelete="SET NULL"), index=True, nullable=True
    )
    refresh_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), unique=True, index=True, default=uuid4
    )
    user_agent: Mapped[str | None] = mapped_column(String, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String, nullable=True)
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False, index=True
    )
    last_used_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped[User] = relationship(back_populates="sessions")
    device: Mapped[UserDevice | None] = relationship(back_populates="sessions")


class UserDevice(Base):
    """User device model for session and device management (no fingerprinting)."""

    __tablename__ = "user_devices"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    # User-provided label, not fingerprint
    device_name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Metadata for display only
    browser: Mapped[str | None] = mapped_column(String(100), nullable=True)
    os: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Coarse location only (city/region, not precise)
    location_region: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Trust and tracking
    trusted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="devices")
    sessions: Mapped[list[UserSession]] = relationship(back_populates="device")


class RecoveryCode(Base):
    """Recovery code model for account recovery."""

    __tablename__ = "recovery_codes"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    # Hashed recovery code
    code_hash: Mapped[str] = mapped_column(String(128), nullable=False)

    # Tracking
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="recovery_codes")


class Entry(Base):
    """Entry model with SQLAlchemy 2.0 typing."""

    __tablename__ = "entries"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    author_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    markdown_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    char_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    content_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Relationships
    author: Mapped[User] = relationship(back_populates="entries")


class Event(Base):
    """Event model for event sourcing with SQLAlchemy 2.0 typing."""

    __tablename__ = "events"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    aggregate_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), index=True, nullable=False)
    aggregate_type: Mapped[str] = mapped_column(String, nullable=False)
    event_type: Mapped[str] = mapped_column(String, nullable=False)
    event_data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, index=True, nullable=False
    )
    published_at: Mapped[datetime | None] = mapped_column(index=True, nullable=True)

    # Outbox retry fields
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    next_attempt_at: Mapped[datetime | None] = mapped_column(nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    state: Mapped[str] = mapped_column(String, default="pending", nullable=False)


class ProcessedEvent(Base):
    """Processed event tracking with SQLAlchemy 2.0 typing."""

    __tablename__ = "processed_events"

    event_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    processed_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, index=True, nullable=False
    )
    outcome: Mapped[str] = mapped_column(String, default="ok", nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=1, nullable=False)


class AuditLogEntry(Base):
    """Hash-chained audit log for tamper evidence."""

    __tablename__ = "audit_log"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    # Event details
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    event_data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    device_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("user_devices.id", ondelete="SET NULL"), nullable=True
    )

    # Hash chain for tamper evidence
    prev_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    entry_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False, index=True
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="audit_log")
    device: Mapped[UserDevice | None] = relationship()


class DeletionRequest(Base):
    """User deletion requests with undo window."""

    __tablename__ = "deletion_requests"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # Scheduling
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    scheduled_for: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Undo mechanism
    undo_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    undo_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Status tracking
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    executed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped[User] = relationship(back_populates="deletion_request")
