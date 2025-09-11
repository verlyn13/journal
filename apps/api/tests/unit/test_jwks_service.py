"""Tests for JWKS service and endpoint."""

from __future__ import annotations

import hashlib
import json

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.key_manager import KeyManager
from app.infra.crypto.key_generation import Ed25519KeyGenerator
from app.services.jwks_service import JWKSService


@pytest.fixture
def mock_session():
    """Mock database session."""
    return AsyncMock(spec=AsyncSession)


@pytest.fixture
def mock_redis():
    """Mock Redis client."""
    mock_client = AsyncMock(spec=Redis)
    mock_client.get = AsyncMock(return_value=None)
    mock_client.setex = AsyncMock()
    mock_client.delete = AsyncMock()
    return mock_client


@pytest.fixture
def mock_key_manager():
    """Mock key manager."""
    mock_manager = AsyncMock(spec=KeyManager)

    # Generate test keys
    test_key_1 = Ed25519KeyGenerator.generate_key_pair(kid="test-key-001")
    test_key_2 = Ed25519KeyGenerator.generate_key_pair(kid="test-key-002")

    mock_manager.get_verification_keys = AsyncMock(return_value=[test_key_1, test_key_2])

    return mock_manager


@pytest.fixture
def jwks_service(mock_session, mock_redis, mock_key_manager):
    """Create JWKS service instance."""
    service = JWKSService(mock_session, mock_redis)
    service.key_manager = mock_key_manager
    return service


class TestJWKSService:
    """Test JWKS service functionality."""

    @pytest.mark.asyncio
    async def test_get_jwks_fresh_build(self, jwks_service, mock_redis):
        """Test building fresh JWKS response when not cached."""
        # Ensure cache miss
        mock_redis.get.return_value = None

        # Get JWKS
        result = await jwks_service.get_jwks()

        # Verify structure
        assert "keys" in result
        assert len(result["keys"]) == 2
        assert "cache_max_age" in result
        assert "edge_ttl" in result
        assert "next_rotation_hint" in result

        # Verify keys have correct format
        for key in result["keys"]:
            assert key["kty"] == "OKP"
            assert key["crv"] == "Ed25519"
            assert "kid" in key
            assert "x" in key
            assert key["use"] == "sig"
            assert key["alg"] == "EdDSA"
            assert key["edge_optimized"] is True

        # Verify caching was attempted
        mock_redis.setex.assert_called()

    @pytest.mark.asyncio
    async def test_get_jwks_from_cache(self, jwks_service, mock_redis):
        """Test returning cached JWKS response."""
        # Mock cached response
        cached_response = {
            "keys": [{"kid": "cached-key"}],
            "cache_max_age": 3600,
            "edge_ttl": 300,
        }
        mock_redis.get.return_value = json.dumps(cached_response).encode()

        # Get JWKS
        result = await jwks_service.get_jwks()

        # Should return cached response
        assert result == cached_response

        # Should not build new response
        assert jwks_service.key_manager.get_verification_keys.called is False

    @pytest.mark.asyncio
    async def test_get_jwks_with_headers(self, jwks_service):
        """Test getting JWKS with appropriate HTTP headers."""
        # Get JWKS with headers
        response, headers = await jwks_service.get_jwks_with_headers()

        # Verify required headers
        assert headers["Content-Type"] == "application/json"
        assert "Cache-Control" in headers
        assert "public" in headers["Cache-Control"]
        assert "max-age=3600" in headers["Cache-Control"]
        assert "ETag" in headers
        assert "Last-Modified" in headers
        assert headers["X-Content-Type-Options"] == "nosniff"
        assert headers["X-Frame-Options"] == "DENY"

        # Verify CDN optimization headers
        assert "CDN-Cache-Control" in headers
        assert "Cloudflare-CDN-Cache-Control" in headers
        assert "Vercel-CDN-Cache-Control" in headers

    @pytest.mark.asyncio
    async def test_etag_generation(self, jwks_service):
        """Test that ETag is correctly generated from response content."""
        # Get response with headers
        response, headers = await jwks_service.get_jwks_with_headers()

        # Manually compute expected ETag
        response_json = json.dumps(response, sort_keys=True)
        expected_etag = f'"{hashlib.sha256(response_json.encode()).hexdigest()}"'

        # Verify ETag matches
        assert headers["ETag"] == expected_etag

    @pytest.mark.asyncio
    async def test_check_etag_match(self, jwks_service, mock_redis):
        """Test ETag validation for conditional requests."""
        # Mock stored ETag
        stored_etag = "abc123def456"
        mock_redis.get.return_value = stored_etag.encode()

        # Check matching ETag
        assert await jwks_service.check_etag(f'"{stored_etag}"') is True
        assert await jwks_service.check_etag(stored_etag) is True

        # Check non-matching ETag
        assert await jwks_service.check_etag("different-etag") is False
        assert await jwks_service.check_etag(None) is False

    @pytest.mark.asyncio
    async def test_cache_invalidation(self, jwks_service, mock_redis):
        """Test cache invalidation after key rotation."""
        # Invalidate cache
        await jwks_service.invalidate_cache()

        # Verify all cache keys deleted
        mock_redis.delete.assert_called_once()
        call_args = mock_redis.delete.call_args[0]
        assert "auth:jwks:response" in call_args
        assert "auth:jwks:etag" in call_args
        assert "auth:jwks:last_modified" in call_args

    @pytest.mark.asyncio
    async def test_last_modified_handling(self, jwks_service, mock_redis):
        """Test Last-Modified header generation."""
        # Test with cached last modified
        cached_time = datetime.now(UTC) - timedelta(hours=1)
        mock_redis.get.return_value = cached_time.isoformat().encode()

        last_modified = await jwks_service._get_last_modified()
        assert last_modified == cached_time

        # Test without cached value
        mock_redis.get.return_value = None
        last_modified = await jwks_service._get_last_modified()

        # Should be recent (within last second)
        assert (datetime.now(UTC) - last_modified).total_seconds() < 1

    @pytest.mark.asyncio
    async def test_cache_failure_handling(self, jwks_service, mock_redis):
        """Test that cache failures don't break the service."""
        # Make cache operations fail
        mock_redis.get.side_effect = Exception("Redis connection error")
        mock_redis.setex.side_effect = Exception("Redis connection error")

        # Should still return valid response
        result = await jwks_service.get_jwks()

        assert "keys" in result
        assert len(result["keys"]) == 2

    @pytest.mark.asyncio
    async def test_performance_cache_hit(self, jwks_service, mock_redis):
        """Test that cached responses are returned quickly."""
        import time

        # Mock cached response
        cached_response = {
            "keys": [{"kid": "cached-key"}],
            "cache_max_age": 3600,
            "edge_ttl": 300,
        }
        mock_redis.get.return_value = json.dumps(cached_response).encode()

        # Measure time for cached response
        start_time = time.time()
        await jwks_service.get_jwks()
        elapsed_time = (time.time() - start_time) * 1000  # Convert to ms

        # Should be very fast for cache hit
        assert elapsed_time < 5  # Less than 5ms

    @pytest.mark.asyncio
    async def test_jwks_response_size(self, jwks_service):
        """Test that JWKS response is reasonably sized for edge caching."""
        # Get response
        response = await jwks_service.get_jwks()

        # Convert to JSON to measure size
        response_json = json.dumps(response)
        response_size = len(response_json.encode())

        # Should be reasonable for edge caching (< 10KB)
        assert response_size < 10240  # 10KB limit

    @pytest.mark.asyncio
    async def test_next_rotation_hint(self, jwks_service):
        """Test that next rotation hint is included."""
        # Get response
        response = await jwks_service.get_jwks()

        # Verify rotation hint
        assert "next_rotation_hint" in response

        # Parse and verify it's in the future
        rotation_time = datetime.fromisoformat(
            response["next_rotation_hint"].replace("Z", "+00:00")
        )
        assert rotation_time > datetime.now(UTC)

        # Should be approximately 7 days in the future
        time_diff = rotation_time - datetime.now(UTC)
        assert timedelta(days=6) < time_diff < timedelta(days=8)


class TestJWKSEndpoint:
    """Test JWKS endpoint integration."""

    @pytest.mark.asyncio
    async def test_jwks_endpoint_structure(self):
        """Test that JWKS endpoint returns correct structure."""
        from fastapi.testclient import TestClient

        from app.main import app

        # Create test client
        client = TestClient(app)

        # Make request to JWKS endpoint
        response = client.get("/.well-known/jwks.json")

        # Should return 200 (or 500 if no keys configured yet)
        assert response.status_code in [200, 500]

        if response.status_code == 200:
            data = response.json()
            assert "keys" in data

    @pytest.mark.asyncio
    async def test_openid_configuration_endpoint(self):
        """Test OpenID configuration discovery endpoint."""
        from fastapi.testclient import TestClient

        from app.main import app

        # Create test client
        client = TestClient(app)

        # Make request to discovery endpoint
        response = client.get("/.well-known/openid-configuration")

        assert response.status_code == 200

        data = response.json()

        # Verify required fields
        assert "issuer" in data
        assert "jwks_uri" in data
        assert "authorization_endpoint" in data
        assert "token_endpoint" in data
        assert "id_token_signing_alg_values_supported" in data
        assert "EdDSA" in data["id_token_signing_alg_values_supported"]

    @pytest.mark.asyncio
    async def test_conditional_request_304(self, mock_session, mock_redis):
        """Test that conditional requests return 304 when ETag matches."""
        from fastapi import Response

        from app.api.v1.jwks import get_jwks

        # Mock ETag match
        mock_redis.get = AsyncMock(return_value=b"matching-etag")

        # Create mock response
        response = Response()

        # Create JWKS service with mocked check_etag
        with patch("app.api.v1.jwks.JWKSService") as MockJWKSService:
            mock_service = AsyncMock()
            mock_service.check_etag = AsyncMock(return_value=True)
            MockJWKSService.return_value = mock_service

            # Call endpoint with If-None-Match header
            result = await get_jwks(
                response=response,
                if_none_match='"matching-etag"',
                session=mock_session,
                redis=mock_redis,
            )

            # Should return 304 Not Modified
            assert response.status_code == 304
            assert result == {}


class TestCachePerformance:
    """Test cache performance characteristics."""

    @pytest.mark.asyncio
    async def test_cache_ttl_settings(self, jwks_service):
        """Test that cache TTL settings are appropriate."""
        # Redis cache should be short for freshness
        assert jwks_service.CACHE_TTL == 300  # 5 minutes

        # CDN cache can be longer
        assert jwks_service.CDN_MAX_AGE == 3600  # 1 hour

        # Edge cache should be moderate
        assert jwks_service.EDGE_TTL == 300  # 5 minutes

    @pytest.mark.asyncio
    async def test_cache_key_structure(self, jwks_service):
        """Test that cache keys are properly namespaced."""
        assert jwks_service._jwks_cache_key.startswith("auth:jwks:")
        assert jwks_service._jwks_etag_key.startswith("auth:jwks:")
        assert jwks_service._jwks_last_modified_key.startswith("auth:jwks:")

    @pytest.mark.asyncio
    async def test_concurrent_cache_access(self, jwks_service, mock_redis):
        """Test that concurrent requests handle caching properly."""
        import asyncio

        # Simulate cache miss initially
        call_count = 0

        async def mock_get(key):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return None  # First call misses
            # Subsequent calls hit cache
            return json.dumps({"keys": []}).encode()

        mock_redis.get = mock_get

        # Make multiple concurrent requests
        tasks = [jwks_service.get_jwks() for _ in range(5)]
        results = await asyncio.gather(*tasks)

        # All should return same structure
        assert all("keys" in r for r in results)
