#!/usr/bin/env python3
"""
Validate docs/relationships.json consistency with the filesystem and internal references.

Checks:
- Each document path exists (unless explicitly allowed otherwise)
- Parent/children bidirectional consistency
- Prerequisites/related/implements targets exist
- Reports missing nodes and dangling references

Outputs:
- JSON: docs/_generated/reports/relationships_validation.json
- Markdown: docs/reports/relationships-status.md
"""

from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple


REL = Path("docs/relationships.json")
DOCS = Path("docs")
OUT_JSON = DOCS / "_generated" / "reports" / "relationships_validation.json"
OUT_MD = DOCS / "reports" / "relationships-status.md"


@dataclass
class RelIssue:
  kind: str
  message: str


def main() -> int:
  issues: List[RelIssue] = []
  if not REL.exists():
    print("No relationships.json found; nothing to validate")
    return 0

  data = json.loads(REL.read_text())
  docs: Dict[str, Any] = data.get("documents", {})
  categories: Dict[str, List[str]] = data.get("categories", {})
  nav = data.get("navigation", {})
  rules = data.get("validation_rules", {})

  ids: Set[str] = set(docs.keys())
  path_map: Dict[str, str] = {}

  # Check document paths
  for doc_id, entry in docs.items():
    p = entry.get("path")
    if not p:
      issues.append(RelIssue("path", f"{doc_id}: missing 'path'"))
      continue
    path_map[doc_id] = p
    exists = Path(p).exists() if not Path(p).is_absolute() else False
    if rules.get("all_paths_exist", False) and not exists:
      issues.append(RelIssue("path", f"{doc_id}: path does not exist: {p}"))

  # Check references (parent, children, prerequisites, related, implements)
  def check_refs(field: str) -> None:
    for doc_id, entry in docs.items():
      refs = entry.get(field) or []
      for r in refs:
        if r not in ids:
          issues.append(RelIssue("reference", f"{doc_id}: '{field}' target not found: {r}"))

  for fld in ("parent",):
    # parent is a single ref; normalize check
    for doc_id, entry in docs.items():
      parent = entry.get("parent")
      if parent and parent not in ids:
        issues.append(RelIssue("reference", f"{doc_id}: parent not found: {parent}"))

  for list_field in ("children", "prerequisites", "related", "implements", "supersedes"):
    check_refs(list_field)

  # Bidirectional parent <-> children
  if rules.get("parent_child_bidirectional", False):
    for doc_id, entry in docs.items():
      for child in entry.get("children", []) or []:
        # child should exist and have parent backref
        child_entry = docs.get(child)
        if not child_entry:
          continue
        if child_entry.get("parent") != doc_id:
          issues.append(RelIssue("consistency", f"Child '{child}' does not point back to parent '{doc_id}'"))

  # Categories membership should refer to valid ids
  for cat, members in categories.items():
    for m in members:
      if m not in ids:
        issues.append(RelIssue("category", f"Category '{cat}' references unknown id: {m}"))

  # Navigation references must be valid ids
  for sect, members in nav.items():
    for m in members:
      if m not in ids:
        issues.append(RelIssue("navigation", f"Navigation '{sect}' references unknown id: {m}"))

  payload = {
    "documents": len(docs),
    "issues": [asdict(i) for i in issues],
  }

  OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
  OUT_MD.parent.mkdir(parents=True, exist_ok=True)
  OUT_JSON.write_text(json.dumps(payload, indent=2))

  md: List[str] = []
  from datetime import datetime
  now = datetime.now().isoformat()
  md.append("---")
  md.append("id: relationships-status-report")
  md.append("title: Relationships Validation Report")
  md.append("type: report")
  md.append(f"created: {now}")
  md.append(f"updated: {now}")
  md.append("author: documentation-system")
  md.append("tags: [documentation, relationships]")
  md.append("---\n")
  md.append("# Relationships Validation Report")
  md.append("")
  md.append(f"- Documents declared: {len(docs)}")
  md.append(f"- Issues found: {len(issues)}")
  if issues:
    md.append("\n## Issues (sample)")
    for i in issues[:50]:
      md.append(f"- {i.kind}: {i.message}")
  OUT_MD.write_text("\n".join(md))

  print(f"Wrote JSON: {OUT_JSON}")
  print(f"Wrote Markdown: {OUT_MD}")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
