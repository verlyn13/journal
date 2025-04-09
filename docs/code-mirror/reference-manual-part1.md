# CodeMirror Reference Manual

## Table of Contents

- [CodeMirror Reference Manual](#codemirror-reference-manual)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Basic Setup](#basic-setup)
  - [EditorState](#editorstate)
    - [EditorStateConfig Interface](#editorstateconfig-interface)
    - [EditorState Class](#editorstate-class)
      - [Properties](#properties)
      - [Methods](#methods)
      - [Static Methods](#static-methods)
      - [Static Facets](#static-facets)
    - [Selection](#selection)
      - [SelectionRange Class](#selectionrange-class)
      - [EditorSelection Class](#editorselection-class)
      - [CharCategory Enum](#charcategory-enum)
  - [Text](#text)
    - [Text Class](#text-class)
    - [Line Class](#line-class)
    - [TextIterator Interface](#textiterator-interface)
    - [Column Utilities](#column-utilities)
    - [Code Points and Characters](#code-points-and-characters)
  - [Changes and Transactions](#changes-and-transactions)
    - [TransactionSpec Interface](#transactionspec-interface)
    - [ChangeSpec Type](#changespec-type)
    - [Transaction Class](#transaction-class)
    - [ChangeDesc Class](#changedesc-class)
    - [MapMode Enum](#mapmode-enum)
    - [ChangeSet Class](#changeset-class)
    - [Annotations](#annotations)
      - [Annotation Class](#annotation-class)
      - [AnnotationType Class](#annotationtype-class)
    - [State Effects](#state-effects)
      - [StateEffect Class](#stateeffect-class)
      - [StateEffectType Class](#stateeffecttype-class)
  - [Extending Editor State](#extending-editor-state)
    - [State Commands](#state-commands)
    - [Extensions](#extensions)
    - [State Fields](#state-fields)
      - [StateField Class](#statefield-class)
    - [Facets](#facets)
      - [Facet Class](#facet-class)
      - [FacetReader Interface](#facetreader-interface)
    - [Precedence](#precedence)
    - [Compartments](#compartments)
      - [Compartment Class](#compartment-class)
  - [Range Sets](#range-sets)
    - [RangeValue Class](#rangevalue-class)
    - [Range Class](#range-class)
    - [RangeSet Class](#rangeset-class)
    - [RangeCursor Interface](#rangecursor-interface)
    - [RangeSetBuilder Class](#rangesetbuilder-class)
    - [RangeComparator Interface](#rangecomparator-interface)
    - [SpanIterator Interface](#spaniterator-interface)
  - [Utilities](#utilities)

## Introduction

CodeMirror is published as a set of NPM packages under the @codemirror scope. This reference guide documents the core packages.

Each package exposes ECMAScript and CommonJS modules that require a bundler or loader to run in the browser.

The most important modules are:
- **state**: Contains the data structures that model the editor state
- **view**: Provides the UI component for an editor

## Basic Setup

A minimal editor setup:

```javascript
import {EditorView, keymap} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"

let myView = new EditorView({
  doc: "hello",
  extensions: [keymap.of(defaultKeymap)],
  parent: document.body
})
```

This minimal editor is quite primitive. For functionality like highlighting, line numbers, or undo history, additional extensions are needed.

For a quick start, the `codemirror` package provides a bundle of extensions to set up a functioning editor.

## EditorState

An editor's state consists of a current document and a selection. Extensions can add additional fields to the state object.

### EditorStateConfig Interface

Options passed when creating an editor state:

| Property | Type | Description |
|----------|------|-------------|
| `doc?` | `string \| Text` | The initial document. Defaults to an empty document. Can be a plain string (split into lines according to `lineSeparator` facet) or a `Text` instance. |
| `selection?` | `EditorSelection \| {anchor: number, head?: number}` | The starting selection. Defaults to a cursor at the document start. |
| `extensions?` | `Extension` | Extension(s) to associate with this state. |

### EditorState Class

The editor state class is a persistent (immutable) data structure. To update a state, you create a transaction, which produces a new state instance without modifying the original.

**Important**: Never mutate properties of a state directly.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `doc` | `Text` | The current document. |
| `selection` | `EditorSelection` | The current selection. |
| `tabSize` | `number` | Size (in columns) of a tab in the document, determined by the tabSize facet. |
| `lineBreak` | `string` | The proper line-break string for this state. |
| `readOnly` | `boolean` | Returns true when the editor is configured to be read-only. |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `field<T>(field: StateField<T>)` | `T` | Retrieve the value of a state field. Throws an error when the state doesn't have that field, unless you pass false as second parameter. |
| `field<T>(field: StateField<T>, require: false)` | `T \| undefined` | Same as above, but returns undefined if field doesn't exist. |
| `update(...specs: readonly TransactionSpec[])` | `Transaction` | Create a transaction that updates this state. |
| `replaceSelection(text: string \| Text)` | `TransactionSpec` | Create a transaction spec that replaces every selection range with the given content. |
| `changeByRange(f: Function)` | `Object` | Create a set of changes and a new selection by running a function for each range in the active selection. |
| `changes(spec?: ChangeSpec = [])` | `ChangeSet` | Create a change set from the given change description. |
| `toText(string: string)` | `Text` | Using the state's line separator, create a Text instance from the given string. |
| `sliceDoc(from?: number = 0, to?: number = this.doc.length)` | `string` | Return the given range of the document as a string. |
| `facet<Output>(facet: FacetReader<Output>)` | `Output` | Get the value of a state facet. |
| `toJSON(fields?: Object<StateField<any>>)` | `any` | Convert this state to a JSON-serializable object. |
| `phrase(phrase: string, ...insert: any[])` | `string` | Look up a translation for the given phrase via the phrases facet. |
| `languageDataAt<T>(name: string, pos: number, side?: -1 \| 0 \| 1 = -1)` | `readonly T[]` | Find values for a given language data field. |
| `charCategorizer(at: number)` | `Function` | Return a function that categorizes characters as Word, Space, or Other. |
| `wordAt(pos: number)` | `SelectionRange \| null` | Find the word at the given position. |

#### Static Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `fromJSON(json: any, config?: EditorStateConfig = {}, fields?: Object<StateField<any>>)` | `EditorState` | Deserialize a state from its JSON representation. |
| `create(config?: EditorStateConfig = {})` | `EditorState` | Create a new state. |

#### Static Facets

| Facet | Type | Description |
|-------|------|-------------|
| `allowMultipleSelections` | `Facet<boolean, boolean>` | When enabled, allows the editor to have multiple selection ranges. |
| `tabSize` | `Facet<number, number>` | Configures the tab size. Defaults to 4. |
| `lineSeparator` | `Facet<string, string \| undefined>` | The line separator to use. |
| `readOnly` | `Facet<boolean, boolean>` | Controls whether editing functionality should disable itself. |
| `phrases` | `Facet<Object<string>>` | Registers translation phrases. |
| `languageData` | `Facet<Function>` | Used to register language data providers. |
| `changeFilter` | `Facet<Function>` | Register change filters that can suppress parts of transactions. |
| `transactionFilter` | `Facet<Function>` | Hook that updates or replaces transaction specs before they are applied. |
| `transactionExtender` | `Facet<Function>` | Limited form of transactionFilter that can only add annotations and effects. |

### Selection

#### SelectionRange Class

A single selection range. When `allowMultipleSelections` is enabled, a selection may hold multiple ranges.

| Property | Type | Description |
|----------|------|-------------|
| `from` | `number` | The lower boundary of the range. |
| `to` | `number` | The upper boundary of the range. |
| `anchor` | `number` | The anchor of the range—the side that doesn't move when you extend it. |
| `head` | `number` | The head of the range, which is moved when the range is extended. |
| `empty` | `boolean` | True when anchor and head are at the same position. |
| `assoc` | `-1 \| 0 \| 1` | If this is a cursor associated with a character, returns the side. |
| `bidiLevel` | `number \| null` | The bidirectional text level associated with this cursor. |
| `goalColumn` | `number \| undefined` | The goal column (stored vertical offset) associated with a cursor. |

**Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `map(change: ChangeDesc, assoc?: number = -1)` | `SelectionRange` | Map this range through a change. |
| `extend(from: number, to?: number = from)` | `SelectionRange` | Extend this range to cover at least from to to. |
| `eq(other: SelectionRange, includeAssoc?: boolean = false)` | `boolean` | Compare this range to another range. |
| `toJSON()` | `any` | Return a JSON-serializable representation. |

**Static Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `fromJSON(json: any)` | `SelectionRange` | Convert a JSON representation to a SelectionRange. |

#### EditorSelection Class

An editor selection holds one or more selection ranges.

| Property | Type | Description |
|----------|------|-------------|
| `ranges` | `readonly SelectionRange[]` | The ranges in the selection, sorted by position. |
| `mainIndex` | `number` | The index of the main range in the selection. |
| `main` | `SelectionRange` | Get the primary selection range. |

**Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `map(change: ChangeDesc, assoc?: number = -1)` | `EditorSelection` | Map a selection through a change. |
| `eq(other: EditorSelection, includeAssoc?: boolean = false)` | `boolean` | Compare this selection to another selection. |
| `asSingle()` | `EditorSelection` | Make sure the selection only has one range. |
| `addRange(range: SelectionRange, main?: boolean = true)` | `EditorSelection` | Extend this selection with an extra range. |
| `replaceRange(range: SelectionRange, which?: number = this.mainIndex)` | `EditorSelection` | Replace a given range with another range. |
| `toJSON()` | `any` | Convert to JSON-serializable object. |

**Static Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `fromJSON(json: any)` | `EditorSelection` | Create a selection from a JSON representation. |
| `single(anchor: number, head?: number = anchor)` | `EditorSelection` | Create a selection holding a single range. |
| `create(ranges: readonly SelectionRange[], mainIndex?: number = 0)` | `EditorSelection` | Sort and merge ranges into a valid selection. |
| `cursor(pos: number, assoc?: number = 0, bidiLevel?: number, goalColumn?: number)` | `SelectionRange` | Create a cursor selection range. |
| `range(anchor: number, head: number, goalColumn?: number, bidiLevel?: number)` | `SelectionRange` | Create a selection range. |

#### CharCategory Enum

Categories produced by a character categorizer:

| Value | Description |
|-------|-------------|
| `Word` | Word characters. |
| `Space` | Whitespace. |
| `Other` | Anything else. |

## Text

The `Text` type stores documents in an immutable tree-shaped representation that allows efficient indexing, structure-sharing updates, and access to portions without copying strings.

Line numbers start at 1. Character positions are counted from zero, counting each line break and UTF-16 code unit as one unit.

### Text Class

The data structure for documents. Implements `Iterable<string>`.

| Property | Type | Description |
|----------|------|-------------|
| `length` | `number` | The length of the string. |
| `lines` | `number` | The number of lines in the string (always >= 1). |
| `children` | `readonly Text[] \| null` | For branch nodes, holds the Text objects it consists of. For leaf nodes, this is null. |

**Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `lineAt(pos: number)` | `Line` | Get the line description around the given position. |
| `line(n: number)` | `Line` | Get the description for the given (1-based) line number. |
| `replace(from: number, to: number, text: Text)` | `Text` | Replace a range of the text with the given content. |
| `append(other: Text)` | `Text` | Append another document to this one. |
| `slice(from: number, to?: number = this.length)` | `Text` | Retrieve the text between the given points. |
| `sliceString(from: number, to?: number, lineSep?: string)` | `string` | Retrieve a part of the document as a string. |
| `eq(other: Text)` | `boolean` | Test whether this text is equal to another instance. |
| `iter(dir?: 1 \| -1 = 1)` | `TextIterator` | Iterate over the text. |
| `iterRange(from: number, to?: number = this.length)` | `TextIterator` | Iterate over a range of the text. |
| `iterLines(from?: number, to?: number)` | `TextIterator` | Iterate over a range of lines. |
| `toString()` | `string` | Return the document as a string. |
| `toJSON()` | `string[]` | Convert the document to an array of lines. |

**Static Methods/Properties**:

| Method/Property | Type/Returns | Description |
|-----------------|--------------|-------------|
| `of(text: readonly string[])` | `Text` | Create a Text instance for the given array of lines. |
| `empty` | `Text` | The empty document. |

### Line Class

Describes a line in the document. Created on-demand when lines are queried.

| Property | Type | Description |
|----------|------|-------------|
| `from` | `number` | The position of the start of the line. |
| `to` | `number` | The position at the end of the line. |
| `number` | `number` | This line's line number (1-based). |
| `text` | `string` | The line's content. |
| `length` | `number` | The length of the line (not including line break). |

### TextIterator Interface

Iterates over a sequence of strings. When iterating over a Text document, results will be lines or line breaks.

| Property/Method | Type/Returns | Description |
|-----------------|--------------|-------------|
| `next(skip?: number)` | `TextIterator` | Retrieve the next string. |
| `value` | `string` | The current string. |
| `done` | `boolean` | Whether the end of the iteration has been reached. |
| `lineBreak` | `boolean` | Whether the current string represents a line break. |

### Column Utilities

Functions for handling column-based positioning:

| Function | Returns | Description |
|----------|---------|-------------|
| `countColumn(string: string, tabSize: number, to?: number = string.length)` | `number` | Count the column position, accounting for tabs. |
| `findColumn(string: string, col: number, tabSize: number, strict?: boolean)` | `number` | Find the offset for a given column position. |

### Code Points and Characters

Functions for handling Unicode characters:

| Function | Returns | Description |
|----------|---------|-------------|
| `codePointAt(str: string, pos: number)` | `number` | Find the code point at a position (like `String.codePointAt`). |
| `fromCodePoint(code: number)` | `string` | Create a string from a code point (like `String.fromCodePoint`). |
| `codePointSize(code: number)` | `1 \| 2` | The positions a character takes in a JavaScript string. |
| `findClusterBreak(str: string, pos: number, forward?: boolean = true, includeExtending?: boolean = true)` | `number` | Returns the next grapheme cluster break position. |

## Changes and Transactions

CodeMirror treats document changes as objects, usually part of a transaction.

Example of making a change:

```javascript
let state = EditorState.create({doc: "hello world"})
let transaction = state.update({changes: {from: 6, to: 11, insert: "editor"}})
console.log(transaction.state.doc.toString()) // "hello editor"
```

### TransactionSpec Interface

Describes a transaction for `EditorState.update`:

| Property | Type | Description |
|----------|------|-------------|
| `changes?` | `ChangeSpec` | The changes to the document. |
| `selection?` | `EditorSelection \| {anchor: number, head?: number} \| undefined` | Updates the selection. Offsets refer to the document after changes. |
| `effects?` | `StateEffect<any> \| readonly StateEffect<any>[]` | Attach state effects to the transaction. |
| `annotations?` | `Annotation<any> \| readonly Annotation<any>[]` | Set annotations for this transaction. |
| `userEvent?` | `string` | Shorthand for `annotations: Transaction.userEvent.of(...)`. |
| `scrollIntoView?` | `boolean` | Whether to scroll the selection into view. |
| `filter?` | `boolean` | Set to false to disable change and transaction filters. |
| `sequential?` | `boolean` | When true, positions in changes refer to document after previous specs' changes. |

### ChangeSpec Type

Describes document changes:

```typescript
type ChangeSpec = {from: number, to?: number, insert?: string | Text} |
                 ChangeSet |
                 readonly ChangeSpec[]
```

Can be a plain object describing a change, a change set, or an array of change specs.

### Transaction Class

Groups changes to the editor state. Created by calling `EditorState.update` or dispatched with `EditorView.dispatch`.

| Property | Type | Description |
|----------|------|-------------|
| `startState` | `EditorState` | The state from which the transaction starts. |
| `changes` | `ChangeSet` | The document changes made by this transaction. |
| `selection` | `EditorSelection \| undefined` | The selection set by this transaction, or undefined. |
| `effects` | `readonly StateEffect<any>[]` | The effects added to the transaction. |
| `scrollIntoView` | `boolean` | Whether the selection should be scrolled into view. |
| `newDoc` | `Text` | The new document produced by the transaction. |
| `newSelection` | `EditorSelection` | The new selection produced by the transaction. |
| `state` | `EditorState` | The new state created by the transaction. |
| `docChanged` | `boolean` | Indicates whether the transaction changed the document. |
| `reconfigured` | `boolean` | Indicates whether this transaction reconfigures the state. |

**Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `annotation<T>(type: AnnotationType<T>)` | `T \| undefined` | Get the value of the given annotation type. |
| `isUserEvent(event: string)` | `boolean` | Returns true if the transaction has a user event annotation that matches. |

**Static Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `time` | `AnnotationType<number>` | Annotation for transaction timestamps. Automatically added with `Date.now()`. |
| `userEvent` | `AnnotationType<string>` | Associates a transaction with a UI event. |
| `addToHistory` | `AnnotationType<boolean>` | Controls whether a transaction should be added to undo history. |
| `remote` | `AnnotationType<boolean>` | Indicates a change made by another actor, not the user. |

### ChangeDesc Class

A change description is a variant of change set that doesn't store inserted text.

| Property | Type | Description |
|----------|------|-------------|
| `length` | `number` | The length of the document before the change. |
| `newLength` | `number` | The length of the document after the change. |
| `empty` | `boolean` | False when there are actual changes in this set. |
| `invertedDesc` | `ChangeDesc` | Description of the inverted form of these changes. |

**Methods**:

| Method | Returns/Type | Description |
|--------|--------------|-------------|
| `iterGaps(f: Function)` | `void` | Iterate over unchanged parts left by these changes. |
| `iterChangedRanges(f: Function, individual?: boolean = false)` | `void` | Iterate over the ranges changed by these changes. |
| `composeDesc(other: ChangeDesc)` | `ChangeDesc` | Compute combined effect of applying another set after this one. |
| `mapDesc(other: ChangeDesc, before?: boolean = false)` | `ChangeDesc` | Map this description over another set of changes. |
| `mapPos(pos: number, assoc?: number)` | `number` | Map a position through these changes. |
| `mapPos(pos: number, assoc: number, mode: MapMode)` | `number \| null` | Map a position with specified mode. |
| `touchesRange(from: number, to?: number = from)` | `boolean \| "cover"` | Check if changes touch a given range. |
| `toJSON()` | `readonly number[]` | Serialize to JSON. |

**Static Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `fromJSON(json: any)` | `ChangeDesc` | Create from JSON representation. |

### MapMode Enum

Distinguishes different ways positions can be mapped:

| Value | Description |
|-------|-------------|
| `Simple` | Map a position to a valid new position, even when its context was deleted. |
| `TrackDel` | Return null if deletion happens across the position. |
| `TrackBefore` | Return null if the character before the position is deleted. |
| `TrackAfter` | Return null if the character after the position is deleted. |

### ChangeSet Class

Extends `ChangeDesc` to represent a group of document modifications.

**Methods** (in addition to those from `ChangeDesc`):

| Method | Returns | Description |
|--------|---------|-------------|
| `apply(doc: Text)` | `Text` | Apply the changes to a document. |
| `invert(doc: Text)` | `ChangeSet` | Create a change set representing the inverse of this set. |
| `compose(other: ChangeSet)` | `ChangeSet` | Combine two subsequent change sets. |
| `map(other: ChangeDesc, before?: boolean = false)` | `ChangeSet` | Map this change set over another. |
| `iterChanges(f: Function, individual?: boolean = false)` | `void` | Iterate over changed ranges, including inserted text. |

**Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `desc` | `ChangeDesc` | Get a change description for this change set. |

**Static Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `of(changes: ChangeSpec, length: number, lineSep?: string)` | `ChangeSet` | Create a change set from given changes. |
| `empty(length: number)` | `ChangeSet` | Create an empty changeset. |
| `fromJSON(json: any)` | `ChangeSet` | Create from JSON representation. |

### Annotations

Annotations add metadata to transactions.

#### Annotation Class

| Property | Type | Description |
|----------|------|-------------|
| `type` | `AnnotationType<T>` | The annotation type. |
| `value` | `T` | The value of this annotation. |

**Static Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `define<T>()` | `AnnotationType<T>` | Define a new type of annotation. |

#### AnnotationType Class

| Method | Returns | Description |
|--------|---------|-------------|
| `of(value: T)` | `Annotation<T>` | Create an instance of this annotation. |

### State Effects

State effects represent additional effects associated with a transaction, often for custom state fields.

#### StateEffect Class

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Value` | The value of this effect. |

**Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `map(mapping: ChangeDesc)` | `StateEffect<Value> \| undefined` | Map through a position mapping. |
| `is<T>(type: StateEffectType<T>)` | `boolean` | Check if this effect is of a given type. |

**Static Methods/Properties**:

| Method/Property | Type/Returns | Description |
|-----------------|--------------|-------------|
| `define<Value = null>(spec?: Object = {})` | `StateEffectType<Value>` | Define a new effect type. |
| `mapEffects(effects: readonly StateEffect<any>[], mapping: ChangeDesc)` | `readonly StateEffect<any>[]` | Map effects through a change set. |
| `reconfigure` | `StateEffectType<Extension>` | Reconfigure root extensions. |
| `appendConfig` | `StateEffectType<Extension>` | Append extensions to top-level config. |

#### StateEffectType Class

| Method | Returns | Description |
|--------|---------|-------------|
| `of(value: Value)` | `StateEffect<Value>` | Create an effect instance. |

## Extending Editor State

### State Commands

```typescript
type StateCommand = fn(
  target: {state: EditorState, dispatch: fn(transaction: Transaction)}
) → boolean
```

A subtype of `Command` that doesn't require access to the editor view.

### Extensions

```typescript
type Extension = {extension: Extension} | readonly Extension[]
```

Extensions configure and add behavior to the editor state. They can be nested in arrays and will be flattened when processed.

### State Fields

Fields store additional information in an editor state and keep it synchronized.

#### StateField Class

| Method/Property | Returns/Type | Description |
|-----------------|--------------|-------------|
| `init(create: fn(state: EditorState) → Value)` | `Extension` | Override initialization of this field. |
| `extension` | `Extension` | Use the field as an extension. |

**Static Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `define<Value>(config: Object)` | `StateField<Value>` | Define a state field with configuration options. |

### Facets

Facets are labeled values associated with editor state, combining inputs from extensions.

#### Facet Class

| Property | Type | Description |
|----------|------|-------------|
| `reader` | `FacetReader<Output>` | Returns a facet reader for this facet. |

**Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `of(value: Input)` | `Extension` | Returns an extension that adds the value to this facet. |
| `compute(deps: readonly [...], get: fn(state: EditorState) → Input)` | `Extension` | Create an extension that computes a facet value from state. |
| `computeN(deps: readonly [...], get: fn(state: EditorState) → readonly Input[])` | `Extension` | Create an extension that computes multiple values. |
| `from<T extends Input>(field: StateField<T>)` | `Extension` | Register a facet source from a state field. |
| `from<T>(field: StateField<T>, get: fn(value: T) → Input)` | `Extension` | Register with a getter function. |

**Static Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `define<Input, Output = readonly Input[]>(config?: Object = {})` | `Facet<Input, Output>` | Define a new facet with configuration options. |

#### FacetReader Interface

| Property | Type | Description |
|----------|------|-------------|
| `tag` | `Output` | Dummy TypeScript type marker (not actually present). |

### Precedence

The `Prec` object controls the ordering of extensions. Extensions with higher precedence come before those with lower precedence.

| Method | Returns | Description |
|--------|---------|-------------|
| `highest(ext: Extension)` | `Extension` | Highest precedence level. |
| `high(ext: Extension)` | `Extension` | Higher-than-default precedence. |
| `default(ext: Extension)` | `Extension` | Default precedence. |
| `low(ext: Extension)` | `Extension` | Lower-than-default precedence. |
| `lowest(ext: Extension)` | `Extension` | Lowest precedence level. |

### Compartments

Extension compartments make configuration dynamic by allowing parts to be replaced through transactions.

#### Compartment Class

| Method | Returns | Description |
|--------|---------|-------------|
| `of(ext: Extension)` | `Extension` | Create an instance to add to your state configuration. |
| `reconfigure(content: Extension)` | `StateEffect<unknown>` | Create an effect that reconfigures this compartment. |
| `get(state: EditorState)` | `Extension \| undefined` | Get current content of the compartment in the state. |

## Range Sets

Range sets hold collections of tagged, possibly overlapping ranges that can be mapped through document changes.

### RangeValue Class

Base class for values associated with ranges.

| Property | Type | Description |
|----------|------|-------------|
| `startSide` | `number` | Bias value at the start of the range. Defaults to 0. |
| `endSide` | `number` | Bias value at the end of the range. Defaults to 0. |
| `mapMode` | `MapMode` | How the range location should be mapped when empty. Defaults to `MapMode.TrackDel`. |
| `point` | `boolean` | Whether this value marks a point range. |

**Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `eq(other: RangeValue)` | `boolean` | Compare this value with another. Default is identity comparison. |
| `range(from: number, to?: number = from)` | `Range<RangeValue>` | Create a range with this value. |

### Range Class

Associates a value with a range of positions.

| Property | Type | Description |
|----------|------|-------------|
| `from` | `number` | The range's start position. |
| `to` | `number` | Its end position. |
| `value` | `T` | The value associated with this range. |

### RangeSet Class

Stores ranges efficiently for mapping and updating.

| Property | Type | Description |
|----------|------|-------------|
| `size` | `number` | The number of ranges in the set. |

**Methods**:

| Method | Returns | Description |
|--------|---------|-------------|
| `update<U extends T>(updateSpec: Object)` | `RangeSet<T>` | Update the range set. |
| `map(changes: ChangeDesc)` | `RangeSet<T>` | Map this range set through changes. |
| `between(from: number, to: number, f: Function)` | `void` | Iterate over ranges that touch a region. |
| `iter(from?: number = 0)` | `RangeCursor<T>` | Iterate over ranges in order. |

**Static Methods/Properties**:

| Method/Property | Type/Returns | Description |
|-----------------|--------------|-------------|
| `iter<T extends RangeValue>(sets: readonly RangeSet<T>[], from?: number = 0)` | `RangeCursor<T>` | Iterate over ranges in multiple sets. |
| `compare<T extends RangeValue>(oldSets: readonly RangeSet<T>[], newSets: readonly RangeSet<T>[], textDiff: ChangeDesc, comparator: RangeComparator<T>, minPointSize?: number = -1)` | `void` | Compare two sets of ranges. |
| `eq<T extends RangeValue>(oldSets: readonly RangeSet<T>[], newSets: readonly RangeSet<T>[], from?: number = 0, to?: number)` | `boolean` | Compare contents of range sets. |
| `spans<T extends RangeValue>(sets: readonly RangeSet<T>[], from: number, to: number, iterator: SpanIterator<T>, minPointSize?: number = -1)` | `number` | Iterate over sets, notifying about covered regions. |
| `of<T extends RangeValue>(ranges: readonly Range<T>[] \| Range<T>, sort?: boolean = false)` | `RangeSet<T>` | Create range set from ranges. |
| `join<T extends RangeValue>(sets: readonly RangeSet<T>[])` | `RangeSet<T>` | Join array of range sets. |
| `empty` | `RangeSet<any>` | The empty set of ranges. |

### RangeCursor Interface

Object that moves to the next range each time you call `next`. Note that these start out pointing at the first element.

| Property/Method | Type/Returns | Description |
|-----------------|--------------|-------------|
| `next()` | `void` | Move the iterator forward. |
| `value` | `T \| null` | The next range's value. Null at the end. |
| `from` | `number` | The next range's start position. |
| `to` | `number` | The next end position. |

### RangeSetBuilder Class

Helps build up a range set directly, without first allocating an array of Range objects.

| Method | Returns | Description |
|--------|---------|-------------|
| `new RangeSetBuilder()` | `RangeSetBuilder<T>` | Create an empty builder. |
| `add(from: number, to: number, value: T)` | `void` | Add a range. Should be added in sorted order. |
| `finish()` | `RangeSet<T>` | Finish the range set. |

### RangeComparator Interface

Methods used when comparing range sets:

| Method | Type | Description |
|--------|------|-------------|
| `compareRange(from: number, to: number, activeA: T[], activeB: T[])` | `void` | Notifies when a range has different values in old vs new sets. |
| `comparePoint(from: number, to: number, pointA: T \| null, pointB: T \| null)` | `void` | Notification for a changed point range. |
| `boundChange?: fn(pos: number)` | `void` | Notification for a changed boundary. |

### SpanIterator Interface

Used when iterating over spans created by a set of ranges:

| Method | Type | Description |
|--------|------|-------------|
| `span(from: number, to: number, active: readonly T[], openStart: number)` | `void` | Called for ranges not covered by point decorations. |
| `point(from: number, to: number, value: T, active: readonly T[], openStart: number, index: number)` | `void` | Called when going over a point decoration. |

## Utilities

| Function | Returns | Description |
|----------|---------|-------------|
| `combineConfig<Config extends object>(configs: readonly Partial<Config>[], defaults: Partial<Config>, combine?: object = {})` | `Config` | Utility for combining behaviors to fill a config object from configs array. |