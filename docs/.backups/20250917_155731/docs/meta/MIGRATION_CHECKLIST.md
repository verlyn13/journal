---
id: migration-checklist
title: Documentation Migration Checklist
type: api
version: 1.0.0
created: '2025-09-16'
updated: '2025-09-16'
author: Journal Team
tags:
- api
- python
- fastapi
priority: high
status: approved
visibility: internal
schema_version: v1
---

# Documentation Migration Checklist

## Pre-Migration Audit

### Current State (2025-09-16)
- **Total Documents**: 232 markdown files
- **Documents with Frontmatter**: 28 (12%)
- **Documents without Frontmatter**: 204 (88%)
- **Current Directory Structure**: Mixed (legacy + some new)

### Directory Status
```
✅ schemas/       - New structure (v1 schemas ready)
❌ adr/          - Needs migration to decisions/
❌ audits/       - Needs reorganization
❌ biome/        - Reference docs, needs categorization
❌ bun/          - Reference docs, needs categorization
❌ code-mirror/  - Reference docs, needs categorization
✅ deployment/   - Partially organized
❌ debugging/    - Move to guides/troubleshooting/
❌ editor-upgrade/ - Move to guides/development/
❌ implementation/ - Archive to _generated/archive/phases/
❌ initial-planning/ - Archive to _generated/archive/planning/
❌ status/       - Archive to _generated/archive/status/
⚠️ guides/       - Needs internal reorganization
```

## Migration Phases

### Phase 1: Directory Reorganization ⏳
- [ ] Backup existing structure
- [ ] Run reorganization script (dry-run)
- [ ] Review proposed changes
- [ ] Execute reorganization
- [ ] Verify all files moved
- [ ] Update git tracking

### Phase 2: Frontmatter Addition 🔴
- [ ] Generate frontmatter for 204 files
- [ ] Validate generated frontmatter
- [ ] Apply frontmatter to files
- [ ] Verify all files have frontmatter

### Phase 3: Schema Validation 🔴
- [ ] Run initial validation
- [ ] Fix critical errors (Priority-1 docs)
- [ ] Fix high-priority errors
- [ ] Fix medium-priority errors
- [ ] Address warnings

### Phase 4: Content Enhancement 🔴
- [ ] Add missing required sections
- [ ] Fix token count issues
- [ ] Add language to code blocks
- [ ] Add alt text to images
- [ ] Update stale documents

### Phase 5: API Documentation 🔴
- [ ] Generate OpenAPI spec from FastAPI
- [ ] Convert to structured Markdown
- [ ] Validate against api-reference schema
- [ ] Ensure 100% endpoint coverage

### Phase 6: Relationships & Links 🔴
- [ ] Map all document relationships
- [ ] Fix broken internal links
- [ ] Create redirect mappings
- [ ] Update navigation structure

### Phase 7: Index Generation 🔴
- [ ] Generate index.json
- [ ] Create INDEX.md
- [ ] Generate category READMEs
- [ ] Build navigation tree

### Phase 8: Reports & Validation 🔴
- [ ] Generate coverage report
- [ ] Create documentation dashboard
- [ ] Run security scan
- [ ] Final validation check

## Critical Files to Process First

### Priority-1 (Blocking Deployment)
1. `docs/deployment/*.md` - Deployment guides
2. `docs/api/**/*.md` - API documentation
3. `docs/INFISICAL_ARCHITECTURE.md` - Security architecture
4. `docs/ADVANCED_AUTH.md` - Authentication docs
5. `docs/CI_*.md` - CI/CD documentation

### Priority-2 (Pre-Launch)
1. `docs/guides/getting-started.md`
2. `docs/guides/authentication.md`
3. `docs/guides/troubleshooting.md`
4. `docs/README.md` - Main documentation index

## Validation Targets

### Must Pass (100%)
- [ ] API documentation schema compliance
- [ ] Deployment documentation freshness (≤30 days)
- [ ] Security documentation completeness
- [ ] No secrets in documentation
- [ ] All internal links valid

### Should Pass (>90%)
- [ ] Overall schema compliance
- [ ] Documentation coverage
- [ ] Frontmatter completeness
- [ ] Correct document types
- [ ] Tags from taxonomy

## Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Documents with frontmatter | 12% | 100% | 🔴 |
| Schema validation pass rate | Unknown | 100% (P1) | 🔴 |
| API documentation coverage | 0% | 100% | 🔴 |
| Internal links valid | Unknown | 100% | 🔴 |
| Secrets scan clean | Unknown | 100% | 🔴 |
| Overall health score | Unknown | >80% | 🔴 |

## Commands to Execute

```bash
# Phase 1: Reorganize (dry-run first!)
uv run python scripts/reorganize_docs.py
uv run python scripts/reorganize_docs.py --execute

# Phase 2: Add frontmatter
uv run python scripts/add_frontmatter.py --auto

# Phase 3: Validate
uv run python scripts/validate_docs.py

# Phase 4: Fix content
uv run python scripts/fix_content.py --auto

# Phase 5: Generate API docs
uv run python scripts/generate_api_docs.py

# Phase 6: Fix relationships
uv run python scripts/fix_relationships.py

# Phase 7: Generate indexes
uv run python scripts/generate_doc_index.py

# Phase 8: Final validation
uv run python scripts/check_doc_coverage.py
uv run python scripts/generate_doc_report.py
uv run python scripts/anonymize_docs.py --scan
```

## Next Actions

1. **IMMEDIATE**: Run reorganization script in dry-run mode
2. **THEN**: Create frontmatter generation script
3. **THEN**: Process Priority-1 documents
4. **FINALLY**: Run full validation suite

---

**Status Legend**:
- 🟢 Complete
- 🟡 In Progress
- 🔴 Not Started
- ⏳ Ready to Start
- ⚠️ Needs Attention

**Overall Status**: 🔴 Not Started (0% complete)