from __future__ import annotations

import pytest

from app.settings import settings


pytestmark = pytest.mark.integration


@pytest.mark.asyncio()
async def test_refresh_rotation_and_logout(client):
    settings.user_mgmt_enabled = True

    # Register
    r = await client.post(
        "/api/v1/auth/register",
        json={"email": "rot@example.com", "password": "CorrectHorse9!", "username": "rot"},
    )
    assert r.status_code == 202, r.text
    token = r.json().get("dev_verify_token")
    assert token

    # Verify
    r = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert r.status_code == 204, r.text

    # Login
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "rot@example.com", "password": "CorrectHorse9!"},
    )
    assert r.status_code == 200, r.text
    data = r.json()
    refresh1 = data["refresh_token"]

    # Refresh -> should rotate
    r = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh1})
    assert r.status_code == 200, r.text
    refresh2 = r.json()["refresh_token"]
    assert refresh2 != refresh1

    # Old refresh should now be invalid
    r = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh1})
    assert r.status_code == 401

    # Logout current session
    r = await client.post("/api/v1/auth/logout", json={"refresh_token": refresh2})
    assert r.status_code == 204

    # Refresh with revoked token should fail
    r = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh2})
    assert r.status_code == 401
