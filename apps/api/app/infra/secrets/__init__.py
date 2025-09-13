"""Secrets management infrastructure.

This module provides secure secrets management using Infisical with
caching, error handling, and telemetry integration.
"""

from app.infra.secrets.infisical_client import (
    AuthenticationError,
    ConnectionError,
    InfisicalError,
    InfisicalSecretsClient,
    RedisSecretsCache,
    SecretNotFoundError,
    SecretsCache,
    SecretType,
)


__all__ = [
    "AuthenticationError",
    "ConnectionError",
    "InfisicalError",
    "InfisicalSecretsClient",
    "RedisSecretsCache",
    "SecretNotFoundError",
    "SecretType",
    "SecretsCache",
]
