"""Content metrics calculation utilities."""

from __future__ import annotations

import re

from typing import Any


def count_words_chars(text: str | None) -> tuple[int, int]:
    """Count words and characters in text.

    Args:
        text: Text to analyze (can be None)

    Returns:
        Tuple of (word_count, char_count)
    """
    if not text:
        return 0, 0

    # Use regex to count words (naive but deterministic for tests)
    words = len(re.findall(r"\b\w+\b", text))
    chars = len(text)

    return words, chars


def extract_text_for_metrics(content: dict[str, Any] | str | None, markdown: str | None) -> str:
    """Extract plain text for metrics calculation.

    Args:
        content: Content field (can be dict, string, or None)
        markdown: Markdown content (preferred for metrics)

    Returns:
        Plain text string for analysis
    """
    # Prefer markdown for metrics as it's closer to user input
    if markdown:
        return markdown
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    # Must be dict type based on type annotation
    if "text" in content:
        return str(content["text"])
    if "content" in content:
        return str(content["content"])
    # Fallback to string representation
    return str(content)
