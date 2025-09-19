---
id: roadmap
title: Journal Roadmap (Live Document)
type: api
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- api
- react
priority: high
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-09'
---

# Journal Roadmap (Live Document)

This roadmap captures where we’re going and how we’ll get there — keeping the old‑desk vibe while building a reliable, elegant writing tool. It balances polish‑first UX with solid engineering (testing, reliability, CI, and quality gates). It is a live document; Phase 0 and Phase 1 are locked and concrete; later phases are iterative.

## Vision & Design Principles

- The Desk Comes First: Calm, focused writing experience. Warm dusk/dawn palettes, paper/desk textures, micro‑interactions that feel tactile.
- Elegant by Default: Minimal UI; discoverable power through keyboard and command palette.
- Local‑first Safety: Instant local saves; graceful offline; conflict awareness.
- Extensible & Private: Markdown as the canonical format; exportable; future smart features are private‑by‑design.

***

## Current Baseline (Done)

- One‑command dev runner (`make dev-full` / `mise run dev:full`): starts services, migrates DB (IPv4), runs API+Web.
- API base normalized (always `/api`); Vite proxy; no more 404s.
- Editor: TipTap prose + CodeMirror markdown + Monaco code blocks; dark/dusk aware.
- Markdown rendering fixed; legacy HTML auto‑converted for editing/preview.
- Reliability: outbox retries + DLQ (flag‑gated), worker idempotency, connection retry, provider retry (backoff+jitter).
- Metrics: `/metrics` endpoint with minimal Prom counters.
- CI ready: unit + component + integration with services; NATS tests flagged.

***

## Phase 1 — Foundations & Polish (UX first)

Goals: lock the daily writing experience; no clutter; keyboard‑first. Ship in small PRs behind flags if necessary.

### UX & Layout

- Collapsible entries rail with smooth animation, hover peek, `Cmd/Ctrl+B` toggle.
- SplitPane: side‑by‑side ↔ top/bottom toggle (persisted); golden‑ratio snap; `Alt+Scroll` to nudge split.
- Sticky breadcrumb (H1 › H2 › H3); scroll‑spy; `Cmd/Ctrl+G` heading palette.
- Typewriter mode toggle (centered sheet, spotlight current line).

### Editor & Flow

- Command Palette (`Cmd/Ctrl+K`): Insert/Navigate/Toggle (focus, preview layout, vim mode).
- Vim Mode (toggle): default insert; CM6 vim for markdown; TipTap emulates basic nav.
- Block folding by heading and code fences; `Shift+Tab` folds subtree.
- Inline math & display math shortcuts (`Ctrl+M` cycle).

### Organization

- Title field polish (serif, large, inline validation).
- Today lane (`Cmd/Ctrl+J`) fast entry open (placeholder behavior).

### Export (Phase 1 part)

- Export current entry as MD/HTML (client + basic backend endpoints).

### Quality & Reliability

- Local‑first save: immediate local, debounced server; cancel in‑flight on new keystrokes.
- Snapshot button (manual) + autosnap every 15 minutes (local only for now).
- A11y pass (labels/ids/contrast/keyboard reachability).

Acceptance

- Layout toggles remembered; rail collapses elegantly; headings render and navigate smoothly.
- Vim toggle works; markdown/code/math editing is smooth; folding intuitive.
- Exports MD/HTML; dusk/dawn themes hold across components.

***

## Phase 1.5 — Quick Wins (1–2 sessions)

- Peek‑on‑hover entries; double‑tap pin.
- Footnote hover cards; callouts (`> [!note]`).
- Template drawer (JSON‑driven) + `/template` command.
- Inline task surfacing into a Today drawer.
- Snapshot banner (“Snapshot: Sep 3, 8:42 PM”).

***

## Phase 2 — Organization & Publishing Foundations

- Tags & Notebooks: inline `#tags`, `@people`; left rail filtering; saved views.
- Hybrid Search: instant title/tag regex + background semantic snippets; `Cmd/Ctrl+/` quick find.
- Publisher Frontmatter (title, slug, date, tags, summary, draft): validate+preview.
- Blog draft export: static artifact with file tree (`YYYY/MM/slug/index.md` + assets).
- Export to PDF (headless Chromium) and later DOCX (Pandoc path behind flag).

***

## Phase 3 — Reliability, Offline & Backfill

- Markdown backfill migration (server‑side) for legacy HTML entries (persist `markdown_content`).
- Offline mode: clear indicators; queued saves/publishes; replay upon reconnect.
- Conflict awareness: banner with diff; simple merge UI.
- Encryption at rest for local cache; optional passphrase notebooks (design doc).

***

## Phase 4 — Smart Autocomplete Foundations (Private)

- Provider interface: ghost text UI; accept (Tab), cycle (Alt+]), dismiss (Esc).
- Local embeddings per notebook; style profiles (“scholarly,” “story,” “lecture”).
- Ethical guardrails: never send text outside without explicit opt‑in; log completions.

***

## Workstreams & Parallelization

We’ll keep PRs small, scoped, and parallelizable:

- Frontend UX: entries rail + SplitPane + breadcrumb + TOC (1–2 devs). Parallel with Monaco theming & palette.
- Editor Core: vim toggle, folding, shortcuts; command palette (parallelizable by feature flags).
- Export & Publish: client export MD/HTML + minimal backend endpoints; later PDF/Publish.
- Backfill & Format Canonicalization: server‑side markdown backfill task (safe to run in background).
- Reliability: outbox retry/DLQ finishing touches (tests/metrics), offline queue (flag), conflict banner.
- QA/Tooling: test harness, a11y checks, perf snapshot, pre‑commit hooks; CI lanes.

Each workstream ships behind a short‑lived feature branch and tiny PRs (see Git below).

***

## Branching, PR & Merge Management

- Main is protected: squash merges only; no force pushes; linear history.
- Feature branches: `feature/<scope>-<short-desc>` (e.g., `feature/ui-entries-rail`).
- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`); scoped and atomic.
- PRs:
  \- Template enforced (see checklist below).
  \- Small scope (≤ 300 lines ideally); reviewer assigned; CI must pass.
  \- Link to roadmap item; include before/after screenshots (UI) and test notes.
  \- Merge strategy: squash; delete branch; create follow‑up issues for leftovers.
- Release tags: semantic version tags at milestones; changelog generated from commits.

PR Checklist

- [ ] Conventional title & clear scope
- [ ] Lint/format/typecheck pass
- [ ] Unit/component tests added/updated
- [ ] Integration tests (if endpoint/worker touched)
- [ ] A11y verified for new controls
- [ ] Docs updated (README/RUNNING\_THE\_APP/ROADMAP if needed)

***

## Testing, Linting, Formatting & Quality Gates

- Frontend
  \- Vitest unit tests; React Testing Library for components; Playwright E2E (optional lanes).
  \- Biome formatting/linting.
  \- Coverage target: ≥ 80% for unit/components (excluding story/demo code).
- Backend
  \- Pytest: unit, component (API+DB), integration (services). NATS tests behind flags.
  \- Ruff linting; formatter; mypy optional on API surface.
  \- Coverage target: ≥ 75% (honest coverage; exclude integration glue).
- CI Gates (GitHub Actions)
  \- Lint & format (fail on error). Typecheck passes.
  \- Unit + component tests on every PR; integration on main or label.
  \- Flags: `RUN_REAL_NATS=1` for NATS lanes; `OUTBOX_RETRY_ENABLED=1` lane for retry/DLQ.
  \- Artifact upload: coverage reports, playwright traces.

***

## Observability & Performance

- Metrics: counters for outbox publish attempts, DLQ, worker outcomes, provider calls/errors.
- Logs: structured event logs for retries, backoffs, DLQ reasons.
- Perf budgets: keystroke latency < 10ms p95; initial editor ready < 800ms dev.
- Dev HUD: optional toggle showing keystroke latency/diff size (dev only).

***

## Security & Privacy

- Secrets: env vars, gopass for local dev; never commit secrets.
- Data: sanitize input, strict Content Security, CORS limited in dev only.
- Privacy: future smart features opt‑in; clear disclosure; no external sending by default.

***

## Risks & Mitigations

- Large entries performance: fold/virtualize, debounced saves, careful plugin orchestration.
- Editor fragmentation: keep markdown as canonical; single source of truth; conversion tested.
- Retry storms: bounded retries, jitter, circuit breaker; DLQ visibility.
- Scope creep: small PRs, flags, roadmap ownership.

***

## Phase 1.5 — Concrete Tasks (Shortlist)

- [ ] Entries rail collapse/hover/keyboard toggle (Cmd/Ctrl+B); hover peek.
- [ ] SplitPane layout toggle (↔/↕) + persist; golden ratio snap.
- [ ] Breadcrumb + scroll‑spy; heading palette (Cmd/Ctrl+G).
- [ ] Folding: heading subtree + code fences; `Shift+Tab` to fold.
- [ ] Footnote hover cards; callouts styling.
- [ ] Template drawer (JSON config) + `/template` command.
- [ ] Inline tasks → Today drawer.
- [ ] Typewriter mode toggle.
- [ ] Export MD/HTML buttons.
- [ ] Monaco dusk theme sync to Sanctuary tokens.

Each task: 1 short branch → PR → CI → merge.

***

## Ownership & Process

- Roadmap updates: PRs to this doc; reviewers: design + lead dev.
- Weekly cadence: short planning check‑in; status updates inline here.
- Docs: RUNNING\_THE\_APP.md and README kept current; changelog per milestone.
