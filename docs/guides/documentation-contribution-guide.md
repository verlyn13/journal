---
id: documentation-contribution-guide
title: Documentation Contribution Guide
type: guide
created: '2025-09-18'
updated: '2025-09-18'
author: documentation-system
tags: []
last_verified: '2025-09-18'
---

# Documentation Contribution Guide

## Requirements

- Include YAML frontmatter at the top of every `.md` file:
  - `id`, `title`, `type`, `created`, `updated`, `author`, `tags`
- Place files under the correct directory (see Structure Overview in `INDEX.md`).
- Link new documents from the relevant overview or section.

## Types and Placement

- `guide/` — How-to, tutorials, quick references
- `implementation/` — Implementation guide and sections
- `status/` — Changelog and status updates
- `development/` — Local development environment
- `ci-cd/` — CI/CD guides and checklists
- `templates/` — Reusable templates

## Process

1. Create the file with frontmatter using `docs/templates/` as reference.
2. Run `python3 scripts/validate_documentation.py --strict` and fix any issues.
3. Link the document from an appropriate parent or section.
4. Regenerate the index: `python3 scripts/generate_doc_index.py`.
5. Generate status report: `make docs-status`.
6. Open a PR. CI will run the docs-status workflow and block on regressions.

## Naming & Tags

- Use `kebab-case` for filenames.
- Tags should be meaningful and consistent (e.g., `guide`, `api`, `implementation`).

## Common Issues

- Missing frontmatter → validator will fail.
- Broken links → validator reports with file and target.
- Outdated tool references → prefer `uv`, `bun`, `Ruff`, `Biome`.

## Templates

- See `docs/templates/` for starting points.

