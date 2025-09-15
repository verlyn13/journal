"""Unit tests for InfisicalKeyManager.

Tests the enhanced key manager with Infisical integration.
"""

import json

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.infra.secrets import InfisicalSecretsClient, SecretNotFoundError
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
from app.security.token_cipher import TokenCipher


class TestInfisicalKeyManager:
    """Test InfisicalKeyManager implementation."""

    @pytest.fixture()
    def mock_session(self):
        """Create mock database session."""
        return AsyncMock()

    @pytest.fixture()
    def mock_redis(self):
        """Create mock Redis client."""
        redis = AsyncMock()
        redis.get = AsyncMock(return_value=None)
        redis.setex = AsyncMock(return_value=True)
        redis.delete = AsyncMock(return_value=1)
        redis.hget = AsyncMock(return_value=None)
        redis.hset = AsyncMock(return_value=True)
        redis.expire = AsyncMock(return_value=True)
        return redis

    @pytest.fixture()
    def mock_infisical_client(self):
        """Create mock Infisical client."""
        client = AsyncMock(spec=InfisicalSecretsClient)
        # Setup default responses for common secrets
        client.fetch_secret = AsyncMock(
            side_effect=lambda path: {
                "/auth/aes/active-kid": "test-kid-123",
                "/auth/aes/keys-map": json.dumps({
                    "keys": {
                        "test-kid-123": "dGVzdC1rZXktMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI="  # 32-byte key base64
                    },
                    "current_kid": "test-kid-123"
                }),
                "/auth/jwt/private-key": "-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----",
                "/auth/jwt/public-key": "-----BEGIN PUBLIC KEY-----\ntest-key\n-----END PUBLIC KEY-----",
            }.get(path, "default-value")
        )
        return client

    @pytest.fixture()
    def key_manager(self, mock_session, mock_redis, mock_infisical_client):
        """Create InfisicalKeyManager instance."""
        return InfisicalKeyManager(
            mock_session,
            mock_redis,
            mock_infisical_client,
            enable_infisical=True,
        )

    @pytest.fixture()
    def disabled_key_manager(self, mock_session, mock_redis, mock_infisical_client):
        """Create InfisicalKeyManager with Infisical disabled."""
        return InfisicalKeyManager(
            mock_session,
            mock_redis,
            mock_infisical_client,
            enable_infisical=False,
        )

    @pytest.mark.asyncio()
    async def test_get_token_cipher_from_cache(self, key_manager, mock_redis):
        """Test getting TokenCipher from cache."""
        cached_cipher_data = {
            "active_kid": "test_kid",
            "keys_map": {"test_kid": "dGVzdF9rZXk"},  # base64 for "test_key"
            "cached_at": datetime.now(UTC).isoformat(),
        }

        mock_redis.get.return_value = json.dumps(cached_cipher_data).encode()

        cipher = await key_manager.get_token_cipher()

        assert isinstance(cipher, TokenCipher)
        assert cipher.active_kid == "test_kid"

    @pytest.mark.asyncio()
    async def test_get_token_cipher_from_infisical(
        self, key_manager, mock_redis, mock_infisical_client
    ):
        """Test getting TokenCipher from Infisical."""
        mock_redis.get.return_value = None

        # Mock Infisical responses
        mock_infisical_client.fetch_secret.side_effect = [
            "test_kid",  # active_kid
            '{"test_kid": "dGVzdF9rZXlfMzJfYnl0ZXNfZXhhY3RseQ"}',  # keys_map (32 bytes base64)
        ]

        cipher = await key_manager.get_token_cipher()

        assert isinstance(cipher, TokenCipher)
        assert cipher.active_kid == "test_kid"

        # Verify cache was updated
        mock_redis.setex.assert_called_once()

    @pytest.mark.asyncio()
    async def test_get_token_cipher_fallback_to_env(self, key_manager, mock_infisical_client):
        """Test fallback to environment when Infisical fails."""
        mock_infisical_client.fetch_secret.side_effect = SecretNotFoundError("Not found")

        with patch.object(TokenCipher, "from_env") as mock_from_env:
            mock_cipher = MagicMock(spec=TokenCipher)
            mock_from_env.return_value = mock_cipher

            cipher = await key_manager.get_token_cipher()

            assert cipher == mock_cipher
            mock_from_env.assert_called_once()

    @pytest.mark.asyncio()
    async def test_get_token_cipher_disabled(self, disabled_key_manager):
        """Test getting TokenCipher when Infisical is disabled."""
        with patch.object(TokenCipher, "from_env") as mock_from_env:
            mock_cipher = MagicMock(spec=TokenCipher)
            mock_from_env.return_value = mock_cipher

            cipher = await disabled_key_manager.get_token_cipher()

            assert cipher == mock_cipher
            mock_from_env.assert_called_once()

    @pytest.mark.asyncio()
    async def test_rotate_aes_keys_success(self, key_manager, mock_infisical_client):
        """Test successful AES key rotation."""
        # Mock current cipher
        mock_cipher = MagicMock(spec=TokenCipher)
        mock_cipher.active_kid = "old_kid"

        with (
            patch.object(key_manager, "get_token_cipher", return_value=mock_cipher),
            patch.object(
                key_manager, "_check_aes_rotation_needed", return_value=(True, "Test rotation")
            ),
        ):
            # Mock Infisical responses
            current_keys_map = {"old_kid": "b2xkX2tleQ"}
            mock_infisical_client.fetch_secret.return_value = json.dumps(current_keys_map)

            result = await key_manager.rotate_aes_keys()

            assert result["status"] == "success"
            assert result["old_active_kid"] == "old_kid"
            assert "new_active_kid" in result
            assert result["keys_count"] == 2  # old + new key

            # Verify Infisical was called to store new keys
            assert mock_infisical_client.store_secret.call_count >= 2

    @pytest.mark.asyncio()
    async def test_rotate_aes_keys_not_needed(self, key_manager):
        """Test AES rotation when not needed."""
        # Mock the get_token_cipher to avoid loading from env
        mock_cipher = MagicMock(spec=TokenCipher)

        with (
            patch.object(key_manager, "get_token_cipher", return_value=mock_cipher),
            patch.object(key_manager, "_check_aes_rotation_needed", return_value=(False, "Not needed")),
        ):
            result = await key_manager.rotate_aes_keys()

            assert result["status"] == "skipped"
            assert result["reason"] == "Not needed"

    @pytest.mark.asyncio()
    async def test_rotate_aes_keys_disabled(self, disabled_key_manager):
        """Test AES rotation when Infisical is disabled."""
        result = await disabled_key_manager.rotate_aes_keys()

        assert result["status"] == "skipped"
        assert result["reason"] == "Infisical not enabled"

    @pytest.mark.asyncio()
    async def test_migrate_keys_to_infisical_success(self, key_manager):
        """Test successful key migration to Infisical."""
        # Mock existing JWT key
        mock_jwt_key = MagicMock()
        mock_jwt_key.kid = "jwt_key_id"

        # Mock existing AES cipher
        mock_aes_cipher = MagicMock(spec=TokenCipher)
        mock_aes_cipher.active_kid = "aes_key_id"
        mock_aes_cipher._keys = {"aes_key_id": b"test_key_32_bytes_exactly_here!"}

        with (
            patch.object(
                key_manager.__class__.__bases__[0],
                "get_current_signing_key",
                return_value=mock_jwt_key,
            ),
            patch.object(TokenCipher, "from_env", return_value=mock_aes_cipher),
            patch(
                "app.infra.crypto.key_generation.Ed25519KeyGenerator.serialize_key_pair"
            ) as mock_serialize,
        ):
            mock_serialize.return_value = MagicMock(
                private_key_pem="private_pem",
                public_key_pem="public_pem",
            )

            result = await key_manager.migrate_keys_to_infisical()

            assert result["jwt_keys_migrated"] is True
            assert result["aes_keys_migrated"] is True
            assert len(result["errors"]) == 0

    @pytest.mark.asyncio()
    async def test_migrate_keys_no_existing_keys(self, key_manager):
        """Test migration when no existing keys found."""
        with (
            patch.object(
                key_manager.__class__.__bases__[0],
                "get_current_signing_key",
                side_effect=RuntimeError("No keys"),
            ),
            patch.object(TokenCipher, "from_env", side_effect=KeyError("No env keys")),
        ):
            result = await key_manager.migrate_keys_to_infisical()

            assert result["jwt_keys_migrated"] is False
            assert result["aes_keys_migrated"] is False
            assert len(result["errors"]) == 0

    @pytest.mark.asyncio()
    async def test_health_check_all_healthy(self, key_manager, mock_redis, mock_infisical_client):
        """Test health check when all systems are healthy."""
        mock_redis.get.return_value = None  # No cached health

        # Mock JWT health check
        jwt_health = {
            "current_key_valid": True,
            "next_key_valid": True,
            "cache_consistent": True,
            "issues": [],
        }

        # Mock AES cipher test
        mock_cipher = MagicMock(spec=TokenCipher)
        mock_cipher.encrypt.return_value = "encrypted"
        mock_cipher.decrypt.return_value = "health_check_test"
        mock_cipher.active_kid = "test_kid"
        mock_cipher._keys = {"test_kid": b"test_key"}

        # Mock Infisical health
        infisical_health = {"status": "healthy"}
        mock_infisical_client.health_check.return_value = infisical_health

        with (
            patch.object(
                key_manager.__class__.__bases__[0], "verify_key_integrity", return_value=jwt_health
            ),
            patch.object(key_manager, "get_token_cipher", return_value=mock_cipher),
        ):
            result = await key_manager.health_check()

            assert result["overall_status"] == "healthy"
            assert result["jwt_system"]["status"] == "healthy"
            assert result["aes_system"]["status"] == "healthy"
            assert result["infisical_connection"]["status"] == "healthy"

    @pytest.mark.asyncio()
    async def test_health_check_jwt_unhealthy(self, key_manager, mock_redis):
        """Test health check when JWT system is unhealthy."""
        # Setup Redis mock properly
        mock_redis.get = AsyncMock(return_value=None)
        mock_redis.hget = AsyncMock(return_value=None)
        mock_redis.hset = AsyncMock(return_value=True)
        mock_redis.expire = AsyncMock(return_value=True)

        # Mock unhealthy JWT system
        with patch.object(
            key_manager.__class__.__bases__[0],
            "verify_key_integrity",
            side_effect=Exception("JWT error"),
        ):
            result = await key_manager.health_check()

            assert result["overall_status"] == "unhealthy"
            assert result["jwt_system"]["status"] == "unhealthy"

    @pytest.mark.asyncio()
    async def test_health_check_cached(self, key_manager, mock_redis):
        """Test health check returns cached results."""
        cached_health = {
            "overall_status": "healthy",
            "timestamp": datetime.now(UTC).isoformat(),
        }

        mock_redis.get.return_value = json.dumps(cached_health).encode()

        result = await key_manager.health_check()

        assert result == cached_health

    @pytest.mark.asyncio()
    async def test_webhook_rotate_keys_jwt(self, key_manager):
        """Test webhook JWT key rotation."""
        webhook_data = {
            "rotation_type": "jwt",
            "force": False,
        }

        jwt_result = {"status": "success", "new_current_kid": "new_jwt_kid"}

        with patch.object(key_manager, "rotate_keys", return_value=jwt_result):
            result = await key_manager.webhook_rotate_keys(webhook_data)

            assert result["rotation_type"] == "jwt"
            assert result["results"]["jwt"] == jwt_result

    @pytest.mark.asyncio()
    async def test_webhook_rotate_keys_aes(self, key_manager):
        """Test webhook AES key rotation."""
        webhook_data = {
            "rotation_type": "aes",
            "force": True,
        }

        aes_result = {"status": "success", "new_active_kid": "new_aes_kid"}

        with patch.object(key_manager, "rotate_aes_keys", return_value=aes_result):
            result = await key_manager.webhook_rotate_keys(webhook_data)

            assert result["rotation_type"] == "aes"
            assert result["force"] is True
            assert result["results"]["aes"] == aes_result

    @pytest.mark.asyncio()
    async def test_webhook_rotate_keys_both(self, key_manager):
        """Test webhook rotation of both key types."""
        webhook_data = {
            "rotation_type": "both",
            "force": False,
        }

        jwt_result = {"status": "success"}
        aes_result = {"status": "success"}

        with (
            patch.object(key_manager, "rotate_keys", return_value=jwt_result),
            patch.object(key_manager, "rotate_aes_keys", return_value=aes_result),
        ):
            result = await key_manager.webhook_rotate_keys(webhook_data)

            assert result["results"]["jwt"] == jwt_result
            assert result["results"]["aes"] == aes_result

    @pytest.mark.asyncio()
    async def test_webhook_rotate_keys_invalid_type(self, key_manager):
        """Test webhook rotation with invalid type."""
        webhook_data = {
            "rotation_type": "invalid",
            "force": False,
        }

        result = await key_manager.webhook_rotate_keys(webhook_data)

        assert result["results"]["status"] == "error"
        assert "Invalid rotation_type" in result["results"]["error"]

    @pytest.mark.asyncio()
    async def test_initialize_aes_key_system_new(self, key_manager, mock_infisical_client):
        """Test initializing new AES key system."""
        # Mock that no existing keys found
        mock_infisical_client.fetch_secret.side_effect = SecretNotFoundError("Not found")

        await key_manager._initialize_aes_key_system()

        # Verify new keys were stored
        assert mock_infisical_client.store_secret.call_count == 2  # keys_map and active_kid

    @pytest.mark.asyncio()
    async def test_initialize_aes_key_system_existing(self, key_manager, mock_infisical_client):
        """Test initializing AES key system when keys already exist."""
        # Mock existing active_kid
        mock_infisical_client.fetch_secret.return_value = "existing_kid"

        await key_manager._initialize_aes_key_system()

        # Verify no new keys were stored
        assert mock_infisical_client.store_secret.call_count == 0

    def test_generate_key_id(self, key_manager):
        """Test key ID generation."""
        kid = key_manager._generate_key_id()

        assert kid.startswith("aes_")
        assert len(kid) == 12  # "aes_" + 8 hex chars

    def test_generate_aes_key(self, key_manager):
        """Test AES key generation."""
        key = key_manager._generate_aes_key()

        assert len(key) == 32  # 256 bits
        assert isinstance(key, bytes)

    def test_encode_decode_base64_key(self, key_manager):
        """Test base64 key encoding/decoding."""
        original_key = b"test_key_32_bytes_exactly_here!"

        encoded = key_manager._encode_base64_key(original_key)
        decoded = key_manager._decode_base64_key(encoded)

        assert decoded == original_key

    def test_serialize_deserialize_token_cipher(self, key_manager):
        """Test TokenCipher serialization/deserialization."""
        keys = {"test_kid": b"test_key_32_bytes_exactly_here!"}
        cipher = TokenCipher(keys=keys, active_kid="test_kid")

        keys_map = {"test_kid": key_manager._encode_base64_key(keys["test_kid"])}
        serialized = key_manager._serialize_token_cipher(cipher, keys_map)

        deserialized = key_manager._deserialize_token_cipher(serialized)

        assert deserialized.active_kid == cipher.active_kid
        assert deserialized._keys == cipher._keys
