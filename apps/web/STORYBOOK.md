# Storybook for apps/web

This project uses a dedicated Storybook instance under `apps/web` for all editor and Sanctuary theme documentation.

Run

- Development: `bun run storybook`
- Build static: `bun run build-storybook`

Notes

- Tailwind 4 styles are included via `src/index.css` and `src/styles/tailwind.css` in `.storybook/preview.ts`.
- The theme toggle honors the persisted `journal:theme` in localStorage; set it by using the UI in the app or manually setting localStorage.
- The legacy root-level Storybook config in `/.storybook` is deprecated. Please add new stories under `apps/web/src/**/*.stories.tsx` only.
