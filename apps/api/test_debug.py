import asyncio
import json
from httpx import AsyncClient
from app.main import app
from tests.conftest import get_test_auth_headers


async def test_update():
    async with AsyncClient(app=app, base_url="http://test") as client:
        headers = await get_test_auth_headers(client)

        # Create an entry first
        entry_data = {"title": "Test Entry", "content": "Test content"}

        create_resp = await client.post("/api/v1/entries", json=entry_data, headers=headers)
        print(f"Create status: {create_resp.status_code}")

        if create_resp.status_code == 201:
            entry_id = create_resp.json()["id"]

            # Now try to update
            update_data = {"title": "Updated Title", "content": "Updated content"}

            update_resp = await client.put(
                f"/api/v1/entries/{entry_id}", json=update_data, headers=headers
            )
            print(f"Update status: {update_resp.status_code}")

            if update_resp.status_code == 422:
                print(f"Validation error: {json.dumps(update_resp.json(), indent=2)}")
        else:
            print(f"Create error: {json.dumps(create_resp.json(), indent=2)}")


asyncio.run(test_update())
