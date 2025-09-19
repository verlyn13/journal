---
id: implementation-guide-ops
title: "Implementation Guide \u2014 Operations"
type: guide
created: '2025-09-17'
updated: '2025-09-17'
author: documentation-system
tags: []
last_verified: '2025-09-17'
---

# Operations

Deployment, observability, metrics, and runbook notes.

## Deployment

- CI/CD guide: `docs/ci-cd/CI_CD_GUIDE.md`
- CI checklists: `docs/ci-cd/CI_CHECKLIST.md`, `docs/ci-cd/PR-CHECKLIST.md`, `docs/ci-cd/PR_SUMMARY.md`
- Vercel/Supabase assessment: `docs/deployment/vercel-supabase-migration-assessment.md`

## Observability & Telemetry

- Observability setup: `docs/infrastructure/observability-setup.md`
- OTEL endpoint config notes

## Docs Quality Gates

- CI workflow: `.github/workflows/docs-status.yml`
- Authoritative validator: `python3 scripts/validate_documentation.py --strict`
- Status report: `make docs-status`
