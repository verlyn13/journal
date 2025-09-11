"""Tests for enhanced authentication with token encryption."""

from __future__ import annotations

import json

from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest

from app.security.enhanced_auth import SecureTokenService
from app.security.token_cipher import TokenCipher


class TestSecureTokenService:
    """Test suite for SecureTokenService."""

    @pytest.fixture
    def mock_cipher(self) -> MagicMock:
        """Create mock cipher for testing."""
        cipher = MagicMock(spec=TokenCipher)
        cipher.encrypt.return_value = '{"encrypted": "data"}'
        cipher.decrypt.return_value = '{"test": "payload"}'
        cipher.needs_rotation.return_value = False
        return cipher

    @pytest.fixture
    def service_with_cipher(self, mock_cipher: MagicMock) -> SecureTokenService:
        """Create service with mock cipher."""
        return SecureTokenService(cipher=mock_cipher)

    @pytest.fixture
    def service_without_cipher(self) -> SecureTokenService:
        """Create service without cipher (unencrypted mode)."""
        with patch.object(SecureTokenService, "_get_default_cipher", return_value=None):
            return SecureTokenService()

    def test_create_encrypted_refresh_token_with_cipher(
        self,
        service_with_cipher: SecureTokenService,
        mock_cipher: MagicMock,
    ) -> None:
        """Test creating encrypted refresh token."""
        user_id = uuid4()
        session_id = uuid4()
        device_id = uuid4()

        token = service_with_cipher.create_encrypted_refresh_token(
            user_id=user_id,
            session_id=session_id,
            device_id=device_id,
            ttl_days=30,
        )

        assert token == '{"encrypted": "data"}'

        # Verify encrypt was called with correct AAD
        mock_cipher.encrypt.assert_called_once()
        call_args = mock_cipher.encrypt.call_args
        aad = call_args[0][1]  # Second positional argument
        expected_aad = f"user:{user_id}:session:{session_id}".encode()
        assert aad == expected_aad

        # Verify payload structure
        payload_json = call_args[0][0]  # First positional argument
        payload = json.loads(payload_json)
        assert payload["user_id"] == str(user_id)
        assert payload["session_id"] == str(session_id)
        assert payload["device_id"] == str(device_id)
        assert payload["token_type"] == "refresh"
        assert "created_at" in payload
        assert "expires_at" in payload

    def test_create_encrypted_refresh_token_without_cipher(
        self,
        service_without_cipher: SecureTokenService,
    ) -> None:
        """Test creating unencrypted refresh token when cipher not available."""
        user_id = uuid4()
        session_id = uuid4()

        token = service_without_cipher.create_encrypted_refresh_token(
            user_id=user_id,
            session_id=session_id,
            ttl_days=30,
        )

        # Token should be plain JSON
        payload = json.loads(token)
        assert payload["user_id"] == str(user_id)
        assert payload["session_id"] == str(session_id)
        assert payload["token_type"] == "refresh"

    def test_decrypt_refresh_token_with_cipher(
        self,
        service_with_cipher: SecureTokenService,
        mock_cipher: MagicMock,
    ) -> None:
        """Test decrypting refresh token."""
        user_id = uuid4()
        session_id = uuid4()

        # Setup mock to return valid payload
        valid_payload = {
            "user_id": str(user_id),
            "session_id": str(session_id),
            "expires_at": (datetime.now(UTC) + timedelta(days=1)).isoformat(),
            "token_type": "refresh",
        }
        mock_cipher.decrypt.return_value = json.dumps(valid_payload)

        encrypted_token = '{"v": 1, "kid": "key1"}'  # Looks like encrypted

        payload = service_with_cipher.decrypt_refresh_token(
            encrypted_token,
            expected_user_id=user_id,
            expected_session_id=session_id,
        )

        assert payload["user_id"] == str(user_id)
        assert payload["session_id"] == str(session_id)

        # Verify decrypt was called with correct AAD
        mock_cipher.decrypt.assert_called_once()
        call_args = mock_cipher.decrypt.call_args
        aad = call_args[0][1]
        expected_aad = f"user:{user_id}:session:{session_id}".encode()
        assert aad == expected_aad

    def test_decrypt_refresh_token_expired(
        self,
        service_with_cipher: SecureTokenService,
        mock_cipher: MagicMock,
    ) -> None:
        """Test decrypting expired token raises error."""
        expired_payload = {
            "user_id": str(uuid4()),
            "session_id": str(uuid4()),
            "expires_at": (datetime.now(UTC) - timedelta(days=1)).isoformat(),
            "token_type": "refresh",
        }
        mock_cipher.decrypt.return_value = json.dumps(expired_payload)

        with pytest.raises(ValueError, match="Token has expired"):
            service_with_cipher.decrypt_refresh_token('{"encrypted": "token"}')

    def test_decrypt_refresh_token_user_mismatch(
        self,
        service_with_cipher: SecureTokenService,
        mock_cipher: MagicMock,
    ) -> None:
        """Test decrypting token with wrong user ID raises error."""
        user_id = uuid4()
        wrong_user_id = uuid4()

        payload = {
            "user_id": str(user_id),
            "session_id": str(uuid4()),
            "expires_at": (datetime.now(UTC) + timedelta(days=1)).isoformat(),
            "token_type": "refresh",
        }
        mock_cipher.decrypt.return_value = json.dumps(payload)

        with pytest.raises(ValueError, match="User ID mismatch"):
            service_with_cipher.decrypt_refresh_token(
                '{"encrypted": "token"}',
                expected_user_id=wrong_user_id,
            )

    def test_rotate_token_if_needed(
        self,
        service_with_cipher: SecureTokenService,
        mock_cipher: MagicMock,
    ) -> None:
        """Test token rotation when needed."""
        mock_cipher.needs_rotation.return_value = True
        mock_cipher.rotate.return_value = '{"new": "token"}'

        user_id = uuid4()
        session_id = uuid4()

        new_token = service_with_cipher.rotate_token_if_needed(
            '{"old": "token"}',
            user_id,
            session_id,
        )

        assert new_token == '{"new": "token"}'

        # Verify rotate was called with correct AAD
        mock_cipher.rotate.assert_called_once()
        call_args = mock_cipher.rotate.call_args
        aad = call_args[0][1]
        expected_aad = f"user:{user_id}:session:{session_id}".encode()
        assert aad == expected_aad

    def test_rotate_token_not_needed(
        self,
        service_with_cipher: SecureTokenService,
        mock_cipher: MagicMock,
    ) -> None:
        """Test no rotation when not needed."""
        mock_cipher.needs_rotation.return_value = False

        result = service_with_cipher.rotate_token_if_needed(
            '{"current": "token"}',
            uuid4(),
            uuid4(),
        )

        assert result is None
        mock_cipher.rotate.assert_not_called()

    def test_create_state_token(
        self,
        service_with_cipher: SecureTokenService,
        mock_cipher: MagicMock,
    ) -> None:
        """Test creating encrypted state token."""
        purpose = "oauth_state"
        data = {"redirect": "/dashboard", "nonce": "abc123"}

        token = service_with_cipher.create_state_token(
            purpose=purpose,
            data=data,
            ttl_minutes=10,
        )

        assert token == '{"encrypted": "data"}'

        # Verify encrypt was called with correct AAD
        mock_cipher.encrypt.assert_called_once()
        call_args = mock_cipher.encrypt.call_args
        aad = call_args[0][1]
        expected_aad = f"state:{purpose}".encode()
        assert aad == expected_aad

        # Verify payload structure
        payload_json = call_args[0][0]
        payload = json.loads(payload_json)
        assert payload["purpose"] == purpose
        assert payload["data"] == data
        assert "created_at" in payload
        assert "expires_at" in payload

    def test_verify_state_token(
        self,
        service_with_cipher: SecureTokenService,
        mock_cipher: MagicMock,
    ) -> None:
        """Test verifying state token."""
        purpose = "oauth_state"
        data = {"redirect": "/dashboard", "nonce": "abc123"}

        valid_payload = {
            "purpose": purpose,
            "data": data,
            "expires_at": (datetime.now(UTC) + timedelta(minutes=5)).isoformat(),
        }
        mock_cipher.decrypt.return_value = json.dumps(valid_payload)

        result = service_with_cipher.verify_state_token(
            '{"encrypted": "state"}',
            expected_purpose=purpose,
        )

        assert result == data

        # Verify decrypt was called with correct AAD
        mock_cipher.decrypt.assert_called_once()
        call_args = mock_cipher.decrypt.call_args
        aad = call_args[0][1]
        expected_aad = f"state:{purpose}".encode()
        assert aad == expected_aad

    def test_verify_state_token_wrong_purpose(
        self,
        service_with_cipher: SecureTokenService,
        mock_cipher: MagicMock,
    ) -> None:
        """Test verifying state token with wrong purpose raises error."""
        payload = {
            "purpose": "oauth_state",
            "data": {},
            "expires_at": (datetime.now(UTC) + timedelta(minutes=5)).isoformat(),
        }
        mock_cipher.decrypt.return_value = json.dumps(payload)

        with pytest.raises(ValueError, match="State token purpose mismatch"):
            service_with_cipher.verify_state_token(
                '{"encrypted": "state"}',
                expected_purpose="saml_relay",
            )

    def test_verify_state_token_expired(
        self,
        service_with_cipher: SecureTokenService,
        mock_cipher: MagicMock,
    ) -> None:
        """Test verifying expired state token raises error."""
        payload = {
            "purpose": "oauth_state",
            "data": {},
            "expires_at": (datetime.now(UTC) - timedelta(minutes=1)).isoformat(),
        }
        mock_cipher.decrypt.return_value = json.dumps(payload)

        with pytest.raises(ValueError, match="State token has expired"):
            service_with_cipher.verify_state_token(
                '{"encrypted": "state"}',
                expected_purpose="oauth_state",
            )
