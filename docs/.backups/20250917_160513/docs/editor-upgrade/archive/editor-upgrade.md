---
id: editor-upgrade
title: Editor Upgrade
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- reference
- react
- fastapi
priority: medium
status: approved
visibility: internal
schema_version: v1
---

Looking for basically “HackMD, distilled”—markdown-first, 2-pane, zero chrome, beautiful output, with $…$ / $…$ math and tasteful code blocks.

I built you a drop-in React component that hits that sweet spot (no top toolbar, left = Markdown editor, right = live preview, 70ch measure, KaTeX, GFM, syntax highlighting, simple code-fence language autofill). It’s in the canvas → **SweetSpotMarkdownEditor.tsx**. Plug it straight into your FastAPI/React app.

### Why this stack (markdown-first, minimal deps)

- **Editing:** CodeMirror 6 via `@uiw/react-codemirror` → light, keyboard-first, no WYSIWYG overhead. ([CodeMirror][1], [UIWJS][2])
- **Parsing/Preview:** `react-markdown` + **remark**/**rehype** plugins:

  - `remark-gfm` (tables, tasks), `remark-math` ($ inline, $$ display) → parses math in Markdown. ([remark][3], [npm][4])
  - `rehype-katex` → renders math with KaTeX (fast, display vs inline supported). ([npm][5], [KaTeX][6])
  - `rehype-highlight` → code fences via highlight.js (solid, small). ([GitHub][7])

### Install (pnpm shown)

```bash
pnpm add @uiw/react-codemirror @codemirror/lang-markdown @codemirror/theme-one-dark \
react-markdown remark-gfm remark-math rehype-katex rehype-highlight katex
```

Then import the component from the canvas file and render it. Make sure the CSS is loaded once (the component imports it, which Vite handles):

```ts
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
```

### What you get out-of-the-box

- **Two-pane layout** with a thin, draggable splitter.
- **Zero top toolbar.** Everything is Markdown + shortcuts (Cmd/Ctrl+Enter = render; Shift toggles autorender).
- **Math:** $a^2+b^2=c^2$ and
  $\int e^{-x^2},dx=\sqrt\pi$
  via `remark-math` + `rehype-katex`. ([npm][4])
- **Code:** fenced blocks get syntax highlighting; typing \`\`\` on a new line auto-fills a language using tiny heuristics (can expand later). ([GitHub][7])
- **Beautiful reading:** preview constrained to **70ch**, generous line height, your Sanctuary vibe.

### Notes & toggles

- **Security:** by default, raw HTML is *not* enabled in `react-markdown`—safer for journaling. If you ever need raw HTML, you’d add `rehype-raw` *carefully* and sanitize.
- **Math delimiters:** you’re already using `$`/`$$`, which `remark-math` expects; KaTeX handles inline vs display via `displayMode`. ([npm][4], [KaTeX][6])
- **Performance:** preview debounced (180 ms). Flip **autorender** off for very large docs; press Cmd/Ctrl+Enter to render on demand.

If you want me to adapt it to your “Sanctuary” tokens (colors, type), or wire it into your existing `FocusMode` and entry save flow, say the word and I’ll tailor this component to your state/Query setup next.

[1]: https://codemirror.net/docs/?utm_source=chatgpt.com "CodeMirror Docs"

[2]: https://uiwjs.github.io/react-codemirror/?utm_source=chatgpt.com "CodeMirror component for React."

[3]: https://remark.js.org/?utm_source=chatgpt.com "remark - markdown processor powered by plugins"

[4]: https://www.npmjs.com/package/remark-math?utm_source=chatgpt.com "remark-math"

[5]: https://www.npmjs.com/package/rehype-katex?utm_source=chatgpt.com "rehype-katex"

[6]: https://katex.org/docs/options.html?utm_source=chatgpt.com "Options"

[7]: https://github.com/rehypejs/rehype-highlight?utm_source=chatgpt.com "rehypejs/rehype-highlight: plugin to highlight code blocks"
