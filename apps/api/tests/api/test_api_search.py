"""
Test cases for search API endpoints.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry


@pytest.mark.component()
class TestSearchAPI:
    """Test cases for search functionality."""

    @pytest.mark.asyncio()
    async def test_search_without_query(self, client: AsyncClient):
        """Test search endpoint without query parameter."""
        response = await client.get("/api/v1/search")
        assert response.status_code == 422  # Missing required query param

    @pytest.mark.asyncio()
    async def test_search_empty_results(self, client: AsyncClient):
        """Test search with query that returns no results."""
        response = await client.get("/api/v1/search", params={"q": "nonexistentquery12345"})
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio()
    async def test_search_with_results(self, client: AsyncClient, db_session: AsyncSession):
        """Test search that returns matching entries."""
        # Create test entries
        entry1 = Entry(
            title="Python Tutorial",
            content="Learn Python programming",
            author_id="11111111-1111-1111-1111-111111111111",
        )
        entry2 = Entry(
            title="JavaScript Guide",
            content="JavaScript is a programming language",
            author_id="11111111-1111-1111-1111-111111111111",
        )
        entry3 = Entry(
            title="Cooking Recipe",
            content="How to make pasta",
            author_id="11111111-1111-1111-1111-111111111111",
        )
        db_session.add_all([entry1, entry2, entry3])
        await db_session.flush()

        # Search for "programming"
        response = await client.get("/api/v1/search", params={"q": "programming"})
        assert response.status_code == 200
        results = response.json()
        assert len(results) >= 2  # Should find Python and JavaScript entries

        # Verify results contain expected entries
        titles = [r["title"] for r in results]
        assert "Python Tutorial" in titles
        assert "JavaScript Guide" in titles

    @pytest.mark.asyncio()
    async def test_search_semantic_endpoint(self, client: AsyncClient, monkeypatch):
        """Test semantic search POST endpoint."""

        # Mock the semantic_search function - it needs to be in the module that imports it
        async def mock_semantic_search(session, q, k):
            return [{"id": "test-id", "title": "Test", "content": "Test content"}]

        # Patch in the search module where it's imported
        monkeypatch.setattr("app.api.v1.search.semantic_search", mock_semantic_search)

        response = await client.post("/api/v1/search/semantic", json={"q": "test query"})
        assert response.status_code == 200
        results = response.json()
        assert len(results) == 1
        assert results[0]["title"] == "Test"

    @pytest.mark.asyncio()
    async def test_search_hybrid_with_alpha(self, client: AsyncClient, monkeypatch):
        """Test hybrid search with alpha parameter."""

        # Mock the hybrid_search function in the module that imports it
        async def mock_hybrid_search(session, q, k, alpha):
            return [{"id": "test-id", "title": "Hybrid Result", "content": "Content"}]

        monkeypatch.setattr("app.api.v1.search.hybrid_search", mock_hybrid_search)

        response = await client.get("/api/v1/search", params={"q": "test", "alpha": 0.7})
        assert response.status_code == 200
        results = response.json()
        assert len(results) == 1
        assert results[0]["title"] == "Hybrid Result"

    @pytest.mark.asyncio()
    async def test_search_invalid_alpha(self, client: AsyncClient):
        """Test search with invalid alpha parameter."""
        response = await client.get("/api/v1/search", params={"q": "test", "alpha": 1.5})
        assert response.status_code == 422
        detail = response.json()["detail"][0]
        assert detail["loc"] == ["query", "alpha"]
        assert "less than or equal to 1" in detail["msg"]
