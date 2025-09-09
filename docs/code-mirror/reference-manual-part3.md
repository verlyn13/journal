---
title: CodeMirror Reference Manual - Part 3
description: "Part 3 of the CodeMirror 6 reference manual, covering extensions, key bindings, decorations, gutters, tooltips, panels, layers, language integration, highlighting, folding, indentation, bracket matching, and stream parsing."
category: "CodeMirror Reference"
status: active
tags: ["codemirror", "reference", "manual", "extensions", "language", "highlighting"]
version: "6.0"
---


# CodeMirror Extensions Reference

## Table of Contents

- [CodeMirror Extensions Reference](#codemirror-extensions-reference)
        - [Table of Contents](#table-of-contents)
        - [Key Bindings](#key-bindings)
        - [KeyBinding Interface](#keybinding-interface)
        - [Keymap Facet](#keymap-facet)
        - [Helpers](#helpers)
        - [Decorations](#decorations)
        - [Decoration Class](#decoration-class)
            - [Static Methods](#static-methods)
            - [Static Properties](#static-properties)
            - [Mark Decoration Options](#mark-decoration-options)
            - [Widget Decoration Options](#widget-decoration-options)
            - [Replace Decoration Options](#replace-decoration-options)
            - [Line Decoration Options](#line-decoration-options)
        - [DecorationSet Type](#decorationset-type)
        - [WidgetType Class](#widgettype-class)
            - [Methods to Implement](#methods-to-implement)
            - [Optional Methods](#optional-methods)
            - [Properties](#properties)
        - [MatchDecorator Class](#matchdecorator-class)
            - [Constructor](#constructor)
            - [Methods](#methods)
        - [Gutters](#gutters)
        - [Line Numbers](#line-numbers)
        - [Gutter Configuration](#gutter-configuration)
        - [GutterMarker Class](#guttermarker-class)
        - [Gutter Facets](#gutter-facets)
        - [Tooltips](#tooltips)
        - [Tooltip Interface](#tooltip-interface)
        - [TooltipView Interface](#tooltipview-interface)
        - [Tooltip Configuration](#tooltip-configuration)
        - [Hover Tooltips](#hover-tooltips)
        - [Panels](#panels)
        - [Panel Interface](#panel-interface)
        - [Panel Management](#panel-management)
        - [Layers](#layers)
        - [Layer Configuration](#layer-configuration)
        - [LayerMarker Interface](#layermarker-interface)
        - [RectangleMarker Class](#rectanglemarker-class)
            - [Constructor](#constructor-1)
            - [Properties](#properties-1)
            - [Static Methods](#static-methods-1)
        - [Rectangular Selection](#rectangular-selection)
        - [Language Integration](#language-integration)
        - [Language Class](#language-class)
            - [Constructor](#constructor-2)
            - [Properties](#properties-2)
            - [Methods](#methods-1)
            - [Properties](#properties-3)
        - [LRLanguage Class](#lrlanguage-class)
            - [Static Methods](#static-methods-2)
            - [Methods](#methods-2)
        - [ParseContext Class](#parsecontext-class)
            - [Properties](#properties-4)
            - [Methods](#methods-3)
            - [Static Methods](#static-methods-3)
        - [Syntax Tree](#syntax-tree)
        - [LanguageSupport Class](#languagesupport-class)
            - [Constructor](#constructor-3)
            - [Properties](#properties-5)
        - [LanguageDescription Class](#languagedescription-class)
            - [Properties](#properties-6)
            - [Methods](#methods-4)
            - [Static Methods](#static-methods-4)
        - [Highlighting](#highlighting)
        - [HighlightStyle Class](#highlightstyle-class)
            - [Properties](#properties-7)
            - [Static Methods](#static-methods-5)
        - [Highlight Configuration](#highlight-configuration)
        - [Folding](#folding)
        - [Fold Services](#fold-services)
        - [Fold Commands](#fold-commands)
        - [Fold Gutter](#fold-gutter)
        - [Low-Level Fold State Management](#low-level-fold-state-management)
        - [Indentation](#indentation)
        - [Indent Services](#indent-services)
        - [IndentContext Class](#indentcontext-class)
            - [Constructor](#constructor-4)
            - [Properties and Methods](#properties-and-methods)
        - [TreeIndentContext Class](#treeindentcontext-class)
            - [Properties and Methods](#properties-and-methods-1)
        - [Indent Helper Functions](#indent-helper-functions)
        - [Bracket Matching](#bracket-matching)
        - [Stream Parser](#stream-parser)
        - [StreamLanguage Class](#streamlanguage-class)
        - [StreamParser Interface](#streamparser-interface)
        - [StringStream Class](#stringstream-class)
            - [Constructor](#constructor-5)
            - [Properties](#properties-8)
            - [Methods](#methods-5)

## Key Bindings

### KeyBinding Interface

Key bindings associate key names with command-style functions.

| Property | Type | Description |
|----------|------|-------------|
| `key?` | `string` | The key name to use for this binding. |
| `mac?` | `string` | Key to use specifically on macOS. |
| `win?` | `string` | Key to use specifically on Windows. |
| `linux?` | `string` | Key to use specifically on Linux. |
| `run?` | `Command` | The command to execute when triggered. |
| `shift?` | `Command` | Defines a second binding with Shift prefix. |
| `any?` | `fn(view: EditorView, event: KeyboardEvent) → boolean` | Called for every key that is not a multi-stroke prefix. |
| `scope?` | `string` | Sets the scope where binding applies (default: "editor"). |
| `preventDefault?` | `boolean` | When true, prevents default handling even if command returns false. |
| `stopPropagation?` | `boolean` | When true, stops event propagation when preventDefault is called. |

Key names may be strings like "Shift-Ctrl-Enter" with modifiers in any order.
- Modifiers: `Shift-` (or `s-`), `Alt-` (or `a-`), `Ctrl-` (or `c-` or `Control-`), and `Cmd-` (or `m-` or `Meta-`)
- Use `Mod-` as shorthand for `Cmd-` on Mac and `Ctrl-` elsewhere
- Multi-stroke bindings use spaces between key names

### Keymap Facet

```typescript
keymap: Facet<readonly KeyBinding[]>
```

Facet for registering keymaps, which can be added to an editor with extensions like `keymap.of(...)`. Multiple keymaps can be added, with precedence determining their order (earlier/higher precedence checked first).

### Helpers

```typescript
runScopeHandlers(view: EditorView, event: KeyboardEvent, scope: string) → boolean
```

Run the key handlers registered for a given scope. Returns true if any handler handled the event.

## Decorations

Decorations allow you to influence how content is drawn by providing styling or replacing content with alternative representations.

### Decoration Class

Provides information on how to draw or style content. Always used wrapped in a Range.

#### Static Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `mark(spec: Object)` | `Decoration` | Create a mark decoration for styling content in its range. |
| `widget(spec: Object)` | `Decoration` | Create a widget decoration for displaying a DOM element at a position. |
| `replace(spec: Object)` | `Decoration` | Create a decoration that replaces a range with a widget or hides it. |
| `line(spec: Object)` | `Decoration` | Create a line decoration to add DOM attributes to a line. |
| `set(of: Range<Decoration> \| readonly Range<Decoration>[], sort?: boolean = false)` | `DecorationSet` | Build a DecorationSet from ranges. |

#### Static Properties

| Property | Type | Description |
|----------|------|-------------|
| `none` | `DecorationSet` | The empty set of decorations. |

#### Mark Decoration Options

| Option | Type | Description |
|--------|------|-------------|
| `inclusive?` | `boolean` | Whether the mark covers its boundaries. Default: false. |
| `inclusiveStart?` | `boolean` | Whether the start is inclusive. |
| `inclusiveEnd?` | `boolean` | Whether the end is inclusive. |
| `attributes?` | `Object<string>` | Attributes to add to the DOM elements. |
| `class?` | `string` | Shorthand for `{attributes: {class: value}}`. |
| `tagName?` | `string` | Element to wrap the text in. |
| `bidiIsolate?` | `Direction` | Direction for bidirectional isolation. |

#### Widget Decoration Options

| Option | Type | Description |
|--------|------|-------------|
| `widget` | `WidgetType` | The type of widget to draw. |
| `side?` | `number` | Which side of the position the widget is on. Default: 0. |
| `inlineOrder?` | `boolean` | Controls ordering between block and inline widgets. |
| `block?` | `boolean` | Whether this is a block widget. Default: false. |

#### Replace Decoration Options

| Option | Type | Description |
|--------|------|-------------|
| `widget?` | `WidgetType` | Optional widget to draw in place of content. |
| `inclusive?` | `boolean` | Whether range covers its boundaries. |
| `inclusiveStart?` | `boolean` | Whether the start is inclusive. |
| `inclusiveEnd?` | `boolean` | Whether the end is inclusive. |
| `block?` | `boolean` | Whether this is a block-level decoration. Default: false. |

#### Line Decoration Options

| Option | Type | Description |
|--------|------|-------------|
| `attributes?` | `Object<string>` | DOM attributes to add to the line wrapper. |
| `class?` | `string` | Shorthand for `{attributes: {class: value}}`. |

### DecorationSet Type

```typescript
type DecorationSet = RangeSet<Decoration>
```

A collection of decorated ranges organized for efficient access and mapping. See `RangeSet` for methods.

### WidgetType Class

Abstract class that describes widgets added to the content. Subclass this to create custom widgets.

#### Methods to Implement

| Method | Returns | Description |
|--------|---------|-------------|
| `toDOM(view: EditorView)` | `HTMLElement` | Build the DOM structure for this widget. |

#### Optional Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `eq(widget: WidgetType)` | `boolean` | Compare with another instance. Default just returns false. |
| `updateDOM(dom: HTMLElement, view: EditorView)` | `boolean` | Update existing DOM for this widget. Return true if successful. |
| `ignoreEvent(event: Event)` | `boolean` | Configure which events to ignore. Default ignores all. |
| `coordsAt(dom: HTMLElement, pos: number, side: number)` | `Rect \| null` | Override how screen coordinates are found. |
| `destroy(dom: HTMLElement)` | `void` | Called when widget is removed. |

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `estimatedHeight` | `number` | Estimated height for measuring. Default: -1 (unknown). |
| `lineBreaks` | `number` | Line breaks introduced by inline widget. Default: 0. |

### MatchDecorator Class

Helper class to maintain decorations on visible code matching a regular expression.

#### Constructor

```typescript
new MatchDecorator(config: Object)
```

| Config Option | Type | Description |
|---------------|------|-------------|
| `regexp` | `RegExp` | Regular expression to match (needs 'g' flag). |
| `decoration?` | `Decoration \| Function` | Decoration to apply or function to create it. |
| `decorate?` | `Function` | Custom function to create decorations for matches. |
| `boundary?` | `RegExp` | Boundary expression to reduce re-matching. |
| `maxLength?` | `number` | Maximum additional invisible content to include. Default: 1000. |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `createDeco(view: EditorView)` | `RangeSet<Decoration>` | Compute decorations for viewport matches. |
| `updateDeco(update: ViewUpdate, deco: DecorationSet)` | `DecorationSet` | Update decorations after a view update. |

## Gutters

Functionality for showing "gutters" (for line numbers or other annotations) on the side of the editor.

### Line Numbers

```typescript
lineNumbers(config?: Object = {}) → Extension
```

Create a line number gutter extension.

| Config Option | Type | Description |
|---------------|------|-------------|
| `formatNumber?` | `fn(lineNo: number, state: EditorState) → string` | Custom line number formatter. |
| `domEventHandlers?` | `Object<Function>` | DOM event handlers for gutter. |

```typescript
highlightActiveLineGutter() → Extension
```

Returns extension that adds `cm-activeLineGutter` class to gutter elements on the active line.

### Gutter Configuration

```typescript
gutter(config: Object) → Extension
```

Define an editor gutter. Multiple gutters appear in order of extension priority.

| Config Option | Type | Description |
|---------------|------|-------------|
| `class?` | `string` | Extra CSS class for the wrapper element. |
| `renderEmptyElements?` | `boolean` | Whether to render empty gutter elements. Default: false. |
| `markers?` | `fn(view: EditorView) → RangeSet<GutterMarker> \| readonly RangeSet<GutterMarker>[]` | Get markers for this gutter. |
| `lineMarker?` | `fn(view: EditorView, line: BlockInfo, otherMarkers: readonly GutterMarker[]) → GutterMarker \| null` | Add marker to every line. |
| `widgetMarker?` | `fn(view: EditorView, widget: WidgetType, block: BlockInfo) → GutterMarker \| null` | Associate markers with block widgets. |
| `lineMarkerChange?` | `fn(update: ViewUpdate) → boolean` | Predicate for when to update line markers. |
| `initialSpacer?` | `fn(view: EditorView) → GutterMarker` | Add hidden spacer element for base width. |
| `updateSpacer?` | `fn(spacer: GutterMarker, update: ViewUpdate) → GutterMarker` | Update spacer on view update. |
| `domEventHandlers?` | `Object<Function>` | Event handlers for this gutter. |

```typescript
gutters(config?: {fixed?: boolean}) → Extension
```

Configure the gutter-drawing plugin. Unless `fixed` is explicitly set to false, gutters will be fixed (not scrolling horizontally with content).

### GutterMarker Class

Abstract class for gutter markers that attach information to a line in a specific gutter.

| Method | Returns | Description |
|--------|---------|-------------|
| `eq(other: GutterMarker)` | `boolean` | Compare with another marker of same type. |
| `toDOM?(view: EditorView)` | `Node` | Render DOM node for marker if needed. |
| `destroy(dom: Node)` | `void` | Called when marker is removed. |

| Property | Type | Description |
|----------|------|-------------|
| `elementClass` | `string` | CSS classes for the gutter element. |

### Gutter Facets

```typescript
gutterLineClass: Facet<RangeSet<GutterMarker>>
```

Adds a class to all gutter elements for a given line.

```typescript
gutterWidgetClass: Facet<Function>
```

Adds a class to gutter elements next to a widget.

```typescript
lineNumberMarkers: Facet<RangeSet<GutterMarker>>
```

Provides markers to the line number gutter.

```typescript
lineNumberWidgetMarker: Facet<Function>
```

Creates markers in the line number gutter next to widgets.

## Tooltips

Tooltips are DOM elements overlaid on the editor near a given document position.

### Tooltip Interface

| Property | Type | Description |
|----------|------|-------------|
| `pos` | `number` | Document position to show the tooltip at. |
| `end?` | `number` | End of the range annotated by this tooltip. |
| `create` | `fn(view: EditorView) → TooltipView` | Function that creates the tooltip's DOM. |
| `above?` | `boolean` | Whether to show tooltip above target position. Default: false. |
| `strictSide?` | `boolean` | Whether to strictly follow `above` even with limited space. Default: false. |
| `arrow?` | `boolean` | Whether to show a connecting triangle. Default: false. |
| `clip?` | `boolean` | Whether tooltip should be hidden when outside view. Default: true. |

### TooltipView Interface

| Property/Method | Type/Returns | Description |
|-----------------|--------------|-------------|
| `dom` | `HTMLElement` | The DOM element to position over the editor. |
| `offset?` | `{x: number, y: number}` | Adjust tooltip position relative to anchor. |
| `getCoords?` | `fn(pos: number) → Rect` | Custom positioning function. |
| `overlap?` | `boolean` | Whether to disable anti-overlap behavior. Default: false. |
| `mount?` | `fn(view: EditorView)` | Called after tooltip is added to DOM. |
| `update?` | `fn(update: ViewUpdate)` | Update DOM for view state change. |
| `destroy?` | `fn()` | Called when tooltip is removed. |
| `positioned?` | `fn(space: Rect)` | Called when tooltip is positioned. |
| `resize?` | `boolean` | Whether to disable automatic size restriction. Default: true. |

### Tooltip Configuration

```typescript
tooltips(config?: Object = {}) → Extension
```

| Config Option | Type | Description |
|---------------|------|-------------|
| `position?` | `"fixed" \| "absolute"` | Positioning method. Default: "fixed". |
| `parent?` | `HTMLElement` | Element to put tooltips into. Default: editor element. |
| `tooltipSpace?` | `fn(view: EditorView) → Rect` | Function that returns available tooltip space. |

```typescript
showTooltip: Facet<Tooltip | null>
```

Facet to add tooltips to the editor.

```typescript
getTooltip(view: EditorView, tooltip: Tooltip) → TooltipView | null
```

Get the active tooltip view for a given tooltip.

### Hover Tooltips

```typescript
hoverTooltip(source: HoverTooltipSource, options?: Object = {}) → Extension
```

Set up tooltips that appear when mouse hovers over ranges of text.

| Option | Type | Description |
|--------|------|-------------|
| `hideOn?` | `fn(tr: Transaction, tooltip: Tooltip) → boolean` | Controls when transactions hide tooltip. Default: don't hide. |
| `hideOnChange?` | `boolean \| "touch"` | Hide tooltip on doc changes or selection. Default: false. |
| `hoverTime?` | `number` | Hover time before tooltip appears (ms). Default: 300ms. |

```typescript
type HoverTooltipSource = fn(view: EditorView, pos: number, side: -1 | 1) → Tooltip | Array | Promise | null
```

The function type used as hover tooltip source.

```typescript
hasHoverTooltips(state: EditorState) → boolean
```

Returns true if any hover tooltips are currently active.

```typescript
closeHoverTooltips: StateEffect<null>
```

Transaction effect that closes all hover tooltips.

```typescript
repositionTooltips(view: EditorView)
```

Recalculates position of active tooltips after layout changes.

## Panels

Panels are UI elements positioned above or below the editor.

### Panel Interface

| Property/Method | Type/Returns | Description |
|-----------------|--------------|-------------|
| `dom` | `HTMLElement` | Element representing the panel. Will get "cm-panel" class. |
| `mount?` | `fn()` | Called after panel is added to editor. |
| `update?` | `fn(update: ViewUpdate)` | Update DOM for view update. |
| `destroy?` | `fn()` | Called when panel is removed. |
| `top?` | `boolean` | Whether panel should be at top or bottom. Default: false. |

### Panel Management

```typescript
showPanel: Facet<PanelConstructor | null>
```

Facet for opening a panel by providing a constructor function.

```typescript
type PanelConstructor = fn(view: EditorView) → Panel
```

Function type for initializing a panel.

```typescript
getPanel(view: EditorView, panel: PanelConstructor) → Panel | null
```

Get active panel created by constructor, if any.

```typescript
panels(config?: Object) → Extension
```

| Config Option | Type | Description |
|---------------|------|-------------|
| `topContainer?` | `HTMLElement` | Override top panel container. |
| `bottomContainer?` | `HTMLElement` | Override bottom panel container. |

## Layers

Layers are DOM elements drawn over or below document text without taking space or affecting layout.

### Layer Configuration

```typescript
layer(config: Object) → Extension
```

Define a layer.

| Config Option | Type | Description |
|---------------|------|-------------|
| `above` | `boolean` | Whether shown above or below text. |
| `class?` | `string` | CSS class for wrapper element. |
| `update` | `fn(update: ViewUpdate, layer: HTMLElement) → boolean` | Called on updates. Return true to trigger marker update. |
| `updateOnDocViewUpdate?` | `boolean` | Whether to update when doc view changes. Default: true. |
| `markers` | `fn(view: EditorView) → readonly LayerMarker[]` | Build and measure markers for layer. |
| `mount?` | `fn(layer: HTMLElement, view: EditorView)` | Called on layer creation. |
| `destroy?` | `fn(layer: HTMLElement, view: EditorView)` | Called when layer is removed. |

### LayerMarker Interface

Markers shown in a layer. Created during measuring phase with all positioning information.

| Method | Returns | Description |
|--------|---------|-------------|
| `eq(other: LayerMarker)` | `boolean` | Compare to avoid unnecessary redraws. |
| `draw()` | `HTMLElement` | Draw marker to the DOM. |
| `update?(dom: HTMLElement, oldMarker: LayerMarker)` | `boolean` | Update existing marker. Return true if successful. |

### RectangleMarker Class

Implementation of LayerMarker for rectangular markers.

#### Constructor

```typescript
new RectangleMarker(className: string, left: number, top: number, width: number | null, height: number)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `left` | `number` | Left position (px, document-relative). |
| `top` | `number` | Top position (px). |
| `width` | `number \| null` | Width (px) or null for no width style. |
| `height` | `number` | Height (px). |

#### Static Methods

```typescript
static forRange(view: EditorView, className: string, range: SelectionRange) → readonly RectangleMarker[]
```

Create rectangle set for a selection range with given class.

## Rectangular Selection

```typescript
rectangularSelection(options?: Object) → Extension
```

Enable rectangular selections, by default using Alt+mouse drag.

| Option | Type | Description |
|--------|------|-------------|
| `eventFilter?` | `fn(event: MouseEvent) → boolean` | Custom predicate for rectangular selection. |

```typescript
crosshairCursor(options?: {key?: "Alt" | "Control" | "Shift" | "Meta"} = {}) → Extension
```

Shows crosshair cursor when specified modifier key (default: Alt) is held down.

## Language Integration

### Language Class

Manages parsing and per-language metadata, with parse data as a Lezer tree.

#### Constructor

```typescript
new Language(data: Facet<Object<any>>, parser: Parser, extraExtensions?: Extension[] = [], name?: string = "")
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `extension` | `Extension` | Extension to install as document language. |
| `parser` | `Parser` | The parser object. |
| `data` | `Facet<Object<any>>` | The language data facet. |
| `name` | `string` | A language name. |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `isActiveAt(state: EditorState, pos: number, side?: -1 \| 0 \| 1 = -1)` | `boolean` | Check if language is active at position. |
| `findRegions(state: EditorState)` | `{from: number, to: number}[]` | Find document regions parsed with this language. |

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `allowsNesting` | `boolean` | Whether language allows nested languages. Default: true. |

### LRLanguage Class

Subclass of Language for Lezer LR parsers.

#### Static Methods

```typescript
static define(spec: Object) → LRLanguage
```

Define a language from a parser.

| Property | Type | Description |
|----------|------|-------------|
| `name?` | `string` | The language name. |
| `parser` | `LRParser` | The parser to use. |
| `languageData?` | `Object<any>` | Language data to register. |

#### Methods

```typescript
configure(options: ParserConfig, name?: string) → LRLanguage
```

Create new instance with reconfigured parser.

### ParseContext Class

Context provided to parsers working on editor content.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `state` | `EditorState` | The current editor state. |
| `fragments` | `readonly TreeFragment[]` | Tree fragments for incremental parsing. |
| `viewport` | `{from: number, to: number}` | Current editor viewport. |

#### Methods

```typescript
skipUntilInView(from: number, to: number)
```

Mark region as skipped because not in view.

#### Static Methods

```typescript
static getSkippingParser(until?: Promise<unknown>) → Parser
```

Get placeholder parser for async loading.

```typescript
static get() → ParseContext | null
```

Get context for current parse.

### Syntax Tree

```typescript
syntaxTree(state: EditorState) → Tree
```

Get syntax tree for editor state.

```typescript
ensureSyntaxTree(state: EditorState, upto: number, timeout?: number = 50) → Tree | null
```

Try to get parse tree up to given position, with timeout.

```typescript
syntaxTreeAvailable(state: EditorState, upto?: number = state.doc.length) → boolean
```

Check if full syntax tree is available up to position.

```typescript
forceParsing(view: EditorView, upto?: number = view.viewport.to, timeout?: number = 100) → boolean
```

Parse forward and update editor state, working for at most timeout milliseconds.

```typescript
syntaxParserRunning(view: EditorView) → boolean
```

Check if language parser is planning more work.

### LanguageSupport Class

Bundles a language with supporting extensions.

#### Constructor

```typescript
new LanguageSupport(language: Language, support?: Extension = [])
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `extension` | `Extension` | Combined extension with language and support. |
| `language` | `Language` | The language object. |
| `support` | `Extension` | Supporting extensions. |

### LanguageDescription Class

Stores metadata about languages and handles dynamic loading.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Language name. |
| `alias` | `readonly string[]` | Alternative names (lowercased, includes name). |
| `extensions` | `readonly string[]` | Associated file extensions. |
| `filename` | `RegExp \| undefined` | Optional filename pattern. |
| `support` | `LanguageSupport \| undefined` | Loaded language support if available. |

#### Methods

```typescript
load() → Promise<LanguageSupport>
```

Start loading the language.

#### Static Methods

```typescript
static of(spec: Object) → LanguageDescription
```

Create a language description.

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The language name. |
| `alias?` | `readonly string[]` | Alternative names. |
| `extensions?` | `readonly string[]` | File extensions. |
| `filename?` | `RegExp` | Filename pattern. |
| `load?` | `fn() → Promise<LanguageSupport>` | Async loader function. |
| `support?` | `LanguageSupport` | Already loaded support. |

```typescript
static matchFilename(descs: readonly LanguageDescription[], filename: string) → LanguageDescription | null
```

Find language matching filename in descriptions.

```typescript
static matchLanguageName(descs: readonly LanguageDescription[], name: string, fuzzy?: boolean = true) → LanguageDescription | null
```

Find language by name or alias.

## Highlighting

### HighlightStyle Class

Associates CSS styles with highlighting tags.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `module` | `StyleModule \| null` | Style module with CSS rules. |
| `specs` | `readonly TagStyle[]` | The tag styles in this highlighter. |

#### Static Methods

```typescript
static define(specs: readonly TagStyle[], options?: Object) → HighlightStyle
```

Create highlighter style associating styles with tags.

| Option | Type | Description |
|--------|------|-------------|
| `scope?` | `Language \| NodeType` | Scope to a single language. |
| `all?` | `string \| StyleSpec` | Style for all content. |
| `themeType?` | `"dark" \| "light"` | Theme type this style applies to. |

### Highlight Configuration

```typescript
syntaxHighlighting(highlighter: Highlighter, options?: Object) → Extension
```

Apply syntax highlighting to editor content.

| Option | Type | Description |
|--------|------|-------------|
| `fallback` | `boolean` | Mark highlighter as fallback. |

```typescript
interface TagStyle
```

Assigns style to highlighting tags.

| Property | Type | Description |
|----------|------|-------------|
| `tag` | `Tag \| readonly Tag[]` | The tag(s) to target. |
| `class?` | `string` | Fixed class name for these tags. |
| `[property: string]` | `any` | Style properties (if class isn't given). |

```typescript
defaultHighlightStyle: HighlightStyle
```

Default highlight style for light themes.

```typescript
highlightingFor(state: EditorState, tags: readonly Tag[], scope?: NodeType) → string | null
```

Get CSS classes for highlighting tags and scope.

```typescript
bidiIsolates(options?: Object = {}) → Extension
```

Ensure proper rendering of bidirectional text isolation.

| Option | Type | Description |
|--------|------|-------------|
| `alwaysIsolate?` | `boolean` | Force isolation even in uniform LTR text. |

## Folding

### Fold Services

```typescript
foldService: Facet<Function>
```

Facet for code folding services that provide foldable ranges.

```typescript
foldNodeProp: NodeProp<Function>
```

Node prop for fold information on syntax nodes.

```typescript
foldInside(node: SyntaxNode) → {from: number, to: number} | null
```

Fold everything but first and last child of a node.

```typescript
foldable(state: EditorState, lineStart: number, lineEnd: number) → {from: number, to: number} | null
```

Check if line is foldable, consulting services and node props.

### Fold Commands

```typescript
foldCode: Command
```

Fold selected lines if possible.

```typescript
unfoldCode: Command
```

Unfold folded ranges on selected lines.

```typescript
toggleFold: Command
```

Toggle folding at cursor positions.

```typescript
foldAll: Command
```

Fold all top-level foldable ranges.

```typescript
unfoldAll: Command
```

Unfold all folded code.

```typescript
foldKeymap: readonly KeyBinding[]
```

Default fold-related key bindings:
- Ctrl-Shift-[ (Cmd-Alt-[ on macOS): foldCode
- Ctrl-Shift-] (Cmd-Alt-] on macOS): unfoldCode
- Ctrl-Alt-[: foldAll
- Ctrl-Alt-]: unfoldAll

```typescript
codeFolding(config?: Object) → Extension
```

Configure code folding.

| Option | Type | Description |
|--------|------|-------------|
| `placeholderDOM?` | `Function` | Custom function for fold placeholder elements. |
| `placeholderText?` | `string` | Text for folded code. Default: "…" |
| `preparePlaceholder?` | `Function` | Create custom placeholder value for a range. |

### Fold Gutter

```typescript
foldGutter(config?: Object = {}) → Extension
```

Add fold gutter with indicators.

| Option | Type | Description |
|--------|------|-------------|
| `markerDOM?` | `fn(open: boolean) → HTMLElement` | Custom markers for fold status. |
| `openText?` | `string` | Text for lines that can be folded. Default: "⌄" |
| `closedText?` | `string` | Text for folded lines. Default: "›" |
| `domEventHandlers?` | `Object<Function>` | Event handlers for gutter. |
| `foldingChanged?` | `fn(update: ViewUpdate) → boolean` | When to recompute fold markers. |

### Low-Level Fold State Management

```typescript
foldedRanges(state: EditorState) → DecorationSet
```

Get a range set containing the folded ranges.

```typescript
foldState: StateField<DecorationSet>
```

State field that stores folded ranges as a decoration set.

```typescript
foldEffect: StateEffectType<{from: number, to: number}>
```

State effect to fold a range.

```typescript
unfoldEffect: StateEffectType<{from: number, to: number}>
```

State effect to unfold a range.

## Indentation

### Indent Services

```typescript
indentService: Facet<fn(context: IndentContext, pos: number) → number | null | undefined>
```

Facet for indent functions that compute appropriate indentation depth at a position.

```typescript
indentNodeProp: NodeProp<fn(context: TreeIndentContext) → number | null>
```

Node prop for indentation strategies associated with node types.

```typescript
getIndentation(context: IndentContext | EditorState, pos: number) → number | null
```

Get indentation at position, consulting services and node props.

```typescript
indentRange(state: EditorState, from: number, to: number) → ChangeSet
```

Create change set that auto-indents lines in range.

```typescript
indentUnit: Facet<string, string>
```

Facet for indentation unit, defaults to 2 spaces.

```typescript
getIndentUnit(state: EditorState) → number
```

Get column width of indent unit in state.

```typescript
indentString(state: EditorState, cols: number) → string
```

Create indentation string for given column count.

### IndentContext Class

Used when calling indentation services, providing helpers for indentation logic.

#### Constructor

```typescript
new IndentContext(state: EditorState, options?: Object = {})
```

| Option | Type | Description |
|--------|------|-------------|
| `overrideIndentation?` | `fn(pos: number) → number` | Override line indentation for position. |
| `simulateBreak?` | `number` | Position of simulated line break. |
| `simulateDoubleBreak?` | `boolean` | Treat break as double line break. |

#### Properties and Methods

| Property/Method | Type/Returns | Description |
|-----------------|--------------|-------------|
| `unit` | `number` | Indent unit column count. |
| `state` | `EditorState` | The editor state. |
| `lineAt(pos: number, bias?: -1 \| 1 = 1)` | `{text: string, from: number}` | Get line at position, considering simulated breaks. |
| `textAfterPos(pos: number, bias?: -1 \| 1 = 1)` | `string` | Get text after position. |
| `column(pos: number, bias?: -1 \| 1 = 1)` | `number` | Find column for position. |
| `countColumn(line: string, pos?: number = line.length)` | `number` | Find column position in string. |
| `lineIndent(pos: number, bias?: -1 \| 1 = 1)` | `number` | Find indentation column of line. |
| `simulatedBreak` | `number \| null` | Simulated line break position. |

### TreeIndentContext Class

Context information for node-based indentation strategies.

#### Properties and Methods

| Property/Method | Type/Returns | Description |
|-----------------|--------------|-------------|
| `pos` | `number` | Position for indentation calculation. |
| `node` | `SyntaxNode` | Syntax node for indentation strategy. |
| `textAfter` | `string` | Text after position. |
| `baseIndent` | `number` | Indentation for reference line. |
| `baseIndentFor(node: SyntaxNode)` | `number` | Get indentation for node's reference line. |
| `continue()` | `number \| null` | Continue indentation search in parent nodes. |

### Indent Helper Functions

```typescript
delimitedIndent({closing: string, align?: boolean, units?: number}) → fn(context: TreeIndentContext) → number
```

Indentation strategy for bracketed nodes. Aligns with opening token when `align` is true.

```typescript
continuedIndent({except?: RegExp, units?: number} = {}) → fn(context: TreeIndentContext) → number
```

Indentation strategy for continued lines, indenting one unit more than base indentation.

```typescript
flatIndent(context: TreeIndentContext) → number
```

Indentation strategy that aligns content to base indentation.

```typescript
indentOnInput() → Extension
```

Enables reindentation on input matching language's indentOnInput pattern.

## Bracket Matching

```typescript
bracketMatching(config?: Config = {}) → Extension
```

Enables bracket matching, highlighting matching pairs.

| Option | Type | Description |
|--------|------|-------------|
| `afterCursor?` | `boolean` | Look at character after cursor. Default: true. |
| `brackets?` | `string` | Bracket characters as pairs. Default: "()[]{}". |
| `maxScanDistance?` | `number` | Maximum distance to scan. Default: 10000. |
| `renderMatch?` | `fn(match: MatchResult, state: EditorState) → readonly Range<Decoration>[]` | Custom decoration for matches. |

```typescript
matchBrackets(state: EditorState, pos: number, dir: -1 | 1, config?: Config = {}) → MatchResult | null
```

Find matching bracket at position.

```typescript
interface MatchResult
```

| Property | Type | Description |
|----------|------|-------------|
| `start` | `{from: number, to: number}` | Extent of bracket token found. |
| `end?` | `{from: number, to: number}` | Extent of matched token if found. |
| `matched` | `boolean` | Whether tokens match. |

```typescript
bracketMatchingHandle: NodeProp<fn(node: SyntaxNode) → SyntaxNode | null>
```

Define 'handle' part of large syntax nodes for highlighting.

## Stream Parser

### StreamLanguage Class

Language based on CodeMirror 5-style streaming parser.

```typescript
static define<State>(spec: StreamParser<State>) → StreamLanguage<State>
```

Define a stream language from parser spec.

### StreamParser Interface

Stream parser tokenizes content emitting token styles.

| Property/Method | Type/Returns | Description |
|-----------------|--------------|-------------|
| `name?` | `string` | Language name. |
| `startState?` | `fn(indentUnit: number) → State` | Create initial parser state. |
| `token` | `fn(stream: StringStream, state: State) → string \| null` | Read one token, advancing stream. |
| `blankLine?` | `fn(state: State, indentUnit: number)` | Handle blank line. |
| `copyState?` | `fn(state: State) → State` | Copy parser state. |
| `indent?` | `fn(state: State, textAfter: string, context: IndentContext) → number \| null` | Compute indentation. |
| `languageData?` | `Object<any>` | Default language data. |
| `tokenTable?` | `Object<Tag \| readonly Tag[]>` | Map token names to tags. |
| `mergeTokens?` | `boolean` | Whether to merge adjacent tokens of same type. |

### StringStream Class

Encapsulates a single line of input for stream parsers.

#### Constructor

```typescript
new StringStream(string: string, tabSize: number, indentUnit: number, overrideIndent?: number)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `pos` | `number` | Current position on the line. |
| `start` | `number` | Start position of current token. |
| `string` | `string` | The line. |
| `indentUnit` | `number` | Indent unit size. |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `eol()` | `boolean` | Check if at end of line. |
| `sol()` | `boolean` | Check if at start of line. |
| `peek()` | `string \| undefined` | Get next character without advancing. |
| `next()` | `string \| undefined` | Read next character and advance. |
| `eat(match: string \| RegExp \| Function)` | `string \| undefined` | Try to match and consume next character. |
| `eatWhile(match: string \| RegExp \| Function)` | `boolean` | Match and consume characters while matching. |
| `eatSpace()` | `boolean` | Consume whitespace ahead. |
| `skipToEnd()` | `void` | Move to end of line. |
| `skipTo(ch: string)` | `boolean \| undefined` | Move to before specified character. |
| `backUp(n: number)` | `void` | Move back n characters. |
| `column()` | `number` | Get column position at current position. |
| `indentation()` | `number` | Get indentation column of current line. |
| `match(pattern: string \| RegExp, consume?: boolean, caseInsensitive?: boolean)` | `boolean \| RegExpMatchArray \| null` | Match against string or regexp. |
| `current()` | `string` | Get current token text. |