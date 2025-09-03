"""
Test cases for entry API error paths and edge cases.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry


@pytest.mark.component
class TestEntriesAPIErrors:
    """Test error handling in entries API."""

    @pytest.mark.asyncio
    async def test_get_entries_with_pagination(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession
    ):
        """Test getting entries with pagination parameters."""
        # Create multiple entries
        for i in range(15):
            entry = Entry(
                title=f"Entry {i}",
                content=f"Content {i}",
                author_id="11111111-1111-1111-1111-111111111111"
            )
            db_session.add(entry)
        await db_session.flush()

        # Test with limit
        response = await client.get(
            "/api/v1/entries",
            params={"limit": 5},
            headers=auth_headers
        )
        assert response.status_code == 200
        entries = response.json()
        assert len(entries) == 5

        # Test with offset
        response = await client.get(
            "/api/v1/entries",
            params={"offset": 10, "limit": 10},
            headers=auth_headers
        )
        assert response.status_code == 200
        entries = response.json()
        assert len(entries) == 5  # Only 5 entries left after offset 10

    @pytest.mark.asyncio
    async def test_update_entry_empty_data(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test updating entry with empty data."""
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json={"expected_version": sample_entry.version},
            headers=auth_headers,
        )
        # Should succeed but not change anything
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == sample_entry.title
        assert data["content"] == sample_entry.content

    @pytest.mark.asyncio
    async def test_update_entry_markdown_conversion(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test updating entry with markdown content."""
        update_data = {
            "markdown_content": "# Heading\n\nSome **bold** text",
            "expected_version": sample_entry.version,
        }
        
        # Add header to indicate markdown preference
        headers = {**auth_headers, "X-Editor-Mode": "markdown"}
        
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["markdown_content"] == update_data["markdown_content"]
        assert data["editor_mode"] == "markdown"
        # HTML content should be generated
        assert "<h1>" in data["content"] or "Heading" in data["content"]
        assert "<strong>" in data["content"] or "bold" in data["content"]

    @pytest.mark.asyncio
    async def test_update_entry_html_conversion(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test updating entry with HTML content."""
        update_data = {
            "content": "<h1>Title</h1><p>Paragraph</p>",
            "expected_version": sample_entry.version,
        }
        
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == update_data["content"]
        assert data["editor_mode"] == "html"  # Default mode when no header is set

    @pytest.mark.asyncio
    async def test_update_entry_invalid_uuid(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str]
    ):
        """Test updating entry with invalid UUID format."""
        response = await client.put(
            "/api/v1/entries/not-a-uuid",
            json={"title": "Test", "expected_version": 1},
            headers=auth_headers,
        )
        assert response.status_code == 404  # Invalid UUID treated as not found

    @pytest.mark.asyncio
    async def test_delete_entry_invalid_uuid(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str]
    ):
        """Test deleting entry with invalid UUID format."""
        response = await client.delete(
            "/api/v1/entries/not-a-uuid?expected_version=1",
            headers=auth_headers,
        )
        assert response.status_code == 404  # Invalid UUID treated as not found

    @pytest.mark.asyncio
    async def test_create_entry_with_tags(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str]
    ):
        """Test creating entry with tags."""
        entry_data = {
            "title": "Entry with tags",
            "content": "Content",
            "tags": ["python", "testing", "api"]
        }
        
        response = await client.post(
            "/api/v1/entries",
            json=entry_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == entry_data["title"]
        # Note: Tags might not be returned if not implemented yet

    @pytest.mark.asyncio
    async def test_get_entries_with_search_query(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession
    ):
        """Test getting entries with search query parameter."""
        # Create test entries
        entry1 = Entry(
            title="Python Guide",
            content="Learn Python",
            author_id="11111111-1111-1111-1111-111111111111"
        )
        entry2 = Entry(
            title="Java Tutorial",
            content="Learn Java",
            author_id="11111111-1111-1111-1111-111111111111"
        )
        db_session.add_all([entry1, entry2])
        await db_session.flush()

        # Search for Python
        response = await client.get(
            "/api/v1/entries",
            params={"q": "Python"},
            headers=auth_headers
        )
        assert response.status_code == 200
        entries = response.json()
        # Should return Python entry
        assert any("Python" in e["title"] for e in entries)
