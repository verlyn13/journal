---
title: CodeMirror Quick Reference
category: reference
topics: ["codemirror", "editor", "javascript", "quick-start"]
version: "6.0"
last_updated: "2025-04-08"
---

# CodeMirror Quick Reference Guide

This document provides concise code examples for common CodeMirror operations used in the Journal application. For in-depth explanations, refer to the linked detailed documentation.

## Basic Editor Setup

```javascript
import {EditorView, basicSetup} from "codemirror"
import {markdown} from "@codemirror/lang-markdown"

const editor = new EditorView({
  doc: "# Initial content",
  extensions: [
    basicSetup,
    markdown()
  ],
  parent: document.querySelector("#editor-container")
})
```

**See:** [Basic Example](./example-basic.md) | [System Guide](./system-guide.md)

## Getting and Setting Content

```javascript
// Get the current document content as a string
const content = editor.state.doc.toString()

// Replace entire document content
editor.dispatch({
  changes: {from: 0, to: editor.state.doc.length, insert: "# New content"}
})

// Insert text at current selection
editor.dispatch(
  editor.state.replaceSelection("**bold text**")
)
```

**See:** [Reference Manual Part 1](./reference-manual-part1.md) (EditorState section)

## Working with Selection

```javascript
// Get current selection
const selection = editor.state.selection
const mainSelectionPos = selection.main.from

// Set cursor position
editor.dispatch({
  selection: {anchor: 10}
})

// Create selection range
editor.dispatch({
  selection: {anchor: 10, head: 20}
})

// Select entire document
editor.dispatch({
  selection: {anchor: 0, head: editor.state.doc.length}
})
```

**See:** [Reference Manual Part 1](./reference-manual-part1.md) (Selection section)

## Handling Events

```javascript
import {EditorView} from "@codemirror/view"

// Listen for content changes
const contentChangeListener = EditorView.updateListener.of(update => {
  if (update.docChanged) {
    console.log("Document changed")
    // Access new content with update.state.doc.toString()
  }
})

// Add the listener to your editor
const editor = new EditorView({
  // ...other config
  extensions: [
    // ...other extensions
    contentChangeListener
  ]
})
```

**See:** [Reference Manual Part 2](./reference-manual-part2.md) (Events section)

## Styling and Theming

```javascript
import {EditorView} from "@codemirror/view"

// Define a custom theme
const customTheme = EditorView.theme({
  "&": {
    height: "100%", 
    fontSize: "16px"
  },
  ".cm-content": {
    fontFamily: "'Source Code Pro', monospace",
    caretColor: "#0080ff"
  },
  ".cm-line": {
    lineHeight: 1.6
  }
})

// Use the theme
const editor = new EditorView({
  // ...other config
  extensions: [
    // ...other extensions
    customTheme
  ]
})
```

**See:** [Styling Example](./example-styling.md) | [Reference Manual Part 2](./reference-manual-part2.md)

## Using Markdown Support

```javascript
import {markdown, markdownLanguage} from "@codemirror/lang-markdown"
import {languages} from "@codemirror/language-data"

// Basic markdown
const basicMarkdown = markdown()

// Markdown with syntax highlighting for code blocks
const enhancedMarkdown = markdown({
  base: markdownLanguage,
  codeLanguages: languages
})

// Use in editor
const editor = new EditorView({
  // ...other config
  extensions: [
    // ...other extensions
    enhancedMarkdown
  ]
})
```

**See:** [Reference Manual Part 3](./reference-manual-part3.md) (Language Support section)

## Common Editor Actions

```javascript
import {indentWithTab} from "@codemirror/commands"
import {keymap} from "@codemirror/view"

// Enable tab key for indentation
const tabKeymap = keymap.of([indentWithTab])

// Custom commands
import {EditorView} from "@codemirror/view"

// Define a custom command
const toggleBold = (view) => {
  const selection = view.state.selection.main
  const selectedText = view.state.sliceDoc(selection.from, selection.to)
  
  const newText = selectedText ? `**${selectedText}**` : "**bold text**"
  
  view.dispatch(view.state.replaceSelection(newText))
  return true
}

// Create a keymap with your custom command
const markdownKeymap = keymap.of([
  { key: "Ctrl-b", run: toggleBold }
])

// Use in editor
const editor = new EditorView({
  // ...other config
  extensions: [
    // ...other extensions
    tabKeymap,
    markdownKeymap
  ]
})
```

**See:** [Tab Handling Example](./example-tab-handling.md) | [Reference Manual Part 2](./reference-manual-part2.md) (Commands section)

## Persistence Integration

```javascript
import {EditorView, basicSetup} from "codemirror"
import {markdown} from "@codemirror/lang-markdown"

// Set up editor with auto-save
const editor = new EditorView({
  doc: localStorage.getItem("journal-content") || "",
  extensions: [
    basicSetup,
    markdown(),
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        // Save to localStorage on change
        localStorage.setItem("journal-content", update.state.doc.toString())
      }
    })
  ],
  parent: document.querySelector("#editor")
})

// For more robust persistence, use debouncing:
import {debounce} from "../utils/debounce.js"

const saveContent = debounce((content) => {
  // Save to server or localStorage
  fetch('/api/save', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({content})
  })
}, 1000) // 1 second delay

const persistenceListener = EditorView.updateListener.of(update => {
  if (update.docChanged) {
    saveContent(update.state.doc.toString())
  }
})
```

**See:** [Reference Manual Part 2](./reference-manual-part2.md) (Events section) | Journal [Editor Persistence](../guides/editor-architecture.md)

## Accessibility Features

```javascript
import {EditorState} from "@codemirror/state"
import {EditorView, keymap} from "@codemirror/view"
import {
  indentWithTab,
  toggleComment,
  defaultKeymap,
  historyKeymap,
  history
} from "@codemirror/commands"

// Combine all keymaps for comprehensive keyboard support
const editor = new EditorView({
  // ...other config
  extensions: [
    // ...other extensions
    history(),
    keymap.of([
      indentWithTab,
      ...defaultKeymap,
      ...historyKeymap
    ])
  ]
})

// Enable high-contrast theme support
const accessibleTheme = EditorView.theme({
  // High-contrast specific styles
  "&.cm-focused .cm-cursor": {
    borderLeftWidth: "3px"
  },
  ".cm-activeLine": {
    backgroundColor: "#efefef"
  }
}, {dark: false})

// Add screen reader announcements
function makeAccessible(view) {
  // Add appropriate ARIA attributes
  view.contentDOM.setAttribute("aria-multiline", "true")
  view.contentDOM.setAttribute("aria-label", "Markdown Editor")
  
  // Enhance focus visibility
  view.dom.classList.add("keyboard-focused")
}

// Call after mounting
makeAccessible(editor)
```

**See:** [Tab Handling Example](./example-tab-handling.md) | [Reference Manual Part 4](./reference-manual-part4.md) (Accessibility)

## Journal-Specific Integration

See the Journal application's [Editor Architecture](../guides/editor-architecture.md) document for detailed integration patterns specific to this project.