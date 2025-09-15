"""Fixtures for v2 auth tests."""

from __future__ import annotations

import asyncio

from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from uuid import uuid4

import pytest
import pytest_asyncio

from httpx import AsyncClient
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.infra.db import Base
from app.infra.sa_models import User
from app.main import app
from app.settings import settings


@pytest_asyncio.fixture
async def db_engine():
    """Create test database engine."""
    # Use test database
    test_db_url = settings.database_url.replace("/journal", "/journal_test")
    engine = create_async_engine(test_db_url, echo=False)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Clean up
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    async_session = sessionmaker(db_engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def redis_client() -> AsyncGenerator[Redis, None]:
    """Create test Redis client."""
    redis = Redis.from_url(
        settings.redis_url,
        decode_responses=True,
        db=15,  # Use separate DB for tests
    )

    # Clear test database
    await redis.flushdb()

    yield redis

    # Clean up
    await redis.flushdb()
    await redis.close()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        name="Test User",
        password_hash="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY/MiLTylUF8pJu",  # testpassword123
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return user


@pytest_asyncio.fixture
async def async_client(
    db_session: AsyncSession,
    redis_client: Redis,
) -> AsyncGenerator[AsyncClient, None]:
    """Create test HTTP client with dependency overrides."""
    from app.infra.db import get_session
    from app.infra.redis import get_redis

    # Override dependencies
    app.dependency_overrides[get_session] = lambda: db_session
    app.dependency_overrides[get_redis] = lambda: redis_client

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

    # Clean up overrides
    app.dependency_overrides.clear()


@pytest.fixture
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
