"""Redis client configuration and dependency injection."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from functools import lru_cache

from redis.asyncio import Redis

from app.settings import settings


@lru_cache(maxsize=1)
def get_redis_pool() -> Redis:
    """Create and cache Redis connection pool.

    Returns:
        Redis client instance with connection pooling
    """
    return Redis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=False,  # Return bytes for flexibility
        socket_connect_timeout=5,
        socket_timeout=5,
    )


async def get_redis_client() -> AsyncGenerator[Redis, None]:
    """Dependency injection for Redis client.

    Yields:
        Redis client instance
    """
    redis = get_redis_pool()
    yield redis
