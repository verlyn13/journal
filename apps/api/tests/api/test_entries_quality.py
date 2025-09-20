"""
Quality-focused tests for entry API endpoints.
These tests focus on real-world scenarios, error handling, and edge cases.
"""

from httpx import AsyncClient
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry


class TestEntriesQuality:
    """High-quality tests for entry endpoints focusing on real scenarios."""

    @pytest.mark.asyncio()
    async def test_update_entry_preserves_data_integrity_with_partial_updates(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry,
        db_session: AsyncSession,
    ):
        """Test that partial updates don't corrupt existing data."""
        # Start with a complete entry
        entry_id = str(sample_entry.id)
        original_response = await client.get(
            f"/api/v1/entries/{entry_id}", headers=auth_headers
        )
        original_data = original_response.json()

        # Update only the title
        update_response = await client.put(
            f"/api/v1/entries/{entry_id}",
            json={
                "title": "Updated Title Only",
                "expected_version": original_data["version"],
            },
            headers=auth_headers,
        )
        assert update_response.status_code == 200

        # Verify content wasn't lost
        updated_data = update_response.json()
        assert updated_data["title"] == "Updated Title Only"
        assert updated_data["content"] == original_data["content"]
        assert updated_data["id"] == entry_id

        # Update only markdown content
        markdown_update = await client.put(
            f"/api/v1/entries/{entry_id}",
            json={
                "markdown_content": "# New Markdown\n\nWith **formatting**",
                "expected_version": updated_data["version"],
            },
            headers=auth_headers,
        )
        assert markdown_update.status_code == 200

        # Verify title wasn't lost and HTML was generated
        markdown_data = markdown_update.json()
        assert markdown_data["title"] == "Updated Title Only"
        assert "<h1>" in markdown_data["content"]
        assert markdown_data["content_version"] == 2

    @pytest.mark.asyncio()
    async def test_sequential_updates_maintain_consistency(
        self, client: AsyncClient, auth_headers: dict[str, str], sample_entry: Entry
    ):
        """Test that sequential updates maintain data consistency."""
        entry_id = str(sample_entry.id)

        # Sequential updates to avoid session conflicts
        # Update title first
        # Fetch current state for version
        current = await client.get(f"/api/v1/entries/{entry_id}", headers=auth_headers)
        title_response = await client.put(
            f"/api/v1/entries/{entry_id}",
            json={
                "title": "Updated Title",
                "expected_version": current.json()["version"],
            },
            headers=auth_headers,
        )
        assert title_response.status_code == 200

        # Then update content
        content_response = await client.put(
            f"/api/v1/entries/{entry_id}",
            json={
                "content": "<p>Updated Content</p>",
                "expected_version": title_response.json()["version"],
            },
            headers=auth_headers,
        )
        assert content_response.status_code == 200

        # Final state should have both updates
        final_response = await client.get(
            f"/api/v1/entries/{entry_id}", headers=auth_headers
        )
        final_data = final_response.json()

        # Both updates should be reflected
        assert final_data["title"] == "Updated Title"
        assert "<p>Updated Content</p>" in final_data["content"]

    @pytest.mark.asyncio()
    async def test_markdown_html_dual_format_consistency(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test that markdown and HTML formats remain consistent through updates."""
        # Create entry with markdown
        create_response = await client.post(
            "/api/v1/entries",
            json={
                "title": "Dual Format Test",
                "markdown_content": "# Heading\n\n- Item 1\n- Item 2\n\n**Bold** text",
                "content_version": 2,
            },
            headers=auth_headers,
        )
        assert create_response.status_code == 201
        entry_id = create_response.json()["id"]

        # Get with markdown preference
        markdown_headers = {**auth_headers, "X-Editor-Mode": "markdown"}
        md_response = await client.get(
            f"/api/v1/entries/{entry_id}", headers=markdown_headers
        )

        # Get with HTML preference (default)
        html_response = await client.get(
            f"/api/v1/entries/{entry_id}", headers=auth_headers
        )

        md_data = md_response.json()
        html_data = html_response.json()

        # Verify markdown is returned when requested
        assert "# Heading" in md_data.get("markdown_content", "")
        # Verify HTML is always present
        assert "<h1>" in html_data["content"]
        assert "<ul>" in html_data["content"]
        assert "<strong>" in html_data["content"] or "<b>" in html_data["content"]

    @pytest.mark.asyncio()
    async def test_content_length_tracking(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test that content length is tracked appropriately."""
        test_cases = [
            {"content": "<p>This is a simple test.</p>", "min_length": 10},
            {
                "markdown_content": "# Title\n\nThis is **bold** and _italic_ text.",
                "min_length": 20,
            },
            {
                "content": "<h1>Title</h1><p>Paragraph with <strong>formatting</strong></p>",
                "min_length": 15,
            },
        ]

        for case in test_cases:
            response = await client.post(
                "/api/v1/entries",
                json={"title": "Content Test", **case},
                headers=auth_headers,
            )
            assert response.status_code == 201
            data = response.json()

            # Verify content is present and has expected minimum length
            assert "content" in data
            assert len(data["content"]) >= case["min_length"]

    @pytest.mark.asyncio()
    async def test_malformed_markdown_handled_gracefully(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test that malformed markdown doesn't break the system."""
        malformed_cases = [
            "**Unclosed bold",
            "[Broken link](http://",
            "```\nUnclosed code block",
            "# \n\n## \n\n### ",  # Empty headers
            "- \n- \n- ",  # Empty list items
        ]

        for markdown in malformed_cases:
            response = await client.post(
                "/api/v1/entries",
                json={
                    "title": "Malformed Test",
                    "markdown_content": markdown,
                    "content_version": 2,
                },
                headers=auth_headers,
            )
            # Should still create entry, even with malformed markdown
            assert response.status_code == 201
            data = response.json()
            assert data["content"] is not None  # HTML was generated
            assert len(data["content"]) > 0

    @pytest.mark.asyncio()
    async def test_entry_lifecycle_with_soft_delete(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test complete entry lifecycle including soft delete behavior."""
        # Create
        create_response = await client.post(
            "/api/v1/entries",
            json={"title": "Lifecycle Test", "content": "Test content"},
            headers=auth_headers,
        )
        assert create_response.status_code == 201
        entry_id = create_response.json()["id"]

        # Update multiple times
        for i in range(3):
            # Get current version before each update
            cur = await client.get(f"/api/v1/entries/{entry_id}", headers=auth_headers)
            update_response = await client.put(
                f"/api/v1/entries/{entry_id}",
                json={
                    "title": f"Update {i + 1}",
                    "expected_version": cur.json()["version"],
                },
                headers=auth_headers,
            )
            assert update_response.status_code == 200

        # Delete (soft delete)
        # Use current version for deletion
        cur = await client.get(f"/api/v1/entries/{entry_id}", headers=auth_headers)
        delete_response = await client.delete(
            f"/api/v1/entries/{entry_id}",
            headers=auth_headers,
            params={"expected_version": cur.json()["version"]},
        )
        assert delete_response.status_code == 204

        # Verify it's not in the list
        list_response = await client.get("/api/v1/entries", headers=auth_headers)
        entries = list_response.json()
        assert not any(e["id"] == entry_id for e in entries)

        # But direct access might still work (depending on implementation)
        # This tests for consistent behavior
        get_response = await client.get(
            f"/api/v1/entries/{entry_id}", headers=auth_headers
        )
        # Should be 404 after soft delete
        assert get_response.status_code == 404

    @pytest.mark.asyncio()
    async def test_large_content_handling(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test handling of large content entries."""
        # Generate large but realistic content
        large_markdown = "# Large Document\n\n"
        for i in range(100):
            large_markdown += f"## Section {i + 1}\n\n"
            large_markdown += f"This is paragraph {i + 1} with some content. " * 10
            large_markdown += "\n\n"

        response = await client.post(
            "/api/v1/entries",
            json={
                "title": "Large Entry",
                "markdown_content": large_markdown,
                "content_version": 2,
            },
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()

        # Verify it was stored and can be retrieved
        get_response = await client.get(
            f"/api/v1/entries/{data['id']}", headers=auth_headers
        )
        assert get_response.status_code == 200
        retrieved = get_response.json()

        # Content should be preserved
        assert len(retrieved["content"]) > len(large_markdown)  # HTML is longer
        assert retrieved["word_count"] > 1000

    @pytest.mark.asyncio()
    async def test_special_characters_in_content(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test that special characters are handled correctly."""
        special_content = {
            "title": "Special < > & \" ' Characters",
            "markdown_content": """
# Special & Characters < > " '

Code with special chars: `const a = "<div>&nbsp;</div>";`

URL: https://example.com?foo=bar&baz=qux

Math: $x < y > z$

Emoji: 🎉 🚀 ✨
""",
        }

        response = await client.post(
            "/api/v1/entries", json=special_content, headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()

        # Verify special characters are preserved/escaped properly
        assert "&" in data["content"] or "&amp;" in data["content"]
        assert "🎉" in data["markdown_content"]

        # Retrieve and verify
        get_response = await client.get(
            f"/api/v1/entries/{data['id']}",
            headers={**auth_headers, "X-Editor-Mode": "markdown"},
        )
        retrieved = get_response.json()
        assert "🎉" in retrieved["markdown_content"]
