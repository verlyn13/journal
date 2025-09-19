from __future__ import annotations

from contextlib import asynccontextmanager

from nats.aio.client import Client as NATS

from app.settings import settings


@asynccontextmanager
async def nats_conn():
    nc = NATS()
    await nc.connect(servers=[settings.nats_url])
    try:
        yield nc
    finally:
        await nc.drain()
        await nc.close()


async def publish(subject: str, data: bytes):
    async with nats_conn() as nc:
        await nc.publish(subject, data)
