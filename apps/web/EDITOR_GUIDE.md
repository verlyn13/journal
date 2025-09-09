# Journal Editor Guide

## Markdown Editor with Live Preview

The journal now uses a powerful markdown editor with side-by-side preview, combining the simplicity of plain text with rich formatting capabilities.

### Editor Features

#### Writing in Markdown

- **Native Markdown**: Write in standard markdown syntax
- **Syntax Highlighting**: Code mirror provides syntax highlighting for markdown
- **Dark Theme**: Built-in OneDark theme for comfortable editing
- **Live Preview**: See your formatted content in real-time

#### Math Support (KaTeX)

Write mathematical expressions using LaTeX syntax:
- **Inline Math**: Use single dollar signs `$x^2 + y^2 = z^2$`
- **Block Math**: Use double dollar signs for display math
  ```
  $$
  \int_0^1 x^2 dx = \frac{1}{3}
  $$
  ```

#### Code Blocks

Full syntax highlighting for code blocks:
````markdown
```javascript
function hello() {
  console.log("Hello, World!");
}
```
````

Supports all major programming languages with automatic syntax detection.

### Markdown Syntax Quick Reference

#### Headers

```markdown
# H1 Header
## H2 Header
### H3 Header
```

#### Emphasis

```markdown
**bold text**
*italic text*
~~strikethrough~~
```

#### Lists

```markdown
- Bullet point
- Another point
  - Nested point

1. Numbered list
2. Second item
  1. Nested number
```

#### Links and Images

```markdown
[Link text](https://example.com)
![Alt text](image-url.jpg)
```

#### Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

#### Blockquotes

```markdown
> This is a blockquote
> It can span multiple lines
```

#### Horizontal Rule

```markdown
---
```

### Split Pane View

The editor provides a split-pane interface:
- **Left Pane**: Markdown editor with syntax highlighting
- **Right Pane**: Live preview with formatted output
- **Resizable**: Drag the divider to adjust pane sizes
- **Responsive**: Automatically adjusts to screen size

### Keyboard Shortcuts

**Editor Navigation:**
- Standard text editing shortcuts work as expected
- `Ctrl+Z` → Undo
- `Ctrl+Shift+Z` → Redo
- `Ctrl+S` → Save (when applicable)

### Tips for Effective Writing

1. **Structure First**: Start with headers to outline your content
2. **Use Lists**: Break down complex ideas into bullet points
3. **Code Examples**: Include code snippets with proper language tags
4. **Math Notation**: Use LaTeX for mathematical expressions
5. **Preview Check**: Regularly check the preview pane to ensure formatting

### Advantages of Markdown

- **Portable**: Your content is stored as plain text
- **Version Control**: Works perfectly with Git
- **Fast**: No toolbar clicking, just type
- **Consistent**: Same syntax everywhere
- **Future-Proof**: Plain text files last forever

### Common Patterns

#### Daily Journal Entry

```markdown
# Daily Entry - January 4, 2025

## Morning Thoughts
- [ ] Task 1
- [ ] Task 2

## Work Log
### Project A
Progress on feature implementation...

### Code Review
```python
def improved_function():
    # Better implementation
    pass
```

## Evening Reflection

Today was productive because...
```

#### Technical Notes
```markdown
# Technical Investigation: Performance Issue

## Problem
The application experiences slowdown when...

## Analysis
$$
O(n^2) \text{ complexity in the sorting algorithm}
$$

## Solution
Implement a more efficient algorithm...
```

The markdown editor provides a perfect balance between simplicity and power, allowing you to focus on content while maintaining rich formatting capabilities.