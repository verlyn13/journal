# Journal Web (apps/web)

Modern Sanctuary-themed journal editor built with React 18, TypeScript, Tailwind CSS 4, Tiptap, and Monaco.

## Prerequisites

- Bun installed
- Node 18+ (for tooling)

## Install

```
cd apps/web
bun install
```

## Development

```
bun run dev
```
Open http://localhost:5173 (or Playwright config uses 5174).

## Storybook

- Dev: `bun run storybook` (http://localhost:6006)
- Build: `bun run build-storybook`

Stories live alongside components under `src/components/**`. The root-level Storybook is deprecated.

## Testing

**See [TESTING.md](TESTING.md) for complete testing documentation.**

### Quick Start

```bash
# Run all tests
bun test

# Run with watch mode
bun test --watch

# Run complete quality checks (lint, types, tests, bundle)
bun run quality:all
```

### Current Status

- **Test Framework**: Vitest 3.2.4
- **Tests**: 7 passing, 3 skipped
- **Bundle Size**: 1318KB (under 1500KB limit ✅)

### Playwright E2E (Optional)

- Install browsers: `npx playwright install --with-deps`
- Run E2E tests: `bunx playwright test`
- Uses port 5174 (keep free or adjust `playwright.config.ts`)

## Theme (Dawn/Dusk)

- Toggle in Sidebar (persists in localStorage as `journal:theme`)
- Uses Tailwind 4 tokens in `tailwind.config.js` and CSS variables in `src/index.css`

## Code Style

- TypeScript strict mode
- Tailwind 4 utility-first styling
- Biome config available at repo root (`.biome.json`); run `bunx biome check --write` at project root for formatting/lint (if installed).

## Notes

- Monaco languages are populated dynamically (50+ supported) and merged with seed list.
- Slash menu exposes test ids for E2E stability.

## Backend API Integration (FastAPI)

This frontend talks to the FastAPI backend in `apps/api`.

1) Start the API:
```bash
cd ../api
make setup   # starts Postgres(5433), Redis(6380), NATS(4222) and runs migrations
make dev     # API at http://127.0.0.1:8000
```

2) Configure API URL (create `.env` in `apps/web`):
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

3) Demo login in development:
- Use demo credentials `demo` / `demo123` in the app login form, or
- Obtain tokens directly from `POST /api/v1/auth/demo` and store `access_token`/`refresh_token` in localStorage (for manual testing).
