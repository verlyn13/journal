#!/usr/bin/env python3
"""
Heuristic scan for outdated tool references not covered by the validator.
Reports lines containing:
  - raw 'pip install' not preceded by 'uv '
  - 'npm ' usage
  - 'yarn'
  - 'prettier'/'eslint' mentions not paired with 'Biome' on the same line
Skips: docs/_generated, docs/archive, docs/.backups
"""

from __future__ import annotations

import re
from pathlib import Path

DOCS = Path("docs")


def should_skip(p: Path) -> bool:
    s = str(p)
    
    if any(tok in s for tok in ["/archive/", "/_generated/", "/.backups/"]):
        return True
    if s.endswith("/INDEX.md"):
        return True
    if "typescript-migration" in s or s.endswith("migrations/to-typescript.md"):
        return True
    return False


def main() -> int:
    offenders = []
    for md in DOCS.rglob("*.md"):
        if should_skip(md):
            continue
        try:
            for lineno, line in enumerate(md.read_text().splitlines(), 1):
                l = line.lower()
                # pip install without uv prefix
                if re.search(r"(?<!uv )\bpip install\b", l):
                    offenders.append((md, lineno, line.strip(), "pip install"))
                    continue
                # npm usage (ignore CDN and selection notes)
                if "cdn.jsdelivr.net/npm" in l or "choose one of npm" in l:
                    pass
                elif re.search(r"\bnpm\b", l):
                    offenders.append((md, lineno, line.strip(), "npm"))
                    continue
                # yarn usage
                if re.search(r"\byarn\b", l):
                    offenders.append((md, lineno, line.strip(), "yarn"))
                    continue
                # prettier/eslint without biome on same line
                if "prettier" in l and "biome" not in l:
                    offenders.append((md, lineno, line.strip(), "prettier"))
                    continue
                if re.search(r"\beslint\b", l) and "biome" not in l:
                    offenders.append((md, lineno, line.strip(), "eslint"))
                    continue
        except Exception:
            pass

    print(f"Found {len(offenders)} suspect tool-reference lines")
    for md, lineno, snippet, kind in offenders[:100]:
        print(f"{md}:{lineno}: [{kind}] {snippet}")
    if len(offenders) > 100:
        print(f"... and {len(offenders)-100} more")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

