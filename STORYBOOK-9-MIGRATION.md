# Storybook 9 Migration Workflow

## Pre-Migration Status
- **Current Version**: 8.6.14
- **Target Version**: 9.1.5
- **Migration Date**: January 9, 2025
- **Branch**: `storybook-9-migration`

## Compatibility Issues Found
- ❌ storybook-addon-performance@0.17.3 (depends on ^7.6.10)
- ✅ @storybook/addon-essentials
- ✅ @storybook/addon-a11y
- ✅ @storybook/react
- ✅ @storybook/react-vite

## Migration Plan

### Phase 1: Preparation ✅
- [x] Check current version (8.6.14)
- [x] Create migration branch
- [x] Run compatibility audit
- [x] Create test story for verification
- [ ] Backup current configuration

### Phase 2: Core Migration
- [ ] Run automated migration with `npx storybook@latest upgrade`
- [ ] Update configuration files to v9 format
- [ ] Fix breaking changes in main.ts
- [ ] Update preview.ts configuration

### Phase 3: Story Updates
- [ ] Update story format to CSF3
- [ ] Remove deprecated patterns
- [ ] Fix TypeScript issues
- [ ] Update addons configuration

### Phase 4: Testing
- [ ] Build Storybook
- [ ] Test all stories
- [ ] Run interaction tests
- [ ] Verify documentation

### Phase 5: Cleanup
- [ ] Remove deprecated dependencies
- [ ] Update CI/CD configuration
- [ ] Document breaking changes
- [ ] Merge to main

## Breaking Changes to Address

### 1. Configuration Format
```typescript
// Old (v8): .storybook/main.js
module.exports = {
  stories: [...],
  addons: [...]
}

// New (v9): .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
const config: StorybookConfig = {
  stories: [...],
  addons: [...],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};
export default config;
```

### 2. Story Format
```typescript
// Old (v8)
export const MyStory = Template.bind({});
MyStory.args = { ... };

// New (v9)
export const MyStory: Story = {
  args: { ... },
};
```

### 3. Addons
- Remove storybook-addon-performance (incompatible)
- Update to latest addon versions

## Verification Checklist
- [ ] All stories render without errors
- [ ] Build completes successfully
- [ ] No console errors in development
- [ ] TypeScript compilation passes
- [ ] Documentation is accessible

## Rollback Plan
If migration fails:
1. `git checkout main`
2. `git branch -D storybook-9-migration`
3. `bun install` to restore dependencies

## Notes
- Migration is lower risk than React 19 (dev-only tooling)
- Can run old and new versions side-by-side if needed
- Clear migration path with automated codemods