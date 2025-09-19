#!/usr/bin/env python3
"""
Validate documentation taxonomy against docs/taxonomy.yaml.

Checks:
- Frontmatter `type` is allowed and meets required sections
- Frontmatter `tags` conform to controlled vocabulary (unless allow_custom_tags)
- Optional fields `status`, `priority` align with taxonomy if present
- Freshness SLA for documents based on type priority (uses `updated` or `last_verified`)

Outputs:
- JSON: docs/_generated/reports/taxonomy_validation.json
- Markdown: docs/reports/taxonomy-status.md
"""

from __future__ import annotations

import dataclasses
import datetime as dt
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import yaml


DOCS = Path("docs")
TAXONOMY = DOCS / "taxonomy.yaml"
OUT_JSON = DOCS / "_generated" / "reports" / "taxonomy_validation.json"
OUT_MD = DOCS / "reports" / "taxonomy-status.md"


def load_taxonomy() -> Dict[str, Any]:
  data = yaml.safe_load(TAXONOMY.read_text())
  # Normalize indexes for fast lookup
  types = {t["name"]: t for t in data.get("document_types", [])}
  tags = set(data.get("tags", []) )
  priorities = {p["name"]: p for p in data.get("priorities", [])}
  statuses = {s["name"]: s for s in data.get("statuses", [])}
  rules = data.get("validation_rules", {})
  return {
    "raw": data,
    "types": types,
    "tags": tags,
    "priorities": priorities,
    "statuses": statuses,
    "rules": rules,
  }


def parse_frontmatter(md_path: Path) -> Tuple[Dict[str, Any], str]:
  text = md_path.read_text()
  if not text.startswith("---\n"):
    return {}, text
  end = text.find("\n---\n", 4)
  if end == -1:
    return {}, text
  fm_text = text[4:end]
  body = text[end + 5 :]
  try:
    fm = yaml.safe_load(fm_text) or {}
  except yaml.YAMLError:
    fm = {}
  return fm, body


def parse_date(s: str) -> Optional[dt.date]:
  # Accept ISO or YYYY-MM-DD
  if not s:
    return None
  try:
    return dt.date.fromisoformat(s[:10])
  except ValueError:
    return None


@dataclasses.dataclass
class Issue:
  file: str
  message: str
  kind: str


def check_required_sections(body: str, sections: List[str]) -> List[str]:
  missing: List[str] = []
  for sec in sections:
    # Match ATX headers of level 2+ for required sections
    pattern = re.compile(rf"^\s*#+\s*{re.escape(sec)}\s*$", re.IGNORECASE | re.MULTILINE)
    if not pattern.search(body):
      missing.append(sec)
  return missing


def effective_sla_days(tax: Dict[str, Any], doc_type: str, priority: Optional[str]) -> Optional[int]:
  t = tax["types"].get(doc_type)
  if not t:
    return None
  base = t.get("freshness_sla_days")
  if base is None:
    return None
  mult = 1.0
  if priority and priority in tax["priorities"]:
    mult = float(tax["priorities"][priority].get("sla_multiplier", 1.0))
  return int(round(base * mult))


def main() -> int:
  tax = load_taxonomy()
  allow_custom = bool(tax["rules"].get("allow_custom_tags", False))

  issues: List[Issue] = []
  stats = {
    "total_files": 0,
    "unknown_types": 0,
    "unknown_tags": 0,
    "missing_sections": 0,
    "stale_docs": 0,
    "invalid_status": 0,
    "invalid_priority": 0,
  }

  for md in DOCS.rglob("*.md"):
    s = str(md)
    if any(tok in s for tok in ("/_generated/", "/archive/", "/.backups/")):
      continue
    stats["total_files"] += 1
    fm, body = parse_frontmatter(md)
    doc_type = str(fm.get("type", "")).strip()
    tags = fm.get("tags") or []
    priority = fm.get("priority")
    status = fm.get("status")

    # Type validation
    if doc_type and doc_type not in tax["types"]:
      stats["unknown_types"] += 1
      issues.append(Issue(str(md.relative_to(DOCS)), f"Unknown type '{doc_type}'", "type"))
    else:
      t = tax["types"].get(doc_type)
      if t and t.get("required_sections"):
        missing = check_required_sections(body, t["required_sections"])
        if missing:
          stats["missing_sections"] += len(missing)
          issues.append(Issue(str(md.relative_to(DOCS)), f"Missing sections: {', '.join(missing)}", "sections"))

    # Tags validation
    if tags and isinstance(tags, list):
      unknown = [t for t in tags if t not in tax["tags"]]
      if unknown and not allow_custom:
        stats["unknown_tags"] += len(unknown)
        issues.append(Issue(str(md.relative_to(DOCS)), f"Unknown tags: {', '.join(unknown)}", "tags"))

    # Priority/status optional validation
    if priority and priority not in tax["priorities"]:
      stats["invalid_priority"] += 1
      issues.append(Issue(str(md.relative_to(DOCS)), f"Invalid priority '{priority}'", "priority"))
    if status and status not in tax["statuses"]:
      stats["invalid_status"] += 1
      issues.append(Issue(str(md.relative_to(DOCS)), f"Invalid status '{status}'", "status"))

    # Freshness SLA
    if tax["rules"].get("enforce_freshness_sla", False) and doc_type in tax["types"]:
      days = effective_sla_days(tax, doc_type, priority)
      if days is not None:
        last = parse_date(str(fm.get("last_verified") or fm.get("updated") or ""))
        if last is None:
          # If we cannot parse a date, count as stale
          stats["stale_docs"] += 1
          issues.append(Issue(str(md.relative_to(DOCS)), "Missing or invalid last_verified/updated date", "freshness"))
        else:
          age = (dt.date.today() - last).days
          if age > days:
            stats["stale_docs"] += 1
            issues.append(Issue(str(md.relative_to(DOCS)), f"Stale by {age - days} days (age {age}d > SLA {days}d)", "freshness"))

  # Summarize
  payload = {
    "generated_at": dt.datetime.now().isoformat(),
    "stats": stats,
    "issues": [dataclasses.asdict(i) for i in issues],
  }

  OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
  OUT_MD.parent.mkdir(parents=True, exist_ok=True)
  OUT_JSON.write_text(json.dumps(payload, indent=2))

  # Markdown report
  md: List[str] = []
  md.append("---")
  md.append("id: taxonomy-status-report")
  md.append("title: Taxonomy Validation Report")
  md.append("type: report")
  md.append(f"created: {payload['generated_at']}")
  md.append(f"updated: {payload['generated_at']}")
  md.append("author: documentation-system")
  md.append("tags: [documentation, taxonomy]")
  md.append("---\n")
  md.append("# Taxonomy Validation Report\n")
  md.append("## Summary")
  md.append(f"- Total files: {stats['total_files']}")
  md.append(f"- Unknown types: {stats['unknown_types']}")
  md.append(f"- Unknown tags: {stats['unknown_tags']}")
  md.append(f"- Missing required sections: {stats['missing_sections']}")
  md.append(f"- Stale docs: {stats['stale_docs']}")
  md.append(f"- Invalid status: {stats['invalid_status']}")
  md.append(f"- Invalid priority: {stats['invalid_priority']}")
  if issues:
    md.append("\n## Notable Issues (sample)")
    for i in issues[:25]:
      md.append(f"- `{i.file}` — {i.kind}: {i.message}")
  OUT_MD.write_text("\n".join(md))

  print(f"Wrote JSON: {OUT_JSON}")
  print(f"Wrote Markdown: {OUT_MD}")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())

