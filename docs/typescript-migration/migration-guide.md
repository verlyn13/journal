# TypeScript Migration Guide for Journal Project

*Last Updated: 2025-08-30T00:47:27.106Z*

***

Here’s a clean, up-to-date `package.json` for **Aug 29, 2025** that keeps your current toolchain (Rollup + PostCSS + JSDoc) intact so you can upgrade safely before moving to TypeScript.

```json
{
  "name": "journal",
  "version": "1.0.0",
  "description": "A personal journal tool for documenting progress. Built with Flask, HTMX, and Alpine.js.",
  "type": "module",
  "main": "index.js",
  "directories": {
    "doc": "docs",
    "test": "tests"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "rollup -c rollup.config.mjs --failAfterWarnings",
    "build:verbose": "rollup -c rollup.config.mjs --failAfterWarnings --logLevel info --environment BUILD_DETAIL:true",
    "build:debug": "rollup -c rollup.config.mjs --failAfterWarnings --logLevel debug --environment BUILD_DETAIL:true",
    "dev": "rollup -c rollup.config.mjs -w --logLevel info --environment BUILD_DETAIL:true",
    "dev:silent": "rollup -c rollup.config.mjs -w --silent",
    "docs": "jsdoc -c jsdoc.conf.json",
    "lint:md": "markdownlint \"docs/**/*.md\"",
    "lint:links": "markdown-link-check \"docs/**/*.md\""
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/verlyn13/journal.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/verlyn13/journal/issues"
  },
  "homepage": "https://github.com/verlyn13/journal#readme",
  "engines": {
    "node": ">=18"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^28.0.6",
    "@rollup/plugin-node-resolve": "^16.0.1",
    "@rollup/plugin-terser": "^0.4.4",
    "autoprefixer": "^10.4.21",
    "cssnano": "^7.0.6",
    "jsdoc": "^4.0.4",
    "markdown-link-check": "^3.13.7",
    "markdownlint-cli": "^0.45.0",
    "postcss": "^8.5.3",
    "postcss-import": "^16.1.0",
    "rollup": "^4.48.1",
    "rollup-plugin-filesize": "^10.0.0",
    "rollup-plugin-output-manifest": "^2.0.0",
    "rollup-plugin-postcss": "^4.0.2"
  },
  "dependencies": {
    "@codemirror/commands": "^6.8.1",
    "@codemirror/lang-markdown": "^6.3.4",
    "@codemirror/language": "^6.11.3",
    "@codemirror/language-data": "^6.5.1",
    "@codemirror/state": "^6.5.2",
    "@codemirror/view": "^6.38.1",
    "alpinejs": "^3.14.9",
    "codemirror": "^6.0.2",
    "marked": "^16.2.1"
  }
}
```

### Notable version bumps (with sources)

- Rollup `^4.48.1` (latest 3 days ago). ([npm][1])
- `@rollup/plugin-commonjs` `^28.0.6`. ([npm][2])
- `@rollup/plugin-node-resolve` `^16.0.1`. ([npm][3])
- `@rollup/plugin-terser` current line remains `^0.4.4` (still the maintained plugin; the old `rollup-plugin-terser` is deprecated). ([npm][4], [GitHub][5])
- `markdownlint-cli` `^0.45.0`. ([npm][6])
- CodeMirror packages: `@codemirror/view` `^6.38.1`, `state` `^6.5.2`, `language` `^6.11.3`, `lang-markdown` `^6.3.4`, metapackage `codemirror` `^6.0.2`. ([npm][7])
- `marked` updated to `^16.2.1` (released Aug 27, 2025). ([GitHub][8])

> Optional cleanup: if you’re not actually using **TaffyDB** at runtime, remove it—Minami (your JSDoc theme) mentions Taffy internally, but your app doesn’t need `taffydb` as a dependency. ([GitHub][9])

***

## Migration plan: “pure TypeScript” with minimal churn

This keeps Rollup and PostCSS, swaps JSDoc➡TypeDoc, and produces declarations for consumers (if you ever publish a package). Links are official where it matters.

### 0) Add TypeScript toolchain (no code changes yet)

```sh
# choose one of npm/pnpm/bun
npm i -D typescript tslib @rollup/plugin-typescript rollup-plugin-dts typedoc
```

- TypeScript 5.9 is current (Aug 2025). Use `^5.9.x`. ([GitHub][10])
- `rollup-plugin-dts` ≥6.1.0 supports Rollup 4. ([Yarn][11])

**package.json deltas for TS phase (add when you’re ready):**

```json
{
  "scripts": {
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "build": "rollup -c rollup.config.mjs --failAfterWarnings",
    "build:types": "rollup -c rollup.config.dts.mjs",
    "docs": "typedoc --options typedoc.json"
  },
  "devDependencies": {
    "@rollup/plugin-typescript": "^<latest>",
    "rollup-plugin-dts": "^6.1.0",
    "typedoc": "^<latest>",
    "tslib": "^2.6.0",
    "typescript": "^5.9.0"
  }
}
```

> I didn’t hard-pin exact `@rollup/plugin-typescript` / `typedoc` patch numbers here because they change frequently; install the latest per npm when you run the command above. Official plugin hub: Rollup Plugins monorepo. ([GitHub][12])

### 1) Create `tsconfig.json`

A pragmatic config for browser bundles (ESNext modules) that still plays nicely with Rollup:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "noEmit": true,
    "types": []
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

- Keep `"noEmit": true` for the main build (Rollup handles output). Use the DTS Rollup step to emit `.d.ts` bundles. ([Yarn][11])

### 2) Update `rollup.config.mjs` (JS → TS build)

Minimal plugin chain (ESM config):

```js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { terser } from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/journal.esm.js', format: 'esm', sourcemap: true },
    { file: 'dist/journal.iife.js', format: 'iife', name: 'Journal', sourcemap: true }
  ],
  plugins: [
    resolve(),
    commonjs(),
    postcss({ extract: true }),
    typescript({ tsconfig: './tsconfig.json' }),
    terser()
  ]
};
```

- Node ≥18 is OK here per plugin requirements. ([npm][2])

### 3) Add a DTS bundling config

`rollup.config.dts.mjs`:

```js
import dts from 'rollup-plugin-dts';
export default {
  input: 'dist/types/src/index.d.ts',
  output: { file: 'dist/journal.d.ts', format: 'es' },
  plugins: [dts()]
};
```

Then run:

```sh
npm run typecheck
npm run build
npm run build:types
```

- `rollup-plugin-dts` v6+ targets Rollup 3/4 and TS ≥4.5. ([Yarn][11])

### 4) Swap JSDoc → TypeDoc (optional but recommended for TS)

- Replace the `docs` script with TypeDoc, which reads TypeScript types/JSdoc and generates HTML/Markdown docs. (Changelog/docs show modern TS support.) ([TypeDoc][13])
- If you prefer to keep JSDoc for prose, you can run both (TypeScript for types, JSDoc for guides). TS itself supports JSDoc annotations too. ([TypeScript][14])

### 5) Code moves

- Rename your entry to `src/index.ts` and convert modules incrementally:

  - Add file-level types (parameters/returns).
  - For CodeMirror v6 and Alpine.js you usually **don’t** need `@types/*`; both ship types or don’t need them.
  - If you expose any public API, export those types so TypeDoc and the `.d.ts` bundle include them.

### 6) Runtime + Flask wiring (unchanged)

- Keep `rollup-plugin-output-manifest` so Flask can read hashed filenames as you do now.
- Your CSS pipeline (PostCSS + Autoprefixer + cssnano) stays the same; the PostCSS plugin remains 4.0.2. ([npm][15])

### 7) Nice-to-haves (later)

- Add `browserslist` if you want Autoprefixer targeting to be explicit.
- Consider `markdownlint-cli2` later if you want a faster, config-driven Markdown lint experience; your current `markdownlint-cli` is fine and current. ([npm][6], [GitHub][16])

***

## Quick upgrade commands

```sh
# upgrade deps shown above
npm i -D rollup@^4.48.1 @rollup/plugin-commonjs@^28.0.6 @rollup/plugin-node-resolve@^16.0.1 @rollup/plugin-terser@^0.4.4 markdownlint-cli@^0.45.0
npm i @codemirror/view@^6.38.1 @codemirror/state@^6.5.2 @codemirror/language@^6.11.3 @codemirror/lang-markdown@^6.3.4 codemirror@^6.0.2 marked@^16.2.1
```

If you want me to spit out the matching `tsconfig.json`, `rollup.config.mjs`, and `rollup.config.dts.mjs` files customized to your repo layout (and Flask static paths), I can generate those next.

[1]: https://www.npmjs.com/package/rollup?utm_source=chatgpt.com "rollup"

[2]: https://www.npmjs.com/package/%40rollup/plugin-commonjs?utm_source=chatgpt.com "rollup/plugin-commonjs"

[3]: https://www.npmjs.com/package/%40rollup/plugin-node-resolve?utm_source=chatgpt.com "rollup/plugin-node-resolve"

[4]: https://www.npmjs.com/package/%40rollup/plugin-terser?utm_source=chatgpt.com "rollup/plugin-terser"

[5]: https://github.com/gka/chroma.js/issues/324?utm_source=chatgpt.com "rollup-plugin-terser has been deprecated · Issue #324"

[6]: https://www.npmjs.com/package/markdownlint-cli?utm_source=chatgpt.com "markdownlint-cli"

[7]: https://www.npmjs.com/package/rollup-plugin-output-manifest?utm_source=chatgpt.com "rollup-plugin-output-manifest - NPM"

[8]: https://github.com/markedjs/marked/releases?utm_source=chatgpt.com "Releases · markedjs/marked"

[9]: https://github.com/nijikokun/minami "GitHub - nijikokun/minami:  Clean and minimal JSDoc 3 Template / Theme"

[10]: https://github.com/nijikokun/minami?utm_source=chatgpt.com "Minami - Clean and minimal JSDoc 3 Template / Theme"

[11]: https://classic.yarnpkg.com/en/package/rollup-plugin-dts?utm_source=chatgpt.com "rollup-plugin-dts"

[12]: https://github.com/rollup/plugins?utm_source=chatgpt.com "The one-stop shop for official Rollup plugins"

[13]: https://typedoc.org/documents/Changelog.html?utm_source=chatgpt.com "Changelog"

[14]: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html?utm_source=chatgpt.com "Documentation - JSDoc Reference"

[15]: https://www.npmjs.com/package/rollup-plugin-postcss?utm_source=chatgpt.com "rollup-plugin-postcss"

[16]: https://github.com/DavidAnson/markdownlint-cli2?utm_source=chatgpt.com "DavidAnson/markdownlint-cli2"
