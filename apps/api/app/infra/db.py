from functools import lru_cache
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.settings import settings


@lru_cache(maxsize=1)
def build_engine(url: str | None = None) -> AsyncEngine:
    return create_async_engine(url or settings.db_url, pool_pre_ping=True, future=True)


def sessionmaker_for(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )


def get_async_engine() -> AsyncEngine:
    """Get the async database engine."""
    return build_engine()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    sm = sessionmaker_for(build_engine())
    async with sm() as s:
        yield s
