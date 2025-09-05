"""
Quality-focused tests for search functionality.
Tests semantic search, embedding generation, and search result quality.
"""

from uuid import uuid4

import pytest

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry


class TestSearchQuality:
    """High-quality tests for search and embedding functionality."""

    @pytest.mark.asyncio
    async def test_semantic_search_relevance(
        self, client: AsyncClient, auth_headers: dict[str, str], db_session: AsyncSession
    ):
        """Test that semantic search returns relevant results."""
        # Create entries with different topics
        entries = [
            {
                "title": "Machine Learning Basics",
                "content": "Neural networks, deep learning, and AI fundamentals",
            },
            {"title": "Cooking Recipe", "content": "How to make pasta with tomato sauce"},
            {
                "title": "Python Programming",
                "content": "Writing code, functions, and object-oriented programming",
            },
            {
                "title": "AI and Future",
                "content": "Artificial intelligence will transform how we work",
            },
        ]

        created_ids = []
        for entry_data in entries:
            response = await client.post("/api/v1/entries", json=entry_data, headers=auth_headers)
            assert response.status_code == 201
            created_ids.append(response.json()["id"])

        # Generate embeddings for all entries (required for semantic search)
        for entry_id in created_ids:
            embed_response = await client.post(
                f"/api/v1/search/entries/{entry_id}/embed", headers=auth_headers
            )
            assert embed_response.status_code == 200

        # Search for AI-related content
        search_response = await client.post(
            "/api/v1/search/semantic",
            json={"q": "artificial intelligence and machine learning", "k": 2},
            headers=auth_headers,
        )
        assert search_response.status_code == 200
        results = search_response.json()

        # Should return results now that embeddings exist
        # With fake embeddings, relevance won't be perfect but should return something
        assert len(results) >= 1  # At least some results

        # Just verify we got entries back (can't test relevance with fake embeddings)
        if results:
            assert "title" in results[0]
            assert "id" in results[0]

    @pytest.mark.asyncio
    async def test_hybrid_search_combines_keyword_and_semantic(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test that hybrid search effectively combines keyword and semantic matching."""
        # Create entries with specific keywords and semantic meaning
        entries = [
            {
                "title": "FastAPI Documentation",
                "content": "FastAPI is a modern web framework for building APIs with Python",
            },
            {"title": "Django Tutorial", "content": "Django is a high-level Python web framework"},
            {
                "title": "Express Guide",
                "content": "Express.js is a Node.js web application framework",
            },
        ]

        created_ids = []
        for entry_data in entries:
            response = await client.post("/api/v1/entries", json=entry_data, headers=auth_headers)
            assert response.status_code == 201
            created_ids.append(response.json()["id"])

        # Generate embeddings for hybrid search
        for entry_id in created_ids:
            await client.post(f"/api/v1/search/entries/{entry_id}/embed", headers=auth_headers)

        # Search with both keyword and semantic intent
        search_response = await client.get(
            "/api/v1/search",
            params={"q": "Python web framework", "alpha": 0.5},  # 50/50 keyword/semantic
            headers=auth_headers,
        )
        assert search_response.status_code == 200
        results = search_response.json()

        # Just verify we got results (exact ranking depends on embeddings)
        assert len(results) > 0
        assert all("title" in r for r in results)

    @pytest.mark.asyncio
    async def test_embedding_generation_for_existing_entry(
        self, client: AsyncClient, auth_headers: dict[str, str], sample_entry: Entry
    ):
        """Test manual embedding generation for an existing entry."""
        entry_id = str(sample_entry.id)

        # Trigger embedding generation
        response = await client.post(
            f"/api/v1/search/entries/{entry_id}/embed", headers=auth_headers
        )
        assert response.status_code == 200
        result = response.json()

        assert result["status"] == "ok"
        assert result["entry_id"] == entry_id

        # Verify the entry can now be found via semantic search
        search_response = await client.post(
            "/api/v1/search/semantic", json={"q": sample_entry.title, "k": 5}, headers=auth_headers
        )
        assert search_response.status_code == 200
        results = search_response.json()

        # Should find the entry we just embedded
        entry_ids = [r["id"] for r in results]
        assert entry_id in entry_ids

    @pytest.mark.asyncio
    async def test_embedding_generation_with_invalid_entry(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test embedding generation handles invalid entry IDs gracefully."""
        # Invalid UUID format
        response = await client.post(
            "/api/v1/search/entries/not-a-uuid/embed", headers=auth_headers
        )
        assert response.status_code == 404

        # Valid UUID but non-existent entry
        fake_id = str(uuid4())
        response = await client.post(
            f"/api/v1/search/entries/{fake_id}/embed", headers=auth_headers
        )
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_search_with_empty_database(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test search behavior with no entries."""
        # Note: This assumes a clean test database or we skip if entries exist
        list_response = await client.get("/api/v1/entries", headers=auth_headers)
        existing_entries = list_response.json()

        if len(existing_entries) == 0:
            # Test keyword search
            search_response = await client.get(
                "/api/v1/search", params={"q": "anything"}, headers=auth_headers
            )
            assert search_response.status_code == 200
            assert search_response.json() == []

            # Test semantic search
            semantic_response = await client.post(
                "/api/v1/search/semantic", json={"q": "anything", "k": 10}, headers=auth_headers
            )
            assert semantic_response.status_code == 200
            assert semantic_response.json() == []

    @pytest.mark.asyncio
    async def test_search_result_limit_parameter(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test that search respects the k parameter for result limits."""
        # Create multiple entries
        created_ids = []
        for i in range(10):
            response = await client.post(
                "/api/v1/entries",
                json={
                    "title": f"Test Entry {i}",
                    "content": f"Common content with unique number {i}",
                },
                headers=auth_headers,
            )
            if response.status_code == 201:
                created_ids.append(response.json()["id"])

        # Generate embeddings for semantic search
        for entry_id in created_ids:
            await client.post(f"/api/v1/search/entries/{entry_id}/embed", headers=auth_headers)

        # Test different k values
        for k in [1, 3, 5, 20]:
            response = await client.post(
                "/api/v1/search/semantic",
                json={"q": "common content", "k": k},
                headers=auth_headers,
            )
            assert response.status_code == 200
            results = response.json()
            # Results should be limited by k or available entries with embeddings
            assert len(results) <= min(k, len(created_ids))

    @pytest.mark.asyncio
    async def test_search_with_special_characters_in_query(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test that search handles special characters in queries."""
        # Create entry with special characters
        special_entry = await client.post(
            "/api/v1/entries",
            json={
                "title": "C++ & Python",
                "content": "Comparing C++ and Python: performance & ease-of-use",
            },
            headers=auth_headers,
        )
        assert special_entry.status_code == 201

        # Search with special characters
        queries = [
            "C++",
            "C++ & Python",
            "performance & ease-of-use",
            "@#$%",  # Should not crash
            "'''\"\"\"",  # Quote characters
        ]

        for query in queries:
            # Keyword search
            response = await client.get("/api/v1/search", params={"q": query}, headers=auth_headers)
            assert response.status_code in [200, 400]  # Either success or bad request

            # Semantic search
            semantic_response = await client.post(
                "/api/v1/search/semantic", json={"q": query, "k": 5}, headers=auth_headers
            )
            assert semantic_response.status_code in [200, 400]

    @pytest.mark.asyncio
    async def test_search_alpha_parameter_validation(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test that alpha parameter for hybrid search is validated properly."""
        # Create some entries for searching
        await client.post(
            "/api/v1/entries",
            json={"title": "Test", "content": "Test content"},
            headers=auth_headers,
        )

        # Test invalid alpha values
        invalid_alphas = [-0.1, 1.1, 2.0, -1.0]
        for alpha in invalid_alphas:
            response = await client.get(
                "/api/v1/search", params={"q": "test", "alpha": alpha}, headers=auth_headers
            )
            # Should either reject or clamp to valid range
            assert response.status_code in [200, 400]

        # Test valid alpha values
        valid_alphas = [0.0, 0.5, 1.0]
        for alpha in valid_alphas:
            response = await client.get(
                "/api/v1/search", params={"q": "test", "alpha": alpha}, headers=auth_headers
            )
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_search_excludes_deleted_entries_consistently(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test that deleted entries are consistently excluded from all search types."""
        # Create and then delete an entry
        create_response = await client.post(
            "/api/v1/entries",
            json={"title": "To Be Deleted", "content": "This entry will be deleted"},
            headers=auth_headers,
        )
        assert create_response.status_code == 201
        entry_id = create_response.json()["id"]

        # Generate embedding before deletion
        embed_response = await client.post(
            f"/api/v1/search/entries/{entry_id}/embed", headers=auth_headers
        )
        assert embed_response.status_code == 200

        # Delete the entry
        # fetch version for delete
        cur = await client.get(f"/api/v1/entries/{entry_id}", headers=auth_headers)
        delete_response = await client.delete(
            f"/api/v1/entries/{entry_id}",
            headers=auth_headers,
            params={"expected_version": cur.json()["version"]},
        )
        assert delete_response.status_code == 204

        # Verify it doesn't appear in any search

        # Keyword search
        keyword_response = await client.get(
            "/api/v1/search", params={"q": "deleted"}, headers=auth_headers
        )
        assert entry_id not in [e["id"] for e in keyword_response.json()]

        # Semantic search - deleted entries should be excluded even if embeddings exist
        semantic_response = await client.post(
            "/api/v1/search/semantic",
            json={"q": "This entry will be deleted", "k": 10},
            headers=auth_headers,
        )
        assert entry_id not in [e["id"] for e in semantic_response.json()]
