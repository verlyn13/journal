"""Tests for AES-GCM token cipher."""

from __future__ import annotations

import base64
import json
import os
from unittest.mock import patch

import pytest

from app.security.token_cipher import KeyConfigError, TokenCipher


class TestTokenCipher:  # noqa: PLR0904
    """Test suite for TokenCipher."""

    @pytest.fixture()
    def sample_keys(self) -> dict[str, bytes]:
        """Provide sample encryption keys."""
        return {
            "key1": os.urandom(32),  # 256-bit key
            "key2": os.urandom(32),  # 256-bit key
            "key3": os.urandom(16),  # 128-bit key
        }

    @pytest.fixture()
    def cipher(self, sample_keys: dict[str, bytes]) -> TokenCipher:
        """Create cipher instance with sample keys."""
        return TokenCipher(keys=sample_keys, active_kid="key1")

    def test_init_with_valid_keys(self, sample_keys: dict[str, bytes]) -> None:
        """Test initialization with valid keys."""
        cipher = TokenCipher(keys=sample_keys, active_kid="key1")
        assert cipher.active_kid == "key1"
        assert cipher.has_key("key1")
        assert cipher.has_key("key2")
        assert cipher.has_key("key3")

    def test_init_with_invalid_active_key(self, sample_keys: dict[str, bytes]) -> None:
        """Test initialization fails with invalid active key."""
        with pytest.raises(KeyConfigError, match="Active key 'invalid' not in keys"):
            TokenCipher(keys=sample_keys, active_kid="invalid")

    def test_from_env(self, sample_keys: dict[str, bytes]) -> None:
        """Test loading from environment variables."""
        keys_json = {
            "key1": base64.urlsafe_b64encode(sample_keys["key1"]).decode().rstrip("="),
            "key2": base64.urlsafe_b64encode(sample_keys["key2"]).decode().rstrip("="),
        }

        with patch.dict(
            os.environ,
            {
                "AUTH_ENC_KEYS": json.dumps(keys_json),
                "AUTH_ENC_ACTIVE_KID": "key1",
            },
        ):
            cipher = TokenCipher.from_env()
            assert cipher.active_kid == "key1"
            assert cipher.has_key("key1")
            assert cipher.has_key("key2")

    def test_from_env_invalid_key_size(self) -> None:
        """Test from_env fails with invalid key size."""
        keys_json = {
            "key1": base64.urlsafe_b64encode(b"tooshort").decode(),
        }

        with (
            patch.dict(
                os.environ,
                {
                    "AUTH_ENC_KEYS": json.dumps(keys_json),
                    "AUTH_ENC_ACTIVE_KID": "key1",
                },
            ),
            pytest.raises(KeyConfigError, match="must be 128/192/256-bit"),
        ):
            TokenCipher.from_env()

    def test_encrypt_decrypt_basic(self, cipher: TokenCipher) -> None:
        """Test basic encryption and decryption."""
        plaintext = "Hello, World! This is a secret message."

        envelope = cipher.encrypt(plaintext)
        decrypted = cipher.decrypt(envelope)

        assert decrypted == plaintext

        # Verify envelope structure
        obj = json.loads(envelope)
        assert obj["v"] == 1
        assert obj["kid"] == "key1"
        assert "iv" in obj
        assert "ct" in obj

    def test_encrypt_decrypt_with_aad(self, cipher: TokenCipher) -> None:
        """Test encryption with additional authenticated data."""
        plaintext = "Secret with context"
        aad = b"user_id=123&session=abc"

        envelope = cipher.encrypt(plaintext, aad)
        decrypted = cipher.decrypt(envelope, aad)

        assert decrypted == plaintext

        # Verify AAD is included in envelope
        obj = json.loads(envelope)
        assert "aad" in obj

    def test_decrypt_with_wrong_aad_fails(self, cipher: TokenCipher) -> None:
        """Test decryption fails with wrong AAD."""
        plaintext = "Secret with context"
        aad = b"user_id=123"
        wrong_aad = b"user_id=456"

        envelope = cipher.encrypt(plaintext, aad)

        with pytest.raises(ValueError, match="AAD mismatch"):
            cipher.decrypt(envelope, wrong_aad)

    def test_decrypt_with_missing_aad_fails(self, cipher: TokenCipher) -> None:
        """Test decryption fails when AAD is missing."""
        plaintext = "Secret with context"
        aad = b"user_id=123"

        envelope = cipher.encrypt(plaintext, aad)

        with pytest.raises(ValueError, match="AAD mismatch"):
            cipher.decrypt(envelope, None)

    def test_decrypt_tampered_ciphertext_fails(self, cipher: TokenCipher) -> None:
        """Test decryption fails with tampered ciphertext."""
        plaintext = "Original message"
        envelope = cipher.encrypt(plaintext)

        # Tamper with ciphertext
        obj = json.loads(envelope)
        obj["ct"] = base64.urlsafe_b64encode(b"tampered").decode().rstrip("=")
        tampered_envelope = json.dumps(obj)

        from cryptography.exceptions import InvalidTag

        with pytest.raises(InvalidTag):
            cipher.decrypt(tampered_envelope)

    def test_decrypt_with_different_key(self, sample_keys: dict[str, bytes]) -> None:
        """Test decryption with rotated keys."""
        # Encrypt with key1
        cipher1 = TokenCipher(keys=sample_keys, active_kid="key1")
        plaintext = "Message encrypted with key1"
        envelope = cipher1.encrypt(plaintext)

        # Decrypt with cipher that has key2 active but still has key1
        cipher2 = TokenCipher(keys=sample_keys, active_kid="key2")
        decrypted = cipher2.decrypt(envelope)

        assert decrypted == plaintext

    def test_decrypt_with_missing_key_fails(self, sample_keys: dict[str, bytes]) -> None:
        """Test decryption fails when key is not available."""
        cipher1 = TokenCipher(keys={"key1": sample_keys["key1"]}, active_kid="key1")
        envelope = cipher1.encrypt("Secret")

        # Try to decrypt with cipher that doesn't have key1
        cipher2 = TokenCipher(keys={"key2": sample_keys["key2"]}, active_kid="key2")

        with pytest.raises(KeyError, match="Key 'key1' unavailable"):
            cipher2.decrypt(envelope)

    def test_needs_rotation(self, sample_keys: dict[str, bytes]) -> None:
        """Test detection of envelopes needing rotation."""
        cipher1 = TokenCipher(keys=sample_keys, active_kid="key1")
        envelope_old = cipher1.encrypt("Old message")

        # Switch active key
        cipher2 = TokenCipher(keys=sample_keys, active_kid="key2")
        envelope_new = cipher2.encrypt("New message")

        assert cipher2.needs_rotation(envelope_old) is True
        assert cipher2.needs_rotation(envelope_new) is False

    def test_rotate(self, sample_keys: dict[str, bytes]) -> None:
        """Test key rotation."""
        # Encrypt with old key
        cipher1 = TokenCipher(keys=sample_keys, active_kid="key1")
        plaintext = "Message to rotate"
        envelope_old = cipher1.encrypt(plaintext)

        # Rotate to new key
        cipher2 = TokenCipher(keys=sample_keys, active_kid="key2")
        envelope_new = cipher2.rotate(envelope_old)

        # Verify new envelope uses new key
        obj = json.loads(envelope_new)
        assert obj["kid"] == "key2"

        # Verify decryption still works
        decrypted = cipher2.decrypt(envelope_new)
        assert decrypted == plaintext

    def test_rotate_with_aad(self, sample_keys: dict[str, bytes]) -> None:
        """Test key rotation with AAD."""
        cipher1 = TokenCipher(keys=sample_keys, active_kid="key1")
        plaintext = "Message with AAD"
        aad = b"context"
        envelope_old = cipher1.encrypt(plaintext, aad)

        cipher2 = TokenCipher(keys=sample_keys, active_kid="key2")
        envelope_new = cipher2.rotate(envelope_old, aad)

        decrypted = cipher2.decrypt(envelope_new, aad)
        assert decrypted == plaintext

    def test_invalid_envelope_version(self, cipher: TokenCipher) -> None:
        """Test decryption fails with unsupported version."""
        envelope = json.dumps({"v": 2, "kid": "key1", "iv": "x", "ct": "y"})

        with pytest.raises(ValueError, match="Unsupported ciphertext version"):
            cipher.decrypt(envelope)

    def test_malformed_envelope(self, cipher: TokenCipher) -> None:
        """Test decryption fails with malformed envelope."""
        with pytest.raises(json.JSONDecodeError):
            cipher.decrypt("not json")

        with pytest.raises(KeyError):
            cipher.decrypt(json.dumps({"v": 1}))  # Missing kid

    def test_empty_plaintext(self, cipher: TokenCipher) -> None:
        """Test encryption of empty string."""
        plaintext = ""
        envelope = cipher.encrypt(plaintext)
        decrypted = cipher.decrypt(envelope)
        assert decrypted == plaintext

    def test_large_plaintext(self, cipher: TokenCipher) -> None:
        """Test encryption of large plaintext."""
        plaintext = "x" * 10000
        envelope = cipher.encrypt(plaintext)
        decrypted = cipher.decrypt(envelope)
        assert decrypted == plaintext

    def test_unicode_plaintext(self, cipher: TokenCipher) -> None:
        """Test encryption of unicode text."""
        plaintext = "Hello 世界 🌍 مرحبا"
        envelope = cipher.encrypt(plaintext)
        decrypted = cipher.decrypt(envelope)
        assert decrypted == plaintext
