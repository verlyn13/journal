"""JWKS (JSON Web Key Set) service for public key distribution."""

from __future__ import annotations

import hashlib
import json
import logging

from datetime import UTC, datetime, timedelta
from typing import Any, cast

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.key_manager import KeyManager
from app.infra.crypto.key_generation import Ed25519KeyGenerator


logger = logging.getLogger(__name__)


class JWKSService:
    """Service for generating and caching JWKS responses."""

    # Cache configuration
    CACHE_TTL = 300  # 5 minutes in Redis
    CDN_MAX_AGE = 3600  # 1 hour for CDN
    EDGE_TTL = 300  # 5 minutes at edge

    def __init__(
        self,
        session: AsyncSession,
        redis: Redis,
        key_manager: KeyManager | None = None,
    ) -> None:
        """Initialize JWKS service.

        Args:
            session: Database session
            redis: Redis client for caching
            key_manager: Optional key manager instance
        """
        self.session = session
        self.redis = redis
        self.key_manager = key_manager or KeyManager(session, redis)

        # Cache keys
        self._jwks_cache_key = "auth:jwks:response"
        self._jwks_etag_key = "auth:jwks:etag"
        self._jwks_last_modified_key = "auth:jwks:last_modified"

    async def get_jwks(self) -> dict[str, Any]:
        """Get the JWKS response with all active public keys.

        Returns:
            JWKS response dictionary with keys array
        """
        # Try cache first
        cached_response = await self._get_cached_jwks()
        if cached_response:
            return cached_response

        # Build fresh JWKS response
        jwks_response = await self._build_jwks_response()

        # Cache the response
        await self._cache_jwks_response(jwks_response)

        return jwks_response

    async def get_jwks_with_headers(self) -> tuple[dict[str, Any], dict[str, str]]:
        """Get JWKS response with appropriate HTTP headers for caching.

        Returns:
            Tuple of (JWKS response, HTTP headers dict)
        """
        jwks_response = await self.get_jwks()

        # Generate ETag from response content
        response_json = json.dumps(jwks_response, sort_keys=True)
        etag = f'"{hashlib.sha256(response_json.encode()).hexdigest()}"'

        # Get or set last modified time
        last_modified = await self._get_last_modified()

        headers = {
            "Content-Type": "application/json",
            "Cache-Control": f"public, max-age={self.CDN_MAX_AGE}, s-maxage={self.EDGE_TTL}",
            "ETag": etag,
            "Last-Modified": last_modified.strftime("%a, %d %b %Y %H:%M:%S GMT"),
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            # Edge optimization hints
            "CDN-Cache-Control": f"max-age={self.CDN_MAX_AGE}",
            "Cloudflare-CDN-Cache-Control": f"max-age={self.CDN_MAX_AGE}",
            "Vercel-CDN-Cache-Control": f"max-age={self.EDGE_TTL}",
        }

        return jwks_response, headers

    async def _build_jwks_response(self) -> dict[str, Any]:
        """Build the JWKS response from current verification keys.

        Returns:
            JWKS response dictionary
        """
        # Get all verification keys from key manager
        verification_keys = await self.key_manager.get_verification_keys()

        # Convert keys to JWK format
        jwks_keys = []
        for key_pair in verification_keys:
            # Serialize to get JWK public key
            key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)
            jwk = key_material.jwk_public

            # Add edge optimization hint
            jwk["edge_optimized"] = True

            jwks_keys.append(jwk)

        # Build response with metadata
        return {
            "keys": jwks_keys,
            "cache_max_age": self.CDN_MAX_AGE,
            "edge_ttl": self.EDGE_TTL,
            # Optional: Include next rotation hint for clients
            "next_rotation_hint": (datetime.now(UTC) + timedelta(days=7)).isoformat(),
        }

    async def _get_cached_jwks(self) -> dict[str, Any] | None:
        """Get cached JWKS response from Redis.

        Returns:
            Cached JWKS response or None if not cached
        """
        try:
            cached_data = await self.redis.get(self._jwks_cache_key)
            if cached_data:
                return cast(dict[str, Any], json.loads(cached_data.decode()))
        except (ConnectionError, TimeoutError, ValueError) as e:
            # Cache miss or error, will regenerate
            logger.debug("Cache read failed: %s", e)

        return None

    async def _cache_jwks_response(self, response: dict[str, Any]) -> None:
        """Cache JWKS response in Redis.

        Args:
            response: JWKS response to cache
        """
        try:
            # Cache the response
            response_json = json.dumps(response)
            await self.redis.setex(self._jwks_cache_key, self.CACHE_TTL, response_json)

            # Update last modified time
            now = datetime.now(UTC)
            await self.redis.setex(self._jwks_last_modified_key, self.CACHE_TTL, now.isoformat())

            # Store ETag
            etag = hashlib.sha256(response_json.encode()).hexdigest()
            await self.redis.setex(self._jwks_etag_key, self.CACHE_TTL, etag)
        except (ConnectionError, TimeoutError) as e:
            # Caching failure should not break the response
            logger.warning("Failed to cache JWKS response: %s", e)

    async def _get_last_modified(self) -> datetime:
        """Get last modified time for JWKS.

        Returns:
            Last modified datetime
        """
        try:
            cached_time = await self.redis.get(self._jwks_last_modified_key)
            if cached_time:
                return datetime.fromisoformat(cached_time.decode())
        except (ConnectionError, TimeoutError, ValueError) as e:
            logger.debug("Failed to get last modified time: %s", e)

        # Default to current time if not cached
        return datetime.now(UTC)

    async def invalidate_cache(self) -> None:
        """Invalidate JWKS cache (e.g., after key rotation)."""
        try:
            await self.redis.delete(
                self._jwks_cache_key, self._jwks_etag_key, self._jwks_last_modified_key
            )
        except (ConnectionError, TimeoutError) as e:
            # Cache invalidation failure is not critical
            logger.warning("Cache invalidation failed: %s", e)

    async def check_etag(self, client_etag: str | None) -> bool:
        """Check if client's ETag matches current JWKS.

        Args:
            client_etag: ETag from client's If-None-Match header

        Returns:
            True if ETag matches (client has current version)
        """
        if not client_etag:
            return False

        try:
            current_etag = await self.redis.get(self._jwks_etag_key)
            if current_etag:
                # Remove quotes if present for comparison
                client_etag = client_etag.strip('"')
                current_etag = current_etag.decode().strip('"')
                return cast(bool, client_etag == current_etag)
        except (ConnectionError, TimeoutError, ValueError) as e:
            logger.debug("Failed to get last modified time: %s", e)

        return False
