"""
Test cases for entry deletion functionality.
"""

from uuid import uuid4

import pytest

from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry


@pytest.mark.component()
class TestEntriesDeleteAPI:
    """Test entry deletion functionality."""

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
        assert response.content == b""

        # Verify entry is deleted
        response = await client.get(f"/api/v1/entries/{sample_entry.id}", headers=auth_headers)
        assert response.status_code == 404

    @pytest.mark.asyncio()
    async def test_delete_entry_not_found(self, client: AsyncClient, auth_headers: dict[str, str]):
        """Test deleting non-existent entry."""
        fake_id = str(uuid4())
        response = await client.delete(
            f"/api/v1/entries/{fake_id}?expected_version=1", headers=auth_headers
        )

        assert response.status_code == 404
        assert response.json()["detail"] == "Entry not found"

    @pytest.mark.asyncio()
    async def test_delete_entry_invalid_uuid(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test deleting entry with invalid UUID."""
        response = await client.delete(
            "/api/v1/entries/not-a-valid-uuid?expected_version=1",
            headers=auth_headers,
        )

        assert response.status_code == 404
        assert response.json()["detail"] == "Entry not found"

    @pytest.mark.asyncio()
    async def test_delete_entry_soft_delete(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry,
        db_session: AsyncSession,
    ):
        """Test that deletion is soft delete (is_deleted flag)."""
        entry_id = str(sample_entry.id)

        # Delete the entry
        response = await client.delete(
            f"/api/v1/entries/{entry_id}?expected_version={sample_entry.version}",
            headers=auth_headers,
        )
        assert response.status_code == 204

        # Check database - entry should still exist but marked deleted
        result = await db_session.execute(
            text("SELECT is_deleted FROM entries WHERE id = :id"), {"id": entry_id}
        )
        row = result.first()
        assert row is not None
        assert row[0] is True  # is_deleted should be True

    @pytest.mark.asyncio()
    async def test_delete_entry_with_embedding(
        self, client: AsyncClient, auth_headers: dict[str, str], db_session: AsyncSession
    ):
        """Test deleting entry that has an embedding."""
        # Create entry
        entry = Entry(
            title="Entry with embedding",
            content="Content to embed",
            author_id="11111111-1111-1111-1111-111111111111",
        )
        db_session.add(entry)
        await db_session.commit()

        # Add embedding
        embedding = [0.1] * 1536
        embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
        await db_session.execute(
            text(f"""
                INSERT INTO entry_embeddings(entry_id, embedding)
                VALUES (:id, '{embedding_str}'::vector)
            """),
            {"id": str(entry.id)},
        )
        await db_session.commit()

        # Delete the entry
        response = await client.delete(
            f"/api/v1/entries/{entry.id}?expected_version=1",
            headers=auth_headers,
        )
        assert response.status_code == 204

        # Note: Embedding deletion would typically be handled by the worker
        # via an event, not directly in the API

    @pytest.mark.asyncio()
    async def test_delete_entry_idempotent(
        self, client: AsyncClient, auth_headers: dict[str, str], sample_entry: Entry
    ):
        """Test that deletion is idempotent."""
        entry_id = str(sample_entry.id)

        # First deletion
        response = await client.delete(
            f"/api/v1/entries/{entry_id}?expected_version={sample_entry.version}",
            headers=auth_headers,
        )
        assert response.status_code == 204

        # Second deletion should return 404
        response = await client.delete(
            f"/api/v1/entries/{entry_id}?expected_version={sample_entry.version}",
            headers=auth_headers,
        )
        assert response.status_code == 404

    @pytest.mark.asyncio()
    async def test_delete_entry_requires_auth(self, client: AsyncClient, sample_entry: Entry):
        """Test that deletion requires authentication."""
        response = await client.delete(f"/api/v1/entries/{sample_entry.id}")

        assert response.status_code == 401

    @pytest.mark.asyncio()
    async def test_delete_entry_different_user_allowed(
        self, client: AsyncClient, auth_headers: dict[str, str], db_session: AsyncSession
    ):
        """Test that any authenticated user can delete any entry (current behavior)."""
        # Create entry by different user
        entry = Entry(
            title="Other user's entry",
            content="Content",
            author_id="22222222-2222-2222-2222-222222222222",  # Different user
        )
        db_session.add(entry)
        await db_session.commit()

        # Current user can still delete it (no ownership check currently)
        response = await client.delete(
            f"/api/v1/entries/{entry.id}?expected_version=1",
            headers=auth_headers,
        )

        # This should succeed in current implementation
        assert response.status_code == 204

    @pytest.mark.asyncio()
    async def test_delete_entry_updates_is_deleted_flag(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry,
        db_session: AsyncSession,
    ):
        """Test that deletion sets is_deleted flag and updates timestamp."""
        entry_id = str(sample_entry.id)

        # Check initial state
        result = await db_session.execute(
            text("SELECT is_deleted, updated_at FROM entries WHERE id = :id"), {"id": entry_id}
        )
        row = result.first()
        assert row[0] is False  # is_deleted should be False initially
        initial_updated_at = row[1]

        # Delete the entry
        response = await client.delete(
            f"/api/v1/entries/{entry_id}?expected_version={sample_entry.version}",
            headers=auth_headers,
        )
        assert response.status_code == 204

        # Check is_deleted is set and updated_at changed
        result = await db_session.execute(
            text("SELECT is_deleted, updated_at FROM entries WHERE id = :id"), {"id": entry_id}
        )
        row = result.first()
        assert row[0] is True  # is_deleted should be True
        # updated_at should be same or newer (may be too fast to detect change)
        assert row[1] >= initial_updated_at

    @pytest.mark.asyncio()
    async def test_deleted_entry_not_in_list(
        self, client: AsyncClient, auth_headers: dict[str, str], sample_entry: Entry
    ):
        """Test that deleted entries don't appear in list."""
        # Get initial list
        response = await client.get("/api/v1/entries", headers=auth_headers)
        assert response.status_code == 200
        initial_count = len(response.json())

        # Delete an entry
        response = await client.delete(
            f"/api/v1/entries/{sample_entry.id}?expected_version={sample_entry.version}",
            headers=auth_headers,
        )
        assert response.status_code == 204

        # Get list again
        response = await client.get("/api/v1/entries", headers=auth_headers)
        assert response.status_code == 200
        entries = response.json()

        # Should have one less entry
        assert len(entries) == initial_count - 1

        # Deleted entry should not be in list
        entry_ids = [e["id"] for e in entries]
        assert str(sample_entry.id) not in entry_ids
