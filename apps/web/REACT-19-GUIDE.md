# React 19 Migration Guide

## Overview
This application has been successfully migrated to React 19.1.0 with opt-in React Compiler support.

## Key Changes

### 1. Dependencies Updated
- React: 18.3.1 → 19.1.0
- React DOM: 18.3.1 → 19.1.0
- Vite: 5.4.6 → 6.0.0
- TypeScript types updated for React 19

### 2. New Features Available

#### Error Boundaries (Enabled by Default)
The app now uses React 19's improved error handling:
```typescript
createRoot(el, {
  onUncaughtError: (error, errorInfo) => {
    // Send to error tracking service
  },
  onCaughtError: (error, errorInfo) => {
    // Log caught errors
  }
});
```

#### React Compiler (Opt-in)
The React Compiler automatically optimizes your components without manual memoization.

**To enable:**
```bash
# Development
ENABLE_REACT_COMPILER=true bun run dev

# With debug logging
ENABLE_REACT_COMPILER=true REACT_COMPILER_DEBUG=true bun run dev

# Production build
ENABLE_REACT_COMPILER=true bun run build
```

### 3. Feature Flags
Feature flags are configured in `src/config/feature-flags.ts`:
- React Compiler (opt-in via env var)
- Error boundaries (enabled)
- Automatic batching (enabled)
- Concurrent features (enabled)

### 4. Performance Improvements
- **Bundle size**: 4.3% smaller (9.7 MB vs 10.14 MB)
- **Build time**: 9.8% faster (11.85s vs 13.14s)
- **Automatic optimizations**: React 19 includes many performance improvements out of the box

## Development Workflow

### Running with React Compiler
```bash
# Enable compiler for development
ENABLE_REACT_COMPILER=true bun run dev

# The compiler will:
# - Automatically memoize components
# - Optimize re-renders
# - Cache expensive computations
# - Provide better performance without code changes
```

### Testing Compiler Optimizations
1. Use the `CompilerTest` component at `src/components/debug/CompilerTest.tsx`
2. Open browser DevTools console
3. Click "Update Unrelated State" button
4. Observe that ExpensiveChild doesn't re-render (with compiler enabled)

### ESLint Integration
The React Compiler ESLint plugin helps identify optimization opportunities:
```bash
# Run linting with React Compiler rules
bun run lint

# The plugin will warn about:
# - Components that could benefit from optimization
# - Patterns that prevent compiler optimizations
```

## Migration Checklist for Other Projects

### Phase 1: Preparation
- [ ] Create a new git branch
- [ ] Backup package-lock.json/yarn.lock
- [ ] Run existing tests to establish baseline

### Phase 2: Update Dependencies
```bash
# Update React
bun add react@^19.1.0 react-dom@^19.1.0
bun add -D @types/react@^19.1.0 @types/react-dom@^19.1.0

# Update build tools
bun add -D vite@^6.0.0 @vitejs/plugin-react@^5.0.0

# Add React Compiler (optional)
bun add -D babel-plugin-react-compiler@beta eslint-plugin-react-compiler@beta
```

### Phase 3: Update Configuration
1. Update `tsconfig.json`:
   - Set `target: "ES2022"`
   - Set `jsx: "react-jsx"`
   - Consider relaxing strict settings if needed

2. Update `vite.config.ts`:
   - Add React Compiler configuration (see our vite.config.ts)
   - Update build target to ES2022

3. Update root rendering (main.tsx):
   - Add error boundary callbacks to createRoot

### Phase 4: Testing
- [ ] Run test suite
- [ ] Test in development mode
- [ ] Build for production
- [ ] Test with React Compiler enabled
- [ ] Check bundle size

## Common Issues and Solutions

### TypeScript Errors
**Issue**: Ref type errors after migration
```typescript
// Before (React 18)
const ref: RefObject<HTMLDivElement> = useRef(null);

// After (React 19) - more strict
const ref: RefObject<HTMLDivElement | null> = useRef(null);
```

**Solution**: Update ref types or relax TypeScript settings temporarily

### Storybook Compatibility
- Storybook 8.2.1 works with React 19
- May see peer dependency warnings (safe to ignore)
- No need to upgrade to Storybook 9

### Build Warnings
- Peer dependency warnings are expected and safe
- Use `--legacy-peer-deps` if needed during installation

## Rollback Plan
If issues arise:
1. Switch back to main branch
2. Restore package.json from backup
3. Run `bun install`
4. Clear build cache: `rm -rf dist node_modules/.vite`

## Resources
- [React 19 Blog Post](https://react.dev/blog/2024/12/05/react-19)
- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [Migration Issues Log](../../docs/REACT-19-MIGRATION-ISSUES.md)

## Support
For questions or issues related to the React 19 migration:
1. Check the migration issues log
2. Review feature flags configuration
3. Test with/without React Compiler enabled
4. Check TypeScript configuration for strict settings