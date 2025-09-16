"""Enhanced Infisical client with security hardening and fallback mechanisms."""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime
import json
import logging
from typing import Any
from urllib.parse import urljoin

import aiohttp
from cryptography.fernet import Fernet
from redis.asyncio import Redis

from app.domain.auth.key_manager import SecretsClient
from app.settings import settings


logger = logging.getLogger(__name__)


class InfisicalError(Exception):
    """Base exception for Infisical client errors."""


class InfisicalAuthError(InfisicalError):
    """Authentication failed with Infisical."""


class InfisicalRateLimitError(InfisicalError):
    """Rate limit exceeded."""


class InfisicalUnavailableError(InfisicalError):
    """Infisical service is unavailable."""


class SecretEncryption:
    """Handles encryption/decryption of cached secrets."""

    def __init__(self, encryption_key: bytes | None = None) -> None:
        """Initialize with encryption key.

        Args:
            encryption_key: 32-byte key for Fernet encryption, or None to generate
        """
        if encryption_key is None:
            encryption_key = Fernet.generate_key()
        self.fernet = Fernet(encryption_key)

    def encrypt(self, plaintext: str) -> str:
        """Encrypt plaintext string.

        Args:
            plaintext: String to encrypt

        Returns:
            Base64-encoded encrypted string
        """
        return self.fernet.encrypt(plaintext.encode()).decode()

    def decrypt(self, ciphertext: str) -> str:
        """Decrypt ciphertext string.

        Args:
            ciphertext: Base64-encoded encrypted string

        Returns:
            Decrypted plaintext string
        """
        return self.fernet.decrypt(ciphertext.encode()).decode()


class CircuitBreaker:
    """Circuit breaker for Infisical API calls."""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: type[Exception] = InfisicalError,
    ) -> None:
        """Initialize circuit breaker.

        Args:
            failure_threshold: Number of failures before opening circuit
            recovery_timeout: Seconds to wait before attempting recovery
            expected_exception: Exception type that triggers circuit break
        """
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception

        self.failure_count = 0
        self.last_failure_time: datetime | None = None
        self.state = "closed"  # closed, open, half-open

    def can_execute(self) -> bool:
        """Check if execution is allowed."""
        if self.state == "closed":
            return True

        if self.state == "open":
            if (
                self.last_failure_time
                and (datetime.now(UTC) - self.last_failure_time).total_seconds()
                > self.recovery_timeout
            ):
                self.state = "half-open"
                return True
            return False

        # half-open state
        return True

    def record_success(self) -> None:
        """Record successful execution."""
        self.failure_count = 0
        self.state = "closed"
        self.last_failure_time = None

    def record_failure(self) -> None:
        """Record failed execution."""
        self.failure_count += 1
        self.last_failure_time = datetime.now(UTC)

        if self.failure_count >= self.failure_threshold:
            self.state = "open"


class EnhancedInfisicalClient(SecretsClient):
    """Enhanced Infisical client with security hardening, caching, and fallbacks."""

    def __init__(
        self,
        base_url: str,
        token: str,
        redis: Redis,
        encryption_key: bytes | None = None,
        timeout: int = 30,
        max_retries: int = 3,
        cache_ttl: int = 300,  # 5 minutes
    ) -> None:
        """Initialize enhanced Infisical client.

        Args:
            base_url: Infisical API base URL
            token: API token for authentication
            redis: Redis client for caching
            encryption_key: Key for encrypting cached secrets
            timeout: Request timeout in seconds
            max_retries: Maximum retry attempts
            cache_ttl: Cache TTL in seconds
        """
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.redis = redis
        self.timeout = timeout
        self.max_retries = max_retries
        self.cache_ttl = cache_ttl

        # Security components
        self.encryption = SecretEncryption(encryption_key)
        self.circuit_breaker = CircuitBreaker()

        # Cache configuration
        self._cache_prefix = "infisical:secrets:"
        self._cache_metadata_prefix = "infisical:meta:"

        # HTTP session will be created lazily
        self._session: aiohttp.ClientSession | None = None

    async def __aenter__(self) -> EnhancedInfisicalClient:
        """Async context manager entry."""
        await self._ensure_session()
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Async context manager exit."""
        await self.close()

    async def _ensure_session(self) -> None:
        """Ensure HTTP session is created."""
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=self.timeout)
            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
                "User-Agent": f"journal-api/{settings.version or '1.0.0'}",
            }
            self._session = aiohttp.ClientSession(
                timeout=timeout,
                headers=headers,
                raise_for_status=False,  # Handle status codes manually
            )

    async def close(self) -> None:
        """Close HTTP session."""
        if self._session and not self._session.closed:
            await self._session.close()

    async def fetch_secret(self, path: str) -> str:
        """Fetch a secret from Infisical with caching and fallbacks.

        Args:
            path: Secret path in Infisical

        Returns:
            Secret value

        Raises:
            InfisicalError: If secret cannot be retrieved
        """
        # Check cache first
        cached_secret = await self._get_cached_secret(path)
        if cached_secret is not None:
            logger.debug("Secret retrieved from cache", extra={"path": path})
            return cached_secret

        # Check circuit breaker
        if not self.circuit_breaker.can_execute():
            # Try fallback sources
            fallback_secret = await self._try_fallback_sources(path)
            if fallback_secret is not None:
                logger.warning("Using fallback secret due to circuit breaker", extra={"path": path})
                return fallback_secret

            raise InfisicalUnavailableError(
                f"Circuit breaker open, no fallback available for {path}"
            )

        # Fetch from Infisical with retries
        for attempt in range(self.max_retries + 1):
            try:
                secret_value = await self._fetch_secret_from_api(path)

                # Cache the secret
                await self._cache_secret(path, secret_value)

                # Record success for circuit breaker
                self.circuit_breaker.record_success()

                logger.info(
                    "Secret fetched from Infisical", extra={"path": path, "attempt": attempt + 1}
                )
                return secret_value

            except (InfisicalAuthError, InfisicalRateLimitError):
                # Don't retry auth errors or rate limits
                self.circuit_breaker.record_failure()
                raise
            except InfisicalError as e:
                self.circuit_breaker.record_failure()
                if attempt == self.max_retries:
                    # Final attempt failed, try fallbacks
                    fallback_secret = await self._try_fallback_sources(path)
                    if fallback_secret is not None:
                        logger.warning(
                            "Using fallback after Infisical failure",
                            extra={"path": path, "error": str(e)},
                        )
                        return fallback_secret
                    raise

                # Exponential backoff
                backoff_delay = 2**attempt
                logger.warning(
                    "Retrying secret fetch after failure",
                    extra={
                        "path": path,
                        "attempt": attempt + 1,
                        "delay": backoff_delay,
                        "error": str(e),
                    },
                )
                await asyncio.sleep(backoff_delay)

        raise InfisicalError(f"Failed to fetch secret after {self.max_retries} retries")

    async def store_secret(self, path: str, value: str) -> None:
        """Store a secret in Infisical.

        Args:
            path: Secret path in Infisical
            value: Secret value to store

        Raises:
            InfisicalError: If secret cannot be stored
        """
        # Check circuit breaker
        if not self.circuit_breaker.can_execute():
            raise InfisicalUnavailableError(f"Circuit breaker open, cannot store secret at {path}")

        for attempt in range(self.max_retries + 1):
            try:
                await self._store_secret_to_api(path, value)

                # Update cache
                await self._cache_secret(path, value)

                # Record success
                self.circuit_breaker.record_success()

                logger.info(
                    "Secret stored to Infisical", extra={"path": path, "attempt": attempt + 1}
                )
                return

            except (InfisicalAuthError, InfisicalRateLimitError):
                self.circuit_breaker.record_failure()
                raise
            except InfisicalError as e:
                self.circuit_breaker.record_failure()
                if attempt == self.max_retries:
                    raise

                backoff_delay = 2**attempt
                logger.warning(
                    "Retrying secret store after failure",
                    extra={
                        "path": path,
                        "attempt": attempt + 1,
                        "delay": backoff_delay,
                        "error": str(e),
                    },
                )
                await asyncio.sleep(backoff_delay)

    async def _fetch_secret_from_api(self, path: str) -> str:
        """Fetch secret directly from Infisical API.

        Args:
            path: Secret path

        Returns:
            Secret value

        Raises:
            InfisicalError: If API call fails
        """
        await self._ensure_session()

        # Build API URL - this is a simplified example
        # Real implementation would need to handle Infisical's specific API format
        url = urljoin(self.base_url, f"/api/v1/secrets/{path}")

        try:
            async with self._session.get(url) as response:
                if response.status == 401:
                    raise InfisicalAuthError("Authentication failed")
                if response.status == 429:
                    raise InfisicalRateLimitError("Rate limit exceeded")
                if response.status >= 500:
                    raise InfisicalUnavailableError(f"Server error: {response.status}")
                if response.status != 200:
                    raise InfisicalError(f"API error: {response.status}")

                data = await response.json()

                # Extract secret value from response
                # This is simplified - real Infisical API has different structure
                secret_value = data.get("secretValue")
                if secret_value is None:
                    raise InfisicalError("Secret value not found in response")

                return secret_value

        except aiohttp.ClientError as e:
            raise InfisicalError(f"Network error: {e}") from e
        except json.JSONDecodeError as e:
            raise InfisicalError(f"Invalid JSON response: {e}") from e

    async def _store_secret_to_api(self, path: str, value: str) -> None:
        """Store secret to Infisical API.

        Args:
            path: Secret path
            value: Secret value

        Raises:
            InfisicalError: If API call fails
        """
        await self._ensure_session()

        url = urljoin(self.base_url, f"/api/v1/secrets/{path}")
        payload = {"secretValue": value}

        try:
            async with self._session.put(url, json=payload) as response:
                if response.status == 401:
                    raise InfisicalAuthError("Authentication failed")
                if response.status == 429:
                    raise InfisicalRateLimitError("Rate limit exceeded")
                if response.status >= 500:
                    raise InfisicalUnavailableError(f"Server error: {response.status}")
                if response.status not in {200, 201}:
                    raise InfisicalError(f"API error: {response.status}")

        except aiohttp.ClientError as e:
            raise InfisicalError(f"Network error: {e}") from e

    async def _get_cached_secret(self, path: str) -> str | None:
        """Get secret from cache.

        Args:
            path: Secret path

        Returns:
            Cached secret value or None if not found
        """
        cache_key = f"{self._cache_prefix}{path}"

        try:
            encrypted_value = await self.redis.get(cache_key)
            if encrypted_value:
                # Decrypt and return
                return self.encryption.decrypt(encrypted_value.decode())
        except Exception as e:  # noqa: BLE001 - cache failures shouldn't break flow
            logger.warning(
                "Failed to retrieve cached secret", extra={"path": path, "error": str(e)}
            )

        return None

    async def _cache_secret(self, path: str, value: str) -> None:
        """Cache secret with encryption.

        Args:
            path: Secret path
            value: Secret value to cache
        """
        cache_key = f"{self._cache_prefix}{path}"
        metadata_key = f"{self._cache_metadata_prefix}{path}"

        try:
            # Encrypt and cache secret
            encrypted_value = self.encryption.encrypt(value)
            await self.redis.setex(cache_key, self.cache_ttl, encrypted_value)

            # Cache metadata
            metadata = {
                "cached_at": datetime.now(UTC).isoformat(),
                "ttl": self.cache_ttl,
                "path": path,
            }
            await self.redis.setex(metadata_key, self.cache_ttl, json.dumps(metadata))

        except Exception as e:  # noqa: BLE001 - cache failures shouldn't break flow
            logger.warning("Failed to cache secret", extra={"path": path, "error": str(e)})

    async def _try_fallback_sources(self, path: str) -> str | None:
        """Try to get secret from fallback sources.

        Args:
            path: Secret path

        Returns:
            Secret value from fallback or None if not available
        """
        # Try longer-term cache first (if implemented)
        fallback_cache_key = f"infisical:fallback:{path}"
        try:
            fallback_value = await self.redis.get(fallback_cache_key)
            if fallback_value:
                logger.info("Using fallback cache for secret", extra={"path": path})
                return self.encryption.decrypt(fallback_value.decode())
        except Exception as e:  # noqa: BLE001 - fallback shouldn't break
            logger.debug("Fallback cache failed", extra={"error": str(e)})

        # Could implement other fallback sources here:
        # - Local file system
        # - Environment variables
        # - Kubernetes secrets
        # - HashiCorp Vault

        return None

    async def health_check(self) -> dict[str, Any]:
        """Perform health check on Infisical connection.

        Returns:
            Health status information
        """
        health_status = {
            "healthy": False,
            "circuit_breaker_state": self.circuit_breaker.state,
            "failure_count": self.circuit_breaker.failure_count,
            "last_check": datetime.now(UTC).isoformat(),
        }

        if not self.circuit_breaker.can_execute():
            health_status["reason"] = "Circuit breaker open"
            return health_status

        try:
            # Try a simple API call to check connectivity
            await self._ensure_session()
            url = urljoin(self.base_url, "/api/v1/auth/user")

            async with self._session.get(url) as response:
                if response.status in {200, 401}:  # 401 means API is responding
                    health_status["healthy"] = True
                    health_status["api_status"] = response.status
                else:
                    health_status["reason"] = f"API returned {response.status}"

        except Exception as e:  # noqa: BLE001 - health check should be resilient
            health_status["reason"] = str(e)

        return health_status

    async def invalidate_cache(self, path: str | None = None) -> int:
        """Invalidate cached secrets.

        Args:
            path: Specific path to invalidate, or None for all secrets

        Returns:
            Number of cache entries invalidated
        """
        if path:
            # Invalidate specific secret
            cache_key = f"{self._cache_prefix}{path}"
            metadata_key = f"{self._cache_metadata_prefix}{path}"

            deleted = await self.redis.delete(cache_key, metadata_key)
            logger.info("Invalidated cached secret", extra={"path": path})
            return deleted
        # Invalidate all secrets
        pattern_keys = [key async for key in self.redis.scan_iter(match=f"{self._cache_prefix}*")]
        pattern_keys.extend([
            key async for key in self.redis.scan_iter(match=f"{self._cache_metadata_prefix}*")
        ])

        if pattern_keys:
            deleted = await self.redis.delete(*pattern_keys)
            logger.info("Invalidated all cached secrets", extra={"count": deleted})
            return deleted

        return 0
