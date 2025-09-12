from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import JSON, Column, text
from sqlmodel import Field, SQLModel


class Entry(SQLModel, table=True):
    __tablename__ = "entries"
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    author_id: UUID = Field(index=True)
    title: str = Field(default="")
    content: dict = Field(sa_column=Column(JSON, nullable=False, server_default=text("'{}'::json")))
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_deleted: bool = Field(default=False)


class Event(SQLModel, table=True):
    __tablename__ = "event_store"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    aggregate_id: UUID = Field(index=True)
    aggregate_type: str
    event_type: str
    event_version: int = 1
    event_data: dict = Field(
        sa_column=Column(JSON, nullable=False, server_default=text("'{}'::json"))
    )
    metadata: dict = Field(
        sa_column=Column(JSON, nullable=False, server_default=text("'{}'::json"))
    )
    occurred_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    published: bool = Field(default=False, index=True)
