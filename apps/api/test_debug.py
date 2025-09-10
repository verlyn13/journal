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
            
            try:
                headers = await auth_headers(client)
            except Exception as exc:
                logger.error("Failed to get auth headers: %s", exc)
                return 1

            # Test entry creation
            entry_data = {"title": "Test Entry", "content": "Test content"}
            logger.info("Creating test entry")

            try:
                create_resp = await client.post("/api/v1/entries", json=entry_data, headers=headers)
                logger.info("Create response status: %d", create_resp.status_code)

                if create_resp.status_code == 201:
                    try:
                        entry_id = create_resp.json()["id"]
                        logger.info("Successfully created entry: %s", entry_id)
                    except (KeyError, json.JSONDecodeError) as exc:
                        logger.error("Invalid create response format: %s", exc)
                        return 1

                    # Test entry update
                    update_data = {"title": "Updated Title", "content": "Updated content"}
                    logger.info("Updating entry: %s", entry_id)

                    update_resp = await client.put(
                        f"/api/v1/entries/{entry_id}", json=update_data, headers=headers
                    )
                    logger.info("Update response status: %d", update_resp.status_code)

                    if update_resp.status_code == 422:
                        try:
                            error_detail = update_resp.json()
                            logger.error("Validation error: %s", json.dumps(error_detail, indent=2))
                        except json.JSONDecodeError:
                            logger.error("Validation error with unparseable response")
                        return 1
                    elif update_resp.status_code == 200:
                        logger.info("Successfully updated entry")
                        return 0
                    else:
                        logger.error("Unexpected update status: %d", update_resp.status_code)
                        return 1
                else:
                    try:
                        error_detail = create_resp.json()
                        logger.error("Create failed: %s", json.dumps(error_detail, indent=2))
                    except json.JSONDecodeError:
                        logger.error("Create failed with unparseable response")
                    return 1
                    
            except Exception as exc:
                logger.error("HTTP request failed: %s", exc)
                return 1
                
    except Exception as exc:
        logger.error("Test execution failed: %s", exc)
        return 1


def main() -> int:
    """Main entry point."""
    try:
        return asyncio.run(test_entry_operations())
    except KeyboardInterrupt:
        logger.info("Test interrupted by user")
        return 1
    except Exception as exc:
        logger.error("Unexpected error: %s", exc)
        return 1


if __name__ == "__main__":
    sys.exit(main())
