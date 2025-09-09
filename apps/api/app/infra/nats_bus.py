from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from nats.aio.client import Client as NatsClient

from app.settings import settings


@asynccontextmanager
async def nats_conn() -> AsyncIterator[NatsClient]:
    nc = NatsClient()
    await nc.connect(servers=[settings.nats_url])
    try:
        yield nc
    finally:
        await nc.drain()
        await nc.close()
