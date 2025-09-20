"""AES-GCM token cipher with key rotation support.

This module provides secure token encryption using AES-GCM with authenticated
encryption and support for key rotation to enable seamless key updates.
"""

from __future__ import annotations

import base64
import json
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class KeyConfigError(Exception):
    """Raised when key configuration is invalid."""


class TokenCipher:
    """AES-GCM cipher with key rotation support.

    Provides authenticated encryption for tokens with support for:
    - Multiple encryption keys for rotation
    - Automatic key selection for decryption
    - JSON envelope format with metadata
    - Additional authenticated data (AAD)
    """

    def __init__(self, keys: dict[str, bytes], active_kid: str) -> None:
        """Initialize cipher with keys and active key ID.

        Args:
            keys: Dictionary mapping key IDs to encryption keys
            active_kid: ID of the key to use for encryption

        Raises:
            KeyConfigError: If active key not found in keys
        """
        if active_kid not in keys:
            raise KeyConfigError(f"Active key '{active_kid}' not in keys")
        self._keys = keys
        self._active_kid = active_kid

    @classmethod
    def from_env(cls) -> TokenCipher:
        """Load cipher configuration from environment variables.

        Expects:
            AUTH_ENC_KEYS: JSON string mapping key IDs to base64-encoded keys
            AUTH_ENC_ACTIVE_KID: ID of the active encryption key

        Returns:
            Configured TokenCipher instance

        Raises:
            KeyConfigError: If key sizes are invalid
        """
        raw_map = os.environ["AUTH_ENC_KEYS"]
        active = os.environ["AUTH_ENC_ACTIVE_KID"]
        parsed = json.loads(raw_map)

        keys = {}
        for kid, b64_key in parsed.items():
            # Add padding if needed for base64 decoding
            key = base64.urlsafe_b64decode(b64_key + "=" * (-len(b64_key) % 4))
            if len(key) not in {16, 24, 32}:
                raise KeyConfigError(f"Key '{kid}' must be 128/192/256-bit")
            keys[kid] = key

        return cls(keys=keys, active_kid=active)

    def encrypt(self, plaintext: str, aad: bytes | None = None) -> str:
        """Encrypt plaintext with active key.

        Args:
            plaintext: String to encrypt
            aad: Additional authenticated data (optional)

        Returns:
            JSON envelope containing encrypted data and metadata
        """
        key = self._keys[self._active_kid]
        aesgcm = AESGCM(key)
        iv = os.urandom(12)  # 96-bit nonce for GCM
        ciphertext = aesgcm.encrypt(iv, plaintext.encode(), aad)

        envelope = {
            "v": 1,  # Version for future compatibility
            "kid": self._active_kid,  # Key ID for rotation
            "iv": base64.urlsafe_b64encode(iv).decode().rstrip("="),
            "ct": base64.urlsafe_b64encode(ciphertext).decode().rstrip("="),
        }

        if aad:
            envelope["aad"] = base64.urlsafe_b64encode(aad).decode().rstrip("=")

        return json.dumps(envelope, separators=(",", ":"))

    def decrypt(self, envelope: str, aad: bytes | None = None) -> str:
        """Decrypt envelope using appropriate key.

        Args:
            envelope: JSON envelope from encrypt()
            aad: Additional authenticated data (must match encryption)

        Returns:
            Decrypted plaintext string

        Raises:
            ValueError: If envelope version unsupported
            KeyError: If required key not available
        """
        obj = json.loads(envelope)
        if obj.get("v") != 1:
            raise ValueError("Unsupported ciphertext version")

        kid = obj["kid"]
        key = self._keys.get(kid)
        if not key:
            raise KeyError(f"Key '{kid}' unavailable")

        aesgcm = AESGCM(key)
        iv = base64.urlsafe_b64decode(obj["iv"] + "=" * (-len(obj["iv"]) % 4))
        ct = base64.urlsafe_b64decode(obj["ct"] + "=" * (-len(obj["ct"]) % 4))

        # Verify AAD matches if provided in envelope
        if "aad" in obj:
            envelope_aad = base64.urlsafe_b64decode(
                obj["aad"] + "=" * (-len(obj["aad"]) % 4)
            )
            if aad != envelope_aad:
                raise ValueError("AAD mismatch")

        plaintext = aesgcm.decrypt(iv, ct, aad)
        return plaintext.decode()

    def needs_rotation(self, envelope: str) -> bool:
        """Check if envelope was encrypted with old key.

        Args:
            envelope: JSON envelope to check

        Returns:
            True if envelope uses non-active key
        """
        try:
            obj = json.loads(envelope)
            return bool(obj.get("kid") != self._active_kid)
        except (json.JSONDecodeError, KeyError):
            return True

    def rotate(self, envelope: str, aad: bytes | None = None) -> str:
        """Re-encrypt envelope with active key.

        Args:
            envelope: JSON envelope to rotate
            aad: Additional authenticated data

        Returns:
            New envelope encrypted with active key
        """
        plaintext = self.decrypt(envelope, aad)
        return self.encrypt(plaintext, aad)

    @property
    def active_kid(self) -> str:
        """Get active key ID."""
        return self._active_kid

    def has_key(self, kid: str) -> bool:
        """Check if key ID is available."""
        return kid in self._keys
