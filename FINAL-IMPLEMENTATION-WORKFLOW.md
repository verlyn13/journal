# Editor Migration — CodeMirror + Markdown (2–3 Weeks)

This plan upgrades the Journal editor safely, with explicit backend/frontend contracts, single-source normalization, strong security, and automated quality gates. No code changes should be made outside the steps below.

## Objectives

- Replace Tiptap with CodeMirror (Markdown) + ReactMarkdown rendering.
- Keep a single normalization source for entry list/detail VMs.
- Security via unified markdown → HTML pipeline with rehype-sanitize (not DOMPurify).
- Plan dual-storage transition (HTML + Markdown) behind a feature flag, then cutover.
- Add tests (unit, integration, E2E) and bundle budget checks while keeping CI green.

## Scope (What Changes, What Doesn’t)

- Introduce Markdown-first authoring with CodeMirror; render via ReactMarkdown.
- Maintain legacy HTML reads during transition. Add a Markdown column for dual-storage.
- Sanitize in the unified rehype pipeline (rehype-sanitize) during render.
- No uploads or feature creep in this migration.

## Phases & Timeline

### Phase 1 (Days 1–3): Planning & Contracts (This PR)

- Add this workflow and reference docs under root and `reference/`.
- Freeze contracts and risks: content HTML policy, upload endpoints, size limits, keyboard shortcuts, autosave.
- Define quality gates and CI commands.

Deliverables:
- `FINAL-IMPLEMENTATION-WORKFLOW.md` (this file)
- `reference/security-and-corrections.md`
- `reference/example-implementation.jsx`
- README updates for navigation

### Phase 2 (Days 4–7): Data Flow & Parallel Editor (feature-flagged)

- Confirm the single normalization source (already present) and list gating after auth.
- Add frontend feature flag `VITE_EDITOR=markdown|legacy`.
- Implement CodeMirror Markdown editor (authoring) and ReactMarkdown preview (rendering) behind the flag.
- Render pipeline: `ReactMarkdown + rehype-sanitize (+ rehype-katex, rehype-highlight)`.

Deliverables:
- Parallel editor toggled by flag; legacy editor untouched.
- Unit tests for mapper and basic markdown rendering pipeline.

### Phase 3 (Days 8–12): Migration & Security

- Add Turndown service to convert legacy HTML → Markdown during: (a) on-read (derived) and (b) background backfill.
- DB migration: add `entries.markdown TEXT NULL` (dual storage), write Markdown on save in new editor; preserve legacy HTML for rollback.
- Backfill job to convert existing HTML to Markdown (scripted batch; idempotent).
- Security: rely on rehype-sanitize in render pipeline; do not use DOMPurify.

Deliverables:
- Dual storage (HTML + Markdown), backfill script ready, feature-flag still on.
- Sanitization pipeline integrated in ReactMarkdown.

### Phase 4 (Days 13–15): Tests, Tooling, Docs

- Vitest unit tests: mapper, markdown pipeline (rehype-sanitize schema), turndown conversion cases.
- Playwright E2E: author markdown (headings, code, math), paste unsafe HTML → sanitized result.
- Bundle budget checks (< 700KB) and report in CI.
- Update docs; ensure all CI gates pass.

## Detailed Work Items

### Backend (FastAPI)

- Keep `entries.content` (HTML) for legacy reads.
- Add `entries.markdown TEXT NULL` for the transition. Write Markdown when the markdown editor is active.
- Backfill script/API command to convert `content (HTML)` → `markdown` using Turndown (node script) or a one-off worker.
- Security headers (optional): `X-Content-Type-Options: nosniff`, `Referrer-Policy`; CSP can be introduced after render audit.

Risks & mitigations:
- XSS → sanitize during render via rehype-sanitize with an allowlist schema (client-side ReactMarkdown).
- Data divergence (HTML vs Markdown) → dual-write during transition; backfill; add feature-flag fallback.

### Frontend (React + CodeMirror + ReactMarkdown)

- Normalization:
  - Keep `EntryApi` → `EntryVm` mapping in `lib/entryMapper.ts` (single source of truth).
- Editor:
  - Author in Markdown with CodeMirror; show live preview using ReactMarkdown.
  - Render pipeline includes: `rehype-sanitize` (schema), `rehype-katex` for math, `rehype-highlight` for code.
  - No DOMPurify; sanitization belongs in the rehype pipeline.
  - Autosave: keep interval; debounce keypress to reduce churn.

### Tests

- Unit (Vitest):
  - `toEntryVm` mapping (dates, preview, defaults).
  - `rehype-sanitize` schema: sample HTML input → expected clean output.
  - Turndown conversion: selected HTML cases → expected Markdown.

- Integration (API):
  - `apps/api/tests`: entries CRUD (already present); add upload tests if endpoint implemented.

- E2E (Playwright):
  - Author Markdown → saved entry shows correct preview in list.
  - Insert fenced code and math; paste unsafe HTML → sanitized by render pipeline.

### CI / Quality Gates

- Web:
  - `bun run typecheck`
  - `bun run lint`
  - `bun run format`
  - `bun run test` (Vitest)
  - `bunx playwright test` (optional in CI or nightly)
  - Bundle budget check (< 700KB total JS) with `vite-bundle-visualizer` or `rollup-plugin-visualizer` report in PR.

- API:
  - `cd apps/api && make test` (pytest)
  - `make lint` (ruff) and mypy if configured

Acceptance: CI must be green; zero console errors; basic editor flows pass E2E.

## Agentic Orchestration (Few-Run Plan)

Use these steps to implement without hiccups:

1) Create feature branch: `git checkout -b feat/editor-upgrade`
2) Phase 2 changes:
   - Ensure normalization & list gating (done).
   - Add feature flag; add CodeMirror + ReactMarkdown behind flag.
   - Add unit tests: mapper and minimal markdown render.
   - Run:
     - `bun run typecheck && bun run lint && bun run format`
     - `cd apps/api && make test`
     - `bun run test`
3) Phase 3 changes:
   - Add Turndown and dual-write; DB migration (markdown column); backfill job.
   - Configure rehype-sanitize schema (see reference doc) for ReactMarkdown.
   - Update docs.
   - Run quality gates and Playwright E2E locally.
4) Phase 4:
   - Finalize tests; enable E2E in CI if stable.
   - Squash commits; open PR with checklist below.

## PR Checklist (Reviewer-Visible)

- [ ] Single-source mapping in `lib/entryMapper.ts`; no duplicate normalization.
- [ ] CodeMirror Markdown editor behind feature flag; legacy editor intact.
- [ ] ReactMarkdown render with rehype-sanitize (+ katex, highlight) configured and tested.
- [ ] Sanitization configured via rehype-sanitize; unsafe HTML removed in render.
- [ ] Tests: unit + API + E2E (when enabled) pass.
- [ ] Linting/format/typecheck all pass with project’s tools.
- [ ] Docs updated: README, reference files.

## References

- See `reference/security-and-corrections.md` for security allowlists and trade-offs.
- See `reference/example-implementation.jsx` for an end-to-end editor integration snippet.
