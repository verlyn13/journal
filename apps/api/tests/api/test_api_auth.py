"""
Test cases for authentication API endpoints.
"""

from httpx import AsyncClient
import pytest

from app.infra.auth import create_access_token, create_refresh_token


@pytest.mark.component()
class TestAuthAPI:
    """Test cases for authentication endpoints."""

    @pytest.mark.asyncio()
    async def test_login_success(self, client: AsyncClient):
        """Test successful login with demo credentials."""
        response = await client.post(
            "/api/v1/auth/login", json={"username": "demo", "password": "demo123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio()
    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials."""
        response = await client.post(
            "/api/v1/auth/login", json={"username": "wrong", "password": "wrongpass"}
        )
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]

    @pytest.mark.asyncio()
    async def test_login_wrong_password(self, client: AsyncClient):
        """Test login with wrong password for demo user."""
        response = await client.post(
            "/api/v1/auth/login", json={"username": "demo", "password": "wrongpass"}
        )
        assert response.status_code == 401

    @pytest.mark.asyncio()
    async def test_refresh_token_success(self, client: AsyncClient):
        """Test refreshing access token with valid refresh token."""
        # Create a valid refresh token
        refresh_token = create_refresh_token("user-123")

        response = await client.post(
            "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio()
    async def test_refresh_token_invalid(self, client: AsyncClient):
        """Test refreshing with invalid refresh token."""
        response = await client.post(
            "/api/v1/auth/refresh", json={"refresh_token": "invalid.token.here"}
        )
        assert response.status_code == 401

    @pytest.mark.asyncio()
    async def test_refresh_token_wrong_type(self, client: AsyncClient):
        """Test refreshing with access token instead of refresh token."""
        # Create an access token (wrong type)
        access_token = create_access_token("user-123")

        response = await client.post(
            "/api/v1/auth/refresh", json={"refresh_token": access_token}
        )
        assert response.status_code == 401

    @pytest.mark.asyncio()
    async def test_demo_login(self, client: AsyncClient):
        """Test demo login endpoint."""
        response = await client.post("/api/v1/auth/demo")
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio()
    async def test_get_me(self, client: AsyncClient, auth_headers: dict[str, str]):
        """Test get current user endpoint."""
        response = await client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "username" in data
        assert "email" in data

    @pytest.mark.asyncio()
    async def test_logout(self, client: AsyncClient, auth_headers: dict[str, str]):
        """Test logout endpoint."""
        response = await client.post("/api/v1/auth/logout", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["message"] == "Logged out successfully"
