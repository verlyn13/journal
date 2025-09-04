from __future__ import annotations

# Standard library imports
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

# Third-party imports
from sqlalchemy import JSON, Column, Integer
from sqlalchemy.orm import declarative_mixin
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
    event_data: dict = Field(sa_column=Column(JSON, nullable=False))
    occurred_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    published_at: datetime | None = Field(default=None, index=True)


class ProcessedEvent(SQLModel, table=True):
    """Idempotency ledger for processed events."""

    __tablename__ = "processed_events"

    event_id: UUID = Field(primary_key=True)
    processed_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    outcome: str = Field(default="ok")
    attempts: int = Field(default=1)
