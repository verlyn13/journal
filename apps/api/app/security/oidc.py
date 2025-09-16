"""OpenID Connect (OIDC) token validation and utilities."""

from __future__ import annotations

import time
from typing import Any

import httpx
from jose import JWTError, jwt


async def validate_id_token(
    id_token: str,
    issuer: str,
    audience: str,
    nonce_expected: str | None,
    jwks_uri: str,
) -> dict[str, Any]:
    """Validate an OIDC ID token.

    Args:
        id_token: JWT ID token from OIDC provider
        issuer: Expected issuer claim
        audience: Expected audience claim
        nonce_expected: Expected nonce claim (if provided during auth)
        jwks_uri: URL to fetch JWKS for signature verification

    Returns:
        Validated token claims

    Raises:
        ValueError: If token validation fails
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(jwks_uri)
        resp.raise_for_status()
        jwks_data = resp.json()

    try:
        unverified_header = jwt.get_unverified_header(id_token)
        kid = unverified_header.get("kid")

        rsa_key = None
        for key in jwks_data["keys"]:
            if key["kid"] == kid:
                rsa_key = key
                break

        if not rsa_key:
            raise ValueError("Unable to find matching key in JWKS")

        payload = jwt.decode(
            id_token,
            rsa_key,
            algorithms=["RS256"],
            audience=audience,
            issuer=issuer,
            options={
                "verify_signature": True,
                "verify_aud": True,
                "verify_iss": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
            },
        )

        if nonce_expected and payload.get("nonce") != nonce_expected:
            raise ValueError("Nonce mismatch")

        max_age = 3600
        if "auth_time" in payload:
            auth_time = payload["auth_time"]
            if time.time() - auth_time > max_age:
                raise ValueError("Authentication too old")

        return dict(payload)

    except JWTError as e:
        raise ValueError(f"ID token validation failed: {e}") from e


async def fetch_userinfo(
    access_token: str,
    userinfo_endpoint: str,
) -> dict[str, Any]:
    """Fetch user information from OIDC UserInfo endpoint.

    Args:
        access_token: OAuth access token
        userinfo_endpoint: UserInfo endpoint URL

    Returns:
        User information claims

    Raises:
        httpx.HTTPStatusError: If request fails
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            userinfo_endpoint,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        return dict(resp.json())


def extract_standard_claims(claims: dict[str, Any]) -> dict[str, Any]:
    """Extract standard OIDC claims from token or userinfo.

    Args:
        claims: Raw claims from ID token or UserInfo

    Returns:
        Standardized user profile data
    """
    profile = {
        "sub": claims.get("sub"),
        "email": claims.get("email"),
        "email_verified": claims.get("email_verified", False),
        "name": claims.get("name"),
        "given_name": claims.get("given_name"),
        "family_name": claims.get("family_name"),
        "picture": claims.get("picture"),
        "locale": claims.get("locale"),
        "updated_at": claims.get("updated_at"),
    }

    return {k: v for k, v in profile.items() if v is not None}


async def introspect_token(
    token: str,
    introspection_endpoint: str,
    client_id: str,
    client_secret: str | None = None,
) -> dict[str, Any]:
    """Introspect an OAuth token to check its validity.

    Args:
        token: OAuth access or refresh token
        introspection_endpoint: Token introspection endpoint
        client_id: OAuth client ID
        client_secret: OAuth client secret

    Returns:
        Token introspection response

    Raises:
        httpx.HTTPStatusError: If introspection fails
    """
    data = {
        "token": token,
        "client_id": client_id,
    }

    if client_secret:
        data["client_secret"] = client_secret

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            introspection_endpoint,
            data=data,
            auth=(client_id, client_secret) if client_secret else None,  # type: ignore[arg-type]
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        return dict(resp.json())
