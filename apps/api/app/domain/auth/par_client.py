"""OAuth 2.1 client with PAR (Pushed Authorization Requests) and PKCE support."""

from __future__ import annotations

import base64
import hashlib
import secrets

from typing import Any

import httpx


class PARClient:
    """OAuth 2.1 client with PAR (Pushed Authorization Requests) support."""

    def __init__(
        self,
        metadata: dict[str, Any],
        client_id: str,
        client_secret: str | None,
        redirect_uri: str,
    ) -> None:
        """Initialize PAR client.

        Args:
            metadata: OAuth/OIDC provider metadata
            client_id: OAuth client ID
            client_secret: OAuth client secret (optional for public clients)
            redirect_uri: Registered redirect URI
        """
        self.meta = metadata
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri

    def supports_par(self) -> bool:
        """Check if provider supports PAR."""
        return bool(self.meta.get("pushed_authorization_request_endpoint"))

    async def build_authorize_url(
        self,
        scope: str,
        state: str,
        nonce: str | None = None,
        extra_params: dict[str, str] | None = None,
    ) -> tuple[str, dict[str, str], str]:
        """Build authorization URL with PKCE.

        Uses PAR if supported, falls back to regular auth request.

        Args:
            scope: OAuth scopes to request
            state: State parameter for CSRF protection
            nonce: Nonce for OIDC ID token validation
            extra_params: Additional OAuth parameters

        Returns:
            Tuple of (authorization_url, query_params, pkce_verifier)
        """
        verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip("=")
        challenge = base64.urlsafe_b64encode(
            hashlib.sha256(verifier.encode()).digest()
        ).decode().rstrip("=")

        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": scope,
            "state": state,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        }

        if nonce:
            params["nonce"] = nonce
        if extra_params:
            params.update(extra_params)

        if not self.supports_par():
            return self.meta["authorization_endpoint"], params, verifier

        par_endpoint = self.meta["pushed_authorization_request_endpoint"]
        async with httpx.AsyncClient(timeout=10.0) as client:
            auth = (self.client_id, self.client_secret) if self.client_secret else None
            resp = await client.post(
                par_endpoint,
                data=params,
                auth=auth,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            resp.raise_for_status()
            par_response = resp.json()

        return (
            self.meta["authorization_endpoint"],
            {"client_id": self.client_id, "request_uri": par_response["request_uri"]},
            verifier,
        )

    async def exchange_code(
        self,
        code: str,
        verifier: str,
    ) -> dict[str, Any]:
        """Exchange authorization code for tokens.

        Args:
            code: Authorization code from OAuth callback
            verifier: PKCE verifier generated during authorization

        Returns:
            Token response with access_token, refresh_token, etc.

        Raises:
            httpx.HTTPStatusError: If token exchange fails
        """
        token_endpoint = self.meta["token_endpoint"]

        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.redirect_uri,
            "client_id": self.client_id,
            "code_verifier": verifier,
        }

        if self.client_secret:
            data["client_secret"] = self.client_secret

        async with httpx.AsyncClient(timeout=10.0) as client:
            auth = (self.client_id, self.client_secret) if self.client_secret else None
            resp = await client.post(
                token_endpoint,
                data=data,
                auth=auth if self.client_secret else None,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            resp.raise_for_status()
            return dict(resp.json())

    async def refresh_access_token(
        self,
        refresh_token: str,
    ) -> dict[str, Any]:
        """Refresh an access token.

        Args:
            refresh_token: OAuth refresh token

        Returns:
            New token response

        Raises:
            httpx.HTTPStatusError: If refresh fails
        """
        token_endpoint = self.meta["token_endpoint"]

        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": self.client_id,
        }

        if self.client_secret:
            data["client_secret"] = self.client_secret

        async with httpx.AsyncClient(timeout=10.0) as client:
            auth = (self.client_id, self.client_secret) if self.client_secret else None
            resp = await client.post(
                token_endpoint,
                data=data,
                auth=auth if self.client_secret else None,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            resp.raise_for_status()
            return dict(resp.json())

    async def revoke_token(
        self,
        token: str,
        token_type_hint: str = "refresh_token",  # noqa: S107
    ) -> None:
        """Revoke an OAuth token.

        Args:
            token: Token to revoke
            token_type_hint: Hint about token type (access_token or refresh_token)

        Raises:
            httpx.HTTPStatusError: If revocation fails
        """
        revocation_endpoint = self.meta.get("revocation_endpoint")
        if not revocation_endpoint:
            return

        data = {
            "token": token,
            "token_type_hint": token_type_hint,
            "client_id": self.client_id,
        }

        if self.client_secret:
            data["client_secret"] = self.client_secret

        async with httpx.AsyncClient(timeout=10.0) as client:
            auth = (self.client_id, self.client_secret) if self.client_secret else None
            resp = await client.post(
                revocation_endpoint,
                data=data,
                auth=auth if self.client_secret else None,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            resp.raise_for_status()

    @staticmethod
    async def discover_metadata(issuer: str) -> dict[str, Any]:
        """Discover OAuth/OIDC metadata from well-known endpoint.

        Args:
            issuer: OAuth/OIDC issuer URL

        Returns:
            Provider metadata dictionary

        Raises:
            httpx.HTTPStatusError: If discovery fails
        """
        well_known_url = f"{issuer.rstrip('/')}/.well-known/openid-configuration"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(well_known_url)
            resp.raise_for_status()
            return dict(resp.json())
