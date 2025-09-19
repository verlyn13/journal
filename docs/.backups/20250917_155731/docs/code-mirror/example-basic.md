---
id: example-basic
title: Setting Up a Basic CodeMirror Editor
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- reference
- typescript
priority: medium
status: approved
visibility: internal
schema_version: v1
---

***

title: CodeMirror Basic Example
description: "A basic example demonstrating how to set up a simple CodeMirror editor instance with default functionality."
category: "CodeMirror Examples"
status: active
tags: \["codemirror", "example", "basic", "setup", "javascript"]
version: "6.0"
--------------

# Setting Up a Basic CodeMirror Editor

## Getting Started

CodeMirror is a versatile code editor implemented in JavaScript. This guide will walk you through creating a basic editor and customizing it to fit your needs.

## Creating a Simple Editor

To create a CodeMirror editor, you need to instantiate the `EditorView` class. Here's the minimal code required:

```javascript
import {basicSetup} from "codemirror"
import {EditorView} from "@codemirror/view"

const view = new EditorView({
  doc: "Start document",        // Initial content
  parent: document.body,        // Where to place the editor
  extensions: [basicSetup]      // Default functionality
})
```

This code:

1. Creates an editor with the text "Start document"
2. Places it at the end of the document body
3. Loads a set of basic extensions that provide essential functionality

## Accessing Editor Content

You can access the current state of the editor through `view.state`. To get the document content as a string:

```javascript
const content = view.state.doc.toString();
```

## Understanding Extensions

Extensions are the primary way to add functionality to a CodeMirror editor. The `basicSetup` bundle includes several extensions that provide a good default configuration, but you can customize this to fit your specific needs.

### What's Included in basicSetup

The `basicSetup` extension bundle includes:

- Line numbers
- Code folding
- Special character highlighting
- Undo/redo history
- Custom selection handling
- Drag-and-drop support
- Multiple selections
- Auto-indentation
- Syntax highlighting
- Bracket matching
- Automatic bracket closing
- Autocompletion
- Rectangular selection
- Active line highlighting
- Selection match highlighting
- Search functionality
- Standard keybindings

## Customizing Your Editor

If you want more control over your editor's features, you can replace `basicSetup` with individual extensions.

### Example: Custom Extension Configuration

```javascript
import {Extension, EditorState} from "@codemirror/state"
import {
  EditorView, keymap, highlightSpecialChars, drawSelection,
  highlightActiveLine, dropCursor, rectangularSelection,
  crosshairCursor, lineNumbers, highlightActiveLineGutter
} from "@codemirror/view"
import {
  defaultHighlightStyle, syntaxHighlighting, indentOnInput,
  bracketMatching, foldGutter, foldKeymap
} from "@codemirror/language"
import {
  defaultKeymap, history, historyKeymap
} from "@codemirror/commands"
import {
  searchKeymap, highlightSelectionMatches
} from "@codemirror/search"
import {
  autocompletion, completionKeymap, closeBrackets,
  closeBracketsKeymap
} from "@codemirror/autocomplete"
import {lintKeymap} from "@codemirror/lint"

const view = new EditorView({
  doc: "Start document",
  parent: document.body,
  extensions: [
    lineNumbers(),                                // Line number gutter
    foldGutter(),                                 // Code folding markers
    highlightSpecialChars(),                      // Show placeholders for non-printable chars
    history(),                                    // Undo history
    drawSelection(),                              // Custom selection rendering
    dropCursor(),                                 // Show cursor when dragging
    EditorState.allowMultipleSelections.of(true), // Enable multiple selections
    indentOnInput(),                              // Auto-indent on input
    syntaxHighlighting(defaultHighlightStyle),    // Basic syntax highlighting
    bracketMatching(),                            // Highlight matching brackets
    closeBrackets(),                              // Auto-close brackets
    autocompletion(),                             // Code completion
    rectangularSelection(),                       // Alt+drag for rectangular selection
    crosshairCursor(),                            // Crosshair cursor when holding Alt
    highlightActiveLine(),                        // Highlight the current line
    highlightActiveLineGutter(),                  // Highlight gutter for current line
    highlightSelectionMatches(),                  // Highlight text matching selection
    keymap.of([
      ...closeBracketsKeymap,                     // Bracket-aware backspace
      ...defaultKeymap,                           // Basic editing keybindings
      ...searchKeymap,                            // Search-related keybindings
      ...historyKeymap,                           // Undo/redo keybindings
      ...foldKeymap,                              // Code folding keybindings
      ...completionKeymap,                        // Completion keybindings
      ...lintKeymap                               // Linting keybindings
    ])
  ]
})
```

This detailed setup gives you control over every aspect of the editor's behavior.

## Adding Language Support

To enable language-specific features like syntax highlighting and intelligent indentation, you need to add a language extension. Most language packages export a main function named after the language.

```javascript
import {javascript} from "@codemirror/lang-javascript"
import {EditorView, basicSetup} from "codemirror"

const view = new EditorView({
  doc: "let x = 10;",
  parent: document.body,
  extensions: [
    basicSetup,
    javascript({typescript: true})  // Enable TypeScript support
  ]
})
```

## Styling the Editor

By default, a CodeMirror editor is a borderless element that grows to fit its content. You can use CSS to customize its appearance:

```css
.cm-editor {
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Make the editor take up available width */
.cm-editor .cm-scroller {
  overflow: auto;
}

/* Change the font and size */
.cm-editor .cm-content {
  font-family: 'Fira Code', monospace;
  font-size: 14px;
}

/* Style the active line */
.cm-editor .cm-activeLine {
  background-color: rgba(0, 0, 0, 0.05);
}
```

## Advanced Customization

Beyond the basic setup shown here, CodeMirror supports extensive customization through additional extensions and configuration options. You can:

- Create custom themes
- Define specialized language support
- Add custom commands and keybindings
- Build extensions that integrate with other tools
- Create completion sources for your specific domain
- Implement linters for custom validation

## Conclusion

CodeMirror provides a powerful foundation for creating code editors in web applications. By understanding its extension-based architecture, you can build anything from a simple text area replacement to a full-featured IDE-like experience.

For more information, refer to the [CodeMirror documentation](https://codemirror.net/docs/) or explore the various extension packages available.
