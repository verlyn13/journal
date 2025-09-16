"""
Test cases for entries API endpoints.
"""

from httpx import AsyncClient
import pytest

from app.infra.models import Entry
from tests.conftest import assert_entry_response, create_test_entry_data


@pytest.mark.component()
class TestEntriesAPI:
    """Test cases for entries CRUD operations."""

    @pytest.mark.asyncio()
    async def test_get_entries_empty(self, client: AsyncClient, auth_headers: dict[str, str]):
        """Test getting entries when none exist."""
        response = await client.get("/api/v1/entries", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio()
    async def test_get_entries_with_data(
        self, client: AsyncClient, auth_headers: dict[str, str], sample_entry: Entry
    ):
        """Test getting entries when data exists."""
        response = await client.get("/api/v1/entries", headers=auth_headers)
        assert response.status_code == 200

        entries = response.json()
        assert len(entries) == 1
        assert_entry_response(entries[0], "Test Entry")

    @pytest.mark.asyncio()
    async def test_create_entry_success(self, client: AsyncClient, auth_headers: dict[str, str]):
        """Test successful entry creation."""
        entry_data = create_test_entry_data("New Entry", "Some content here")

        response = await client.post("/api/v1/entries", json=entry_data, headers=auth_headers)

        assert response.status_code == 201
        response_data = response.json()
        assert_entry_response(response_data, "New Entry")
        assert response_data["content"] == "Some content here"

    @pytest.mark.asyncio()
    async def test_create_entry_validation_error(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test entry creation with validation errors."""
        # Missing required fields
        response = await client.post("/api/v1/entries", json={}, headers=auth_headers)
        assert response.status_code == 422

    @pytest.mark.asyncio()
    async def test_get_entry_by_id_success(
        self, client: AsyncClient, auth_headers: dict[str, str], sample_entry: Entry
    ):
        """Test getting a specific entry by ID."""
        response = await client.get(f"/api/v1/entries/{sample_entry.id}", headers=auth_headers)

        assert response.status_code == 200
        response_data = response.json()
        assert_entry_response(response_data, "Test Entry")
        assert response_data["id"] == str(sample_entry.id)

    @pytest.mark.asyncio()
    async def test_get_entry_by_id_not_found(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test getting a non-existent entry."""
        non_existent_id = "550e8400-e29b-41d4-a716-446655440999"
        response = await client.get(f"/api/v1/entries/{non_existent_id}", headers=auth_headers)

        assert response.status_code == 404

    @pytest.mark.asyncio()
    async def test_update_entry_success(
        self, client: AsyncClient, auth_headers: dict[str, str], sample_entry: Entry
    ):
        """Test successful entry update."""
        update_data = {
            "title": "Updated Title",
            "content": "Updated content",
            "expected_version": sample_entry.version,
        }

        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}", json=update_data, headers=auth_headers
        )

        assert response.status_code == 200
        response_data = response.json()
        assert response_data["title"] == "Updated Title"
        assert response_data["content"] == "Updated content"

    @pytest.mark.asyncio()
    async def test_update_entry_partial(
        self, client: AsyncClient, auth_headers: dict[str, str], sample_entry: Entry
    ):
        """Test partial entry update."""
        update_data = {"title": "Only Title Updated", "expected_version": sample_entry.version}

        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}", json=update_data, headers=auth_headers
        )

        assert response.status_code == 200
        response_data = response.json()
        assert response_data["title"] == "Only Title Updated"
        assert response_data["content"] == "This is a test entry with some content."

    @pytest.mark.asyncio()
    async def test_update_entry_not_found(self, client: AsyncClient, auth_headers: dict[str, str]):
        """Test updating a non-existent entry."""
        non_existent_id = "550e8400-e29b-41d4-a716-446655440999"
        update_data = {"title": "Won't work", "expected_version": 1}

        response = await client.put(
            f"/api/v1/entries/{non_existent_id}", json=update_data, headers=auth_headers
        )

        assert response.status_code == 404

    @pytest.mark.asyncio()
    async def test_delete_entry_success(
        self, client: AsyncClient, auth_headers: dict[str, str], sample_entry: Entry
    ):
        """Test successful entry deletion."""
        response = await client.delete(
            f"/api/v1/entries/{sample_entry.id}?expected_version={sample_entry.version}",
            headers=auth_headers,
        )

        assert response.status_code == 204

        # Verify entry is deleted
        get_response = await client.get(f"/api/v1/entries/{sample_entry.id}", headers=auth_headers)
        assert get_response.status_code == 404

    @pytest.mark.asyncio()
    async def test_delete_entry_not_found(self, client: AsyncClient, auth_headers: dict[str, str]):
        """Test deleting a non-existent entry."""
        non_existent_id = "550e8400-e29b-41d4-a716-446655440999"
        response = await client.delete(
            f"/api/v1/entries/{non_existent_id}?expected_version=1",
            headers=auth_headers,
        )

        assert response.status_code == 404


@pytest.mark.component()
class TestEntriesAuthentication:
    """Test authentication requirements for entries endpoints."""

    @pytest.mark.asyncio()
    async def test_get_entries_unauthorized(self, client: AsyncClient):
        """Test getting entries without authentication."""
        response = await client.get("/api/v1/entries")
        assert response.status_code == 401

    @pytest.mark.asyncio()
    async def test_create_entry_unauthorized(self, client: AsyncClient):
        """Test creating entry without authentication."""
        entry_data = create_test_entry_data()
        response = await client.post("/api/v1/entries", json=entry_data)
        assert response.status_code == 401

    @pytest.mark.asyncio()
    async def test_get_entry_unauthorized(self, client: AsyncClient):
        """Test getting specific entry without authentication."""
        entry_id = "550e8400-e29b-41d4-a716-446655440000"
        response = await client.get(f"/api/v1/entries/{entry_id}")
        assert response.status_code == 401

    @pytest.mark.asyncio()
    async def test_update_entry_unauthorized(self, client: AsyncClient):
        """Test updating entry without authentication."""
        entry_id = "550e8400-e29b-41d4-a716-446655440000"
        update_data = {"title": "Unauthorized"}
        response = await client.put(f"/api/v1/entries/{entry_id}", json=update_data)
        assert response.status_code == 401

    @pytest.mark.asyncio()
    async def test_delete_entry_unauthorized(self, client: AsyncClient):
        """Test deleting entry without authentication."""
        entry_id = "550e8400-e29b-41d4-a716-446655440000"
        response = await client.delete(f"/api/v1/entries/{entry_id}")
        assert response.status_code == 401
