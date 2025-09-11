"""JWKS endpoint for public key distribution."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Header, Response, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_session
from app.infra.redis import get_redis_client
from app.services.jwks_service import JWKSService
from app.telemetry.jwks_metrics import JWKSMetrics


router = APIRouter(prefix="/.well-known", tags=["jwks"])


@router.get("/jwks.json", response_model=dict[str, Any])
async def get_jwks(
    response: Response,
    if_none_match: str | None = Header(None),
    session: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis_client),
) -> dict[str, Any]:
    """Get JSON Web Key Set for JWT verification.
    
    This endpoint provides public keys used to verify JWTs issued by this service.
    It includes appropriate caching headers for CDN and edge optimization.
    
    Args:
        response: FastAPI response object for setting headers
        if_none_match: Client's ETag for conditional requests
        session: Database session
        redis: Redis client
        
    Returns:
        JWKS response with public keys
    """
    jwks_service = JWKSService(session, redis)
    metrics = JWKSMetrics(redis)

    # Use metrics context manager to track performance
    async with metrics.measure_time() as metrics_data:
        # Check if client has current version (ETag validation)
        if if_none_match and await jwks_service.check_etag(if_none_match):
            # Client has current version, return 304 Not Modified
            response.status_code = status.HTTP_304_NOT_MODIFIED
            metrics_data["etag_match"] = True
            return {}

        # Get JWKS (will use cache if available)
        # Check if response is from cache by seeing if it was built fresh
        cached = await jwks_service._get_cached_jwks()
        metrics_data["cache_hit"] = cached is not None

        # Get JWKS with headers
        jwks_response, headers = await jwks_service.get_jwks_with_headers()

        # Set all headers for optimal caching
        for header_name, header_value in headers.items():
            response.headers[header_name] = header_value

        return jwks_response


@router.get("/openid-configuration", response_model=dict[str, Any])
async def get_openid_configuration(
    response: Response,
) -> dict[str, Any]:
    """Get OpenID Connect discovery document.
    
    This provides metadata about the authentication service,
    including the JWKS URI for key discovery.
    
    Args:
        response: FastAPI response object for setting headers
        
    Returns:
        OpenID configuration document
    """
    # Set caching headers
    response.headers["Cache-Control"] = "public, max-age=86400"  # 24 hours
    response.headers["Content-Type"] = "application/json"

    # Return discovery document
    # Note: Update these URLs based on your actual deployment
    return {
        "issuer": "https://api.yourdomain.com",
        "jwks_uri": "https://api.yourdomain.com/.well-known/jwks.json",
        "authorization_endpoint": "https://api.yourdomain.com/auth/authorize",
        "token_endpoint": "https://api.yourdomain.com/auth/token",
        "userinfo_endpoint": "https://api.yourdomain.com/auth/userinfo",
        "revocation_endpoint": "https://api.yourdomain.com/auth/revoke",
        "response_types_supported": ["code", "token", "id_token"],
        "subject_types_supported": ["public"],
        "id_token_signing_alg_values_supported": ["EdDSA"],
        "scopes_supported": ["openid", "profile", "email"],
        "token_endpoint_auth_methods_supported": ["client_secret_basic", "client_secret_post"],
        "claims_supported": [
            "sub", "aud", "exp", "iat", "iss",
            "email", "email_verified", "name", "preferred_username"
        ],
    }


@router.get("/jwks-metrics", response_model=dict[str, Any])
async def get_jwks_metrics(
    redis: Redis = Depends(get_redis_client),
) -> dict[str, Any]:
    """Get JWKS performance metrics.
    
    This endpoint provides performance metrics for the JWKS endpoint,
    including cache hit rates, response times, and key rotation history.
    
    Args:
        redis: Redis client
        
    Returns:
        Metrics summary
    """
    metrics = JWKSMetrics(redis)
    return await metrics.get_metrics_summary()
