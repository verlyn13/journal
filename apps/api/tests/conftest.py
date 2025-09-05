"""
Test configuration and fixtures for the Journal API.
"""

import os
import uuid

from collections.abc import AsyncGenerator, Generator

# Alembic for proper schema and extensions
from pathlib import Path

import pytest
import pytest_asyncio

from alembic.config import Config
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from alembic import command
from app.infra.db import get_session
from app.infra.models import Entry
from app.main import app
from app.settings import settings


# Set testing mode before importing app
settings.testing = True

TEST_DB_URL = os.getenv(
    "TEST_DB_URL", "postgresql+asyncpg://journal:journal@localhost:5433/journal_test"
)

# Ensure Alembic and the app use the same test database URL
os.environ["JOURNAL_DB_URL"] = TEST_DB_URL
settings.db_url = TEST_DB_URL


@pytest_asyncio.fixture
async def async_engine() -> AsyncEngine:
    """Create async engine for the test session."""
    engine = create_async_engine(
        TEST_DB_URL,
        pool_pre_ping=True,
        # echo=True,  # Uncomment for SQL debugging
    )
    try:
        yield engine
    finally:
        await engine.dispose()


@pytest_asyncio.fixture
async def bootstrap_schema(async_engine: AsyncEngine):
    """Ensure database schema is at head revision, idempotently.

    - Skips if Alembic version table already exists (assumes up-to-date for tests).
    - Runs Alembic upgrade otherwise.
    """
    from sqlalchemy import text as _text

    async def _has_alembic_version() -> bool:
        async with async_engine.begin() as conn:
            res = await conn.execute(_text("SELECT to_regclass('public.alembic_version')"))
            row = res.scalar_one_or_none()
            return row is not None

    exists = await _has_alembic_version()
    if not exists:
        # If prior partial runs left stray tables, drop them to avoid duplicate errors
        async def _drop_stray_tables():
            async with async_engine.begin() as conn:
                await conn.execute(
                    _text("DROP TABLE IF EXISTS entry_embeddings, events, entries CASCADE")
                )

        await _drop_stray_tables()

        # Run Alembic in a thread to avoid event loop issues
        import asyncio
        import threading

        def run_alembic():
            cfg = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
            cfg.set_main_option("sqlalchemy.url", TEST_DB_URL)
            command.upgrade(cfg, "head")

        await asyncio.get_event_loop().run_in_executor(None, run_alembic)

    yield


@pytest_asyncio.fixture
async def db_connection(async_engine: AsyncEngine, bootstrap_schema) -> AsyncConnection:
    """One dedicated connection for the test, with an OUTER transaction."""
    conn = await async_engine.connect()
    trans = await conn.begin()  # <-- external transaction

    # Add timeout settings to prevent infinite hangs
    await conn.execute(text("SET LOCAL statement_timeout = '5s'"))
    await conn.execute(text("SET LOCAL lock_timeout = '1s'"))
    await conn.execute(text("SET LOCAL idle_in_transaction_session_timeout = '5s'"))

    try:
        yield conn
    finally:
        # Roll back EVERYTHING the test did (even if code called session.commit())
        await trans.rollback()
        await conn.close()


@pytest_asyncio.fixture
async def session_factory(db_connection: AsyncConnection):
    """Create a session factory bound to the test connection."""
    return sessionmaker(
        class_=AsyncSession,
        expire_on_commit=False,
    )


@pytest_asyncio.fixture
async def db_session(session_factory, db_connection: AsyncConnection) -> AsyncSession:
    """Bind AsyncSession to the already-transactional connection.

    Uses join_transaction_mode='create_savepoint' so any session.commit()
    inside test code just releases a SAVEPOINT while the outer transaction remains.
    """
    session = session_factory(
        bind=db_connection,
        join_transaction_mode="create_savepoint",
    )
    yield session
    # Don't close the session here - let the connection rollback handle cleanup


@pytest_asyncio.fixture
async def request_scoped_session(session_factory, db_connection: AsyncConnection):
    """Create a fresh session for each request, bound to the test connection."""
    session = session_factory(
        bind=db_connection,
        join_transaction_mode="create_savepoint",
    )
    try:
        yield session
    finally:
        await session.close()


# Note: No more TRUNCATE-based cleanup - using transaction rollback pattern


from app.infra.db import build_engine


@pytest_asyncio.fixture
async def client(request, session_factory, db_connection: AsyncConnection):
    """ASGI client with per-request isolated DB sessions on independent connections.

    - Each request uses its own connection wrapped in an outer transaction.
    - Session commits use savepoints; we roll back the outer transaction after the request,
      ensuring no cross-request leakage while permitting concurrent requests.
    """

    async def override_get_session():
        # Use per-request isolated connections only for the concurrency stress test.
        if request.node.name == "test_concurrent_user_operations":
            engine = build_engine()
            conn = await engine.connect()
            outer = await conn.begin()
            session = session_factory(
                bind=conn,
                join_transaction_mode="create_savepoint",
            )
            try:
                yield session
            finally:
                await session.close()
                try:
                    await outer.rollback()
                finally:
                    await conn.close()
        else:
            # Default path: reuse the test's outer connection with savepoints across requests
            session = session_factory(
                bind=db_connection,
                join_transaction_mode="create_savepoint",
            )
            try:
                yield session
            finally:
                await session.close()

    app.dependency_overrides[get_session] = override_get_session
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as c:
            yield c
    finally:
        app.dependency_overrides.pop(get_session, None)


@pytest.fixture
def sync_client() -> Generator[TestClient, None, None]:
    """Create a synchronous test client for simple tests."""
    with TestClient(app) as client:
        yield client


@pytest_asyncio.fixture
async def sample_entry(db_session: AsyncSession) -> Entry:
    """Create a sample entry for testing."""
    # Generate unique IDs for each test run to avoid constraint violations
    entry_id = str(uuid.uuid4())
    author_id = str(uuid.uuid4())

    entry = Entry(
        id=entry_id,
        title="Test Entry",
        content="This is a test entry with some content.",
        author_id=author_id,
        word_count=8,
    )
    db_session.add(entry)
    await db_session.flush()  # Flush but don't commit - let the test manage the transaction
    return entry


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    """Get authentication headers for API requests."""
    # Use demo login for testing
    response = await client.post("/api/v1/auth/demo")
    assert response.status_code == 200

    tokens = response.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}


@pytest.fixture
def mock_embeddings():
    """Mock embeddings for testing."""
    return [0.1] * 1536  # Standard OpenAI embedding dimension


class MockNATSConnection:
    """Mock NATS connection for testing."""

    def __init__(self):
        self.published_messages = []

    async def publish(self, subject: str, payload: bytes):
        """Mock publish method."""
        self.published_messages.append({
            "subject": subject,
            "payload": payload,
        })

    async def close(self):
        """Mock close method."""


@pytest_asyncio.fixture
async def mock_nats():
    """Mock NATS connection for testing."""
    return MockNATSConnection()


@pytest.fixture
def nats_capture(monkeypatch):
    """Capture NATS messages by monkeypatching nats_conn to yield a mock."""
    conn = MockNATSConnection()

    class _ctx:
        async def __aenter__(self):
            return conn

        async def __aexit__(self, exc_type, exc, tb):
            return False

    def _fake_nats_conn():  # asynccontextmanager-compatible factory
        return _ctx()

    # Patch the app's NATS connection factory in both locations
    monkeypatch.setattr("app.infra.nats_bus.nats_conn", _fake_nats_conn)
    monkeypatch.setattr("app.infra.outbox.nats_conn", _fake_nats_conn)
    return conn


# Test utilities
def create_test_entry_data(
    title: str = "Test Entry", content: str = "Test content", **kwargs
) -> dict:
    """Create test entry data."""
    return {"title": title, "content": content, **kwargs}


def assert_entry_response(response_data: dict, expected_title: str = None):
    """Assert entry response has correct structure."""
    assert "id" in response_data
    assert "title" in response_data
    assert "content" in response_data
    assert "created_at" in response_data
    assert "updated_at" in response_data
    assert "author_id" in response_data

    if expected_title:
        assert response_data["title"] == expected_title
