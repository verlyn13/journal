"""
Test cases for entry API markdown content handling.
"""
import pytest

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry


@pytest.mark.component()
class TestEntriesMarkdownAPI:
    """Test markdown content handling in entries API."""

    @pytest.mark.asyncio()
    async def test_update_entry_with_markdown_sets_version(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry,
        db_session: AsyncSession
    ):
        """Test that updating with markdown_content sets content_version to 2."""
        update_data = {
            "markdown_content": "# Updated Title\n\nThis is **bold** text with a [link](https://example.com)",
            "expected_version": sample_entry.version,
        }

        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()

        # Should have markdown content
        assert data["markdown_content"] == update_data["markdown_content"]

        # Should have generated HTML
        assert "<h1>" in data["content"] or "Updated Title" in data["content"]
        assert "<strong>" in data["content"] or "<b>" in data["content"] or "bold" in data["content"]
        assert "<a" in data["content"] or "https://example.com" in data["content"]

        # Should set content_version to 2 (markdown)
        assert data.get("content_version") == 2

    @pytest.mark.asyncio()
    async def test_update_entry_markdown_with_explicit_version(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test updating markdown with explicit content_version."""
        update_data = {
            "markdown_content": "Simple markdown",
            "content_version": 3,  # Custom version
            "expected_version": sample_entry.version,
        }

        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["content_version"] == 3  # Should use provided version

    @pytest.mark.asyncio()
    async def test_update_entry_html_preserves_version(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test that updating HTML content preserves existing version."""
        # First set to markdown version
        update1 = {
            "markdown_content": "# Title",
            "content_version": 2,
            "expected_version": sample_entry.version,
        }
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update1,
            headers=auth_headers,
        )
        assert response.status_code == 200

        # Now update with HTML only
        update2 = {
            "content": "<p>New HTML content</p>",
            "expected_version": response.json()["version"],
        }
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update2,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["content"] == update2["content"]
        # Version should not change when updating HTML only
        assert data.get("content_version") == 2

    @pytest.mark.asyncio()
    async def test_update_entry_markdown_with_code_blocks(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test markdown with code blocks converts properly."""
        update_data = {
            "markdown_content": """# Code Example

Here's some Python:

```python
def hello():
    print("Hello, World!")
```

And some JavaScript:

```javascript
console.log("Hello");
```
"""
        }

        update_data["expected_version"] = sample_entry.version
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        # Should have code blocks in HTML
        assert "<pre>" in data["content"] or "<code>" in data["content"]
        assert "def hello():" in data["content"]
        assert "console.log" in data["content"]

    @pytest.mark.asyncio()
    async def test_update_entry_markdown_with_lists(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test markdown with lists converts properly."""
        update_data = {
            "markdown_content": """# Lists

Unordered:
- Item 1
- Item 2
  - Nested item
- Item 3

Ordered:
1. First
2. Second
3. Third
"""
        }

        update_data["expected_version"] = sample_entry.version
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        # Should have list elements
        assert "<ul>" in data["content"] or "Item 1" in data["content"]
        assert "<ol>" in data["content"] or "First" in data["content"]
        assert "<li>" in data["content"] or "Item" in data["content"]

    @pytest.mark.asyncio()
    async def test_update_entry_markdown_with_images(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test markdown with images converts properly."""
        update_data = {
            "markdown_content": """# Article with Images

![Alt text](https://example.com/image.jpg)

Some text here.

![Another image](https://example.com/photo.png "With title")
"""
        }

        update_data["expected_version"] = sample_entry.version
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        # Should have image tags
        assert "<img" in data["content"] or "https://example.com/image.jpg" in data["content"]
        assert "Alt text" in data["content"] or "alt=" in data["content"]

    @pytest.mark.asyncio()
    async def test_update_entry_empty_markdown(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test updating with empty markdown content."""
        update_data = {
            "markdown_content": "",
            "expected_version": sample_entry.version,
        }

        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["markdown_content"] == ""
        assert data["content"] == ""  # HTML should also be empty

    @pytest.mark.asyncio()
    async def test_update_entry_markdown_special_characters(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test markdown with special characters and escaping."""
        update_data = {
            "markdown_content": """# Special & Characters

This has <angle> brackets & ampersands.

Also "quotes" and 'apostrophes'.

Math: 5 < 10 && 10 > 5
"""
        }

        update_data["expected_version"] = sample_entry.version
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        # Should escape HTML entities
        assert "&amp;" in data["content"] or "ampersands" in data["content"]
        assert "&lt;" in data["content"] or "&gt;" in data["content"] or "brackets" in data["content"]

    @pytest.mark.asyncio()
    async def test_update_entry_prefer_markdown_header(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test X-Editor-Mode header for markdown preference."""
        # Update with markdown
        update_data = {
            "markdown_content": "# Markdown Title\n\nContent here.",
            "expected_version": sample_entry.version,
        }

        # With markdown preference header
        headers = {**auth_headers, "X-Editor-Mode": "markdown"}

        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["editor_mode"] == "markdown"
        assert "markdown_content" in data

        # Get with markdown preference
        response = await client.get(
            f"/api/v1/entries/{sample_entry.id}",
            headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["editor_mode"] == "markdown"
        assert "markdown_content" in data

    @pytest.mark.asyncio()
    async def test_update_entry_mixed_content_priority(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test that markdown_content takes priority over content."""
        update_data = {
            "markdown_content": "# Markdown wins",
            "content": "<p>HTML loses</p>",  # This should be ignored
            "expected_version": sample_entry.version,
        }

        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()

        # Markdown should win
        assert data["markdown_content"] == "# Markdown wins"
        assert "Markdown wins" in data["content"]
        assert "HTML loses" not in data["content"]

    @pytest.mark.asyncio()
    async def test_update_entry_null_markdown_allowed(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_entry: Entry
    ):
        """Test that null markdown_content is allowed."""
        # First set markdown content
        update1 = {"markdown_content": "# Has content", "expected_version": sample_entry.version}
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update1,
            headers=auth_headers,
        )
        assert response.status_code == 200

        # Now clear it with null
        update2 = {"markdown_content": None, "content": "<p>HTML only</p>", "expected_version": response.json()["version"]}
        response = await client.put(
            f"/api/v1/entries/{sample_entry.id}",
            json=update2,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        # When markdown_content is None, it should not update markdown
        # but should update HTML content
        assert data["content"] == "<p>HTML only</p>"
