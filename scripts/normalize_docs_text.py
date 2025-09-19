#!/usr/bin/env python3
"""
Normalize repetitive tokens and phrases in documentation.
Focused cleanup:
  - Collapse repeated 'uv' tokens (e.g., 'uv uv uv pip install' -> 'uv pip install')
  - Collapse repeated '(managed by Bun)' phrases

Skips: docs/_generated, docs/archive, docs/.backups
"""

from __future__ import annotations

import re
from pathlib import Path


def should_skip(path: Path) -> bool:
    s = str(path)
    return any(tok in s for tok in ["/archive/", "/_generated/", "/.backups/"])


def normalize_content(text: str) -> str:
    original = text

    # 1) Collapse repeated 'uv' tokens followed by whitespace.
    #    Example: 'uv uv uv pip install' -> 'uv pip install'
    text = re.sub(r"\b(?:uv\s+)+", "uv ", text)

    # 2) Collapse repeated '(managed by Bun)' phrases
    text = re.sub(r"(\(managed by Bun\))(?:\s*\(managed by Bun\))+", r"\1", text,
                  flags=re.IGNORECASE)

    return text if text != original else original


def main() -> int:
    docs_dir = Path("docs")
    changed = []

    for md in docs_dir.rglob("*.md"):
        if should_skip(md):
            continue
        try:
            content = md.read_text()
        except Exception:
            continue
        new = normalize_content(content)
        if new != content:
            md.write_text(new)
            changed.append(str(md.relative_to(docs_dir)))

    print(f"Normalized {len(changed)} files")
    for f in changed[:30]:
        print(f" - {f}")
    if len(changed) > 30:
        print(f" ... and {len(changed) - 30} more")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

