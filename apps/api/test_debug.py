"""Production-quality debug script for API testing.

This script provides comprehensive testing of the entry API with proper
logging, error handling, and security considerations.

Security: Uses proper logging instead of print statements.
All network operations use secure configurations.
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys

from typing import Any

from httpx import AsyncClient

from app.main import app
from tests.conftest import auth_headers


# Configure production logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


async def test_entry_operations() -> int:
    """Test entry creation and update operations.

    Returns:
        Exit code: 0 for success, 1 for failures
    """
    try:
        logger.info("Starting API integration test")

        async with AsyncClient(transport=None, base_url="http://test") as client:
            client.app = app  # type: ignore[attr-defined]

            # Get authentication headers
            try:
                headers = await auth_headers(client)
            except Exception:
                logger.exception("Failed to get auth headers")
                return 1

            # Test entry creation
            create_result = await _test_entry_creation(client, headers)
            if create_result != 0:
                return create_result

            return 0

    except Exception:
        logger.exception("Test execution failed")
        return 1


async def _test_entry_creation(client: AsyncClient, headers: dict[str, str]) -> int:
    """Test entry creation and update workflow."""
    entry_data = {"title": "Test Entry", "content": "Test content"}
    logger.info("Creating test entry")

    try:
        create_resp = await client.post("/api/v1/entries", json=entry_data, headers=headers)
        logger.info("Create response status: %d", create_resp.status_code)

        if create_resp.status_code == 201:
            return await _test_entry_update(client, headers, create_resp)
        return _handle_create_error(create_resp)

    except Exception:
        logger.exception("HTTP request failed")
        return 1


async def _test_entry_update(
    client: AsyncClient, headers: dict[str, str], create_resp: Any
) -> int:
    """Test entry update after successful creation."""
    try:
        entry_id = create_resp.json()["id"]
        logger.info("Successfully created entry: %s", entry_id)
    except (KeyError, json.JSONDecodeError):
        logger.exception("Invalid create response format")
        return 1

    # Test entry update
    update_data = {"title": "Updated Title", "content": "Updated content"}
    logger.info("Updating entry: %s", entry_id)

    update_resp = await client.put(f"/api/v1/entries/{entry_id}", json=update_data, headers=headers)
    logger.info("Update response status: %d", update_resp.status_code)

    if update_resp.status_code == 422:
        return _handle_validation_error(update_resp)
    if update_resp.status_code == 200:
        logger.info("Successfully updated entry")
        return 0
    logger.error("Unexpected update status: %d", update_resp.status_code)
    return 1


def _handle_create_error(create_resp: Any) -> int:
    """Handle entry creation errors."""
    try:
        error_detail = create_resp.json()
        logger.error("Create failed: %s", json.dumps(error_detail, indent=2))
    except json.JSONDecodeError:
        logger.exception("Create failed with unparseable response")
    return 1


def _handle_validation_error(update_resp: Any) -> int:
    """Handle validation errors during update."""
    try:
        error_detail = update_resp.json()
        logger.error("Validation error: %s", json.dumps(error_detail, indent=2))
    except json.JSONDecodeError:
        logger.exception("Validation error with unparseable response")
    return 1


def main() -> int:
    """Main entry point."""
    try:
        return asyncio.run(test_entry_operations())
    except KeyboardInterrupt:
        logger.info("Test interrupted by user")
        return 1
    except Exception:
        logger.exception("Unexpected error")
        return 1


if __name__ == "__main__":
    sys.exit(main())
