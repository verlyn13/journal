---
id: system-guide
title: CodeMirror Reference Guide
type: guide
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- typescript
- guide
priority: medium
status: approved
visibility: internal
schema_version: v1
---

***

title: CodeMirror System Guide
description: "The official CodeMirror 6 system guide, explaining the core architecture, modularity, state management, update cycle, view layer, commands, and extension system."
category: "CodeMirror Reference"
status: active
tags: \["codemirror", "reference", "guide", "architecture", "state", "view", "extensions"]
version: "6.0"
--------------

# CodeMirror Reference Guide

## Table of Contents

- [CodeMirror Reference Guide](#codemirror-reference-guide)
  \- [Table of Contents](#table-of-contents)
  \- [1. Architecture Overview](#1-architecture-overview)
  \- [1.1 Modularity](#11-modularity)
  \- [1.2 Functional Core, Imperative Shell](#12-functional-core-imperative-shell)
  \- [2. State and Updates](#2-state-and-updates)
  \- [2.1 Document Offsets](#21-document-offsets)
  \- [2.2 Data Model](#22-data-model)
  \- [2.3 Document Changes](#23-document-changes)
  \- [2.4 Selection](#24-selection)
  \- [2.5 Configuration](#25-configuration)
  \- [2.6 Facets](#26-facets)
  \- [2.7 Transactions](#27-transactions)
  \- [3. The View](#3-the-view)
  \- [3.1 Viewport](#31-viewport)
  \- [3.2 Update Cycle](#32-update-cycle)
  \- [3.3 DOM Structure](#33-dom-structure)
  \- [3.4 Styles and Themes](#34-styles-and-themes)
  \- [4. Commands](#4-commands)
  \- [5. Extending CodeMirror](#5-extending-codemirror)
  \- [5.1 State Fields](#51-state-fields)
  \- [5.2 Affecting the View](#52-affecting-the-view)
  \- [5.3 Decorating the Document](#53-decorating-the-document)
  \- [5.4 Extension Architecture](#54-extension-architecture)

## 1. Architecture Overview

### 1.1 Modularity

CodeMirror is structured as a collection of separate modules that together provide a full-featured text and code editor. This approach allows picking and choosing features as needed, and even replacing core functionality with custom implementations.

Core packages include:

- **@codemirror/state**: Defines data structures for editor state and state changes
- **@codemirror/view**: Display component for showing editor state and translating editing actions into state updates
- **@codemirror/commands**: Defines editing commands and key bindings

Minimal editor example:

```javascript
import {EditorState} from "@codemirror/state"
import {EditorView, keymap} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"

let startState = EditorState.create({
  doc: "Hello World",
  extensions: [keymap.of(defaultKeymap)]
})

let view = new EditorView({
  state: startState,
  parent: document.body
})
```

For a more complete setup, the `codemirror` package provides baseline functionality:

```javascript
import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"

let view = new EditorView({
  extensions: [basicSetup, javascript()],
  parent: document.body
})
```

**Note**: The packages are distributed as ES6 modules, requiring a bundler or module loader.

### 1.2 Functional Core, Imperative Shell

CodeMirror's architecture follows a functional core with an imperative shell:

- **State representation**: Strictly functional—document and state data structures are immutable
- **Operations**: Pure functions that create new values instead of having side effects
- **View component**: Wraps the functional core with an imperative interface

This approach means old state values remain intact even when the editor moves to a new state, which is useful when dealing with state changes.

**Important**: Data structures created by the library should be treated as immutable. Properties marked as `readonly` in TypeScript should not be reassigned.

## 2. State and Updates

### 2.1 Document Offsets

CodeMirror uses plain numbers to address positions in the document:

- Positions represent character counts (UTF16 code units)
- Astral characters count as two units
- Line breaks always count as a single unit

Position mapping helps track positions across document changes:

```javascript
import {EditorState} from "@codemirror/state"

let state = EditorState.create({doc: "1234"})
// Delete "23" and insert at "0" at the start.
let tr = state.update({changes: [{from: 1, to: 3}, {from: 0, insert: "0"}]})
// The position at the end of the old document is at 3 in the new document.
console.log(tr.changes.mapPos(4))
```

The document also indexes by lines for efficient lookups:

```javascript
import {Text} from "@codemirror/state"

let doc = Text.of(["line 1", "line 2", "line 3"])
// Get information about line 2
console.log(doc.line(2)) // {from: 7, to: 13, ...}
// Get the line around position 15
console.log(doc.lineAt(15)) // {from: 14, to: 20, ...}
```

### 2.2 Data Model

CodeMirror treats the document as a flat string, stored split by line in a tree-shaped data structure to allow:

- Cheap updates anywhere in the document
- Efficient indexing by line number

### 2.3 Document Changes

Document changes are values describing which ranges of the old document are replaced by which bits of new text. This allows extensions to track what happens to the document (useful for undo history, collaborative editing, etc.).

When creating a change set, all positions refer to the original document—conceptually all changes happen at once.

### 2.4 Selection

An editor state stores a current selection alongside the document:

- Selections may consist of multiple ranges
- Each range can be a cursor (empty) or cover a range between anchor and head
- Overlapping ranges are automatically merged
- Ranges are sorted

Example:

```javascript
import {EditorState, EditorSelection} from "@codemirror/state"

let state = EditorState.create({
  doc: "hello",
  selection: EditorSelection.create([
    EditorSelection.range(0, 4),
    EditorSelection.range(5, 5)
  ]),
  extensions: EditorState.allowMultipleSelections.of(true)
})
console.log(state.selection.ranges.length) // 2

let tr = state.update(state.replaceSelection("!"))
console.log(tr.state.doc.toString()) // "!o!"
```

One range is marked as the main one, which is reflected in the browser's DOM selection.

Helper methods:

- `changeByRange`: Apply an operation to every selection range separately
- `replaceSelection`: Replace all selection ranges with some text

### 2.5 Configuration

Each editor state has a configuration determined by active extensions. The configuration:

- Usually stays the same during regular transactions
- Can be reconfigured using compartments or effects
- Determines the fields stored and values associated with facets for that state

### 2.6 Facets

Facets are extension points that allow different extension values to provide values, which are then combined into an output value. How combining works differs by facet:

- Single value facets (e.g., tab size): Takes the value with highest precedence
- Event handlers: Returns handlers as an array, sorted by precedence
- Boolean facets: Computes logical OR of input values
- Custom reducers: Combines values in other ways

```javascript
import {EditorState} from "@codemirror/state"

let state = EditorState.create({
  extensions: [
    EditorState.tabSize.of(16),
    EditorState.changeFilter.of(() => true)
  ]
})
console.log(state.facet(EditorState.tabSize)) // 16
console.log(state.facet(EditorState.changeFilter)) // [() => true]
```

Facets can be statically provided or computed from other aspects of the state:

```javascript
let info = Facet.define()
let state = EditorState.create({
  doc: "abc\ndef",
  extensions: [
    info.of("hello"),
    info.compute(["doc"], state => `lines: ${state.doc.lines}`)
  ]
})
console.log(state.facet(info))
// ["hello", "lines: 2"]
```

Computed values are automatically recomputed when inputs change.

### 2.7 Transactions

Transactions, created with `state.update`, combine several possible effects:

- Document changes
- Selection movement (explicit or mapped through changes)
- Scrolling instructions
- Annotations (metadata describing the transaction)
- Effects (self-contained additional effects on extension state)
- Configuration changes

Transactions are described with specs (object literals):

```javascript
// Create and dispatch a transaction
view.dispatch({
  changes: {from: 10, to: 15, insert: "hello"},
  selection: {anchor: 15, head: 20},
  scrollIntoView: true,
  annotations: Transaction.userEvent.of("input")
})

// Create without dispatching
let transaction = state.update({
  changes: {from: 10, to: 15, insert: "hello"}
})
```

Multiple specs can be combined into a single transaction.

**Note**: For completely resetting a state (e.g., loading a new document), create a new state instead of a transaction.

## 3. The View

The view is designed to be a transparent layer around the state, but some aspects require access to the DOM:

- Screen coordinates (for clicks, position coordinates)
- Text direction (from surrounding document or CSS)
- Cursor motion (depends on layout and text direction)
- Focus and scroll position (stored in DOM, not functional state)

The library does not expect user code to manipulate its DOM structure directly.

### 3.1 Viewport

For performance, CodeMirror doesn't render the entire document when it's large:

- Only renders the visible portion plus a margin (the viewport)
- Coordinates for positions outside viewport won't work
- Height information is tracked for the entire document
- The view provides a list of visible ranges that excludes invisible content

### 3.2 Update Cycle

The view minimizes DOM reflows:

1. Dispatching a transaction causes writes to the DOM without reading layout
2. A separate measure phase (using requestAnimationFrame) reads layout information
3. If necessary, follows up with another write phase

You can schedule your own measure code using `requestMeasure`.

**Important**: Always call `destroy()` when done with a view to release resources.

### 3.3 DOM Structure

The editor's DOM structure:

```html
<div class="cm-editor [theme scope classes]">
  <div class="cm-scroller">
    <div class="cm-content" contenteditable="true">
      <div class="cm-line">Content goes here</div>
      <div class="cm-line">...</div>
    </div>
  </div>
</div>
```

- Outer element: Vertical flexbox where panels and tooltips can be added
- Scroller: Horizontal flexbox that can contain gutters
- Content: Editable element containing line elements

### 3.4 Styles and Themes

CodeMirror uses a system to inject styles from JavaScript:

- Elements get classes prefixed with `cm-`
- Themes are extensions that add a unique CSS class to the editor
- Theme declarations define CSS rules using style-mod notation

Example:

```javascript
import {EditorView} from "@codemirror/view"

let view = new EditorView({
  extensions: EditorView.theme({
    ".cm-content": {color: "darkorange"},
    "&.cm-focused .cm-content": {color: "orange"}
  })
})
```

Extensions can define base themes for default styles:

```javascript
import {EditorView} from "@codemirror/view"

let myBaseTheme = EditorView.baseTheme({
  "&dark .cm-mySelector": { background: "dimgrey" },
  "&light .cm-mySelector": { background: "ghostwhite" }
})
```

When defining styles in regular CSS, include `.cm-editor` in rules to match injected style precedence:

```css
.cm-editor .cm-content { color: purple; }
```

## 4. Commands

Commands are functions with the signature `(view: EditorView) => boolean`:

- Return `false` if not applicable in current situation
- Return `true` if successfully executed
- Effects produced by dispatching transactions
- Multiple commands bound to a key are tried in order of precedence

Commands that only act on state can use `StateCommand` type instead.

The `@codemirror/commands` package provides many editing commands and keymaps:

```javascript
let myKeyExtension = keymap.of([
  {
    key: "Alt-c",
    run: view => {
      view.dispatch(view.state.replaceSelection("?"))
      return true
    }
  }
])
```

## 5. Extending CodeMirror

### 5.1 State Fields

Extensions can define additional state fields to store information:

- Must store immutable values
- Updated via reducer functions when state updates

Example:

```javascript
import {EditorState, StateField} from "@codemirror/state"

let countDocChanges = StateField.define({
  create() { return 0 },
  update(value, tr) { return tr.docChanged ? value + 1 : value }
})

let state = EditorState.create({extensions: countDocChanges})
state = state.update({changes: {from: 0, insert: "."}}).state
console.log(state.field(countDocChanges)) // 1
```

State effects can be used to communicate with state fields:

```javascript
import {StateField, StateEffect} from "@codemirror/state"

let setFullScreenMode = StateEffect.define()

let fullScreenMode = StateField.define({
  create() { return false },
  update(value, tr) {
    for (let e of tr.effects)
      if (e.is(setFullScreenMode)) value = e.value
    return value
  }
})
```

### 5.2 Affecting the View

View plugins allow extensions to run imperative components inside the view:

```javascript
import {ViewPlugin} from "@codemirror/view"

const docSizePlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.dom = view.dom.appendChild(document.createElement("div"))
    this.dom.style.cssText =
      "position: absolute; inset-block-start: 2px; inset-inline-end: 5px"
    this.dom.textContent = view.state.doc.length
  }

  update(update) {
    if (update.docChanged)
      this.dom.textContent = update.state.doc.length
  }

  destroy() { this.dom.remove() }
})
```

View plugins should:

- Not hold non-derived state
- Work as shallow views over data in editor state
- Define a destroy method if they modify the editor

### 5.3 Decorating the Document

Decorations influence how the document looks:

1. **Mark decorations**: Add style/attributes to text in a range
2. **Widget decorations**: Insert DOM elements at positions
3. **Replace decorations**: Hide or replace parts of the document
4. **Line decorations**: Add attributes to line elements

Decorations:

- Are provided through a facet
- Are kept in immutable sets
- Can be mapped across changes or rebuilt on updates

Two ways to provide decorations:

- Directly (by putting range set in facet)
- Indirectly (providing function from view to range set)

**Note**: Only directly provided decoration sets can influence vertical block structure.

### 5.4 Extension Architecture

To create editor functionality, often combine different extension types:

- State fields for state
- Base themes for styling
- View plugins for input/output
- Commands
- Facets for configuration

Best practices:

- Export functions that return extension values
- Consider what happens when extension is included multiple times
- Use deduplication for static extension values
- For configurable extensions, use module-private facets

When multiple instances have different configurations:

- Define a strategy for reconciling them
- Use facets with combining functions
- Either reconcile configurations or throw errors when impossible
