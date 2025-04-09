---
title: Rollup Configuration Recommendation (Single Config)
description: "Recommendation for using a single Rollup config with multiple named entries (JS and CSS) to simplify the build process and manifest generation."
category: "Initial Planning"
status: active
tags: ["rollup", "build", "configuration", "javascript", "css", "manifest"]
---


Below is a **practical recommendation** that fits your project setup and avoids the “no related origin name” or “could not resolve” pitfalls. **Short version**: **Use a single Rollup config with two named entries**—one for your JS (`main.js`), one for your CSS (`main.css`). That way, Rollup and the manifest plugin see everything in one pass, and you get a single, consistent `manifest.json` containing both hashed JS and CSS.

---

## Recommended Approach: Two Named Entries in One Config

1. **Remove** any line like `import '../css/main.css'` from your `main.js`.
2. **Use** a single `rollup.config.js` (or `.cjs`) that sets up:
   - **`input`**: an object with `{ main: 'src/js/main.js', styles: 'src/css/main.css' }`
   - **`postcss({ extract: true })`**: so the CSS is written as a separate file
   - **`outputManifest`** plugin: to produce a single manifest referencing both

### Example `rollup.config.js`

```js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import outputManifestPlugin from 'rollup-plugin-output-manifest';

const outputManifest = outputManifestPlugin.default || outputManifestPlugin;
const production = !process.env.ROLLUP_WATCH;

export default {
  // Multiple named entries: 'main' is your JS, 'styles' is your CSS
  input: {
    main: 'src/js/main.js',
    styles: 'src/css/main.css'
  },

  output: {
    dir: 'journal/static/gen/',
    format: 'es',
    sourcemap: !production,
    // Use placeholders to include unique hashes in your file names
    entryFileNames: '[name].[hash].js',
    chunkFileNames: 'chunks/[name].[hash].js',
    // For non-JS assets (like extracted CSS), use this pattern:
    assetFileNames: '[name].[hash].[ext]'
  },

  plugins: [
    resolve(),
    commonjs(),
    postcss({
      extract: true,        // Output a separate .css file
      minimize: production, // Minify in production
      // any other PostCSS plugins, e.g. autoprefixer, cssnano
    }),

    // The manifest plugin sees both JS & CSS from the same build
    outputManifest({
      fileName: 'manifest.json',
      // optional: publicPath: 'gen/',
      // optional: serializer: (manifest) => JSON.stringify(manifest, null, 2)
    })
  ]
};
```

### How This Works

- **Two named entries**:  
  - “`main`” -> `src/js/main.js` (your Alpine and editor code)  
  - “`styles`” -> `src/css/main.css` (your core stylesheet)  

- **PostCSS Extract**:  
  - Because `extract: true`, Rollup will generate a hashed CSS file for the “styles” entry.  
  - The manifest plugin sees these outputs (e.g. `main.abc123.js` and `styles.def456.css`) and writes them to `manifest.json`.  

- **No Extra Imports**:  
  - You do **not** need `import '.../main.css'` inside `main.js`—the “styles” entry covers that file.  
  - If you have multiple CSS files, you can either `@import` them inside `main.css` or add more named entries if you truly want multiple final CSS bundles.

---

## After the Build

1. **Run** `npm run build` and check `journal/static/gen/`. You should see something like:
   - `main.abc123.js`  
   - `styles.def456.css`  
   - `manifest.json`  

2. **Look** at the `manifest.json` contents. It likely has:
   ```json
   {
     "main.js": "main.abc123.js",
     "styles.css": "styles.def456.css"
   }
   ```

3. **Use** your Flask `asset_url` (or equivalent) to reference `"main.js"` and `"styles.css"`:
   ```html
   <!-- Base template or wherever you load them -->
   <script src="{{ asset_url('main.js') }}"></script>
   <link rel="stylesheet" href="{{ asset_url('styles.css') }}">
   ```

---

## Why This Resolves the Confusion

1. **No “Could Not Resolve”**: You’re not importing `.css` from `.js`, so Rollup is not forced to interpret CSS as a module.  
2. **No “No Related Origin Name”**: Because `styles: 'src/css/main.css'` is a **first‐class entry**, the build knows exactly which origin (“styles”) the extracted CSS came from, so the manifest plugin includes it.  
3. **Unified Build**: Only one config → only one pass. The plugin sees all final assets.  
4. **Simplicity**: No custom `generate()` logic. The plugin does the standard job of listing every output in the manifest.

---

## Additional Tips

- **If you have sub‐CSS**: Put them as `@import './other.css';` statements inside `main.css`, so the PostCSS plugin can bundle and optimize them together.  
- **If you prefer a single final CSS file**: You can keep it that way. The only difference is, you might rename the entry from `styles` to `mainStyles` or something more descriptive.  
- **If you want multiple CSS bundles**: You can add more entries, e.g. `adminStyles: 'src/css/admin.css'`. The plugin will produce a hashed `.css` and add it to the manifest.

Following this pattern avoids the back‐and‐forth with plugin ordering and ensures your hashed JS + CSS appear side by side in a single `manifest.json`.