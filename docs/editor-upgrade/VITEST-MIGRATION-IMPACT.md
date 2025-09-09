# Vitest Migration Impact Analysis

## Current State & Migration Plan

***

## Current Testing Setup Analysis

### What We Found

- **Minimal Jest footprint**: Only 2 references found
- **Already using Vitest**: `@testing-library/jest-dom/vitest` import shows Vitest is already in use
- **Not a big refactor**: This is actually a small cleanup, not a major migration

### Current Dependencies

```json
"@testing-library/jest-dom": "^6.8.0"  // Has Vitest support
```

### Current Test Setup

```typescript
// src/test-setup.ts
import '@testing-library/jest-dom/vitest';  // Already Vitest-compatible
```

***

## Migration Impact: MINIMAL

This is **NOT a big refactor**. The project is already using Vitest. We just need to:

1. **Update to latest Vitest** (if not already)
2. **Ensure consistent configuration**
3. **Remove any Jest remnants**
4. **Add proper typing**

***

## Safe Migration Plan (Low Risk)

### Phase 1: Audit Current Setup (5 minutes)

```bash
# Check current Vitest version
cd apps/web
grep vitest package.json

# Check test configuration
ls vitest.config.* vite.config.*

# Count existing tests
find src -name "*.test.*" -o -name "*.spec.*" | wc -l
```

### Phase 2: Update Dependencies (10 minutes)

```bash
# Update to latest Vitest
bun add -D vitest@latest @vitest/ui@latest

# Ensure testing library compatibility
bun add -D @testing-library/react@latest @testing-library/user-event@latest

# Keep jest-dom for matchers (it's Vitest-compatible)
# No change needed for @testing-library/jest-dom
```

### Phase 3: Verify Configuration (5 minutes)

```typescript
// Ensure vitest.config.ts or vite.config.ts has test config
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts']
  }
});
```

### Phase 4: Run Tests (2 minutes)

```bash
# Verify everything works
bun run test
```

***

## What This Is NOT

### Not Required

- ❌ Rewriting test files
- ❌ Changing test syntax
- ❌ Major refactoring
- ❌ Breaking changes

### What It Is

- ✅ Version update
- ✅ Config cleanup
- ✅ Small optimization

***

## Risk Assessment

### Risk Level: **LOW**

| Aspect         | Risk    | Mitigation                |
| -------------- | ------- | ------------------------- |
| Existing tests | None    | Already Vitest-compatible |
| Dependencies   | Minimal | Only updating versions    |
| Syntax         | None    | No syntax changes needed  |
| CI/CD          | None    | Same test commands        |
| Development    | None    | Same workflow             |

***

## Decision Matrix

### Should We Do This Now?

| Factor  | Score   | Reason                        |
| ------- | ------- | ----------------------------- |
| Urgency | Low     | Current setup works           |
| Effort  | Minimal | < 30 minutes                  |
| Risk    | Low     | Already using Vitest          |
| Benefit | Medium  | Cleaner deps, latest features |

**Recommendation**: YES, but as a **quick cleanup**, not a major task.

***

## Actual Implementation Steps

### Step 1: Quick Update (Total: 15 minutes)

```bash
# 1. Update Vitest to latest
cd apps/web
bun add -D vitest@latest @vitest/ui@latest

# 2. Verify test-setup.ts is correct
# (Already correct based on our scan)

# 3. Run tests to verify
bun run test

# 4. If all green, commit
git add -A
git commit -m "chore: update vitest to latest"
```

### Step 2: Only If Needed

If any issues arise:

```bash
# Check for breaking changes
npm info vitest versions

# Review changelog
https://github.com/vitest-dev/vitest/releases
```

***

## What About Our Editor Migration?

### Impact on Editor Work: **NONE**

The Vitest update is:

- Independent of editor migration
- Can be done before, during, or after
- Won't affect our Markdown editor implementation
- Actually helps by ensuring testing is ready

### Recommended Timing

1. **Do Vitest update first** (15 minutes)
2. **Then continue with editor Phase 2**
3. **Write new tests with latest Vitest**

***

## Conclusion

**This is not the big refactor you were concerned about.**

What we discovered:

- Project already uses Vitest
- Only needs version update
- No code changes required
- 15-minute task, not multi-day refactor

### Action Items

1. ✅ Update Vitest to latest (15 min)
2. ✅ Continue with editor migration as planned
3. ✅ Write new tests using updated Vitest

The "jest" references we found are actually Vitest-compatible imports. This is a simple version update, not a migration.

***

*Updated: September 2025*
