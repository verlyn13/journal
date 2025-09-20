---
id: reference-manual-part4
title: CodeMirror Packages Reference
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

title: CodeMirror Reference Manual - Part 4 (Packages)
description: "Part 4 of the CodeMirror 6 reference manual, covering packages like @codemirror/commands, @codemirror/search, @codemirror/autocomplete, @codemirror/lint, and @codemirror/collab."
category: "CodeMirror Reference"
status: active
tags: \["codemirror", "reference", "manual", "commands", "search", "autocomplete", "lint", "collab"]
version: "6.0"
--------------

# CodeMirror Packages Reference

## Table of Contents

- [CodeMirror Packages Reference](#codemirror-packages-reference)
  \- [Table of Contents](#table-of-contents)
  \- [Commands Package](#commands-package)
  \- [Keymaps](#keymaps)
  \- [Selection Commands](#selection-commands)
  \- [Cursor Movement](#cursor-movement)
  \- [By Character](#by-character)
  \- [By Group](#by-group)
  \- [Vertical Movement](#vertical-movement)
  \- [By Line Boundary](#by-line-boundary)
  \- [By Document Boundary](#by-document-boundary)
  \- [By Syntax](#by-syntax)
  \- [Deletion Commands](#deletion-commands)
  \- [Line Manipulation](#line-manipulation)
  \- [Indentation](#indentation)
  \- [Character Manipulation](#character-manipulation)
  \- [Undo History](#undo-history)
  \- [Commenting](#commenting)
  \- [Tab Focus Mode](#tab-focus-mode)
  \- [Search Package](#search-package)
  \- [Search Configuration](#search-configuration)
  \- [Search Commands](#search-commands)
  \- [Search Query](#search-query)
  \- [Search Cursors](#search-cursors)
  \- [Selection Matching](#selection-matching)
  \- [Autocomplete Package](#autocomplete-package)
  \- [Completion Interface](#completion-interface)
  \- [Autocomplete Configuration](#autocomplete-configuration)
  \- [Completion Status](#completion-status)
  \- [Completion Sources](#completion-sources)
  \- [Autocomplete Commands](#autocomplete-commands)
  \- [Snippets](#snippets)
  \- [Bracket Closing](#bracket-closing)
  \- [Lint Package](#lint-package)
  \- [Diagnostic Interface](#diagnostic-interface)
  \- [Linter Configuration](#linter-configuration)
  \- [Lint Commands](#lint-commands)
  \- [Lint Gutter](#lint-gutter)
  \- [Collaborative Editing Package](#collaborative-editing-package)
  \- [Collab Extension](#collab-extension)
  \- [Update Interface](#update-interface)
  \- [Collab Methods](#collab-methods)
  \- [CodeMirror Package](#codemirror-package)
  \- [Setup Extensions](#setup-extensions)

## Commands Package

The `@codemirror/commands` package provides a collection of generic editing commands and key bindings.

### Keymaps

```typescript
standardKeymap: readonly KeyBinding[]
```

An array of key bindings closely following platform-standard or widely used bindings:

| Key                            | Function                     | With Shift                   |
| ------------------------------ | ---------------------------- | ---------------------------- |
| `ArrowLeft`                    | `cursorCharLeft`             | `selectCharLeft`             |
| `ArrowRight`                   | `cursorCharRight`            | `selectCharRight`            |
| `Ctrl-ArrowLeft` (Alt on Mac)  | `cursorGroupLeft`            | `selectGroupLeft`            |
| `Ctrl-ArrowRight` (Alt on Mac) | `cursorGroupRight`           | `selectGroupRight`           |
| `Cmd-ArrowLeft` (Mac only)     | `cursorLineStart`            | `selectLineStart`            |
| `Cmd-ArrowRight` (Mac only)    | `cursorLineEnd`              | `selectLineEnd`              |
| `ArrowUp`                      | `cursorLineUp`               | `selectLineUp`               |
| `ArrowDown`                    | `cursorLineDown`             | `selectLineDown`             |
| `Cmd-ArrowUp` (Mac only)       | `cursorDocStart`             | `selectDocStart`             |
| `Cmd-ArrowDown` (Mac only)     | `cursorDocEnd`               | `selectDocEnd`               |
| `PageUp`                       | `cursorPageUp`               | `selectPageUp`               |
| `PageDown`                     | `cursorPageDown`             | `selectPageDown`             |
| `Home`                         | `cursorLineBoundaryBackward` | `selectLineBoundaryBackward` |
| `End`                          | `cursorLineBoundaryForward`  | `selectLineBoundaryForward`  |
| `Ctrl-Home` (Cmd-Home on Mac)  | `cursorDocStart`             | `selectDocStart`             |
| `Ctrl-End` (Cmd-End on Mac)    | `cursorDocEnd`               | `selectDocEnd`               |
| `Enter`/`Shift-Enter`          | `insertNewlineAndIndent`     | -                            |
| `Ctrl-a` (Cmd-a on Mac)        | `selectAll`                  | -                            |
| `Backspace`                    | `deleteCharBackward`         | -                            |
| `Delete`                       | `deleteCharForward`          | -                            |
| `Ctrl-Backspace` (Alt on Mac)  | `deleteGroupBackward`        | -                            |
| `Ctrl-Delete` (Alt on Mac)     | `deleteGroupForward`         | -                            |
| `Cmd-Backspace` (Mac only)     | `deleteLineBoundaryBackward` | -                            |
| `Cmd-Delete` (Mac only)        | `deleteLineBoundaryForward`  | -                            |

```typescript
defaultKeymap: readonly KeyBinding[]
```

Includes all bindings from `standardKeymap` plus additional ones:

| Key                                 | Function                                              |
| ----------------------------------- | ----------------------------------------------------- |
| `Alt-ArrowLeft` (Ctrl on Mac)       | `cursorSyntaxLeft` (with Shift: `selectSyntaxLeft`)   |
| `Alt-ArrowRight` (Ctrl on Mac)      | `cursorSyntaxRight` (with Shift: `selectSyntaxRight`) |
| `Alt-ArrowUp`                       | `moveLineUp`                                          |
| `Alt-ArrowDown`                     | `moveLineDown`                                        |
| `Shift-Alt-ArrowUp`                 | `copyLineUp`                                          |
| `Shift-Alt-ArrowDown`               | `copyLineDown`                                        |
| `Escape`                            | `simplifySelection`                                   |
| `Ctrl-Enter` (Cmd on Mac)           | `insertBlankLine`                                     |
| `Alt-l` (Ctrl-l on Mac)             | `selectLine`                                          |
| `Ctrl-i` (Cmd-i on Mac)             | `selectParentSyntax`                                  |
| `Ctrl-[` (Cmd-\[ on Mac)            | `indentLess`                                          |
| `Ctrl-]` (Cmd-] on Mac)             | `indentMore`                                          |
| `Ctrl-Alt-\` (Cmd-Alt-\ on Mac)     | `indentSelection`                                     |
| `Shift-Ctrl-k` (Shift-Cmd-k on Mac) | `deleteLine`                                          |
| `Shift-Ctrl-\` (Shift-Cmd-\ on Mac) | `cursorMatchingBracket`                               |
| `Ctrl-/` (Cmd-/ on Mac)             | `toggleComment`                                       |
| `Shift-Alt-a`                       | `toggleBlockComment`                                  |
| `Ctrl-m` (Alt-Shift-m on Mac)       | `toggleTabFocusMode`                                  |

```typescript
emacsStyleKeymap: readonly KeyBinding[]
```

Emacs-style bindings available on macOS by default:

| Key          | Function              | With Shift        |
| ------------ | --------------------- | ----------------- |
| `Ctrl-b`     | `cursorCharLeft`      | `selectCharLeft`  |
| `Ctrl-f`     | `cursorCharRight`     | `selectCharRight` |
| `Ctrl-p`     | `cursorLineUp`        | `selectLineUp`    |
| `Ctrl-n`     | `cursorLineDown`      | `selectLineDown`  |
| `Ctrl-a`     | `cursorLineStart`     | `selectLineStart` |
| `Ctrl-e`     | `cursorLineEnd`       | `selectLineEnd`   |
| `Ctrl-d`     | `deleteCharForward`   | -                 |
| `Ctrl-h`     | `deleteCharBackward`  | -                 |
| `Ctrl-k`     | `deleteToLineEnd`     | -                 |
| `Ctrl-Alt-h` | `deleteGroupBackward` | -                 |
| `Ctrl-o`     | `splitLine`           | -                 |
| `Ctrl-t`     | `transposeChars`      | -                 |
| `Ctrl-v`     | `cursorPageDown`      | -                 |
| `Alt-v`      | `cursorPageUp`        | -                 |

```typescript
indentWithTab: KeyBinding
```

A binding that maps Tab to `indentMore` and Shift-Tab to `indentLess`.

### Selection Commands

```typescript
simplifySelection: StateCommand
```

Simplify the current selection by reducing multiple ranges to the main range or converting a non-empty selection to a cursor.

### Cursor Movement

Commands are organized by type of movement:

#### By Character

| Command                     | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `cursorCharLeft`            | Move selection one character left (direction-aware)   |
| `selectCharLeft`            | Move selection head one character left                |
| `cursorCharRight`           | Move selection one character right                    |
| `selectCharRight`           | Move selection head one character right               |
| `cursorCharForward`         | Move selection one character forward                  |
| `selectCharForward`         | Move selection head one character forward             |
| `cursorCharBackward`        | Move selection one character backward                 |
| `selectCharBackward`        | Move selection head one character backward            |
| `cursorCharForwardLogical`  | Move by logical character index (non-direction aware) |
| `selectCharForwardLogical`  | Move selection head by logical character index        |
| `cursorCharBackwardLogical` | Move backward by logical character index              |
| `selectCharBackwardLogical` | Move selection head backward by logical index         |

#### By Group

| Command                 | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `cursorGroupLeft`       | Move across one group of word/non-word characters to the left |
| `selectGroupLeft`       | Move selection head one group left                            |
| `cursorGroupRight`      | Move one group to the right                                   |
| `selectGroupRight`      | Move selection head one group right                           |
| `cursorGroupForward`    | Move one group forward                                        |
| `selectGroupForward`    | Move selection head one group forward                         |
| `cursorGroupBackward`   | Move one group backward                                       |
| `selectGroupBackward`   | Move selection head one group backward                        |
| `cursorGroupForwardWin` | Windows-style group movement (to start of next group)         |
| `selectGroupForwardWin` | Windows-style selection group movement                        |
| `cursorSubwordForward`  | Move by group or camel-case subword forward                   |
| `selectSubwordForward`  | Move selection head by group or camel-case subword forward    |
| `cursorSubwordBackward` | Move by group or camel-case subword backward                  |
| `selectSubwordBackward` | Move selection head by group or subword backward              |

#### Vertical Movement

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `cursorLineUp`   | Move selection one line up        |
| `selectLineUp`   | Move selection head one line up   |
| `cursorLineDown` | Move selection one line down      |
| `selectLineDown` | Move selection head one line down |
| `cursorPageUp`   | Move selection one page up        |
| `selectPageUp`   | Move selection head one page up   |
| `cursorPageDown` | Move selection one page down      |
| `selectPageDown` | Move selection head one page down |

#### By Line Boundary

| Command                      | Description                                   |
| ---------------------------- | --------------------------------------------- |
| `cursorLineBoundaryForward`  | Move to next line wrap or end of line         |
| `selectLineBoundaryForward`  | Move selection head to next line boundary     |
| `cursorLineBoundaryBackward` | Move to previous line wrap or start of line   |
| `selectLineBoundaryBackward` | Move selection head to previous line boundary |
| `cursorLineBoundaryLeft`     | Move one line wrap point left                 |
| `selectLineBoundaryLeft`     | Move selection head one line boundary left    |
| `cursorLineBoundaryRight`    | Move one line wrap point right                |
| `selectLineBoundaryRight`    | Move selection head one line boundary right   |
| `cursorLineStart`            | Move to start of line                         |
| `selectLineStart`            | Move selection head to start of line          |
| `cursorLineEnd`              | Move to end of line                           |
| `selectLineEnd`              | Move selection head to end of line            |
| `selectLine`                 | Expand selection to cover entire lines        |

#### By Document Boundary

| Command          | Description                           |
| ---------------- | ------------------------------------- |
| `cursorDocStart` | Move to document start                |
| `selectDocStart` | Move selection head to document start |
| `cursorDocEnd`   | Move to document end                  |
| `selectDocEnd`   | Move selection head to document end   |
| `selectAll`      | Select entire document                |

#### By Syntax

| Command                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `cursorSyntaxLeft`      | Move over next syntactic element to the left          |
| `selectSyntaxLeft`      | Move selection head over next syntactic element left  |
| `cursorSyntaxRight`     | Move over next syntactic element to the right         |
| `selectSyntaxRight`     | Move selection head over next syntactic element right |
| `selectParentSyntax`    | Select next larger syntactic construct                |
| `cursorMatchingBracket` | Move to matching bracket                              |
| `selectMatchingBracket` | Extend selection to matching bracket                  |

### Deletion Commands

| Command                      | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| `deleteCharBackward`         | Delete selection or character/indentation before cursor |
| `deleteCharBackwardStrict`   | Delete selection or single character before cursor      |
| `deleteCharForward`          | Delete selection or character after cursor              |
| `deleteGroupBackward`        | Delete selection or to previous group boundary          |
| `deleteGroupForward`         | Delete selection or to next group boundary              |
| `deleteToLineStart`          | Delete selection or to line start                       |
| `deleteToLineEnd`            | Delete selection or to line end                         |
| `deleteLineBoundaryBackward` | Delete to previous line boundary                        |
| `deleteLineBoundaryForward`  | Delete to next line boundary                            |
| `deleteTrailingWhitespace`   | Delete all whitespace at end of lines                   |

### Line Manipulation

| Command        | Description                       |
| -------------- | --------------------------------- |
| `splitLine`    | Replace selection with line break |
| `moveLineUp`   | Move selected lines up            |
| `moveLineDown` | Move selected lines down          |
| `copyLineUp`   | Copy selected lines up            |
| `copyLineDown` | Copy selected lines down          |
| `deleteLine`   | Delete selected lines             |

### Indentation

| Command           | Description                                     |
| ----------------- | ----------------------------------------------- |
| `indentSelection` | Auto-indent selected lines                      |
| `indentMore`      | Add one indentation unit to selected lines      |
| `indentLess`      | Remove one indentation unit from selected lines |
| `insertTab`       | Insert tab or indent selection                  |

### Character Manipulation

| Command                   | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `transposeChars`          | Swap characters before and after cursor            |
| `insertNewline`           | Replace selection with newline                     |
| `insertNewlineAndIndent`  | Insert newline and indent new line(s)              |
| `insertNewlineKeepIndent` | Insert newline with same indentation as line above |
| `insertBlankLine`         | Create blank indented line below current line      |

### Undo History

```typescript
history(config?: Object = {}) → Extension
```

Create a history extension for undo/redo functionality.

| Config Option    | Type                                                 | Description                                              |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| `minDepth?`      | `number`                                             | Minimum event depth to store. Default: 100               |
| `newGroupDelay?` | `number`                                             | Maximum time (ms) to group adjacent events. Default: 500 |
| `joinToEvent?`   | `fn(tr: Transaction, isAdjacent: boolean) → boolean` | Custom predicate for joining changes                     |

```typescript
historyKeymap: readonly KeyBinding[]
```

Default key bindings for undo history:

- Mod-z: `undo`
- Mod-y (Mod-Shift-z on macOS) + Ctrl-Shift-z on Linux: `redo`
- Mod-u: `undoSelection`
- Alt-u (Mod-Shift-u on macOS): `redoSelection`

| Command/Field     | Description                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `historyField`    | State field for history data                                                 |
| `undo`            | Undo a single group of events                                                |
| `redo`            | Redo a group of events                                                       |
| `undoSelection`   | Undo a change or selection change                                            |
| `redoSelection`   | Redo a change or selection change                                            |
| `undoDepth`       | Get amount of undoable events available                                      |
| `redoDepth`       | Get amount of redoable events available                                      |
| `isolateHistory`  | Transaction annotation to prevent combining with other transactions          |
| `invertedEffects` | Facet for registering functions that provide effects to store when inverting |

### Commenting

```typescript
interface CommentTokens
```

Language data for comment syntax:

| Property | Type                            | Description                                                |
| -------- | ------------------------------- | ---------------------------------------------------------- |
| `block?` | `{open: string, close: string}` | Block comment syntax, e.g., `{open: "<!--", close: "-->"}` |
| `line?`  | `string`                        | Line comment syntax, e.g., `"//"`                          |

| Command                    | Description                                                                  |
| -------------------------- | ---------------------------------------------------------------------------- |
| `toggleComment`            | Toggle commenting using line comments if available, otherwise block comments |
| `toggleLineComment`        | Toggle line comments for current selection                                   |
| `lineComment`              | Add line comments to selection                                               |
| `lineUncomment`            | Remove line comments from selection                                          |
| `toggleBlockComment`       | Toggle block comments for current selection                                  |
| `blockComment`             | Add block comments to selection                                              |
| `blockUncomment`           | Remove block comments from selection                                         |
| `toggleBlockCommentByLine` | Toggle block comments on a per-line basis                                    |

### Tab Focus Mode

| Command                      | Description                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| `toggleTabFocusMode`         | Enable/disable tab-focus mode                                    |
| `temporarilySetTabFocusMode` | Enable tab-focus for two seconds or until another key is pressed |

## Search Package

### Search Configuration

```typescript
searchKeymap: readonly KeyBinding[]
```

Default search-related key bindings:

- Mod-f: `openSearchPanel`
- F3, Mod-g: `findNext`
- Shift-F3, Shift-Mod-g: `findPrevious`
- Mod-Alt-g: `gotoLine`
- Mod-d: `selectNextOccurrence`

```typescript
search(config?: Object) → Extension
```

Add search state to editor configuration.

| Config Option    | Type                                                                 | Description                                 |
| ---------------- | -------------------------------------------------------------------- | ------------------------------------------- |
| `top?`           | `boolean`                                                            | Position panel at top instead of bottom     |
| `caseSensitive?` | `boolean`                                                            | Enable case sensitivity by default          |
| `literal?`       | `boolean`                                                            | Treat searches literally by default         |
| `wholeWord?`     | `boolean`                                                            | Enable by-word matching by default          |
| `regexp?`        | `boolean`                                                            | Enable regular expression search by default |
| `createPanel?`   | `fn(view: EditorView) → Panel`                                       | Custom search panel implementation          |
| `scrollToMatch?` | `fn(range: SelectionRange, view: EditorView) → StateEffect<unknown>` | Custom scroll effect for matches            |

### Search Commands

| Command                  | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `findNext`               | Find next match after current selection           |
| `findPrevious`           | Find previous match before current selection      |
| `selectMatches`          | Select all instances of search query              |
| `selectSelectionMatches` | Select all occurrences of currently selected text |
| `selectNextOccurrence`   | Select next occurrence of current selection       |
| `replaceNext`            | Replace current search match                      |
| `replaceAll`             | Replace all instances of search query             |
| `openSearchPanel`        | Open and focus search panel                       |
| `closeSearchPanel`       | Close search panel                                |
| `gotoLine`               | Show dialog to jump to specific line number       |

### Search Query

```typescript
class SearchQuery
```

| Constructor Option | Type      | Description                            |
| ------------------ | --------- | -------------------------------------- |
| `search`           | `string`  | The search string                      |
| `caseSensitive?`   | `boolean` | Whether search is case-sensitive       |
| `literal?`         | `boolean` | Disable escape sequence interpretation |
| `regexp?`          | `boolean` | Interpret search as regular expression |
| `replace?`         | `string`  | The replacement text                   |
| `wholeWord?`       | `boolean` | Enable whole-word matching             |

| Property/Method                | Type/Description                          |
| ------------------------------ | ----------------------------------------- |
| `search`                       | `string` - The search string              |
| `caseSensitive`                | `boolean` - Whether case-sensitive        |
| `literal`                      | `boolean` - Disable escape interpretation |
| `regexp`                       | `boolean` - Treat as regular expression   |
| `replace`                      | `string` - Replacement text               |
| `valid`                        | `boolean` - Whether query is valid        |
| `wholeWord`                    | `boolean` - Whole-word matching           |
| `eq(other: SearchQuery)`       | Compare to another query                  |
| `getCursor(state, from?, to?)` | Get search cursor for this query          |

```typescript
getSearchQuery(state: EditorState) → SearchQuery
```

Get current search query from editor state.

```typescript
setSearchQuery: StateEffectType<SearchQuery>
```

State effect to update search query.

```typescript
searchPanelOpen(state: EditorState) → boolean
```

Check if search panel is open.

### Search Cursors

```typescript
class SearchCursor implements Iterator<{from: number, to: number}>
```

Iterator over text matches in a document.

| Constructor Param | Type                                        | Description                         |
| ----------------- | ------------------------------------------- | ----------------------------------- |
| `text`            | `Text`                                      | Document text                       |
| `query`           | `string`                                    | Search string                       |
| `from?`           | `number`                                    | Start position (default: 0)         |
| `to?`             | `number`                                    | End position (default: text.length) |
| `normalize?`      | `fn(string) → string`                       | Text normalization function         |
| `test?`           | `fn(from, to, buffer, bufferPos) → boolean` | Custom match test                   |

| Property/Method     | Type/Description              |
| ------------------- | ----------------------------- |
| `value`             | Current match position        |
| `done`              | Whether iteration is complete |
| `next()`            | Advance to next match         |
| `nextOverlapping()` | Include overlapping matches   |

```typescript
class RegExpCursor implements Iterator<{from: number, to: number, match: RegExpExecArray}>
```

Iterator over regular expression matches.

| Constructor Param | Type                   | Description                         |
| ----------------- | ---------------------- | ----------------------------------- |
| `text`            | `Text`                 | Document text                       |
| `query`           | `string`               | RegExp pattern                      |
| `options?`        | `{ignoreCase?, test?}` | Options for matching                |
| `from?`           | `number`               | Start position (default: 0)         |
| `to?`             | `number`               | End position (default: text.length) |

| Property/Method | Type/Description                             |
| --------------- | -------------------------------------------- |
| `done`          | Whether iteration is complete                |
| `value`         | Current match with position and RegExp match |
| `next()`        | Advance to next match                        |

### Selection Matching

```typescript
highlightSelectionMatches(options?: Object) → Extension
```

Highlight text matching the selection.

| Option                       | Type      | Description                                       |
| ---------------------------- | --------- | ------------------------------------------------- |
| `highlightWordAroundCursor?` | `boolean` | Highlight word at cursor when nothing selected    |
| `minSelectionLength?`        | `number`  | Minimum selection length to highlight. Default: 1 |
| `maxMatches?`                | `number`  | Maximum matches to highlight. Default: 100        |
| `wholeWords?`                | `boolean` | Only highlight whole words                        |

## Autocomplete Package

### Completion Interface

```typescript
interface Completion
```

| Property            | Type                                      | Description                                               |
| ------------------- | ----------------------------------------- | --------------------------------------------------------- |
| `label`             | `string`                                  | Text shown in completion picker and matched against input |
| `displayLabel?`     | `string`                                  | Optional override for visible label                       |
| `detail?`           | `string`                                  | Short information shown after label                       |
| `info?`             | `string \| Function \| Object \| Promise` | Additional info shown when selected                       |
| `apply?`            | `string \| Function`                      | How to apply the completion                               |
| `type?`             | `string`                                  | Type for icon selection                                   |
| `commitCharacters?` | `readonly string[]`                       | Characters that trigger completion if typed               |
| `boost?`            | `number`                                  | Ranking adjustment (-99 to 99)                            |
| `section?`          | `string \| CompletionSection`             | Group completions into sections                           |

```typescript
interface CompletionSection
```

| Property  | Type                        | Description                        |
| --------- | --------------------------- | ---------------------------------- |
| `name`    | `string`                    | Section name, shown above options  |
| `header?` | `fn(section) → HTMLElement` | Custom section header renderer     |
| `rank?`   | `number`                    | Explicit ordering between sections |

### Autocomplete Configuration

```typescript
autocompletion(config?: Object = {}) → Extension
```

| Option                   | Type                          | Description                                      |
| ------------------------ | ----------------------------- | ------------------------------------------------ |
| `activateOnTyping?`      | `boolean`                     | Auto-activate on typing. Default: true           |
| `activateOnCompletion?`  | `fn(completion) → boolean`    | Re-activate after certain completions            |
| `activateOnTypingDelay?` | `number`                      | Delay before activation. Default: 100ms          |
| `selectOnOpen?`          | `boolean`                     | Auto-select first option. Default: true          |
| `override?`              | `readonly CompletionSource[]` | Custom completion sources                        |
| `closeOnBlur?`           | `boolean`                     | Close on editor blur. Default: true              |
| `maxRenderedOptions?`    | `number`                      | Maximum rendered options                         |
| `defaultKeymap?`         | `boolean`                     | Enable default keymap. Default: true             |
| `aboveCursor?`           | `boolean`                     | Show completions above cursor when possible      |
| `tooltipClass?`          | `fn(state) → string`          | Additional CSS class for dialog                  |
| `optionClass?`           | `fn(completion) → string`     | CSS class for options                            |
| `icons?`                 | `boolean`                     | Show type icons. Default: true                   |
| `addToOptions?`          | `Array`                       | Additional content injected into options         |
| `positionInfo?`          | `Function`                    | Custom positioning for info tooltips             |
| `compareCompletions?`    | `fn(a, b) → number`           | Custom sorting function                          |
| `filterStrict?`          | `boolean`                     | Show only completions that start with typed text |
| `interactionDelay?`      | `number`                      | Delay before commands take effect. Default: 75ms |
| `updateSyncTime?`        | `number`                      | Time to wait for slow sources. Default: 100ms    |

### Completion Status

```typescript
completionStatus(state: EditorState) → "active" | "pending" | null
```

Get current completion status.

```typescript
currentCompletions(state: EditorState) → readonly Completion[]
```

Get available completions as array.

```typescript
selectedCompletion(state: EditorState) → Completion | null
```

Get currently selected completion.

```typescript
selectedCompletionIndex(state: EditorState) → number | null
```

Get index of selected completion.

```typescript
setSelectedCompletion(index: number) → StateEffect<unknown>
```

Change selected completion.

```typescript
pickedCompletion: AnnotationType<Completion>
```

Annotation for transactions produced by picking a completion.

### Completion Sources

```typescript
class CompletionContext
```

| Property/Method                              | Type/Description                  |
| -------------------------------------------- | --------------------------------- |
| `state`                                      | Editor state for completion       |
| `pos`                                        | Position where completion happens |
| `explicit`                                   | Whether explicitly activated      |
| `view?`                                      | Editor view if available          |
| `tokenBefore(types)`                         | Get token info before position    |
| `matchBefore(expr)`                          | Match regexp before cursor        |
| `aborted`                                    | Whether query was aborted         |
| `addEventListener(type, listener, options?)` | Register abort handlers           |

```typescript
interface CompletionResult
```

| Property            | Type                    | Description                                  |
| ------------------- | ----------------------- | -------------------------------------------- |
| `from`              | `number`                | Start of range being completed               |
| `to?`               | `number`                | End of range (default: cursor position)      |
| `options`           | `readonly Completion[]` | Available completions                        |
| `validFor?`         | `RegExp \| Function`    | Test to reuse completions for further typing |
| `filter?`           | `boolean`               | Disable automatic filtering and sorting      |
| `getMatch?`         | `Function`              | Custom matching ranges calculator            |
| `update?`           | `Function`              | Sync update after typing/deletion            |
| `map?`              | `Function`              | Map result through document changes          |
| `commitCharacters?` | `readonly string[]`     | Default commit characters for all options    |

```typescript
type CompletionSource = fn(context: CompletionContext) → CompletionResult | Promise<CompletionResult | null> | null
```

Function signature for completion sources.

```typescript
completeFromList(list: readonly (string | Completion)[]) → CompletionSource
```

Create an autocompleter from a fixed list.

```typescript
ifIn(nodes: readonly string[], source: CompletionSource) → CompletionSource
```

Only activate source when cursor is in named syntax nodes.

```typescript
ifNotIn(nodes: readonly string[], source: CompletionSource) → CompletionSource
```

Only activate source when cursor is not in named syntax nodes.

```typescript
completeAnyWord: CompletionSource
```

Word-scanning completion source.

```typescript
insertCompletionText(state: EditorState, text: string, from: number, to: number) → TransactionSpec
```

Helper to insert completion text.

### Autocomplete Commands

| Command                                 | Description                     |
| --------------------------------------- | ------------------------------- |
| `startCompletion`                       | Explicitly start autocompletion |
| `closeCompletion`                       | Close active completion         |
| `acceptCompletion`                      | Accept current completion       |
| `moveCompletionSelection(forward, by?)` | Move completion selection       |

```typescript
completionKeymap: readonly KeyBinding[]
```

Default keybindings:

- Ctrl-Space (Alt-`on macOS):`startCompletion\`
- Escape: `closeCompletion`
- ArrowDown/Up: `moveCompletionSelection`
- PageDown/Up: Page-wise movement
- Enter: `acceptCompletion`

### Snippets

```typescript
snippet(template: string) → Function
```

Convert snippet template to applying function. Syntax:

- `${name}` creates a field with optional default content
- `${}` creates an empty field
- Fields are navigated with Tab/Shift-Tab
- Numbers can set custom field order: `${1}`, `${2:content}`

```typescript
snippetCompletion(template: string, completion: Completion) → Completion
```

Create completion that applies a snippet.

| Command                      | Description                    |
| ---------------------------- | ------------------------------ |
| `nextSnippetField`           | Move to next snippet field     |
| `hasNextSnippetField(state)` | Check for next field           |
| `prevSnippetField`           | Move to previous snippet field |
| `hasPrevSnippetField(state)` | Check for previous field       |
| `clearSnippet`               | Clear the active snippet       |

```typescript
snippetKeymap: Facet<readonly KeyBinding[], readonly KeyBinding[]>
```

Facet for snippet key bindings. Default:

- Tab: `nextSnippetField`
- Shift-Tab: `prevSnippetField`
- Escape: `clearSnippet`

## Bracket Closing

```typescript
interface CloseBracketConfig
```

| Property          | Type       | Description                                                |
| ----------------- | ---------- | ---------------------------------------------------------- |
| `brackets?`       | `string[]` | Brackets to close. Default: `["(", "[", "{", "'", '"']`    |
| `before?`         | `string`   | Characters before which to auto-close. Default: `")]}:;>"` |
| `stringPrefixes?` | `string[]` | Recognized string prefixes                                 |

```typescript
closeBrackets() → Extension
```

Enable bracket-closing behavior.

```typescript
closeBracketsKeymap: readonly KeyBinding[]
```

Binds Backspace to `deleteBracketPair`.

```typescript
deleteBracketPair: StateCommand
```

Delete matching bracket pair when cursor is between brackets.

```typescript
insertBracket(state: EditorState, bracket: string) → Transaction | null
```

Handle custom bracket insertion behavior programmatically.

## Lint Package

### Diagnostic Interface

```typescript
interface Diagnostic
```

| Property         | Type                                       | Description                                  |
| ---------------- | ------------------------------------------ | -------------------------------------------- |
| `from`           | `number`                                   | Start position of issue                      |
| `to`             | `number`                                   | End position of issue                        |
| `severity`       | `"error" \| "hint" \| "info" \| "warning"` | Severity level                               |
| `markClass?`     | `string`                                   | Optional CSS class for marked text           |
| `source?`        | `string`                                   | Source of the diagnostic (linter name)       |
| `message`        | `string`                                   | Diagnostic message text                      |
| `renderMessage?` | `fn(view: EditorView) → Node`              | Custom message renderer                      |
| `actions?`       | `readonly Action[]`                        | Actions that can be taken on this diagnostic |

```typescript
interface Action
```

| Property                                            | Type     | Description                              |
| --------------------------------------------------- | -------- | ---------------------------------------- |
| `name`                                              | `string` | Label shown to user                      |
| `apply(view: EditorView, from: number, to: number)` | `void`   | Function called when action is triggered |

### Linter Configuration

```typescript
lintKeymap: readonly KeyBinding[]
```

Default keybindings:

- Ctrl-Shift-m (Cmd-Shift-m on macOS): `openLintPanel`
- F8: `nextDiagnostic`

```typescript
linter(source: LintSource | null, config?: Object = {}) → Extension
```

Create a linting extension.

| Option           | Type                                                                        | Description                                               |
| ---------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| `delay?`         | `number`                                                                    | Time to wait after changes before linting. Default: 750ms |
| `needsRefresh?`  | `fn(update: ViewUpdate) → boolean`                                          | When diagnostics need recomputing                         |
| `markerFilter?`  | `fn(diagnostics: readonly Diagnostic[], state: EditorState) → Diagnostic[]` | Filter for diagnostics that create markers                |
| `tooltipFilter?` | `fn(diagnostics: readonly Diagnostic[], state: EditorState) → Diagnostic[]` | Filter for tooltip diagnostics                            |
| `hideOn?`        | `fn(tr: Transaction, from: number, to: number) → boolean \| null`           | When to hide tooltip                                      |
| `autoPanel?`     | `boolean`                                                                   | Auto-open/close lint panel. Default: false                |

```typescript
type LintSource = fn(view: EditorView) → readonly Diagnostic[] | Promise<readonly Diagnostic[]>
```

Function type for diagnostic producers.

### Lint Commands

| Function                              | Description                           |
| ------------------------------------- | ------------------------------------- |
| `diagnosticCount(state: EditorState)` | Get count of active diagnostics       |
| `forceLinting(view: EditorView)`      | Force linters to run immediately      |
| `openLintPanel`                       | Open and focus lint panel             |
| `closeLintPanel`                      | Close lint panel                      |
| `nextDiagnostic`                      | Move to next diagnostic               |
| `previousDiagnostic`                  | Move to previous diagnostic           |
| `setDiagnostics(state, diagnostics)`  | Update current diagnostics            |
| `setDiagnosticsEffect`                | State effect for updating diagnostics |
| `forEachDiagnostic(state, fn)`        | Iterate over diagnostics              |

### Lint Gutter

```typescript
lintGutter(config?: Object = {}) → Extension
```

Add gutter showing diagnostic markers.

| Option           | Type                                                                        | Description                        |
| ---------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| `hoverTime?`     | `number`                                                                    | Hover delay before showing tooltip |
| `markerFilter?`  | `fn(diagnostics: readonly Diagnostic[], state: EditorState) → Diagnostic[]` | Filter for gutter markers          |
| `tooltipFilter?` | `fn(diagnostics: readonly Diagnostic[], state: EditorState) → Diagnostic[]` | Filter for tooltip diagnostics     |

## Collaborative Editing Package

Provides support for operational-transform based collaborative editing.

### Collab Extension

```typescript
collab(config?: Object = {}) → Extension
```

Create instance of collaborative editing plugin.

| Option           | Type                                                | Description                               |
| ---------------- | --------------------------------------------------- | ----------------------------------------- |
| `startVersion?`  | `number`                                            | Starting document version. Default: 0     |
| `clientID?`      | `string`                                            | Client identifier. Default: random string |
| `sharedEffects?` | `fn(tr: Transaction) → readonly StateEffect<any>[]` | Share non-document effects                |

### Update Interface

```typescript
interface Update
```

| Property   | Type                          | Description                     |
| ---------- | ----------------------------- | ------------------------------- |
| `changes`  | `ChangeSet`                   | Changes made by this update     |
| `effects?` | `readonly StateEffect<any>[]` | Shared effects in this update   |
| `clientID` | `string`                      | ID of client who created update |

### Collab Methods

| Function                                                                            | Description                                      |
| ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| `receiveUpdates(state: EditorState, updates: readonly Update[]) → Transaction`      | Apply updates received from authority            |
| `sendableUpdates(state: EditorState) → readonly (Update & {origin: Transaction})[]` | Get local updates to send to authority           |
| `rebaseUpdates(updates, over) → readonly Update[]`                                  | Rebase out-of-date updates over accepted changes |
| `getSyncedVersion(state: EditorState) → number`                                     | Get version synchronized with authority          |
| `getClientID(state: EditorState) → string`                                          | Get client's collaborative editing ID            |

## CodeMirror Package

This package bundles core extensions to set up a complete editor.

### Setup Extensions

```typescript
basicSetup: Extension
```

A complete extension bundle including:

- Default command bindings
- Line numbers
- Special character highlighting
- Undo history
- Fold gutter
- Custom selection drawing
- Drop cursor
- Multiple selections
- Reindentation on input
- Default highlight style
- Bracket matching and closing
- Autocompletion
- Rectangular selection and cursor
- Active line highlighting
- Selection match highlighting
- Search
- Linting

```typescript
minimalSetup: Extension
```

Minimal set of extensions:

- Default keymap
- Undo history
- Special character highlighting
- Custom selection drawing
- Default highlight style
