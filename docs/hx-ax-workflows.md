# HX/AX Workflows: Human & Agent Experience for UI/UX Development

## Executive Summary

Modern UI/UX development in 2025 requires seamless collaboration between human developers (HX) and AI agents (AX). This document establishes patterns, tools, and workflows that optimize both experiences while maintaining consistent quality and accessibility standards.

## Core Principles

### For Human Experience (HX)

1. **Visual-First Development**: Humans need to see changes immediately
2. **Intuitive Patterns**: Follow established conventions (Material Design, Apple HIG)
3. **Rapid Iteration**: Hot reload, instant feedback, visual debugging
4. **Accessibility by Default**: WCAG 2.2 AA compliance built into workflows

### For Agent Experience (AX)

1. **Structured Data**: JSON schemas, TypeScript interfaces, semantic HTML
2. **Deterministic Outputs**: Predictable component generation
3. **Test-Driven UI**: Visual regression tests as specifications
4. **Context Preservation**: Component state and history tracking

## Technology Stack

### Frontend Framework

- **HTMX 2.0**: Server-driven interactivity without SPA complexity
- **Alpine.js 3.14**: Lightweight reactivity for client-side state
- **Tailwind CSS 3.4**: Utility-first styling with design tokens

### Build & Development Tools

- **Vite 5.4**: Lightning-fast HMR and build times
- **Playwright 1.46**: Cross-browser testing and visual regression
- **Storybook 8.3**: Component documentation and testing

### AI Integration

- **MCP Puppeteer Server**: Visual validation and screenshot generation
- **Claude Vision API**: Design-to-code conversion
- **GitHub Copilot**: Inline code suggestions

## Workflow Patterns

### 1. Component Development Workflow

#### Human Developer Path

```bash
# Start Storybook for visual development
npm run storybook

# Open component in isolation
# Make changes with hot reload
# Visual debugging in browser DevTools
```

#### AI Agent Path

```bash
# Claude generates component from specification
claude --plan > "Create a data table component with sorting, filtering, and pagination"

# Validate against design
claude mcp puppeteer > "Screenshot the component and compare with Figma design"

# Generate tests
claude > "Write Playwright tests for all interaction states"
```

### 2. Design System Integration

```markdown
## Component Registry (components.json)
{
  "components": {
    "DataTable": {
      "path": "journal/static/js/components/DataTable.js",
      "props": {
        "data": "array",
        "columns": "array<{key: string, label: string, sortable: boolean}>",
        "pageSize": "number"
      },
      "states": ["loading", "empty", "error", "success"],
      "a11y": {
        "role": "table",
        "ariaLabel": "required",
        "keyboardNav": true
      },
      "tests": {
        "unit": "tests/components/DataTable.test.js",
        "visual": "tests/visual/DataTable.spec.js",
        "a11y": "tests/a11y/DataTable.test.js"
      }
    }
  }
}
```

### 3. State Management Patterns

#### Alpine.js Store for Client State

```javascript
// journal/static/js/stores/uiStore.js
export default {
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
  
  init() {
    // Restore from localStorage
    this.theme = localStorage.getItem('theme') || 'light';
    this.sidebarOpen = localStorage.getItem('sidebarOpen') !== 'false';
    
    // Watch for changes
    this.$watch('theme', val => {
      localStorage.setItem('theme', val);
      document.documentElement.dataset.theme = val;
    });
  },
  
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    localStorage.setItem('sidebarOpen', this.sidebarOpen);
  },
  
  notify(message, type = 'info') {
    const id = Date.now();
    this.notifications.push({ id, message, type });
    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
    }, 5000);
  }
};
```

#### HTMX Patterns for Server State

```html
<!-- journal/templates/components/data-table.html -->
<div id="data-table"
     hx-get="/api/data"
     hx-trigger="load, filter-change from:body"
     hx-swap="outerHTML"
     hx-indicator="#table-spinner">
  
  <div class="relative">
    <!-- Loading indicator -->
    <div id="table-spinner" class="htmx-indicator">
      <div class="absolute inset-0 bg-white/50 flex items-center justify-center">
        <svg class="animate-spin h-5 w-5">...</svg>
      </div>
    </div>
    
    <!-- Table content -->
    <table class="min-w-full divide-y divide-gray-200">
      <!-- Dynamic content here -->
    </table>
  </div>
</div>
```

## Visual Development Tools

### 1. Storybook Configuration

```javascript
// .storybook/main.js
export default {
  stories: ['../journal/static/js/components/**/*.stories.js'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    'storybook-addon-performance'
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {}
  }
};
```

### 2. Visual Regression Testing

```javascript
// tests/visual/visual.config.js
export default {
  // Breakpoints for responsive testing
  viewports: [
    { width: 320, height: 568 },  // Mobile
    { width: 768, height: 1024 }, // Tablet
    { width: 1440, height: 900 }  // Desktop
  ],
  
  // Components to test
  components: [
    'DataTable',
    'FormInput',
    'Modal',
    'Notification'
  ],
  
  // States to capture
  states: [
    'default',
    'hover',
    'focus',
    'active',
    'disabled',
    'error',
    'loading'
  ],
  
  // Threshold for pixel differences
  threshold: 0.01,
  
  // Output directory
  outputDir: 'tests/visual/screenshots'
};
```

### 3. Accessibility Testing

```javascript
// tests/a11y/a11y.test.js
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });
  
  test('Homepage meets WCAG 2.2 AA', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  });
  
  test('Form inputs have proper labels', async ({ page }) => {
    await page.goto('/new-entry');
    await checkA11y(page, 'form', {
      rules: {
        'label': { enabled: true },
        'aria-required-attr': { enabled: true }
      }
    });
  });
});
```

## AI Agent Commands

### 1. Component Generation Command

```markdown
<!-- .claude/commands/create-component.md -->
---
name: create-component
description: Generate a new UI component with tests and documentation
parameters:
      - name: component_name
    description: Name of the component (PascalCase)
    required: true
      - name: type
    description: Component type (form|display|layout|navigation)
    required: true
---

Create a new component named {{component_name}} of type {{type}}:

1. Generate component file at `journal/static/js/components/{{component_name}}.js`
2. Use Alpine.js for interactivity and Tailwind for styling
3. Create Storybook story at `journal/static/js/components/{{component_name}}.stories.js`
4. Write Playwright test at `tests/components/{{component_name}}.test.js`
5. Add accessibility test at `tests/a11y/{{component_name}}.test.js`
6. Update components.json registry
7. Follow these patterns:
  - Use semantic HTML elements
  - Include ARIA labels where needed
  - Support keyboard navigation
  - Implement loading and error states
  - Add JSDoc documentation
  - Export as ES6 module
```

### 2. Design-to-Code Command

```markdown
<!-- .claude/commands/design-to-code.md -->
---
name: design-to-code
description: Convert a design file to working component
parameters:
      - name: design_url
    description: URL or path to design file
    required: true
---

Convert the design at {{design_url}} to a working component:

1. Analyze the design for:
  - Layout structure
  - Color palette
  - Typography scale
  - Spacing system
  - Interactive states

2. Generate Tailwind utilities matching the design tokens

3. Create Alpine.js component with:
  - Proper state management
  - Event handlers
  - Data bindings

4. Ensure responsive behavior for:
  - Mobile (320-767px)
  - Tablet (768-1023px)
  - Desktop (1024px+)

5. Add HTMX attributes for server interactions where appropriate
```

## Performance Optimization

### 1. Bundle Optimization

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'alpine': ['alpinejs'],
          'htmx': ['htmx.org'],
          'components': ['./journal/static/js/components/index.js']
        }
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Inline assets smaller than 4kb
    assetsInlineLimit: 4096
  }
};
```

### 2. Lazy Loading Patterns

```javascript
// Lazy load Alpine components
document.addEventListener('alpine:init', () => {
  Alpine.data('heavyComponent', () => ({
    loaded: false,
    async init() {
      if (!this.loaded) {
        const module = await import('./components/HeavyComponent.js');
        Object.assign(this, module.default);
        this.loaded = true;
      }
    }
  }));
});
```

### 3. Caching Strategies

```python
# journal/main/routes.py
from flask import make_response
from functools import wraps

def cache_header(max_age=300, s_maxage=600):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            response = make_response(f(*args, **kwargs))
            response.headers['Cache-Control'] = f'public, max-age={max_age}, s-maxage={s_maxage}'
            response.headers['Vary'] = 'Accept-Encoding'
            return response
        return decorated_function
    return decorator

@main.route('/static/components/<path:filename>')
@cache_header(max_age=86400, s_maxage=604800)  # 1 day client, 1 week CDN
def serve_component(filename):
    return send_from_directory('static/components', filename)
```

## Testing Strategies

### 1. Component Testing Matrix

| Test Type     | Tool            | Frequency    | Coverage Target |
| ------------- | --------------- | ------------ | --------------- |
| Unit          | Vitest          | Every commit | 90%             |
| Integration   | Playwright      | Every PR     | 80%             |
| Visual        | Percy/Chromatic | Every PR     | All components  |
| Accessibility | axe-core        | Every PR     | WCAG 2.2 AA     |
| Performance   | Lighthouse      | Weekly       | Score > 90      |

### 2. E2E Test Patterns

```javascript
// tests/e2e/journal-workflow.test.js
test('Complete journal entry workflow', async ({ page }) => {
  // Login
  await page.goto('/auth/login');
  await page.fill('[name="username"]', 'testuser');
  await page.fill('[name="password"]', 'testpass');
  await page.click('[type="submit"]');
  
  // Create entry
  await page.waitForURL('/');
  await page.click('[data-test="new-entry"]');
  
  // Fill form
  await page.fill('[name="title"]', 'Test Entry');
  await page.fill('[name="body"]', 'Test content with **markdown**');
  
  // Preview
  await page.click('[data-test="preview-tab"]');
  await expect(page.locator('.preview')).toContainText('Test content with');
  await expect(page.locator('.preview strong')).toContainText('markdown');
  
  // Save
  await page.click('[data-test="save-entry"]');
  await expect(page).toHaveURL(/\/entry\/\d+/);
});
```

## Monitoring & Analytics

### 1. Real User Monitoring (RUM)

```javascript
// journal/static/js/rum.js
class RUM {
  constructor() {
    this.metrics = {
      fcp: 0,  // First Contentful Paint
      lcp: 0,  // Largest Contentful Paint
      fid: 0,  // First Input Delay
      cls: 0,  // Cumulative Layout Shift
      ttfb: 0  // Time to First Byte
    };
    
    this.observeMetrics();
  }
  
  observeMetrics() {
    // Performance Observer API
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          this.metrics.lcp = entry.renderTime || entry.loadTime;
        }
        // ... other metrics
      }
    }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  }
  
  report() {
    // Send to analytics endpoint
    fetch('/api/analytics/rum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.metrics)
    });
  }
}
```

### 2. Error Tracking

```javascript
// journal/static/js/error-tracking.js
window.addEventListener('error', (event) => {
  const errorData = {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    stack: event.error?.stack,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
  
  // Send to error tracking service
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorData)
  });
});
```

## Conclusion

This HX/AX workflow system provides:

1. **For Humans**: Visual development tools, hot reload, intuitive debugging
2. **For Agents**: Structured patterns, deterministic outputs, testable components
3. **Shared Benefits**: Consistent quality, accessibility compliance, performance optimization

The key to success is maintaining parallel paths that complement each other—humans excel at creative design and UX intuition, while agents provide consistency, testing coverage, and rapid iteration. Together, they create a development environment that is both productive and maintainable.
