***

title: CodeMirror Core Extensions Reference
description: "A reference guide listing and categorizing core CodeMirror 6 extensions for editing, presentation, input handling, language support, and more."
category: "CodeMirror Reference"
status: active
tags: \["codemirror", "reference", "extensions", "configuration", "api"]
version: "6.0"
--------------

# CodeMirror Core Extensions Reference

## Table of Contents

- [CodeMirror Core Extensions Reference](#codemirror-core-extensions-reference)
  \- [Table of Contents](#table-of-contents)
  \- [1. Editing](#1-editing)
  \- [1.1 Whitespace](#11-whitespace)
  \- [1.2 Read-only](#12-read-only)
  \- [1.3 Editing Helpers](#13-editing-helpers)
  \- [2. Presentation](#2-presentation)
  \- [2.1 Styling](#21-styling)
  \- [2.2 Presentation Features](#22-presentation-features)
  \- [2.3 Gutters](#23-gutters)
  \- [2.4 Tooltips](#24-tooltips)
  \- [3. Input Handling](#3-input-handling)
  \- [4. Language](#4-language)
  \- [5. Primitives](#5-primitives)
  \- [6. Transactions](#6-transactions)
  \- [7. Extension Bundles](#7-extension-bundles)

## 1. Editing

### 1.1 Whitespace

- **`tabSize`**: Configures the size of a tab (in spaces) in your editor
- **`lineSeparator`**: Configures a custom line separator
- **`indentUnit`**: Sets the whitespace to add for one level of indentation
- **`indentOnInput`**: Configures whether some language-specific inputs trigger reindentation of the current line

### 1.2 Read-only

Two facets control whether the editor allows modification of its content:

- **`editable`**: Determines whether the editor view behaves like an editable control (showing a cursor, etc.)
- **`readOnly`**: Determines whether editing commands can modify the content

### 1.3 Editing Helpers

- **`allowMultipleSelections`**: Enables the selection to have multiple ranges (works with `drawSelection`)
- **`autocompletion`**: Extensions that enable content hints as the user types
- **`closeBrackets`**: Causes matching close brackets to be inserted when the user types an opening bracket
- **`codeFolding`**: Allows the user to collapse (hide) parts of the document (see also `foldGutter`)
- **`atomicRanges`**: Marks certain ranges as atomic (can't be partially selected)
- **`history`**: Provides an undo/redo history
- **`search`**: Configures the search panel

## 2. Presentation

### 2.1 Styling

- **`theme`**: Defines a theme (e.g., `@codemirror/theme-one-dark`)
- **`baseTheme`**: Defines generic base styling for extensions that define new UI elements
- **`styleModule`**: Ensures the editor loads a given CSS module
- **`editorAttributes`**: Adds HTML attributes to the editor's outer DOM element
- **`contentAttributes`**: Adds attributes to the element holding the editor's content
- **`decorations`**: Adds styling to the editor's content (building block for various extensions)

### 2.2 Presentation Features

- **`drawSelection`**: Replaces native selection with custom-drawn selection, supporting multiple ranges
- **`lineWrapping`**: Enables line wrapping
- **`highlightActiveLine`**: Adds an extra style to the line with the cursor
- **`highlightSpecialChars`**: Replaces non-printable characters with placeholder widgets
- **`scrollPastEnd`**: Allows scrolling down until the last line is at the top of the viewport
- **`bracketMatching`**: Highlights matching brackets
- **`highlightSelectionMatches`**: Highlights instances of currently selected text
- **`placeholder`** (`@codemirror/view`): Displays placeholder text when the editor is empty
- **`phrases`**: Allows translation of text used in the editor interface

### 2.3 Gutters

- **`lineNumbers`**: Adds a line number gutter
- **`foldGutter`**: Shows which lines can be folded and whether they currently are folded
- **`lintGutter`**: Lists lint errors beside the lines where they occur
- **`gutters`**: Configures the behavior of the gutters
- **`highlightActiveLineGutter`**: Adds a style to gutters alongside the active line
- **`gutter`**: A primitive for defining custom editor gutters

### 2.4 Tooltips

- **`tooltips`**: Configures the behavior of editor tooltips (such as autocompletion prompts)
- **`hoverTooltip`**: Displays tooltips when the pointer hovers over parts of the content

## 3. Input Handling

- **`domEventHandlers`**: Provides handlers for raw browser events
- **`dropCursor`**: Shows a pseudo-cursor at the current drop point when dragging content
- **`keymap`**: Facet used to add keymaps to the editor
  \- Built-in keymaps: `standardKeymap`, `defaultKeymap`, `foldKeymap`, `historyKeymap`, `searchKeymap`, `completionKeymap`, `closeBracketsKeymap`, `lintKeymap`
- **`inputHandler`**: Allows functions to intercept and handle user text input
- **`mouseSelectionStyle`**: Provides hooks for custom handling of mouse selection
- **`dragMovesSelection`**: Determines when dragging text moves versus copies it
- **`clickAddsSelectionRange`**: Configures which kinds of clicks add a new selection range
- **`rectangularSelection`**: Makes Alt+pointer selection select a rectangular region
- **`crosshairCursor`**: Displays the pointer as a cross when Alt is held

## 4. Language

Language-related extensions are usually imported from language-specific packages:

- **Language objects**: Added to configuration to select the language (e.g., `javascript()` from `@codemirror/lang-javascript`)
- **`Language.data`**: Registers language-specific data (such as autocompletion sources)
- **`syntaxHighlighting`**: Enables code highlighting styles
- **`foldService`**: Defines a source of code folding information (usually via syntax tree)
- **`indentService`**: Defines a source of autoindentation (usually via syntax tree)
- **`linter`**: Registers a linter and shows diagnostics in the editor (works with `lintGutter`)

## 5. Primitives

- **`StateFields`**: Added to the editor by including them in its set of extensions
- **`ViewPlugin`**: Registers plugins for the editor view
- **`exceptionSink`**: Routes exceptions caught by the editor to your code
- **`updateListener`**: Registers a function called for every editor update

## 6. Transactions

Facets for inspecting and altering transactions before they take effect:

- **`changeFilter`**: Filters or suppresses document changes
- **`transactionFilter`**: Modifies, extends, or cancels entire transactions
- **`transactionExtender`**: Adds extra metadata or effects to transactions

## 7. Extension Bundles

Ready-made extension collections:

- **`basicSetup`**: An array of extensions enabling many features listed in this document
- **`minimalSetup`**: A minimal collection of recommended extensions for every editor
