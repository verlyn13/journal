Deprecated Storybook Configuration
=================================

The root-level Storybook configuration is deprecated in favor of the app-scoped Storybook at `apps/web/.storybook`.

Please add/maintain stories under `apps/web/src/**/*.stories.tsx` and use the scripts in `apps/web/package.json`:
- `bun run storybook`
- `bun run build-storybook`

This avoids version mismatches (e.g., Tailwind 3 CDN vs Tailwind 4 pipeline) and keeps editor stories close to the code.

