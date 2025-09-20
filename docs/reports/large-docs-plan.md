---
id: large-docs-plan
title: Large Documents Split Plan
type: report
created: '2025-09-17'
updated: '2025-09-17'
author: documentation-system
tags: []
last_verified: '2025-09-17'
---

# Large Documents Split Plan

This plan lists large Markdown files (> 50 KB) and proposes a split strategy to improve maintainability and navigation. The consolidated reporter (`make docs-status`) identifies these files.

## Targets (> 50 KB)

- initial-planning/comprehensive-guide-personal.md (~158 KB)
- implementation/IMPLEMENTATION_GUIDE.md (~144 KB)
- biome/internals/changelog.md (~101 KB)
- biome/reference/cli.md (~70 KB)
- initial-planning/deployment-script-guide.md (~68 KB)
- initial-planning/testing.md (~65 KB)
- status/CHANGELOG.md (~60 KB)
- planning/enhance-journal-app.md (~55 KB)
- code-mirror/reference-manual-part3.md (~54 KB)
- code-mirror/reference-manual-part1.md (~52 KB)

## Strategy

- Preserve incoming links to the original file by keeping a top-level stub with:
  - Frontmatter (unchanged id)
  - Short overview
  - Table of contents linking to split sections
- Create a directory alongside the original containing section files (H2/H3 level splits).
- Update INDEX.md (auto) to include new section files on next generation.
- Run validator + status report to confirm no new broken links.

## Proposed First Split

1) implementation/IMPLEMENTATION_GUIDE.md
   - Create `implementation/guide/01-overview.md` (goals, scope)
   - Create `implementation/guide/02-setup.md` (env, deps, scripts)
   - Create `implementation/guide/03-workflows.md` (dev, CI/CD)
   - Create `implementation/guide/04-features.md` (modules, features)
   - Create `implementation/guide/05-ops.md` (deploy, observability)
   - Replace top of IMPLEMENTATION_GUIDE.md with a TOC and brief overview, then move body content into sections.

2) initial-planning/comprehensive-guide-personal.md
   - Split by major headings into `initial-planning/personal-guide/*.md`

## Rollout Steps

1. Introduce split sections and TOCs (non-destructive; keep originals during PR for review).
2. Update internal links to point to new sections.
3. Remove duplicated content from originals, leaving an overview + TOC.
4. Regenerate index and status report.
5. Validate (validator strict) in CI.

## Validation

- After each split, run:
  - `python3 scripts/validate_documentation.py --strict`
  - `make docs-status`

## Notes

- Avoid splitting docs in `docs/biome/internals/` sourced from upstream without re-aggregation strategy.
- For status/CHANGELOG.md, maintain a single file but consider moving linked details to per-phase pages.

