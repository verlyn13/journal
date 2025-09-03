# Journal Editor Guide

## How Math & Code Work

### Math Rendering (Automatic)

The editor automatically renders math using KaTeX when you type:

- **Inline Math**: Type `$$x^2 + y^2 = z^2$$` and it renders immediately as math
- **Block Math**: Type `$$$` on a new line to create a math block, then type your LaTeX

Examples:
```
$$E = mc^2$$                    → Renders inline
$$\int_0^1 x^2 dx$$            → Renders inline

$$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$$                             → Renders as block
```

### Code Blocks (Monaco Editor)

Three ways to create code blocks:

1. **Slash Command**: Type `/code` and select "Code Block"
2. **Keyboard Shortcut**: Press `Ctrl+Alt+C`
3. **Markdown Style**: Type ` ``` ` on a new line

The code block uses Monaco Editor (VS Code's editor) with:
- Syntax highlighting for 50+ languages
- Auto-detection of language based on content
- Full IDE features (autocomplete, etc.)

### Markdown-Style Input

The editor supports these markdown patterns that convert automatically:

- `# ` → Heading 1
- `## ` → Heading 2
- `### ` → Heading 3
- `**text**` → Bold
- `*text*` → Italic
- `` `code` `` → Inline code
- `- ` or `* ` → Bullet list
- `1. ` → Numbered list
- `> ` → Blockquote
- `---` → Horizontal rule

### Slash Commands

Type `/` to see all available commands:
- `/daily` → Daily reflection template
- `/meeting` → Meeting notes template
- `/h1`, `/h2`, `/h3` → Headings
- `/bullet` → Bullet list
- `/code` → Code block
- `/math` → Math block
- And more...

### Keyboard Shortcuts

**Text Formatting:**
- `Ctrl+B` → Bold
- `Ctrl+I` → Italic
- `Ctrl+E` → Inline code
- `Ctrl+Shift+S` → Strikethrough
- `Ctrl+K` → Create link

**Headings:**
- `Ctrl+Alt+1` → Heading 1
- `Ctrl+Alt+2` → Heading 2
- `Ctrl+Alt+3` → Heading 3

**Lists:**
- `Ctrl+Shift+8` → Bullet list
- `Ctrl+Shift+7` → Numbered list
- `Tab` → Indent list item
- `Shift+Tab` → Outdent list item

**Other:**
- `Ctrl+Alt+C` → Code block
- `Ctrl+Z` → Undo
- `Ctrl+Shift+Z` → Redo
- `F` → Toggle Focus Mode (when not editing)

### Editor Modes

Currently, the editor works in **WYSIWYG mode** (What You See Is What You Get):
- Math renders automatically as you type
- Markdown patterns convert automatically
- No separate preview mode needed
- All formatting is visual

The content is stored as HTML but you can write using markdown patterns for speed.

### Tips

1. **For heavy math work**: Just type LaTeX between `$$` markers
2. **For code**: Use `/code` or ` ``` ` for syntax-highlighted blocks
3. **For structure**: Use markdown shortcuts (# for headings, - for lists)
4. **For quick formatting**: Select text and use bubble toolbar or keyboard shortcuts

The editor combines the best of both worlds:
- Markdown input patterns for speed
- Visual editing for clarity
- No mode switching needed