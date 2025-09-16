"""Additional tests to boost coverage on core API paths."""

from httpx import AsyncClient
import pytest


@pytest.mark.asyncio()
@pytest.mark.component()
async def test_entry_api_edge_cases(client: AsyncClient, auth_headers):
    """Test edge cases in entry API to boost coverage."""

    # Create entry with minimal data
    r = await client.post(
        "/api/v1/entries",
        json={"title": "Test", "content": ""},
        headers=auth_headers,
    )
    assert r.status_code == 201
    entry_id = r.json()["id"]

    # Test markdown content handling
    r2 = await client.post(
        "/api/v1/entries",
        json={"title": "MD Test", "markdown_content": "# Header\n\nContent", "content_version": 2},
        headers=auth_headers,
    )
    assert r2.status_code == 201

    # Test partial update
    r3 = await client.put(
        f"/api/v1/entries/{entry_id}",
        json={"title": "Updated Title", "expected_version": r.json()["version"]},
        headers=auth_headers,
    )
    assert r3.status_code == 200

    # Test markdown update
    md_entry_id = r2.json()["id"]
    r4 = await client.put(
        f"/api/v1/entries/{md_entry_id}",
        json={
            "markdown_content": "# Updated\n\nNew content",
            "content_version": 2,
            "expected_version": r2.json()["version"],
        },
        headers=auth_headers,
    )
    assert r4.status_code == 200


@pytest.mark.asyncio()
@pytest.mark.component()
async def test_content_format_headers(client: AsyncClient, auth_headers):
    """Test different content format headers."""

    # Create a markdown entry
    r = await client.post(
        "/api/v1/entries",
        json={
            "title": "Format Test",
            "markdown_content": "# Test\n\nContent",
            "content_version": 2,
        },
        headers=auth_headers,
    )
    assert r.status_code == 201

    # Test different headers
    headers_variants = [
        {**auth_headers, "X-Editor-Mode": "markdown"},
        {**auth_headers, "X-Content-Format": "markdown"},
        {**auth_headers, "X-Client-Editor": "markdown"},
    ]

    for headers_variant in headers_variants:
        r2 = await client.get("/api/v1/entries", headers=headers_variant)
        assert r2.status_code == 200
        entries = r2.json()
        if entries:
            assert entries[0]["editor_mode"] == "markdown"


@pytest.mark.asyncio()
@pytest.mark.component()
async def test_invalid_entry_ids(client: AsyncClient, auth_headers):
    """Test various invalid entry ID scenarios."""

    # Invalid UUID format
    r1 = await client.get("/api/v1/entries/not-a-uuid", headers=auth_headers)
    assert r1.status_code == 404

    r2 = await client.put(
        "/api/v1/entries/not-a-uuid",
        json={"title": "Test", "expected_version": 1},
        headers=auth_headers,
    )
    assert r2.status_code == 404

    r3 = await client.delete("/api/v1/entries/not-a-uuid?expected_version=1", headers=auth_headers)
    assert r3.status_code == 404

    # Valid UUID but non-existent entry
    fake_id = "123e4567-e89b-12d3-a456-426614174000"
    r4 = await client.get(f"/api/v1/entries/{fake_id}", headers=auth_headers)
    assert r4.status_code == 404

    r5 = await client.put(
        f"/api/v1/entries/{fake_id}",
        json={"title": "Test", "expected_version": 1},
        headers=auth_headers,
    )
    assert r5.status_code == 404

    r6 = await client.delete(f"/api/v1/entries/{fake_id}?expected_version=1", headers=auth_headers)
    assert r6.status_code == 404
