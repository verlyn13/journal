"""Tests for OIDC token validation."""

from __future__ import annotations

import time

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from httpx import Response
from jose import jwt  # noqa: F401

from app.security.oidc import (
    extract_standard_claims,
    fetch_userinfo,
    introspect_token,
    validate_id_token,
)


class TestOIDCValidation:
    """Test suite for OIDC validation functions."""

    @pytest.fixture
    def jwks_response(self) -> dict:
        """Mock JWKS response."""
        return {
            "keys": [
                {
                    "kty": "RSA",
                    "kid": "test-key-1",
                    "use": "sig",
                    "alg": "RS256",
                    "n": "test-modulus",
                    "e": "AQAB",
                }
            ]
        }

    @pytest.fixture
    def id_token_claims(self) -> dict:
        """Valid ID token claims."""
        return {
            "iss": "https://auth.example.com",
            "sub": "user123",
            "aud": "test-client",
            "exp": int(time.time()) + 3600,
            "iat": int(time.time()),
            "nonce": "test-nonce",
            "email": "user@example.com",
            "email_verified": True,
        }

    @pytest.mark.asyncio()
    async def test_validate_id_token_success(
        self,
        jwks_response: dict,
        id_token_claims: dict,
    ) -> None:
        """Test successful ID token validation."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = jwks_response
        mock_response.raise_for_status = MagicMock()

        with (
            patch("httpx.AsyncClient") as mock_client_class,
            patch("app.security.oidc.jwt.get_unverified_header") as mock_header,
            patch("app.security.oidc.jwt.decode") as mock_decode,
        ):
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.get.return_value = mock_response
            mock_client_class.return_value = mock_client

            mock_header.return_value = {"kid": "test-key-1"}
            mock_decode.return_value = id_token_claims

            result = await validate_id_token(
                id_token="test.id.token",  # noqa: S106
                issuer="https://auth.example.com",
                audience="test-client",
                nonce_expected="test-nonce",
                jwks_uri="https://auth.example.com/jwks",
            )

            assert result["sub"] == "user123"
            assert result["email"] == "user@example.com"

            mock_client.get.assert_called_once_with("https://auth.example.com/jwks")
            mock_decode.assert_called_once()

    @pytest.mark.asyncio()
    async def test_validate_id_token_nonce_mismatch(
        self,
        jwks_response: dict,
        id_token_claims: dict,
    ) -> None:
        """Test ID token validation fails on nonce mismatch."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = jwks_response
        mock_response.raise_for_status = MagicMock()

        with (
            patch("httpx.AsyncClient") as mock_client_class,
            patch("app.security.oidc.jwt.get_unverified_header") as mock_header,
            patch("app.security.oidc.jwt.decode") as mock_decode,
        ):
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.get.return_value = mock_response
            mock_client_class.return_value = mock_client

            mock_header.return_value = {"kid": "test-key-1"}
            mock_decode.return_value = id_token_claims

            with pytest.raises(ValueError, match="Nonce mismatch"):
                await validate_id_token(
                    id_token="test.id.token",  # noqa: S106
                    issuer="https://auth.example.com",
                    audience="test-client",
                    nonce_expected="wrong-nonce",
                    jwks_uri="https://auth.example.com/jwks",
                )

    @pytest.mark.asyncio()
    async def test_validate_id_token_auth_too_old(
        self,
        jwks_response: dict,
        id_token_claims: dict,
    ) -> None:
        """Test ID token validation fails when auth_time is too old."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = jwks_response
        mock_response.raise_for_status = MagicMock()

        id_token_claims["auth_time"] = int(time.time()) - 7200

        with (
            patch("httpx.AsyncClient") as mock_client_class,
            patch("app.security.oidc.jwt.get_unverified_header") as mock_header,
            patch("app.security.oidc.jwt.decode") as mock_decode,
        ):
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.get.return_value = mock_response
            mock_client_class.return_value = mock_client

            mock_header.return_value = {"kid": "test-key-1"}
            mock_decode.return_value = id_token_claims

            with pytest.raises(ValueError, match="Authentication too old"):
                await validate_id_token(
                    id_token="test.id.token",  # noqa: S106
                    issuer="https://auth.example.com",
                    audience="test-client",
                    nonce_expected="test-nonce",
                    jwks_uri="https://auth.example.com/jwks",
                )

    @pytest.mark.asyncio()
    async def test_validate_id_token_missing_key(
        self,
        jwks_response: dict,
    ) -> None:
        """Test ID token validation fails when key not found in JWKS."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = jwks_response
        mock_response.raise_for_status = MagicMock()

        with (
            patch("httpx.AsyncClient") as mock_client_class,
            patch("app.security.oidc.jwt.get_unverified_header") as mock_header,
        ):
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.get.return_value = mock_response
            mock_client_class.return_value = mock_client

            mock_header.return_value = {"kid": "unknown-key"}

            with pytest.raises(ValueError, match="Unable to find matching key"):
                await validate_id_token(
                    id_token="test.id.token",  # noqa: S106
                    issuer="https://auth.example.com",
                    audience="test-client",
                    nonce_expected=None,
                    jwks_uri="https://auth.example.com/jwks",
                )

    @pytest.mark.asyncio()
    async def test_fetch_userinfo(self) -> None:
        """Test fetching user info from OIDC endpoint."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = {
            "sub": "user123",
            "email": "user@example.com",
            "name": "Test User",
            "picture": "https://example.com/photo.jpg",
        }
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.get.return_value = mock_response
            mock_client_class.return_value = mock_client

            userinfo = await fetch_userinfo(
                access_token="access-token-123",  # noqa: S106
                userinfo_endpoint="https://auth.example.com/userinfo",
            )

            assert userinfo["sub"] == "user123"
            assert userinfo["email"] == "user@example.com"
            assert userinfo["name"] == "Test User"

            mock_client.get.assert_called_once()
            call_args = mock_client.get.call_args
            assert call_args[0][0] == "https://auth.example.com/userinfo"
            assert call_args[1]["headers"]["Authorization"] == "Bearer access-token-123"

    def test_extract_standard_claims(self) -> None:
        """Test extracting standard OIDC claims."""
        claims = {
            "sub": "user123",
            "email": "user@example.com",
            "email_verified": True,
            "name": "Test User",
            "given_name": "Test",
            "family_name": "User",
            "picture": "https://example.com/photo.jpg",
            "locale": "en-US",
            "updated_at": 1234567890,
            "custom_claim": "should be ignored",
        }

        profile = extract_standard_claims(claims)

        assert profile["sub"] == "user123"
        assert profile["email"] == "user@example.com"
        assert profile["email_verified"] is True
        assert profile["name"] == "Test User"
        assert profile["given_name"] == "Test"
        assert profile["family_name"] == "User"
        assert profile["picture"] == "https://example.com/photo.jpg"
        assert profile["locale"] == "en-US"
        assert profile["updated_at"] == 1234567890
        assert "custom_claim" not in profile

    def test_extract_standard_claims_minimal(self) -> None:
        """Test extracting minimal OIDC claims."""
        claims = {
            "sub": "user123",
            "email": "user@example.com",
        }

        profile = extract_standard_claims(claims)

        assert profile == {
            "sub": "user123",
            "email": "user@example.com",
            "email_verified": False,
        }

    @pytest.mark.asyncio()
    async def test_introspect_token_with_secret(self) -> None:
        """Test token introspection with client secret."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = {
            "active": True,
            "scope": "openid profile email",
            "client_id": "test-client",
            "username": "user123",
            "exp": int(time.time()) + 3600,
        }
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post.return_value = mock_response
            mock_client_class.return_value = mock_client

            result = await introspect_token(
                token="access-token-123",  # noqa: S106
                introspection_endpoint="https://auth.example.com/introspect",
                client_id="test-client",
                client_secret="test-secret",  # noqa: S106
            )

            assert result["active"] is True
            assert result["username"] == "user123"

            mock_client.post.assert_called_once()
            call_args = mock_client.post.call_args
            assert call_args[0][0] == "https://auth.example.com/introspect"
            assert call_args[1]["auth"] == ("test-client", "test-secret")

    @pytest.mark.asyncio()
    async def test_introspect_token_public_client(self) -> None:
        """Test token introspection without client secret."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = {
            "active": False,
        }
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post.return_value = mock_response
            mock_client_class.return_value = mock_client

            result = await introspect_token(
                token="expired-token",  # noqa: S106
                introspection_endpoint="https://auth.example.com/introspect",
                client_id="test-client",
                client_secret=None,
            )

            assert result["active"] is False

            mock_client.post.assert_called_once()
            call_args = mock_client.post.call_args
            assert call_args[1]["auth"] is None
