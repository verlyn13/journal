"""Redis client configuration and dependency injection."""

from __future__ import annotations

from functools import lru_cache
from typing import cast

from redis.asyncio import Redis

from app.settings import settings


@lru_cache(maxsize=1)
def get_redis_pool() -> Redis:
    """Create and cache Redis connection pool.

    Returns:
        Redis client instance with connection pooling
    """
    return cast(
        "Redis",
        Redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=False,  # Return bytes for flexibility
            socket_connect_timeout=5,
            socket_timeout=5,
        ),
    )


def get_redis_client() -> Redis:
    """Dependency injection for Redis client.

    Returns:
        Redis client instance
    """
    return get_redis_pool()


async def get_redis() -> Redis:
    """Get async Redis client for dependency injection.

    Returns:
        Redis client instance
    """
    return get_redis_pool()
