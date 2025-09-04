import asyncio
import os

import pytest


pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_nats_pubsub_roundtrip():
    if os.getenv("RUN_REAL_NATS") != "1":
        pytest.skip("Set RUN_REAL_NATS=1 to enable real NATS test")

    import nats

    from app.settings import settings

    subject = "journal.test.roundtrip"
    got = asyncio.Event()
    messages = []

    async def handler(msg):
        messages.append(msg.data)
        got.set()

    nc = await nats.connect(settings.nats_url)
    try:
        sid = await nc.subscribe(subject, cb=handler)
        await nc.publish(subject, b"{\"id\":\"example\"}")

        await asyncio.wait_for(got.wait(), timeout=1.0)
        assert messages and messages[0].startswith(b"{")
    finally:
        await nc.drain()
        await nc.close()
