"""Secrets management infrastructure.

This module provides secure secrets management using Infisical with
caching, error handling, and telemetry integration.
"""

from app.infra.secrets.infisical_client import (
    AuthenticationError,
    ConnectionError as InfisicalConnectionError,  # noqa: A004
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

# Preserve public API name while avoiding builtin shadowing on import.
# Export `ConnectionError` as an alias to the client-specific error type.
ConnectionError = InfisicalConnectionError  # noqa: A001
