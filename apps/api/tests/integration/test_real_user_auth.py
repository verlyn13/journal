"""Test real user authentication and authorization."""

from httpx import AsyncClient
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import User
from app.infra.security import hash_password
from app.settings import settings


@pytest.fixture(autouse=True)
def enable_user_management():
    """Enable user management for these tests."""
    original_user_mgmt = settings.user_mgmt_enabled
    original_testing = settings.testing
    settings.user_mgmt_enabled = True
    settings.testing = True  # Enable dev_verify_token in responses
    yield
    settings.user_mgmt_enabled = original_user_mgmt
    settings.testing = original_testing


@pytest.mark.asyncio()
async def test_real_user_registration_and_login(client: AsyncClient, db_session: AsyncSession):
    """Test that users can register, verify email, and login."""
    # Register a new user
    register_data = {
        "email": "test@example.com",
        "password": "SecurePass123!",
        "username": "testuser",
    }

    response = await client.post("/api/v1/auth/register", json=register_data)
    assert response.status_code == 202
    data = response.json()
    assert "message" in data

    # In test mode, we get a dev_verify_token
    verify_token = data.get("dev_verify_token")
    if verify_token:
        # Verify email
        verify_response = await client.post(
            "/api/v1/auth/verify-email", json={"token": verify_token}
        )
        assert verify_response.status_code == 204

    # Try to login
    login_data = {"email": "test@example.com", "password": "SecurePass123!"}

    login_response = await client.post("/api/v1/auth/login", json=login_data)

    # If email verification is required and we didn't get a token, login should fail
    if not verify_token:
        assert login_response.status_code == 401
    else:
        assert login_response.status_code == 200
        login_result = login_response.json()
        assert "access_token" in login_result
        assert "refresh_token" in login_result
        assert login_result["token_type"] == "bearer"


@pytest.mark.asyncio()
async def test_entry_ownership(client: AsyncClient, db_session: AsyncSession):
    """Test that users can only access their own entries."""
    # Create two users directly in the database
    user1 = User(
        email="user1@example.com", password_hash=hash_password("password1"), is_verified=True
    )
    user2 = User(
        email="user2@example.com", password_hash=hash_password("password2"), is_verified=True
    )
    db_session.add(user1)
    db_session.add(user2)
    await db_session.commit()
    await db_session.refresh(user1)
    await db_session.refresh(user2)

    # Login as user1
    login1 = await client.post(
        "/api/v1/auth/login", json={"email": "user1@example.com", "password": "password1"}
    )
    assert login1.status_code == 200
    token1 = login1.json()["access_token"]

    # Login as user2
    login2 = await client.post(
        "/api/v1/auth/login", json={"email": "user2@example.com", "password": "password2"}
    )
    assert login2.status_code == 200
    token2 = login2.json()["access_token"]

    # User1 creates an entry
    entry_data = {"title": "User1's Entry", "content": "This belongs to user1"}

    create_response = await client.post(
        "/api/v1/entries", json=entry_data, headers={"Authorization": f"Bearer {token1}"}
    )
    assert create_response.status_code == 201
    entry = create_response.json()
    entry_id = entry["id"]
    entry_version = entry["version"]

    # User1 can get their own entry
    get_response1 = await client.get(
        f"/api/v1/entries/{entry_id}", headers={"Authorization": f"Bearer {token1}"}
    )
    assert get_response1.status_code == 200

    # User2 cannot get user1's entry
    get_response2 = await client.get(
        f"/api/v1/entries/{entry_id}", headers={"Authorization": f"Bearer {token2}"}
    )
    assert get_response2.status_code == 404

    # User2 cannot update user1's entry
    update_response = await client.put(
        f"/api/v1/entries/{entry_id}",
        json={"title": "Hacked!", "expected_version": entry_version},
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert update_response.status_code == 404

    # User2 cannot delete user1's entry
    delete_response = await client.delete(
        f"/api/v1/entries/{entry_id}?expected_version={entry_version}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert delete_response.status_code == 404

    # User1 can delete their own entry
    delete_response1 = await client.delete(
        f"/api/v1/entries/{entry_id}?expected_version={entry_version}",
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert delete_response1.status_code == 204


@pytest.mark.asyncio()
async def test_user_entries_isolation(client: AsyncClient, db_session: AsyncSession):
    """Test that users only see their own entries in list endpoint."""
    # Create two users with entries
    user1 = User(
        email="alice@example.com", password_hash=hash_password("alicepass"), is_verified=True
    )
    user2 = User(email="bob@example.com", password_hash=hash_password("bobpass"), is_verified=True)
    db_session.add(user1)
    db_session.add(user2)
    await db_session.commit()

    # Login as both users
    alice_login = await client.post(
        "/api/v1/auth/login", json={"email": "alice@example.com", "password": "alicepass"}
    )
    alice_token = alice_login.json()["access_token"]

    bob_login = await client.post(
        "/api/v1/auth/login", json={"email": "bob@example.com", "password": "bobpass"}
    )
    bob_token = bob_login.json()["access_token"]

    # Alice creates 2 entries
    for i in range(2):
        await client.post(
            "/api/v1/entries",
            json={"title": f"Alice Entry {i + 1}", "content": f"Content {i + 1}"},
            headers={"Authorization": f"Bearer {alice_token}"},
        )

    # Bob creates 3 entries
    for i in range(3):
        await client.post(
            "/api/v1/entries",
            json={"title": f"Bob Entry {i + 1}", "content": f"Content {i + 1}"},
            headers={"Authorization": f"Bearer {bob_token}"},
        )

    # Alice should only see her 2 entries
    alice_entries = await client.get(
        "/api/v1/entries", headers={"Authorization": f"Bearer {alice_token}"}
    )
    assert alice_entries.status_code == 200
    alice_data = alice_entries.json()
    assert len(alice_data) == 2
    assert all("Alice Entry" in e["title"] for e in alice_data)

    # Bob should only see his 3 entries
    bob_entries = await client.get(
        "/api/v1/entries", headers={"Authorization": f"Bearer {bob_token}"}
    )
    assert bob_entries.status_code == 200
    bob_data = bob_entries.json()
    assert len(bob_data) == 3
    assert all("Bob Entry" in e["title"] for e in bob_data)


@pytest.mark.asyncio()
async def test_rate_limiting_on_login(client: AsyncClient):
    """Test that login endpoint has rate limiting."""
    # Make multiple failed login attempts
    bad_login = {"email": "attacker@example.com", "password": "wrongpass"}

    # First 5 attempts should work (may fail auth, but not rate limited)
    for _ in range(5):
        response = await client.post("/api/v1/auth/login", json=bad_login)
        assert response.status_code in [401, 429]  # Either unauthorized or rate limited

        if response.status_code == 429:
            # Hit rate limit early, that's fine
            break

    # 6th attempt should definitely be rate limited
    response = await client.post("/api/v1/auth/login", json=bad_login)
    assert response.status_code == 429
    assert "try again later" in response.json()["detail"].lower()
