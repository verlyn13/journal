"""Simple key manager for development without Infisical dependency."""

from __future__ import annotations

from datetime import UTC, datetime
import logging
import os
from typing import Any, cast
from uuid import UUID

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.key_manager import KeyManager, KeyMetadata, KeyStatus
from app.infra.crypto.key_generation import Ed25519KeyGenerator, KeyPair


logger = logging.getLogger(__name__)


class SimpleKeyManager(KeyManager):
    """Simplified key manager for development without Infisical.

    Uses environment variables or generates keys on startup.
    Suitable for development and testing environments.
    """

    def __init__(
        self,
        session: AsyncSession,
        redis: Redis,
    ) -> None:
        # Don't pass infisical_client to parent
        super().__init__(session, redis, infisical_client=None)

        # Override cache keys for simple manager
        self._current_key_cache = "auth:keys:simple:current"
        self._next_key_cache = "auth:keys:simple:next"
        self._key_metadata_cache = "auth:keys:simple:metadata"
        self._retiring_key_cache = "auth:keys:simple:retiring_pem"

        # Runtime key storage (non-persistent)
        self._runtime_current_key: KeyPair | None = None
        self._runtime_next_key: KeyPair | None = None

    async def initialize_key_system(self) -> None:
        """Initialize the key management system for development.

        Creates initial key pair if none exists, using environment variables
        or generating new keys for the session.
        """
        current_key = await self._get_current_key_metadata()
        if current_key is None:
            # Check if we have a key in environment variables
            env_key_pem = os.getenv("JOURNAL_JWT_PRIVATE_KEY_PEM")

            if env_key_pem:
                # Use key from environment
                try:
                    private_key = Ed25519KeyGenerator.load_private_key_from_pem(env_key_pem)
                    kid = os.getenv("JOURNAL_JWT_KEY_ID") or Ed25519KeyGenerator._generate_kid()

                    self._runtime_current_key = KeyPair(
                        private_key=private_key,
                        public_key=private_key.public_key(),
                        kid=kid,
                        created_at=datetime.now(UTC),
                    )

                    # Store metadata
                    metadata = KeyMetadata(
                        kid=kid,
                        status=KeyStatus.CURRENT,
                        created_at=self._runtime_current_key.created_at,
                        activated_at=datetime.now(UTC),
                    )
                    await self._store_key_metadata(metadata)

                    logger.info("Loaded JWT key from environment variable")

                except Exception as e:
                    logger.warning("Failed to load key from environment: %s", e)
                    await self._generate_and_activate_initial_key()
            else:
                # Generate new key for this session
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
        # Try runtime storage first
        if self._runtime_current_key:
            return self._runtime_current_key

        # Try cache
        cached_pem = await self.redis.get(self._current_key_cache)
        if isinstance(cached_pem, (bytes, bytearray, str)) and cached_pem:
            try:
                pem_text = (
                    cached_pem.decode()
                    if isinstance(cached_pem, (bytes, bytearray))
                    else cached_pem
                )
                private_key = Ed25519KeyGenerator.load_private_key_from_pem(pem_text)
                metadata = await self._get_current_key_metadata()
                if metadata:
                    return KeyPair(
                        private_key=private_key,
                        public_key=private_key.public_key(),
                        kid=metadata.kid,
                        created_at=metadata.created_at,
                    )
            except Exception as e:
                logger.debug("Cache read failed, will regenerate: %s", e)

        # Generate new key if none exists
        logger.warning("No current key found, generating new key")
        await self.initialize_key_system()

        if self._runtime_current_key:
            return self._runtime_current_key

        raise RuntimeError("Failed to generate current signing key")

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
            logger.warning("No current key available for verification")

        # Include next key if it exists (for overlap window)
        try:
            next_key = await self._get_next_key()
            if next_key:
                keys.append(next_key)
        except Exception as e:
            logger.debug("Next key not available: %s", e)

        # Include retiring key if present within overlap window
        try:
            retiring_pem = await self.redis.get(self._retiring_key_cache)
            if isinstance(retiring_pem, (bytes, bytearray, str)) and retiring_pem:
                retiring_meta = await self._get_retiring_key_metadata()
                if retiring_meta:
                    pem_text = (
                        retiring_pem.decode()
                        if isinstance(retiring_pem, (bytes, bytearray))
                        else retiring_pem
                    )
                    priv = Ed25519KeyGenerator.load_private_key_from_pem(pem_text)
                    keys.append(
                        KeyPair(
                            private_key=priv,
                            public_key=priv.public_key(),
                            kid=retiring_meta.kid,
                            created_at=retiring_meta.created_at,
                        )
                    )
        except Exception as e:
            logger.debug("Retiring key not available: %s", e)

        return keys

    async def _generate_and_activate_initial_key(self) -> KeyPair:
        """Generate and activate the first key in the system."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        # Store in Redis cache for development
        await self.redis.setex(
            self._current_key_cache,
            86400,  # 24 hours
            key_material.private_key_pem,
        )

        # Store in runtime
        self._runtime_current_key = key_pair

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
            user_id=cast("UUID", "00000000-0000-0000-0000-000000000000"),
            event_type="initial_key_generated",
            event_data={"kid": key_pair.kid, "manager": "simple"},
        )

        logger.info("Generated initial JWT signing key: %s", key_pair.kid)
        return key_pair

    async def _generate_next_key(self) -> KeyPair:
        """Generate the next key for rotation."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        # Store in Redis cache
        await self.redis.setex(
            self._next_key_cache,
            86400,  # 24 hours
            key_material.private_key_pem,
        )

        # Store in runtime
        self._runtime_next_key = key_pair

        # Update metadata
        metadata = KeyMetadata(
            kid=key_pair.kid,
            status=KeyStatus.NEXT,
            created_at=key_pair.created_at,
        )
        await self._store_key_metadata(metadata)

        logger.info("Generated next JWT key for rotation: %s", key_pair.kid)
        return key_pair

    async def _get_next_key(self) -> KeyPair | None:
        """Get the next key for rotation."""
        # Try runtime storage first
        if self._runtime_next_key:
            return self._runtime_next_key

        # Try cache
        try:
            next_pem = await self.redis.get(self._next_key_cache)
            if next_pem:
                pem_text = (
                    next_pem.decode() if isinstance(next_pem, (bytes, bytearray)) else next_pem
                )
                private_key = Ed25519KeyGenerator.load_private_key_from_pem(pem_text)
                metadata = await self._get_next_key_metadata()

                if metadata:
                    return KeyPair(
                        private_key=private_key,
                        public_key=private_key.public_key(),
                        kid=metadata.kid,
                        created_at=metadata.created_at,
                    )
        except Exception as e:
            logger.debug("Next key fetch failed: %s", e)

        return None

    async def _promote_next_to_current(self) -> None:
        """Promote next key to current key."""
        next_key = await self._get_next_key()
        if not next_key:
            raise RuntimeError("No next key available for promotion")

        # Cache retiring key material and metadata for overlap window
        try:
            if self._runtime_current_key:
                current_meta = await self._get_current_key_metadata()
                if current_meta:
                    await self._store_key_metadata_with_ttl(
                        current_meta, KeyStatus.RETIRING, int(self.overlap_window.total_seconds())
                    )

                # Serialize current key for overlap window
                current_material = Ed25519KeyGenerator.serialize_key_pair(self._runtime_current_key)
                await self.redis.setex(
                    self._retiring_key_cache,
                    int(self.overlap_window.total_seconds()),
                    current_material.private_key_pem,
                )
        except Exception as e:
            logger.debug("Could not cache retiring key: %s", e)

        # Promote next to current
        self._runtime_current_key = next_key
        next_material = Ed25519KeyGenerator.serialize_key_pair(next_key)
        await self.redis.setex(
            self._current_key_cache,
            86400,  # 24 hours
            next_material.private_key_pem,
        )

        # Update metadata
        next_metadata = await self._get_next_key_metadata()
        if next_metadata:
            next_metadata.status = KeyStatus.CURRENT
            next_metadata.activated_at = datetime.now(UTC)
            await self._store_key_metadata(next_metadata)

        # Clear next key
        self._runtime_next_key = None
        await self.redis.delete(self._next_key_cache)

    async def verify_key_integrity(self) -> dict[str, Any]:
        """Verify the integrity of the key system.

        Returns:
            Integrity check results
        """
        results = await super().verify_key_integrity()

        # Add simple manager specific checks
        results["runtime_current_available"] = self._runtime_current_key is not None
        results["runtime_next_available"] = self._runtime_next_key is not None
        results["manager_type"] = "simple"

        return results
