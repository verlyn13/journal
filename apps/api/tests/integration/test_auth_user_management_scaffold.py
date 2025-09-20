"""Auth and user management test scaffolds.

These tests are marked skipped and serve as contracts for the upcoming
user management implementation. Replace skips when functionality is ready.
"""

from __future__ import annotations

from httpx import AsyncClient
import pytest


pytestmark = pytest.mark.integration


@pytest.mark.skip(reason="Pending user management implementation")
@pytest.mark.asyncio()
async def test_login_logout_refresh_flow(client: AsyncClient) -> None:
    """Happy-path: login -> refresh -> logout."""
    # Login with credentials
    res = await client.post(
        "/api/v1/auth/login",
        json={"username": "demo@example.com", "password": "password"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data and "refresh_token" in data

    # Refresh access token
    res2 = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": data["refresh_token"]}
    )
    assert res2.status_code == 200

    # Logout (invalidate session) - subsequent use of token should fail
    res3 = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {data['access_token']}"},
    )
    assert res3.status_code == 200


@pytest.mark.skip(reason="Pending passkey integration")
@pytest.mark.asyncio()
async def test_passkey_register_and_authenticate(client: AsyncClient) -> None:
    """Register a passkey then authenticate with it."""
    # Begin registration -> verify -> store
    r1 = await client.post(
        "/api/v1/auth/webauthn/register/options", json={"userId": "user-1"}
    )
    assert r1.status_code == 200
    # The rest depends on WebAuthn ceremony; will be mocked in test harness
    assert "challenge" in r1.json()

    # Authentication options then verify
    r2 = await client.post("/api/v1/auth/webauthn/authenticate/options")
    assert r2.status_code == 200


@pytest.mark.skip(reason="Pending OAuth providers wiring")
@pytest.mark.asyncio()
async def test_oauth_provider_availability_and_connect(client: AsyncClient) -> None:
    """Check provider availability and connect flow contract."""
    r = await client.get("/api/v1/auth/oauth/google/available")
    assert r.status_code in {200, 404}

    r2 = await client.post("/api/v1/auth/oauth/google/connect")
    assert r2.status_code in {200, 302}
