import asyncio
import os

import pytest


pytestmark = pytest.mark.integration


@pytest.mark.asyncio()
async def test_nats_reconnect_sanity():
    if os.getenv("RUN_REAL_NATS_RESTART") != "1":
        pytest.skip(
            "Set RUN_REAL_NATS_RESTART=1 and restart NATS externally to run this test"
        )

    import nats

    from app.settings import settings

    # Connect and subscribe; restart server externally for this test
    inbox = asyncio.Queue()

    async def handler(msg):
        await inbox.put(msg.data)

    nc = await nats.connect(
        settings.nats_url, max_reconnect_attempts=5, reconnect_time_wait=0.2
    )
    try:
        await nc.subscribe("journal.test.reconnect", cb=handler)
        # Expect external restart during the test window; after restart publish and ensure delivery
        await asyncio.sleep(2.0)  # Give time for restart
        await nc.publish("journal.test.reconnect", b"ping")
        data = await asyncio.wait_for(inbox.get(), timeout=2.0)
        assert data == b"ping"
    finally:
        await nc.drain()
        await nc.close()
