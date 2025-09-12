"""Tests for OAuth 2.1 PAR client."""

from __future__ import annotations

import base64
import hashlib

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from httpx import Response

from app.domain.auth.par_client import PARClient


class TestPARClient:
    """Test suite for PARClient."""

    @pytest.fixture
    def metadata_with_par(self) -> dict:
        """OAuth metadata with PAR support."""
        return {
            "issuer": "https://auth.example.com",
            "authorization_endpoint": "https://auth.example.com/authorize",
            "token_endpoint": "https://auth.example.com/token",
            "pushed_authorization_request_endpoint": "https://auth.example.com/par",
            "revocation_endpoint": "https://auth.example.com/revoke",
            "jwks_uri": "https://auth.example.com/jwks",
        }

    @pytest.fixture
    def metadata_without_par(self) -> dict:
        """OAuth metadata without PAR support."""
        return {
            "issuer": "https://auth.example.com",
            "authorization_endpoint": "https://auth.example.com/authorize",
            "token_endpoint": "https://auth.example.com/token",
            "revocation_endpoint": "https://auth.example.com/revoke",
            "jwks_uri": "https://auth.example.com/jwks",
        }

    @pytest.fixture
    def client_with_par(self, metadata_with_par: dict) -> PARClient:
        """Create PAR client with PAR-enabled provider."""
        return PARClient(
            metadata=metadata_with_par,
            client_id="test-client",
            client_secret="test-secret",  # noqa: S106
            redirect_uri="https://app.example.com/callback",
        )

    @pytest.fixture
    def client_without_par(self, metadata_without_par: dict) -> PARClient:
        """Create PAR client with non-PAR provider."""
        return PARClient(
            metadata=metadata_without_par,
            client_id="test-client",
            client_secret="test-secret",  # noqa: S106
            redirect_uri="https://app.example.com/callback",
        )

    @pytest.fixture
    def public_client(self, metadata_with_par: dict) -> PARClient:
        """Create public PAR client (no secret)."""
        return PARClient(
            metadata=metadata_with_par,
            client_id="test-public-client",
            client_secret=None,
            redirect_uri="https://app.example.com/callback",
        )

    def test_supports_par(
        self,
        client_with_par: PARClient,
        client_without_par: PARClient,
    ) -> None:
        """Test PAR support detection."""
        assert client_with_par.supports_par() is True
        assert client_without_par.supports_par() is False

    @pytest.mark.asyncio()
    async def test_build_authorize_url_without_par(
        self,
        client_without_par: PARClient,
    ) -> None:
        """Test building authorization URL without PAR."""
        url, params, verifier = await client_without_par.build_authorize_url(
            scope="openid profile email",
            state="test-state-123",
            nonce="test-nonce-456",
        )

        assert url == "https://auth.example.com/authorize"
        assert params["response_type"] == "code"
        assert params["client_id"] == "test-client"
        assert params["redirect_uri"] == "https://app.example.com/callback"
        assert params["scope"] == "openid profile email"
        assert params["state"] == "test-state-123"
        assert params["nonce"] == "test-nonce-456"
        assert params["code_challenge_method"] == "S256"
        assert "code_challenge" in params

        assert len(verifier) > 40
        expected_challenge = (
            base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest())
            .decode()
            .rstrip("=")
        )
        assert params["code_challenge"] == expected_challenge

    @pytest.mark.asyncio()
    async def test_build_authorize_url_with_par(
        self,
        client_with_par: PARClient,
    ) -> None:
        """Test building authorization URL with PAR."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = {
            "request_uri": "urn:ietf:params:oauth:request_uri:abc123",
            "expires_in": 600,
        }
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post.return_value = mock_response
            mock_client_class.return_value = mock_client

            url, params, verifier = await client_with_par.build_authorize_url(
                scope="openid profile",
                state="test-state",
            )

            assert url == "https://auth.example.com/authorize"
            assert params == {
                "client_id": "test-client",
                "request_uri": "urn:ietf:params:oauth:request_uri:abc123",
            }
            assert len(verifier) > 40

            mock_client.post.assert_called_once()
            call_args = mock_client.post.call_args
            assert call_args[0][0] == "https://auth.example.com/par"
            assert call_args[1]["auth"] == ("test-client", "test-secret")

    @pytest.mark.asyncio()
    async def test_build_authorize_url_public_client(
        self,
        public_client: PARClient,
    ) -> None:
        """Test building authorization URL with public client."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = {
            "request_uri": "urn:ietf:params:oauth:request_uri:xyz789",
        }
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post.return_value = mock_response
            mock_client_class.return_value = mock_client

            _, _, _ = await public_client.build_authorize_url(
                scope="openid",
                state="state",
            )

            mock_client.post.assert_called_once()
            call_args = mock_client.post.call_args
            assert call_args[1]["auth"] is None

    @pytest.mark.asyncio()
    async def test_exchange_code(
        self,
        client_with_par: PARClient,
    ) -> None:
        """Test exchanging authorization code for tokens."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = {
            "access_token": "access-token-123",
            "refresh_token": "refresh-token-456",
            "id_token": "id-token-789",
            "token_type": "Bearer",
            "expires_in": 3600,
        }
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post.return_value = mock_response
            mock_client_class.return_value = mock_client

            tokens = await client_with_par.exchange_code(
                code="auth-code-abc",
                verifier="pkce-verifier-xyz",
            )

            assert tokens["access_token"] == "access-token-123"
            assert tokens["refresh_token"] == "refresh-token-456"
            assert tokens["id_token"] == "id-token-789"

            mock_client.post.assert_called_once()
            call_args = mock_client.post.call_args
            assert call_args[0][0] == "https://auth.example.com/token"

            post_data = call_args[1]["data"]
            assert post_data["grant_type"] == "authorization_code"
            assert post_data["code"] == "auth-code-abc"
            assert post_data["code_verifier"] == "pkce-verifier-xyz"

    @pytest.mark.asyncio()
    async def test_refresh_access_token(
        self,
        client_with_par: PARClient,
    ) -> None:
        """Test refreshing access token."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = {
            "access_token": "new-access-token",
            "refresh_token": "new-refresh-token",
            "token_type": "Bearer",
            "expires_in": 3600,
        }
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post.return_value = mock_response
            mock_client_class.return_value = mock_client

            tokens = await client_with_par.refresh_access_token(
                refresh_token="old-refresh-token",  # noqa: S106
            )

            assert tokens["access_token"] == "new-access-token"
            assert tokens["refresh_token"] == "new-refresh-token"

            mock_client.post.assert_called_once()
            call_args = mock_client.post.call_args
            post_data = call_args[1]["data"]
            assert post_data["grant_type"] == "refresh_token"
            assert post_data["refresh_token"] == "old-refresh-token"

    @pytest.mark.asyncio()
    async def test_revoke_token(
        self,
        client_with_par: PARClient,
    ) -> None:
        """Test revoking a token."""
        mock_response = MagicMock(spec=Response)
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.post.return_value = mock_response
            mock_client_class.return_value = mock_client

            await client_with_par.revoke_token(
                token="refresh-token-to-revoke",  # noqa: S106
                token_type_hint="refresh_token",  # noqa: S106
            )

            mock_client.post.assert_called_once()
            call_args = mock_client.post.call_args
            assert call_args[0][0] == "https://auth.example.com/revoke"

            post_data = call_args[1]["data"]
            assert post_data["token"] == "refresh-token-to-revoke"
            assert post_data["token_type_hint"] == "refresh_token"

    @pytest.mark.asyncio()
    async def test_revoke_token_no_endpoint(
        self,
        client_without_par: PARClient,
    ) -> None:
        """Test revoke token when no revocation endpoint exists."""
        client_without_par.meta.pop("revocation_endpoint")

        await client_without_par.revoke_token("some-token")

    @pytest.mark.asyncio()
    async def test_discover_metadata(self) -> None:
        """Test metadata discovery."""
        mock_response = MagicMock(spec=Response)
        mock_response.json.return_value = {
            "issuer": "https://auth.example.com",
            "authorization_endpoint": "https://auth.example.com/authorize",
            "token_endpoint": "https://auth.example.com/token",
        }
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__.return_value = mock_client
            mock_client.get.return_value = mock_response
            mock_client_class.return_value = mock_client

            metadata = await PARClient.discover_metadata("https://auth.example.com")

            assert metadata["issuer"] == "https://auth.example.com"
            assert "authorization_endpoint" in metadata
            assert "token_endpoint" in metadata

            mock_client.get.assert_called_once_with(
                "https://auth.example.com/.well-known/openid-configuration"
            )
