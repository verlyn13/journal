---
id: editor-upgrade-v2
title: What to change (and why)
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- reference
- react
priority: medium
status: approved
visibility: internal
schema_version: v1
---

# What to change (and why)

## 1) Rendering pipeline: finalize the unified stack (math, GFM, breaks, safety)

- Keep `react-markdown` + `remark-math` + `rehype-katex` for `$…$` / `$$…$$`. This is the canonical approach and matches your spec. ([remarkjs.github.io][1], [GitHub][2], [npm][3])
- Add **`remark-gfm`** for tables, footnotes, autolinks, task lists (your users will expect GitHub-like behavior). ([npm][4], [unified][5])
- (Optional but very useful) Add **`remark-breaks`** so single newlines render as `<br>` (closer to HackMD UX). ([GitHub][6])
- **Security**: keep HTML disabled in `react-markdown` (default). If you *must* support raw HTML later, add `rehype-raw` **and** `rehype-sanitize` with a strict schema (allow KaTeX/`language-*` classes). Don’t enable raw HTML without sanitization. ([remarkjs.github.io][1], [GitHub][7], [pullrequest.com][8])

**Preview config example**

```tsx
<ReactMarkdown
  // HTML stays off (no rehype-raw) unless you later decide to enable it with sanitize.
  remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
  rehypePlugins={[
    [rehypeKatex, { strict: false }],
    [rehypeHighlight, { ignoreMissing: true }],
    // if you ever enable raw HTML:
    // rehypeRaw,
    // [rehypeSanitize, myTightSchema],
  ]}
/>
```

## 2) Code highlighting: be explicit about languages (and size)

`rehype-highlight` (lowlight + highlight.js) is fine. It auto-detects but is smaller & faster if you specify languages via `class="language-ts"` etc. Your editor’s “`→`lang” autofill is perfect for this and cuts mis-detections. If you need tighter control or SSR parity later, consider swapping to Shiki—but current choice is solid. ([GitHub][9], [npm][10], [highlightjs.readthedocs.io][11])

## 3) Math specifics: KaTeX options & expectations

KaTeX handles inline vs display and supports a large subset of TeX. Configure macros only if you actually need them; keep defaults otherwise. (Don’t promise full LaTeX.) ([KaTeX][12])

## 4) Data model & migration: add `format`, convert safely, keep a backstop

Your plan to add `entries.format` is right. For conversion, use **Turndown** with a few custom rules to catch TipTap HTML (links, strong/em, code, headings) and *your math extension markup* if present—emit `$...$` or `$$...$$`. Keep dual-read (HTML→md convert-on-read) behind a feature flag for a short window, then backfill DB once you’re confident.

**Server-side conversion sketch (Turndown)**

```ts
import TurndownService from "turndown";
const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
// Example: TipTap math wrapper → $$...$$
td.addRule("tiptapMath", {
  filter: (node) => node.nodeType === 1 && (node as Element).getAttribute?.("data-math"),
  replacement: (_content, node) => {
    const el = node as Element;
    const tex = el.getAttribute("data-math") || el.textContent || "";
    return tex.includes("\n") ? `\n$$\n${tex}\n$$\n` : `$${tex}$`;
  }
});
export const htmlToMarkdown = (html: string) => td.turndown(html);
```

Turndown is the de-facto HTML→Markdown tool and is actively maintained. ([GitHub][13], [npm][14])

**DB**

```sql
ALTER TABLE entries ADD COLUMN format TEXT NOT NULL DEFAULT 'html';
-- later when ready:
-- UPDATE entries SET content = :converted_markdown, format = 'markdown' WHERE format='html';
```

## 5) Editor integration: autosave, Ctrl/Cmd+S, React Query, drafts

Wire the new component to your existing React Query layer and keep your “draft” workflow intact.

**Mutation & draft**

```ts
const saveEntry = useMutation({
  mutationFn: async (payload: {id: string; title: string; markdown: string}) =>
    api.put(`/entries/${payload.id}`, { ...payload, format: "markdown" }),
  onSuccess: () => queryClient.invalidateQueries(keys.item(id)),
});

useEffect(() => {
  const key = `journal:draft:${id}`;
  const timer = setInterval(() => localStorage.setItem(key, source), 10_000);
  return () => clearInterval(timer);
}, [id, source]);
```

**Ctrl/Cmd+S**

```ts
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveEntry.mutate({ id, title, markdown: source });
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [source, title, id]);
```

## 6) A11y, mobile, and UX polish

- **Resizer**: keep `role="separator"` and `aria-orientation="vertical"` (you already did). Add `aria-valuenow` percentages if you want to be extra friendly.
- **Mobile**: auto-collapse to single-pane with a toggle (Editor ⇄ Preview). Don’t render both panes on tiny viewports; it wastes cycles.
- **Hard line-breaks**: with `remark-breaks`, what users type becomes what they see—remove a common mental tax. ([GitHub][6])

## 7) Safety checklist (prod)

- Keep raw HTML **off**; if enabling: `rehype-raw` + **strict** `rehype-sanitize` schema; test XSS payloads. ([remarkjs.github.io][1], [GitHub][7])
- Don’t trust client rendering for emails/embeds—server-render markdown with the *same* pipeline and sanitize.
- Images/links: consider a tiny allowlist or proxy for external resources if privacy matters.

## 8) Performance & bundle budget: measure, then trim

Don’t hard-code “-60%” improvements; **measure** with a bundle visualizer. Track before/after so you can prove the win and spot heavy outliers (Monaco removal will show immediately). ([npm][15])

**Vite config (visualizer)**

```ts
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";
export default defineConfig({
  plugins: [
    react(),
    visualizer({ filename: "stats.html", gzipSize: true, brotliSize: true, template: "treemap" }),
  ],
});
```

## 9) Regression tests that actually catch issues

- **Unit**: math parsing ($ vs $$), code-block lang insertion, wordcount (exclude code/math).
- **Integration**: draft recovery; HTML→MD conversion idempotence on common TipTap blocks.
- **E2E**: create → type → render → Ctrl+S save → reload → verify. Include cases for tables, task lists, inline vs display math, and long docs.

***

# File-by-file adjustments (delta from your diff)

### Remove (confirm these too if present)

- `@tiptap/extension-code-block-lowlight` (or similar) and any Monaco wiring you no longer use.
- Any custom math/inline-math nodes—superseded by `remark-math` + `rehype-katex`. ([GitHub][2], [npm][3])

### Add

```bash
pnpm add react-markdown remark-gfm remark-math rehype-katex rehype-highlight katex remark-breaks
pnpm add -D rollup-plugin-visualizer
```

Docs for each plugin are current and stable. ([remarkjs.github.io][1], [npm][4], [GitHub][9], [KaTeX][16])

### Modify

- Replace `JournalEditor.tsx` with a thin wrapper that mounts your **SweetSpotMarkdownEditor** (the canvas file I provided) and passes `value`, `onChange`, and save handlers.
- Keep your **FocusMode** exactly as-is; the preview already adheres to **70ch** and a generous line-height.

***

# Known edge cases (and fixes)

- **Users typing single newlines** expecting hard breaks → fixed by `remark-breaks`. ([GitHub][6])
- **Inline `$` inside code** → it’s ignored already (code is fenced/inline and stripped from wordcount).
- **Language class for highlighting** → your fence autofill writes \`\`\`ts so `rehype-highlight` applies `language-ts` and skips auto-detect. ([npm][10])
- **Math parsing in tables/footnotes** → supported; if you see any oddities, make sure `remark-math` runs **before** `rehype-katex`. ([GitHub][2])

***

# Rollout plan (low risk)

1. Ship behind `USE_MARKDOWN_EDITOR` flag (you already specced this).
2. Run Turndown conversion on a **sample** of existing entries and diff the HTML render before/after.
3. Migrate the rest; keep a 1–2 week fallback period where HTML is converted on read only if `format==='html'`.
4. Remove TipTap code after you hit 95%+ markdown entries and support requests are quiet.

***

# What you’ll end up with

- Markdown-first, dual-pane, no-toolbar editor that matches HackMD ergonomics.
- Clean math + code rendering, with predictable, safe behavior.
- A reversible, measured migration you can defend with bundle reports.

If you’d like, I can push a patched version of **SweetSpotMarkdownEditor.tsx** that includes `remark-breaks`, a `sanitizeSchema` you can toggle on later, and the `useMutation` save wiring.

[1]: https://remarkjs.github.io/react-markdown/?utm_source=chatgpt.com "react-markdown"

[2]: https://github.com/remarkjs/remark-math?utm_source=chatgpt.com "remark and rehype plugins to support math"

[3]: https://www.npmjs.com/package/rehype-katex?utm_source=chatgpt.com "rehype-katex"

[4]: https://www.npmjs.com/package/remark-gfm?utm_source=chatgpt.com "remark-gfm"

[5]: https://unifiedjs.com/learn/recipe/remark-table/?utm_source=chatgpt.com "Support tables in remark - unified"

[6]: https://github.com/remarkjs/remark-breaks?utm_source=chatgpt.com "remarkjs/remark-breaks: plugin to add ..."

[7]: https://github.com/rehypejs/rehype-sanitize?utm_source=chatgpt.com "rehypejs/rehype-sanitize: plugin to sanitize HTML"

[8]: https://www.pullrequest.com/blog/secure-markdown-rendering-in-react-balancing-flexibility-and-safety/?utm_source=chatgpt.com "Secure Markdown Rendering in React"

[9]: https://github.com/rehypejs/rehype-highlight?utm_source=chatgpt.com "rehypejs/rehype-highlight: plugin to highlight code blocks"

[10]: https://www.npmjs.com/package/rehype-highlight/v/4.0.1?utm_source=chatgpt.com "rehype-highlight"

[11]: https://highlightjs.readthedocs.io/en/latest/readme.html?utm_source=chatgpt.com "highlight.js 11.9.0 documentation"

[12]: https://katex.org/docs/options.html?utm_source=chatgpt.com "Options"

[13]: https://github.com/mixmark-io/turndown?utm_source=chatgpt.com "mixmark-io/turndown: 🛏 An HTML to Markdown converter ..."

[14]: https://www.npmjs.com/package/turndown/v/4.0.0-rc.1?utm_source=chatgpt.com "turndown"

[15]: https://www.npmjs.com/package/vite-bundle-visualizer?utm_source=chatgpt.com "vite-bundle-visualizer"

[16]: https://katex.org/docs/supported.html?utm_source=chatgpt.com "Supported Functions"
