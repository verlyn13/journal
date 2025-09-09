# Security & Corrections (Markdown Rendering)

Author in Markdown, render to HTML with ReactMarkdown using a unified pipeline. Sanitization happens in the rehype stage, not on paste.

## Correct pipeline

```tsx
<ReactMarkdown
  rehypePlugins={[
    [rehypeSanitize, schema], // the allowlist
    rehypeKatex,
    rehypeHighlight,
  ]}
>
  {markdown}
</ReactMarkdown>
```

Key points:

- Do not use DOMPurify for this migration; sanitation belongs in the unified pipeline.
- The `schema` should allow the HTML produced by ReactMarkdown + KaTeX + code highlighting.

## Suggested allowlist (sketch)

Tags:

- `p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote, pre, code, strong, em, u, s, span, a, img, br, hr, table, thead, tbody, tr, td, th, sup, sub`.
- KaTeX output (classes beginning with `katex`).

Attributes:

- Global: `className` (or `class`), `id`.
- `a[href|title|target]` (force `rel="noopener noreferrer"` when target="\_blank").
- `img[src|alt|title|width|height]` (restrict to `https:` and/or local paths; no `javascript:`).

Blocked:

- Event handlers (`on*`), `javascript:` URLs, inline scripts, iframes.

## Server considerations

- Backend continues to store legacy HTML (content) and new Markdown (markdown column) during transition.
- If server-side rendering is added in the future, apply the same allowlist server-side.
- Security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy`; CSP can be evaluated after render audit.

## Math & code

- KaTeX rendering via `rehype-katex`; ensure CSS is loaded from a trusted source.
- Code highlighting via `rehype-highlight` or Shiki-based plugins.
