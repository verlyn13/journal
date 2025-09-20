# Progressive Ruff Autofixing Strategy

This document outlines our September 2025 progressive autofixing approach with Ruff 0.13.0, designed for safe, intelligent automation.

## Overview

Our strategy uses a **graduated safety ladder** for autofix adoption:

1. **Safe fixes only** (current state)
2. **Curated unsafe fixes** via `extend-safe-fixes`
3. **Full unsafe fixes** (optional future state)

## Current Configuration

### Version Locking
```toml
[tool.ruff]
required-version = "==0.13.0"  # Prevents version drift
```

### Conservative Autofix Start
```toml
[tool.ruff.lint]
fixable = ["E", "F", "I"]           # Start small, expand gradually
extend-safe-fixes = []              # Promote after validation
extend-unsafe-fixes = ["TCH"]       # Keep type-checking moves gated
```

### Discovery Mode Integration
Use `scripts/ruff-discovery-mode.sh` to analyze unsafe fix opportunities without applying them.

## Discovery Mode Workflow

### 1. Generate Analysis
```bash
./scripts/ruff-discovery-mode.sh
```

This creates:
- `unsafe-fixes.json` - Available unsafe fixes with applicability info
- `safe-fixes.json` - Current safe fixes available
- `all-violations.json` - Complete violation summary
- Analysis script with recommendations

### 2. Review High-Volume, Low-Risk Rules

Focus on rules that appear frequently and are historically safe:
- `I001` - Import sorting (extremely safe)
- `UP032` - f-string formatting (usually safe)
- `UP006`, `UP007` - Type annotation improvements (generally safe)

### 3. Test in Development
```bash
# Test specific unsafe fix without applying
cd apps/api
uv run ruff check . --unsafe-fixes --select I001 --diff

# Apply for testing (in feature branch)
uv run ruff check . --unsafe-fixes --select I001 --fix
```

### 4. Promote Validated Rules
After testing, add to `pyproject.toml`:
```toml
[tool.ruff.lint]
extend-safe-fixes = ["I001", "UP032"]  # Proven safe in our codebase
```

## CI Integration

### Discovery Mode Analysis (Non-blocking)
- Runs on PRs with Python changes
- Uploads analysis artifacts
- Comments on PR with opportunities
- Does NOT block merges

### Safe Autofix in CI
- PRs: `ruff check --fix --exit-non-zero-on-fix` (fails if fixes needed)
- Encourages developers to run pre-commit locally

### Lint Job Enhancement
```yaml
- uses: astral-sh/ruff-action@v3
  with:
    version: 0.13.0
    args: check --output-format=github  # Better CI annotations
```

## Pre-commit Setup

### Recommended Order
```yaml
- id: ruff-check
  args: [--fix]    # lint and fix first
- id: ruff-format  # then format
```

**Why this order?** Fixes can create code that needs reformatting.

## Expansion Strategy

### Phase 1: Foundation (Current)
- ✅ Version locked at 0.13.0
- ✅ Safe fixes only (`E`, `F`, `I`)
- ✅ Discovery mode implemented
- ✅ CI analysis pipeline

### Phase 2: Careful Expansion (Next)
- Validate high-volume rules via discovery mode
- Add 2-3 rules to `extend-safe-fixes`
- Monitor for regressions over 2 weeks
- Expand `fixable` list to include validated rules

### Phase 3: Mature Automation (Future)
- Most common unsafe fixes promoted to safe
- Broader `fixable` categories
- Optional: `unsafe-fixes = true` for non-critical rules

## Safety Guidelines

### ✅ Good Candidates for `extend-safe-fixes`
- Import sorting (`I001`)
- String formatting upgrades (`UP032`)
- Simple syntax modernization (`UP006`, `UP007`)
- Comprehension improvements (after validation)

### ❌ Keep Gated as Unsafe
- Type checking imports (`TCH`) - can break runtime
- Complex refactoring rules - require review
- Performance optimizations - may change behavior
- Anything modifying control flow

## Monitoring & Rollback

### Success Metrics
- ✅ No CI test failures after autofix promotion
- ✅ No behavioral changes in application
- ✅ Developer feedback remains positive
- ✅ Code quality metrics improve

### Rollback Plan
If issues arise:
1. Remove problematic rule from `extend-safe-fixes`
2. Add to `extend-unsafe-fixes` temporarily
3. Investigate and fix configuration
4. Re-evaluate after fixes

## Tools & Commands

### Development Commands
```bash
# Discovery analysis
./scripts/ruff-discovery-mode.sh

# Test specific rule
cd apps/api && uv run ruff check . --select RULE --diff

# Apply safe fixes only
cd apps/api && uv run ruff check . --fix

# Apply specific unsafe fix (testing)
cd apps/api && uv run ruff check . --unsafe-fixes --select RULE --fix

# Check current configuration
cd apps/api && uv run ruff check . --show-settings
```

### CI Artifacts
- `ruff-discovery-reports` - Analysis results
- `alignment-report` - Version compliance
- Coverage reports with fix impact

## Documentation Standards

### Keeping Policy Aligned
Our CI enforces alignment with:
```bash
# Fails on stale tool references
rg -n "(isort|flake8|black(?!listed))" docs/ .github/ || exit 0
```

### Update Checklist
When expanding autofix capabilities:
- [ ] Update this document
- [ ] Update `CONTRIBUTING.md`
- [ ] Update developer onboarding docs
- [ ] Test in feature branch first
- [ ] Monitor for 2 weeks after promotion

## Best Practices

1. **Start Conservative**: Better to under-fix than break builds
2. **Validate Thoroughly**: Test rules in isolation before promotion
3. **Monitor Actively**: Watch for regressions after changes
4. **Document Decisions**: Record why rules were promoted/demoted
5. **Gradual Expansion**: Add 1-3 rules at a time, not dozens

## Resources

- [Ruff Settings Documentation](https://docs.astral.sh/ruff/settings/)
- [Ruff Linter Rules](https://docs.astral.sh/ruff/rules/)
- [Autofix Safety Guide](https://docs.astral.sh/ruff/linter/#fix-safety)
- Project-specific: `apps/api/.ruff_reports/` (discovery mode outputs)

---

*This strategy evolves as we gain confidence and Ruff improves. Review quarterly.*