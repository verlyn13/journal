"""AES-GCM token cipher with key rotation support.

This service provides secure encryption for sensitive tokens (refresh tokens, TOTP secrets)
using AES-256-GCM with proper nonce handling and key rotation capabilities.
"""

from __future__ import annotations

import base64
from datetime import UTC, datetime, timedelta
import json
import logging
import os
from typing import Any

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


logger = logging.getLogger(__name__)


class TokenCipher:
    """Secure token encryption using AES-256-GCM with key rotation."""

    # Key rotation configuration
    KEY_ROTATION_DAYS = 90  # Rotate keys every 90 days
    MAX_KEY_AGE_DAYS = 180  # Keep old keys for 180 days for decryption

    def __init__(self) -> None:
        """Initialize cipher with current and previous keys."""
        self.keys = self._load_keys()
        self.current_key_id = self._get_current_key_id()

    def encrypt(self, plaintext: str) -> str:
        """Encrypt a token using the current key.

        Args:
            plaintext: The token to encrypt

        Returns:
            Base64-encoded encrypted token with metadata
        """
        # Get current key
        key_data = self.keys[self.current_key_id]
        key = base64.b64decode(key_data["key"])

        # Generate random nonce (96 bits for GCM)
        nonce = os.urandom(12)

        # Create cipher
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(nonce),
            backend=default_backend(),
        )
        encryptor = cipher.encryptor()

        # Encrypt the plaintext
        ciphertext = encryptor.update(plaintext.encode()) + encryptor.finalize()

        # Create encrypted token with metadata
        encrypted_data = {
            "v": 1,  # Version
            "kid": self.current_key_id,  # Key ID
            "nonce": base64.b64encode(nonce).decode("ascii"),
            "ciphertext": base64.b64encode(ciphertext).decode("ascii"),
            "tag": base64.b64encode(encryptor.tag).decode("ascii"),
        }

        # Return base64-encoded JSON
        return base64.urlsafe_b64encode(json.dumps(encrypted_data).encode()).decode(
            "ascii"
        )

    def decrypt(self, encrypted_token: str) -> str | None:
        """Decrypt a token using the appropriate key.

        Args:
            encrypted_token: Base64-encoded encrypted token

        Returns:
            Decrypted token or None if decryption fails
        """
        try:
            # Decode and parse the encrypted data
            encrypted_json = base64.urlsafe_b64decode(encrypted_token)
            encrypted_data = json.loads(encrypted_json)

            # Get the key used for encryption
            key_id = encrypted_data["kid"]
            if key_id not in self.keys:
                return None  # Key not found or expired

            key_data = self.keys[key_id]
            key = base64.b64decode(key_data["key"])

            # Extract components
            nonce = base64.b64decode(encrypted_data["nonce"])
            ciphertext = base64.b64decode(encrypted_data["ciphertext"])
            tag = base64.b64decode(encrypted_data["tag"])

            # Create cipher for decryption
            cipher = Cipher(
                algorithms.AES(key),
                modes.GCM(nonce, tag),
                backend=default_backend(),
            )
            decryptor = cipher.decryptor()

            # Decrypt
            plaintext = decryptor.update(ciphertext) + decryptor.finalize()

            return plaintext.decode("utf-8")

        except (json.JSONDecodeError, KeyError, ValueError):
            # Decryption failed (wrong key, tampered data, invalid format, etc.)
            return None

    def rotate_keys(self) -> bool:
        """Rotate encryption keys if needed.

        Returns:
            True if keys were rotated, False otherwise
        """
        current_key = self.keys[self.current_key_id]
        key_age = datetime.now(UTC) - datetime.fromisoformat(current_key["created_at"])

        if key_age.days >= self.KEY_ROTATION_DAYS:
            # Generate new key
            new_key_id = self._generate_key_id()
            new_key = os.urandom(32)  # 256 bits for AES-256

            # Add new key
            self.keys[new_key_id] = {
                "key": base64.b64encode(new_key).decode("ascii"),
                "created_at": datetime.now(UTC).isoformat(),
            }

            # Update current key ID
            self.current_key_id = new_key_id

            # Remove expired keys
            self._cleanup_old_keys()

            # Save updated keys
            self._save_keys()

            return True

        return False

    def _load_keys(self) -> dict[str, dict[str, Any]]:
        """Load encryption keys from secure storage."""
        # In production, load from secure key management service
        # For now, use environment variable or generate new
        keys_json = os.environ.get("JOURNAL_ENCRYPTION_KEYS")

        if keys_json:
            loaded_keys: dict[str, dict[str, Any]] = json.loads(keys_json)
            return loaded_keys

        # Generate initial key
        key_id = self._generate_key_id()
        key = os.urandom(32)  # 256 bits for AES-256

        return {
            key_id: {
                "key": base64.b64encode(key).decode("ascii"),
                "created_at": datetime.now(UTC).isoformat(),
            }
        }

    def _save_keys(self) -> None:
        """Save encryption keys to secure storage."""
        # In production, save to secure key management service
        # For now, this would need to be manually updated in environment
        keys_json = json.dumps(self.keys)
        # In production, this would trigger an alert to update the key in secure storage
        # For development, log the new keys (would be sent to monitoring service in prod)
        logger.warning(
            "Key rotation required. Update JOURNAL_ENCRYPTION_KEYS: %s", keys_json
        )

    def _get_current_key_id(self) -> str:
        """Get the ID of the most recent key."""
        # Find the newest key
        newest_key_id = None
        newest_time = None

        for key_id, key_data in self.keys.items():
            created_at = datetime.fromisoformat(key_data["created_at"])
            if newest_time is None or created_at > newest_time:
                newest_time = created_at
                newest_key_id = key_id

        return newest_key_id or self._generate_key_id()

    def _cleanup_old_keys(self) -> None:
        """Remove keys older than MAX_KEY_AGE_DAYS."""
        cutoff_date = datetime.now(UTC) - timedelta(days=self.MAX_KEY_AGE_DAYS)

        keys_to_remove = []
        for key_id, key_data in self.keys.items():
            created_at = datetime.fromisoformat(key_data["created_at"])
            if created_at < cutoff_date and key_id != self.current_key_id:
                keys_to_remove.append(key_id)

        for key_id in keys_to_remove:
            del self.keys[key_id]

    @staticmethod
    def _generate_key_id() -> str:
        """Generate a unique key ID."""
        return base64.urlsafe_b64encode(os.urandom(12)).decode("ascii")


# Singleton instance holder
class _CipherHolder:
    """Holder for singleton cipher instance."""

    instance: TokenCipher | None = None


def get_token_cipher() -> TokenCipher:
    """Get or create the global token cipher instance."""
    if _CipherHolder.instance is None:
        _CipherHolder.instance = TokenCipher()
    return _CipherHolder.instance


def encrypt_token(token: str) -> str:
    """Encrypt a token using the global cipher.

    Args:
        token: The token to encrypt

    Returns:
        Encrypted token
    """
    return get_token_cipher().encrypt(token)


def decrypt_token(encrypted_token: str) -> str | None:
    """Decrypt a token using the global cipher.

    Args:
        encrypted_token: The encrypted token

    Returns:
        Decrypted token or None if decryption fails
    """
    return get_token_cipher().decrypt(encrypted_token)
