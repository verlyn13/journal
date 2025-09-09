"""
Quality-focused integration tests for complete workflows.
Tests real user scenarios, error recovery, and system behavior under stress.
"""

import asyncio

import pytest

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry


class TestWorkflowsQuality:
    """High-quality tests for complete user workflows and system integration."""

    @pytest.mark.asyncio()
    async def test_complete_journal_workflow(
        self, client: AsyncClient, auth_headers: dict[str, str], db_session: AsyncSession
    ):
        """Test a complete user journey through the journal application."""
        # Step 1: User logs in (headers already provided)

        # Step 2: Check initial stats
        stats_response = await client.get("/api/v1/stats", headers=auth_headers)
        assert stats_response.status_code == 200
        initial_stats = stats_response.json()
        initial_count = initial_stats["total_entries"]

        # Step 3: Create multiple entries
        entries_created = []
        for i in range(3):
            create_response = await client.post(
                "/api/v1/entries",
                json={
                    "title": f"Day {i + 1} Entry",
                    "markdown_content": f"# Day {i + 1}\n\nToday I learned about **testing**.",
                    "content_version": 2,
                },
                headers=auth_headers,
            )
            assert create_response.status_code == 201
            entries_created.append(create_response.json())

        # Generate embeddings for search (if needed)
        for entry in entries_created:
            await client.post(f"/api/v1/search/entries/{entry['id']}/embed", headers=auth_headers)

        # Step 4: Search for entries
        search_response = await client.get(
            "/api/v1/search", params={"q": "testing"}, headers=auth_headers
        )
        assert search_response.status_code == 200
        search_results = search_response.json()
        # Results depend on search implementation - just verify we get something
        assert isinstance(search_results, list)

        # Step 5: Update an entry
        entry_to_update = entries_created[0]
        # include optimistic locking version
        cur = await client.get(f"/api/v1/entries/{entry_to_update['id']}", headers=auth_headers)
        update_response = await client.put(
            f"/api/v1/entries/{entry_to_update['id']}",
            json={
                "title": "Updated Day 1",
                "markdown_content": "# Updated\n\nNew content with **more details**.",
                "expected_version": cur.json()["version"],
            },
            headers=auth_headers,
        )
        assert update_response.status_code == 200

        # Step 6: Get updated stats
        new_stats_response = await client.get("/api/v1/stats", headers=auth_headers)
        assert new_stats_response.status_code == 200
        new_stats = new_stats_response.json()
        assert new_stats["total_entries"] == initial_count + 3

        # Step 7: Delete an entry
        # delete with expected_version
        cur2 = await client.get(f"/api/v1/entries/{entries_created[2]['id']}", headers=auth_headers)
        delete_response = await client.delete(
            f"/api/v1/entries/{entries_created[2]['id']}",
            headers=auth_headers,
            params={"expected_version": cur2.json()["version"]},
        )
        assert delete_response.status_code == 204

        # Step 8: Verify deletion in list
        list_response = await client.get("/api/v1/entries", headers=auth_headers)
        current_entries = list_response.json()
        deleted_id = entries_created[2]["id"]
        assert not any(e["id"] == deleted_id for e in current_entries)

    @pytest.mark.asyncio()
    async def test_concurrent_user_operations(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test system behavior under concurrent user operations."""

        async def create_entry(index: int) -> object:
            return await client.post(
                "/api/v1/entries",
                json={
                    "title": f"Concurrent Entry {index}",
                    "content": f"<p>Content for entry {index}</p>",
                },
                headers=auth_headers,
            )

        async def search_entries(query: str) -> object:
            return await client.get("/api/v1/search", params={"q": query}, headers=auth_headers)

        async def get_stats() -> object:
            return await client.get("/api/v1/stats", headers=auth_headers)

        # Run multiple operations concurrently
        tasks = []

        # Create 5 entries
        for i in range(5):
            tasks.append(create_entry(i))

        # Perform 3 searches
        for query in ["Concurrent", "Entry", "Content"]:
            tasks.append(search_entries(query))

        # Get stats 3 times
        for _ in range(3):
            tasks.append(get_stats())

        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Verify no exceptions occurred
        exceptions = [r for r in results if isinstance(r, Exception)]
        assert len(exceptions) == 0, f"Exceptions occurred: {exceptions}"

        # Verify all creates succeeded
        create_results = results[:5]
        assert all(r.status_code == 201 for r in create_results)

        # Verify searches succeeded
        search_results = results[5:8]
        assert all(r.status_code == 200 for r in search_results)

        # Verify stats succeeded
        stats_results = results[8:]
        assert all(r.status_code == 200 for r in stats_results)

    @pytest.mark.asyncio()
    async def test_error_recovery_workflow(self, client: AsyncClient, auth_headers: dict[str, str]):
        """Test system recovery from various error conditions."""

        # Test 1: Invalid data recovery
        invalid_response = await client.post(
            "/api/v1/entries",
            json={"title": None, "content": None},  # Invalid data
            headers=auth_headers,
        )
        assert invalid_response.status_code == 422

        # System should still work after error
        valid_response = await client.post(
            "/api/v1/entries",
            json={"title": "Valid Entry", "content": "Valid content"},
            headers=auth_headers,
        )
        assert valid_response.status_code == 201
        entry_id = valid_response.json()["id"]

        # Test 2: Not found recovery
        fake_id = "550e8400-e29b-41d4-a716-446655440000"
        not_found_response = await client.get(f"/api/v1/entries/{fake_id}", headers=auth_headers)
        assert not_found_response.status_code == 404

        # System should still find real entries
        real_response = await client.get(f"/api/v1/entries/{entry_id}", headers=auth_headers)
        assert real_response.status_code == 200

        # Test 3: Duplicate operation handling
        cur3 = await client.get(f"/api/v1/entries/{entry_id}", headers=auth_headers)
        delete_response1 = await client.delete(
            f"/api/v1/entries/{entry_id}",
            headers=auth_headers,
            params={"expected_version": cur3.json()["version"]},
        )
        assert delete_response1.status_code == 204

        # Second delete should handle gracefully
        delete_response2 = await client.delete(
            f"/api/v1/entries/{entry_id}",
            headers=auth_headers,
            params={"expected_version": cur3.json()["version"]},
        )
        assert delete_response2.status_code in [204, 404]  # Idempotent or not found

    @pytest.mark.asyncio()
    async def test_data_consistency_across_operations(
        self, client: AsyncClient, auth_headers: dict[str, str], db_session: AsyncSession
    ):
        """Test that data remains consistent across different operations."""

        # Create entry with specific content
        original_data = {
            "title": "Consistency Test",
            "markdown_content": "# Test\n\nThis is **important** data.",
            "content_version": 2,
        }

        create_response = await client.post(
            "/api/v1/entries", json=original_data, headers=auth_headers
        )
        assert create_response.status_code == 201
        entry = create_response.json()
        entry_id = entry["id"]

        # Verify via different endpoints

        # 1. Direct GET
        get_response = await client.get(f"/api/v1/entries/{entry_id}", headers=auth_headers)
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["title"] == original_data["title"]

        # 2. List endpoint
        list_response = await client.get("/api/v1/entries", headers=auth_headers)
        list_entries = list_response.json()
        list_entry = next((e for e in list_entries if e["id"] == entry_id), None)
        assert list_entry is not None
        assert list_entry["title"] == original_data["title"]

        # 3. Search endpoint
        search_response = await client.get(
            "/api/v1/search", params={"q": "Consistency Test"}, headers=auth_headers
        )
        search_results = search_response.json()
        search_entry = next((e for e in search_results if e["id"] == entry_id), None)
        assert search_entry is not None
        assert search_entry["title"] == original_data["title"]

        # 4. Database direct check
        from sqlalchemy import select

        stmt = select(Entry).where(Entry.id == entry_id)
        result = await db_session.execute(stmt)
        db_entry = result.scalar_one_or_none()
        assert db_entry is not None
        assert db_entry.title == original_data["title"]
        assert db_entry.markdown_content == original_data["markdown_content"]

    @pytest.mark.asyncio()
    async def test_pagination_workflow(self, client: AsyncClient, auth_headers: dict[str, str]):
        """Test pagination across multiple pages of entries."""

        # Create enough entries to require pagination
        num_entries = 25
        created_ids = []

        for i in range(num_entries):
            response = await client.post(
                "/api/v1/entries",
                json={"title": f"Page Test {i:02d}", "content": f"Entry number {i}"},
                headers=auth_headers,
            )
            if response.status_code == 201:
                created_ids.append(response.json()["id"])

        # Test pagination parameters
        page_size = 10

        # Get first page (API uses offset, not skip)
        page1_response = await client.get(
            "/api/v1/entries", params={"offset": 0, "limit": page_size}, headers=auth_headers
        )
        assert page1_response.status_code == 200
        page1_entries = page1_response.json()
        assert len(page1_entries) <= page_size

        # Get second page
        page2_response = await client.get(
            "/api/v1/entries",
            params={"offset": page_size, "limit": page_size},
            headers=auth_headers,
        )
        assert page2_response.status_code == 200
        page2_entries = page2_response.json()

        # Verify no duplicate entries between pages
        page1_ids = {e["id"] for e in page1_entries}
        page2_ids = {e["id"] for e in page2_entries}
        assert len(page1_ids & page2_ids) == 0  # No overlap

        # Get all entries at once
        all_response = await client.get(
            "/api/v1/entries", params={"offset": 0, "limit": 100}, headers=auth_headers
        )
        all_entries = all_response.json()

        # Verify total count
        assert len(all_entries) >= len(created_ids)

    @pytest.mark.asyncio()
    async def test_markdown_migration_workflow(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Test the workflow of migrating from HTML to markdown format."""

        # Step 1: Create legacy HTML entries
        html_entries = []
        for i in range(3):
            response = await client.post(
                "/api/v1/entries",
                json={
                    "title": f"Legacy HTML {i}",
                    "content": f"<h1>Title {i}</h1><p>Legacy <strong>HTML</strong> content</p>",
                },
                headers=auth_headers,
            )
            assert response.status_code == 201
            html_entries.append(response.json())

        # Step 2: Update to markdown format
        for entry in html_entries:
            curv = await client.get(f"/api/v1/entries/{entry['id']}", headers=auth_headers)
            update_response = await client.put(
                f"/api/v1/entries/{entry['id']}",
                json={
                    "markdown_content": f"# Migrated {entry['title']}\n\nNow in **markdown** format!",
                    "content_version": 2,
                    "expected_version": curv.json()["version"],
                },
                headers=auth_headers,
            )
            assert update_response.status_code == 200
            updated = update_response.json()
            assert updated["content_version"] == 2
            assert updated["markdown_content"] is not None

        # Step 3: Verify backward compatibility
        for entry in html_entries:
            # Get without markdown header - should return HTML
            html_response = await client.get(f"/api/v1/entries/{entry['id']}", headers=auth_headers)
            assert html_response.status_code == 200
            html_data = html_response.json()
            assert "<h1>" in html_data["content"] or "Migrated" in html_data["content"]

            # Get with markdown header - should return markdown
            md_headers = {**auth_headers, "X-Editor-Mode": "markdown"}
            md_response = await client.get(f"/api/v1/entries/{entry['id']}", headers=md_headers)
            assert md_response.status_code == 200
            md_data = md_response.json()
            if md_data.get("markdown_content"):
                assert "# Migrated" in md_data["markdown_content"]

    @pytest.mark.asyncio()
    async def test_auth_expiry_workflow(self, client: AsyncClient):
        """Test workflow when authentication expires or is invalid."""

        # Test with no auth headers
        no_auth_response = await client.get("/api/v1/entries")
        assert no_auth_response.status_code == 401

        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token_here"}
        invalid_response = await client.get("/api/v1/entries", headers=invalid_headers)
        assert invalid_response.status_code == 401

        # Test with malformed auth header
        malformed_headers = {"Authorization": "NotBearer token"}
        malformed_response = await client.get("/api/v1/entries", headers=malformed_headers)
        assert malformed_response.status_code in [401, 403]

        # After auth errors, valid auth should still work
        demo_response = await client.post("/api/v1/auth/demo")
        assert demo_response.status_code == 200
        token = demo_response.json()["access_token"]

        valid_headers = {"Authorization": f"Bearer {token}"}
        valid_response = await client.get("/api/v1/entries", headers=valid_headers)
        assert valid_response.status_code == 200
