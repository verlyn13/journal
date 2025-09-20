***

title: CodeMirror Styling Example
description: "Explains how to style CodeMirror editors using custom CSS, themes, base themes, and syntax highlighting, including examples for common styling tasks."
category: "CodeMirror Examples"
status: active
tags: \["codemirror", "example", "styling", "css", "theme", "highlighting"]
version: "6.0"
--------------

# CodeMirror Styling Guide

## Introduction to CodeMirror Styling

CodeMirror uses a CSS-in-JS system that includes styles directly in JavaScript files. This means you don't need to include separate CSS files for the editor to work properly - all necessary styles are automatically imported through the JavaScript module system.

## Styling Methods

There are several ways to style a CodeMirror editor:

1. **Custom CSS** - Writing CSS that targets CodeMirror's class names
2. **Themes** - Creating theme extensions with `EditorView.theme()`
3. **Base Themes** - Providing default styles for extensions with `EditorView.baseTheme()`
4. **Syntax Highlighting** - Defining code highlighting styles with `HighlightStyle`

## DOM Structure

Understanding the editor's DOM structure is essential for effective styling. A typical CodeMirror editor (with gutters and custom selection drawing) has this structure:

```html
<div class="cm-editor [cm-focused] [generated classes]">
  <div class="cm-scroller">
    <div class="cm-gutters">
      <div class="cm-gutter [...]">
        <!-- One gutter element for each line -->
        <div class="cm-gutterElement">...</div>
      </div>
    </div>
    <div class="cm-content" contenteditable="true">
      <!-- The actual document content -->
      <div class="cm-line">Content goes here</div>
      <div class="cm-line">...</div>
    </div>
    <div class="cm-selectionLayer">
      <!-- Positioned rectangles to draw the selection -->
      <div class="cm-selectionBackground"></div>
    </div>
    <div class="cm-cursorLayer">
      <!-- Positioned elements to draw cursors -->
      <div class="cm-cursor"></div>
    </div>
  </div>
</div>
```

## Using Custom CSS

You can target CodeMirror elements with standard CSS selectors. The editor's important elements have stable class names like `cm-editor`, `cm-content`, and `cm-line`.

```css
/* Style the editor when focused */
.cm-editor.cm-focused {
  outline: 2px solid cyan;
}

/* Change the font for editor content */
.cm-editor .cm-content {
  font-family: "Consolas", monospace;
}
```

**Important**: When overriding CodeMirror's injected styles, make your selectors at least as specific as the library's own rules. The library's rules are prefixed with a generated class, so prefixing your selectors with `.cm-editor` is usually sufficient.

## Common Styling Tasks

### Text Styling

You can freely style content text with different fonts, sizes, colors, etc. CodeMirror doesn't require a monospace font or fixed line height.

```css
.cm-editor .cm-content {
  font-family: "Fira Code", monospace;
  font-size: 15px;
  line-height: 1.5;
}
```

### Padding and Margins

To set padding for the document:

- Add vertical padding to `.cm-content`
- Add horizontal padding to `.cm-line`

```css
.cm-editor .cm-content {
  padding-top: 10px;
  padding-bottom: 10px;
}

.cm-editor .cm-line {
  padding-left: 10px;
  padding-right: 10px;
}
```

### Height and Scrolling

By default, the editor grows to fit its content. To make it scrollable with a fixed height:

```css
.cm-editor {
  height: 300px;
}

.cm-editor .cm-scroller {
  overflow: auto;
}
```

For a maximum height with scrolling after that:

```css
.cm-editor {
  max-height: 500px;
}

.cm-editor .cm-scroller {
  overflow: auto;
}
```

For a minimum height (requires a different approach):

```css
.cm-editor .cm-content, 
.cm-editor .cm-gutter {
  min-height: 200px;
}
```

### Line Wrapping

To enable line wrapping, add the `EditorView.lineWrapping` extension to your configuration. While you can manually set `white-space: pre-wrap` on the content element, using the extension is recommended as it handles additional settings.

### Colors

You can adjust colors throughout the editor. When adding background colors to content, use partially transparent colors to avoid hiding other styling (including selection).

```css
.cm-editor {
  background-color: #f8f9fa;
  color: #212529;
}

/* Selection styling */
.cm-editor .cm-selectionBackground {
  background-color: rgba(0, 100, 200, 0.3);
}
```

### Direction

The editor's text direction is automatically derived from the `direction` style of the content DOM.

### Transforms

CodeMirror supports having CSS transforms that do 2D scaling and translation applied to parent elements. Rotation, 3D transformation, or shearing will break the editor.

## Creating Themes

Themes are defined with `EditorView.theme()`. This function takes an object whose properties are CSS selectors and values are styles, returning an extension to install the theme.

```javascript
import {EditorView} from "@codemirror/view"

let myTheme = EditorView.theme({
  "&": {
    color: "white",
    backgroundColor: "#034"
  },
  ".cm-content": {
    caretColor: "#0e9"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#0e9"
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "#074"
  },
  ".cm-gutters": {
    backgroundColor: "#045",
    color: "#ddd",
    border: "none"
  }
}, {dark: true})
```

### Special Theme Syntax

- The `&` character is a placeholder for the outer editor element's selector
- For dark themes, pass `{dark: true}` as the second argument to enable appropriate default styles
- Style both native selection (`.caret-color` and `::selection`) and library-drawn selection (`.cm-cursor` and `.cm-selectionBackground`) for complete theming

## Base Themes

When creating extensions that add DOM elements, include a base theme to provide default styling. Base themes have lower precedence than regular themes and can provide separate rules for dark and light themes.

```javascript
import {EditorView} from "@codemirror/view"

let baseTheme = EditorView.baseTheme({
  ".cm-my-extension": {
    display: "inline-block",
    padding: "2px 4px",
    borderRadius: "3px"
  },
  "&light .cm-my-extension": {
    backgroundColor: "#e0f0ff",
    color: "#0050a0"
  },
  "&dark .cm-my-extension": {
    backgroundColor: "#1a3b5c",
    color: "#c2dbff"
  }
})
```

The `&dark` and `&light` placeholders expand to classes that are only active when the editor's theme is dark or light, allowing for automatic adaptation.

## Syntax Highlighting

Code highlighting uses a different system from editor-wide theming. Highlight styles associate syntax tags with styles.

```javascript
import {tags} from "@lezer/highlight"
import {HighlightStyle, syntaxHighlighting} from "@codemirror/language"

const myHighlightStyle = HighlightStyle.define([
  {tag: tags.keyword, color: "#fc6"},
  {tag: tags.comment, color: "#f5d", fontStyle: "italic"},
  {tag: tags.string, color: "#a5c"},
  {tag: tags.function(tags.variableName), color: "#08f"}
])

// Create an extension that enables the highlighting
const highlighting = syntaxHighlighting(myHighlightStyle)
```

To include your highlight style with a theme, wrap it in `syntaxHighlighting()` to create an extension.

For plain CSS highlighting, use `classHighlightStyle`, which adds static classes like `cmt-keyword` to tokens without defining styles.

## Common Customization Examples

### Fixed-Height Editor

```javascript
import {EditorView} from "@codemirror/view"

const fixedHeightEditor = EditorView.theme({
  "&": {height: "300px"},
  ".cm-scroller": {overflow: "auto"}
})
```

### Minimum Height Editor

```javascript
import {EditorView} from "@codemirror/view"

const minHeightEditor = EditorView.theme({
  ".cm-content, .cm-gutter": {minHeight: "200px"}
})
```

### Custom Selection Colors

```javascript
import {EditorView} from "@codemirror/view"

const customSelection = EditorView.theme({
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(100, 100, 255, 0.3)"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#00c"
  },
  ".cm-content": {
    caretColor: "#00c"
  },
  "::selection": {
    backgroundColor: "rgba(100, 100, 255, 0.3)"
  }
})
```

### Custom Gutter

```javascript
import {EditorView} from "@codemirror/view"

const customGutter = EditorView.theme({
  ".cm-gutters": {
    backgroundColor: "#f5f5f5",
    borderRight: "1px solid #ddd",
    color: "#999"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  }
})
```

## Best Practices

1. **Use partially transparent colors** for backgrounds to avoid hiding other styling
2. **Style both native and drawn selections** for consistent appearance
3. **Test your themes in both light and dark environments** if applicable
4. **Include appropriate highlighting styles** that match your theme
5. **Bundle theme and highlighting together** for user convenience
6. **Keep performance in mind** when applying complex styles to frequently updated elements
7. **Remember the limitations** - certain CSS properties may break the editor

## Conclusion

With CodeMirror's flexible styling system, you can create highly customized editor experiences while maintaining all the functionality of the editor. Whether you're applying simple CSS or creating complete themes with matching syntax highlighting, the library provides the tools you need to make your editor look exactly how you want.
