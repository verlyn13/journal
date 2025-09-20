"""Enhanced KeyManager with Infisical integration.

This module provides an enhanced KeyManager that integrates with Infisical
for secure key storage while maintaining backward compatibility with the
existing JWT and AES key management system.
"""

from __future__ import annotations

import base64
from datetime import UTC, datetime
import json
import logging
import os
from typing import Any
from uuid import UUID, uuid4

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.domain.auth.key_manager import KeyManager
from app.infra.crypto.key_generation import Ed25519KeyGenerator
from app.infra.secrets import InfisicalSecretsClient, SecretNotFoundError, SecretType
from app.security.token_cipher import TokenCipher
from app.telemetry.metrics_runtime import inc as metrics_inc


logger = logging.getLogger(__name__)


class InfisicalKeyManager(KeyManager):
    """Enhanced KeyManager with Infisical integration.

    Features:
    - Seamless Infisical integration for key storage
    - JWT signing key management with rotation
    - AES encryption key management for TokenCipher
    - Backward compatibility with environment-based keys
    - Comprehensive auditing and metrics
    - Webhook-triggered rotation support
    """

    # Infisical secret paths
    JWT_CURRENT_PRIVATE_KEY_PATH = "/auth/jwt/current_private_key"
    JWT_NEXT_PRIVATE_KEY_PATH = "/auth/jwt/next_private_key"
    JWT_CURRENT_PUBLIC_KEY_PATH = "/auth/jwt/current_public_key"
    JWT_NEXT_PUBLIC_KEY_PATH = "/auth/jwt/next_public_key"

    AES_CURRENT_KEY_PATH = "/auth/aes/current_key"
    AES_NEXT_KEY_PATH = "/auth/aes/next_key"
    AES_ACTIVE_KID_PATH = "/auth/aes/active_kid"
    AES_KEYS_MAP_PATH = "/auth/aes/keys_map"

    def __init__(
        self,
        session: AsyncSession,
        redis: Redis,
        infisical_client: InfisicalSecretsClient,
        enable_infisical: bool = True,
    ) -> None:
        """Initialize enhanced key manager.

        Args:
            session: Database session
            redis: Redis client
            infisical_client: Infisical secrets client
            enable_infisical: Enable Infisical integration (default: True)
        """
        # Initialize parent with infisical_client for compatibility
        super().__init__(session, redis, infisical_client)

        self.infisical_client = infisical_client
        self.enable_infisical = enable_infisical
        self.audit_service = AuditService(session)

        # Enhanced cache keys
        self._aes_cipher_cache = "auth:aes:cipher"
        self._keys_health_cache = "auth:keys:health"

    async def initialize_key_system(self) -> None:
        """Initialize both JWT and AES key systems."""
        await super().initialize_key_system()

        # Initialize AES key system if Infisical is enabled
        if self.enable_infisical:
            await self._initialize_aes_key_system()

    async def get_token_cipher(self) -> TokenCipher:
        """Get TokenCipher with Infisical-managed keys.

        Returns:
            Configured TokenCipher instance

        Raises:
            RuntimeError: If AES keys cannot be loaded
        """
        if not self.enable_infisical:
            # Fall back to environment-based configuration
            return TokenCipher.from_env()

        # Try cache first
        cached_data = await self.redis.get(self._aes_cipher_cache)
        if cached_data:
            try:
                cipher_data = json.loads(cached_data.decode())
                return self._deserialize_token_cipher(cipher_data)
            except (json.JSONDecodeError, KeyError) as e:
                logger.debug("AES cipher cache corrupted, will reload: %s", e)

        # Load from Infisical
        try:
            # Get active key ID
            active_kid = await self.infisical_client.fetch_secret(
                self.AES_ACTIVE_KID_PATH
            )

            # Get keys map
            keys_map_json = await self.infisical_client.fetch_secret(
                self.AES_KEYS_MAP_PATH
            )
            keys_map = json.loads(keys_map_json)

            # Decode base64 keys
            keys = {}
            for kid, b64_key in keys_map.items():
                # Handle potential padding issues
                key_bytes = self._decode_base64_key(b64_key)
                keys[kid] = key_bytes

            cipher = TokenCipher(keys=keys, active_kid=active_kid)

            # Cache for 10 minutes
            cipher_data = self._serialize_token_cipher(cipher, keys_map)
            await self.redis.setex(self._aes_cipher_cache, 600, json.dumps(cipher_data))

            metrics_inc("aes_cipher_loaded_total", {"source": "infisical"})

            return cipher

        except (SecretNotFoundError, json.JSONDecodeError, ValueError) as e:
            logger.exception("Failed to load AES cipher from Infisical")

            # Fall back to environment if available
            try:
                cipher = TokenCipher.from_env()
                metrics_inc("aes_cipher_loaded_total", {"source": "env_fallback"})
                return cipher
            except KeyError as env_e:
                raise RuntimeError(
                    f"Failed to load AES cipher from Infisical and env: {e}, {env_e}"
                ) from e

    async def rotate_aes_keys(self, force: bool = False) -> dict[str, Any]:
        """Rotate AES encryption keys.

        Args:
            force: Force rotation even if not needed

        Returns:
            Rotation result summary
        """
        if not self.enable_infisical:
            return {"status": "skipped", "reason": "Infisical not enabled"}

        start_time = datetime.now(UTC)

        try:
            # Get current cipher
            current_cipher = await self.get_token_cipher()

            # Check if rotation is needed
            if not force:
                needs_rotation, reason = await self._check_aes_rotation_needed()
                if not needs_rotation:
                    return {"status": "skipped", "reason": reason}

            # Generate new key
            new_kid = self._generate_key_id()
            new_key = self._generate_aes_key()

            # Get current keys map
            keys_map_json = await self.infisical_client.fetch_secret(
                self.AES_KEYS_MAP_PATH
            )
            keys_map = json.loads(keys_map_json)

            # Add new key to map
            keys_map[new_kid] = self._encode_base64_key(new_key)

            # Store updated keys map
            await self.infisical_client.store_secret(
                self.AES_KEYS_MAP_PATH,
                json.dumps(keys_map),
                SecretType.AES_ENCRYPTION_KEY,
            )

            # Update active key ID
            await self.infisical_client.store_secret(
                self.AES_ACTIVE_KID_PATH,
                new_kid,
                SecretType.AES_ENCRYPTION_KEY,
            )

            # Invalidate cache
            await self.redis.delete(self._aes_cipher_cache)

            # Log rotation event
            await self.audit_service.log_event(
                user_id=UUID("00000000-0000-0000-0000-000000000000"),
                event_type="aes_keys_rotated",
                event_data={
                    "old_active_kid": current_cipher.active_kid,
                    "new_active_kid": new_kid,
                    "rotation_method": "automatic" if not force else "forced",
                    "keys_count": len(keys_map),
                },
            )

            metrics_inc(
                "aes_key_rotation_total",
                {"method": "automatic" if not force else "forced"},
            )

            return {
                "status": "success",
                "old_active_kid": current_cipher.active_kid,
                "new_active_kid": new_kid,
                "keys_count": len(keys_map),
                "duration_seconds": (datetime.now(UTC) - start_time).total_seconds(),
            }

        except Exception as e:
            await self.audit_service.log_event(
                user_id=UUID("00000000-0000-0000-0000-000000000000"),
                event_type="aes_key_rotation_failed",
                event_data={"error": str(e), "forced": force},
            )

            metrics_inc("aes_key_rotation_errors_total", {"forced": str(force).lower()})

            raise RuntimeError(f"AES key rotation failed: {e}") from e

    async def migrate_keys_to_infisical(self) -> dict[str, Any]:
        """Migrate existing environment-based keys to Infisical.

        Returns:
            Migration result summary
        """
        if not self.enable_infisical:
            return {"status": "skipped", "reason": "Infisical not enabled"}

        migration_results = {
            "jwt_keys_migrated": False,
            "aes_keys_migrated": False,
            "errors": [],
        }

        try:
            # Migrate JWT keys if they exist in environment
            try:
                current_key = await super().get_current_signing_key()

                # Store current JWT key in Infisical
                key_material = Ed25519KeyGenerator.serialize_key_pair(current_key)
                await self.infisical_client.store_secret(
                    self.JWT_CURRENT_PRIVATE_KEY_PATH,
                    key_material.private_key_pem,
                    SecretType.JWT_PRIVATE_KEY,
                )
                await self.infisical_client.store_secret(
                    self.JWT_CURRENT_PUBLIC_KEY_PATH,
                    key_material.public_key_pem,
                    SecretType.JWT_PUBLIC_KEY,
                )

                migration_results["jwt_keys_migrated"] = True
                logger.info("JWT keys migrated to Infisical")

            except RuntimeError:
                # No JWT keys to migrate
                logger.debug("No existing JWT keys found for migration")

            # Migrate AES keys if they exist in environment
            try:
                env_cipher = TokenCipher.from_env()

                # Create keys map for Infisical storage
                keys_map = {}
                for kid, key_bytes in env_cipher._keys.items():
                    keys_map[kid] = self._encode_base64_key(key_bytes)

                # Store in Infisical
                await self.infisical_client.store_secret(
                    self.AES_KEYS_MAP_PATH,
                    json.dumps(keys_map),
                    SecretType.AES_ENCRYPTION_KEY,
                )
                await self.infisical_client.store_secret(
                    self.AES_ACTIVE_KID_PATH,
                    env_cipher.active_kid,
                    SecretType.AES_ENCRYPTION_KEY,
                )

                migration_results["aes_keys_migrated"] = True
                logger.info("AES keys migrated to Infisical")

            except KeyError:
                # No AES keys to migrate
                logger.debug("No existing AES keys found for migration")

            # Log migration event
            await self.audit_service.log_event(
                user_id=UUID("00000000-0000-0000-0000-000000000000"),
                event_type="keys_migrated_to_infisical",
                event_data=migration_results,
            )

            return migration_results

        except Exception as e:
            error_msg = f"Migration failed: {e}"
            migration_results["errors"].append(error_msg)

            await self.audit_service.log_event(
                user_id=UUID("00000000-0000-0000-0000-000000000000"),
                event_type="key_migration_failed",
                event_data={"error": str(e)},
            )

            logger.exception("Key migration to Infisical failed")

            return migration_results

    async def health_check(self) -> dict[str, Any]:
        """Comprehensive health check for key management system.

        Returns:
            Health check results
        """
        # Try cache first
        cached_health = await self.redis.get(self._keys_health_cache)
        if cached_health:
            try:
                return json.loads(cached_health.decode())
            except (json.JSONDecodeError, ValueError):
                pass

        health_results = {
            "timestamp": datetime.now(UTC).isoformat(),
            "jwt_system": {"status": "unknown"},
            "aes_system": {"status": "unknown"},
            "infisical_connection": {"status": "unknown"},
            "overall_status": "unknown",
        }

        # Check JWT system
        try:
            jwt_health = await super().verify_key_integrity()
            health_results["jwt_system"] = {
                "status": "healthy" if jwt_health["current_key_valid"] else "unhealthy",
                "details": jwt_health,
            }
        except Exception as e:
            health_results["jwt_system"] = {
                "status": "unhealthy",
                "error": str(e),
            }

        # Check AES system
        try:
            cipher = await self.get_token_cipher()
            # Test encryption/decryption
            test_plaintext = "health_check_test"
            encrypted = cipher.encrypt(test_plaintext)
            decrypted = cipher.decrypt(encrypted)

            health_results["aes_system"] = {
                "status": "healthy" if decrypted == test_plaintext else "unhealthy",
                "active_kid": cipher.active_kid,
                "keys_count": len(cipher._keys),
            }
        except Exception as e:
            health_results["aes_system"] = {
                "status": "unhealthy",
                "error": str(e),
            }

        # Check Infisical connection
        if self.enable_infisical:
            try:
                infisical_health = await self.infisical_client.health_check()
                health_results["infisical_connection"] = infisical_health
            except Exception as e:
                health_results["infisical_connection"] = {
                    "status": "unhealthy",
                    "error": str(e),
                }
        else:
            health_results["infisical_connection"] = {
                "status": "disabled",
                "reason": "Infisical integration disabled",
            }

        # Determine overall status
        jwt_healthy = health_results["jwt_system"]["status"] == "healthy"
        aes_healthy = health_results["aes_system"]["status"] == "healthy"
        infisical_ok = health_results["infisical_connection"]["status"] in {
            "healthy",
            "disabled",
        }

        if jwt_healthy and aes_healthy and infisical_ok:
            health_results["overall_status"] = "healthy"
        else:
            health_results["overall_status"] = "unhealthy"

        # Cache results for 1 minute
        await self.redis.setex(self._keys_health_cache, 60, json.dumps(health_results))

        return health_results

    async def webhook_rotate_keys(self, webhook_data: dict[str, Any]) -> dict[str, Any]:
        """Handle webhook-triggered key rotation.

        Args:
            webhook_data: Webhook payload data

        Returns:
            Rotation results
        """
        rotation_type = webhook_data.get("rotation_type", "jwt")
        force = webhook_data.get("force", False)

        results = {
            "webhook_received_at": datetime.now(UTC).isoformat(),
            "rotation_type": rotation_type,
            "force": force,
            "results": {},
        }

        try:
            if rotation_type == "jwt":
                jwt_result = await self.rotate_keys(force=force)
                results["results"]["jwt"] = jwt_result
            elif rotation_type == "aes":
                aes_result = await self.rotate_aes_keys(force=force)
                results["results"]["aes"] = aes_result
            elif rotation_type == "both":
                jwt_result = await self.rotate_keys(force=force)
                aes_result = await self.rotate_aes_keys(force=force)
                results["results"]["jwt"] = jwt_result
                results["results"]["aes"] = aes_result
            else:
                raise ValueError(f"Invalid rotation_type: {rotation_type}")

            # Log webhook event
            await self.audit_service.log_event(
                user_id=UUID("00000000-0000-0000-0000-000000000000"),
                event_type="webhook_key_rotation",
                event_data=results,
            )

            metrics_inc(
                "webhook_key_rotation_total",
                {"type": rotation_type, "status": "success"},
            )

            return results

        except Exception as e:
            error_result = {
                "status": "error",
                "error": str(e),
            }
            results["results"] = error_result

            await self.audit_service.log_event(
                user_id=UUID("00000000-0000-0000-0000-000000000000"),
                event_type="webhook_key_rotation_failed",
                event_data=results,
            )

            metrics_inc(
                "webhook_key_rotation_total", {"type": rotation_type, "status": "error"}
            )

            return results

    async def _initialize_aes_key_system(self) -> None:
        """Initialize AES key system in Infisical."""
        try:
            # Check if AES keys already exist
            await self.infisical_client.fetch_secret(self.AES_ACTIVE_KID_PATH)
            logger.debug("AES key system already initialized")
            return
        except SecretNotFoundError:
            # Initialize new AES key system
            pass

        # Generate initial AES key
        initial_kid = self._generate_key_id()
        initial_key = self._generate_aes_key()

        # Create keys map
        keys_map = {initial_kid: self._encode_base64_key(initial_key)}

        # Store in Infisical
        await self.infisical_client.store_secret(
            self.AES_KEYS_MAP_PATH,
            json.dumps(keys_map),
            SecretType.AES_ENCRYPTION_KEY,
        )
        await self.infisical_client.store_secret(
            self.AES_ACTIVE_KID_PATH,
            initial_kid,
            SecretType.AES_ENCRYPTION_KEY,
        )

        logger.info("Initialized AES key system with key ID: %s", initial_kid)

    @staticmethod
    async def _check_aes_rotation_needed() -> tuple[bool, str]:
        """Check if AES key rotation is needed."""
        # For now, use simple time-based rotation
        # In production, you might want more sophisticated logic
        try:
            # This is a simplified check - you could store key creation timestamps
            # in Infisical metadata or a separate tracking system
            return False, "AES rotation logic not implemented"
        except Exception as e:
            return True, f"Error checking rotation status: {e}"

    @staticmethod
    def _generate_key_id() -> str:
        """Generate a unique key ID."""
        return f"aes_{uuid4().hex[:8]}"

    @staticmethod
    def _generate_aes_key() -> bytes:
        """Generate a 256-bit AES key."""
        return os.urandom(32)  # 256 bits

    @staticmethod
    def _encode_base64_key(key_bytes: bytes) -> str:
        """Encode key bytes to base64 URL-safe string."""
        return base64.urlsafe_b64encode(key_bytes).decode().rstrip("=")

    @staticmethod
    def _decode_base64_key(b64_key: str) -> bytes:
        """Decode base64 URL-safe string to key bytes."""
        # Add padding if needed
        padded = b64_key + "=" * (-len(b64_key) % 4)
        return base64.urlsafe_b64decode(padded)

    @staticmethod
    def _serialize_token_cipher(
        cipher: TokenCipher, keys_map: dict[str, str]
    ) -> dict[str, Any]:
        """Serialize TokenCipher for caching."""
        return {
            "active_kid": cipher.active_kid,
            "keys_map": keys_map,
            "cached_at": datetime.now(UTC).isoformat(),
        }

    def _deserialize_token_cipher(self, cipher_data: dict[str, Any]) -> TokenCipher:
        """Deserialize TokenCipher from cache."""
        keys = {}
        for kid, b64_key in cipher_data["keys_map"].items():
            keys[kid] = self._decode_base64_key(b64_key)

        return TokenCipher(keys=keys, active_kid=cipher_data["active_kid"])
