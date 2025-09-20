---
id: security-and-corrections
title: Must-fix items
type: api
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- api
- python
- react
- fastapi
priority: critical
status: approved
visibility: internal
schema_version: v1
---

The V2 plan closes a bunch of gaps—but a few things need tightening before you ship. Here’s a focused review with precise fixes, backed by primary docs.

# Must-fix items

1. ### Sanitize in the **unified** pipeline, not with DOMPurify

`react-markdown` renders React elements (not HTML strings). If you’re not enabling raw HTML, you don’t need a sanitizer at all. If you **do** allow raw HTML or add rehype plugins that inject HTML (highlighting, KaTeX), the officially recommended approach is **rehype-sanitize** with an allow-list schema—*not* DOMPurify. The `react-markdown` docs explicitly say to use rehype-sanitize for safety after plugins. ([npm][1])

- Keep `rehype-raw` **off** unless you really need to render user HTML.
- Use `rehype-sanitize` before KaTeX and/or after highlight depending on trust level (see examples below and in the rehype-katex and rehype-highlight READMEs). ([npm][2], [GitHub][3])

2. ### KaTeX + sanitize: extend the schema correctly

KaTeX output needs certain class names and (optionally) MathML tags. The `rehype-katex` security section shows how to extend the default schema to allow the math classes; follow that pattern (and only as permissive as required). Also remember to ship the KaTeX CSS and fonts locally. ([npm][2], [KaTeX][4])

3. ### Highlighting config & bundle size

`rehype-highlight` defaults to **no autodetect**; it highlights only when a `language-*` class is present. That’s good for both predictability and size. Only enable `detect: true` if you accept the extra work and potential mis-detection; otherwise keep it false and prefer explicit fences like \`\`\`ts. If you do enable detection, consider restricting the language subset. The README shows options (`languages`, `subset`, `detect`). ([GitHub][3])

4. ### HTML→Markdown conversion in the backend: fix the library

- In your Python snippet you import a non-existent `Turndown`. Turndown is a **JS** library (`TurndownService`) for Node. Use it in a small Node job, or switch to a Python library like `markdownify` (or `html2text`) if you want conversion in FastAPI. ([GitHub][5])
- If you stay with Turndown, ensure you’re constructing `new TurndownService(...)` (class name matters). ([GitHub][5])

5. ### CSP: remove permissive entries and CDN origins you don’t need

Your example CSP allows inline scripts/styles and an external CDN. If you bundle all assets with Vite, keep a tight policy like:
`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://your.api; frame-ancestors 'none'; base-uri 'none'; object-src 'none'`
This aligns with MDN/OWASP guidance; only relax what you must. Avoid `'unsafe-inline'` for `script-src`. ([MDN Web Docs][6], [OWASP Cheat Sheet Series][7])

6. ### Security model for URLs in links/images

If you ever permit raw HTML, rely on `rehype-sanitize`. For pure markdown, `react-markdown` is safe by default but still recommends sanitize when adding plugins. If you want an extra belt-and-suspenders for links, you can filter/transform URLs yourself (e.g., disallow `javascript:` or unknown protocols) before rendering. Guidance: use sanitize per docs; do not run DOMPurify over markdown strings. ([npm][1])

7. ### Split-pane accessibility (keyboard & ARIA)

Make the divider a focusable **separator** with `aria-orientation="vertical"` and managed `aria-valuemin/now/max`. Provide arrow-key resizing per the WAI-ARIA “Window Splitter” pattern. ([W3C][8], [MDN Web Docs][9])

8. ### KaTeX integration details

- Import `katex/dist/katex.min.css` once where math can appear.
- Self-host fonts referenced by that CSS (so CSP can stay strict and offline works).
- `rehype-katex` is ESM; Vite handles this, but if you SSR preview anywhere, you’re fine—KaTeX renders to HTML. ([KaTeX][4], [npm][10])

9. ### “remark-breaks” behavior (line breaks)

`remark-breaks` turns soft newlines into `<br>`—that’s the intended “natural line break” UX you want. Note this diverges from semantic HTML and CommonMark, by design. Document that behavior for users. ([unified][11])

***

# Recommended “drop-in” renderer setup (safe by default)

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import "katex/dist/katex.min.css";

// Allow only the classes needed for math and highlight.
// Keep this minimal; extend as you encounter legit cases.
const mathAndCodeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // KaTeX (keep tight; start with math classes only)
    div: [...(defaultSchema.attributes.div || []), ["className", "math", "math-display"]],
    span: [
      ...(defaultSchema.attributes.span || []),
      ["className", "math", "math-inline"],
      // If using rehype-highlight after sanitize, you can also allow hljs- classes here
      // ["className", /^hljs-.*/]
    ],
    code: [
      ...(defaultSchema.attributes.code || []),
      // Allow language-* class on <code>
      ["className", /^language-.*/]
    ]
  }
};

export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <article className="prose dark:prose-invert max-w-[70ch]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[
          [rehypeSanitize, mathAndCodeSchema], // sanitize first
          rehypeKatex,
          [rehypeHighlight, { detect: false }] // keep detect off for predictability/size
        ]}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
```

- `remark-gfm` gives tables, task lists, strikethrough, **and footnotes**; `remark-breaks` gives your “soft return = line break” behavior. ([MDX][12], [unified][11])
- The KaTeX/rehype-sanitize schema follows the plugin’s own security note. ([npm][2])
- Style the preview with Tailwind’s Typography plugin (`prose`), which is designed for HTML you don’t fully control (Markdown output). ([GitHub][13])

***

# Editor (CodeMirror 6) setup notes

- Use `@uiw/react-codemirror` with `@codemirror/lang-markdown`; add helpers: `@codemirror/autocomplete` for snippet completions (e.g., code fence language suggestions after typing \`\`\`), and `@codemirror/closebrackets` for nicer typing. ([Forge Lyon 1][14], [CodeMirror][15], [npm][16])
- Keep the language “autofill” lightweight: when the user types \`\`\` and a letter, show a completion list of your supported languages (don’t rely on highlight autodetect). The CodeMirror autocomplete docs show how to write custom `CompletionSource` or `snippetCompletion`. ([CodeMirror][15])

***

# Data migration corrections

- **Server conversion**: If backend is FastAPI/Python, use `markdownify` (or similar) to convert HTML→MD on the server, or run a one-off Node script using **TurndownService**. Don’t import JS Turndown in Python. ([GitHub][5])
- Store `format: "markdown"` and keep original HTML for rollback during the transition (your plan already does this—good).

***

# CSP hardening (concrete example)

If everything is bundled/self-hosted:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self' data:;
  connect-src 'self' https://api.yourdomain.tld;
  frame-ancestors 'none';
  base-uri 'none';
  object-src 'none';
```

Tune `connect-src` for your API endpoints; add `report-uri`/`report-to` when you’re ready. This aligns with MDN & OWASP guidance and avoids permissive `'unsafe-inline'`. ([MDN Web Docs][6], [OWASP Cheat Sheet Series][7])

***

# UX polish (quick wins)

- **Scroll sync**: debounce both panes (\~120–180 ms), map CM6 visible line → nearest heading in the AST for the preview (offset map), and ignore sync while the user is actively scrolling the preview.
- **Keyboard**: keep your current `Ctrl/Cmd+S` and **add** focus toggles for the split (give the splitter a `tabIndex=0` and arrow-key resize per ARIA “Window Splitter”). ([W3C][8])
- **Mobile**: default to single-pane (editor ↔ preview toggle) and persist the last mode.

***

# Small correctness fixes in the V2 doc

- Replace “sanitize markdown content with DOMPurify” with “sanitize **HTML** via rehype-sanitize in the unified pipeline”. DOMPurify doesn’t act on markdown and is unnecessary with `react-markdown` unless you render raw HTML yourself. ([npm][1])
- Turndown import/name: `TurndownService` in Node, not `Turndown` in Python. ([GitHub][5])
- `rehype-highlight` option: document that `detect` defaults to `false` and that you’re intentionally keeping it off for stability and size. ([GitHub][3])
- KaTeX: call out that the CSS and fonts must be present; otherwise math renders incorrectly. ([KaTeX][4])

***

# Performance notes

- Your savings estimate looks directionally right. For predictable bundles, import only the highlight “common” languages or a hand-picked set and keep `detect: false`. ([GitHub][3])
- Lazy-load the editor component and (optionally) the preview pipeline; Vite will tree-shake ESM modules well.

***

## Bottom line

Proceed with the V2 approach, but make these changes before rollout:

1. Drop DOMPurify here; adopt **rehype-sanitize** with a minimal schema, then `rehype-katex`, then `rehype-highlight`. ([npm][1], [GitHub][3])
2. Fix the HTML→MD migration to use the **correct** library for your backend (TurndownService in Node or `markdownify` in Python). ([GitHub][5])
3. Keep highlighting **explicit** (no autodetect) and limit languages to shrink the bundle. ([GitHub][3])
4. Tighten CSP; self-host KaTeX CSS/fonts. ([MDN Web Docs][6], [KaTeX][4])
5. Implement the ARIA-compliant splitter. ([W3C][8])

If you want, I can turn the above into the exact `MarkdownPreview.tsx`, CM6 setup, and a one-time migration script for your stack.

[1]: https://www.npmjs.com/package/react-markdown/v/8.0.6?utm_source=chatgpt.com "react-markdown - npm"

[2]: https://www.npmjs.com/package/rehype-katex/v/6.0.3 "rehype-katex - npm"

[3]: https://github.com/rehypejs/rehype-highlight "GitHub - rehypejs/rehype-highlight: plugin to highlight code blocks"

[4]: https://katex.org/docs/browser.html?utm_source=chatgpt.com "Browser"

[5]: https://github.com/matthewwithanm/python-markdownify?utm_source=chatgpt.com "matthewwithanm/python-markdownify: Convert HTML to ..."

[6]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP?utm_source=chatgpt.com "Content Security Policy (CSP) - MDN"

[7]: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html?utm_source=chatgpt.com "Content Security Policy Cheat Sheet"

[8]: https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/?utm_source=chatgpt.com "Window Splitter Pattern | APG | WAI"

[9]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role?utm_source=chatgpt.com "ARIA: separator role - MDN"

[10]: https://www.npmjs.com/package/rehype-katex?utm_source=chatgpt.com "rehype-katex"

[11]: https://unifiedjs.com/explore/package/remark-github/?utm_source=chatgpt.com "remark-github - unified"

[12]: https://mdxjs.com/guides/gfm/?utm_source=chatgpt.com "GitHub flavored markdown (GFM)"

[13]: https://github.com/tailwindlabs/tailwindcss-typography?utm_source=chatgpt.com "tailwindlabs/tailwindcss-typography"

[14]: https://forge.univ-lyon1.fr/p2210733/portfolio/-/blob/main/node_modules (managed by Bun) (managed by Bun)/rehype-raw/readme.md?ref_type=heads&utm_source=chatgpt.com "node_modules (managed by Bun) (managed by Bun)/rehype-raw/readme.md · main"

[15]: https://codemirror.net/examples/autocompletion/?utm_source=chatgpt.com "Example: Autocompletion"

[16]: https://www.npmjs.com/package/%40codemirror/closebrackets?utm_source=chatgpt.com "codemirror/closebrackets"
