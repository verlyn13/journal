"""Universal Auth client for Infisical authentication.

This module handles Universal Auth login to obtain short-lived INFISICAL_TOKEN
for secure secret access without storing long-lived credentials.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import subprocess
import time

from datetime import UTC, datetime, timedelta
from typing import Any

from app.telemetry.metrics_runtime import inc as metrics_inc


logger = logging.getLogger(__name__)


class UniversalAuthError(Exception):
    """Universal Auth operation failed."""


class UniversalAuthClient:
    """Universal Auth client for Infisical token management.

    Features:
    - Universal Auth login with client credentials
    - Automatic token refresh before expiry
    - Secure credential handling
    - Telemetry integration
    """

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        server_url: str | None = None,
        token_ttl_seconds: int = 3600,  # 1 hour default
        refresh_threshold: float = 0.8,  # Refresh at 80% of TTL
    ) -> None:
        """Initialize Universal Auth client.

        Args:
            client_id: Universal Auth client ID
            client_secret: Universal Auth client secret
            server_url: Infisical server URL (optional, uses INFISICAL_API_URL env)
            token_ttl_seconds: Expected token TTL in seconds
            refresh_threshold: Refresh token when this fraction of TTL remains
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.server_url = server_url or os.getenv(
            "INFISICAL_API_URL", "https://app.infisical.com/api"
        )
        self.token_ttl_seconds = token_ttl_seconds
        self.refresh_threshold = refresh_threshold

        # Token state
        self._current_token: str | None = None
        self._token_expires_at: datetime | None = None
        self._login_lock = asyncio.Lock()

    @classmethod
    def from_env(cls, identity_prefix: str = "TOKEN_SERVICE") -> UniversalAuthClient:
        """Create client from environment variables.

        Expected environment variables:
        - UA_CLIENT_ID_{identity_prefix}: Universal Auth client ID
        - UA_CLIENT_SECRET_{identity_prefix}: Universal Auth client secret
        - INFISICAL_API_URL: Infisical server URL (optional)

        Args:
            identity_prefix: Prefix for environment variable names

        Returns:
            Configured UniversalAuthClient

        Raises:
            UniversalAuthError: If required environment variables are missing
        """
        client_id = os.getenv(f"UA_CLIENT_ID_{identity_prefix}")
        if not client_id:
            raise UniversalAuthError(
                f"UA_CLIENT_ID_{identity_prefix} environment variable required"
            )

        client_secret = os.getenv(f"UA_CLIENT_SECRET_{identity_prefix}")
        if not client_secret:
            raise UniversalAuthError(
                f"UA_CLIENT_SECRET_{identity_prefix} environment variable required"
            )

        return cls(client_id=client_id, client_secret=client_secret)

    async def get_token(self) -> str:
        """Get valid INFISICAL_TOKEN, refreshing if necessary.

        Returns:
            Valid INFISICAL_TOKEN for API calls

        Raises:
            UniversalAuthError: If login fails
        """
        async with self._login_lock:
            if self._needs_refresh():
                await self._login()

            if not self._current_token:
                raise UniversalAuthError("No valid token available after login attempt")

            return self._current_token

    async def refresh_token(self) -> str:
        """Force token refresh.

        Returns:
            New INFISICAL_TOKEN

        Raises:
            UniversalAuthError: If login fails
        """
        async with self._login_lock:
            await self._login()

            if not self._current_token:
                raise UniversalAuthError("Token refresh failed")

            return self._current_token

    def _needs_refresh(self) -> bool:
        """Check if token needs refresh."""
        if not self._current_token or not self._token_expires_at:
            return True

        now = datetime.now(UTC)
        refresh_time = self._token_expires_at - timedelta(
            seconds=self.token_ttl_seconds * (1 - self.refresh_threshold)
        )

        return now >= refresh_time

    async def _login(self) -> None:
        """Perform Universal Auth login."""
        start_time = time.time()

        try:
            logger.info("Performing Universal Auth login...")

            # Prepare environment
            env = {
                **os.environ,
                "INFISICAL_API_URL": self.server_url,
            }

            # Execute login command
            cmd = [
                "infisical",
                "login",
                "--method",
                "universal-auth",
                "--client-id",
                self.client_id,
                "--client-secret",
                self.client_secret,
                "--silent",
                "--plain",
            ]

            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=env,
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=30.0,  # 30 second timeout
            )

            if process.returncode != 0:
                error_msg = stderr.decode().strip()
                logger.error("Universal Auth login failed: %s", error_msg)
                raise UniversalAuthError(f"Login failed: {error_msg}")

            # Extract token from output
            token = stdout.decode().strip()
            if not token:
                raise UniversalAuthError("Empty token received from login")

            # Update token state
            self._current_token = token
            self._token_expires_at = datetime.now(UTC) + timedelta(seconds=self.token_ttl_seconds)

            # Set environment variable for CLI commands
            os.environ["INFISICAL_TOKEN"] = token

            duration = time.time() - start_time
            logger.info("Universal Auth login successful (%.2fs)", duration)

            metrics_inc(
                "infisical_auth_login_total", {"method": "universal_auth", "status": "success"}
            )
            metrics_inc(
                "infisical_auth_login_duration_seconds", {"method": "universal_auth"}, duration
            )

        except TimeoutError as e:
            logger.error("Universal Auth login timeout")
            metrics_inc(
                "infisical_auth_login_total", {"method": "universal_auth", "status": "timeout"}
            )
            raise UniversalAuthError("Login timeout") from e
        except Exception as e:
            logger.exception("Universal Auth login failed")
            metrics_inc(
                "infisical_auth_login_total", {"method": "universal_auth", "status": "error"}
            )
            raise UniversalAuthError(f"Login failed: {e}") from e

    async def health_check(self) -> dict[str, Any]:
        """Check authentication health.

        Returns:
            Health status information
        """
        try:
            token = await self.get_token()

            status = {
                "status": "healthy",
                "auth_method": "universal_auth",
                "token_available": bool(token),
                "token_expires_at": self._token_expires_at.isoformat()
                if self._token_expires_at
                else None,
                "needs_refresh": self._needs_refresh(),
            }

            metrics_inc("infisical_auth_health_check_total", {"status": "success"})
            return status

        except Exception as e:
            status = {
                "status": "unhealthy",
                "auth_method": "universal_auth",
                "error": str(e),
                "token_available": False,
            }

            metrics_inc("infisical_auth_health_check_total", {"status": "failure"})
            return status


# Global instance for application use
_universal_auth_client: UniversalAuthClient | None = None


async def get_universal_auth_client() -> UniversalAuthClient:
    """Get or create global Universal Auth client.

    Returns:
        Configured UniversalAuthClient instance

    Raises:
        UniversalAuthError: If client cannot be created
    """
    global _universal_auth_client

    if _universal_auth_client is None:
        try:
            _universal_auth_client = UniversalAuthClient.from_env()
            logger.info("Universal Auth client initialized")
        except Exception as e:
            logger.error("Failed to initialize Universal Auth client: %s", e)
            raise UniversalAuthError(f"Client initialization failed: {e}") from e

    return _universal_auth_client


async def get_infisical_token() -> str:
    """Get valid INFISICAL_TOKEN using Universal Auth.

    This is the main entry point for getting authenticated tokens.

    Returns:
        Valid INFISICAL_TOKEN

    Raises:
        UniversalAuthError: If authentication fails
    """
    client = await get_universal_auth_client()
    return await client.get_token()
