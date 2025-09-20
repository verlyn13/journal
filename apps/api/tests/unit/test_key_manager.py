"""Tests for key management with rotation and overlap windows."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
import json
from unittest.mock import AsyncMock, patch

import pytest
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.domain.auth.key_manager import KeyManager, KeyMetadata, KeyStatus
from app.infra.crypto.key_generation import Ed25519KeyGenerator, KeyPair


@pytest.fixture()
def mock_session():
    """Mock AsyncSession."""
    return AsyncMock(spec=AsyncSession)


@pytest.fixture()
def mock_redis():
    """Mock Redis client."""
    mock_client = AsyncMock(spec=Redis)
    mock_client.get = AsyncMock()
    mock_client.setex = AsyncMock()
    mock_client.delete = AsyncMock()
    mock_client.scan = AsyncMock(return_value=(0, []))  # Return proper scan result
    return mock_client


@pytest.fixture()
def mock_infisical():
    """Mock Infisical client."""
    mock_client = AsyncMock()
    mock_client.fetch_secret = AsyncMock()
    mock_client.store_secret = AsyncMock()
    return mock_client


@pytest.fixture()
def key_manager(mock_session, mock_redis, mock_infisical):
    """Create KeyManager instance with mocked dependencies."""
    return KeyManager(
        session=mock_session,
        redis=mock_redis,
        infisical_client=mock_infisical,
    )


@pytest.fixture()
def sample_key_pair():
    """Generate sample key pair for testing."""
    return Ed25519KeyGenerator.generate_key_pair(kid="2025-01-15-test1234")


@pytest.fixture()
def sample_key_metadata():
    """Create sample key metadata."""
    return KeyMetadata(
        kid="2025-01-15-test1234",
        status=KeyStatus.CURRENT,
        created_at=datetime.now(UTC),
        activated_at=datetime.now(UTC),
    )


class TestKeyManager:
    """Test KeyManager core functionality."""

    def test_key_manager_initialization(self, key_manager):
        """Test KeyManager is properly initialized."""
        assert key_manager.key_ttl == KeyManager.DEFAULT_KEY_TTL
        assert key_manager.overlap_window == KeyManager.DEFAULT_OVERLAP_WINDOW
        assert key_manager.rotation_warning == KeyManager.DEFAULT_ROTATION_WARNING
        assert isinstance(key_manager.audit_service, AuditService)

    @pytest.mark.asyncio()
    async def test_initialize_key_system_first_time(self, key_manager, mock_redis):
        """Test key system initialization when no keys exist."""
        # Mock no existing current key
        mock_redis.get.return_value = None

        with (
            patch.object(key_manager, "_get_current_key_metadata") as mock_get_current,
            patch.object(
                key_manager, "_generate_and_activate_initial_key"
            ) as mock_init,
            patch.object(key_manager, "_generate_next_key") as mock_next,
        ):
            mock_get_current.return_value = None
            mock_init.return_value = Ed25519KeyGenerator.generate_key_pair()

            await key_manager.initialize_key_system()

            mock_get_current.assert_called_once()
            mock_init.assert_called_once()
            mock_next.assert_called_once()

    @pytest.mark.asyncio()
    async def test_initialize_key_system_keys_exist(
        self, key_manager, sample_key_metadata
    ):
        """Test key system initialization when keys already exist."""
        with (
            patch.object(key_manager, "_get_current_key_metadata") as mock_get_current,
            patch.object(
                key_manager, "_generate_and_activate_initial_key"
            ) as mock_init,
        ):
            mock_get_current.return_value = sample_key_metadata

            await key_manager.initialize_key_system()

            mock_get_current.assert_called_once()
            mock_init.assert_not_called()

    @pytest.mark.asyncio()
    async def test_get_current_signing_key_from_cache(
        self, key_manager, mock_redis, sample_key_pair
    ):
        """Test retrieving current signing key from cache."""
        key_material = Ed25519KeyGenerator.serialize_key_pair(sample_key_pair)

        # Mock cache hit
        mock_redis.get.return_value = key_material.private_key_pem.encode()

        with patch.object(key_manager, "_get_current_key_metadata") as mock_metadata:
            mock_metadata.return_value = KeyMetadata(
                kid=sample_key_pair.kid,
                status=KeyStatus.CURRENT,
                created_at=sample_key_pair.created_at,
                activated_at=datetime.now(UTC),
            )

            result = await key_manager.get_current_signing_key()

            assert result.kid == sample_key_pair.kid
            assert result.created_at == sample_key_pair.created_at
            mock_redis.get.assert_called_once()

    @pytest.mark.asyncio()
    async def test_get_current_signing_key_from_infisical(
        self, key_manager, mock_redis, mock_infisical, sample_key_pair
    ):
        """Test retrieving current signing key from Infisical when cache misses."""
        key_material = Ed25519KeyGenerator.serialize_key_pair(sample_key_pair)

        # Mock cache miss, Infisical hit
        mock_redis.get.return_value = None
        mock_infisical.fetch_secret.return_value = key_material.private_key_pem

        with patch.object(key_manager, "_get_current_key_metadata") as mock_metadata:
            mock_metadata.return_value = KeyMetadata(
                kid=sample_key_pair.kid,
                status=KeyStatus.CURRENT,
                created_at=sample_key_pair.created_at,
            )

            result = await key_manager.get_current_signing_key()

            assert result.kid == sample_key_pair.kid
            mock_infisical.fetch_secret.assert_called_once_with(
                "/auth/jwt/current_private_key"
            )
            mock_redis.setex.assert_called_once()

    @pytest.mark.asyncio()
    async def test_get_current_signing_key_not_found(
        self, key_manager, mock_redis, mock_infisical
    ):
        """Test error when no current signing key is available."""
        # Mock no key found anywhere
        mock_redis.get.return_value = None
        key_manager.infisical_client = None  # Simulate no Infisical client

        with pytest.raises(RuntimeError, match="No current signing key available"):
            await key_manager.get_current_signing_key()

    @pytest.mark.asyncio()
    async def test_get_verification_keys(self, key_manager, sample_key_pair):
        """Test retrieving verification keys including current and next."""
        next_key_pair = Ed25519KeyGenerator.generate_key_pair(kid="2025-02-15-next5678")

        with (
            patch.object(key_manager, "get_current_signing_key") as mock_current,
            patch.object(key_manager, "_get_next_key") as mock_next,
        ):
            mock_current.return_value = sample_key_pair
            mock_next.return_value = next_key_pair

            keys = await key_manager.get_verification_keys()

            assert len(keys) == 2
            assert keys[0].kid == sample_key_pair.kid
            assert keys[1].kid == next_key_pair.kid

    @pytest.mark.asyncio()
    async def test_get_verification_keys_current_only(
        self, key_manager, sample_key_pair
    ):
        """Test retrieving verification keys when only current key exists."""
        with (
            patch.object(key_manager, "get_current_signing_key") as mock_current,
            patch.object(key_manager, "_get_next_key") as mock_next,
        ):
            mock_current.return_value = sample_key_pair
            mock_next.return_value = None

            keys = await key_manager.get_verification_keys()

            assert len(keys) == 1
            assert keys[0].kid == sample_key_pair.kid


class TestKeyRotation:
    """Test key rotation functionality."""

    @pytest.mark.asyncio()
    async def test_check_rotation_needed_no_key(self, key_manager):
        """Test rotation check when no current key exists."""
        with patch.object(key_manager, "_get_current_key_metadata") as mock_metadata:
            mock_metadata.return_value = None

            needs_rotation, reason = await key_manager.check_rotation_needed()

            assert needs_rotation is True
            assert "No current key exists" in reason

    @pytest.mark.asyncio()
    async def test_check_rotation_needed_expired_key(self, key_manager):
        """Test rotation check for expired key."""
        old_metadata = KeyMetadata(
            kid="old-key-123",
            status=KeyStatus.CURRENT,
            created_at=datetime.now(UTC)
            - timedelta(days=90),  # Older than DEFAULT_KEY_TTL
            activated_at=datetime.now(UTC) - timedelta(days=90),
        )

        with patch.object(key_manager, "_get_current_key_metadata") as mock_metadata:
            mock_metadata.return_value = old_metadata

            needs_rotation, reason = await key_manager.check_rotation_needed()

            assert needs_rotation is True
            assert "expired" in reason.lower()

    @pytest.mark.asyncio()
    async def test_check_rotation_needed_warning_window(self, key_manager):
        """Test rotation check when in warning window."""
        warning_metadata = KeyMetadata(
            kid="warning-key-123",
            status=KeyStatus.CURRENT,
            created_at=datetime.now(UTC) - timedelta(days=55),  # Within warning window
            activated_at=datetime.now(UTC) - timedelta(days=55),
        )

        with patch.object(key_manager, "_get_current_key_metadata") as mock_metadata:
            mock_metadata.return_value = warning_metadata

            needs_rotation, reason = await key_manager.check_rotation_needed()

            assert needs_rotation is True
            assert "approaching rotation" in reason.lower()

    @pytest.mark.asyncio()
    async def test_check_rotation_needed_not_needed(self, key_manager):
        """Test rotation check when rotation is not needed."""
        fresh_metadata = KeyMetadata(
            kid="fresh-key-123",
            status=KeyStatus.CURRENT,
            created_at=datetime.now(UTC) - timedelta(days=10),  # Fresh key
            activated_at=datetime.now(UTC) - timedelta(days=10),
        )

        with patch.object(key_manager, "_get_current_key_metadata") as mock_metadata:
            mock_metadata.return_value = fresh_metadata

            needs_rotation, reason = await key_manager.check_rotation_needed()

            assert needs_rotation is False
            assert "not needed" in reason.lower()

    @pytest.mark.asyncio()
    async def test_rotate_keys_success(self, key_manager, sample_key_pair):
        """Test successful key rotation."""
        next_key = Ed25519KeyGenerator.generate_key_pair(kid="next-key-123")

        with (
            patch.object(key_manager, "check_rotation_needed") as mock_check,
            patch.object(key_manager, "_get_next_key") as mock_get_next,
            patch.object(key_manager, "_generate_next_key") as mock_gen_next,
            patch.object(key_manager, "_promote_next_to_current") as mock_promote,
            patch.object(key_manager, "_invalidate_key_caches") as mock_invalidate,
            patch.object(key_manager, "_get_retiring_key_id") as mock_retiring,
            patch.object(key_manager.audit_service, "log_event") as mock_audit,
        ):
            mock_check.return_value = (True, "rotation needed")
            mock_get_next.return_value = next_key
            mock_retiring.return_value = "old-key-123"

            result = await key_manager.rotate_keys()

            assert result["status"] == "success"
            assert result["new_current_kid"] == next_key.kid
            mock_promote.assert_called_once()
            mock_gen_next.assert_called_once()
            mock_invalidate.assert_called_once()
            mock_audit.assert_called()

    @pytest.mark.asyncio()
    async def test_rotate_keys_force(self, key_manager, sample_key_pair):
        """Test forced key rotation."""
        next_key = Ed25519KeyGenerator.generate_key_pair(kid="next-key-123")

        with (
            patch.object(key_manager, "check_rotation_needed") as mock_check,
            patch.object(key_manager, "_get_next_key") as mock_get_next,
            patch.object(key_manager, "_promote_next_to_current") as mock_promote,
            patch.object(key_manager, "_generate_next_key"),
            patch.object(key_manager, "_invalidate_key_caches"),
            patch.object(key_manager.audit_service, "log_event"),
        ):
            mock_get_next.return_value = next_key

            result = await key_manager.rotate_keys(force=True)

            assert result["status"] == "success"
            mock_check.assert_not_called()  # Should skip check when forced
            mock_promote.assert_called_once()

    @pytest.mark.asyncio()
    async def test_rotate_keys_skipped(self, key_manager):
        """Test key rotation skipped when not needed."""
        with patch.object(key_manager, "check_rotation_needed") as mock_check:
            mock_check.return_value = (False, "rotation not needed")

            result = await key_manager.rotate_keys()

            assert result["status"] == "skipped"
            assert "not needed" in result["reason"]

    @pytest.mark.asyncio()
    async def test_rotate_keys_failure(self, key_manager):
        """Test key rotation failure handling."""
        with (
            patch.object(key_manager, "check_rotation_needed") as mock_check,
            patch.object(key_manager, "_get_next_key") as mock_get_next,
            patch.object(key_manager.audit_service, "log_event") as mock_audit,
        ):
            mock_check.return_value = (True, "rotation needed")
            mock_get_next.side_effect = Exception("Infisical error")

            with pytest.raises(RuntimeError, match="Key rotation failed"):
                await key_manager.rotate_keys()

            # Should log failure
            mock_audit.assert_called()
            audit_call = mock_audit.call_args[1]
            assert audit_call["event_type"] == "key_rotation_failed"


class TestKeyMetadata:
    """Test KeyMetadata class functionality."""

    def test_key_metadata_creation(self):
        """Test KeyMetadata creation."""
        now = datetime.now(UTC)
        metadata = KeyMetadata(
            kid="test-key-123",
            status=KeyStatus.CURRENT,
            created_at=now,
            activated_at=now,
        )

        assert metadata.kid == "test-key-123"
        assert metadata.status == KeyStatus.CURRENT
        assert metadata.created_at == now
        assert metadata.activated_at == now

    def test_key_metadata_to_dict(self):
        """Test KeyMetadata serialization to dictionary."""
        now = datetime.now(UTC)
        metadata = KeyMetadata(
            kid="test-key-123",
            status=KeyStatus.CURRENT,
            created_at=now,
            activated_at=now,
            expires_at=now + timedelta(days=60),
        )

        data = metadata.to_dict()

        assert data["kid"] == "test-key-123"
        assert data["status"] == "current"
        assert data["created_at"] == now.isoformat()
        assert data["activated_at"] == now.isoformat()
        assert data["expires_at"] == (now + timedelta(days=60)).isoformat()

    def test_key_metadata_from_dict(self):
        """Test KeyMetadata deserialization from dictionary."""
        now = datetime.now(UTC)
        data = {
            "kid": "test-key-123",
            "status": "current",
            "created_at": now.isoformat(),
            "activated_at": now.isoformat(),
            "expires_at": (now + timedelta(days=60)).isoformat(),
        }

        metadata = KeyMetadata.from_dict(data)

        assert metadata.kid == "test-key-123"
        assert metadata.status == KeyStatus.CURRENT
        assert metadata.created_at == now
        assert metadata.activated_at == now
        assert metadata.expires_at == now + timedelta(days=60)

    def test_key_metadata_from_dict_partial(self):
        """Test KeyMetadata deserialization with optional fields."""
        now = datetime.now(UTC)
        data = {
            "kid": "test-key-123",
            "status": "pending",
            "created_at": now.isoformat(),
            "activated_at": None,
            "expires_at": None,
        }

        metadata = KeyMetadata.from_dict(data)

        assert metadata.kid == "test-key-123"
        assert metadata.status == KeyStatus.PENDING
        assert metadata.activated_at is None
        assert metadata.expires_at is None


class TestKeyIntegrity:
    """Test key integrity verification."""

    @pytest.mark.asyncio()
    async def test_verify_key_integrity_success(
        self, key_manager, sample_key_pair, mock_redis, mock_infisical
    ):
        """Test successful key integrity verification."""
        key_material = Ed25519KeyGenerator.serialize_key_pair(sample_key_pair)
        next_key = Ed25519KeyGenerator.generate_key_pair(kid="next-key-123")

        # Mock current key retrieval
        with (
            patch.object(key_manager, "get_current_signing_key") as mock_current,
            patch.object(key_manager, "_get_next_key") as mock_next,
        ):
            mock_current.return_value = sample_key_pair
            mock_next.return_value = next_key
            mock_redis.get.return_value = key_material.private_key_pem.encode()
            mock_infisical.fetch_secret.return_value = key_material.private_key_pem

            result = await key_manager.verify_key_integrity()

            assert result["current_key_valid"] is True
            assert result["next_key_valid"] is True
            assert result["cache_consistent"] is True
            assert len(result["issues"]) == 0

    @pytest.mark.asyncio()
    async def test_verify_key_integrity_current_key_invalid(self, key_manager):
        """Test integrity verification with invalid current key."""
        with patch.object(key_manager, "get_current_signing_key") as mock_current:
            mock_current.side_effect = RuntimeError("Key error")

            result = await key_manager.verify_key_integrity()

            assert result["current_key_valid"] is False
            assert "Current key invalid" in result["issues"][0]

    @pytest.mark.asyncio()
    async def test_verify_key_integrity_next_key_invalid(
        self, key_manager, sample_key_pair
    ):
        """Test integrity verification with invalid next key."""
        with (
            patch.object(key_manager, "get_current_signing_key") as mock_current,
            patch.object(key_manager, "_get_next_key") as mock_next,
        ):
            mock_current.return_value = sample_key_pair
            mock_next.return_value = None

            result = await key_manager.verify_key_integrity()

            assert result["next_key_valid"] is False
            assert "No next key available" in result["issues"]

    @pytest.mark.asyncio()
    async def test_verify_key_integrity_cache_inconsistent(
        self, key_manager, sample_key_pair, mock_redis, mock_infisical
    ):
        """Test integrity verification with cache inconsistency."""
        key_material = Ed25519KeyGenerator.serialize_key_pair(sample_key_pair)

        with patch.object(key_manager, "get_current_signing_key") as mock_current:
            mock_current.return_value = sample_key_pair
            mock_redis.get.return_value = b"different_key"
            mock_infisical.fetch_secret.return_value = key_material.private_key_pem

            result = await key_manager.verify_key_integrity()

            assert result["cache_consistent"] is False


class TestKeyManagerInternalMethods:
    """Test internal methods of KeyManager."""

    @pytest.mark.asyncio()
    async def test_store_key_metadata(
        self, key_manager, mock_redis, sample_key_metadata
    ):
        """Test storing key metadata in Redis."""
        await key_manager._store_key_metadata(sample_key_metadata)

        expected_key = f"auth:keys:metadata:{sample_key_metadata.status.value}"
        mock_redis.setex.assert_called_once()
        call_args = mock_redis.setex.call_args
        assert call_args[0][0] == expected_key
        assert call_args[0][1] == 86400  # 24 hour TTL

    @pytest.mark.asyncio()
    async def test_get_key_metadata_by_status(
        self, key_manager, mock_redis, sample_key_metadata
    ):
        """Test retrieving key metadata by status."""
        metadata_dict = sample_key_metadata.to_dict()
        mock_redis.get.return_value = json.dumps(metadata_dict).encode()

        result = await key_manager._get_key_metadata_by_status(KeyStatus.CURRENT)

        assert result is not None
        assert result.kid == sample_key_metadata.kid
        assert result.status == sample_key_metadata.status

    @pytest.mark.asyncio()
    async def test_get_key_metadata_by_status_not_found(self, key_manager, mock_redis):
        """Test retrieving key metadata when not found."""
        mock_redis.get.return_value = None

        result = await key_manager._get_key_metadata_by_status(KeyStatus.CURRENT)

        assert result is None

    @pytest.mark.asyncio()
    async def test_invalidate_key_caches(self, key_manager, mock_redis):
        """Test invalidating all key-related caches."""
        # Mock scan for pattern matching
        mock_redis.scan.return_value = (
            0,
            [b"auth:keys:metadata:current", b"auth:keys:metadata:next"],
        )

        await key_manager._invalidate_key_caches()

        # Should delete pattern-matched keys and direct keys
        assert mock_redis.scan.called
        assert mock_redis.delete.called

    @pytest.mark.asyncio()
    async def test_generate_and_activate_initial_key(self, key_manager, mock_infisical):
        """Test generating and activating initial key."""
        with (
            patch.object(key_manager, "_store_key_metadata") as mock_store,
            patch.object(key_manager.audit_service, "log_event") as mock_audit,
        ):
            result = await key_manager._generate_and_activate_initial_key()

            assert isinstance(result, KeyPair)
            mock_infisical.store_secret.assert_called_once()
            mock_store.assert_called_once()
            mock_audit.assert_called_once()

    @pytest.mark.asyncio()
    async def test_promote_next_to_current(
        self, key_manager, mock_infisical, sample_key_metadata
    ):
        """Test promoting next key to current."""
        key_material = Ed25519KeyGenerator.serialize_key_pair(
            Ed25519KeyGenerator.generate_key_pair()
        )

        mock_infisical.fetch_secret.return_value = key_material.private_key_pem

        with (
            patch.object(key_manager, "_get_next_key_metadata") as mock_next_meta,
            patch.object(key_manager, "_store_key_metadata") as mock_store,
        ):
            next_metadata = KeyMetadata(
                kid="next-key-123",
                status=KeyStatus.NEXT,
                created_at=datetime.now(UTC),
            )
            mock_next_meta.return_value = next_metadata

            await key_manager._promote_next_to_current()

            mock_infisical.fetch_secret.assert_called_with("/auth/jwt/next_private_key")
            mock_infisical.store_secret.assert_called_with(
                "/auth/jwt/current_private_key", key_material.private_key_pem
            )
            mock_store.assert_called_once()


class TestPerformanceRequirements:
    """Test performance requirements for key operations."""

    @pytest.mark.asyncio()
    async def test_key_generation_performance(self):
        """Test key generation meets <10ms requirement."""
        import time

        start_time = time.time()
        for _ in range(10):  # Generate multiple keys
            Ed25519KeyGenerator.generate_key_pair()
        end_time = time.time()

        avg_time = ((end_time - start_time) / 10) * 1000  # Convert to ms
        assert avg_time < 10, (
            f"Average key generation time {avg_time:.2f}ms exceeds 10ms limit"
        )

    @pytest.mark.asyncio()
    async def test_verification_performance(self, sample_key_pair):
        """Test verification meets <1ms requirement."""
        import time

        test_message = b"performance_test_message"
        signature = sample_key_pair.private_key.sign(test_message)

        start_time = time.time()
        for _ in range(100):  # Verify multiple times
            sample_key_pair.public_key.verify(signature, test_message)
        end_time = time.time()

        avg_time = ((end_time - start_time) / 100) * 1000  # Convert to ms
        assert avg_time < 1, (
            f"Average verification time {avg_time:.2f}ms exceeds 1ms limit"
        )

    @pytest.mark.asyncio()
    async def test_serialization_performance(self, sample_key_pair):
        """Test key serialization performance."""
        import time

        start_time = time.time()
        for _ in range(100):
            Ed25519KeyGenerator.serialize_key_pair(sample_key_pair)
        end_time = time.time()

        avg_time = ((end_time - start_time) / 100) * 1000  # Convert to ms
        assert avg_time < 5, (
            f"Average serialization time {avg_time:.2f}ms exceeds 5ms limit"
        )


class TestKeyStatus:
    """Test KeyStatus enum functionality."""

    def test_key_status_values(self):
        """Test all key status values."""
        assert KeyStatus.PENDING.value == "pending"
        assert KeyStatus.CURRENT.value == "current"
        assert KeyStatus.NEXT.value == "next"
        assert KeyStatus.RETIRING.value == "retiring"
        assert KeyStatus.RETIRED.value == "retired"

    def test_key_status_enum_membership(self):
        """Test key status enum membership."""
        all_statuses = list(KeyStatus)
        expected_statuses = [
            KeyStatus.PENDING,
            KeyStatus.CURRENT,
            KeyStatus.NEXT,
            KeyStatus.RETIRING,
            KeyStatus.RETIRED,
        ]

        assert len(all_statuses) == len(expected_statuses)
        assert all(status in all_statuses for status in expected_statuses)
