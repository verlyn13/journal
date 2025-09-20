"""Webhook signature verification with HMAC-SHA256 for Infisical integration."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
import hashlib
import hmac
import logging
import secrets
import time
from typing import Any

from redis.asyncio import Redis


logger = logging.getLogger(__name__)


class WebhookVerificationError(Exception):
    """Base exception for webhook verification failures."""


class SignatureVerificationError(WebhookVerificationError):
    """Raised when webhook signature verification fails."""


class ReplayAttackError(WebhookVerificationError):
    """Raised when a potential replay attack is detected."""


class WebhookSignatureVerifier:
    """Verifies webhook signatures and prevents replay attacks.

    Implements HMAC-SHA256 signature verification with timestamp validation
    and nonce-based replay attack prevention following security best practices.
    """

    # Security constants
    MAX_TIMESTAMP_DRIFT = timedelta(minutes=5)  # Allow 5 minute clock drift
    NONCE_TTL_SECONDS = 3600  # Store nonces for 1 hour
    MAX_BODY_SIZE = 1024 * 1024  # 1MB max payload size

    def __init__(self, redis: Redis, webhook_secret: str) -> None:
        """Initialize webhook verifier.

        Args:
            redis: Redis client for nonce storage
            webhook_secret: Secret key for HMAC verification
        """
        self.redis = redis
        self.webhook_secret = (
            webhook_secret.encode()
            if isinstance(webhook_secret, str)
            else webhook_secret
        )
        self._nonce_prefix = "webhook:nonce:"

    async def verify_webhook(
        self,
        signature: str,
        timestamp: str,
        payload: bytes,
        nonce: str | None = None,
    ) -> dict[str, Any]:
        """Verify webhook signature and prevent replay attacks.

        Args:
            signature: HMAC-SHA256 signature from webhook header
            timestamp: Unix timestamp from webhook header
            payload: Raw webhook payload bytes
            nonce: Optional nonce for replay prevention

        Returns:
            Verification result with metadata

        Raises:
            SignatureVerificationError: If signature verification fails
            ReplayAttackError: If replay attack detected
            WebhookVerificationError: For other verification failures
        """
        # Validate payload size
        if len(payload) > self.MAX_BODY_SIZE:
            raise WebhookVerificationError(f"Payload too large: {len(payload)} bytes")

        # Parse and validate timestamp
        try:
            webhook_timestamp = datetime.fromtimestamp(float(timestamp), tz=UTC)
        except (ValueError, OverflowError) as e:
            raise WebhookVerificationError(f"Invalid timestamp: {timestamp}") from e

        # Check timestamp drift
        now = datetime.now(UTC)
        time_diff = abs(now - webhook_timestamp)
        if time_diff > self.MAX_TIMESTAMP_DRIFT:
            raise WebhookVerificationError(
                f"Timestamp drift too large: {time_diff.total_seconds()} seconds"
            )

        # Verify signature
        expected_signature = self._compute_signature(timestamp, payload)
        if not self._constant_time_compare(signature, expected_signature):
            raise SignatureVerificationError("Invalid webhook signature")

        # Check for replay attacks using nonce
        if nonce:
            await self._verify_nonce(nonce)

        # Log successful verification
        logger.info(
            "Webhook signature verified",
            extra={
                "timestamp": webhook_timestamp.isoformat(),
                "payload_size": len(payload),
                "has_nonce": bool(nonce),
            },
        )

        return {
            "verified": True,
            "timestamp": webhook_timestamp,
            "payload_size": len(payload),
            "verification_time": now,
        }

    def _compute_signature(self, timestamp: str, payload: bytes) -> str:
        """Compute expected HMAC-SHA256 signature.

        Args:
            timestamp: Unix timestamp string
            payload: Raw payload bytes

        Returns:
            Hex-encoded HMAC-SHA256 signature
        """
        # Create signing payload: timestamp + . + payload
        signing_payload = f"{timestamp}.".encode() + payload

        # Compute HMAC-SHA256
        signature = hmac.new(
            self.webhook_secret, signing_payload, hashlib.sha256
        ).hexdigest()

        return f"sha256={signature}"

    async def _verify_nonce(self, nonce: str) -> None:
        """Verify nonce hasn't been used before (replay prevention).

        Args:
            nonce: Nonce value to check

        Raises:
            ReplayAttackError: If nonce has been used before
        """
        if not nonce or len(nonce) < 16:
            raise WebhookVerificationError("Invalid nonce: too short")

        # Check if nonce exists
        nonce_key = f"{self._nonce_prefix}{nonce}"
        exists = await self.redis.exists(nonce_key)

        if exists:
            raise ReplayAttackError(f"Nonce already used: {nonce[:8]}...")

        # Store nonce with TTL
        await self.redis.setex(nonce_key, self.NONCE_TTL_SECONDS, "1")

    @staticmethod
    def _constant_time_compare(a: str, b: str) -> bool:
        """Constant-time string comparison to prevent timing attacks.

        Args:
            a: First string
            b: Second string

        Returns:
            True if strings are equal
        """
        return hmac.compare_digest(a, b)

    @staticmethod
    def generate_nonce() -> str:
        """Generate a secure random nonce for testing.

        Returns:
            32-character hex nonce
        """
        return secrets.token_hex(16)


class WebhookRateLimiter:
    """Rate limiter for webhook endpoints to prevent abuse."""

    def __init__(
        self, redis: Redis, max_requests: int = 100, window_seconds: int = 3600
    ) -> None:
        """Initialize rate limiter.

        Args:
            redis: Redis client for rate limiting storage
            max_requests: Maximum requests per window
            window_seconds: Time window in seconds
        """
        self.redis = redis
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._rate_limit_prefix = "webhook:ratelimit:"

    async def check_rate_limit(self, identifier: str) -> tuple[bool, dict[str, int]]:
        """Check if request is within rate limits.

        Args:
            identifier: Unique identifier for rate limiting (e.g., source IP)

        Returns:
            Tuple of (allowed, metadata) where metadata contains:
            - requests_made: Number of requests in current window
            - requests_remaining: Remaining requests
            - reset_time: Unix timestamp when window resets
        """
        now = int(time.time())
        window_start = now - (now % self.window_seconds)

        key = f"{self._rate_limit_prefix}{identifier}:{window_start}"

        # Get current count
        current_count = await self.redis.get(key)
        requests_made = int(current_count) if current_count else 0

        # Check if limit exceeded
        if requests_made >= self.max_requests:
            return False, {
                "requests_made": requests_made,
                "requests_remaining": 0,
                "reset_time": window_start + self.window_seconds,
            }

        # Increment counter
        await self.redis.incr(key)
        await self.redis.expire(key, self.window_seconds)

        return True, {
            "requests_made": requests_made + 1,
            "requests_remaining": self.max_requests - requests_made - 1,
            "reset_time": window_start + self.window_seconds,
        }


class WebhookSecurityManager:
    """Unified webhook security manager combining signature verification and rate limiting."""

    def __init__(
        self,
        redis: Redis,
        webhook_secret: str,
        max_requests: int = 100,
        window_seconds: int = 3600,
    ) -> None:
        """Initialize webhook security manager.

        Args:
            redis: Redis client
            webhook_secret: Secret for signature verification
            max_requests: Maximum requests per window for rate limiting
            window_seconds: Rate limiting window in seconds
        """
        self.verifier = WebhookSignatureVerifier(redis, webhook_secret)
        self.rate_limiter = WebhookRateLimiter(redis, max_requests, window_seconds)

    async def verify_and_rate_limit(
        self,
        signature: str,
        timestamp: str,
        payload: bytes,
        identifier: str,
        nonce: str | None = None,
    ) -> dict[str, Any]:
        """Verify webhook signature and check rate limits.

        Args:
            signature: HMAC-SHA256 signature
            timestamp: Unix timestamp
            payload: Raw payload bytes
            identifier: Rate limiting identifier
            nonce: Optional nonce for replay prevention

        Returns:
            Combined verification and rate limiting result

        Raises:
            WebhookVerificationError: For verification failures
            ValueError: For rate limiting failures
        """
        # Check rate limits first
        allowed, rate_info = await self.rate_limiter.check_rate_limit(identifier)
        if not allowed:
            raise ValueError(f"Rate limit exceeded. Reset at {rate_info['reset_time']}")

        # Verify signature
        verification_result = await self.verifier.verify_webhook(
            signature, timestamp, payload, nonce
        )

        # Combine results
        return {
            **verification_result,
            "rate_limit": rate_info,
        }
