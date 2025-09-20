---
id: refactor-ui-design
title: "Modern Journaling App \u2014 Final UI/UX + Implementation Plan (Aug 31, 2025)"
type: architecture
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- python
- architecture
- react
priority: high
status: approved
visibility: internal
schema_version: v1
---

# Modern Journaling App — Final UI/UX + Implementation Plan (Aug 31, 2025)

> **North Star**: A calm, inviting, “comfortable chair + immortal wooden desk” where words lead and the interface follows. Beautiful by default; powerful on demand. Live LaTeX and code rendering are first‑class.

***

## 0) Executive Summary

- **Product Positioning**: Focused journaling app for thinkers, researchers, and creators who need frictionless writing with scholarly power (Markdown, LaTeX, code blocks) and long‑term reflective insight.
- **Design Pillars**: Calm, Focused, Inviting · Minimal chrome, maximal words · Habit scaffolds without nagging · Privacy‑first, local‑first core.
- **Signature Differentiators**:

  - **Editor**: Block‑based Markdown with inline LaTeX and Monaco code blocks.
  - **Flows**: Onboarding as writing. Distraction‑free sanctum. “River of Time” and “Constellation” views.
  - **AI stance**: “Quiet Librarian”—retrieval on request; no pushy interruptions.

***

## 1) Brand System & Visual Language

### 1.1 Design Tokens (baseline)

- **Colors**

  - `--bg`: #0F1115 (Midnight), #FAFAF7 (Parchment), #0F1B2B (Serene Blue)
  - `--surface`: rgba(255,255,255,0.04) on dark; rgba(15,17,21,0.03) on light
  - **Accents**: `--accent-1` #00B894 (Evergreen Aqua), `--accent-2` #FFD166 (Warm Sand)
  - **States**: success #2ECC71 · warning #F39C12 · danger #E74C3C · info #3498DB
- **Typography**

  - Body: **Literata** or **IBM Plex Serif** (readability for long form)
  - UI: **Inter** or **Noto Sans**
  - Code: **JetBrains Mono**
  - Target text width: 66–72ch; base line-height: 1.7
- **Radius / Elevation**

  - Radius: 16–20px (2xl)
  - Shadows: hover depth from 2dp → 4dp; focus ring 2px accent
- **Texture (optional themes)**: Parchment (fine paper grain), Slate (stone), Linen (fabric) at ≤3% opacity.

### 1.2 Micro‑interactions & Soundscape

- **Motion**: 180–240ms ease for fades/scale; reduced-motion aware.
- **Audio (opt‑in)**: page‑turn on new entry; soft “thump” on todo check; warm “click” when entering Focus Mode. Volume gated, fully disableable.

***

## 2) Information Architecture

- **Top level**: Journal (home), Search, Insights, Settings.
- **Journal**: Three‑pane (Tags/Notebooks · Entry List · Editor). Toggle to Focus Mode (editor-only).
- **Views**: List, Calendar, **River of Time** (horizontal stream), **Constellation** (generative map of tags/links).
- **Organization**: Hybrid tags (#research, #family) + optional notebooks/folders. Smart tags (auto from templates/AI suggestions).

***

## 3) Key Flows

### 3.1 Onboarding → First Writing (Frictionless)

1. Welcome overlay with theme quick‑pick (3 presets).
2. Prompt slide‑in: **“What’s on your mind today?”** (cursor active in editor).
3. Inline hints appear contextually the first time: type `/` for menu, `$$` for math, \`\`\` for code, `[]` + space for tasks.
4. Save is auto; exit shows streak start and “Set gentle reminder?” (dismissible).

### 3.2 Daily Writing (Returning User)

- Land on Journal with Entry List filtered to **Today**; cursor pre‑placed in new draft block.
- Cmd/Ctrl+J → **Jump to Journal** from anywhere.
- Focus Mode toggle (`F`): hides rails, locks width, soft gradient background.

### 3.3 Search & Retrieval

- Global search (⌘/Ctrl K) with:

  - Keyword (Postgres FTS), tag filters, date ranges
  - **Semantic** search (vector DB) opt‑in; shows “relevance by meaning” chips
  - Quick scopes: *This week*, *Past Summers*, *Work*, *People names*

### 3.4 Time Exploration

- **River of Time**: Infinite horizontal band; node size \~ length; brightness \~ sentiment; scrubbable timeline ticks.
- **Constellation**: Nodes = tags; edges = co‑occurrence/links. Hover a tag to halo related entries; click to filter list.

### 3.5 Export/Share

- Per‑entry: Markdown, PDF, HTML.
- Bulk: date range + tag filter → zip with front‑matter.

***

## 4) Editor System (Tiptap + Extensions)

### 4.1 Essentials

- **Blocks**: paragraph, heading (h1–h3), list (ordered/unordered/task), quote, divider, image, table, callout, code block, math (inline/block), embed (YouTube/Spotify link → card).
- **Controls**:

  - Slash menu (`/`): block insertions + templates (Daily Note, Lab Log, Lecture Notes, Gratitude 3×)
  - Bubble menu: bold/italic/underline/strikethrough, link, inline code, highlight, `Σ math`, **H2**, `</>`.
  - Left gutter: drag handle, block type icon, quick drag/drop reordering.
- **Shortcuts**: Markdown transforms on space/enter; `$$…$$` → inline KaTeX; triple backticks → Monaco block; `>>>` → callout; `[]` + space → todo item.

### 4.2 LaTeX & Code

- **Math**: KaTeX render with accessibility tree; fallback alt‑text from source; copy‑as‑LaTeX.
- **Code**: Monaco embedded per block; language auto‑detect w/ dropdown override; copy, line numbers, wrap toggle, “Run” hook (optional playground sandbox for JS/Python via web workers).

### 4.3 Tables & Media

- Tables: add/remove rows/cols; align per column (L/C/R); zebra option; CSV paste.
- Images: paste/drag‑drop; smart scaling; captions; EXIF strip on export (privacy).
- Embeds: oEmbed for whitelisted domains; unfurl cards for links.

### 4.4 Collaboration (later phase)

- Yjs awareness cursors (color‑blind‑safe); comment threads per block; change history side‑by‑side diff.

***

## 5) Layout & Screens

### 5.1 Three‑Pane Default

- **Left Sidebar**:

  - Quick Add (+), Notebooks, Tags (with counts), Saved Searches.
  - “Today”, “On this day”, “Recently edited”.
- **Center (Entry List)**:

  - Grouped by date with subtle separators; snippet preview; tag chips; sentiment dot.
  - Toggle: List | Calendar | River.
- **Right (Editor)**:

  - Sticky top tag: breadcrumb, last saved, Focus Mode, word count, export.
  - Optional **Insights Rail** (collapsible): streak meter, mood line, prompts (ask on demand), related entries.

### 5.2 Focus Mode

- Full bleed editor; background texture fades in; UI chrome collapses into minimal top ribbon; ambient focus audio (if enabled).

### 5.3 Insights

- Trends over time; tag heatmap; “constellation” canvas; streaks; reading time.

***

## 6) Accessibility & Internationalization

- **A11y**: semantic HTML, ARIA for editor controls; toolbar reachable by keyboard; visible focus; WCAG 2.2 AA contrast; reduced‑motion; captions/alt text required prompts.
- **I18n**: RTL support; KaTeX with localized numerals where applicable; date/time locales; pluralization.

***

## 7) Privacy, Sync, and Local‑First Architecture

- **Data model**: entries, blocks, assets, tags, notebooks, sentiments.
- **Local‑first**: IndexedDB/PostgreSQL (via WASM) cache; CRDT/Yjs doc per entry; background sync to server.
- **Encryption**: E2EE optional vaults (derived key from passphrase)—AI features disabled on locked vaults; server sees only ciphertext.
- **Pii minimization**: EXIF strip; per‑entry visibility (private/shared/exported).

***

## 8) Search Architecture

- **Baseline**: Postgres FTS with tsvector column + GIN index; triggers on insert/update.
- **Semantic (opt‑in)**: Chunk entries, embed (OpenAI or self‑hosted small model), store in pgvector/Chroma; ANN search with filters; RAG prompt builder used only on request.

***

## 9) Performance Budgets

- First load ≤ 2.0s on 4G; JS ≤ 250KB gz (core); CSS ≤ 40KB; fonts 2 variants, swap loading.
- Incremental hydration for editor; lazy‑load heavy blocks (Monaco, KaTeX) on first use.
- Debounced autosave (300–500ms); background rendering worker for KaTeX/preview.

***

## 10) Component & Code Architecture (React/Tailwind/Tiptap)

```
/src
├─ components/
│  ├─ Editor/
│  │  ├─ Editor.tsx
│  │  ├─ BubbleMenu.tsx
│  │  ├─ SlashCommandList.tsx
│  │  └─ extensions/
│  │     ├─ MathNode.ts (KaTeX)
│  │     ├─ CodeBlockMonaco.tsx
│  │     ├─ Callout.tsx
│  │     └─ EmbedCard.tsx
│  ├─ Layout/
│  │  ├─ ThreePaneLayout.tsx
│  │  ├─ Sidebar.tsx
│  │  ├─ EntryList.tsx
│  │  └─ InsightsRail.tsx
│  ├─ UI/ (shadcn wrappers)
│  │  ├─ Button.tsx · Tooltip.tsx · Dialog.tsx · Tabs.tsx
│  │  └─ ThemeSelector.tsx
│  └─ Charts/
│     ├─ MoodLine.tsx (recharts)
│     ├─ RiverOfTime.tsx (canvas/webgl)
│     └─ Constellation.tsx (force‑layout)
├─ contexts/
│  ├─ ThemeContext.tsx
│  └─ EditorContext.tsx
├─ lib/
│  ├─ tiptap.ts (schema, keymaps, input rules)
│  ├─ katex.ts · monaco.ts
│  ├─ search.ts (fts + semantic)
│  ├─ rag.ts (prompt builder)
│  └─ audio.ts (sound manager)
├─ pages/ or app/
│  ├─ journal/
│  ├─ insights/
│  └─ settings/
└─ styles/tokens.css (CSS variables for themes)
```

**Tiptap key setup** (high level):

- BaseKit + History + Placeholder + Link + Table + Image + CodeBlock (custom Monaco) + Math (custom KaTeX) + SlashCommands + DragHandle + TaskList + Callout + Embed.

***

## 11) Acceptance Criteria (MVP)

1. **Onboarding as writing**: First session goes straight to editor with prompt; theme settable in < 2 clicks.
2. **Live LaTeX**: Typing `$$…$$` renders inline; block math supported with proper baseline alignment; copy‑as‑LaTeX works.
3. **Code blocks**: Monaco loads on first code block; language autodetect + manual selector; copy button; dark/light sync.
4. **Focus Mode**: One‑keystroke toggle; hides sidebars; locks 70ch; persists choice per session.
5. **Search**: Keyword search (FTS) with tag/date filters returns results < 150ms for 10k entries.
6. **Exports**: Markdown/PDF/HTML produce faithful render (math embedded as SVG/HTML; code with highlights).
7. **A11y**: Keyboard can reach all editor controls; WCAG AA contrast passes; reduced‑motion respected.

***

## 12) Phase Roadmap

- **Phase 1 — Core Sanctuary (4–6 weeks)**

  - Three‑pane layout, editor basics, LaTeX + code, Focus Mode, FTS search, exports, theme presets.
- **Phase 2 — Journaling Depth (4–6 weeks)**

  - Tables+, media, templates, calendar view, Insights basics (streaks, mood line), River of Time.
- **Phase 3 — Quiet Librarian (4–8 weeks)**

  - Semantic search (pgvector/Chroma), RAG answers on request, tag suggestions, summaries.
- **Phase 4 — Constellation & Collab (6–10 weeks)**

  - Constellation view, comments, presence cursors, version timelines, E2EE vaults.

***

## 13) QA & Perf Checklist

- **Typing latency** < 16ms at 60fps with 50k‑char entry.
- **KaTeX stress**: render 200 inline equations without frame drops (defer offscreen).
- **Monaco**: ensure unload when block not visible; memory snapshot under 200MB.
- **Search index** rebuild under 1s/1k entries locally.
- **PDF** export rasterizes math correctly; selectable text remains intact.

***

## 14) Risks & Mitigations

- **Heavy editor payload** → Lazy‑load Monaco/KaTeX; code‑split by route; prefetch on intent.
- **Semantic privacy** → Opt‑in; on‑device embeddings option; redaction rules before sending snippets.
- **Audio intrusion** → Off by default; master mute; fades ≤ 120ms.

***

## 15) Open Questions

1. Do we support inline citations/bibliography (CSL) in MVP?
2. Should “Run code” sandboxes be scoped to JS/Python only, or disabled initially?
3. Do we include handwriting/ink input on tablets in Phase 2?

***

## 16) Implementation Notes (Dev‑ready)

- **Stack**: React + Tailwind + shadcn/ui + Tiptap; KaTeX; Monaco; recharts; Vite/Next.
- **Perf**: CSS variables for themes; font subsetting; `content-visibility: auto` for long docs; offscreen canvas for Constellation.
- **Data**: Prisma → Postgres; entry.blocks JSONB; FTS via `tsvector` + GIN; optional `pgvector`.
- **Local**: IndexedDB mirroring with background sync; Yjs docs per entry for future collab.

***

## 17) Spec Snippets

- **Math block**: paste LaTeX → preview pane shows rendered KaTeX; toolbar buttons for common symbols (∑, ∫, π, ℝ, ℤ, →, ⇒, ≤, ≥, ≈).
- **Slash menu commands**: `/daily`, `/lecture-notes`, `/todo`, `/table 3x5`, `/latex`, `/code ts`, `/quote`, `/embed`.
- **Callouts**: info/warn/tip/quote variants with emoji markers.

***

## 18) Handoff to Design (Figma)

- Provide tokens library, components (Button, Input, Tabs, Toolbar, BubbleMenu, DragHandle, Callout, Chips), layout frames for: List, Calendar, River, Constellation, Focus Mode.
- Prototype interactions: slash menu, math render, code block lazy‑load, Focus toggle, River scroll.

***

### Final Note

This plan preserves the quiet dignity of a study while delivering the power of a lab. Build the sanctuary first; layer insight second; keep the librarian quiet unless called.
