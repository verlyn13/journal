import React, { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, history, redo, undo } from "@codemirror/commands";
import { markdown as cmMarkdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

// CSS imports for rendering (ensure your bundler handles CSS imports)
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

/**
 * SweetSpotMarkdownEditor
 * ------------------------
 * A minimal, elegant two‑pane Markdown editor with live preview.
 * - Markdown-first (HackMD-style) with optional auto-render
 * - $…$ inline math and $$…$$ display math via KaTeX
 * - Fenced code blocks with syntax highlight (rehype-highlight)
 * - Zero top toolbar; keyboard-first; tasteful status bar
 * - Simple language auto-fill for ``` fences
 * - Resizable split; 70ch preview measure; sanctuary-esque spacing
 */
export default function SweetSpotMarkdownEditor() {
  // --- State
  const [source, setSource] = useState<string>(() => initialDoc);
  const [autoRender, setAutoRender] = useState<boolean>(true);
  const [rendered, setRendered] = useState<string>(initialDoc);
  const [leftPct, setLeftPct] = useState<number>(50); // editor width percentage
  const [wordCount, setWordCount] = useState<number>(0);

  // Remember the last language the user used inside a ``` fence
  const lastLangRef = useRef<string>("ts");

  // --- Derived: debounced render
  useEffect(() => {
    if (!autoRender) return;
    const t = setTimeout(() => setRendered(source), 180);
    return () => clearTimeout(t);
  }, [source, autoRender]);

  // Word count (very light; counts words outside code fences/inline code crudely)
  useEffect(() => {
    const text = source
      .replace(/```[\s\S]*?```/g, " ") // strip fenced code
      .replace(/`[^`]*`/g, " ") // strip inline code
      .replace(/\$\$[\s\S]*?\$\$/g, " ") // strip display math
      .replace(/\$[^$]*\$/g, " "); // strip inline math
    setWordCount((text.match(/\b\w+\b/g) || []).length);
  }, [source]);

  // --- Split drag handlers (no external dep)
  const dragRef = useRef<boolean>(false);
  function onMouseDown(e: React.MouseEvent) {
    dragRef.current = true;
    (e.target as HTMLElement).classList.add("dragging");
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let pct = ((e.clientX - bounds.left) / bounds.width) * 100;
    pct = Math.min(80, Math.max(20, pct));
    setLeftPct(pct);
  }
  function onMouseUp() {
    dragRef.current = false;
    const el = document.querySelector(".splitter.dragging");
    if (el) el.classList.remove("dragging");
  }

  // --- Editor extensions
  const extensions = useMemo(() => {
    return [
      history(),
      keymap.of([
        ...defaultKeymap,
        { key: "Mod-Enter", run: () => (setRendered(source), true) },
        { key: "Mod-Shift-Enter", run: () => (setAutoRender((v) => !v), true) },
        { key: "Mod-z", run: undo },
        { key: "Mod-Shift-z", run: redo },
      ]),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        const change = update.changes.iterChanges().next().value;
        if (!change) return;
        // Detect simple ``` fence creation to auto-fill a language
        try {
          const doc = update.state.doc;
          const pos = change.to; // caret after change
          const line = doc.lineAt(pos);
          const textBefore = line.text.slice(0, pos - line.from);
          if (/^```$/.test(textBefore.trim())) {
            // Heuristic: peek next non-empty line to guess
            const nextLine = doc.line(line.number + 1)?.text ?? "";
            const guess = guessLang(nextLine) || lastLangRef.current || "ts";
            lastLangRef.current = guess;
            // Replace ``` with ```lang
            const tr = update.view.state.update({
              changes: {
                from: line.from,
                to: line.from + textBefore.length,
                insert: "```" + guess,
              },
              selection: { anchor: line.from + ("```" + guess).length },
            });
            update.view.dispatch(tr);
          }
        } catch {
          /* ignore */
        }
      }),
      cmMarkdown(),
      oneDark,
      EditorView.lineWrapping,
      EditorView.theme(
        {
          ".cm-content": { fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace", fontSize: "0.95rem", padding: "1rem" },
          "&": { backgroundColor: "transparent" },
        },
        { dark: true }
      ),
    ];
  }, [source]);

  return (
    <div
      className="w-full h-full min-h-[70vh] bg-transparent"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Header: tiny, unobtrusive */}
      <div className="flex items-center justify-between px-3 py-2 text-sm text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="tracking-wide">Markdown ✕ KaTeX ✕ Highlight</span>
          <kbd className="rounded bg-neutral-800/70 px-1.5 py-0.5 text-[11px]">⌘⏎</kbd>
          <span>render ·</span>
          <kbd className="rounded bg-neutral-800/70 px-1.5 py-0.5 text-[11px]">⌘⇧⏎</kbd>
          <span>auto {autoRender ? "on" : "off"}</span>
        </div>
        <div className="opacity-70">{wordCount} words</div>
      </div>

      {/* Split container */}
      <div className="relative grid" style={{ gridTemplateColumns: `${leftPct}% 6px ${100 - leftPct}%` }}>
        {/* Editor Pane */}
        <div className="border-r border-neutral-800/60 bg-neutral-950/30 rounded-l-2xl overflow-hidden">
          <CodeMirror
            value={source}
            height="70vh"
            onChange={(v) => setSource(v)}
            basicSetup={{ lineNumbers: false, highlightActiveLine: true, foldGutter: false, autocompletion: true }}
            extensions={extensions}
          />
        </div>

        {/* Splitter */}
        <div
          className="splitter cursor-col-resize bg-neutral-800/60 hover:bg-neutral-700 transition-colors"
          onMouseDown={onMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor/preview"
        />

        {/* Preview Pane */}
        <div className="rounded-r-2xl bg-neutral-950/20 overflow-auto">
          <article className="mx-auto max-w-[70ch] px-8 py-6 prose prose-invert prose-neutral tracking-[0.005em]">
            {/* react-markdown tree */}
            <ReactMarkdown
              // NOTE: security — we do NOT enable raw HTML by default
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex as any, [rehypeHighlight as any, { ignoreMissing: true }]]}
            >
              {rendered}
            </ReactMarkdown>
          </article>
        </div>
      </div>

      {/* Footer: tiny toggles */}
      <div className="mt-2 flex items-center gap-3 px-3 pb-2 text-xs text-neutral-400">
        <label className="flex items-center gap-2 select-none">
          <input
            type="checkbox"
            checked={autoRender}
            onChange={(e) => (setAutoRender(e.target.checked), e.target.checked && setRendered(source))}
          />
          Auto-render
        </label>
        <button
          onClick={() => setRendered(source)}
          className="rounded-md border border-neutral-800 bg-neutral-900/60 px-2 py-1 hover:bg-neutral-800/70"
        >
          Render now
        </button>
        <span className="opacity-60">No top toolbar. Everything is Markdown + keys.</span>
      </div>
    </div>
  );
}

// --- Helpers
function guessLang(sample: string): string | null {
  const s = sample.trim();
  if (!s) return null;
  // Very lightweight heuristics — expand as needed
  if (/^#include\s+<|std::/.test(s)) return "cpp";
  if (/^use\s+|fn\s+\w+\(|let\s+mut\s+/.test(s)) return "rust";
  if (/^package\s+|import\s+.*;|public\s+class\s+/.test(s)) return "java";
  if (/^def\s+|import\s+\w+|print\(/.test(s)) return "python";
  if (/^function\s+|const\s+|let\s+|import\s+|export\s+/.test(s)) return "ts"; // ts/js
  if (/^SELECT\s+|INSERT\s+|UPDATE\s+|CREATE\s+/.test(s)) return "sql";
  if (/^<([a-zA-Z!]|!DOCTYPE)/.test(s)) return "html";
  if (/^\[|\{|\}/.test(s)) return "json";
  return null;
}

const initialDoc = `---
title: Sweet‑Spot Editor
created: ${new Date().toISOString()}
---

# Hello, sanctuary 👋

This is a minimal two‑pane editor tuned for journaling:

- **Markdown-first** with GFM (tables, task lists)
- **Math** with inline $a^2+b^2=c^2$ and display:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

- **Code fences** with highlighting:

\`\`\`ts
export const add = (a: number, b: number) => a + b
\`\`\`

> Tip: type three backticks and the language will auto‑fill based on the next line.

Enjoy the 70ch measure, generous line height, and zero top toolbar. Press **Cmd/Ctrl+Enter** to render, **Cmd/Ctrl+Shift+Enter** to toggle auto‑render.
`;
