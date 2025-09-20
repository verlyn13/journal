# Ruff Linting Upgrade Plan (2025)

## Executive Summary

This document outlines the upgrade path for Ruff linting in the Journal project, moving from v0.12.11 to v0.13.0 with modern best practices.

## Current State (Completed Audit)

- **Version**: Ruff 0.12.11 → Upgrading to 0.13.0
- **Configuration**: Comprehensive rule selection in `apps/api/pyproject.toml`
- **CI**: GitHub Actions workflow with uv → Migrating to official Astral Action
- **Pre-commit**: Using ruff hooks + redundant isort → Streamlined

## Completed Improvements

### 1. Configuration Modernization ✅
- Added `force-exclude = true` for pre-commit consistency
- Enabled `explicit-preview-rules = true` for controlled preview adoption
- Simplified isort configuration (removed redundant settings)
- Removed `target-version` to infer from `requires-python`

### 2. CI Workflow Enhancement ✅
- Migrated to official `astral-sh/ruff-action@v3`
- Pinned version to 0.13.0 for reproducibility
- Maintained GitHub annotation format for PR feedback
- Kept alternative uv approach documented for flexibility

### 3. Pre-commit Cleanup ✅
- Updated ruff-pre-commit to v0.13.0
- Removed redundant isort (Ruff's I rules handle this)
- Maintained bandit for security scanning

## Phased Rollout Strategy

### Phase 0: Formatter First (Current) ✅
- Ruff format enforced in CI
- E501 ignored (formatter handles line length)
- Status: **Active**

### Phase 1: Core Lints (Active) 🟡
Rules enabled: E/F, I, UP, B, C4, SIM
- High signal-to-noise ratio
- Largely mechanical fixes
- Status: **In Progress**

### Phase 2: Security & Quality (Active) 🟡
Rules enabled: S, TRY, BLE, EM, ASYNC, PERF
- Security patterns via Bandit subset
- Error handling improvements
- Performance suggestions
- Status: **In Progress**

### Phase 3: Advanced Rules (Planned) 📅
Target: After stabilization
- DTZ (datetime timezone awareness)
- PTH (pathlib migration)
- FURB (refurb modernization)
- Status: **Planned Q2 2025**

### Phase 4: Documentation (Optional) 📅
Target: When team ready
- Enable D rules with Google convention
- Start with public APIs only
- Use per-file-ignores for gradual adoption
- Status: **Deferred**

## Implementation Commands

### Development
```bash
# Update dependencies
cd apps/api
uv sync --all-extras --dev

# Run checks locally
uv run ruff check . --output-format=concise
uv run ruff format --check .

# Auto-fix safe issues
uv run ruff check . --fix
uv run ruff format .
```

### Pre-commit Setup
```bash
# Install/update hooks
cd apps/api
pre-commit install
pre-commit autoupdate
pre-commit run --all-files
```

### CI Verification
```bash
# Test CI locally with act
act -j python-lint -W .github/workflows/lint.yml
```

## Monitoring & Metrics

### Success Metrics
- Zero ruff failures in main branch
- < 5% false positive rate on new rules
- Developer satisfaction (no ping-pong PRs)
- CI runtime < 2 minutes for linting

### Baseline (Current)
```
Total Rules: 30+ categories enabled
Ignored: 27 rules (mostly complexity/docs)
Per-file-ignores: 18 patterns configured
Format: Black-compatible with 100 char line length
```

## Common Issues & Solutions

### Issue: Import order conflicts
**Solution**: Ruff's I rules supersede isort. Remove isort from toolchain.

### Issue: Preview rules too aggressive
**Solution**: Use `explicit-preview-rules = true` and enable selectively.

### Issue: Format vs lint conflicts
**Solution**: Run formatter after linter, ignore E501 in lints.

### Issue: Test file noise
**Solution**: Comprehensive per-file-ignores for `tests/**/*.py`

## Migration Checklist

- [x] Audit current configuration
- [x] Update to Ruff 0.13.0
- [x] Modernize pyproject.toml settings
- [x] Migrate CI to official Action
- [x] Clean up pre-commit hooks
- [x] Document upgrade plan
- [ ] Run full codebase check
- [ ] Address critical violations
- [ ] Communicate to team
- [ ] Monitor for 1 week post-deployment

## Resources

- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [Migration Guide](https://docs.astral.sh/ruff/configuration/)
- [Rule Reference](https://docs.astral.sh/ruff/rules/)
- [GitHub Action](https://github.com/astral-sh/ruff-action)

## Next Steps

1. **Immediate**: Test configuration with `uv run ruff check apps/api`
2. **This Week**: Fix any critical violations found
3. **Next Sprint**: Evaluate Phase 3 rules for adoption
4. **Q2 2025**: Consider documentation enforcement

---

*Last Updated: January 2025*
*Maintainer: Engineering Team*