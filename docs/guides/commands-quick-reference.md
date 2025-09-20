---
id: commands-quick-reference
title: Commands Quick Reference
type: guide
created: '2025-09-18'
updated: '2025-09-18'
author: documentation-system
tags: []
last_verified: '2025-09-18'
---

# Commands Quick Reference

## Day-to-day

- Quick health: `bash scripts/check_docs.sh`
- Full validation (authoritative): `python3 scripts/validate_documentation.py --json --quiet`
- Strict validation (fail on issues): `python3 scripts/validate_documentation.py --strict`
- Consolidated status report: `make docs-status`
- Regenerate index: `python3 scripts/generate_doc_index.py`

## Fix utilities

- Full workflow (10 steps): `python3 scripts/documentation_fix_workflow.py`
- Targeted fixes: `python3 scripts/fix_remaining_issues.py`
- Critical fixes: `python3 scripts/fix_critical_issues.py`
- Normalize text: `python3 scripts/normalize_docs_text.py`

## Scanners

- Tool references (heuristic): `python3 scripts/scan_tool_references.py`

## CI

- Docs Status workflow: `.github/workflows/docs-status.yml`
  - Fails if strict validation reports issues
  - Uploads `docs/reports/docs-status.md` and `docs/_generated/reports/docs_status.json`

