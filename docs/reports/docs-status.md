---
id: docs-status-report
title: Documentation Status Report
type: report
created: 2025-09-18T20:18:04.195332
updated: 2025-09-18T20:18:04.195332
author: documentation-system
tags: [documentation, status]
---

# Documentation Status Report

## Summary

- Health (quick): 80/100
- Frontmatter: 226 (100%)
- Validator total files: 206
- Broken links: 5
- Tool issues: 0
- Quality issues: 0
- Outdated content: 0
- Heuristic tool scan (context mentions): 65

## Orphans

- Count: 1
- Examples:
  - `deployment/PRE_DEPLOYMENT_CHECKLIST.md`

## Large Documents

- Count: 10 (> 50000 bytes)
- Top examples:
  - 158979 bytes — `initial-planning/comprehensive-guide-personal.md`
  - 144038 bytes — `implementation/IMPLEMENTATION_GUIDE.md`
  - 101330 bytes — `biome/internals/changelog.md`
  - 69562 bytes — `biome/reference/cli.md`
  - 68261 bytes — `initial-planning/deployment-script-guide.md`
  - 65154 bytes — `initial-planning/testing.md`
  - 60598 bytes — `status/CHANGELOG.md`
  - 55297 bytes — `planning/enhance-journal-app.md`
  - 54330 bytes — `code-mirror/reference-manual-part3.md`
  - 52284 bytes — `code-mirror/reference-manual-part1.md`

## Tool Reference Scan (Heuristic)

- Offending lines (sample):
  - docs/initial-planning/editor-implementation.md:95: [npm] Frontend dependencies will be managed via `npm` and bundled. See the [Resource Bundling Strategy](#resource-bundling-strategy) section for details on `package.json`.
  - docs/initial-planning/editor-implementation.md:1003: [npm] echo "bun could not be found. Please install Node.js and npm."
  - docs/implementation/IMPLEMENTATION_GUIDE.md:1503: [npm] - Initialize `npm` in the project root: `bun init -y`.
  - docs/implementation/IMPLEMENTATION_GUIDE.md:1667: [npm] - Initialized `npm` and managed frontend dependencies via `package.json`.
  - docs/implementation/IMPLEMENTATION_GUIDE.md:1707: [npm] - Established a standard frontend build pipeline using modern JavaScript tools (npm, Vite).
  - docs/status/CHANGELOG.md:1074: [npm] - **Frontend Build Process:** Established using `npm`, Vite, and PostCSS. Dependencies installed and build configuration (`Vite.config.js`) created.
  - docs/code-mirror/example-bundled.md:36: [npm] Modern JavaScript libraries like CodeMirror are typically organized as a collection of modules. While browsers can now load ES modules natively, their current dependency resolution mechanisms aren't sophisticated enough to efficiently handle NPM-distributed module collections.
  - docs/development/DEVELOPMENT_FRAMEWORK.md:184: [npm] **NEVER use npm, bun, or pnpm**
  - docs/project-config/CLAUDE.md:23: [npm] - bun for frontend tooling (NEVER npm/bun)
  - docs/project-config/CODEX-SETUP.md:131: [npm] - **ALWAYS** use `bun` for JS/TS operations (never npm/bun)