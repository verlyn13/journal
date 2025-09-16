from __future__ import annotations

from pathlib import Path

from alembic.config import Config
import pytest

from alembic import command
from app.settings import settings


pytestmark = pytest.mark.integration


@pytest.mark.asyncio()
async def test_register_verify_login(client):
    # Enable user management for this test
    settings.user_mgmt_enabled = True
    # Ensure DB is at head (test DB may have been created earlier without latest migration)
    cfg = Config(str(Path(__file__).resolve().parents[2] / "alembic.ini"))
    cfg.set_main_option("sqlalchemy.url", settings.db_url)
    command.upgrade(cfg, "head")

    # Register
    r = await client.post(
        "/api/v1/auth/register",
        json={"email": "auth.t2@example.com", "password": "CorrectHorse9!", "username": "auth2"},
    )
    assert r.status_code == 202, r.text
    data = r.json()
    token = data.get("dev_verify_token")
    # In testing mode we expect a dev token
    assert token is not None

    # Verify email
    r = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert r.status_code == 204, r.text

    # Login
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "auth.t2@example.com", "password": "CorrectHorse9!"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert "access_token" in body and "refresh_token" in body and body["token_type"] == "bearer"
