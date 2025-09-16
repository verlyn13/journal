"""Integration tests for Infisical CLI v0.42.1 integration.

These tests require a running Infisical instance and proper authentication.
They can be run with real Infisical or mocked for CI environments.
"""

import asyncio
from contextlib import suppress
from datetime import UTC, datetime
import os
import subprocess
from unittest.mock import patch

import pytest
from redis.asyncio import Redis

from app.infra.secrets import InfisicalSecretsClient, SecretNotFoundError, SecretType
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
from app.security.token_cipher import TokenCipher


# Skip integration tests if Infisical CLI not available or not configured
def infisical_available():
    """Check if Infisical CLI is available and configured."""
    try:
        result = subprocess.run(
            ["infisical", "--version"],
            capture_output=True,
            text=True,
            timeout=5.0,
            check=False,
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def infisical_configured():
    """Check if Infisical environment is configured."""
    return all([
        os.getenv("INFISICAL_PROJECT_ID"),
        os.getenv("INFISICAL_SERVER_URL"),
    ])


pytestmark = pytest.mark.skipif(
    not infisical_available() or not infisical_configured(),
    reason="Infisical CLI not available or not configured",
)


@pytest.fixture()
async def redis_client():
    """Create Redis client for testing."""
    redis = Redis.from_url("redis://localhost:6380/1")  # Use test DB
    yield redis
    await redis.flushdb()  # Clean up
    await redis.close()


@pytest.fixture()
async def infisical_client(redis_client):
    """Create InfisicalSecretsClient for testing."""
    return InfisicalSecretsClient.from_env(redis_client)


@pytest.fixture()
async def key_manager(redis_client, infisical_client):
    """Create InfisicalKeyManager for testing."""
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
    from sqlalchemy.orm import sessionmaker

    # Use in-memory SQLite for testing
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    session_factory = sessionmaker(engine, class_=AsyncSession)

    async with session_factory() as session:
        manager = InfisicalKeyManager(session, redis_client, infisical_client)
        yield manager


class TestInfisicalSecretsClientIntegration:
    """Integration tests for InfisicalSecretsClient."""

    @pytest.mark.asyncio()
    async def test_health_check_real(self, infisical_client):
        """Test health check against real Infisical."""
        result = await infisical_client.health_check()

        assert "status" in result
        assert "response_time_ms" in result
        assert result["server_url"] == infisical_client.server_url
        assert result["project_id"] == infisical_client.project_id

    @pytest.mark.asyncio()
    async def test_store_fetch_delete_cycle(self, infisical_client):
        """Test complete store -> fetch -> delete cycle."""
        test_path = "/test/integration_test_secret"
        test_value = f"test_value_{datetime.now(UTC).isoformat()}"

        try:
            # Store secret
            await infisical_client.store_secret(test_path, test_value, SecretType.API_KEY)

            # Fetch secret
            fetched_value = await infisical_client.fetch_secret(test_path)
            assert fetched_value == test_value

            # Fetch from cache (second call should hit cache)
            cached_value = await infisical_client.fetch_secret(test_path)
            assert cached_value == test_value

            # Force refresh
            fresh_value = await infisical_client.fetch_secret(test_path, force_refresh=True)
            assert fresh_value == test_value

        finally:
            # Clean up
            with suppress(SecretNotFoundError):
                await infisical_client.delete_secret(test_path)

    @pytest.mark.asyncio()
    async def test_fetch_nonexistent_secret(self, infisical_client):
        """Test fetching non-existent secret."""
        with pytest.raises(SecretNotFoundError):
            await infisical_client.fetch_secret("/test/nonexistent_secret")

    @pytest.mark.asyncio()
    async def test_list_secrets(self, infisical_client):
        """Test listing secrets."""
        # Create a test secret
        test_path = "/test/list_test_secret"
        test_value = "list_test_value"

        try:
            await infisical_client.store_secret(test_path, test_value)

            # List secrets
            secrets = await infisical_client.list_secrets("/test/")

            # Should include our test secret
            secret_names = [path.split("/")[-1] for path in secrets]
            assert "list_test_secret" in secret_names

        finally:
            with suppress(SecretNotFoundError):
                await infisical_client.delete_secret(test_path)

    @pytest.mark.asyncio()
    async def test_cache_invalidation(self, infisical_client):
        """Test cache invalidation."""
        test_path = "/test/cache_test_secret"
        test_value = "cache_test_value"

        try:
            # Store and fetch to populate cache
            await infisical_client.store_secret(test_path, test_value)
            await infisical_client.fetch_secret(test_path)

            # Invalidate cache
            await infisical_client.invalidate_cache("/test/*")

            # Next fetch should go to Infisical (not cache)
            fresh_value = await infisical_client.fetch_secret(test_path)
            assert fresh_value == test_value

        finally:
            with suppress(SecretNotFoundError):
                await infisical_client.delete_secret(test_path)


class TestInfisicalKeyManagerIntegration:
    """Integration tests for InfisicalKeyManager."""

    @pytest.mark.asyncio()
    async def test_initialize_key_system(self, key_manager):
        """Test initializing key system."""
        await key_manager.initialize_key_system()

        # Should be able to get current signing key
        signing_key = await key_manager.get_current_signing_key()
        assert signing_key is not None
        assert signing_key.kid is not None

    @pytest.mark.asyncio()
    async def test_get_token_cipher(self, key_manager):
        """Test getting TokenCipher with Infisical backend."""
        # Initialize AES system first
        await key_manager._initialize_aes_key_system()

        cipher = await key_manager.get_token_cipher()

        assert isinstance(cipher, TokenCipher)
        assert cipher.active_kid is not None
        assert len(cipher._keys) > 0

        # Test encryption/decryption
        test_plaintext = "test_encryption_message"
        encrypted = cipher.encrypt(test_plaintext)
        decrypted = cipher.decrypt(encrypted)

        assert decrypted == test_plaintext

    @pytest.mark.asyncio()
    async def test_aes_key_rotation(self, key_manager):
        """Test AES key rotation."""
        # Initialize system
        await key_manager._initialize_aes_key_system()

        # Get initial cipher
        initial_cipher = await key_manager.get_token_cipher()
        initial_kid = initial_cipher.active_kid

        # Force rotation
        result = await key_manager.rotate_aes_keys(force=True)

        assert result["status"] == "success"
        assert result["old_active_kid"] == initial_kid
        assert result["new_active_kid"] != initial_kid

        # Get new cipher
        new_cipher = await key_manager.get_token_cipher()
        assert new_cipher.active_kid == result["new_active_kid"]
        assert new_cipher.active_kid != initial_kid

    @pytest.mark.asyncio()
    async def test_jwt_key_rotation(self, key_manager):
        """Test JWT key rotation."""
        # Initialize system
        await key_manager.initialize_key_system()

        # Get initial key
        initial_key = await key_manager.get_current_signing_key()
        initial_kid = initial_key.kid

        # Force rotation
        result = await key_manager.rotate_keys(force=True)

        assert result["status"] == "success"
        assert "new_current_kid" in result

        # Get new key
        new_key = await key_manager.get_current_signing_key()
        assert new_key.kid != initial_kid

    @pytest.mark.asyncio()
    async def test_health_check_comprehensive(self, key_manager):
        """Test comprehensive health check."""
        # Initialize systems
        await key_manager.initialize_key_system()
        await key_manager._initialize_aes_key_system()

        health = await key_manager.health_check()

        assert health["overall_status"] == "healthy"
        assert health["jwt_system"]["status"] == "healthy"
        assert health["aes_system"]["status"] == "healthy"
        assert health["infisical_connection"]["status"] == "healthy"

    @pytest.mark.asyncio()
    async def test_webhook_rotation_workflow(self, key_manager):
        """Test webhook-triggered rotation workflow."""
        # Initialize systems
        await key_manager.initialize_key_system()
        await key_manager._initialize_aes_key_system()

        # Test JWT rotation via webhook
        jwt_webhook_data = {
            "rotation_type": "jwt",
            "force": True,
            "source": "webhook_test",
        }

        jwt_result = await key_manager.webhook_rotate_keys(jwt_webhook_data)

        assert jwt_result["rotation_type"] == "jwt"
        assert jwt_result["results"]["jwt"]["status"] == "success"

        # Test AES rotation via webhook
        aes_webhook_data = {
            "rotation_type": "aes",
            "force": True,
            "source": "webhook_test",
        }

        aes_result = await key_manager.webhook_rotate_keys(aes_webhook_data)

        assert aes_result["rotation_type"] == "aes"
        assert aes_result["results"]["aes"]["status"] == "success"

        # Test both rotation via webhook
        both_webhook_data = {
            "rotation_type": "both",
            "force": True,
            "source": "webhook_test",
        }

        both_result = await key_manager.webhook_rotate_keys(both_webhook_data)

        assert both_result["rotation_type"] == "both"
        assert both_result["results"]["jwt"]["status"] == "success"
        assert both_result["results"]["aes"]["status"] == "success"


class TestInfisicalErrorHandling:
    """Test error handling in Infisical integration."""

    @pytest.mark.asyncio()
    async def test_connection_error_handling(self, redis_client):
        """Test handling of connection errors."""
        # Create client with invalid server URL
        client = InfisicalSecretsClient(
            project_id="test-project",
            server_url="https://invalid-server.test",
            cache=None,
            timeout=2.0,  # Short timeout for faster test
        )

        health = await client.health_check()

        assert health["status"] == "unhealthy"
        assert "error" in health

    @pytest.mark.asyncio()
    async def test_retry_mechanism(self, infisical_client):
        """Test retry mechanism with transient failures."""
        # This test uses mocking to simulate transient failures

        call_count = 0

        async def mock_fetch_with_retry(path):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                # First call fails
                raise Exception("Transient error")
            # Second call succeeds
            return "retry_success_value"

        with patch.object(
            infisical_client, "_fetch_single_attempt", side_effect=mock_fetch_with_retry
        ):
            result = await infisical_client.fetch_secret("/test/retry")

            assert result == "retry_success_value"
            assert call_count == 2


class TestInfisicalPerformance:
    """Performance tests for Infisical integration."""

    @pytest.mark.asyncio()
    async def test_cache_performance(self, infisical_client):
        """Test cache performance improvement."""
        test_path = "/test/performance_test"
        test_value = "performance_test_value"

        try:
            # Store secret
            await infisical_client.store_secret(test_path, test_value)

            # Time first fetch (should go to Infisical)
            start_time = datetime.now(UTC)
            await infisical_client.fetch_secret(test_path)
            first_fetch_time = (datetime.now(UTC) - start_time).total_seconds()

            # Time second fetch (should hit cache)
            start_time = datetime.now(UTC)
            await infisical_client.fetch_secret(test_path)
            cached_fetch_time = (datetime.now(UTC) - start_time).total_seconds()

            # Cache should be significantly faster
            assert cached_fetch_time < first_fetch_time
            assert cached_fetch_time < 0.1  # Should be very fast

        finally:
            with suppress(SecretNotFoundError):
                await infisical_client.delete_secret(test_path)

    @pytest.mark.asyncio()
    async def test_concurrent_access(self, infisical_client):
        """Test concurrent access to secrets."""
        test_paths = [f"/test/concurrent_{i}" for i in range(5)]
        test_value = "concurrent_test_value"

        try:
            # Store secrets concurrently
            store_tasks = [
                infisical_client.store_secret(path, f"{test_value}_{i}")
                for i, path in enumerate(test_paths)
            ]
            await asyncio.gather(*store_tasks)

            # Fetch secrets concurrently
            fetch_tasks = [infisical_client.fetch_secret(path) for path in test_paths]
            results = await asyncio.gather(*fetch_tasks)

            # Verify all results
            for i, result in enumerate(results):
                assert result == f"{test_value}_{i}"

        finally:
            # Clean up concurrently
            delete_tasks = [infisical_client.delete_secret(path) for path in test_paths]
            await asyncio.gather(*delete_tasks, return_exceptions=True)
