"""Tests for enhanced Infisical client with security hardening."""

from unittest.mock import AsyncMock

import pytest

from redis.asyncio import Redis

from app.infra.secrets.enhanced_infisical_client import (
    CircuitBreaker,
    EnhancedInfisicalClient,
    InfisicalAuthError,
    InfisicalRateLimitError,
    InfisicalUnavailableError,
    SecretEncryption,
)


class TestSecretEncryption:
    """Test secret encryption for cached values."""

    def test_encrypt_decrypt_roundtrip(self) -> None:
        """Test encryption and decryption roundtrip."""
        encryption = SecretEncryption()
        plaintext = "super-secret-api-key-12345"

        ciphertext = encryption.encrypt(plaintext)
        decrypted = encryption.decrypt(ciphertext)

        assert decrypted == plaintext
        assert ciphertext != plaintext
        assert len(ciphertext) > len(plaintext)  # Encrypted data should be larger

    def test_different_keys_produce_different_ciphertext(self) -> None:
        """Test that different encryption keys produce different ciphertext."""
        plaintext = "test-secret"

        encryption1 = SecretEncryption()
        encryption2 = SecretEncryption()

        ciphertext1 = encryption1.encrypt(plaintext)
        ciphertext2 = encryption2.encrypt(plaintext)

        assert ciphertext1 != ciphertext2

    def test_same_key_consistent_results(self) -> None:
        """Test that same key with same plaintext produces different ciphertext (nonce)."""
        encryption = SecretEncryption()
        plaintext = "test-secret"

        ciphertext1 = encryption.encrypt(plaintext)
        ciphertext2 = encryption.encrypt(plaintext)

        # Should be different due to nonce, but both should decrypt correctly
        assert ciphertext1 != ciphertext2
        assert encryption.decrypt(ciphertext1) == plaintext
        assert encryption.decrypt(ciphertext2) == plaintext


class TestCircuitBreaker:
    """Test circuit breaker for API resilience."""

    @pytest.fixture()
    def circuit_breaker(self) -> CircuitBreaker:
        """Create circuit breaker with low thresholds for testing."""
        return CircuitBreaker(
            failure_threshold=2,
            recovery_timeout=1,  # 1 second for fast tests
        )

    def test_initial_state_closed(self, circuit_breaker: CircuitBreaker) -> None:
        """Test circuit breaker starts in closed state."""
        assert circuit_breaker.state == "closed"
        assert circuit_breaker.can_execute() is True

    def test_failure_threshold_opens_circuit(self, circuit_breaker: CircuitBreaker) -> None:
        """Test circuit opens after failure threshold."""
        # Record failures up to threshold
        circuit_breaker.record_failure()
        assert circuit_breaker.state == "closed"
        assert circuit_breaker.can_execute() is True

        circuit_breaker.record_failure()
        assert circuit_breaker.state == "open"
        assert circuit_breaker.can_execute() is False

    def test_success_resets_failure_count(self, circuit_breaker: CircuitBreaker) -> None:
        """Test success resets failure count."""
        circuit_breaker.record_failure()
        assert circuit_breaker.failure_count == 1

        circuit_breaker.record_success()
        assert circuit_breaker.failure_count == 0
        assert circuit_breaker.state == "closed"

    def test_recovery_timeout_allows_half_open(self, circuit_breaker: CircuitBreaker) -> None:
        """Test circuit moves to half-open after recovery timeout."""
        # Open the circuit
        circuit_breaker.record_failure()
        circuit_breaker.record_failure()
        assert circuit_breaker.state == "open"

        # Simulate time passing (in real test would need to wait or mock time)
        import time

        time.sleep(1.1)  # Slightly longer than recovery_timeout

        assert circuit_breaker.can_execute() is True
        # After can_execute() call, state should be half-open
        assert circuit_breaker.state == "half-open"


class TestEnhancedInfisicalClient:
    """Test enhanced Infisical client."""

    @pytest.fixture()
    def mock_redis(self) -> AsyncMock:
        """Create mock Redis client."""
        redis = AsyncMock(spec=Redis)
        redis.get.return_value = None
        redis.setex.return_value = True
        redis.delete.return_value = 1
        redis.scan_iter.return_value = aiter([])
        return redis

    @pytest.fixture()
    def client(self, mock_redis: AsyncMock) -> EnhancedInfisicalClient:
        """Create enhanced Infisical client."""
        return EnhancedInfisicalClient(
            base_url="https://api.infisical.test",
            token="test-token-123",
            redis=mock_redis,
            timeout=5,
            max_retries=2,
            cache_ttl=60,
        )

    @pytest.mark.asyncio()
    async def test_client_context_manager(self, client: EnhancedInfisicalClient) -> None:
        """Test client as async context manager."""
        async with client as managed_client:
            assert managed_client is client
            assert client._session is not None

    @pytest.mark.asyncio()
    async def test_fetch_secret_from_cache(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test fetching secret from cache."""
        secret_path = "/test/secret"
        secret_value = "cached-secret-value"

        # Mock encrypted cache hit
        encrypted_value = client.encryption.encrypt(secret_value)
        mock_redis.get.return_value = encrypted_value.encode()

        result = await client.fetch_secret(secret_path)

        assert result == secret_value
        mock_redis.get.assert_called_once_with(f"infisical:secrets:{secret_path}")

    @pytest.mark.asyncio()
    async def test_fetch_secret_cache_miss_api_success(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test fetching secret from API when cache misses."""
        secret_path = "/test/secret"
        secret_value = "api-secret-value"

        # Mock cache miss
        mock_redis.get.return_value = None

        # Mock successful API response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {"secretValue": secret_value}

        mock_session = AsyncMock()
        mock_session.get.return_value.__aenter__.return_value = mock_response
        client._session = mock_session

        result = await client.fetch_secret(secret_path)

        assert result == secret_value
        # Should cache the result
        mock_redis.setex.assert_called()

    @pytest.mark.asyncio()
    async def test_fetch_secret_api_auth_error(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test API authentication error."""
        secret_path = "/test/secret"

        # Mock cache miss
        mock_redis.get.return_value = None

        # Mock auth error response
        mock_response = AsyncMock()
        mock_response.status = 401

        mock_session = AsyncMock()
        mock_session.get.return_value.__aenter__.return_value = mock_response
        client._session = mock_session

        with pytest.raises(InfisicalAuthError, match="Authentication failed"):
            await client.fetch_secret(secret_path)

    @pytest.mark.asyncio()
    async def test_fetch_secret_rate_limit_error(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test API rate limit error."""
        secret_path = "/test/secret"

        # Mock cache miss
        mock_redis.get.return_value = None

        # Mock rate limit response
        mock_response = AsyncMock()
        mock_response.status = 429

        mock_session = AsyncMock()
        mock_session.get.return_value.__aenter__.return_value = mock_response
        client._session = mock_session

        with pytest.raises(InfisicalRateLimitError, match="Rate limit exceeded"):
            await client.fetch_secret(secret_path)

    @pytest.mark.asyncio()
    async def test_fetch_secret_server_error(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test API server error."""
        secret_path = "/test/secret"

        # Mock cache miss
        mock_redis.get.return_value = None

        # Mock server error response
        mock_response = AsyncMock()
        mock_response.status = 500

        mock_session = AsyncMock()
        mock_session.get.return_value.__aenter__.return_value = mock_response
        client._session = mock_session

        with pytest.raises(InfisicalUnavailableError, match="Server error: 500"):
            await client.fetch_secret(secret_path)

    @pytest.mark.asyncio()
    async def test_fetch_secret_circuit_breaker_open(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test circuit breaker prevents API calls when open."""
        secret_path = "/test/secret"

        # Mock cache miss
        mock_redis.get.return_value = None

        # Open the circuit breaker
        client.circuit_breaker.state = "open"

        with pytest.raises(InfisicalUnavailableError, match="Circuit breaker open"):
            await client.fetch_secret(secret_path)

    @pytest.mark.asyncio()
    async def test_fetch_secret_with_fallback(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test fallback mechanism when API fails."""
        secret_path = "/test/secret"
        fallback_value = "fallback-secret-value"

        # Mock cache miss for main cache
        mock_redis.get.side_effect = [
            None,  # Main cache miss
            client.encryption.encrypt(fallback_value).encode(),  # Fallback cache hit
        ]

        # Open circuit breaker to force fallback
        client.circuit_breaker.state = "open"

        result = await client.fetch_secret(secret_path)

        assert result == fallback_value

    @pytest.mark.asyncio()
    async def test_store_secret_success(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test storing secret successfully."""
        secret_path = "/test/secret"
        secret_value = "new-secret-value"

        # Mock successful API response
        mock_response = AsyncMock()
        mock_response.status = 200

        mock_session = AsyncMock()
        mock_session.put.return_value.__aenter__.return_value = mock_response
        client._session = mock_session

        await client.store_secret(secret_path, secret_value)

        # Should update cache
        mock_redis.setex.assert_called()

    @pytest.mark.asyncio()
    async def test_store_secret_circuit_breaker_open(self, client: EnhancedInfisicalClient) -> None:
        """Test store secret fails when circuit breaker is open."""
        secret_path = "/test/secret"
        secret_value = "new-secret-value"

        # Open circuit breaker
        client.circuit_breaker.state = "open"

        with pytest.raises(InfisicalUnavailableError, match="Circuit breaker open"):
            await client.store_secret(secret_path, secret_value)

    @pytest.mark.asyncio()
    async def test_health_check_success(self, client: EnhancedInfisicalClient) -> None:
        """Test health check with healthy service."""
        # Mock successful health check response
        mock_response = AsyncMock()
        mock_response.status = 200

        mock_session = AsyncMock()
        mock_session.get.return_value.__aenter__.return_value = mock_response
        client._session = mock_session

        health_status = await client.health_check()

        assert health_status["healthy"] is True
        assert health_status["api_status"] == 200
        assert "circuit_breaker_state" in health_status

    @pytest.mark.asyncio()
    async def test_health_check_circuit_breaker_open(self, client: EnhancedInfisicalClient) -> None:
        """Test health check with circuit breaker open."""
        # Open circuit breaker
        client.circuit_breaker.state = "open"

        health_status = await client.health_check()

        assert health_status["healthy"] is False
        assert health_status["reason"] == "Circuit breaker open"

    @pytest.mark.asyncio()
    async def test_invalidate_cache_specific_path(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test invalidating cache for specific path."""
        secret_path = "/test/secret"
        mock_redis.delete.return_value = 2  # Cache key + metadata key

        deleted_count = await client.invalidate_cache(secret_path)

        assert deleted_count == 2
        mock_redis.delete.assert_called_once()

    @pytest.mark.asyncio()
    async def test_invalidate_cache_all_secrets(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test invalidating all cached secrets."""
        # Mock finding cache keys
        cache_keys = [
            b"infisical:secrets:/path1",
            b"infisical:secrets:/path2",
            b"infisical:meta:/path1",
            b"infisical:meta:/path2",
        ]

        async def mock_scan_iter(match=None):
            if "secrets" in match:
                for key in cache_keys[:2]:
                    yield key
            elif "meta" in match:
                for key in cache_keys[2:]:
                    yield key

        mock_redis.scan_iter.side_effect = mock_scan_iter
        mock_redis.delete.return_value = 4

        deleted_count = await client.invalidate_cache(None)

        assert deleted_count == 4

    @pytest.mark.asyncio()
    async def test_cache_secret_encryption(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test that cached secrets are encrypted."""
        secret_path = "/test/secret"
        secret_value = "plain-secret-value"

        await client._cache_secret(secret_path, secret_value)

        # Verify setex was called for both cache and metadata
        assert mock_redis.setex.call_count == 2

        # Get the encrypted value that was cached
        cache_call = mock_redis.setex.call_args_list[0]
        cache_key, ttl, encrypted_value = cache_call[0]

        assert cache_key == f"infisical:secrets:{secret_path}"
        assert ttl == client.cache_ttl
        assert encrypted_value != secret_value  # Should be encrypted

        # Verify we can decrypt it back
        decrypted = client.encryption.decrypt(encrypted_value)
        assert decrypted == secret_value

    @pytest.mark.asyncio()
    async def test_get_cached_secret_decryption(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test that cached secrets are properly decrypted."""
        secret_path = "/test/secret"
        secret_value = "plain-secret-value"
        encrypted_value = client.encryption.encrypt(secret_value)

        # Mock Redis returning encrypted value
        mock_redis.get.return_value = encrypted_value.encode()

        result = await client._get_cached_secret(secret_path)

        assert result == secret_value

    @pytest.mark.asyncio()
    async def test_retry_mechanism_success_after_failure(
        self, client: EnhancedInfisicalClient, mock_redis: AsyncMock
    ) -> None:
        """Test retry mechanism succeeds after initial failure."""
        secret_path = "/test/secret"
        secret_value = "retry-secret-value"

        # Mock cache miss
        mock_redis.get.return_value = None

        # Mock first response fails, second succeeds
        mock_response_fail = AsyncMock()
        mock_response_fail.status = 500

        mock_response_success = AsyncMock()
        mock_response_success.status = 200
        mock_response_success.json.return_value = {"secretValue": secret_value}

        mock_session = AsyncMock()
        mock_session.get.return_value.__aenter__.side_effect = [
            mock_response_fail,
            mock_response_success,
        ]
        client._session = mock_session

        result = await client.fetch_secret(secret_path)

        assert result == secret_value
        # Should have made 2 API calls (1 failure + 1 success)
        assert mock_session.get.call_count == 2
