---
id: editor-implementation
title: 'UI/UX Editor Implementation Guide: CodeMirror 6 Integration'
type: api
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- api
- python
- react
priority: high
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-09'
---

***

title: "UI/UX Editor Implementation Guide: CodeMirror 6 Integration"
description: "Detailed guide for implementing the CodeMirror 6 editor component within the Flask Journal system, including setup, architecture, styling, persistence, performance, accessibility, testing, and resource bundling strategy."
category: "Initial Planning"
related\_topics:
\- "docs/initial-planning/comprehensive-guide-personal.md"
\- "docs/initial-planning/mvp-high-level-implementation-guide.md"
version: "1.1" # Updated version due to significant change in resource loading
tags:
\- "planning"
\- "editor"
\- "codemirror"
\- "codemirror6"
\- "markdown"
\- "latex"
\- "mathjax"
\- "alpinejs"
\- "htmx"
\- "ui"
\- "ux"
\- "frontend"
\- "bundling"
\- "Vite"
\- "flask-assets"
\- "accessibility"
\- "testing"
------------

# UI/UX Editor Implementation Guide: CodeMirror 6 Integration

## Table of Contents

1. [Overview & Integration](#overview--integration)
2. [CodeMirror 6 Setup](#codemirror-6-setup)
3. [Editor UI Architecture](#editor-ui-architecture)
4. [Toolbar Implementation](#toolbar-implementation)
5. [Markdown & LaTeX Support](#markdown--latex-support)
6. [Styling & Theme Implementation](#styling--theme-implementation)
7. [State Management & Persistence](#state-management--persistence)
8. [Performance Considerations](#performance-considerations)
9. [Resource Bundling Strategy](#resource-bundling-strategy) <!-- Updated TOC entry -->
10. [Accessibility Guidelines](#accessibility-guidelines)
11. [Testing Strategy](#testing-strategy)

## Overview & Integration

The editor component is a critical part of the Flask-based journal system, providing a focused writing environment with Markdown and LaTeX support. This guide details how to implement the editor using CodeMirror 6 while maintaining the system's "pseudo-CLI modernized" aesthetic.

### Integration Points

The editor integrates with the overall system architecture at these key points:

```
app/templates/entries/
├── create.html         # New entry page with editor
├── edit.html           # Edit existing entry
└── components/
    ├── editor.html     # Editor component
    └── toolbar.html    # Editor toolbar
```

### Technical Stack

- **CodeMirror 6**: Core editor functionality
- **Alpine.js**: State management and reactivity
- **HTMX**: Server interactions without page reloads
- **MathJax**: LaTeX rendering in preview pane
- **Vite**: JavaScript/CSS bundling
- **Flask-Assets**: Asset management and delivery

## CodeMirror 6 Setup

### Installation & Dependencies

Frontend dependencies will be managed via `npm` and bundled. See the [Resource Bundling Strategy](#resource-bundling-strategy) section for details on `package.json`.

### Basic Integration

Create an editor service in `src/js/editor/` (note the change from `app/static/js/` as part of the bundling setup):

```javascript
// src/js/editor/setup.js
import {EditorState, StateField, StateEffect} from "@codemirror/state";
import {EditorView, keymap} from "@codemirror/view";
import {defaultKeymap, history, historyKeymap} from "@codemirror/commands";
import {markdown, markdownLanguage} from "@codemirror/lang-markdown";
import {syntaxHighlighting, defaultHighlightStyle} from "@codemirror/language";
import { journalEditorTheme } from './theme.js'; // Assuming theme is defined

// Define state field for tracking editor mode (edit/preview/split)
export const editorModeState = StateField.define({
  create: () => localStorage.getItem('editor_mode') || 'split',
  update: (value, tr) => {
    for (let effect of tr.effects) {
      if (effect.is(setEditorMode)) {
        return effect.value;
      }
    }
    return value;
  }
});

// Editor mode change effect
export const setEditorMode = StateEffect.define();

// Create and configure editor
export function createEditor(element, content, onChange) {
  // Base configuration
  const startState = EditorState.create({
    doc: content || '',
    extensions: [
      // Core extensions
      history(),
      markdown({ // Use the standard markdown parser here, extensions can be added separately if needed
        base: markdownLanguage,
        // codeLanguages: languages // Add languages if needed via language-data package
      }),
      syntaxHighlighting(defaultHighlightStyle), // Or a custom highlight style

      // Keymaps
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap
      ]),

      // Custom state fields
      editorModeState,

      // Change handling
      EditorView.updateListener.of(update => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }),

      // Theme
      journalEditorTheme // Apply the custom theme
    ]
  });

  // Create view
  return new EditorView({
    state: startState,
    parent: element
  });
}
```

## Editor UI Architecture

The editor UI follows a layered architecture:

### Component Layers

1. **Editor Container**: Manages overall layout and mode switching (Alpine.js)
2. **Toolbar**: Provides formatting controls and toggles (HTML + Alpine.js)
3. **Editor Instance**: CodeMirror 6 editing area (Managed by Alpine.js)
4. **Preview Pane**: Renders Markdown with MathJax support (HTML + Alpine.js)

### HTML Structure

```html
<!-- app/templates/components/editor.html -->
{# Assumes this template is included where needed, likely extending base.html #}
{# Ensure CSRF token meta tag is present in base.html <head> #}
{# <meta name="csrf-token" content="{{ csrf_token() }}"> #}

<div x-data="editor" class="editor-container">
  {# Toolbar Component #}
  {% include 'components/toolbar.html' %}

  <div class="editor-content">
    {# Edit Pane - Managed by CodeMirror via Alpine #}
    <div class="edit-pane" x-show="mode === 'edit' || mode === 'split'"
         :class="{ 'full-width': mode === 'edit', 'half-width': mode === 'split' }"
         x-ref="editorElement"
         aria-label="Markdown Editor Input">
      {# CodeMirror attaches here #}
    </div>

    {# Preview Pane - Content updated via Alpine/fetch #}
    <div class="preview-pane" x-show="mode === 'preview' || mode === 'split'"
         :class="{ 'full-width': mode === 'preview', 'half-width': mode === 'split' }"
         aria-live="polite">
      <div x-show="isPreviewLoading" class="preview-loading" aria-label="Loading preview">Loading preview...</div>
      <div x-show="!isPreviewLoading" class="preview-content mathjax" x-html="preview" id="preview-content">
        {# Rendered HTML preview goes here #}
      </div>
    </div>
  </div>

  {# Hidden textarea to hold content for standard form submission #}
  <textarea id="content-textarea" name="body" style="display: none;" x-model="content"></textarea>
</div>
```

### Alpine.js Component

```javascript
// src/js/editor/alpine-component.js
// Assumes main.js imports and initializes this
import { createEditor, setEditorMode } from './setup.js';
import { EditorPersistence } from './persistence.js'; // Assuming persistence logic exists

// Register Alpine component
document.addEventListener('alpine:init', () => {
  Alpine.data('editor', () => ({
    mode: localStorage.getItem('editor_mode') || 'split',
    content: '',
    preview: '',
    isPreviewLoading: false,
    editorView: null,
    persistence: null, // For draft saving

    init() {
      // Initialize with content from textarea if available (e.g., on edit page)
      const textarea = document.getElementById('content-textarea');
      if (textarea) {
        this.content = textarea.value || '';
      }

      // Initialize CodeMirror after Alpine has initialized the element
      this.$nextTick(() => {
        this.editorView = createEditor(
          this.$refs.editorElement,
          this.content,
          (newContent) => { // onChange callback
            this.content = newContent;
            // No need to call updateTextarea() if using x-model
            this.debouncedUpdatePreview();
            this.persistence?.saveDraft(newContent); // Save draft on change
          }
        );

        // Initial preview render if needed
        if (this.mode === 'preview' || this.mode === 'split') {
          this.updatePreview();
        }

        // Initialize persistence (example)
        const entryId = this.$refs.editorElement.dataset.entryId; // Assuming entry ID is available
        this.persistence = new EditorPersistence(entryId);
        // Load draft if exists?
        // const draft = this.persistence.loadDraft();
        // if (draft) { /* update editor state */ }

      });
    },

    // updateTextarea() is no longer needed if using x-model on the hidden textarea

    setMode(newMode) {
      if (!this.editorView || this.mode === newMode) return;
      this.mode = newMode;
      localStorage.setItem('editor_mode', newMode);

      // Update CodeMirror state (optional, could be handled by CSS)
      // this.editorView.dispatch({
      //   effects: setEditorMode.of(newMode)
      // });

      // Update preview if switching to a mode that shows it
      if (newMode === 'preview' || newMode === 'split') {
        this.updatePreview(); // Render preview immediately
      }
    },

    // Debounced preview update for performance
    debouncedUpdatePreview: Alpine.debounce(function() {
      this.updatePreview();
    }, 300), // Adjust debounce timing as needed

    // Fetch HTML preview from server
    updatePreview() {
      if (this.mode !== 'preview' && this.mode !== 'split') return; // Only update if visible

      this.isPreviewLoading = true;
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

      fetch('/api/markdown', { // Ensure this API endpoint exists and is protected
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ text: this.content })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.preview = data.html; // Assuming API returns { "html": "..." }
        this.isPreviewLoading = false;

        // Trigger MathJax rendering AFTER the preview HTML is updated in the DOM
        this.$nextTick(() => {
          const previewElement = document.getElementById('preview-content');
          if (window.MathJax && previewElement && previewElement.innerHTML === this.preview) {
             window.MathJax.typesetPromise([previewElement]).catch((err) => console.error('MathJax typesetting error:', err));
          }
        });
      })
      .catch(error => {
        console.error('Error updating preview:', error);
        this.preview = '<p class="error">Error loading preview.</p>'; // Show error in preview
        this.isPreviewLoading = false;
      });
    },

    // --- Toolbar Actions ---
    // These methods interact with the CodeMirror view (this.editorView)

    insertMarkdown(type) {
      if (!this.editorView) return;
      // Import and call the relevant function from toolbar-actions.js
      // e.g., import { insertMarkdownSyntax } from './toolbar-actions.js';
      // insertMarkdownSyntax(this.editorView, type);
      console.log("Insert markdown:", type); // Placeholder
    },

    exportPDF() {
      // Placeholder for PDF export functionality
      console.log("Export PDF clicked");
      alert("PDF export not yet implemented.");
    }

  }));
});
```

## Toolbar Implementation

The toolbar follows a minimal, focused design with just the essential controls.

### HTML Implementation

```html
<!-- app/templates/components/toolbar.html -->
{# Included within the main editor component's x-data scope #}
<div class="editor-toolbar">
  <!-- Formatting Controls Group -->
  <div class="toolbar-group">
    <button type="button" class="cli-modern-button"
            @click="insertMarkdown('image')"
            title="Insert Image" aria-label="Insert Image">
      <svg class="icon" viewBox="0 0 24 24"><!-- SVG path --></svg>
      {# <span class="sr-only">Image</span> #} {# Use aria-label instead #}
    </button>

    <button type="button" class="cli-modern-button"
            @click="insertMarkdown('table')"
            title="Insert Table" aria-label="Insert Table">
      <svg class="icon" viewBox="0 0 24 24"><!-- SVG path --></svg>
      {# <span class="sr-only">Table</span> #}
    </button>

    <button type="button" class="cli-modern-button"
            @click="insertMarkdown('code')"
            title="Insert Code Block" aria-label="Insert Code Block">
      <svg class="icon" viewBox="0 0 24 24"><!-- SVG path --></svg>
      {# <span class="sr-only">Code</span> #}
    </button>
  </div>

  <!-- Divider -->
  <div class="toolbar-divider"></div>

  <!-- View Controls Group -->
  <div class="toolbar-group mode-switcher">
    <button type="button" class="cli-modern-button"
            @click="setMode('edit')"
            :class="{ 'active': mode === 'edit' }"
            title="Edit Mode" aria-label="Switch to Edit Mode"
            :aria-pressed="mode === 'edit'">
      <span>Edit</span>
    </button>

    <button type="button" class="cli-modern-button"
            @click="setMode('split')"
            :class="{ 'active': mode === 'split' }"
            title="Split Mode" aria-label="Switch to Split Mode"
            :aria-pressed="mode === 'split'">
      <span>Split</span>
    </button>

    <button type="button" class="cli-modern-button"
            @click="setMode('preview')"
            :class="{ 'active': mode === 'preview' }"
            title="Preview Mode" aria-label="Switch to Preview Mode"
            :aria-pressed="mode === 'preview'">
      <span>Preview</span>
    </button>
  </div>

  <!-- Divider -->
  <div class="toolbar-divider"></div>

  <!-- Export Controls Group -->
  <div class="toolbar-group">
    <button type="button" class="cli-modern-button"
            @click="exportPDF()"
            title="Export to PDF" aria-label="Export to PDF">
      <svg class="icon" viewBox="0 0 24 24"><!-- SVG path --></svg>
      {# <span class="sr-only">Export PDF</span> #}
    </button>
  </div>
</div>
```

### Markdown Insertion Functions

````javascript
// src/js/editor/toolbar-actions.js
import { EditorSelection } from "@codemirror/state";

// Reusable insertion function
export function insertMarkdownSyntax(editorView, type) {
  const { state } = editorView;
  const changes = [];
  let selection = state.selection.main; // Default to main selection

  // Function to create a transaction spec
  const createTransaction = (insertText, newSelectionPosOffset = 0) => {
    const from = selection.from;
    const to = selection.to;
    const lengthChange = insertText.length - (to - from);
    return {
      changes: { from, to, insert: insertText },
      selection: EditorSelection.cursor(from + newSelectionPosOffset + lengthChange) // Adjust cursor based on insertion point
    };
  };

  switch (type) {
    case 'image': {
      const urlPlaceholder = 'url';
      const altText = state.sliceDoc(selection.from, selection.to) || 'Alt text';
      const insertText = `![${altText}](${urlPlaceholder})`;
      // Place cursor within the URL parentheses
      const cursorPos = insertText.length - 1;
      editorView.dispatch(createTransaction(insertText, cursorPos - insertText.length));
      break;
    }
    case 'table': {
      const insertText =
        '| Header 1 | Header 2 |\n' +
        '| -------- | -------- |\n' +
        '| Cell 1   | Cell 2   |\n' +
        '| Cell 3   | Cell 4   |';
      // Place cursor after the table
      editorView.dispatch(createTransaction(insertText, insertText.length));
      break;
    }
    case 'code': {
      const selectedText = state.sliceDoc(selection.from, selection.to);
      const langPlaceholder = 'language'; // e.g., python, javascript
      const insertText = selectedText
        ? '```' + langPlaceholder + '\n' + selectedText + '\n```'
        : '```' + langPlaceholder + '\n// code here\n```';
      // Place cursor after the opening ```language
      const cursorPos = 3 + langPlaceholder.length + 1;
      editorView.dispatch(createTransaction(insertText, cursorPos));
      break;
    }
    // Add cases for bold, italic, link, etc. if needed
    default:
      console.warn("Unknown markdown insertion type:", type);
      return; // Do nothing if type is unknown
  }

  // Focus back on editor
  editorView.focus();
}

// Note: calculateNewSelection helper is integrated into createTransaction logic
````

## Markdown & LaTeX Support

### Markdown Configuration

CodeMirror's `@codemirror/lang-markdown` provides excellent Markdown support. We can extend it if needed for custom syntax, but the base package is usually sufficient. Ensure it's included in the editor setup extensions. LaTeX is handled separately by MathJax in the preview.

```javascript
// src/js/editor/setup.js - Relevant part
// ... other imports ...
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data"; // Optional: for syntax highlighting in code blocks

// ... inside createEditor extensions array ...
      markdown({
        base: markdownLanguage,
        codeLanguages: languages, // Provide language data if needed
        // Add other markdown extensions here if necessary
      }),
// ...
```

### MathJax Integration

MathJax integration is handled *outside* of CodeMirror, operating on the rendered HTML preview pane. The setup involves configuring MathJax and triggering it to typeset the preview content after updates. The bundling strategy requires importing MathJax components directly.

```javascript
// src/js/editor/mathjax-setup.js
// (Content provided in the feedback - use the bundled version)
import { tex } from 'mathjax/es5/input/tex';
import { chtml } from 'mathjax/es5/output/chtml';
import { RegisterHTMLHandler } from 'mathjax/es5/handlers/html';
import { AllPackages } from 'mathjax/es5/input/tex/AllPackages';
import { liteAdaptor } from 'mathjax/es5/adaptors/liteAdaptor';

export function initMathJax() {
  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);

  window.MathJax = {
    tex: {
      packages: AllPackages,
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      processEnvironments: true
    },
    chtml: {
       fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2' // Still need font CDN or self-host
    },
    options: {
      ignoreHtmlClass: 'no-mathjax', // Ignore elements with this class
      processHtmlClass: 'mathjax'    // Process elements with this class
    },
    startup: {
      // Specify the handler, input and output processors
      handler: 'html',
      input: ['tex'],
      output: 'chtml',
      ready: () => {
        console.log('MathJax is ready.');
        window.MathJax.startup.defaultReady();
      },
      pageReady: () => {
         // Initial typeset can be triggered here if needed,
         // but we'll trigger it manually after preview updates.
         console.log('MathJax pageReady.');
         return null; // Prevent automatic typesetting on load
      },
      typeset: false // Ensure manual typesetting
    }
  };

  // Load the necessary MathJax components (this happens implicitly via imports now)
  console.log("MathJax configured for manual typesetting.");

  // Return a promise that resolves when MathJax is ready
  // This might require adjustments based on MathJax v3 API specifics for readiness detection
  // For now, we assume configuration is enough and rely on Alpine to call typesetPromise
  return Promise.resolve(window.MathJax);
}

// Function to be called by Alpine to typeset a specific element
export function typesetMath(elementId) {
  if (window.MathJax && window.MathJax.typesetPromise) {
    const element = document.getElementById(elementId);
    if (element) {
      window.MathJax.typesetPromise([element]).catch((err) => console.error('MathJax typesetting error:', err));
    }
  }
}

```

*(Note: MathJax font loading might still require a CDN or self-hosting setup, even when bundling the core library).*

## Styling & Theme Implementation

Apply the pseudo-CLI modernized aesthetic consistently.

### CSS Structure

Organize CSS files for maintainability:

```
src/css/                 # Source CSS files
├── base.css             # Base styles, variables
├── components/
│   ├── editor.css       # Editor layout, panes
│   ├── toolbar.css      # Toolbar styles
│   └── buttons.css      # Button styles (CLI-modern)
└── vendor/              # Any third-party CSS (if needed)

app/static/gen/          # Generated/Bundled CSS
├── editor.bundle.css    # Bundled CSS output from Vite
└── packed.css           # Final packed CSS from Flask-Assets
```

### Editor Theme

Customize CodeMirror's appearance using `EditorView.theme`. Define CSS variables for colors, fonts, etc., to allow easy theming (light/dark).

```javascript
// src/js/editor/theme.js
import { EditorView } from "@codemirror/view";

// Define custom editor theme using CSS variables
export const journalEditorTheme = EditorView.theme({
  "&": {
    height: "calc(100vh - 150px)", // Example height, adjust as needed
    fontSize: "var(--editor-font-size, 1rem)",
    fontFamily: "var(--editor-font-family, monospace)",
    backgroundColor: "var(--editor-bg-color, #ffffff)",
    color: "var(--editor-text-color, #212529)",
    border: "1px solid var(--editor-border-color, #ced4da)",
    borderRadius: "var(--border-radius, 0.25rem)"
  },
  ".cm-content": {
    caretColor: "var(--editor-caret-color, #000000)",
    padding: "10px"
  },
  ".cm-gutters": {
    backgroundColor: "var(--editor-gutter-bg, #f8f9fa)",
    color: "var(--editor-gutter-text, #6c757d)",
    borderRight: "1px solid var(--editor-border-color, #ced4da)"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--editor-active-gutter-bg, #e9ecef)"
  },
  ".cm-line": {
    padding: "0 4px" // Basic line padding
  },
  ".cm-activeLine": {
     backgroundColor: "var(--editor-active-line-bg, #f1f3f5)"
  },
  ".cm-selectionBackground, ::selection": {
     backgroundColor: "var(--editor-selection-bg, #cfe2ff)"
  }
  // Add more specific syntax highlighting styles if defaultHighlightStyle is not sufficient
}, { dark: false }); // Set dark mode based on preference if implementing theme switching
```

### CSS Variable Definitions

Define theme variables in `src/css/base.css` or separate theme files.

```css
/* src/css/base.css (or themes/light.css) */
:root {
      --editor-font-family: monospace;
      --editor-font-size: 1rem;
      --editor-bg-color: #ffffff;
      --editor-text-color: #212529;
      --editor-border-color: #ced4da;
      --editor-caret-color: #000000;
      --editor-gutter-bg: #f8f9fa;
      --editor-gutter-text: #6c757d;
      --editor-active-gutter-bg: #e9ecef;
      --editor-active-line-bg: #f1f3f5;
      --editor-selection-bg: #cfe2ff;
      --border-radius: 0.25rem;
  /* Add other variables as needed */
}

/* Example Dark Theme Variables (in themes/dark.css or using a class/data attribute) */
/*
body.dark-theme {
      --editor-bg-color: #212529;
      --editor-text-color: #f8f9fa;
      --editor-border-color: #495057;
      --editor-caret-color: #ffffff;
      --editor-gutter-bg: #343a40;
      --editor-gutter-text: #adb5bd;
      --editor-active-gutter-bg: #495057;
      --editor-active-line-bg: #343a40;
      --editor-selection-bg: #0d6efd;
}
*/
```

## State Management & Persistence

Leverage Alpine.js for UI state (mode, loading flags) and `localStorage` for simple persistence.

### UI State (Alpine.js)

The `editor` Alpine component manages:

- `mode`: Current view ('edit', 'split', 'preview'). Persisted in `localStorage`.
- `content`: Current editor text content.
- `preview`: Rendered HTML preview.
- `isPreviewLoading`: Flag for preview loading state.
- `editorView`: Reference to the CodeMirror `EditorView` instance.

### Persistent Document State

Implement draft saving using `localStorage` or potentially server-side storage via HTMX/Fetch.

```javascript
// src/js/editor/persistence.js
export class EditorPersistence {
  constructor(entryId) {
    // Use a unique key per entry, or a general key if only one draft is needed
    this.storageKey = entryId ? `journal_draft_${entryId}` : 'journal_draft_new';
  }

  saveDraft(content) {
    try {
      localStorage.setItem(this.storageKey, content);
      console.log("Draft saved.");
    } catch (e) {
      console.error("Error saving draft to localStorage:", e);
      // Handle potential storage limits or errors
    }
  }

  loadDraft() {
    try {
      const draft = localStorage.getItem(this.storageKey);
      if (draft) {
        console.log("Draft loaded.");
        return draft;
      }
    } catch (e) {
      console.error("Error loading draft from localStorage:", e);
    }
    return null;
  }

  clearDraft() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log("Draft cleared.");
    } catch (e) {
      console.error("Error clearing draft from localStorage:", e);
    }
  }
}
```

Integrate `EditorPersistence` into the Alpine component's `init` method and the `onChange` callback. Clear the draft upon successful form submission.

## Performance Considerations

### Editor Performance Optimizations

- **Debounce Preview Updates**: Use `Alpine.debounce` to limit frequent API calls for preview rendering.
- **Lazy Loading**: CodeMirror 6 is modular; only load necessary language modes and extensions. Bundling helps manage this.
- **Efficient DOM Updates**: Alpine.js handles reactive updates efficiently. Ensure preview updates only replace necessary content.
- **Large Document Handling**: CodeMirror 6 is designed for performance, but monitor for lag with very large entries. Consider server-side pagination or chunking for extreme cases (likely beyond MVP).

### Resource Loading Strategy

*(This section is replaced by the new Bundling Strategy below)*

## Resource Bundling Strategy

Instead of loading CodeMirror modules and MathJax from CDNs, we'll bundle assets locally for performance, reliability, and offline capability, aligning with the project's "lean and mean" philosophy.

### Implementation Steps

1. **Update Dependencies Management (`package.json`)**:

- Create `package.json` in the project root.
- Add dependencies for CodeMirror, MathJax, Vite, and necessary plugins.
  ```json
  # package.json (add to project root)
  {
    "name": "journal-editor",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "build": "Vite -c",
      "watch": "Vite -c -w"
    },
    "dependencies": {
      "@codemirror/state": "^6.2.0",
      "@codemirror/view": "^6.9.3",
      "@codemirror/language": "^6.6.0",
      "@codemirror/commands": "^6.2.3",
      "@codemirror/language-data": "^6.2.0",
      "@codemirror/lang-markdown": "^6.1.0",
      "mathjax": "^3.2.2"
    },
    "devDependencies": {
      "@Vite/plugin-node-resolve": "^15.0.1", // Updated plugin name
      "@Vite/plugin-terser": "^0.4.0", // Updated plugin name
      "Vite": "^3.20.0",
      "Vite-plugin-css-only": "^4.3.0" // For extracting CSS
    }
  }
  ```
- Run `bun install` to install these dependencies into `node_modules (managed by Bun)/`. Add `node_modules (managed by Bun)/` to `.gitignore`.

2. **Create Vite Configuration (`Vite.config.js`)**:

- Create `Vite.config.js` in the project root.
- Configure Vite to bundle JS from `src/js/editor/main.js` and extract CSS.
  ```javascript
  // Vite.config.js
  import resolve from '@Vite/plugin-node-resolve';
  import terser from '@Vite/plugin-terser';
  import css from 'Vite-plugin-css-only';

  export default {
    input: 'src/js/editor/main.js', // Entry point for JS
    output: {
      file: 'journal/static/gen/editor.bundle.js', // Output bundled JS
      format: 'iife', // Immediately Invoked Function Expression for browser
      name: 'JournalEditor', // Global variable name (optional)
      sourcemap: true // Generate source maps for debugging
    },
    plugins: [
      resolve(), // Resolves node_modules (managed by Bun) imports
      css({ output: 'editor.bundle.css' }), // Extract CSS to this file in the output dir
      terser() // Minify JS output
    ]
  };
  ```

3. **Update MathJax Integration (Use Bundled Version)**:

- Modify `src/js/editor/mathjax-setup.js` to import directly from the installed `mathjax` package instead of loading from CDN.
  ```javascript
  // src/js/editor/mathjax-setup.js
  // (Use the updated code provided earlier that imports from 'mathjax/es5/...')
  import { tex } from 'mathjax/es5/input/tex';
  import { chtml } from 'mathjax/es5/output/chtml';
  import { RegisterHTMLHandler } from 'mathjax/es5/handlers/html';
  import { AllPackages } from 'mathjax/es5/input/tex/AllPackages';
  import { liteAdaptor } from 'mathjax/es5/adaptors/liteAdaptor';

  export function initMathJax() {
    // ... (rest of the initMathJax function as defined previously) ...
    console.log("MathJax configured for manual typesetting using bundled components.");
    return Promise.resolve(window.MathJax);
  }

  export function typesetMath(elementId) {
    // ... (typesetMath function as defined previously) ...
  }
  ```

4. **Create Main Entry Point (`src/js/editor/main.js`)**:

- This file imports all necessary JS modules and CSS.
  ```javascript
  // src/js/editor/main.js
  import { createEditor } from './setup.js';
  import { initMathJax, typesetMath } from './mathjax-setup.js';
  import { EditorPersistence } from './persistence.js';
  import { insertMarkdownSyntax } from './toolbar-actions.js';
  // Import Alpine component setup if it's in a separate file
  // import './alpine-component.js';

  // Import CSS - Vite with css-only plugin will handle extraction
  import '../../css/base.css';
  import '../../css/components/editor.css';
  import '../../css/components/toolbar.css';
  import '../../css/components/buttons.css';

  // Initialize Alpine component (assuming it's defined globally or initialized elsewhere)
  // Ensure Alpine.js itself is loaded, potentially via Flask-Assets or another bundle

  // Pre-initialize MathJax (configuration only)
  initMathJax();

  // Expose necessary functions to the global scope or Alpine component
  // If using Alpine, functions like insertMarkdownSyntax, typesetMath might be called
  // from within the Alpine component's scope directly after importing them there.
  // Alternatively, attach them to window if needed globally.
  window.JournalEditor = {
      createEditor,
      EditorPersistence,
      insertMarkdownSyntax, // Make available for toolbar buttons if not using Alpine directly
      typesetMath // Make available for preview updates
  };

  console.log("Journal Editor main script loaded.");
  ```

5. **Update Flask-Assets Configuration (`journal/__init__.py`)**:

- Configure Flask-Assets to use the bundles generated by Vite.
  ```python
  # journal/__init__.py (or wherever Flask app is created)
  from flask_assets import Environment, Bundle
  # ... other imports ...

  assets = Environment()

  def create_app(config_name='default'):
      app = Flask(__name__)
      # ... other app configuration ...

      # Initialize Flask-Assets
      assets.init_app(app)

      # Define asset bundles using the output from Vite
      # Note: Vite handles JS bundling and CSS extraction. Flask-Assets now just serves these.
      # If you have other CSS/JS not part of the editor bundle, define separate bundles.

      js_editor_bundle = Bundle(
          'gen/editor.bundle.js', # The single JS file generated by Vite
          # filters='jsmin', # Optional: Apply further minification if needed (Terser in Vite already does this)
          output='gen/packed.editor.%(version)s.js' # Add versioning
      )

      css_editor_bundle = Bundle(
          'gen/editor.bundle.css', # The single CSS file extracted by Vite
          # filters='cssmin', # Optional: Minify further if needed
          output='gen/packed.editor.%(version)s.css' # Add versioning
      )

      # Register bundles
      assets.register('js_editor', js_editor_bundle)
      assets.register('css_editor', css_editor_bundle)

      # Register blueprints, extensions, etc.
      # ...

      return app
  ```

6. **Update Template to Use Bundled Resources (`editor.html`, `base.html`)**:

- Modify templates to include the Flask-Assets bundles.
  ```html
  {# app/templates/base.html - Example Head #}
  <head>
    {# ... other head elements ... #}
    {% block head_css %}
      {# Include main CSS bundle if you have one #}
      {# {% assets "css_main" %} <link rel="stylesheet" href="{{ ASSET_URL }}"> {% endassets %} #}

      {# Include editor CSS bundle specifically where the editor is used #}
      {% if request.endpoint in ['main.new_entry', 'main.edit_entry'] %} {# Example condition #}
        {% assets "css_editor" %}
          <link rel="stylesheet" href="{{ ASSET_URL }}">
        {% endassets %}
      {% endif %}
    {% endblock %}
  </head>

  {# app/templates/base.html - Example End of Body #}
  <body>
    {# ... main content ... #}

    {# Load Alpine.js (e.g., from static or another bundle) #}
    {# <script src="{{ url_for('static', filename='js/alpine.min.js') }}" defer></script> #}

    {# Load Editor JS bundle specifically where needed #}
    {% if request.endpoint in ['main.new_entry', 'main.edit_entry'] %} {# Example condition #}
      {% assets "js_editor" %}
        <script src="{{ ASSET_URL }}"></script>
      {% endassets %}
    {% endif %}

    {% block scripts %}{% endblock %}
  </body>
  ```
  *(Note: Loading logic might vary. Editor JS/CSS should only be loaded on pages where the editor is present).*

7. **Build Script Integration (`scripts/deploy.sh`)**:

- Ensure the deployment process includes installing Node.js dependencies and running the Vite build.
  ```bash
  #!/bin/bash
  echo "Starting deployment..."

  # Navigate to project root (adjust path if necessary)
  # cd /path/to/your/journal-app

  echo "Pulling latest changes..."
  git pull origin main # Or your deployment branch

  echo "Setting up Python environment..."
  source .venv/bin/activate
  uv pip install -r requirements.txt

  echo "Setting up Node.js environment and building assets..."
  # Check if bun is available
  if ! command -v bun &> /dev/null
  then
      echo "bun could not be found. Please install Node.js and npm."
      exit 1
  fi
  bun install       # Install frontend dependencies
  bun run build     # Run Vite build script defined in package.json

  echo "Applying database migrations..."
  flask db upgrade

  echo "Restarting application service..."
  sudo systemctl restart journal # Or your service name

  echo "Deployment finished."
  ```

This bundled approach provides better performance, reliability, offline capability, security, and version control compared to using CDNs, aligning well with the project's philosophy.

## Accessibility Guidelines

Ensure the editor is accessible:

- **Keyboard Navigation**: All toolbar controls and editor functions must be keyboard accessible. CodeMirror 6 has good base support; ensure custom elements are navigable.
- **Screen Reader Support**: Use appropriate ARIA attributes (`aria-label`, `aria-pressed`, `role`) on toolbar buttons and editor panes. CodeMirror provides some ARIA support; verify its effectiveness.
- **Focus Management**: Ensure logical focus order when navigating between the toolbar, editor, and preview pane. Programmatically manage focus when necessary (e.g., after inserting Markdown).
- **Color Contrast**: Adhere to WCAG AA contrast ratios for text, UI elements, and syntax highlighting in both light and dark themes.
- **Alternative Text**: Provide descriptive `alt` text for image previews or ensure Markdown content includes accessible descriptions.

### Implementation Details

- Add `aria-label` attributes to icon-only buttons in `toolbar.html`.
- Use `aria-pressed` for toggle buttons (like mode switcher).
- Add `aria-live="polite"` to the preview pane (`editor.html`) so screen readers announce updates.
- Test thoroughly with keyboard-only navigation and screen readers (NVDA, VoiceOver, JAWS).

## Testing Strategy

Implement comprehensive tests for the editor component:

### Unit Tests

- **Location**: `tests/js/unit/`
- **Framework**: Vitest or Vitest
- **Coverage**:
- Test individual helper functions (`toolbar-actions.js`, `persistence.js`).
- Test MathJax configuration and typesetting calls (mocking `window.MathJax`).
- Test state transitions and logic within the Alpine component (can be tricky, might require integration tests).

### Integration Tests

- **Location**: `tests/js/integration/` (or potentially within Flask integration tests using Selenium/Playwright)
- **Framework**: Playwright or Cypress
- **Coverage**:
- Simulate user interactions: typing, clicking toolbar buttons, changing modes.
- Verify CodeMirror state updates correctly.
- Verify preview pane renders expected HTML and MathJax output after debounced updates.
- Test draft saving and loading.
- Verify form submission includes the correct editor content.
- Test accessibility features (keyboard navigation, ARIA attributes).

### Manual Testing

- Test across different browsers (Chrome, Firefox, Safari).
- Verify usability with complex Markdown and LaTeX examples.
- Check performance with large documents.
- Perform accessibility checks using screen readers and keyboard navigation.
