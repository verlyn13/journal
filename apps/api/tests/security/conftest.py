"""Isolated fixtures for security tests that avoid real DB/Redis.

These fixtures provide in-memory fakes to enable hermetic, fast tests focused on
JWT cryptography and header/claims validation without pulling Postgres/Alembic.
"""

from __future__ import annotations

import asyncio
from typing import Any

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.jwt_service import JWTService
from app.domain.auth.key_manager import KeyManager
from app.domain.auth.token_validator import TokenValidator
class _InMemorySecretsClient:
    def __init__(self) -> None:
        self._secrets: dict[str, str] = {}

    async def fetch_secret(self, path: str) -> str:
        if path not in self._secrets:
            raise KeyError(f"Secret not found: {path}")
        return self._secrets[path]

    async def store_secret(self, path: str, value: str) -> None:
        self._secrets[path] = value


class FakeRedis:
    def __init__(self) -> None:
        self._data: dict[str, bytes] = {}

    async def get(self, key: str) -> bytes | None:
        return self._data.get(key)

    async def setex(self, key: str, ttl: int, value: str | bytes) -> None:
        self._data[key] = value.encode() if isinstance(value, str) else value

    async def set(self, key: str, value: str | bytes) -> None:
        await self.setex(key, 3600, value)

    async def exists(self, key: str) -> int:
        return 1 if key in self._data else 0

    async def delete(self, *keys: str) -> None:
        for k in keys:
            self._data.pop(k, None)

    async def scan(self, cursor: int, match: str | None = None, count: int = 10) -> tuple[int, list[str]]:
        # Minimal scan implementation for tests
        return 0, list(self._data.keys())

    # Pipeline support for telemetry tests
    class _Pipeline:
        def __init__(self, parent: 'FakeRedis') -> None:
            self.parent = parent

        def hincrby(self, key: str, field: str, amount: int) -> None:
            # Represent hash as JSON-like blob in bytes
            import json
            raw = self.parent._data.get(key, b"{}")
            obj = json.loads(raw.decode())
            obj[field] = int(obj.get(field, 0)) + amount
            self.parent._data[key] = json.dumps(obj).encode()

        def set(self, key: str, value: str, ex: int | None = None) -> None:  # noqa: ARG002
            self.parent._data[key] = value.encode()

        def rpush(self, key: str, value: str) -> None:
            # Store list as JSON array
            import json
            raw = self.parent._data.get(key, b"[]")
            arr = json.loads(raw.decode())
            arr.append(value)
            self.parent._data[key] = json.dumps(arr).encode()

        def ltrim(self, key: str, start: int, end: int) -> None:  # noqa: ARG002
            # No-op for tests
            return None

        async def execute(self) -> None:
            return None

    def pipeline(self) -> 'FakeRedis._Pipeline':
        return FakeRedis._Pipeline(self)


class FakeAsyncSession(AsyncSession):
    async def __aenter__(self) -> "FakeAsyncSession":  # type: ignore[override]
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:  # type: ignore[override]
        return None

    async def execute(self, *args: Any, **kwargs: Any) -> Any:  # type: ignore[override]
        return None

    def add(self, instance: Any) -> None:  # type: ignore[override]
        return None

    async def commit(self) -> None:  # type: ignore[override]
        return None


@pytest_asyncio.fixture
async def redis():
    return FakeRedis()


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    # Provide a minimal AsyncSession-like object
    return FakeAsyncSession()


@pytest_asyncio.fixture
async def key_manager(db_session: AsyncSession, redis: FakeRedis) -> KeyManager:
    secrets = _InMemorySecretsClient()
    manager = KeyManager(db_session, redis, infisical_client=secrets)
    # Disable audit logging side effects in unit tests
    async def _no_audit(**kwargs):  # type: ignore[no-untyped-def]
        return None
    manager.audit_service.log_event = _no_audit  # type: ignore[assignment]
    await manager.initialize_key_system()
    return manager


@pytest_asyncio.fixture
async def jwt_service(db_session: AsyncSession, redis: FakeRedis, key_manager: KeyManager) -> JWTService:
    service = JWTService(db_session, redis, key_manager)
    async def _no_audit(**kwargs):  # type: ignore[no-untyped-def]
        return None
    service.audit_service.log_event = _no_audit  # type: ignore[assignment]
    return service


@pytest_asyncio.fixture
async def token_validator(db_session: AsyncSession, redis: FakeRedis) -> TokenValidator:
    return TokenValidator(db_session, redis)
