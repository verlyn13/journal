"""Unit tests for InfisicalSecretsClient.

Tests the Infisical CLI v0.42.1 integration client with mocked CLI calls.
"""

import json

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from redis.exceptions import RedisError

from app.infra.secrets import (
    AuthenticationError,
    ConnectionError,
    InfisicalError,
    InfisicalSecretsClient,
    RedisSecretsCache,
    SecretNotFoundError,
    SecretType,
)


class TestInfisicalSecretsClient:
    """Test InfisicalSecretsClient implementation."""

    @pytest.fixture()
    def mock_redis(self):
        """Create mock Redis client."""
        redis = AsyncMock()
        redis.get.return_value = None
        redis.setex.return_value = True
        redis.delete.return_value = 1
        redis.keys.return_value = []
        return redis

    @pytest.fixture()
    def cache(self, mock_redis):
        """Create RedisSecretsCache instance."""
        return RedisSecretsCache(mock_redis)

    @pytest.fixture()
    def client(self, cache):
        """Create InfisicalSecretsClient instance."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="infisical version 0.42.1",
            )
            return InfisicalSecretsClient(
                project_id="test-project",
                server_url="https://test.infisical.com",
                cache=cache,
                timeout=5.0,
                cache_ttl=60,
            )

    @pytest.mark.asyncio()
    async def test_validate_cli_success(self):
        """Test successful CLI validation."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="infisical version 0.42.1",
            )

            # Should not raise
            client = InfisicalSecretsClient(
                project_id="test-project",
                server_url="https://test.infisical.com",
            )
            assert client.project_id == "test-project"

    def test_validate_cli_not_found(self):
        """Test CLI validation when CLI not found."""
        with (
            patch("subprocess.run", side_effect=FileNotFoundError),
            pytest.raises(InfisicalError, match="CLI validation failed"),
        ):
            InfisicalSecretsClient(
                project_id="test-project",
                server_url="https://test.infisical.com",
            )

    def test_validate_cli_wrong_version(self):
        """Test CLI validation with unexpected version format."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="unknown version format",
            )

            with pytest.raises(InfisicalError, match="Unexpected.*version format"):
                InfisicalSecretsClient(
                    project_id="test-project",
                    server_url="https://test.infisical.com",
                )

    @pytest.mark.asyncio()
    async def test_from_env_success(self, mock_redis):
        """Test creating client from environment variables."""
        env_vars = {
            "INFISICAL_PROJECT_ID": "env-project",
            "INFISICAL_SERVER_URL": "https://env.infisical.com",
            "INFISICAL_CACHE_TTL": "120",
        }

        with (
            patch("subprocess.run") as mock_run,
            patch("os.getenv", side_effect=lambda k, d=None: env_vars.get(k, d)),
        ):
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="infisical version 0.42.1",
            )

            client = InfisicalSecretsClient.from_env(mock_redis)

            assert client.project_id == "env-project"
            assert client.server_url == "https://env.infisical.com"
            assert client.cache_ttl == 120

    def test_from_env_missing_project_id(self):
        """Test from_env with missing project ID."""
        with (
            patch("os.getenv", return_value=None),
            pytest.raises(InfisicalError, match="INFISICAL_PROJECT_ID.*required"),
        ):
            InfisicalSecretsClient.from_env()

    @pytest.mark.asyncio()
    async def test_fetch_secret_cache_hit(self, client, mock_redis):
        """Test fetching secret from cache."""
        cached_data = {
            "path": "/test/secret",
            "value": "cached_value",
            "cached_at": "2024-01-01T00:00:00+00:00",
            "ttl_seconds": 300,
            "secret_type": "api_key",
        }

        mock_redis.get.return_value = json.dumps(cached_data).encode()

        result = await client.fetch_secret("/test/secret")

        assert result == "cached_value"
        mock_redis.get.assert_called_once()

    @pytest.mark.asyncio()
    async def test_fetch_secret_cache_miss_success(self, client, mock_redis):
        """Test fetching secret from Infisical when cache misses."""
        mock_redis.get.return_value = None

        mock_response = {"secretValue": "fresh_value"}

        with patch("asyncio.create_subprocess_exec") as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (json.dumps(mock_response).encode(), b"")
            mock_process.returncode = 0
            mock_subprocess.return_value = mock_process

            result = await client.fetch_secret("/test/secret")

            assert result == "fresh_value"
            mock_redis.setex.assert_called_once()

    @pytest.mark.asyncio()
    async def test_fetch_secret_not_found(self, client, mock_redis):
        """Test fetching non-existent secret."""
        mock_redis.get.return_value = None

        with patch("asyncio.create_subprocess_exec") as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"", b"Error: secret not found")
            mock_process.returncode = 1
            mock_subprocess.return_value = mock_process

            with pytest.raises(SecretNotFoundError):
                await client.fetch_secret("/test/nonexistent")

    @pytest.mark.asyncio()
    async def test_fetch_secret_authentication_error(self, client, mock_redis):
        """Test authentication error during fetch."""
        mock_redis.get.return_value = None

        with patch("asyncio.create_subprocess_exec") as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"", b"Error: authentication failed")
            mock_process.returncode = 1
            mock_subprocess.return_value = mock_process

            with pytest.raises(AuthenticationError):
                await client.fetch_secret("/test/secret")

    @pytest.mark.asyncio()
    async def test_fetch_secret_timeout(self, client):
        """Test timeout during secret fetch."""
        with patch("asyncio.create_subprocess_exec") as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate.side_effect = TimeoutError()
            mock_process.kill = MagicMock()
            mock_subprocess.return_value = mock_process

            with pytest.raises(ConnectionError, match="Timeout"):
                await client.fetch_secret("/test/secret")

            mock_process.kill.assert_called_once()

    @pytest.mark.asyncio()
    async def test_fetch_secret_with_retries(self, client, mock_redis):
        """Test fetch with retries on temporary failure."""
        mock_redis.get.return_value = None

        call_count = 0

        async def mock_communicate():
            nonlocal call_count
            call_count += 1
            if call_count < 2:
                # First call fails
                return b"", b"temporary error"
            # Second call succeeds
            return json.dumps({"secretValue": "retry_success"}).encode(), b""

        with patch("asyncio.create_subprocess_exec") as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate = mock_communicate

            def mock_returncode():
                return 1 if call_count == 1 else 0

            type(mock_process).returncode = property(lambda self: mock_returncode())
            mock_subprocess.return_value = mock_process

            result = await client.fetch_secret("/test/secret")

            assert result == "retry_success"
            assert call_count == 2

    @pytest.mark.asyncio()
    async def test_store_secret_success(self, client):
        """Test storing secret successfully."""
        with patch("asyncio.create_subprocess_exec") as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"", b"")
            mock_process.returncode = 0
            mock_subprocess.return_value = mock_process

            await client.store_secret("/test/secret", "new_value")

            # Verify CLI was called with correct arguments
            mock_subprocess.assert_called_once()
            args = mock_subprocess.call_args[0]
            assert "infisical" in args
            assert "secrets" in args
            assert "set" in args

    @pytest.mark.asyncio()
    async def test_list_secrets_success(self, client):
        """Test listing secrets successfully."""
        mock_response = [
            {"secretKey": "secret1", "secretValue": "value1"},
            {"secretKey": "secret2", "secretValue": "value2"},
        ]

        with patch("asyncio.create_subprocess_exec") as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (json.dumps(mock_response).encode(), b"")
            mock_process.returncode = 0
            mock_subprocess.return_value = mock_process

            result = await client.list_secrets("/auth/")

            assert result == ["secret1", "secret2"]

    @pytest.mark.asyncio()
    async def test_delete_secret_success(self, client):
        """Test deleting secret successfully."""
        with patch("asyncio.create_subprocess_exec") as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"", b"")
            mock_process.returncode = 0
            mock_subprocess.return_value = mock_process

            await client.delete_secret("/test/secret")

            # Verify CLI was called with correct arguments
            mock_subprocess.assert_called_once()
            args = mock_subprocess.call_args[0]
            assert "infisical" in args
            assert "secrets" in args
            assert "delete" in args

    @pytest.mark.asyncio()
    async def test_health_check_healthy(self, client):
        """Test health check when system is healthy."""
        with patch("asyncio.create_subprocess_exec") as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"[]", b"")
            mock_process.returncode = 0
            mock_subprocess.return_value = mock_process

            result = await client.health_check()

            assert result["status"] == "healthy"
            assert "response_time_ms" in result

    @pytest.mark.asyncio()
    async def test_health_check_unhealthy(self, client):
        """Test health check when system is unhealthy."""
        with patch("asyncio.create_subprocess_exec") as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"", b"connection failed")
            mock_process.returncode = 1
            mock_subprocess.return_value = mock_process

            result = await client.health_check()

            assert result["status"] == "unhealthy"
            assert "error" in result

    @pytest.mark.asyncio()
    async def test_invalidate_cache(self, client):
        """Test cache invalidation."""
        # Spy on invalidate_pattern
        with patch.object(client.cache, "invalidate_pattern", new=AsyncMock()) as mock_inv:
            await client.invalidate_cache("/auth/*")
            mock_inv.assert_called_once_with("/auth/*")


class TestRedisSecretsCache:
    """Test RedisSecretsCache implementation."""

    @pytest.fixture()
    def mock_redis(self):
        """Create mock Redis client."""
        return AsyncMock()

    @pytest.fixture()
    def cache(self, mock_redis):
        """Create RedisSecretsCache instance."""
        return RedisSecretsCache(mock_redis, "test:secrets")

    @pytest.mark.asyncio()
    async def test_cache_get_hit(self, cache, mock_redis):
        """Test cache get with hit."""
        cached_data = {
            "path": "/test/secret",
            "value": "cached_value",
            "cached_at": "2024-01-01T00:00:00+00:00",
            "ttl_seconds": 300,
            "secret_type": "api_key",
        }

        mock_redis.get.return_value = json.dumps(cached_data).encode()

        result = await cache.get("/test/secret")

        assert result is not None
        assert result.value == "cached_value"
        assert result.secret_type == SecretType.API_KEY

    @pytest.mark.asyncio()
    async def test_cache_get_miss(self, cache, mock_redis):
        """Test cache get with miss."""
        mock_redis.get.return_value = None

        result = await cache.get("/test/secret")

        assert result is None

    @pytest.mark.asyncio()
    async def test_cache_get_redis_error(self, cache, mock_redis):
        """Test cache get with Redis error."""
        mock_redis.get.side_effect = RedisError("Connection failed")

        result = await cache.get("/test/secret")

        assert result is None

    @pytest.mark.asyncio()
    async def test_cache_set_success(self, cache, mock_redis):
        """Test cache set success."""
        from datetime import UTC, datetime

        from app.infra.secrets.infisical_client import SecretMetadata

        metadata = SecretMetadata(
            path="/test/secret",
            value="test_value",
            cached_at=datetime.now(UTC),
            ttl_seconds=300,
            secret_type=SecretType.API_KEY,
        )

        await cache.set("/test/secret", metadata)

        mock_redis.setex.assert_called_once()
        args = mock_redis.setex.call_args[0]
        assert args[0] == "test:secrets:/test/secret"
        assert args[1] == 300  # TTL

    @pytest.mark.asyncio()
    async def test_cache_delete_success(self, cache, mock_redis):
        """Test cache delete success."""
        await cache.delete("/test/secret")

        mock_redis.delete.assert_called_once_with("test:secrets:/test/secret")

    @pytest.mark.asyncio()
    async def test_cache_invalidate_pattern(self, cache, mock_redis):
        """Test cache pattern invalidation."""
        mock_redis.keys.return_value = [
            "test:secrets:/auth/jwt/key1",
            "test:secrets:/auth/jwt/key2",
        ]

        await cache.invalidate_pattern("/auth/jwt/*")

        mock_redis.keys.assert_called_once_with("test:secrets:/auth/jwt/*")
        mock_redis.delete.assert_called_once()


class TestSecretTypeInference:
    """Test secret type inference logic."""

    def test_infer_jwt_private_key(self):
        """Test JWT private key inference."""
        client = InfisicalSecretsClient("test", "test")

        secret_type = client._infer_secret_type("/auth/jwt/current_private_key")

        assert secret_type == SecretType.JWT_PRIVATE_KEY

    def test_infer_jwt_public_key(self):
        """Test JWT public key inference."""
        client = InfisicalSecretsClient("test", "test")

        secret_type = client._infer_secret_type("/auth/jwt/current_public_key")

        assert secret_type == SecretType.JWT_PUBLIC_KEY

    def test_infer_aes_key(self):
        """Test AES key inference."""
        client = InfisicalSecretsClient("test", "test")

        secret_type = client._infer_secret_type("/auth/aes/encryption_key")

        assert secret_type == SecretType.AES_ENCRYPTION_KEY

    def test_infer_webhook_secret(self):
        """Test webhook secret inference."""
        client = InfisicalSecretsClient("test", "test")

        secret_type = client._infer_secret_type("/auth/webhook/secret")

        assert secret_type == SecretType.WEBHOOK_SECRET

    def test_infer_default_fallback(self):
        """Test fallback to default type."""
        client = InfisicalSecretsClient("test", "test")

        secret_type = client._infer_secret_type("/unknown/path")

        assert secret_type == SecretType.API_KEY
