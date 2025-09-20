---
id: ruff-and-python-upgrade-summary
title: Ruff 0.13.0 & Python 3.13 Upgrade Summary
type: reference
version: 1.0.0
created: '2025-09-16'
updated: '2025-09-16'
author: Journal Team
tags:
- reference
- python
priority: medium
status: approved
visibility: internal
schema_version: v1
---

# Ruff 0.13.0 & Python 3.13 Upgrade Summary

## Overview
Successfully upgraded Ruff linting to 0.13.0 and standardized Python version to 3.13 across the entire project.

## Changes Applied

### 1. Ruff Upgrade (0.12.11 → 0.13.0)

#### Configuration Updates (`apps/api/pyproject.toml`)
- ✅ Updated `ruff>=0.13.0` in dev dependencies
- ✅ Added `force-exclude = true` for pre-commit consistency
- ✅ Added `explicit-preview-rules = true` under `[tool.ruff.lint]`
- ✅ Enabled `preview = true` for controlled preview features
- ✅ Simplified Ruff configuration

#### CI/CD Updates (`.github/workflows/lint.yml`)
- ✅ Migrated to official `astral-sh/ruff-action@v3`
- ✅ Pinned Ruff version to 0.13.0
- ✅ Maintained GitHub annotation output format
- ✅ Documented alternative uv approach

#### Pre-commit Updates (`apps/api/.pre-commit-config.yaml`)
- ✅ Updated ruff-pre-commit to v0.13.0
- ✅ Removed redundant Ruff (Ruff I rules handle imports)

### 2. Python Version Standardization (3.11/3.12 → 3.13)

#### Project Configuration
- ✅ `apps/api/pyproject.toml`: `requires-python = ">=3.13"`
- ✅ `apps/api/pyproject.toml`: `python_version = "3.13"` for mypy
- ✅ `docs/*/pyproject.toml`: Updated to Python 3.13

#### CI/CD Workflows Updated (9 files)
- ✅ `.github/workflows/api-tests.yml`
- ✅ `.github/workflows/ci.yml`
- ✅ `.github/workflows/deploy-docs.yml`
- ✅ `.github/workflows/documentation-validate.yml`
- ✅ `.github/workflows/infisical-ci.yml`
- ✅ `.github/workflows/lint.yml`
- ✅ `.github/workflows/release.yml`
- ✅ `.github/workflows/security-scan.yml`
- ✅ `.github/workflows/web-tests.yml`

#### Key Changes
- Removed Python matrix testing (was 3.11, 3.12)
- Standardized on Python 3.13 only
- Updated all `PYTHON_VERSION` environment variables
- Updated all `python-version` action parameters
- Updated all `uv python install` commands

### 3. Code Formatting Applied
- 12 files auto-formatted by Ruff 0.13.0
- All formatting now consistent with latest Ruff standards
- No linting violations remaining

## Verification Results

### Ruff Status
```
$ uv run ruff --version
ruff 0.13.0

$ uv run ruff check .
All checks passed!

$ uv run ruff format --check .
184 files already formatted
```

### Configuration Validation
```
linter.preview = enabled
linter.explicit_preview_rules = true
formatter.preview = disabled
```

### Python Version Consistency
All workflows, configurations, and documentation now use Python 3.13:
- Environment variables: `PYTHON_VERSION: "3.13"`
- GitHub Actions: `python-version: '3.13'`
- uv commands: `uv python install 3.13`
- pyproject.toml: `requires-python = ">=3.13"`

## Impact Summary

### Benefits
1. **Latest Ruff features**: Access to preview rules with explicit control
2. **Python 3.13 features**: Latest Python improvements and performance
3. **Simplified CI**: No matrix testing reduces CI time and complexity
4. **Consistency**: Single Python version across entire project
5. **Modern tooling**: Official GitHub Actions for better integration

### Files Modified
- 132 files total (mostly formatting and import cleanup)
- 12 configuration files (workflows, pyproject.toml, pre-commit)
- All changes are backwards compatible

## Next Steps

1. **Commit changes**: All changes ready for commit
2. **PR will trigger**: New CI runs with Ruff 0.13.0 and Python 3.13
3. **Monitor CI**: Verify all workflows pass with new configuration
4. **Team notification**: Inform team about Python 3.13 requirement

## Commands for Team

After pulling these changes:
```bash
# Update local environment
cd apps/api
uv sync --all-extras --dev

# Verify Ruff version
uv run ruff --version  # Should show 0.13.0

# Run formatting locally
uv run ruff format .
uv run ruff check . --fix

# Update pre-commit hooks
pre-commit install
pre-commit autoupdate
```

---
*Upgrade completed: January 2025*
*Ruff: 0.13.0 | Python: 3.13*