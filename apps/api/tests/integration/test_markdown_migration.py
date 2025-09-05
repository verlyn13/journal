import pytest
from httpx import AsyncClient


@pytest.mark.asyncio()
@pytest.mark.component()
async def test_dual_write_saves_both_formats(client: AsyncClient, auth_headers: dict[str, str]):
    payload = {
        "title": "MD Entry",
        "markdown_content": "# Title\n\nBody",
        "content_version": 2,
    }
    r = await client.post("/api/v1/entries", json=payload, headers=auth_headers)
    assert r.status_code == 201
    data = r.json()
    assert data["content_version"] >= 2
    assert data["markdown_content"] is not None
    assert "<h1>" in data["content"]  # html derived from markdown


@pytest.mark.asyncio()
@pytest.mark.component()
async def test_backward_compatibility(client: AsyncClient, auth_headers: dict[str, str]):
    # Default returns HTML
    r = await client.get("/api/v1/entries", headers=auth_headers)
    assert r.status_code == 200
    items = r.json()
    if items:
        assert isinstance(items[0]["content"], str)


@pytest.mark.asyncio()
@pytest.mark.component()
async def test_new_clients_get_markdown(client: AsyncClient, auth_headers: dict[str, str]):
    headers = {**auth_headers, "X-Content-Format": "markdown"}
    r = await client.get("/api/v1/entries", headers=headers)
    assert r.status_code == 200
    items = r.json()
    if items:
        # when markdown exists prefer markdown
        first = items[0]
        if first.get("markdown_content"):
            assert first["content"] == first["markdown_content"]


@pytest.mark.asyncio()
@pytest.mark.integration()
async def test_backfill_preserves_content(
    client: AsyncClient, auth_headers: dict[str, str], db_session
):
    # Create legacy HTML entry
    r = await client.post(
        "/api/v1/entries",
        json={"title": "Legacy", "content": "<h1>Head</h1><p>Para</p>"},
        headers=auth_headers,
    )
    assert r.status_code == 201
    print(f"Created entry: {r.json()}")

    # Invoke backfill function directly with the same session
    from app.scripts.backfill_markdown import backfill_markdown_content

    count = await backfill_markdown_content(session=db_session, batch_size=10)
    print(f"Backfill processed: {count} entries")

    # Verify markdown now present
    r2 = await client.get(
        "/api/v1/entries", headers={**auth_headers, "X-Content-Format": "markdown"}
    )
    assert r2.status_code == 200
    items = r2.json()
    print(f"Final entries: {items}")
    assert any(it.get("markdown_content") for it in items)
