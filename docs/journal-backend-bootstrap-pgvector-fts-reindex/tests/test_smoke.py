import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_docs():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.get("/docs")
        assert r.status_code in (200, 404)  # docs may be disabled in some modes

@pytest.mark.asyncio
async def test_entries_list():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.get("/api/v1/entries")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
