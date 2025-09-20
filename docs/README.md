---
id: docs-landing
title: Documentation Landing Page
type: guide
created: '2025-09-18'
updated: '2025-09-18'
author: documentation-system
tags: []
last_verified: '2025-09-18'
---

# Welcome to the Documentation

Start here for the most useful entry points and workflows.

## Key Entry Points

- Index: [INDEX.md](INDEX.md)
- Implementation Guide: [implementation/IMPLEMENTATION_GUIDE.md](implementation/IMPLEMENTATION_GUIDE.md)
- Changelog: [status/CHANGELOG.md](status/CHANGELOG.md)

## Quick Commands

- Commands Quick Reference: [guides/commands-quick-reference.md](guides/commands-quick-reference.md)
- Contribution Guide: [guides/documentation-contribution-guide.md](guides/documentation-contribution-guide.md)

## Automation & Status

- Generate Status Report: `make docs-status`
- CI Workflow: `.github/workflows/docs-status.yml`
- Latest Status Report: `docs/reports/docs-status.md`
- Taxonomy Report: `docs/reports/taxonomy-status.md` (run `make docs-taxonomy`)
- Relationships Report: `docs/reports/relationships-status.md` (run `make docs-relationships`)
- Docs Graph JSON: `docs/_generated/graph.json` (run `make docs-graph`)
