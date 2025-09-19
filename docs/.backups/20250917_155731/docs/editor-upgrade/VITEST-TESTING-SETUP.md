---
id: vitest-testing-setup
title: Vitest Testing Setup
type: testing
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- testing
- typescript
- react
priority: medium
status: approved
visibility: internal
schema_version: v1
---

# Vitest Testing Setup

## Modern Testing Strategy for Journal Application

***

## Why Vitest Over Vitest

1. **No deprecated dependencies** - Clean dependency tree
2. **Native ESM support** - No transpilation needed
3. **Vite integration** - Same config, faster execution
4. **TypeScript first** - Built-in TS support
5. **Compatible API** - Easy migration from Vitest
6. **Better performance** - Faster test runs

***

## Installation & Configuration

### 1. Dependencies

```bash
# Remove Vitest if present
cd apps/web
bun remove Vitest @types/Vitest ts-Vitest Vitest-environment-jsdom

# Install Vitest and testing utilities
bun add -D vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/Vitest-dom happy-dom
```

### 2. Vitest Configuration

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules (managed by Bun)/',
        'src/test/',
        '*.config.ts',
        '**/*.d.ts',
        '**/*.stories.tsx',
        '**/index.ts'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    css: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/utils': path.resolve(__dirname, './src/utils')
    }
  }
});
```

### 3. Test Setup File

```typescript
// apps/web/src/test/setup.ts
import '@testing-library/Vitest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### 4. Package.json Scripts

```json
// apps/web/package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:debug": "vitest --inspect-brk --single-thread",
    "quality:test": "vitest run --coverage --silent"
  }
}
```

***

## Testing Patterns for Editor Migration

### 1. Type-Safe Component Tests

```typescript
// apps/web/src/components/markdown/__tests__/MarkdownEditor.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '../MarkdownEditor';
import type { MarkdownEditorProps } from '@/types/ui/editor';

describe('MarkdownEditor', () => {
  const defaultProps: MarkdownEditorProps = {
    initialContent: '# Test',
    format: 'markdown',
    onContentChange: vi.fn(),
    readOnly: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial content', () => {
    render(<MarkdownEditor {...defaultProps} />);
    
    const editor = screen.getByTestId('markdown-editor');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveTextContent('# Test');
  });

  it('converts HTML to Markdown on mount', async () => {
    const htmlProps: MarkdownEditorProps = {
      ...defaultProps,
      initialContent: '<h1>Title</h1><p>Content</p>',
      format: 'html'
    };
    
    render(<MarkdownEditor {...htmlProps} />);
    
    await waitFor(() => {
      const editor = screen.getByTestId('markdown-editor');
      expect(editor).toHaveTextContent('# Title');
      expect(editor).toHaveTextContent('Content');
    });
  });

  it('calls onContentChange when editing', async () => {
    const user = userEvent.setup();
    const onContentChange = vi.fn();
    
    render(
      <MarkdownEditor 
        {...defaultProps} 
        onContentChange={onContentChange}
      />
    );
    
    const editor = screen.getByRole('textbox');
    await user.type(editor, '\n\nNew content');
    
    await waitFor(() => {
      expect(onContentChange).toHaveBeenCalled();
      expect(onContentChange).toHaveBeenLastCalledWith(
        expect.stringContaining('New content')
      );
    });
  });

  it('respects readOnly prop', () => {
    render(<MarkdownEditor {...defaultProps} readOnly={true} />);
    
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('contenteditable', 'false');
  });
});
```

### 2. Sanitization Tests

````typescript
// apps/web/src/components/markdown/__tests__/MarkdownPreview.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MarkdownPreview } from '../MarkdownPreview';

describe('MarkdownPreview - Security', () => {
  it('sanitizes XSS attempts', () => {
    const dangerous = `
      <script>alert('XSS')</script>
      # Safe Heading
      <img src=x onerror="alert('XSS')">
    `;
    
    const { container } = render(<MarkdownPreview content={dangerous} />);
    
    // Script tags should be removed
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('alert');
    
    // Safe content should remain
    expect(container.querySelector('h1')).toHaveTextContent('Safe Heading');
    
    // Dangerous attributes should be removed
    const img = container.querySelector('img');
    expect(img).not.toHaveAttribute('onerror');
  });

  it('preserves safe KaTeX classes', () => {
    const math = '$E = mc^2$';
    const { container } = render(<MarkdownPreview content={math} />);
    
    expect(container.querySelector('.katex')).toBeInTheDocument();
    expect(container.querySelector('.katex-mathml')).toBeInTheDocument();
  });

  it('preserves code highlighting classes', () => {
    const code = '```javascript\nconst x = 42;\n```';
    const { container } = render(<MarkdownPreview content={code} />);
    
    const codeBlock = container.querySelector('pre code');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock?.className).toMatch(/language-javascript/);
    expect(container.querySelector('.hljs')).toBeInTheDocument();
  });
});
````

### 3. Conversion Tests

````typescript
// apps/web/src/utils/__tests__/markdown-converter.test.ts
import { describe, it, expect } from 'vitest';
import { convertHtmlToMarkdown } from '../markdown-converter';
import type { ConversionResult } from '@/types/markdown';

describe('HTML to Markdown Conversion', () => {
  it('converts basic HTML elements', () => {
    const testCases = [
      { html: '<h1>Title</h1>', markdown: '# Title' },
      { html: '<h2>Subtitle</h2>', markdown: '## Subtitle' },
      { html: '<p>Paragraph</p>', markdown: 'Paragraph' },
      { html: '<strong>Bold</strong>', markdown: '**Bold**' },
      { html: '<em>Italic</em>', markdown: '_Italic_' },
      { html: '<a href="https://journal.local">Link</a>', markdown: '[Link](https://journal.local)' },
    ];

    testCases.forEach(({ html, markdown }) => {
      const result = convertHtmlToMarkdown(html);
      expect(result.success).toBe(true);
      expect(result.markdown.trim()).toBe(markdown);
    });
  });

  it('preserves line breaks', () => {
    const html = 'Line 1<br>Line 2';
    const result = convertHtmlToMarkdown(html);
    
    expect(result.success).toBe(true);
    expect(result.markdown).toBe('Line 1  \nLine 2');
  });

  it('converts lists correctly', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const result = convertHtmlToMarkdown(html);
    
    expect(result.success).toBe(true);
    expect(result.markdown).toContain('- Item 1');
    expect(result.markdown).toContain('- Item 2');
  });

  it('handles invalid input gracefully', () => {
    const testCases = [
      null,
      undefined,
    123,
      {},
      []
    ];

    testCases.forEach(invalidInput => {
      const result = convertHtmlToMarkdown(invalidInput as any);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  it('converts TipTap math notation', () => {
    const html = '<span class="math math-inline">E=mc^2</span>';
    const result = convertHtmlToMarkdown(html);
    
    expect(result.success).toBe(true);
    expect(result.markdown).toBe('$E=mc^2$');
  });

  it('converts code blocks', () => {
    const html = '<pre><code class="language-javascript">const x = 42;</code></pre>';
    const result = convertHtmlToMarkdown(html);
    
    expect(result.success).toBe(true);
    expect(result.markdown).toBe('```javascript\nconst x = 42;\n```');
  });
});
````

### 4. Type Guard Tests

```typescript
// apps/web/src/types/__tests__/guards.test.ts
import { describe, it, expect } from 'vitest';
import { isEntry, isMarkdownEntry } from '../guards';
import type { Entry } from '../domain/entry';

describe('Type Guards', () => {
  describe('isEntry', () => {
    it('validates valid entries', () => {
      const valid: Entry = {
        id: '123',
        title: 'Test',
        content: 'Content',
        format: 'markdown',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user123'
      };
      
      expect(isEntry(valid)).toBe(true);
    });

    it('rejects invalid entries', () => {
      const invalid = [
        null,
        undefined,
        {},
        { id: '123' },
        { id: '123', content: 'test' },
        { id: '123', content: 'test', format: 'invalid' }
      ];
      
      invalid.forEach(item => {
        expect(isEntry(item)).toBe(false);
      });
    });
  });

  describe('isMarkdownEntry', () => {
    it('identifies markdown entries with content', () => {
      const entry: Entry = {
        id: '123',
        title: 'Test',
        content: 'HTML content',
        format: 'markdown',
        markdown: '# Markdown content',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user123'
      };
      
      expect(isMarkdownEntry(entry)).toBe(true);
    });

    it('rejects entries without markdown', () => {
      const entry: Entry = {
        id: '123',
        title: 'Test',
        content: 'HTML content',
        format: 'html',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user123'
      };
      
      expect(isMarkdownEntry(entry)).toBe(false);
    });
  });
});
```

### 5. Integration Tests

```typescript
// apps/web/src/components/markdown/__tests__/MarkdownSplitPane.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownSplitPane } from '../MarkdownSplitPane';

describe('MarkdownSplitPane Integration', () => {
  const mockEntry = {
    id: '123',
    content: '# Test Entry\n\nThis is markdown content.',
    format: 'markdown' as const
  };

  it('renders in split mode by default', () => {
    render(<MarkdownSplitPane entry={mockEntry} />);
    
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('switches view modes correctly', () => {
    render(<MarkdownSplitPane entry={mockEntry} />);
    
    // Switch to edit only
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
    
    // Switch to preview only
    fireEvent.click(screen.getByText('Preview'));
    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument();
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    
    // Switch back to split
    fireEvent.click(screen.getByText('Split'));
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('shows Phase 2 banner when no save handler', () => {
    render(<MarkdownSplitPane entry={mockEntry} />);
    
    expect(screen.getByText(/Phase 2: Preview only/)).toBeInTheDocument();
  });

  it('enables saving when handler provided', () => {
    const onSave = vi.fn();
    render(<MarkdownSplitPane entry={mockEntry} onSave={onSave} />);
    
    expect(screen.queryByText(/Phase 2: Preview only/)).not.toBeInTheDocument();
  });
});
```

### 6. Performance Tests

```typescript
// apps/web/src/components/markdown/__tests__/performance.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MarkdownPreview } from '../MarkdownPreview';

describe('Performance', () => {
  it('renders large documents efficiently', () => {
    const largeContent = Array(1000)
      .fill(null)
      .map((_, i) => `## Heading ${i}\n\nParagraph ${i}`)
      .join('\n\n');
    
    const startTime = performance.now();
    render(<MarkdownPreview content={largeContent} />);
    const renderTime = performance.now() - startTime;
    
    // Should render in under 1 second
    expect(renderTime).toBeLessThan(1000);
  });

  it('handles rapid updates without memory leaks', () => {
    const { rerender, unmount } = render(
      <MarkdownPreview content="Initial" />
    );
    
    // Simulate rapid updates
    for (let i = 0; i < 100; i++) {
      rerender(<MarkdownPreview content={`Update ${i}`} />);
    }
    
    // Clean unmount without errors
    expect(() => unmount()).not.toThrow();
  });
});
```

***

## Test Execution Strategy

### 1. Continuous Testing

```bash
# During development
bun run test:watch

# With UI
bun run test:ui
```

### 2. Pre-commit Testing

```bash
# In .husky/pre-commit
bun run quality:test
```

### 3. CI Pipeline Testing

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    cd apps/web
    bun install
    bun run test:coverage
    
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./apps/web/coverage/coverage-final.json
```

***

## Coverage Requirements

### Minimum Thresholds

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Critical Paths (100% Required)

- Sanitization logic
- HTML to Markdown conversion
- Type guards
- Error boundaries

***

## Debugging Tests

### 1. Interactive Debugging

```bash
# Debug in Chrome DevTools
bun run test:debug

# Debug specific test
bun run test:debug MarkdownEditor.test.tsx
```

### 2. Verbose Output

```bash
# See all test output
bun run test --reporter=verbose

# With coverage details
bun run test:coverage --reporter=verbose
```

***

## Migration from Vitest

### Quick Migration Steps

1. Replace `Vitest.fn()` with `vi.fn()`
2. Replace `Vitest.mock()` with `vi.mock()`
3. Replace `expect.any()` with Vitest equivalents
4. Update imports from `'Vitest'` to `'vitest'`

### Example Migration

```typescript
// Before (Vitest)
import { Vitest } from '@Vitest/globals';
const mockFn = Vitest.fn();
Vitest.mock('./module');

// After (Vitest)
import { vi } from 'vitest';
const mockFn = vi.fn();
vi.mock('./module');
```

***

## Benefits Over Vitest

1. **Faster execution**: 5-10x faster for large test suites
2. **Better DX**: Native ESM, better error messages
3. **Smaller bundle**: No polyfills needed
4. **Type safety**: Better TypeScript integration
5. **Vite alignment**: Same config system

***

*This Vitest setup ensures fast, reliable testing without deprecated dependencies.*
