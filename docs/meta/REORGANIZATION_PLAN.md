---
id: reorganization-plan
title: Documentation Reorganization Plan
type: reference
version: 1.0.0
created: '2025-09-17'
updated: '2025-09-17'
author: Type
tags:
- python
- authentication
- typescript
- react
- fastapi
- ci-cd
priority: medium
status: approved
visibility: internal
schema_version: v1
description: '**58 loose documentation files** are scattered in the root `docs/` directory
  instead of being properly organized into logical categories.'
last_verified: '2025-09-17'
---

# Documentation Reorganization Plan

## Current Problem
**58 loose documentation files** are scattered in the root `docs/` directory instead of being properly organized into logical categories.

## Current State Analysis

### Root Directory Files (58 files):
```
ADVANCED_AUTH.md
CI_CD_GUIDE.md, ci-cd.md, CI_CHECKLIST.md, CI_INVESTIGATION_REPORT.md
DEFINITION_OF_DONE.md, MIGRATION_CHECKLIST.md, ORCHESTRATION_WORKFLOW.md
DEPLOYMENT_AWARE_AUTH.md
DOCUMENTATION_ARCHITECTURE.md, DOCUMENTATION_ROADMAP.md
PHASE_5_ENHANCEMENT_PLAN.md, PHASE_5_MASTER_PLAN.md
REACT-19-MIGRATION.md, REACT-19-MIGRATION-ISSUES.md, REACT-19-WORKFLOW.md
RUFF_*.md files (4 files)
USER_MANAGEMENT_*.md files (10+ versions)
UI_DESIGN_*.md files
... and many more
```

### Existing Directory Structure (Good):
```
docs/
├── adr/               # Architecture Decision Records
├── guides/            # User and developer guides
├── deployment/        # Deployment documentation
├── implementation/    # Implementation phases
├── proposals/         # RFC-style proposals
├── templates/         # Documentation templates
├── audits/           # Audit reports
├── status/           # Status reports
└── [many others]     # Well-organized categories
```

## Reorganization Strategy

### Phase 1: Categorize Files by Type

#### 1. **Authentication & Security** → `security/`
- `ADVANCED_AUTH.md`
- `DEPLOYMENT_AWARE_AUTH.md`
- `token-enhancement.md`

#### 2. **CI/CD & DevOps** → `ci-cd/`
- `CI_CD_GUIDE.md`
- `ci-cd.md`
- `CI_CHECKLIST.md`
- `CI_INVESTIGATION_REPORT.md`
- `dev-setup.md`

#### 3. **Migration Documentation** → `migrations/`
- `REACT-19-MIGRATION.md`
- `REACT-19-MIGRATION-ISSUES.md`
- `REACT-19-WORKFLOW.md`
- `move-to-fastapi.md`
- `to-typescript.md`
- `ruff-progressive-autofixing.md`

#### 4. **Python & Tooling** → `development/python/`
- `RUFF_AND_PYTHON_UPGRADE_SUMMARY.md`
- `RUFF_UPGRADE_PLAN.md`
- `RUFF_VERIFICATION_REPORT.md`
- `fastapi-boostrap-helper.md`
- `fastapi-boostrap-starter.md`

#### 5. **User Management** → `features/user-management/`
- `USER_MANAGEMENT.md`
- `USER_MANAGEMENT_IMPLEMENTATION.md`
- `USER_MANAGEMENT_ORCHESTRATEV1.md` through `V9.md`
- `USER_MANAGEMENT_STARTER_DIFFS.md`

#### 6. **UI/UX Design** → `design/`
- `UI_DESIGN_SPECIFICATION.md`
- `UI_DESIGN_UPDATE_PLAN.md`
- `theme.md`
- `refactor-ui-design.md`

#### 7. **Project Planning** → `planning/`
- `PHASE_5_ENHANCEMENT_PLAN.md`
- `PHASE_5_MASTER_PLAN.md`
- `enhance-journal-app.md`
- `ROADMAP.md`

#### 8. **Infrastructure** → `infrastructure/`
- `hosting-secure.md`
- `observability-setup.md`
- `error-handling-logging.md`
- `INFISICAL_ARCHITECTURE.md`
- `infisical-cli-useage.md`

#### 9. **Workflows & Automation** → `workflows/`
- `agent-workflows.md`
- `hx-ax-workflows.md`
- `dual-language-setup.md`

#### 10. **Meta Documentation** → `meta/`
- `DOCUMENTATION_ARCHITECTURE.md`
- `DOCUMENTATION_ROADMAP.md`
- `DEFINITION_OF_DONE.md`
- `MIGRATION_CHECKLIST.md`
- `ORCHESTRATION_WORKFLOW.md`
- `doc-upgrade.md`

#### 11. **Keep in Root** (Special Files):
- `README.md` - Main project readme
- `INDEX.md` - Documentation index

### Phase 2: Create Directory Structure

```bash
mkdir -p docs/{security,ci-cd,migrations,development/python,features/user-management,design,planning,infrastructure,workflows,meta}
```

### Phase 3: Move Files

Execute systematic file moves with proper git tracking:

```bash
# Security
git mv docs/ADVANCED_AUTH.md docs/security/
git mv docs/DEPLOYMENT_AWARE_AUTH.md docs/security/
git mv docs/token-enhancement.md docs/security/

# CI/CD
git mv docs/CI_CD_GUIDE.md docs/ci-cd/
git mv docs/ci-cd.md docs/ci-cd/overview.md
git mv docs/CI_CHECKLIST.md docs/ci-cd/
git mv docs/CI_INVESTIGATION_REPORT.md docs/ci-cd/
git mv docs/dev-setup.md docs/ci-cd/

# Migrations
git mv docs/REACT-19-*.md docs/migrations/
git mv docs/move-to-fastapi.md docs/migrations/
git mv docs/to-typescript.md docs/migrations/
git mv docs/ruff-progressive-autofixing.md docs/migrations/

# Python Development
git mv docs/RUFF_*.md docs/development/python/
git mv docs/fastapi-boostrap-*.md docs/development/python/

# User Management
git mv docs/USER_MANAGEMENT*.md docs/features/user-management/

# UI/Design
git mv docs/UI_DESIGN_*.md docs/design/
git mv docs/theme.md docs/design/
git mv docs/refactor-ui-design.md docs/design/

# Planning
git mv docs/PHASE_5_*.md docs/planning/
git mv docs/enhance-journal-app.md docs/planning/
git mv docs/ROADMAP.md docs/planning/

# Infrastructure
git mv docs/hosting-secure.md docs/infrastructure/
git mv docs/observability-setup.md docs/infrastructure/
git mv docs/error-handling-logging.md docs/infrastructure/
git mv docs/INFISICAL_*.md docs/infrastructure/

# Workflows
git mv docs/agent-workflows.md docs/workflows/
git mv docs/hx-ax-workflows.md docs/workflows/
git mv docs/dual-language-setup.md docs/workflows/

# Meta
git mv docs/DOCUMENTATION_*.md docs/meta/
git mv docs/DEFINITION_OF_DONE.md docs/meta/
git mv docs/MIGRATION_CHECKLIST.md docs/meta/
git mv docs/ORCHESTRATION_WORKFLOW.md docs/meta/
git mv docs/doc-upgrade.md docs/meta/
```

### Phase 4: Update Internal Links

1. Scan all moved files for internal links
2. Update relative paths to match new structure
3. Update any index files or navigation

### Phase 5: Create Category Index Files

Create `README.md` or `index.md` files in each new directory explaining the category purpose and listing contents.

## Expected Outcome

**Before:**
```
docs/
├── [58 loose files]
└── [existing organized directories]
```

**After:**
```
docs/
├── README.md, INDEX.md  # 2 root files
├── security/            # 3 files
├── ci-cd/              # 5 files
├── migrations/         # 6 files
├── development/python/ # 6 files
├── features/user-management/ # 12 files
├── design/             # 4 files
├── planning/           # 4 files
├── infrastructure/     # 5 files
├── workflows/          # 3 files
├── meta/              # 6 files
└── [existing organized directories]
```

## Benefits

1. **Findability**: Documents grouped by logical purpose
2. **Maintainability**: Clear ownership and update paths
3. **Scalability**: New documents have obvious homes
4. **Navigation**: Hierarchical browsing instead of flat listing
5. **Reduced Cognitive Load**: ~56 fewer files to scan in root

## Implementation Timeline

- **Phase 1-2**: 15 minutes (categorization + mkdir)
- **Phase 3**: 30 minutes (systematic moves)
- **Phase 4**: 20 minutes (link updates)
- **Phase 5**: 15 minutes (index creation)

**Total: ~1.5 hours for complete reorganization**