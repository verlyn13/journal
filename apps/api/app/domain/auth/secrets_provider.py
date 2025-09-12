"""Secrets provider protocol for decoupled secret management."""

from __future__ import annotations

import json
import logging
from typing import Any, Protocol
from pathlib import Path

logger = logging.getLogger(__name__)


class SecretsProvider(Protocol):
    """Protocol for secrets storage providers.
    
    This protocol allows for multiple implementations of secret storage,
    enabling easy testing and deployment flexibility.
    """
    
    async def fetch(self, path: str) -> str:
        """Fetch a secret from storage.
        
        Args:
            path: Secret path/key
            
        Returns:
            Secret value as string
            
        Raises:
            KeyError: If secret not found
        """
        ...
    
    async def store(self, path: str, value: str) -> None:
        """Store a secret in storage.
        
        Args:
            path: Secret path/key
            value: Secret value to store
        """
        ...
    
    async def exists(self, path: str) -> bool:
        """Check if a secret exists.
        
        Args:
            path: Secret path/key
            
        Returns:
            True if secret exists
        """
        ...
    
    async def delete(self, path: str) -> None:
        """Delete a secret from storage.
        
        Args:
            path: Secret path/key
            
        Raises:
            KeyError: If secret not found
        """
        ...


class InMemorySecretsProvider:
    """In-memory secrets provider for testing."""
    
    def __init__(self) -> None:
        """Initialize in-memory storage."""
        self._secrets: dict[str, str] = {}
    
    async def fetch(self, path: str) -> str:
        """Fetch a secret from memory.
        
        Args:
            path: Secret path/key
            
        Returns:
            Secret value
            
        Raises:
            KeyError: If secret not found
        """
        if path not in self._secrets:
            raise KeyError(f"Secret not found: {path}")
        return self._secrets[path]
    
    async def store(self, path: str, value: str) -> None:
        """Store a secret in memory.
        
        Args:
            path: Secret path/key
            value: Secret value
        """
        self._secrets[path] = value
        logger.debug(f"Stored secret at path: {path}")
    
    async def exists(self, path: str) -> bool:
        """Check if a secret exists.
        
        Args:
            path: Secret path/key
            
        Returns:
            True if secret exists
        """
        return path in self._secrets
    
    async def delete(self, path: str) -> None:
        """Delete a secret from memory.
        
        Args:
            path: Secret path/key
            
        Raises:
            KeyError: If secret not found
        """
        if path not in self._secrets:
            raise KeyError(f"Secret not found: {path}")
        del self._secrets[path]
        logger.debug(f"Deleted secret at path: {path}")
    
    def clear(self) -> None:
        """Clear all secrets (test helper)."""
        self._secrets.clear()


class FileSecretsProvider:
    """File-based secrets provider for development."""
    
    def __init__(self, base_path: Path | str) -> None:
        """Initialize file-based storage.
        
        Args:
            base_path: Base directory for secrets
        """
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def _get_file_path(self, path: str) -> Path:
        """Get file path for a secret.
        
        Args:
            path: Secret path
            
        Returns:
            Full file path
        """
        # Sanitize path to prevent directory traversal
        safe_path = path.replace("..", "").replace("~", "").lstrip("/")
        return self.base_path / f"{safe_path}.secret"
    
    async def fetch(self, path: str) -> str:
        """Fetch a secret from file.
        
        Args:
            path: Secret path/key
            
        Returns:
            Secret value
            
        Raises:
            KeyError: If secret not found
        """
        file_path = self._get_file_path(path)
        if not file_path.exists():
            raise KeyError(f"Secret not found: {path}")
        
        try:
            return file_path.read_text().strip()
        except IOError as e:
            raise KeyError(f"Failed to read secret: {e}") from e
    
    async def store(self, path: str, value: str) -> None:
        """Store a secret in file.
        
        Args:
            path: Secret path/key
            value: Secret value
        """
        file_path = self._get_file_path(path)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write with restricted permissions
        file_path.write_text(value)
        file_path.chmod(0o600)  # Read/write for owner only
        logger.debug(f"Stored secret at path: {path}")
    
    async def exists(self, path: str) -> bool:
        """Check if a secret exists.
        
        Args:
            path: Secret path/key
            
        Returns:
            True if secret exists
        """
        return self._get_file_path(path).exists()


class SecretsClientAdapter:
    """Adapter to bridge SecretsProvider to legacy client interface.

    KeyManager currently expects an object exposing `fetch_secret` and
    `store_secret`. This adapter wraps a `SecretsProvider` and maps the
    calls accordingly without changing KeyManager.
    """

    def __init__(self, provider: SecretsProvider) -> None:
        self._provider = provider

    async def fetch_secret(self, path: str) -> str:
        return await self._provider.fetch(path)

    async def store_secret(self, path: str, value: str) -> None:
        await self._provider.store(path, value)

    # Optional helpers
    async def exists(self, path: str) -> bool:  # type: ignore[override]
        return await self._provider.exists(path)

    async def delete(self, path: str) -> None:  # type: ignore[override]
        await self._provider.delete(path)
    
    async def delete(self, path: str) -> None:
        """Delete a secret from file system.
        
        Args:
            path: Secret path/key
            
        Raises:
            KeyError: If secret not found
        """
        file_path = self._get_file_path(path)
        if not file_path.exists():
            raise KeyError(f"Secret not found: {path}")
        
        file_path.unlink()
        logger.debug(f"Deleted secret at path: {path}")


class InfisicalSecretsProvider:
    """Infisical-based secrets provider for production.
    
    This provider integrates with Infisical for centralized secret management
    with features like versioning, audit logging, and approval workflows.
    """
    
    def __init__(self, client: Any, environment: str = "production") -> None:
        """Initialize Infisical provider.
        
        Args:
            client: Infisical client instance
            environment: Environment name (production, staging, development)
        """
        self.client = client
        self.environment = environment
    
    async def fetch(self, path: str) -> str:
        """Fetch a secret from Infisical.
        
        Args:
            path: Secret path/key
            
        Returns:
            Secret value
            
        Raises:
            KeyError: If secret not found
        """
        try:
            # Infisical client would handle the actual API call
            secret = await self.client.get_secret(
                secret_name=path,
                environment=self.environment,
            )
            return secret.secret_value
        except Exception as e:
            raise KeyError(f"Failed to fetch secret from Infisical: {e}") from e
    
    async def store(self, path: str, value: str) -> None:
        """Store a secret in Infisical.
        
        Args:
            path: Secret path/key
            value: Secret value
        """
        try:
            await self.client.create_secret(
                secret_name=path,
                secret_value=value,
                environment=self.environment,
            )
            logger.info(f"Stored secret in Infisical: {path}")
        except Exception as e:
            logger.error(f"Failed to store secret in Infisical: {e}")
            raise
    
    async def exists(self, path: str) -> bool:
        """Check if a secret exists in Infisical.
        
        Args:
            path: Secret path/key
            
        Returns:
            True if secret exists
        """
        try:
            await self.fetch(path)
            return True
        except KeyError:
            return False
    
    async def delete(self, path: str) -> None:
        """Delete a secret from Infisical.
        
        Args:
            path: Secret path/key
            
        Raises:
            KeyError: If secret not found
        """
        try:
            await self.client.delete_secret(
                secret_name=path,
                environment=self.environment,
            )
            logger.info(f"Deleted secret from Infisical: {path}")
        except Exception as e:
            raise KeyError(f"Failed to delete secret from Infisical: {e}") from e


class CachedSecretsProvider:
    """Caching wrapper for any secrets provider.
    
    This provider adds an in-memory cache layer to reduce API calls
    and improve performance for frequently accessed secrets.
    """
    
    def __init__(self, provider: SecretsProvider, ttl_seconds: int = 300) -> None:
        """Initialize cached provider.
        
        Args:
            provider: Underlying secrets provider
            ttl_seconds: Cache TTL in seconds
        """
        self.provider = provider
        self.ttl_seconds = ttl_seconds
        self._cache: dict[str, tuple[str, float]] = {}
    
    def _is_cached(self, path: str) -> bool:
        """Check if a secret is cached and valid.
        
        Args:
            path: Secret path
            
        Returns:
            True if cached and not expired
        """
        if path not in self._cache:
            return False
        
        _, cached_at = self._cache[path]
        import time
        return (time.time() - cached_at) < self.ttl_seconds
    
    async def fetch(self, path: str) -> str:
        """Fetch a secret with caching.
        
        Args:
            path: Secret path/key
            
        Returns:
            Secret value
            
        Raises:
            KeyError: If secret not found
        """
        if self._is_cached(path):
            value, _ = self._cache[path]
            logger.debug(f"Cache hit for secret: {path}")
            return value
        
        # Fetch from underlying provider
        value = await self.provider.fetch(path)
        
        # Cache the result
        import time
        self._cache[path] = (value, time.time())
        logger.debug(f"Cached secret: {path}")
        
        return value
    
    async def store(self, path: str, value: str) -> None:
        """Store a secret and update cache.
        
        Args:
            path: Secret path/key
            value: Secret value
        """
        await self.provider.store(path, value)
        
        # Update cache
        import time
        self._cache[path] = (value, time.time())
    
    async def exists(self, path: str) -> bool:
        """Check if a secret exists.
        
        Args:
            path: Secret path/key
            
        Returns:
            True if secret exists
        """
        if self._is_cached(path):
            return True
        return await self.provider.exists(path)
    
    async def delete(self, path: str) -> None:
        """Delete a secret and clear from cache.
        
        Args:
            path: Secret path/key
            
        Raises:
            KeyError: If secret not found
        """
        await self.provider.delete(path)
        
        # Remove from cache
        self._cache.pop(path, None)
    
    def clear_cache(self) -> None:
        """Clear the cache (useful for testing)."""
        self._cache.clear()
