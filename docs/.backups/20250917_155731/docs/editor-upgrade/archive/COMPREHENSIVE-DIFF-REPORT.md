---
id: comprehensive-diff-report
title: Comprehensive Editor Upgrade Diff/Refactor Report
type: api
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- api
- typescript
- react
priority: high
status: approved
visibility: internal
schema_version: v1
---

# Comprehensive Editor Upgrade Diff/Refactor Report

## Journal Application - TipTap to CodeMirror/Markdown Migration

### Executive Summary

This report details the complete transformation from the current TipTap WYSIWYG editor to a HackMD-style markdown-first dual-pane editor using CodeMirror 6 and react-markdown with KaTeX math and syntax highlighting.

***

## 1. CURRENT IMPLEMENTATION ANALYSIS

### 1.1 Technology Stack (Current)

```
Editor Core:
├── @tiptap/react (2.x) - WYSIWYG framework
├── @tiptap/starter-kit - Basic extensions
├── @tiptap/extension-highlight - Text highlighting
├── @tiptap/extension-link - Link support
├── @tiptap/extension-placeholder - Placeholder text
├── @tiptap/extension-typography - Smart typography
└── Custom Extensions:
    ├── CodeBlockMonaco - Monaco editor integration
    ├── MathBlock/MathInline - Custom math rendering
    └── SlashCommands - Command palette

UI Components:
├── JournalEditor.tsx - Main editor component
├── BubbleToolbar.tsx - Floating toolbar
└── FocusMode.tsx - Distraction-free wrapper
```

### 1.2 Current Editor Features

- **WYSIWYG editing** with rich text formatting
- **Toolbar-based formatting** (fixed toolbar + bubble menu)
- **Custom math support** (likely using custom extensions)
- **Monaco-based code blocks** (heavyweight)
- **Slash commands** for quick actions
- **Auto-save to localStorage** every 10 seconds
- **Focus mode** integration
- **Word/character counting**
- **Title field** (separate input)
- **Save button** with Ctrl+S support

### 1.3 Current Data Flow

```
User Input → TipTap Editor → HTML Output → API Save
                ↓
          localStorage (draft)
```

***

## 2. PROPOSED IMPLEMENTATION ANALYSIS

### 2.1 Technology Stack (Proposed)

```
Editor Core:
├── @uiw/react-codemirror (4.x) - CodeMirror React wrapper
├── @codemirror/lang-markdown - Markdown syntax
├── @codemirror/theme-one-dark - Dark theme
└── @codemirror/commands - Editor commands

Preview/Rendering:
├── react-markdown (9.x) - Markdown to React
├── remark-gfm - GitHub Flavored Markdown
├── remark-math - Math parsing ($...$, $$...$$)
├── rehype-katex - KaTeX math rendering
├── rehype-highlight - Syntax highlighting
└── katex - Math rendering engine
```

### 2.2 Proposed Editor Features

- **Markdown-first editing** (raw markdown source)
- **Live preview pane** (dual-pane layout)
- **No toolbar** (keyboard shortcuts only)
- **Native math support** ($inline$ and $$display$$)
- **Lightweight code highlighting** (highlight.js)
- **Auto-language detection** for code blocks
- **Draggable splitter** between panes
- **Debounced preview** (180ms)
- **Auto-render toggle**
- **70ch measure** for optimal reading

### 2.3 Proposed Data Flow

```
User Input → CodeMirror → Markdown Text → react-markdown → Preview
                ↓                              ↓
           API Save                    remark/rehype plugins
                                              ↓
                                        Rendered HTML
```

***

## 3. DETAILED MIGRATION PLAN

### 3.1 Package Changes

#### Remove Packages

```bash
bun remove @tiptap/react @tiptap/starter-kit @tiptap/extension-highlight \
           @tiptap/extension-link @tiptap/extension-placeholder \
           @tiptap/extension-typography @tiptap/pm
```

#### Add Packages

```bash
bun add @uiw/react-codemirror @codemirror/lang-markdown \
        @codemirror/theme-one-dark @codemirror/commands \
        @codemirror/view react-markdown remark-gfm \
        remark-math rehype-katex rehype-highlight katex
```

### 3.2 File-by-File Changes

#### 3.2.1 DELETE These Files

```
apps/web/src/components/editor/
├── BubbleToolbar.tsx (56 lines) - No longer needed
├── extensions/
│   ├── CodeBlockMonaco.tsx (~200 lines) - Replace with highlight.js
│   ├── Math.tsx (~150 lines) - Replace with remark-math
│   └── SlashCommands.tsx (~100 lines) - Not needed in markdown-first
```

#### 3.2.2 CREATE New Files

```typescript
// apps/web/src/components/editor/MarkdownEditor.tsx
// ~250 lines - Main dual-pane editor component
// Based on sweet_spot_markdown_editor.jsx

// apps/web/src/components/editor/hooks/useMarkdownEditor.ts
// ~100 lines - Editor state management hook

// apps/web/src/components/editor/utils/markdownHelpers.ts
// ~50 lines - Markdown parsing/formatting utilities
```

#### 3.2.3 MODIFY Existing Files

**JournalEditor.tsx → MarkdownJournalEditor.tsx**

```diff
- import { EditorContent, useEditor } from "@tiptap/react";
- import StarterKit from "@tiptap/starter-kit";
+ import MarkdownEditor from "./MarkdownEditor";
+ import { useMarkdownEditor } from "./hooks/useMarkdownEditor";

Component Changes:
- 350 lines of TipTap configuration
+ 150 lines of CodeMirror integration
```

**JournalApp.tsx**

```diff
- import JournalEditor from "./editor/JournalEditor";
+ import MarkdownJournalEditor from "./editor/MarkdownJournalEditor";

- onSave={(content: string, title: string) => ...}
+ onSave={(markdown: string, title: string) => ...}
```

***

## 4. API & DATA MIGRATION

### 4.1 Content Format Changes

```typescript
// Current: HTML content
{
  title: "My Entry",
  content: "<p>Hello <strong>world</strong></p>"
}

// Proposed: Markdown content
{
  title: "My Entry",
  content: "Hello **world**",
  format: "markdown" // New field for content type
}
```

### 4.2 Database Migration Required

```sql
-- Add format column to entries table
ALTER TABLE entries 
ADD COLUMN format VARCHAR(10) DEFAULT 'html';

-- Future migration to convert HTML to Markdown
UPDATE entries 
SET content = convert_html_to_markdown(content),
    format = 'markdown'
WHERE format = 'html';
```

### 4.3 API Endpoint Changes

```typescript
// apps/api/app/api/v1/entries.py
class Entry(SQLModel):
    # ... existing fields
    format: str = Field(default="markdown")  # New field

# Handle both formats during transition
def get_entry_content(entry):
    if entry.format == "html":
        return convert_html_to_markdown(entry.content)
    return entry.content
```

***

## 5. FEATURE COMPARISON MATRIX

| Feature                | Current (TipTap) | Proposed (CodeMirror) | Impact                      |
| ---------------------- | ---------------- | --------------------- | --------------------------- |
| **Editing Experience** | WYSIWYG          | Markdown source       | Major UX change             |
| **Toolbar**            | Fixed + Bubble   | None (shortcuts only) | Simpler, cleaner            |
| **Math Support**       | Custom extension | Native KaTeX          | Better rendering            |
| **Code Blocks**        | Monaco (heavy)   | highlight.js (light)  | 90% size reduction          |
| **Preview**            | In-editor        | Split pane            | Better separation           |
| **Performance**        | Good             | Excellent             | Faster, lighter             |
| **Bundle Size**        | \~500KB          | \~200KB               | 60% reduction               |
| **Learning Curve**     | Low              | Medium                | Requires markdown knowledge |
| **Mobile Support**     | Good             | Limited               | Split-pane challenging      |
| **Accessibility**      | Good             | Excellent             | Better keyboard nav         |

***

## 6. IMPLEMENTATION STEPS (DETAILED)

### Phase 1: Setup & Dependencies (2 hours)

1. **Install new packages** (15 min)
2. **Remove old packages** (15 min)
3. **Update bundle configuration** (30 min)
4. **Import CSS files** (katex.css, highlight.css) (15 min)
5. **Test build process** (45 min)

### Phase 2: Core Editor Component (4 hours)

1. **Port SweetSpotMarkdownEditor to TypeScript** (1 hour)
2. **Integrate with Sanctuary design system** (1 hour)
3. **Add TypeScript types for all props/state** (30 min)
4. **Implement editor configuration** (30 min)
5. **Test basic editing functionality** (1 hour)

### Phase 3: Feature Parity (6 hours)

1. **Title field integration** (30 min)
2. **Save functionality with API** (1 hour)
3. **Auto-save to localStorage** (30 min)
4. **Keyboard shortcuts (Ctrl+S, etc.)** (30 min)
5. **Word count calculation** (30 min)
6. **Focus mode integration** (1 hour)
7. **Entry switching/loading** (1 hour)
8. **Draft recovery** (30 min)
9. **Testing all features** (1 hour)

### Phase 4: Data Migration (4 hours)

1. **Update API models** (30 min)
2. **Create database migration** (1 hour)
3. **HTML to Markdown converter** (1.5 hours)
4. **Test data migration** (1 hour)

### Phase 5: Polish & Optimization (3 hours)

1. **Responsive design adjustments** (1 hour)
2. **Performance optimization** (30 min)
3. **Accessibility testing** (30 min)
4. **Cross-browser testing** (1 hour)

***

## 7. RISK ASSESSMENT & MITIGATION

### 7.1 High-Risk Areas

1. **User Resistance to Markdown**

- Mitigation: Add help documentation, shortcuts guide
- Fallback: Keep WYSIWYG option available

2. **Data Migration Failures**

- Mitigation: Backup all data, test on subset first
- Fallback: Dual-format support period

3. **Mobile Experience Degradation**

- Mitigation: Single-pane mode on mobile
- Fallback: Keep current editor for mobile

### 7.2 Breaking Changes

- **Content format change** (HTML → Markdown)
- **API response format change**
- **localStorage key changes**
- **Component prop interfaces**

***

## 8. TESTING REQUIREMENTS

### 8.1 Unit Tests

```typescript
// New test files needed:
- MarkdownEditor.test.tsx
- useMarkdownEditor.test.ts
- markdownHelpers.test.ts
- contentMigration.test.ts
```

### 8.2 Integration Tests

- Editor state persistence
- API save/load cycles
- Format conversion accuracy
- Preview rendering fidelity

### 8.3 E2E Tests

- Create entry → Edit → Save → Load
- Switch between entries
- Focus mode toggle
- Keyboard shortcuts
- Math rendering
- Code highlighting

***

## 9. ROLLBACK PLAN

### 9.1 Feature Flag Implementation

```typescript
const FEATURE_FLAGS = {
  USE_MARKDOWN_EDITOR: process.env.REACT_APP_USE_MARKDOWN_EDITOR === 'true'
};

// In JournalApp.tsx
const EditorComponent = FEATURE_FLAGS.USE_MARKDOWN_EDITOR 
  ? MarkdownJournalEditor 
  : JournalEditor;
```

### 9.2 Rollback Steps

1. Set feature flag to false
2. Revert API changes (if deployed)
3. Keep both editors in codebase temporarily
4. Monitor user feedback
5. Plan incremental migration

***

## 10. PERFORMANCE METRICS

### Expected Improvements

- **Initial Load**: -60% bundle size (500KB → 200KB)
- **Editor Init**: -40% time (TipTap heavy init)
- **Typing Latency**: -30% (direct text input)
- **Memory Usage**: -50% (no DOM manipulation)
- **Preview Render**: Debounced (180ms)

### Monitoring Points

- Bundle size analysis
- First Contentful Paint
- Time to Interactive
- Memory profiling
- User input latency

***

## CONCLUSION

This migration represents a fundamental shift from WYSIWYG to markdown-first editing. While it introduces a learning curve for users unfamiliar with markdown, it provides:

1. **Significant performance improvements** (60% smaller bundle)
2. **Cleaner, more focused UI** (no toolbars)
3. **Better math and code support** (native KaTeX, highlight.js)
4. **More predictable content format** (plain markdown)
5. **Enhanced keyboard-first workflow**

The migration can be completed in approximately **19 hours of focused development**, with the ability to rollback via feature flags if needed.

### Recommended Approach

1. Implement behind feature flag
2. Test with power users first
3. Provide markdown tutorial/help
4. Gradual rollout over 2-4 weeks
5. Full migration after user acceptance

***

*Document Version: 1.0*\
*Created: 2025-09-01*\
*Author: Claude Code Assistant*
