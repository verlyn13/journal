import json
import os

import pytest


pytestmark = pytest.mark.integration


@pytest.mark.asyncio()
async def test_nats_request_reply_contract():
    if os.getenv("RUN_REAL_NATS") != "1":
        pytest.skip("Set RUN_REAL_NATS=1 to enable real NATS tests")

    import nats

    from app.settings import settings

    subject = "journal.test.rpc"

    async def replier(msg):
        payload = json.loads(msg.data.decode())
        reply = {"ok": True, "echo": payload.get("x", 0)}
        await msg.respond(json.dumps(reply).encode("utf-8"))

    nc = await nats.connect(settings.nats_url)
    try:
        await nc.subscribe(subject, cb=replier)
        resp = await nc.request(
            subject, json.dumps({"x": 42}).encode("utf-8"), timeout=1.0
        )
        data = json.loads(resp.data.decode())
        assert data == {"ok": True, "echo": 42}
    finally:
        await nc.drain()
        await nc.close()
