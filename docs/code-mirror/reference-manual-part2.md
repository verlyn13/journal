---
title: CodeMirror Reference Manual - Part 2 (View)
description: "Part 2 of the CodeMirror 6 reference manual, covering the view layer, including EditorView, event handling, extending the view, visual features like selection drawing, drop cursor, line highlighting, special characters, whitespace, placeholders, and scrolling."
category: "CodeMirror Reference"
status: active
tags: ["codemirror", "reference", "manual", "view", "dom", "events", "extensions"]
version: "6.0"
---


# CodeMirror View Reference

## Table of Contents

- [CodeMirror View Reference](#codemirror-view-reference)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Core Components](#core-components)
    - [EditorViewConfig Interface](#editorviewconfig-interface)
    - [EditorView Class](#editorview-class)
      - [Constructor](#constructor)
      - [Properties](#properties)
      - [Methods](#methods)
      - [Static Methods \& Properties](#static-methods--properties)
    - [Direction Enum](#direction-enum)
    - [BlockInfo Class](#blockinfo-class)
    - [BlockType Enum](#blocktype-enum)
    - [BidiSpan Class](#bidispan-class)
    - [Rect Interface](#rect-interface)
  - [Event Handling](#event-handling)
    - [DOMEventHandlers Type](#domeventhandlers-type)
    - [DOMEventMap Interface](#domeventmap-interface)
  - [Extending the View](#extending-the-view)
    - [Command Type](#command-type)
    - [ViewPlugin Class](#viewplugin-class)
      - [Static Methods](#static-methods)
    - [PluginValue Interface](#pluginvalue-interface)
    - [PluginSpec Interface](#pluginspec-interface)
    - [ViewUpdate Class](#viewupdate-class)
    - [Error Handling](#error-handling)
    - [Mouse Selection](#mouse-selection)
      - [MouseSelectionStyle Interface](#mouseselectionstyle-interface)
  - [Visual Features](#visual-features)
    - [Selection Drawing](#selection-drawing)
      - [Configuration Options](#configuration-options)
    - [Drop Cursor](#drop-cursor)
    - [Line Highlighting](#line-highlighting)
    - [Special Character Highlighting](#special-character-highlighting)
      - [Configuration Options](#configuration-options-1)
    - [Whitespace Highlighting](#whitespace-highlighting)
    - [Placeholder](#placeholder)
    - [Scrolling](#scrolling)

## Introduction

The "view" is the part of the editor that the user sees—a DOM component that displays the editor state and allows text input.

## Core Components

### EditorViewConfig Interface

The type of object given to the EditorView constructor.

| Property | Type | Description |
|----------|------|-------------|
| `state?` | `EditorState` | The view's initial state. If not given, a new state is created from the config. |
| `parent?` | `Element \| DocumentFragment` | When given, the editor is immediately appended to this element. |
| `root?` | `Document \| ShadowRoot` | The root document or shadow root. Defaults to the global document. |
| `scrollTo?` | `StateEffect<any>` | Set an initial scroll position using an effect from `EditorView.scrollIntoView`. |
| `dispatchTransactions?` | `fn(trs: readonly Transaction[], view: EditorView)` | Override transaction dispatching. |
| `dispatch?` | `fn(tr: Transaction, view: EditorView)` | Deprecated single-transaction version of dispatchTransactions. |

*Extends `EditorStateConfig`*

### EditorView Class

An editor view represents the editor's user interface. It holds the editable DOM surface and other interface elements, handles events, and dispatches state transactions for editing actions.

#### Constructor

| Constructor | Description |
|-------------|-------------|
| `new EditorView(config?: EditorViewConfig = {})` | Construct a new view. You'll need to provide parent or place view.dom in your document. |

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `state` | `EditorState` | The current editor state. |
| `viewport` | `{from: number, to: number}` | The extent of the currently drawn viewport in document positions. |
| `visibleRanges` | `readonly {from: number, to: number}[]` | The subset of the viewport that is actually drawn. |
| `inView` | `boolean` | False when the editor is scrolled out of view or hidden. |
| `composing` | `boolean` | Whether the user is composing text via IME with at least one change made. |
| `compositionStarted` | `boolean` | Whether the user is in composing state. |
| `root` | `DocumentOrShadowRoot` | The document or shadow root that the view lives in. |
| `dom` | `HTMLElement` | The DOM element that wraps the entire editor view. |
| `scrollDOM` | `HTMLElement` | The DOM element that can be styled to scroll. |
| `contentDOM` | `HTMLElement` | The editable DOM element holding the editor content. |
| `documentTop` | `number` | The top position of the document in screen coordinates. |
| `documentPadding` | `{top: number, bottom: number}` | Reports the padding above and below the document. |
| `scaleX` | `number` | CSS transform scale along the X axis, or 1 if not transformed. |
| `scaleY` | `number` | CSS transform scale along the Y axis. |
| `contentHeight` | `number` | The editor's total content height. |
| `defaultCharacterWidth` | `number` | The default width of a character in the editor. |
| `defaultLineHeight` | `number` | The default height of a line in the editor. |
| `textDirection` | `Direction` | The text direction of the editor's content element. |
| `lineWrapping` | `boolean` | Whether this editor wraps lines. |
| `hasFocus` | `boolean` | Check whether the editor has focus. |
| `themeClasses` | `string` | Get the CSS classes for the currently active editor themes. |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `dispatch(tr: Transaction)` | `void` | Update the view with a single transaction. |
| `dispatch(trs: readonly Transaction[])` | `void` | Update the view with multiple transactions. |
| `dispatch(...specs: TransactionSpec[])` | `void` | Update the view with transaction specs. |
| `update(transactions: readonly Transaction[])` | `void` | Update the view for the given array of transactions. |
| `setState(newState: EditorState)` | `void` | Reset the view to the given state. |
| `requestMeasure<T>(request?: Object)` | `void` | Schedule a layout measurement. |
| `plugin<T extends PluginValue>(plugin: ViewPlugin<T>)` | `T \| null` | Get the value of a specific plugin, if present. |
| `elementAtHeight(height: number)` | `BlockInfo` | Find text line or block widget at vertical position. |
| `lineBlockAtHeight(height: number)` | `BlockInfo` | Find line block at the given height. |
| `lineBlockAt(pos: number)` | `BlockInfo` | Find line block around document position. |
| `moveByChar(start: SelectionRange, forward: boolean, by?: Function)` | `SelectionRange` | Move cursor by grapheme cluster. |
| `moveByGroup(start: SelectionRange, forward: boolean)` | `SelectionRange` | Move across group of letters or non-letter characters. |
| `visualLineSide(line: Line, end: boolean)` | `SelectionRange` | Get cursor position at visual start/end of line. |
| `moveToLineBoundary(start: SelectionRange, forward: boolean, includeWrap?: boolean = true)` | `SelectionRange` | Move to next line boundary. |
| `moveVertically(start: SelectionRange, forward: boolean, distance?: number)` | `SelectionRange` | Move cursor position vertically. |
| `domAtPos(pos: number)` | `{node: Node, offset: number}` | Find DOM position at document position. |
| `posAtDOM(node: Node, offset?: number = 0)` | `number` | Find document position at DOM node. |
| `posAtCoords(coords: {x: number, y: number}, precise: false)` | `number` | Get document position at screen coordinates. |
| `posAtCoords(coords: {x: number, y: number})` | `number \| null` | Get position at coordinates or null if outside viewport. |
| `coordsAtPos(pos: number, side?: -1 \| 1 = 1)` | `Rect \| null` | Get screen coordinates at document position. |
| `coordsForChar(pos: number)` | `Rect \| null` | Return rectangle around a character. |
| `textDirectionAt(pos: number)` | `Direction` | Find text direction of block at position. |
| `bidiSpans(line: Line)` | `readonly BidiSpan[]` | Get bidirectional text structure of line. |
| `focus()` | `void` | Put focus on the editor. |
| `setRoot(root: Document \| ShadowRoot)` | `void` | Update the root in which the editor lives. |
| `destroy()` | `void` | Clean up this editor view. |
| `scrollSnapshot()` | `StateEffect<Object>` | Return effect that resets editor to current scroll position. |
| `setTabFocusMode(to?: boolean \| number)` | `void` | Enable/disable tab-focus mode. |

#### Static Methods & Properties

| Method/Property | Type | Description |
|-----------------|------|-------------|
| `scrollIntoView(pos: number \| SelectionRange, options?: Object = {})` | `StateEffect<unknown>` | Returns effect to scroll position into view. |
| `styleModule` | `Facet<StyleModule>` | Facet to add style module to editor view. |
| `domEventHandlers(handlers: DOMEventHandlers<any>)` | `Extension` | Add DOM event handlers. |
| `domEventObservers(observers: DOMEventHandlers<any>)` | `Extension` | Register DOM event observers. |
| `inputHandler` | `Facet<Function>` | Override handling of changes to editable content. |
| `clipboardInputFilter` | `Facet<Function>` | Transform pasted/dropped text. |
| `clipboardOutputFilter` | `Facet<Function>` | Transform copied/dragged text. |
| `scrollHandler` | `Facet<Function>` | Override how elements are scrolled into view. |
| `focusChangeEffect` | `Facet<Function>` | Create effects when focus state changes. |
| `perLineTextDirection` | `Facet<boolean, boolean>` | Read text direction per line instead of document-wide. |
| `exceptionSink` | `Facet<Function>` | Handler for exceptions from extensions. |
| `updateListener` | `Facet<Function>` | Function called on every view update. |
| `editable` | `Facet<boolean, boolean>` | Controls whether editor content DOM is editable. |
| `mouseSelectionStyle` | `Facet<Function>` | Influence mouse selection behavior. |
| `dragMovesSelection` | `Facet<Function>` | Configure whether drag moves or copies selection. |
| `clickAddsSelectionRange` | `Facet<Function>` | Configure whether click adds range or replaces selection. |
| `decorations` | `Facet<DecorationSet \| Function>` | Determines which decorations are shown. |
| `outerDecorations` | `Facet<DecorationSet \| Function>` | Low-precedence decorations. |
| `atomicRanges` | `Facet<Function>` | Ranges treated as atoms for cursor motion. |
| `bidiIsolatedRanges` | `Facet<DecorationSet \| Function>` | Ranges with unicode-bidi: isolate style. |
| `scrollMargins` | `Facet<Function>` | Provide additional scroll margins. |
| `theme(spec: Object<StyleSpec>, options?: {dark?: boolean})` | `Extension` | Create a theme extension. |
| `darkTheme` | `Facet<boolean, boolean>` | Records whether a dark theme is active. |
| `baseTheme(spec: Object<StyleSpec>)` | `Extension` | Add styles to base theme. |
| `cspNonce` | `Facet<string, string>` | Content Security Policy nonce for stylesheets. |
| `contentAttributes` | `Facet<Object \| Function>` | Additional attributes for editable DOM element. |
| `editorAttributes` | `Facet<Object \| Function>` | Attributes for editor's outer element. |
| `lineWrapping` | `Extension` | Enables line wrapping. |
| `announce` | `StateEffectType<string>` | Effect for screen reader announcements. |
| `findFromDOM(dom: HTMLElement)` | `EditorView \| null` | Retrieve editor view from DOM element. |

### Direction Enum

Used to indicate text direction.

| Value | Description |
|-------|-------------|
| `LTR` | Left-to-right. |
| `RTL` | Right-to-left. |

### BlockInfo Class

Record representing information about a block-level element in the editor view.

| Property | Type | Description |
|----------|------|-------------|
| `from` | `number` | The start of the element in the document. |
| `length` | `number` | The length of the element. |
| `top` | `number` | The top position of the element. |
| `height` | `number` | Its height. |
| `type` | `BlockType \| readonly BlockInfo[]` | The type of element or array of blocks for a line. |
| `to` | `number` | The end of the element as a document position. |
| `bottom` | `number` | The bottom position of the element. |
| `widget` | `WidgetType \| null` | Widget associated with a widget block. |
| `widgetLineBreaks` | `number` | Number of line breaks in widgets inside textblock. |

### BlockType Enum

The different types of blocks that can occur in an editor view.

| Value | Description |
|-------|-------------|
| `Text` | A line of text. |
| `WidgetBefore` | A block widget associated with the position after it. |
| `WidgetAfter` | A block widget associated with the position before it. |
| `WidgetRange` | A block widget replacing a range of content. |

### BidiSpan Class

Represents a contiguous range of text with a single direction.

| Property | Type | Description |
|----------|------|-------------|
| `dir` | `Direction` | The direction of this span. |
| `from` | `number` | The start of the span (relative to line start). |
| `to` | `number` | The end of the span. |
| `level` | `number` | The "bidi level" of the span (0=LTR, 1=RTL, 2=LTR in RTL). |

### Rect Interface

Basic rectangle type.

| Property | Type | Description |
|----------|------|-------------|
| `left` | `number` | Left edge position. |
| `right` | `number` | Right edge position. |
| `top` | `number` | Top edge position. |
| `bottom` | `number` | Bottom edge position. |

## Event Handling

### DOMEventHandlers Type

```typescript
type DOMEventHandlers<This> = {
  [event in keyof DOMEventMap]: fn(event: DOMEventMap[event], view: EditorView) → boolean | undefined
}
```

Event handlers are specified with objects mapping event names to handler functions. For event types known by TypeScript, this will infer the appropriate event object type.

### DOMEventMap Interface

Helper type that maps event names to event object types, or the any type for unknown events.

```typescript
interface DOMEventMap extends HTMLElementEventMap {
  [string]: any
}
```

## Extending the View

### Command Type

```typescript
type Command = fn(target: EditorView) → boolean
```

Command functions are used in key bindings and other user actions. They check if they can apply to the editor, perform their effect if possible, and return true if successful.

### ViewPlugin Class

View plugins associate stateful values with a view. They can influence content drawing and react to view events.

| Property | Type | Description |
|----------|------|-------------|
| `extension` | `Extension` | The plugin instance acts as an extension. |

#### Static Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `define<V extends PluginValue>(create: fn(view: EditorView) → V, spec?: PluginSpec<V>)` | `ViewPlugin<V>` | Define plugin from constructor function. |
| `fromClass<V extends PluginValue>(cls: {new (view: EditorView) → V}, spec?: PluginSpec<V>)` | `ViewPlugin<V>` | Create plugin from class. |

### PluginValue Interface

Interface that plugin objects conform to.

| Method | Description |
|--------|-------------|
| `update?(update: ViewUpdate)` | Called when the view updates. Updates plugin state and DOM. |
| `docViewUpdate?(view: EditorView)` | Called when document view updates. |
| `destroy?()` | Called when plugin is no longer used. |

### PluginSpec Interface

Provides additional information when defining a view plugin.

| Property | Type | Description |
|----------|------|-------------|
| `eventHandlers?` | `DOMEventHandlers<V>` | Register event handlers for the plugin. |
| `eventObservers?` | `DOMEventHandlers<V>` | Register event observers for the plugin. |
| `provide?` | `fn(plugin: ViewPlugin<V>) → Extension` | Provide additional extensions. |
| `decorations?` | `fn(value: V) → DecorationSet` | Allow plugin to provide decorations. |

### ViewUpdate Class

Describes what happened when the view is updated.

| Property | Type | Description |
|----------|------|-------------|
| `changes` | `ChangeSet` | The changes made to the document. |
| `startState` | `EditorState` | The previous editor state. |
| `view` | `EditorView` | The editor view associated with the update. |
| `state` | `EditorState` | The new editor state. |
| `transactions` | `readonly Transaction[]` | The transactions involved in the update. |
| `viewportChanged` | `boolean` | Whether viewport or visible ranges changed. |
| `viewportMoved` | `boolean` | True when viewport changed not just due to mapping. |
| `heightChanged` | `boolean` | Whether block element height changed. |
| `geometryChanged` | `boolean` | Whether document was modified or editor size changed. |
| `focusChanged` | `boolean` | Whether focus changed in this update. |
| `docChanged` | `boolean` | Whether document changed. |
| `selectionSet` | `boolean` | Whether selection was explicitly set. |

### Error Handling

| Function | Description |
|----------|-------------|
| `logException(state: EditorState, exception: any, context?: string)` | Log or report unhandled exceptions in client code. |

### Mouse Selection

#### MouseSelectionStyle Interface

Interface for objects registered with `EditorView.mouseSelectionStyle`.

| Method | Returns | Description |
|--------|---------|-------------|
| `get(curEvent: MouseEvent, extend: boolean, multiple: boolean)` | `EditorSelection` | Return new selection for mouse gesture. |
| `update(update: ViewUpdate)` | `boolean \| undefined` | Called when view updates during the gesture. |

## Visual Features

### Selection Drawing

| Function | Returns | Description |
|----------|---------|-------------|
| `drawSelection(config?: Object = {})` | `Extension` | Hides browser's selection and replaces it with custom drawing. |
| `getDrawSelectionConfig(state: EditorState)` | `Object` | Get drawSelection configuration. |

#### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `cursorBlinkRate?` | `number` | Length of cursor blink cycle in ms. Default: 1200. |
| `drawRangeCursor?` | `boolean` | Whether to show cursor for non-empty ranges. Default: true. |

### Drop Cursor

| Function | Returns | Description |
|----------|---------|-------------|
| `dropCursor()` | `Extension` | Draws cursor at current drop position when dragging over editor. |

### Line Highlighting

| Function | Returns | Description |
|----------|---------|-------------|
| `highlightActiveLine()` | `Extension` | Mark lines with cursor using "cm-activeLine" class. |

### Special Character Highlighting

| Function | Returns | Description |
|----------|---------|-------------|
| `highlightSpecialChars(config?: Object = {})` | `Extension` | Enables highlighting of special characters. |

#### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `render?` | `Function` | Custom renderer for placeholder elements. |
| `specialChars?` | `RegExp` | Pattern for characters to highlight. Must have 'g' flag. |
| `addSpecialChars?` | `RegExp` | Pattern to add to default special characters. |

### Whitespace Highlighting

| Function | Returns | Description |
|----------|---------|-------------|
| `highlightWhitespace()` | `Extension` | Highlights spaces and tabs with special classes. |
| `highlightTrailingWhitespace()` | `Extension` | Adds cm-trailingSpace class to trailing whitespace. |

### Placeholder

| Function | Returns | Description |
|----------|---------|-------------|
| `placeholder(content: string \| HTMLElement \| Function)` | `Extension` | Shows placeholder content when editor is empty. |

### Scrolling

| Function | Returns | Description |
|----------|---------|-------------|
| `scrollPastEnd()` | `Extension` | Adds bottom margin to allow scrolling last line to top. |