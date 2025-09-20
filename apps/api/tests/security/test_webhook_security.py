"""Tests for webhook security verification and rate limiting."""

from datetime import UTC, datetime
import hashlib
import hmac
import json
import time

from fastapi.testclient import TestClient
import pytest
from redis.asyncio import Redis

from app.infra.security.webhook_verification import (
    ReplayAttackError,
    SignatureVerificationError,
    WebhookRateLimiter,
    WebhookSecurityManager,
    WebhookSignatureVerifier,
    WebhookVerificationError,
)


class TestWebhookSignatureVerifier:
    """Test webhook signature verification."""

    @pytest.fixture()
    def webhook_secret(self) -> str:
        """Test webhook secret."""
        return "test-webhook-secret-key-12345"

    @pytest.fixture()
    def verifier(
        self, redis_client: Redis, webhook_secret: str
    ) -> WebhookSignatureVerifier:
        """Create webhook signature verifier."""
        return WebhookSignatureVerifier(redis_client, webhook_secret)

    def test_compute_signature(self, verifier: WebhookSignatureVerifier) -> None:
        """Test signature computation."""
        timestamp = "1640995200"
        payload = b'{"test": "data"}'

        signature = verifier._compute_signature(timestamp, payload)

        assert signature.startswith("sha256=")
        assert len(signature) == 71  # "sha256=" + 64 hex chars

    def test_signature_matches_expected(self, webhook_secret: str) -> None:
        """Test signature computation matches expected HMAC-SHA256."""
        timestamp = "1640995200"
        payload = b'{"test": "data"}'

        # Manual computation
        signing_payload = f"{timestamp}.".encode() + payload
        expected_signature = hmac.new(
            webhook_secret.encode(), signing_payload, hashlib.sha256
        ).hexdigest()
        expected_full = f"sha256={expected_signature}"

        # Verifier computation
        verifier = WebhookSignatureVerifier(None, webhook_secret)
        actual_signature = verifier._compute_signature(timestamp, payload)

        assert actual_signature == expected_full

    @pytest.mark.asyncio()
    async def test_verify_webhook_success(
        self, verifier: WebhookSignatureVerifier
    ) -> None:
        """Test successful webhook verification."""
        timestamp = str(int(datetime.now(UTC).timestamp()))
        payload = b'{"event": "test"}'
        signature = verifier._compute_signature(timestamp, payload)

        result = await verifier.verify_webhook(
            signature=signature,
            timestamp=timestamp,
            payload=payload,
        )

        assert result["verified"] is True
        assert result["payload_size"] == len(payload)
        assert "verification_time" in result

    @pytest.mark.asyncio()
    async def test_verify_webhook_invalid_signature(
        self, verifier: WebhookSignatureVerifier
    ) -> None:
        """Test webhook verification with invalid signature."""
        timestamp = str(int(datetime.now(UTC).timestamp()))
        payload = b'{"event": "test"}'
        invalid_signature = "sha256=invalid_signature_hash"

        with pytest.raises(
            SignatureVerificationError, match="Invalid webhook signature"
        ):
            await verifier.verify_webhook(
                signature=invalid_signature,
                timestamp=timestamp,
                payload=payload,
            )

    @pytest.mark.asyncio()
    async def test_verify_webhook_timestamp_drift(
        self, verifier: WebhookSignatureVerifier
    ) -> None:
        """Test webhook verification with excessive timestamp drift."""
        # Timestamp 10 minutes in the past
        old_timestamp = str(int(datetime.now(UTC).timestamp()) - 600)
        payload = b'{"event": "test"}'
        signature = verifier._compute_signature(old_timestamp, payload)

        with pytest.raises(WebhookVerificationError, match="Timestamp drift too large"):
            await verifier.verify_webhook(
                signature=signature,
                timestamp=old_timestamp,
                payload=payload,
            )

    @pytest.mark.asyncio()
    async def test_verify_webhook_invalid_timestamp(
        self, verifier: WebhookSignatureVerifier
    ) -> None:
        """Test webhook verification with invalid timestamp."""
        payload = b'{"event": "test"}'
        signature = verifier._compute_signature("1640995200", payload)

        with pytest.raises(WebhookVerificationError, match="Invalid timestamp"):
            await verifier.verify_webhook(
                signature=signature,
                timestamp="invalid_timestamp",
                payload=payload,
            )

    @pytest.mark.asyncio()
    async def test_verify_webhook_with_nonce_success(
        self, verifier: WebhookSignatureVerifier
    ) -> None:
        """Test webhook verification with nonce (replay prevention)."""
        timestamp = str(int(datetime.now(UTC).timestamp()))
        payload = b'{"event": "test"}'
        signature = verifier._compute_signature(timestamp, payload)
        nonce = WebhookSignatureVerifier.generate_nonce()

        result = await verifier.verify_webhook(
            signature=signature,
            timestamp=timestamp,
            payload=payload,
            nonce=nonce,
        )

        assert result["verified"] is True

    @pytest.mark.asyncio()
    async def test_verify_webhook_replay_attack(
        self, verifier: WebhookSignatureVerifier
    ) -> None:
        """Test webhook verification prevents replay attacks."""
        timestamp = str(int(datetime.now(UTC).timestamp()))
        payload = b'{"event": "test"}'
        signature = verifier._compute_signature(timestamp, payload)
        nonce = WebhookSignatureVerifier.generate_nonce()

        # First request should succeed
        await verifier.verify_webhook(
            signature=signature,
            timestamp=timestamp,
            payload=payload,
            nonce=nonce,
        )

        # Second request with same nonce should fail
        with pytest.raises(ReplayAttackError, match="Nonce already used"):
            await verifier.verify_webhook(
                signature=signature,
                timestamp=timestamp,
                payload=payload,
                nonce=nonce,
            )

    @pytest.mark.asyncio()
    async def test_verify_webhook_payload_too_large(
        self, verifier: WebhookSignatureVerifier
    ) -> None:
        """Test webhook verification rejects oversized payloads."""
        timestamp = str(int(datetime.now(UTC).timestamp()))
        # Create payload larger than MAX_BODY_SIZE (1MB)
        large_payload = b"x" * (1024 * 1024 + 1)
        signature = verifier._compute_signature(timestamp, large_payload)

        with pytest.raises(WebhookVerificationError, match="Payload too large"):
            await verifier.verify_webhook(
                signature=signature,
                timestamp=timestamp,
                payload=large_payload,
            )

    def test_generate_nonce(self) -> None:
        """Test nonce generation."""
        nonce1 = WebhookSignatureVerifier.generate_nonce()
        nonce2 = WebhookSignatureVerifier.generate_nonce()

        assert len(nonce1) == 32  # 16 bytes * 2 hex chars
        assert len(nonce2) == 32
        assert nonce1 != nonce2
        assert all(c in "0123456789abcdef" for c in nonce1)

    def test_constant_time_compare(self) -> None:
        """Test constant-time string comparison."""
        assert WebhookSignatureVerifier._constant_time_compare("test", "test")
        assert not WebhookSignatureVerifier._constant_time_compare("test", "TEST")
        assert not WebhookSignatureVerifier._constant_time_compare("test", "different")


class TestWebhookRateLimiter:
    """Test webhook rate limiting."""

    @pytest.fixture()
    def rate_limiter(self, redis_client: Redis) -> WebhookRateLimiter:
        """Create webhook rate limiter."""
        return WebhookRateLimiter(redis_client, max_requests=5, window_seconds=60)

    @pytest.mark.asyncio()
    async def test_rate_limit_within_limit(
        self, rate_limiter: WebhookRateLimiter
    ) -> None:
        """Test requests within rate limit."""
        identifier = "test-client-1"

        # First request should be allowed
        allowed, metadata = await rate_limiter.check_rate_limit(identifier)

        assert allowed is True
        assert metadata["requests_made"] == 1
        assert metadata["requests_remaining"] == 4
        assert "reset_time" in metadata

    @pytest.mark.asyncio()
    async def test_rate_limit_exceeded(self, rate_limiter: WebhookRateLimiter) -> None:
        """Test rate limit exceeded."""
        identifier = "test-client-2"

        # Make requests up to the limit
        for i in range(5):
            allowed, metadata = await rate_limiter.check_rate_limit(identifier)
            assert allowed is True
            assert metadata["requests_made"] == i + 1

        # Next request should be denied
        allowed, metadata = await rate_limiter.check_rate_limit(identifier)

        assert allowed is False
        assert metadata["requests_remaining"] == 0
        assert "reset_time" in metadata

    @pytest.mark.asyncio()
    async def test_rate_limit_different_identifiers(
        self, rate_limiter: WebhookRateLimiter
    ) -> None:
        """Test rate limiting with different identifiers."""
        # Each identifier should have its own limit
        for i in range(3):
            identifier = f"test-client-{i}"
            allowed, metadata = await rate_limiter.check_rate_limit(identifier)

            assert allowed is True
            assert metadata["requests_made"] == 1


class TestWebhookSecurityManager:
    """Test unified webhook security manager."""

    @pytest.fixture()
    def webhook_secret(self) -> str:
        """Test webhook secret."""
        return "test-security-manager-secret"

    @pytest.fixture()
    def security_manager(
        self, redis_client: Redis, webhook_secret: str
    ) -> WebhookSecurityManager:
        """Create webhook security manager."""
        return WebhookSecurityManager(
            redis=redis_client,
            webhook_secret=webhook_secret,
            max_requests=10,
            window_seconds=60,
        )

    @pytest.mark.asyncio()
    async def test_verify_and_rate_limit_success(
        self, security_manager: WebhookSecurityManager
    ) -> None:
        """Test combined verification and rate limiting."""
        timestamp = str(int(datetime.now(UTC).timestamp()))
        payload = b'{"event": "test"}'
        signature = security_manager.verifier._compute_signature(timestamp, payload)
        identifier = "test-client"

        result = await security_manager.verify_and_rate_limit(
            signature=signature,
            timestamp=timestamp,
            payload=payload,
            identifier=identifier,
        )

        assert result["verified"] is True
        assert "rate_limit" in result
        assert result["rate_limit"]["requests_made"] == 1

    @pytest.mark.asyncio()
    async def test_verify_and_rate_limit_signature_failure(
        self, security_manager: WebhookSecurityManager
    ) -> None:
        """Test signature verification failure."""
        timestamp = str(int(datetime.now(UTC).timestamp()))
        payload = b'{"event": "test"}'
        invalid_signature = "sha256=invalid"
        identifier = "test-client"

        with pytest.raises(SignatureVerificationError):
            await security_manager.verify_and_rate_limit(
                signature=invalid_signature,
                timestamp=timestamp,
                payload=payload,
                identifier=identifier,
            )

    @pytest.mark.asyncio()
    async def test_verify_and_rate_limit_rate_limit_failure(
        self, security_manager: WebhookSecurityManager
    ) -> None:
        """Test rate limit exceeded."""
        timestamp = str(int(datetime.now(UTC).timestamp()))
        payload = b'{"event": "test"}'
        signature = security_manager.verifier._compute_signature(timestamp, payload)
        identifier = "rate-limited-client"

        # Exhaust rate limit
        for _ in range(10):
            await security_manager.verify_and_rate_limit(
                signature=signature,
                timestamp=timestamp,
                payload=payload,
                identifier=identifier,
            )

        # Next request should fail
        with pytest.raises(ValueError, match="Rate limit exceeded"):
            await security_manager.verify_and_rate_limit(
                signature=signature,
                timestamp=timestamp,
                payload=payload,
                identifier=identifier,
            )


class TestWebhookEndpoints:
    """Test webhook API endpoints."""

    @pytest.fixture()
    def webhook_secret(self) -> str:
        """Test webhook secret."""
        return "test-endpoint-secret"

    def create_valid_webhook_request(
        self,
        webhook_secret: str,
        payload_data: dict,
    ) -> tuple[dict, dict]:
        """Create valid webhook request headers and payload."""
        timestamp = str(int(time.time()))
        payload_json = json.dumps(payload_data)
        payload_bytes = payload_json.encode()

        # Compute signature
        signing_payload = f"{timestamp}.".encode() + payload_bytes
        signature = hmac.new(
            webhook_secret.encode(), signing_payload, hashlib.sha256
        ).hexdigest()

        headers = {
            "X-Infisical-Signature": f"sha256={signature}",
            "X-Infisical-Timestamp": timestamp,
            "X-Infisical-Nonce": WebhookSignatureVerifier.generate_nonce(),
            "Content-Type": "application/json",
        }

        return headers, payload_data

    def test_jwt_key_rotation_webhook_success(
        self,
        client: TestClient,
        webhook_secret: str,
        monkeypatch,
    ) -> None:
        """Test successful JWT key rotation webhook."""
        # Mock the webhook secret setting
        monkeypatch.setattr(
            "app.settings.settings.infisical_webhook_secret", webhook_secret
        )

        payload_data = {
            "event": "secret.updated",
            "secretPath": "/auth/jwt/current_private_key",
            "projectId": "test-project-123",
        }

        headers, payload = self.create_valid_webhook_request(
            webhook_secret, payload_data
        )

        response = client.post(
            "/internal/keys/changed",
            headers=headers,
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] in {"success", "acknowledged"}

    def test_aes_key_rotation_webhook_success(
        self,
        client: TestClient,
        webhook_secret: str,
        monkeypatch,
    ) -> None:
        """Test successful AES key rotation webhook."""
        monkeypatch.setattr(
            "app.settings.settings.infisical_webhook_secret", webhook_secret
        )

        payload_data = {
            "event": "secret.created",
            "secretPath": "/auth/aes/active_key",
            "projectId": "test-project-123",
            "newKeyId": "new-key-id-456",
        }

        headers, payload = self.create_valid_webhook_request(
            webhook_secret, payload_data
        )

        response = client.post(
            "/internal/aes/activekid",
            headers=headers,
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["new_key_id"] == "new-key-id-456"

    def test_webhook_invalid_signature(
        self,
        client: TestClient,
        monkeypatch,
    ) -> None:
        """Test webhook with invalid signature."""
        monkeypatch.setattr("app.settings.settings.infisical_webhook_secret", "secret")

        headers = {
            "X-Infisical-Signature": "sha256=invalid_signature",
            "X-Infisical-Timestamp": str(int(time.time())),
            "Content-Type": "application/json",
        }

        response = client.post(
            "/internal/keys/changed",
            headers=headers,
            json={"event": "test"},
        )

        assert response.status_code == 401
        assert "verification failed" in response.json()["detail"]

    def test_webhook_missing_signature(self, client: TestClient) -> None:
        """Test webhook with missing signature."""
        headers = {
            "X-Infisical-Timestamp": str(int(time.time())),
            "Content-Type": "application/json",
        }

        response = client.post(
            "/internal/keys/changed",
            headers=headers,
            json={"event": "test"},
        )

        assert response.status_code == 401
        assert "Missing webhook signature" in response.json()["detail"]

    def test_webhook_health_endpoint(self, client: TestClient) -> None:
        """Test webhook health endpoint."""
        response = client.get("/internal/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "components" in data
        assert "timestamp" in data
