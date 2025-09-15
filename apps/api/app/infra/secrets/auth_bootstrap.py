"""Authentication bootstrap service for Universal Auth login on application startup.

This service handles the Universal Auth login process during application
initialization to establish secure authentication without storing long-lived tokens.
"""

from __future__ import annotations

import asyncio
import logging
import os

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from app.infra.secrets.universal_auth_client import UniversalAuthError, get_universal_auth_client


logger = logging.getLogger(__name__)


class AuthBootstrapService:
    """Service for bootstrapping authentication on application startup."""

    def __init__(self) -> None:
        self._initialized = False
        self._initialization_lock = asyncio.Lock()

    async def initialize(self) -> bool:
        """Initialize authentication on application startup.

        This method should be called during application startup to establish
        authentication via Universal Auth before any secret operations.

        Returns:
            True if authentication was successful, False otherwise
        """
        async with self._initialization_lock:
            if self._initialized:
                logger.info("Authentication already initialized")
                return True

            try:
                # Check if Universal Auth credentials are available
                client_id = os.getenv("UA_CLIENT_ID_TOKEN_SERVICE")
                client_secret = os.getenv("UA_CLIENT_SECRET_TOKEN_SERVICE")

                if client_id and client_secret:
                    logger.info("Initializing Universal Auth authentication...")

                    # Get Universal Auth client and perform initial login
                    auth_client = await get_universal_auth_client()
                    token = await auth_client.get_token()

                    logger.info("Universal Auth login successful, token obtained")

                    # Set environment variable for CLI commands
                    os.environ["INFISICAL_TOKEN"] = token

                    self._initialized = True
                    return True

                # Fallback to static token if available
                static_token = os.getenv("INFISICAL_TOKEN")
                if static_token:
                    logger.warning(
                        "Using static INFISICAL_TOKEN (deprecated). "
                        "Consider migrating to Universal Auth for better security."
                    )
                    self._initialized = True
                    return True
                logger.error(
                    "No authentication credentials available. "
                    "Set UA_CLIENT_ID_TOKEN_SERVICE/UA_CLIENT_SECRET_TOKEN_SERVICE "
                    "or INFISICAL_TOKEN environment variables."
                )
                return False

            except UniversalAuthError as e:
                logger.error("Universal Auth initialization failed: %s", e)
                return False
            except Exception as e:
                logger.exception("Authentication initialization failed: %s", e)
                return False

    async def refresh_auth(self) -> bool:
        """Refresh authentication token.

        Returns:
            True if refresh was successful, False otherwise
        """
        try:
            # Check if we have Universal Auth credentials
            client_id = os.getenv("UA_CLIENT_ID_TOKEN_SERVICE")
            if client_id:
                auth_client = await get_universal_auth_client()
                token = await auth_client.refresh_token()

                # Update environment variable
                os.environ["INFISICAL_TOKEN"] = token

                logger.info("Authentication token refreshed successfully")
                return True
            logger.warning("Cannot refresh static token")
            return False

        except Exception as e:
            logger.error("Authentication refresh failed: %s", e)
            return False

    async def health_check(self) -> dict[str, any]:
        """Check authentication health status.

        Returns:
            Health status information
        """
        if not self._initialized:
            return {
                "status": "unhealthy",
                "error": "Authentication not initialized",
                "auth_method": "unknown",
            }

        try:
            # Check if we have Universal Auth
            client_id = os.getenv("UA_CLIENT_ID_TOKEN_SERVICE")
            if client_id:
                auth_client = await get_universal_auth_client()
                return await auth_client.health_check()
            # Static token fallback
            token = os.getenv("INFISICAL_TOKEN")
            return {
                "status": "healthy" if token else "unhealthy",
                "auth_method": "static_token",
                "token_available": bool(token),
                "warning": "Using deprecated static token",
            }

        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "auth_method": "universal_auth",
            }

    @property
    def is_initialized(self) -> bool:
        """Check if authentication is initialized."""
        return self._initialized


# Global service instance
_auth_bootstrap_service: AuthBootstrapService | None = None


def get_auth_bootstrap_service() -> AuthBootstrapService:
    """Get or create global auth bootstrap service."""
    global _auth_bootstrap_service

    if _auth_bootstrap_service is None:
        _auth_bootstrap_service = AuthBootstrapService()

    return _auth_bootstrap_service


@asynccontextmanager
async def auth_lifespan() -> AsyncGenerator[None, None]:
    """Application lifespan context manager for authentication.

    This should be used with FastAPI lifespan events to ensure
    authentication is properly initialized and cleaned up.
    """
    auth_service = get_auth_bootstrap_service()

    # Initialize authentication
    logger.info("Starting authentication bootstrap...")
    success = await auth_service.initialize()

    if not success:
        logger.error("Authentication initialization failed - application may not work correctly")
    else:
        logger.info("Authentication bootstrap completed successfully")

    try:
        yield
    finally:
        logger.info("Authentication cleanup completed")


async def ensure_authenticated() -> bool:
    """Ensure authentication is initialized.

    This can be called from any part of the application to ensure
    authentication is ready before performing secret operations.

    Returns:
        True if authentication is ready, False otherwise
    """
    auth_service = get_auth_bootstrap_service()

    if not auth_service.is_initialized:
        logger.info("Authentication not initialized, initializing now...")
        return await auth_service.initialize()

    return True
