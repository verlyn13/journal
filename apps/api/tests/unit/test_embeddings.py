"""
Unit tests for embedding functionality with mocked OpenAI API.
"""

import importlib
import os

from unittest.mock import MagicMock, patch

import pytest

import app.infra.embeddings


@pytest.mark.unit()
class TestEmbeddings:
    """Test embedding functions with mocked OpenAI."""

    @pytest.mark.asyncio()
    async def test_get_embedding_with_openai(self, monkeypatch):
        """Test getting embedding from OpenAI API."""
        # Set API key and provider
        monkeypatch.setenv("OPENAI_API_KEY", "test-key")
        monkeypatch.setenv("JOURNAL_EMBED_PROVIDER", "openai")

        # Reload module to pick up new environment variables
        importlib.reload(app.infra.embeddings)
        from app.infra.embeddings import get_embedding

        # Mock OpenAI client
        mock_response = MagicMock()
        mock_response.data = [
            MagicMock(embedding=[0.1, 0.2, 0.3] * 512)  # 1536 dimensions
        ]

        mock_client = MagicMock()
        mock_client.embeddings.create.return_value = mock_response

        with patch("openai.OpenAI", return_value=mock_client):
            result = get_embedding("test text")

            # Should call OpenAI API
            mock_client.embeddings.create.assert_called_once_with(
                model="text-embedding-3-small", input="test text"
            )

            # Should return embedding (normalized)
            assert len(result) == 1536
            # Check that it's normalized (magnitude ~1)
            magnitude = sum(x * x for x in result) ** 0.5
            assert abs(magnitude - 1.0) < 0.01

    @pytest.mark.asyncio()
    async def test_get_embedding_fallback_without_key(self, monkeypatch):
        """Test fallback to deterministic embedding without API key."""
        # Remove API key and set provider to fake
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        monkeypatch.setenv("JOURNAL_EMBED_PROVIDER", "fake")

        # Reload module to pick up new environment variables
        importlib.reload(app.infra.embeddings)
        from app.infra.embeddings import get_embedding

        result = get_embedding("test text")

        # Should return deterministic embedding
        assert len(result) == 1536
        assert all(isinstance(x, float) for x in result)

        # Same text should produce same embedding
        result2 = get_embedding("test text")
        assert result == result2

        # Different text should produce different embedding
        result3 = get_embedding("different text")
        assert result != result3

    @pytest.mark.asyncio()
    async def test_get_embedding_handles_openai_error(self, monkeypatch):
        """Test handling of OpenAI API errors."""
        # Set API key and provider
        monkeypatch.setenv("OPENAI_API_KEY", "test-key")
        monkeypatch.setenv("JOURNAL_EMBED_PROVIDER", "openai")

        # Reload module to pick up new environment variables
        importlib.reload(app.infra.embeddings)
        from app.infra.embeddings import get_embedding

        # Mock OpenAI client to raise error
        mock_client = MagicMock()
        mock_client.embeddings.create.side_effect = Exception("API Error")

        with patch("openai.OpenAI", return_value=mock_client):
            # OpenAI provider should raise the error, not fall back
            with pytest.raises(Exception, match="API Error"):
                result = get_embedding("test text")

    @pytest.mark.asyncio()
    async def test_embedding_caching(self, monkeypatch):
        """Test that embeddings can be cached (future optimization)."""
        # Set API key and provider
        monkeypatch.setenv("OPENAI_API_KEY", "test-key")
        monkeypatch.setenv("JOURNAL_EMBED_PROVIDER", "openai")

        # Reload module to pick up new environment variables
        importlib.reload(app.infra.embeddings)
        from app.infra.embeddings import get_embedding

        call_count = 0

        def mock_create(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            mock_response = MagicMock()
            mock_response.data = [MagicMock(embedding=[0.1] * 1536)]
            return mock_response

        mock_client = MagicMock()
        mock_client.embeddings.create = mock_create

        with patch("openai.OpenAI", return_value=mock_client):
            # Get embedding twice for same text
            result1 = get_embedding("cached text")
            result2 = get_embedding("cached text")

            # Currently calls API twice (no caching)
            # In future, could implement caching to reduce API calls
            assert call_count == 2
            assert result1 == result2
