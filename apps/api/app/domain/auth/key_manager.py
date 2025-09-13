"""Key management with automatic rotation and overlap windows."""

from __future__ import annotations

import asyncio  # noqa: F401 - used in exception handling
import json
import logging

from datetime import UTC, datetime, timedelta
from enum import Enum
from typing import Any, Protocol, cast
from uuid import UUID

from redis.asyncio import Redis
from redis.exceptions import RedisError
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.infra.crypto.key_generation import Ed25519KeyGenerator, KeyPair


logger = logging.getLogger(__name__)


class SecretsClient(Protocol):
    """Protocol for secrets storage client."""

    async def fetch_secret(self, path: str) -> str:
        """Fetch a secret from the storage."""
        ...

    async def store_secret(self, path: str, value: str) -> None:
        """Store a secret in the storage."""
        ...


class KeyStatus(Enum):
    """Key status in rotation lifecycle."""

    PENDING = "pending"  # Generated but not active
    CURRENT = "current"  # Currently signing tokens
    NEXT = "next"  # Published in JWKS but not signing
    RETIRING = "retiring"  # In overlap window, verifying only
    RETIRED = "retired"  # No longer used


class KeyMetadata:
    """Key metadata for rotation management."""

    def __init__(
        self,
        kid: str,
        status: KeyStatus,
        created_at: datetime,
        activated_at: datetime | None = None,
        expires_at: datetime | None = None,
    ) -> None:
        self.kid = kid
        self.status = status
        self.created_at = created_at
        self.activated_at = activated_at
        self.expires_at = expires_at

    def to_dict(self) -> dict[str, str | None]:
        """Convert to dictionary for storage."""
        return {
            "kid": self.kid,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "activated_at": self.activated_at.isoformat() if self.activated_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }

    @classmethod
    def from_dict(cls, data: dict[str, str | None]) -> KeyMetadata:
        """Create from dictionary."""
        # Find the enum member by value
        status = next(member for member in KeyStatus if member.value == data["status"])

        # Validate required fields
        kid = data.get("kid")
        if not isinstance(kid, str):
            raise TypeError("kid missing or not a string")

        created_at_raw = data.get("created_at")
        if not isinstance(created_at_raw, str):
            raise TypeError("created_at missing or not a string")

        activated_at_raw = data.get("activated_at")

        return cls(
            kid=kid,
            status=status,
            created_at=datetime.fromisoformat(created_at_raw),
            activated_at=(
                datetime.fromisoformat(activated_at_raw) if isinstance(activated_at_raw, str) else None
            ),
            expires_at=(datetime.fromisoformat(data["expires_at"]) if data["expires_at"] else None),
        )


class KeyManager:
    """Manages JWT signing keys with automatic rotation and overlap windows."""

    # Default rotation settings
    DEFAULT_KEY_TTL = timedelta(days=60)  # 60-day key lifetime
    DEFAULT_OVERLAP_WINDOW = timedelta(minutes=20)  # 20-minute overlap
    DEFAULT_ROTATION_WARNING = timedelta(days=7)  # Warn 7 days before rotation

    def __init__(
        self,
        session: AsyncSession,
        redis: Redis,
        infisical_client: SecretsClient | None = None,
    ) -> None:
        self.session = session
        self.redis = redis
        self.infisical_client = infisical_client
        self.audit_service = AuditService(session)

        # Configuration
        self.key_ttl = self.DEFAULT_KEY_TTL
        self.overlap_window = self.DEFAULT_OVERLAP_WINDOW
        self.rotation_warning = self.DEFAULT_ROTATION_WARNING

        # Cache keys
        self._current_key_cache = "auth:keys:current"
        self._next_key_cache = "auth:keys:next"
        self._key_metadata_cache = "auth:keys:metadata"
        self._retiring_key_cache = "auth:keys:retiring_pem"

    async def initialize_key_system(self) -> None:
        """Initialize the key management system.

        Creates initial key pair if none exists.
        """
        current_key = await self._get_current_key_metadata()
        if current_key is None:
            # First-time setup - generate initial key
            await self._generate_and_activate_initial_key()

            # Pre-generate next key for rotation readiness
            await self._generate_next_key()

    async def get_current_signing_key(self) -> KeyPair:
        """Get the current key for JWT signing.

        Returns:
            Current signing key pair

        Raises:
            RuntimeError: If no current key exists
        """
        # Try cache first
        cached_pem = await self.redis.get(self._current_key_cache)
        if isinstance(cached_pem, (bytes, bytearray, str)) and cached_pem:
            try:
                pem_text = cached_pem.decode() if isinstance(cached_pem, (bytes, bytearray)) else cached_pem
                private_key = Ed25519KeyGenerator.load_private_key_from_pem(pem_text)
                metadata = await self._get_current_key_metadata()
                if metadata:
                    return KeyPair(
                        private_key=private_key,
                        public_key=private_key.public_key(),
                        kid=metadata.kid,
                        created_at=metadata.created_at,
                    )
            except (json.JSONDecodeError, KeyError) as e:
                # Cache corrupt, fall through to reload
                logger.debug("Cache read failed, will reload: %s", e)

        # Load from Infisical and cache
        if self.infisical_client:
            try:
                current_pem = await self.infisical_client.fetch_secret(
                    "/auth/jwt/current_private_key"
                )
                # Cache for 10 minutes
                await self.redis.setex(self._current_key_cache, 600, current_pem)

                private_key = Ed25519KeyGenerator.load_private_key_from_pem(current_pem)
                metadata = await self._get_current_key_metadata()
                if metadata:
                    return KeyPair(
                        private_key=private_key,
                        public_key=private_key.public_key(),
                        kid=metadata.kid,
                        created_at=metadata.created_at,
                    )
            except (ValueError, KeyError, TypeError) as e:
                raise RuntimeError(f"Failed to load current signing key: {e}") from e

        raise RuntimeError("No current signing key available")

    async def get_verification_keys(self) -> list[KeyPair]:
        """Get all keys that should be used for token verification.

        Returns keys in JWKS (current + next during overlap).

        Returns:
            List of verification keys
        """
        keys = []

        # Always include current key
        try:
            current_key = await self.get_current_signing_key()
            keys.append(current_key)
        except RuntimeError:
            pass  # No current key available

        # Include next key if it exists (for overlap window)
        try:
            next_key = await self._get_next_key()
            if next_key:
                keys.append(next_key)
        except (ValueError, KeyError) as e:
            # Next key not available - this is expected during initial setup
            logger.debug("Next key not available: %s", e)

        # Include retiring key if present within overlap window
        try:
            retiring_pem = await self.redis.get(self._retiring_key_cache)
            if isinstance(retiring_pem, (bytes, bytearray, str)) and retiring_pem:
                retiring_meta = await self._get_retiring_key_metadata()
                if retiring_meta:
                    pem_text = retiring_pem.decode() if isinstance(retiring_pem, (bytes, bytearray)) else retiring_pem
                    priv = Ed25519KeyGenerator.load_private_key_from_pem(pem_text)
                    keys.append(
                        KeyPair(
                            private_key=priv,
                            public_key=priv.public_key(),
                            kid=retiring_meta.kid,
                            created_at=retiring_meta.created_at,
                        )
                    )
        except Exception as e:  # noqa: BLE001 - non-critical path
            logger.debug("Retiring key not available: %s", e)

        return keys

    async def check_rotation_needed(self) -> tuple[bool, str]:
        """Check if key rotation is needed.

        Returns:
            Tuple of (needs_rotation, reason)
        """
        current_metadata = await self._get_current_key_metadata()
        if not current_metadata:
            return True, "No current key exists"

        # Check if current key is expired
        age = datetime.now(UTC) - current_metadata.created_at
        if age >= self.key_ttl:
            return True, f"Current key expired ({age.days} days old)"

        # Check if we're in the rotation warning window
        time_until_rotation = self.key_ttl - age
        if time_until_rotation <= self.rotation_warning:
            return True, f"Approaching rotation ({time_until_rotation.days} days left)"

        return False, "Key rotation not needed"

    async def rotate_keys(self, force: bool = False) -> dict[str, Any]:
        """Perform key rotation with overlap window.

        Args:
            force: Force rotation even if not needed

        Returns:
            Rotation result summary

        Raises:
            RuntimeError: If rotation fails
        """
        if not force:
            needs_rotation, reason = await self.check_rotation_needed()
            if not needs_rotation:
                return {"status": "skipped", "reason": reason}

        try:
            # Step 1: Ensure next key exists
            next_key = await self._get_next_key()
            if not next_key:
                await self._generate_next_key()
                next_key = await self._get_next_key()
                if not next_key:
                    raise RuntimeError("Failed to generate next key")

            # Step 2: Promote next key to current
            await self._promote_next_to_current()

            # Step 3: Generate new next key
            await self._generate_next_key()

            # Step 4: Update caches
            await self._invalidate_key_caches()

            # Step 5: Log rotation event
            await self.audit_service.log_event(
                user_id=UUID("00000000-0000-0000-0000-000000000000"),  # System user
                event_type="key_rotated",
                event_data={
                    "old_kid": self._get_retiring_key_id(),
                    "new_kid": next_key.kid,
                    "rotation_method": "automatic" if not force else "forced",
                },
            )

            return {
                "status": "success",
                "new_current_kid": next_key.kid,
                "overlap_window_minutes": self.overlap_window.total_seconds() / 60,
            }

        except (ValueError, TypeError, KeyError) as e:
            await self.audit_service.log_event(
                user_id=UUID("00000000-0000-0000-0000-000000000000"),
                event_type="key_rotation_failed",
                event_data={"error": str(e), "forced": force},
            )
            raise RuntimeError(f"Key rotation failed: {e}") from e

    async def verify_key_integrity(self) -> dict[str, Any]:
        """Verify the integrity of the key system.

        Returns:
            Integrity check results
        """
        results: dict[str, Any] = {
            "current_key_valid": False,
            "next_key_valid": False,
            "keys_synchronized": False,
            "cache_consistent": False,
            "issues": [],
        }
        issues: list[str] = cast("list[str]", results["issues"])

        # Check current key
        try:
            current_key = await self.get_current_signing_key()
            # Test signing operation
            test_data = b"integrity_test"
            signature = current_key.private_key.sign(test_data)
            current_key.public_key.verify(signature, test_data)
            results["current_key_valid"] = True
        except (ValueError, TypeError) as e:
            issues.append(f"Current key invalid: {e}")

        # Check next key
        try:
            next_key = await self._get_next_key()
            if next_key:
                # Test key pair validity
                if Ed25519KeyGenerator.verify_key_pair(next_key.private_key, next_key.public_key):
                    results["next_key_valid"] = True
                else:
                    issues.append("Next key pair mismatch")
            else:
                issues.append("No next key available")
        except (ValueError, TypeError, KeyError) as e:
            issues.append(f"Next key error: {e}")

        # Check cache consistency
        try:
            cached_current = await self.redis.get(self._current_key_cache)
            if self.infisical_client:
                stored_current = await self.infisical_client.fetch_secret(
                    "/auth/jwt/current_private_key"
                )
                results["cache_consistent"] = (
                    cached_current.decode() == stored_current if cached_current else False
                )
        except (RedisError, asyncio.TimeoutError, ValueError) as e:
            issues.append(f"Cache consistency error: {e}")

        return results

    async def _generate_and_activate_initial_key(self) -> KeyPair:
        """Generate and activate the first key in the system."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        # Store in Infisical
        if self.infisical_client:
            await self.infisical_client.store_secret(
                "/auth/jwt/current_private_key", key_material.private_key_pem
            )

        # Update metadata
        metadata = KeyMetadata(
            kid=key_pair.kid,
            status=KeyStatus.CURRENT,
            created_at=key_pair.created_at,
            activated_at=datetime.now(UTC),
        )
        await self._store_key_metadata(metadata)

        # Log creation
        await self.audit_service.log_event(
            user_id=UUID("00000000-0000-0000-0000-000000000000"),
            event_type="initial_key_generated",
            event_data={"kid": key_pair.kid},
        )

        return key_pair

    async def _generate_next_key(self) -> KeyPair:
        """Generate the next key for rotation."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        # Store in Infisical
        if self.infisical_client:
            await self.infisical_client.store_secret(
                "/auth/jwt/next_private_key", key_material.private_key_pem
            )

        # Update metadata
        metadata = KeyMetadata(
            kid=key_pair.kid,
            status=KeyStatus.NEXT,
            created_at=key_pair.created_at,
        )
        await self._store_key_metadata(metadata)

        return key_pair

    async def _get_next_key(self) -> KeyPair | None:
        """Get the next key for rotation."""
        if not self.infisical_client:
            return None

        try:
            next_pem = await self.infisical_client.fetch_secret("/auth/jwt/next_private_key")
            private_key = Ed25519KeyGenerator.load_private_key_from_pem(next_pem)
            metadata = await self._get_next_key_metadata()

            if metadata:
                return KeyPair(
                    private_key=private_key,
                    public_key=private_key.public_key(),
                    kid=metadata.kid,
                    created_at=metadata.created_at,
                )
        except (ValueError, KeyError, TypeError) as e:
            # Key fetch failed, return None
            logger.debug("Key fetch failed: %s", e)

        return None

    async def _promote_next_to_current(self) -> None:
        """Promote next key to current key."""
        if not self.infisical_client:
            raise RuntimeError("Infisical client required for key promotion")

        # Cache retiring key material and metadata for overlap window
        try:
            current_pem = await self.infisical_client.fetch_secret("/auth/jwt/current_private_key")
            current_meta = await self._get_current_key_metadata()
            if current_meta:
                # store metadata as retiring with short TTL via Redis directly
                await self._store_key_metadata_with_ttl(current_meta, KeyStatus.RETIRING, int(self.overlap_window.total_seconds()))
            await self.redis.setex(self._retiring_key_cache, int(self.overlap_window.total_seconds()), current_pem)
        except (RuntimeError, RedisError, asyncio.TimeoutError) as e:
            # If this fails, rotation still proceeds; overlap just won't include retiring
            logger.debug("Could not cache retiring key: %s", e)

        # Get next key
        next_pem = await self.infisical_client.fetch_secret("/auth/jwt/next_private_key")

        # Promote to current
        await self.infisical_client.store_secret("/auth/jwt/current_private_key", next_pem)

        # Update metadata
        next_metadata = await self._get_next_key_metadata()
        if next_metadata:
            next_metadata.status = KeyStatus.CURRENT
            next_metadata.activated_at = datetime.now(UTC)
            await self._store_key_metadata(next_metadata)

    async def _get_current_key_metadata(self) -> KeyMetadata | None:
        """Get metadata for current key."""
        return await self._get_key_metadata_by_status(KeyStatus.CURRENT)

    async def _get_next_key_metadata(self) -> KeyMetadata | None:
        """Get metadata for next key."""
        return await self._get_key_metadata_by_status(KeyStatus.NEXT)

    async def _get_retiring_key_metadata(self) -> KeyMetadata | None:
        """Get metadata for retiring key."""
        return await self._get_key_metadata_by_status(KeyStatus.RETIRING)

    async def _get_key_metadata_by_status(self, status: KeyStatus) -> KeyMetadata | None:
        """Get key metadata by status."""
        # This would typically query a database or cache
        # For now, we'll use Redis as a simple store
        key = f"{self._key_metadata_cache}:{status.value}"
        data = await self.redis.get(key)
        if data:
            try:
                metadata_dict = json.loads(data.decode())
                return KeyMetadata.from_dict(metadata_dict)
            except (json.JSONDecodeError, KeyError, TypeError) as e:
                # Invalid metadata in cache, return None to regenerate
                logger.debug("Invalid metadata in cache: %s", e)
        return None

    async def _store_key_metadata(self, metadata: KeyMetadata) -> None:
        """Store key metadata."""
        key = f"{self._key_metadata_cache}:{metadata.status.value}"
        data = json.dumps(metadata.to_dict())
        await self.redis.setex(key, 86400, data)  # 24 hour TTL

    async def _store_key_metadata_with_ttl(self, metadata: KeyMetadata, status: KeyStatus, ttl_seconds: int) -> None:
        """Store metadata with a custom TTL and status."""
        clone = KeyMetadata(
            kid=metadata.kid,
            status=status,
            created_at=metadata.created_at,
            activated_at=metadata.activated_at,
            expires_at=metadata.expires_at,
        )
        key = f"{self._key_metadata_cache}:{status.value}"
        data = json.dumps(clone.to_dict())
        await self.redis.setex(key, ttl_seconds, data)

    async def _invalidate_key_caches(self) -> None:
        """Invalidate all key-related caches."""
        # Do not delete retiring metadata or retiring pem; preserve overlap window
        keys_to_delete = [
            self._current_key_cache,
            self._next_key_cache,
        ]

        for key_pattern in keys_to_delete:
            await self.redis.delete(key_pattern)

    @staticmethod
    def _get_retiring_key_id() -> str | None:
        """Get the key ID that's being retired."""
        # This would track the previously current key
        # Implementation depends on metadata storage strategy
        return None
