"""Permissions and ownership enforcement scaffolds.

Skipped tests describing expected behavior once user management and
authorization policies are implemented.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient


pytestmark = pytest.mark.integration


@pytest.mark.skip(reason="Pending ownership enforcement")
@pytest.mark.asyncio()
async def test_owner_only_can_update_and_delete(client: AsyncClient) -> None:
  """Only the owner can update/delete their entries."""
  # Create entry as user A
  a_headers = {"Authorization": "Bearer token-user-a"}
  create = await client.post(
    "/api/v1/entries",
    json={"title": "Owned", "content": "X"},
    headers=a_headers,
  )
  assert create.status_code == 201
  entry_id = create.json()["id"]

  # User B cannot update/delete
  b_headers = {"Authorization": "Bearer token-user-b"}
  upd = await client.put(
    f"/api/v1/entries/{entry_id}",
    json={"title": "Hijack", "expected_version": 1},
    headers=b_headers,
  )
  assert upd.status_code in {401, 403}

  dele = await client.delete(f"/api/v1/entries/{entry_id}", headers=b_headers)
  assert dele.status_code in {401, 403}

