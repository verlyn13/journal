---
id: phase-13-Vite-manifest-issue
title: Debugging Vite Manifest Generation for Phase 13
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags: []
priority: medium
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-09'
---

***

title: Debugging Summary - Phase 13 Vite Manifest Issue
category: Debugging
phase: 13
description: "Summary of debugging efforts to resolve issues with Vite manifest generation, specifically capturing both JS and CSS hashed filenames."
status: active
related\_docs:
\- ../implementation/13-phase-thirteen-structure-refactor.md
\- ../../Vite.config.js
-------------------------

# Debugging Vite Manifest Generation for Phase 13

**Date:** 2025-04-08

**Objective:** Ensure Vite generates a `manifest.json` file in `journal/static/gen/` that correctly maps original asset names (e.g., `main.js`, `main.css`) to their hashed output filenames (e.g., `gen/packed.[hash].js`, `gen/packed.[hash].css`). This is crucial for the Flask `asset_url` function to provide cache-busted URLs in templates.

**Problem:** Difficulty configuring Vite plugins (`Vite-plugin-output-manifest` or `Vite-plugin-manifest-json`) to reliably capture the hashed filenames for *both* the JavaScript bundle and the CSS bundle (extracted via `Vite-plugin-postcss`) within the same manifest file. The core issue seems to be timing: the manifest generation often runs before the CSS file hashing/extraction is complete.

**Attempts & Errors:**

1. **Initial State:** `Vite-plugin-output-manifest` used within the JS bundle config.

- **Configuration:** Included a `generate` function attempting to manually find the hashed CSS file using `fs.readdirSync` and add it to the manifest.
- **Result:** `manifest.json` only contained the JS mapping. The `generate` function failed to find the CSS file (likely ran too early).
- **File:** `journal/static/gen/manifest.json` contained `{"main.js": "gen/packed.uziU5eyp.js"}` (example hash).

2. **Attempt 2: Switch to `Vite-plugin-manifest-json`**

- **Action:** Installed `Vite-plugin-manifest-json`, replaced `Vite-plugin-output-manifest` in the JS bundle config.
- **Configuration 2a:** Provided `input: ['src/js/main.js', 'src/css/main.css']`.
- **Error 2a:** `TypeError: The "paths[0]" argument must be of type string. Received an instance of Array` (Plugin expected string input, not array).
- **Configuration 2b:** Removed `input` option.
- **Error 2b:** `Error: No manifest input file supplied. Please specify the \`input\` paramater.`(Plugin requires`input\`).
- **Configuration 2c:** Added `input: 'src/js/main.js'`.
- **Error 2c:** `SyntaxError: Unexpected token 'i', "import Alp"... is not valid JSON` (Plugin incorrectly tried to parse JS input as JSON).
- **Configuration 2d:** Removed `input`, modified `generate` function signature based on potential plugin API (`generate: (seed, files) => ...`).
- **Error 2d:** `Error: No manifest input file supplied. Please specify the \`input\` paramater.\` (Back to requiring input).

3. **Attempt 3: Revert to `Vite-plugin-output-manifest`, move to CSS bundle**

- **Action:** Uninstalled `Vite-plugin-manifest-json`, re-installed `Vite-plugin-output-manifest`. Moved the plugin config from the JS bundle to the CSS bundle's plugin list. Included a complex `generate` function trying to find both files via `fs.readdirSync`.
- **Error:** `TypeError: generateFunc(...) is not a function`. Also, log output showed it found `packed.css` (unhashed). The `generate` function signature was likely incorrect for the plugin's internal use, and the timing issue persisted.

4. **Attempt 4 (Current): Simplify - Manifest for JS only**

- **Action:** Moved `Vite-plugin-output-manifest` back to the JS bundle config.
- **Configuration:** Removed the custom `generate` function entirely. Let the plugin handle only the JS mapping automatically. Removed the plugin from the CSS bundle config.
- **Goal:** Generate a manifest with just the JS mapping. Plan to modify the Flask `asset_url` function to manually find the hashed CSS file at runtime.
- **Status:** Configuration updated, build command pending execution.

**Current `Vite.config.js` State Description:**

The configuration exports an array with two main objects: one for the JavaScript bundle and one for the CSS bundle.

- **JS Bundle Config:**

- `input`: `src/js/main.js`

- `output`: Specifies `dir: 'journal/static/gen/'`, `format: 'es'`, `entryFileNames: 'packed.[hash].js'`, `chunkFileNames: '[name]-[hash].js'`.

- `plugins`: Includes `resolve`, `commonjs`, `terser` (conditional), and `outputManifest`.

- `outputManifest` config: Specifies `fileName: 'manifest.json'`, `publicPath: 'gen/'`, and a `serializer` for pretty-printing. It does *not* have a custom `generate` function.

- **CSS Bundle Config:**

- `input`: `src/css/main.css`

- `output`: Specifies `file: 'journal/static/gen/.css-placeholder'`, `format: 'es'`.

- `plugins`: Includes `postcss`.

- `postcss` config: Specifies `extract: path.resolve(__dirname, 'journal/static/gen/packed.[hash].css')` and includes `postcssImport`, `autoprefixer`, and `cssnano` (conditional) as sub-plugins. It does *not* include the `outputManifest` plugin.

**Next Step:** Run `bun run build` with the simplified configuration and verify the generated `manifest.json`. Then, adjust the Flask `asset_url` function.
