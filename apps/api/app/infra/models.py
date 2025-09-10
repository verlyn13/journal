from __future__ import annotations

import logging


# Standard library imports
from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from pydantic import field_validator

# Third-party imports
from sqlalchemy import JSON, Column, event
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


# ==============================
# Database Models (SQLModel)
# ==============================


class Entry(SQLModel, table=True):
    """Journal entry model aligned with Alembic migrations.

    Notes:
    - `content` is a plain text string for simplicity and FTS compatibility.
    - `search_vector` is a generated TSVECTOR in the database (not represented here).
    - `word_count` is optional and may be populated by services or triggers.
    - `version` enables optimistic locking via SQLAlchemy.
    """

    __tablename__ = "entries"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    author_id: UUID = Field(index=True)
    title: str = Field(default="")
    content: str = Field(default="")
    markdown_content: str | None = Field(default=None)
    content_version: int = Field(default=1)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    word_count: int = Field(default=0)
    char_count: int = Field(default=0)
    version: int = Field(default=1, nullable=False)
    is_deleted: bool = Field(default=False)


class Event(SQLModel, table=True):
    """Event store model aligned with `events` table from Alembic.

    - `published_at` is null until the outbox relay publishes the event.
    - `event_data` stores the payload (JSONB in Postgres).
    """

    __tablename__ = "events"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    aggregate_id: UUID = Field(index=True)
    aggregate_type: str
    event_type: str
    event_data: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))
    occurred_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    published_at: datetime | None = Field(default=None, index=True)

    # Validators
    @field_validator("aggregate_id", mode="before")
    @classmethod
    def _coerce_aggregate_id(cls, v: object) -> object:
        """Coerce raw 16-byte values into UUID for compatibility with older tests.

        Accepts bytes/bytearray of length 16 and converts to UUID; otherwise returns input.
        """
        try:
            if isinstance(v, (bytes, bytearray)) and len(v) == 16:
                return UUID(bytes=bytes(v))
        except ValueError as exc:
            logging.getLogger(__name__).debug("aggregate_id pre-validate coercion skipped: %s", exc)
        return v


# SQLAlchemy-level safeguard for raw bytes assigned via ORM operations/tests
@event.listens_for(Event, "before_insert")
def _event_before_insert(mapper: object, connection: object, target: Event) -> None:
    try:
        # Runtime coercion for tests that might assign raw bytes
        if isinstance(target.aggregate_id, (bytes, bytearray)) and len(target.aggregate_id) == 16:  # type: ignore[unreachable]
            target.aggregate_id = UUID(bytes=bytes(target.aggregate_id))  # type: ignore[unreachable]
    except ValueError as exc:
        logging.getLogger(__name__).debug("aggregate_id coercion skipped: %s", exc)


class ProcessedEvent(SQLModel, table=True):
    """Idempotency ledger for processed events."""

    __tablename__ = "processed_events"

    event_id: UUID = Field(primary_key=True)
    processed_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    outcome: str = Field(default="ok")
    attempts: int = Field(default=1)


# ==============================
# User Management Models (flagged rollout)
# ==============================


class User(SQLModel, table=True):
    """Persistent application user.

    Fields chosen for minimal viable user management with future-proofing:
    - Unique email, optional username
    - Optional password_hash (set when password auth is enabled)
    - Roles as JSON list (JSONB in Postgres) for simple RBAC
    - Activity and verification flags
    - Timestamps
    """

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
    email: str = Field(index=True, unique=True, nullable=False)
    username: str | None = Field(default=None, index=True)
    password_hash: str | None = Field(default=None)
    is_active: bool = Field(default=True, nullable=False)
    is_verified: bool = Field(default=False, nullable=False)
    roles: list[str] = Field(
        default_factory=lambda: ["user"], sa_column=Column(JSONB, nullable=False)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class UserSession(SQLModel, table=True):
    """Server-side refresh session record.

    Tracks refresh token identity (refresh_id) by UUID, with lifecycle
    fields for rotation and revocation.
    """

    __tablename__ = "user_sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
    user_id: UUID = Field(foreign_key="users.id", index=True, nullable=False)
    refresh_id: UUID = Field(default_factory=uuid4, unique=True, index=True, nullable=False)
    user_agent: str | None = None
    ip_address: str | None = None
    issued_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)
    last_used_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    expires_at: datetime = Field(nullable=False)
    revoked_at: datetime | None = Field(default=None)
