#!/usr/bin/env python3
"""
Fix and normalize Markdown frontmatter across docs/.

Default is dry-run. Use --write to apply changes.

Actions:
- Ensure required fields exist: id, title, type, created, updated, author
- Normalize dates to YYYY-MM-DD for created/updated/last_verified
- Populate missing id from relative path; title from H1 or filename; type default 'reference'
- If last_verified missing, set to updated

Honors taxonomy for tag filtering if --enforce-tags is passed.
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path
from typing import Any, Dict, Tuple

import yaml

DOCS = Path("docs")


def parse_frontmatter(md_path: Path) -> Tuple[Dict[str, Any], str, str]:
    text = md_path.read_text()
    if not text.startswith("---\n"):
        return {}, "", text
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, "", text
    fm_text = text[4:end]
    body = text[end + 5 :]
    try:
        fm = yaml.safe_load(fm_text) or {}
    except Exception:
        fm = {}
    return fm, fm_text, body


def norm_date(val: str) -> str:
    if not val:
        return ""
    # Accept ISO and truncate to date
    try:
        return dt.date.fromisoformat(val[:10]).isoformat()
    except Exception:
        # Try YYYY/MM/DD
        m = re.match(r"(\d{4})[/-](\d{2})[/-](\d{2})", val)
        if m:
            y, mo, d = m.groups()
            try:
                return dt.date(int(y), int(mo), int(d)).isoformat()
            except Exception:
                return ""
    return ""


def derive_id(rel_path: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", rel_path.lower().replace(".md", "")).strip("-")


def derive_title(body: str, filename: str) -> str:
    m = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    if m:
        return m.group(1).strip()
    name = filename.rsplit(".", 1)[0]
    return re.sub(r"[-_]+", " ", name).title()


def fix_file(md: Path, enforce_tags: bool, write: bool) -> Tuple[bool, str]:
    rel = str(md.relative_to(DOCS))
    fm, fm_text, body = parse_frontmatter(md)
    changed = False
    if not fm:
        fm = {}

    # Required fields
    if not fm.get("id"):
        fm["id"] = derive_id(rel)
        changed = True
    if not fm.get("title"):
        fm["title"] = derive_title(body, md.name)
        changed = True
    if not fm.get("type"):
        fm["type"] = "reference"
        changed = True
    if not fm.get("author"):
        fm["author"] = "documentation-system"
        changed = True

    today = dt.date.today().isoformat()
    created = norm_date(str(fm.get("created") or ""))
    updated = norm_date(str(fm.get("updated") or ""))
    last_verified = norm_date(str(fm.get("last_verified") or ""))
    if not created:
        fm["created"] = today
        changed = True
    else:
        fm["created"] = created
    if not updated:
        fm["updated"] = today
        changed = True
    else:
        fm["updated"] = updated
    if not last_verified:
        fm["last_verified"] = fm["updated"]
        changed = True
    else:
        fm["last_verified"] = last_verified

    # Optional tag sanitation (only if enforce_tags specified and taxonomy present)
    if enforce_tags:
        tax = DOCS / "taxonomy.yaml"
        if tax.exists():
            try:
                data = yaml.safe_load(tax.read_text()) or {}
                allowed = set(data.get("tags", []))
                tags = fm.get("tags") or []
                if isinstance(tags, list):
                    filtered = [t for t in tags if t in allowed]
                    if filtered != tags:
                        fm["tags"] = filtered
                        changed = True
            except Exception:
                pass

    if not changed:
        return False, rel

    # Recompose file content with normalized frontmatter
    new_fm = yaml.safe_dump(fm, sort_keys=False).strip()
    new_text = f"---\n{new_fm}\n---\n\n{body.lstrip()}"
    if write:
        md.write_text(new_text)
    return True, rel


def main() -> int:
    ap = argparse.ArgumentParser(description="Fix Markdown frontmatter in docs/")
    ap.add_argument(
        "--write", action="store_true", default=False, help="Apply changes to files"
    )
    ap.add_argument(
        "--enforce-tags", action="store_true", help="Filter tags by taxonomy"
    )
    args = ap.parse_args()

    changed = 0
    scanned = 0
    for md in DOCS.rglob("*.md"):
        s = str(md)
        if any(tok in s for tok in ("/_generated/", "/archive/", "/.backups/")):
            continue
        did_change, rel = fix_file(md, args.enforce_tags, bool(args.write))
        scanned += 1
        if did_change:
            changed += 1
            print(f"Fixed: {rel}")

    print(f"Scanned {scanned} files; changed: {changed}")
    if not args.write:
        print("Dry-run only. Re-run with --write to apply.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
