"""JWT testing fixtures."""

import pytest_asyncio
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.jwt_service import JWTService
from app.domain.auth.key_manager import KeyManager
from app.domain.auth.token_validator import TokenValidator
from app.infra.redis import get_redis_pool


@pytest_asyncio.fixture
async def redis() -> Redis:
    """Create Redis client for testing."""
    client = get_redis_pool()

    # Clean up any stale auth keys before test
    cursor = 0
    while True:
        cursor, keys = await client.scan(cursor, match="auth:*", count=100)
        if keys:
            await client.delete(*keys)
        if cursor == 0:
            break

    yield client

    # Clean up test keys after test
    cursor = 0
    while True:
        cursor, keys = await client.scan(cursor, match="auth:*", count=100)
        if keys:
            await client.delete(*keys)
        if cursor == 0:
            break

    cursor = 0
    while True:
        cursor, keys = await client.scan(cursor, match="test:*", count=100)
        if keys:
            await client.delete(*keys)
        if cursor == 0:
            break

    await client.aclose()


class MockSecretsClient:
    """Simple in-memory secrets client with legacy interface."""

    def __init__(self) -> None:
        self._secrets: dict[str, str] = {}

    async def fetch_secret(self, path: str) -> str:
        if path not in self._secrets:
            raise KeyError(f"Secret not found: {path}")
        return self._secrets[path]

    async def store_secret(self, path: str, value: str) -> None:
        self._secrets[path] = value


@pytest_asyncio.fixture
async def key_manager(db_session: AsyncSession, redis: Redis) -> KeyManager:
    """Create key manager for testing."""
    # Create a system user for audit logging
    from uuid import UUID

    from app.infra.sa_models import User

    system_user = User(
        id=UUID("00000000-0000-0000-0000-000000000000"),
        email="system@test.local",
        username="system",
        is_active=True,
    )
    db_session.add(system_user)
    await db_session.commit()

    # Create key manager with in-memory secrets via adapter
    secrets_client = MockSecretsClient()
    manager = KeyManager(db_session, redis, infisical_client=secrets_client)

    # Initialize will create keys and store them in the mock secrets client
    # The mock client will automatically accept and store any keys created
    await manager.initialize_key_system()
    return manager


@pytest_asyncio.fixture
async def jwt_service(
    db_session: AsyncSession,
    redis: Redis,
    key_manager: KeyManager,
) -> JWTService:
    """Create JWT service for testing."""
    return JWTService(db_session, redis, key_manager)


@pytest_asyncio.fixture
async def token_validator(db_session: AsyncSession, redis: Redis) -> TokenValidator:
    """Create token validator for testing."""
    return TokenValidator(db_session, redis)
