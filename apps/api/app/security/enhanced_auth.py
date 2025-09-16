"""Enhanced authentication with encrypted token storage.

This module provides secure token management with AES-GCM encryption
for sensitive tokens like refresh tokens stored in databases or cookies.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
import json
from typing import Any
from uuid import UUID

from app.security.token_cipher import KeyConfigError, TokenCipher


class SecureTokenService:
    """Service for creating and managing encrypted tokens."""

    def __init__(self, cipher: TokenCipher | None = None) -> None:
        """Initialize with optional cipher.

        Args:
            cipher: TokenCipher instance, defaults to loading from env
        """
        self.cipher = cipher or self._get_default_cipher()

    @staticmethod
    def _get_default_cipher() -> TokenCipher | None:
        """Get default cipher from environment if configured."""
        try:
            return TokenCipher.from_env()
        except (KeyError, json.JSONDecodeError):
            # Cipher not configured, tokens won't be encrypted
            return None

    def create_encrypted_refresh_token(
        self,
        user_id: UUID,
        session_id: UUID,
        device_id: UUID | None = None,
        ttl_days: int = 30,
    ) -> str:
        """Create an encrypted refresh token.

        Args:
            user_id: User's UUID
            session_id: Session UUID for tracking
            device_id: Optional device UUID
            ttl_days: Token lifetime in days

        Returns:
            Encrypted token envelope or plain token if cipher not configured
        """
        now = datetime.now(UTC)
        expires_at = now + timedelta(days=ttl_days)

        # Create token payload
        payload = {
            "user_id": str(user_id),
            "session_id": str(session_id),
            "device_id": str(device_id) if device_id else None,
            "created_at": now.isoformat(),
            "expires_at": expires_at.isoformat(),
            "token_type": "refresh",
        }

        # Serialize payload
        token_data = json.dumps(payload, separators=(",", ":"))

        if self.cipher:
            # Create AAD from user and session for binding
            aad = f"user:{user_id}:session:{session_id}".encode()
            return self.cipher.encrypt(token_data, aad)

        # Return unencrypted if cipher not available (dev/test)
        return token_data

    def decrypt_refresh_token(
        self,
        encrypted_token: str,
        expected_user_id: UUID | None = None,
        expected_session_id: UUID | None = None,
    ) -> dict[str, Any]:
        """Decrypt and validate a refresh token.

        Args:
            encrypted_token: Encrypted token envelope
            expected_user_id: Expected user ID for validation
            expected_session_id: Expected session ID for validation

        Returns:
            Token payload dictionary

        Raises:
            ValueError: If token is invalid or validation fails
        """
        if self.cipher and encrypted_token.startswith("{"):
            # Token is encrypted (starts with JSON envelope)
            # Build AAD for verification if we have expected values
            aad = None
            if expected_user_id and expected_session_id:
                aad = f"user:{expected_user_id}:session:{expected_session_id}".encode()

            try:
                token_data = self.cipher.decrypt(encrypted_token, aad)
            except (ValueError, KeyError, KeyConfigError, json.JSONDecodeError) as e:
                raise ValueError(f"Token decryption failed: {e}") from e
        else:
            # Token is not encrypted
            token_data = encrypted_token

        # Parse payload
        try:
            payload = json.loads(token_data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid token format: {e}") from e

        # Validate expiration
        expires_at = datetime.fromisoformat(payload["expires_at"])
        if expires_at < datetime.now(UTC):
            raise ValueError("Token has expired")

        # Validate expected values if provided
        if expected_user_id and payload.get("user_id") != str(expected_user_id):
            raise ValueError("User ID mismatch")

        if expected_session_id and payload.get("session_id") != str(expected_session_id):
            raise ValueError("Session ID mismatch")

        return dict(payload)

    def rotate_token_if_needed(
        self,
        encrypted_token: str,
        user_id: UUID,
        session_id: UUID,
    ) -> str | None:
        """Rotate token to new key if needed.

        Args:
            encrypted_token: Current encrypted token
            user_id: User ID for AAD
            session_id: Session ID for AAD

        Returns:
            New encrypted token if rotated, None if not needed
        """
        if not self.cipher:
            return None

        if not self.cipher.needs_rotation(encrypted_token):
            return None

        # Build AAD for rotation
        aad = f"user:{user_id}:session:{session_id}".encode()

        try:
            return self.cipher.rotate(encrypted_token, aad)
        except (ValueError, KeyError, KeyConfigError):
            # Rotation failed, token might be corrupted
            return None

    def create_state_token(
        self,
        purpose: str,
        data: dict[str, Any],
        ttl_minutes: int = 10,
    ) -> str:
        """Create an encrypted state token for OAuth/SAML flows.

        Args:
            purpose: Token purpose (e.g., "oauth_state", "saml_relay")
            data: State data to encrypt
            ttl_minutes: Token lifetime in minutes

        Returns:
            Encrypted state token
        """
        now = datetime.now(UTC)
        expires_at = now + timedelta(minutes=ttl_minutes)

        payload = {
            "purpose": purpose,
            "data": data,
            "created_at": now.isoformat(),
            "expires_at": expires_at.isoformat(),
        }

        token_data = json.dumps(payload, separators=(",", ":"))

        if self.cipher:
            # Use purpose as AAD for context binding
            aad = f"state:{purpose}".encode()
            return self.cipher.encrypt(token_data, aad)

        return token_data

    def verify_state_token(
        self,
        encrypted_token: str,
        expected_purpose: str,
    ) -> dict[str, Any]:
        """Verify and decrypt a state token.

        Args:
            encrypted_token: Encrypted state token
            expected_purpose: Expected token purpose

        Returns:
            State data from token

        Raises:
            ValueError: If token is invalid or purpose doesn't match
        """
        if self.cipher and encrypted_token.startswith("{"):
            aad = f"state:{expected_purpose}".encode()
            try:
                token_data = self.cipher.decrypt(encrypted_token, aad)
            except (ValueError, KeyError, KeyConfigError, json.JSONDecodeError) as e:
                raise ValueError(f"State token decryption failed: {e}") from e
        else:
            token_data = encrypted_token

        try:
            payload = json.loads(token_data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid state token format: {e}") from e

        # Validate purpose
        if payload.get("purpose") != expected_purpose:
            raise ValueError("State token purpose mismatch")

        # Validate expiration
        expires_at = datetime.fromisoformat(payload["expires_at"])
        if expires_at < datetime.now(UTC):
            raise ValueError("State token has expired")

        data: dict[str, Any] = payload["data"]
        return data
