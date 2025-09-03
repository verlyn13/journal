# Journal Web Testing Documentation

## Overview

The Journal web application uses Vitest for testing React components and integration scenarios. Tests focus on the dual-write integration, markdown conversion, and editor functionality.

## Current Status

- **Test Files**: 3 (2 active, 1 skipped)
- **Total Tests**: 10 (7 passing, 3 skipped)
- **Test Categories**: Unit and Integration
- **Execution Time**: ~3 seconds

## Test Organization

```
src/
├── __tests__/
│   └── integration/
│       └── dual-write.test.tsx    # Dual-write integration (3 tests)
│
├── utils/
│   └── __tests__/
│       └── markdown-converter.test.ts  # Markdown conversion (4 tests)
│
└── components/
    └── markdown/
        └── __tests__/
            └── MarkdownPreview.test.tsx  # Preview component (3 tests, skipped)
```

## Running Tests

### Quick Commands

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test dual-write

# Run all quality checks (includes tests)
bun run quality:all
```

### Quality Checks

The `quality:all` script runs a comprehensive suite:

1. **Linting**: Biome format and lint checks
2. **Type Checking**: TypeScript compilation
3. **Tests**: Vitest test suite
4. **Bundle Check**: Verifies bundle size limits

```bash
# Run complete quality suite
bun run quality:all

# Individual checks
bun run quality:lint    # Biome linting
bun run quality:types   # TypeScript check
bun run quality:test    # Run tests
bun run quality:bundle  # Check bundle size
```

## Test Infrastructure

### Test Framework

- **Vitest**: Fast unit test framework with native ESM support
- **React Testing Library**: Component testing utilities
- **MSW**: Mock Service Worker for API mocking (if needed)

### Key Test Files

#### 1. Dual-Write Integration (`dual-write.test.tsx`)

Tests the Phase 4 dual-write functionality:

- Verifies markdown mode saves both HTML and markdown formats
- Tests header negotiation (`X-Editor-Mode`)
- Ensures backward compatibility in legacy mode

```typescript
it('saves both formats when in markdown mode', async () => {
  // Test that updateEntry is called with markdown_content and content_version
});

it('sends correct header in markdown mode', async () => {
  // Verifies X-Editor-Mode header is sent based on VITE_EDITOR
});

it('preserves backward compatibility in HTML mode', async () => {
  // Legacy mode doesn't send markdown fields
});
```

#### 2. Markdown Converter (`markdown-converter.test.ts`)

Tests the markdown/HTML conversion utilities:

- HTML to Markdown conversion
- Markdown to HTML conversion
- Special characters handling
- Code block preservation

```typescript
describe('markdown-converter', () => {
  it('converts HTML to Markdown');
  it('converts Markdown to HTML');
  it('handles special characters');
  it('preserves code blocks');
});
```

#### 3. Markdown Preview (Currently Skipped)

Tests for the markdown preview component. Currently skipped but structure is in place.

## Writing Tests

### Component Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<ComponentName onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};
```

### Mocking

#### API Mocking

```typescript
vi.mock('../../services/api', () => ({
  default: {
    getEntries: vi.fn(async () => []),
    createEntry: vi.fn(async (data) => ({ id: '1', ...data })),
    updateEntry: vi.fn(async (id, data) => ({ id, ...data })),
  }
}));
```

#### Environment Variables

```typescript
// Set environment variable for test
(import.meta as any).env = {
  ...import.meta.env,
  VITE_EDITOR: 'markdown',
};
```

## Bundle Size Testing

The project enforces bundle size limits:

- **Core Bundle Limit**: 1500KB
- **Current Size**: 1318KB ✅
- **Monaco Editor**: Loaded dynamically (not in core bundle)

Bundle check runs automatically with:

```bash
bun run quality:bundle
```

This builds the production bundle and verifies size constraints.

## Phase 4 Specific Tests

### Dual-Write Integration

The dual-write tests verify:

1. **Markdown Mode**:
   - Sends `markdown_content` field when saving
   - Sets `content_version: 2` for markdown entries
   - Includes `X-Editor-Mode: markdown` header

2. **Legacy Mode**:
   - Only sends HTML content
   - No markdown-specific fields
   - Maintains backward compatibility

3. **Header Negotiation**:
   - API respects `X-Editor-Mode` header
   - Returns appropriate format based on client preference

## Continuous Integration

Tests run automatically in CI on:
- Pull requests
- Pushes to main branch
- Manual workflow dispatch

GitHub Actions workflow includes:
1. Install dependencies with Bun
2. Run type checking
3. Run linting
4. Run test suite
5. Check bundle size

## Troubleshooting

### Common Issues

1. **Test Timeout**
   - Increase timeout: `{ timeout: 5000 }`
   - Check for unresolved promises

2. **Module Import Errors**
   - Clear cache: `rm -rf node_modules/.vite`
   - Reinstall: `bun install`

3. **React Testing Library Queries**
   - Use `screen.debug()` to see rendered output
   - Prefer accessible queries (getByRole, getByLabelText)

4. **Mock Not Working**
   - Ensure mock is before component import
   - Clear module cache between tests

### Debug Mode

```bash
# Run with detailed output
bun test --reporter=verbose

# Run single test file
bun test dual-write

# Run in UI mode (opens browser)
bun test --ui
```

## Best Practices

1. **Test User Behavior**: Test what users do, not implementation details
2. **Use Testing Library Queries**: Prefer accessible queries over test IDs
3. **Async Handling**: Always use `waitFor` for async operations
4. **Cleanup**: Vitest handles cleanup automatically
5. **Mocking**: Mock at the module boundary, not internal functions

## Next Steps

1. **Increase Coverage**: Add tests for more components
2. **E2E Tests**: Consider Playwright for full E2E testing
3. **Visual Regression**: Add visual regression tests for UI consistency
4. **Performance Tests**: Add tests for bundle size and runtime performance

---

*Last Updated: September 2025*
*Test Framework: Vitest 3.2.4*
*Bundle Size: 1318KB (under 1500KB limit)*