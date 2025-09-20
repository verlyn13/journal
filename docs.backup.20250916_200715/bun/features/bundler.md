# BUNDLER

*Source: <https://bun.sh/docs/bundler>*
*Fetched: 2025-08-30T00:47:26.755Z*

***

Bun's fast native bundler can be used via the `bun build` CLI command or the `Bun.build()` JavaScript API.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './build',
});

````

CLI```
bun build ./index.tsx --outdir ./build
````

It's fast. The numbers below represent performance on esbuild's [three.js benchmark](https://github.com/oven-sh/bun/tree/main/bench/bundle).

[](/images/bundler-speed.png)Bundling 10 copies of three.js from scratch, with sourcemaps and minification## [Why bundle?](#why-bundle)

The bundler is a key piece of infrastructure in the JavaScript ecosystem. As a brief overview of why bundling is so important:

- **Reducing HTTP requests.** A single package in `node_modules` may consist of hundreds of files, and large applications may have dozens of such dependencies. Loading each of these files with a separate HTTP request becomes untenable very quickly, so bundlers are used to convert our application source code into a smaller number of self-contained "bundles" that can be loaded with a single request.
- **Code transforms.** Modern apps are commonly built with languages or tools like TypeScript, JSX, and CSS modules, all of which must be converted into plain JavaScript and CSS before they can be consumed by a browser. The bundler is the natural place to configure these transformations.
- **Framework features.** Frameworks rely on bundler plugins & code transformations to implement common patterns like file-system routing, client-server code co-location (think `getServerSideProps` or Remix loaders), and server components.
- **Full-stack Applications.** Bun's bundler can handle both server and client code in a single command, enabling optimized production builds and single-file executables. With build-time HTML imports, you can bundle your entire application — frontend assets and backend server — into a single deployable unit.

Let's jump into the bundler API.

Note that the Bun bundler is not intended to replace `tsc` for typechecking or generating type declarations.

## [Basic example](#basic-example)

Let's build our first bundle. You have the following two files, which implement a simple client-side rendered React app.

./index.tsx./Component.tsx./index.tsx\`\`\`
import \* as ReactDOM from 'react-dom/client';
import {Component} from "./Component"

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render()

````

./Component.tsx```
export function Component(props: {message: string}) {
  return {props.message}

}

````

Here, `index.tsx` is the "entrypoint" to our application. Commonly, this will be a script that performs some *side effect*, like starting a server or—in this case—initializing a React root. Because we're using TypeScript & JSX, we need to bundle our code before it can be sent to the browser.

To create our bundle:

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
})

````

CLI```
bun build ./index.tsx --outdir ./out
````

For each file specified in `entrypoints`, Bun will generate a new bundle. This bundle will be written to disk in the `./out` directory (as resolved from the current working directory). After running the build, the file system looks like this:

```
.
├── index.tsx
├── Component.tsx
└── out
    └── index.js

```

The contents of `out/index.js` will look something like this:

out/index.js\`\`\`
// ...
// \~20k lines of code
// including the contents of `react-dom/client` and all its dependencies
// this is where the $jsxDEV and $createRoot functions are defined

// Component.tsx
function Component(props) {
return $jsxDEV("p", {
children: props.message
}, undefined, false, undefined, this);
}

// index.tsx
var rootNode = document.getElementById("root");
var root = $createRoot(rootNode);
root.render($jsxDEV(Component, {
message: "Sup!"
}, undefined, false, undefined, this));

```

Tutorial: Run this file in your browser

We can load this file in the browser to see our app in action. Create an `index.html` file in the `out` directory:

```

touch out/index.html

```

Then paste the following contents into it:

```

```

Then spin up a static file server serving the `out` directory:

```

bunx serve out

```

Visit `http://localhost:5000` to see your bundled app in action.

## [Watch mode](#watch-mode)

Like the runtime and test runner, the bundler supports watch mode natively.

```

bun build ./index.tsx --outdir ./out --watch

```

## [Content types](#content-types)

Like the Bun runtime, the bundler supports an array of file types out of the box. The following table breaks down the bundler&#x27;s set of standard "loaders". Refer to [Bundler > File types](https://bun.com/docs/runtime/loaders) for full documentation.

ExtensionsDetails`.js` `.jsx`, `.cjs` `.mjs` `.mts` `.cts` `.ts` `.tsx`Uses Bun&#x27;s built-in transpiler to parse the file and transpile TypeScript/JSX syntax to vanilla JavaScript. The bundler executes a set of default transforms including dead code elimination and tree shaking. At the moment Bun does not attempt to down-convert syntax; if you use recently ECMAScript syntax, that will be reflected in the bundled code.`.json`

JSON files are parsed and inlined into the bundle as a JavaScript object.

```

import pkg from "./package.json";
pkg.name; // => "my-package"

```

`.toml`

TOML files are parsed and inlined into the bundle as a JavaScript object.

```

import config from "./bunfig.toml";
config.logLevel; // => "debug"

```

`.txt`

The contents of the text file are read and inlined into the bundle as a string.

```

import contents from "./file.txt";
console.log(contents); // => "Hello, world!"

````

`.node` `.wasm`These files are supported by the Bun runtime, but during bundling they are treated as [assets](#assets).### [Assets](#assets)

If the bundler encounters an import with an unrecognized extension, it treats the imported file as an *external file*. The referenced file is copied as-is into `outdir`, and the import is resolved as a *path* to the file.

InputOutputInput```
// bundle entrypoint
import logo from "./logo.svg";
console.log(logo);

````

Output\`\`\`
// bundled output
var logo = "./logo-ab237dfe.svg";
console.log(logo);

````

The exact behavior of the file loader is also impacted by [`naming`](#naming) and [`publicPath`](#publicpath).

Refer to the [Bundler > Loaders](https://bun.com/docs/bundler/loaders#file) page for more complete documentation on the file loader.

### [Plugins](#plugins)

The behavior described in this table can be overridden or extended with [plugins](https://bun.com/docs/bundler/plugins). Refer to the [Bundler > Loaders](https://bun.com/docs/bundler/plugins) page for complete documentation.

## [API](#api)

### [`entrypoints`](#entrypoints)

**Required.** An array of paths corresponding to the entrypoints of our application. One bundle will be generated for each entrypoint.

JavaScriptCLIJavaScript```
const result = await Bun.build({
  entrypoints: ["./index.ts"],
});
// => { success: boolean, outputs: BuildArtifact[], logs: BuildMessage[] }

````

CLI\`\`\`
bun build --entrypoints ./index.ts

```
```

# the bundle will be printed to stdout

#

````

### [`outdir`](#outdir)

The directory where output files will be written.

JavaScriptCLIJavaScript```
const result = await Bun.build({
  entrypoints: ['./index.ts'],
  outdir: './out'
});
// => { success: boolean, outputs: BuildArtifact[], logs: BuildMessage[] }

````

CLI\`\`\`
bun build --entrypoints ./index.ts --outdir ./out

```
```

# a summary of bundled files will be printed to stdout

```

If `outdir` is not passed to the JavaScript API, bundled code will not be written to disk. Bundled files are returned in an array of `BuildArtifact` objects. These objects are Blobs with extra properties; see [Outputs](#outputs) for complete documentation.

```

const result = await Bun.build({
entrypoints: \["./index.ts"],
});

for (const res of result.outputs) {
// Can be consumed as blobs
await res.text();

// Bun will set Content-Type and Etag headers
new Response(res);

// Can be written manually, but you should use `outdir` in this case.
Bun.write(path.join("out", res.path), res);
}

````

When `outdir` is set, the `path` property on a `BuildArtifact` will be the absolute path to where it was written to.

### [`target`](#target)

The intended execution environment for the bundle.

JavaScriptCLIJavaScript```
await Bun.build({
  entrypoints: ['./index.ts'],
  outdir: './out',
  target: 'browser', // default
})

````

CLI\`\`\`
bun build --entrypoints ./index.ts --outdir ./out --target browser

````

Depending on the target, Bun will apply different module resolution rules and optimizations.

`browser`*Default.* For generating bundles that are intended for execution by a browser. Prioritizes the `"browser"` export condition when resolving imports. Importing any built-in modules, like `node:events` or `node:path` will work, but calling some functions, like `fs.readFile` will not work.`bun`

For generating bundles that are intended to be run by the Bun runtime. In many cases, it isn&#x27;t necessary to bundle server-side code; you can directly execute the source code without modification. However, bundling your server code can reduce startup times and improve running performance. This is the target to use for building full-stack applications with build-time HTML imports, where both server and client code are bundled together.

All bundles generated with `target: "bun"` are marked with a special `// @bun` pragma, which indicates to the Bun runtime that there&#x27;s no need to re-transpile the file before execution.

If any entrypoints contains a Bun shebang (`#!/usr/bin/env bun`) the bundler will default to `target: "bun"` instead of `"browser"`.

When using `target: "bun"` and `format: "cjs"` together, the `// @bun @bun-cjs` pragma is added and the CommonJS wrapper function is not compatible with Node.js.

`node`For generating bundles that are intended to be run by Node.js. Prioritizes the `"node"` export condition when resolving imports, and outputs `.mjs`. In the future, this will automatically polyfill the `Bun` global and other built-in `bun:*` modules, though this is not yet implemented.### [`format`](#format)

Specifies the module format to be used in the generated bundles.

Bun defaults to `"esm"`, and provides experimental support for `"cjs"` and `"iife"`.

#### `format: "esm"` - ES Module

This is the default format, which supports ES Module syntax including top-level `await`, import.meta, and more.

JavaScriptCLIJavaScript```
await Bun.build({
  entrypoints: ['./index.tsx'],
  outdir: './out',
  format: "esm",
})

````

CLI\`\`\`
bun build ./index.tsx --outdir ./out --format esm

````

To use ES Module syntax in browsers, set `format` to `"esm"` and make sure your `<script type="module">` tag has `type="module"` set.

#### `format: "cjs"` - CommonJS

To build a CommonJS module, set `format` to `"cjs"`. When choosing `"cjs"`, the default target changes from `"browser"` (esm) to `"node"` (cjs). CommonJS modules transpiled with `format: "cjs", target: "node"` can be executed in both Bun and Node.js (assuming the APIs in use are supported by both).

JavaScriptCLIJavaScript```
await Bun.build({
  entrypoints: ['./index.tsx'],
  outdir: './out',
  format: "cjs",
})

````

CLI\`\`\`
bun build ./index.tsx --outdir ./out --format cjs

````

#### `format: "iife"` - IIFE

TODO: document IIFE once we support globalNames.

### [`splitting`](#splitting)

Whether to enable code splitting.

JavaScriptCLIJavaScript```
await Bun.build({
  entrypoints: ['./index.tsx'],
  outdir: './out',
  splitting: false, // default
})

````

CLI\`\`\`
bun build ./index.tsx --outdir ./out --splitting

````

When `true`, the bundler will enable *code splitting*. When multiple entrypoints both import the same file, module, or set of files/modules, it&#x27;s often useful to split the shared code into a separate bundle. This shared bundle is known as a *chunk*. Consider the following files:

entry-a.tsentry-b.tsshared.tsentry-a.ts```
import { shared } from './shared.ts';

````

entry-b.ts\`\`\`
import { shared } from './shared.ts';

````

shared.ts```
export const shared = 'shared';

````

To bundle `entry-a.ts` and `entry-b.ts` with code-splitting enabled:

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./entry-a.ts', './entry-b.ts'],
outdir: './out',
splitting: true,
})

````

CLI```
bun build ./entry-a.ts ./entry-b.ts --outdir ./out --splitting
````

Running this build will result in the following files:

```
.
├── entry-a.tsx
├── entry-b.tsx
├── shared.tsx
└── out
    ├── entry-a.js
    ├── entry-b.js
    └── chunk-2fce6291bf86559d.js

```

The generated `chunk-2fce6291bf86559d.js` file contains the shared code. To avoid collisions, the file name automatically includes a content hash by default. This can be customized with [`naming`](#naming).

### [`plugins`](#plugins)

A list of plugins to use during bundling.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
plugins: \[/\* ... \*/],
})

````

CLI```
n/a

````

Bun implements a universal plugin system for both Bun's runtime and bundler. Refer to the [plugin documentation](https://bun.com/docs/bundler/plugins) for complete documentation.

### [`env`](#env)

Controls how environment variables are handled during bundling. Internally, this uses `define` to inject environment variables into the bundle, but makes it easier to specify the environment variables to inject.

#### `env: "inline"`

Injects environment variables into the bundled output by converting `process.env.FOO` references to string literals containing the actual environment variable values.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
env: "inline",
})

````

CLI```
FOO=bar BAZ=123 bun build ./index.tsx --outdir ./out --env inline
````

For the input below:

input.js\`\`\`
console.log(process.env.FOO);
console.log(process.env.BAZ);

````

The generated bundle will contain the following code:

output.js```
console.log("bar");
console.log("123");

````

#### `env: "PUBLIC_*"` (prefix)

Inlines environment variables matching the given prefix (the part before the `*` character), replacing `process.env.FOO` with the actual environment variable value. This is useful for selectively inlining environment variables for things like public-facing URLs or client-side tokens, without worrying about injecting private credentials into output bundles.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',

// Inline all env vars that start with "ACME\_PUBLIC\_"
env: "ACME\_PUBLIC\_\*",
})

````

CLI```
FOO=bar BAZ=123 ACME_PUBLIC_URL=https://acme.com bun build ./index.tsx --outdir ./out --env 'ACME_PUBLIC_*'
````

For example, given the following environment variables:

```
FOO=bar BAZ=123 ACME_PUBLIC_URL=https://acme.com
```

And source code:

index.tsx\`\`\`
console.log(process.env.FOO);
console.log(process.env.ACME\_PUBLIC\_URL);
console.log(process.env.BAZ);

```

The generated bundle will contain the following code:

```

console.log(process.env.FOO);
console.log("<https://acme.com>");
console.log(process.env.BAZ);

```

#### `env: "disable"`

Disables environment variable injection entirely.

For example, given the following environment variables:

```

FOO=bar BAZ=123 ACME\_PUBLIC\_URL=<https://acme.com>

````

And source code:

index.tsx```
console.log(process.env.FOO);
console.log(process.env.ACME_PUBLIC_URL);
console.log(process.env.BAZ);

````

The generated bundle will contain the following code:

```
console.log(process.env.FOO);
console.log(process.env.BAZ);

```

### [`sourcemap`](#sourcemap)

Specifies the type of sourcemap to generate.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
sourcemap: 'linked', // default 'none'
})

````

CLI```
bun build ./index.tsx --outdir ./out --sourcemap=linked
````

`"none"`*Default.* No sourcemap is generated.`"linked"`

A separate `*.js.map` file is created alongside each `*.js` bundle using a `//# sourceMappingURL` comment to link the two. Requires `--outdir` to be set. The base URL of this can be customized with `--public-path`.

```
//

//# sourceMappingURL=bundle.js.map

```

`"external"`A separate `*.js.map` file is created alongside each `*.js` bundle without inserting a `//# sourceMappingURL` comment.Generated bundles contain a [debug id](https://sentry.engineering/blog/the-case-for-debug-ids) that can be used to associate a bundle with its corresponding sourcemap. This `debugId` is added as a comment at the bottom of the file.

```
//

//# debugId=

```

- `"inline"`

A sourcemap is generated and appended to the end of the generated bundle as a base64 payload.

```
//

//# sourceMappingURL=data:application/json;base64,

```

The associated `*.js.map` sourcemap will be a JSON file containing an equivalent `debugId` property.

### [`minify`](#minify)

Whether to enable minification. Default `false`.

When targeting `bun`, identifiers will be minified by default.

To enable all minification options:

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
minify: true, // default false
})

````

CLI```
bun build ./index.tsx --outdir ./out --minify
````

To granularly enable certain minifications:

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
minify: {
whitespace: true,
identifiers: true,
syntax: true,
},
})

````

CLI```
bun build ./index.tsx --outdir ./out --minify-whitespace --minify-identifiers --minify-syntax
````

### [`external`](#external)

A list of import paths to consider *external*. Defaults to `[]`.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
external: \["lodash", "react"], // default: \[]
})

````

CLI```
bun build ./index.tsx --outdir ./out --external lodash --external react
````

An external import is one that will not be included in the final bundle. Instead, the `import` statement will be left as-is, to be resolved at runtime.

For instance, consider the following entrypoint file:

index.tsx\`\`\`
import \_ from "lodash";
import {z} from "zod";

const value = z.string().parse("Hello world!")
console.log(\_.upperCase(value));

````

Normally, bundling `index.tsx` would generate a bundle containing the entire source code of the `"zod"` package. If instead, we want to leave the `import` statement as-is, we can mark it as external:

JavaScriptCLIJavaScript```
await Bun.build({
  entrypoints: ['./index.tsx'],
  outdir: './out',
  external: ['zod'],
})

````

CLI\`\`\`
bun build ./index.tsx --outdir ./out --external zod

````

The generated bundle will look something like this:

out/index.js```
import {z} from "zod";

// ...
// the contents of the "lodash" package
// including the `_.upperCase` function

var value = z.string().parse("Hello world!")
console.log(_.upperCase(value));

````

To mark all imports as external, use the wildcard `*`:

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
external: \['\*'],
})

````

CLI```
bun build ./index.tsx --outdir ./out --external '*'
````

### [`packages`](#packages)

Control whatever package dependencies are included to bundle or not. Possible values: `bundle` (default), `external`. Bun treats any import which path do not start with `.`, `..` or `/` as package.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.ts'],
packages: 'external',
})

````

CLI```
bun build ./index.ts --packages external
````

### [`naming`](#naming)

Customizes the generated file names. Defaults to `./[dir]/[name].[ext]`.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
naming: "\[dir]/\[name].\[ext]", // default
})

````

CLI```
bun build ./index.tsx --outdir ./out --entry-naming [dir]/[name].[ext]
````

By default, the names of the generated bundles are based on the name of the associated entrypoint.

```
.
├── index.tsx
└── out
    └── index.js

```

With multiple entrypoints, the generated file hierarchy will reflect the directory structure of the entrypoints.

```
.
├── index.tsx
└── nested
    └── index.tsx
└── out
    ├── index.js
    └── nested
        └── index.js

```

The names and locations of the generated files can be customized with the `naming` field. This field accepts a template string that is used to generate the filenames for all bundles corresponding to entrypoints. where the following tokens are replaced with their corresponding values:

- `[name]` - The name of the entrypoint file, without the extension.
- `[ext]` - The extension of the generated bundle.
- `[hash]` - A hash of the bundle contents.
- `[dir]` - The relative path from the project root to the parent directory of the source file.

For example:

Token`[name]``[ext]``[hash]``[dir]``./index.tsx``index``js``a1b2c3d4``""` (empty string)`./nested/entry.ts``entry``js``c3d4e5f6``"nested"`We can combine these tokens to create a template string. For instance, to include the hash in the generated bundle names:

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
naming: 'files/\[dir]/\[name]-\[hash].\[ext]',
})

````

CLI```
bun build ./index.tsx --outdir ./out --entry-naming [name]-[hash].[ext]
````

This build would result in the following file structure:

```
.
├── index.tsx
└── out
    └── files
        └── index-a1b2c3d4.js

```

When a `string` is provided for the `naming` field, it is used only for bundles *that correspond to entrypoints*. The names of [chunks](#splitting) and copied assets are not affected. Using the JavaScript API, separate template strings can be specified for each type of generated file.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
naming: {
// default values
entry: '\[dir]/\[name].\[ext]',
chunk: '\[name]-\[hash].\[ext]',
asset: '\[name]-\[hash].\[ext]',
},
})

````

CLI```
bun build ./index.tsx --outdir ./out --entry-naming "[dir]/[name].[ext]" --chunk-naming "[name]-[hash].[ext]" --asset-naming "[name]-[hash].[ext]"
````

### [`root`](#root)

The root directory of the project.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./pages/a.tsx', './pages/b.tsx'],
outdir: './out',
root: '.',
})

````

CLI```
n/a

````

If unspecified, it is computed to be the first common ancestor of all entrypoint files. Consider the following file structure:

```
.
└── pages
  └── index.tsx
  └── settings.tsx

```

We can build both entrypoints in the `pages` directory:

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./pages/index.tsx', './pages/settings.tsx'],
outdir: './out',
})

````

CLI```
bun build ./pages/index.tsx ./pages/settings.tsx --outdir ./out
````

This would result in a file structure like this:

```
.
└── pages
  └── index.tsx
  └── settings.tsx
└── out
  └── index.js
  └── settings.js

```

Since the `pages` directory is the first common ancestor of the entrypoint files, it is considered the project root. This means that the generated bundles live at the top level of the `out` directory; there is no `out/pages` directory.

This behavior can be overridden by specifying the `root` option:

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./pages/index.tsx', './pages/settings.tsx'],
outdir: './out',
root: '.',
})

````

CLI```
bun build ./pages/index.tsx ./pages/settings.tsx --outdir ./out --root .
````

By specifying `.` as `root`, the generated file structure will look like this:

```
.
└── pages
  └── index.tsx
  └── settings.tsx
└── out
  └── pages
    └── index.js
    └── settings.js

```

### [`publicPath`](#publicpath)

A prefix to be appended to any import paths in bundled code.

In many cases, generated bundles will contain no `import` statements. After all, the goal of bundling is to combine all of the code into a single file. However there are a number of cases with the generated bundles will contain `import` statements.

- **Asset imports** — When importing an unrecognized file type like `*.svg`, the bundler defers to the [`file` loader](https://bun.com/docs/bundler/loaders#file), which copies the file into `outdir` as is. The import is converted into a variable
- **External modules** — Files and modules can be marked as [`external`](#external), in which case they will not be included in the bundle. Instead, the `import` statement will be left in the final bundle.
- **Chunking**. When [`splitting`](#splitting) is enabled, the bundler may generate separate "chunk" files that represent code that is shared among multiple entrypoints.

In any of these cases, the final bundles may contain paths to other files. By default these imports are *relative*. Here is an example of a simple asset import:

InputOutputInput\`\`\`
import logo from './logo.svg';
console.log(logo);

````

Output```
// logo.svg is copied into
// and hash is added to the filename to prevent collisions
var logo = './logo-a7305bdef.svg';
console.log(logo);

````

Setting `publicPath` will prefix all file paths with the specified value.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \['./index.tsx'],
outdir: './out',
publicPath: '<https://cdn.example.com/>', // default is undefined
})

````

CLI```
bun build ./index.tsx --outdir ./out --public-path https://cdn.example.com/
````

The output file would now look something like this.

Output\`\`\`
var logo = './logo-a7305bdef.svg';
var logo = '<https://cdn.example.com/logo-a7305bdef.svg>';

````

### [`define`](#define)

A map of global identifiers to be replaced at build time. Keys of this object are identifier names, and values are JSON strings that will be inlined.

JavaScriptCLIJavaScript```
await Bun.build({
  entrypoints: ['./index.tsx'],
  outdir: './out',
  define: {
    STRING: JSON.stringify("value"),
    "nested.boolean": "true",
  },
})

````

CLI\`\`\`
bun build ./index.tsx --outdir ./out --define 'STRING="value"' --define "nested.boolean=true"

````

### [`loader`](#loader)

A map of file extensions to [built-in loader names](https://bun.com/docs/bundler/loaders#built-in-loaders). This can be used to quickly customize how certain files are loaded.

JavaScriptCLIJavaScript```
await Bun.build({
  entrypoints: ['./index.tsx'],
  outdir: './out',
  loader: {
    ".png": "dataurl",
    ".txt": "file",
  },
})

````

CLI\`\`\`
bun build ./index.tsx --outdir ./out --loader .png:dataurl --loader .txt:file

````

### [`banner`](#banner)

A banner to be added to the final bundle, this can be a directive like "use client" for react or a comment block such as a license for the code.

JavaScriptCLIJavaScript```
await Bun.build({
  entrypoints: ['./index.tsx'],
  outdir: './out',
  banner: '"use client";'
})

````

CLI\`\`\`
bun build ./index.tsx --outdir ./out --banner ""use client";"

````

### [`footer`](#footer)

A footer to be added to the final bundle, this can be something like a comment block for a license or just a fun easter egg.

JavaScriptCLIJavaScript```
await Bun.build({
  entrypoints: ['./index.tsx'],
  outdir: './out',
  footer: '// built with love in SF'
})

````

CLI\`\`\`
bun build ./index.tsx --outdir ./out --footer="// built with love in SF"

````

### [`drop`](#drop)

Remove function calls from a bundle. For example, `--drop=console` will remove all calls to `console.log`. Arguments to calls will also be removed, regardless of if those arguments may have side effects. Dropping `debugger` will remove all `debugger` statements.

JavaScriptCLIJavaScript```
await Bun.build({
  entrypoints: ['./index.tsx'],
  outdir: './out',
  drop: ["console", "debugger", "anyIdentifier.or.propertyAccess"],
})

````

CLI\`\`\`
bun build ./index.tsx --outdir ./out --drop=console --drop=debugger --drop=anyIdentifier.or.propertyAccess

````

### [`throw`](#throw)

Controls error handling behavior when the build fails. When set to `true` (default), the returned promise rejects with an `AggregateError`. When set to `false`, the promise resolves with a `BuildOutput` object where `success` is `false`.

JavaScript```
// Default behavior: throws on error
try {
  await Bun.build({
    entrypoints: ['./index.tsx'],
    throw: true, // default
  });
} catch (error) {
  // Handle AggregateError
  console.error("Build failed:", error);
}

// Alternative: handle errors via success property
const result = await Bun.build({
  entrypoints: ['./index.tsx'],
  throw: false,
});

if (!result.success) {
  console.error("Build failed with errors:", result.logs);
}

````

## [Outputs](#outputs)

The `Bun.build` function returns a `Promise<BuildOutput>`, defined as:

```
interface BuildOutput {
  outputs: BuildArtifact[];
  success: boolean;
  logs: Array; // see docs for details
}

interface BuildArtifact extends Blob {
  kind: "entry-point" | "chunk" | "asset" | "sourcemap";
  path: string;
  loader: Loader;
  hash: string | null;
  sourcemap: BuildArtifact | null;
}

```

The `outputs` array contains all the files that were generated by the build. Each artifact implements the `Blob` interface.

```
const build = await Bun.build({
  /* */
});

for (const output of build.outputs) {
  await output.arrayBuffer(); // => ArrayBuffer
  await output.bytes(); // => Uint8Array
  await output.text(); // string
}

```

Each artifact also contains the following properties:

`kind`What kind of build output this file is. A build generates bundled entrypoints, code-split "chunks", sourcemaps, bytecode, and copied assets (like images).`path`Absolute path to the file on disk`loader`The loader was used to interpret the file. See [Bundler > Loaders](https://bun.com/docs/bundler/loaders) to see how Bun maps file extensions to the appropriate built-in loader.`hash`The hash of the file contents. Always defined for assets.`sourcemap`The sourcemap file corresponding to this file, if generated. Only defined for entrypoints and chunks.Similar to `BunFile`, `BuildArtifact` objects can be passed directly into `new Response()`.

```
const build = await Bun.build({
  /* */
});

const artifact = build.outputs[0];

// Content-Type header is automatically set
return new Response(artifact);

```

The Bun runtime implements special pretty-printing of `BuildArtifact` object to make debugging easier.

Build scriptShell outputBuild script\`\`\`
// build.ts
const build = await Bun.build({/\* \*/});

const artifact = build.outputs\[0];
console.log(artifact);

````

Shell output```
bun run build.ts
````

```
BuildArtifact (entry-point) {
  path: "./index.js",
  loader: "tsx",
  kind: "entry-point",
  hash: "824a039620219640",
  Blob (114 bytes) {
    type: "text/javascript;charset=utf-8"
  },
  sourcemap: null
}
```

### [Bytecode](#bytecode)

The `bytecode: boolean` option can be used to generate bytecode for any JavaScript/TypeScript entrypoints. This can greatly improve startup times for large applications. Only supported for `"cjs"` format, only supports `"target": "bun"` and dependent on a matching version of Bun. This adds a corresponding `.jsc` file for each entrypoint.

JavaScriptCLIJavaScript\`\`\`
await Bun.build({
entrypoints: \["./index.tsx"],
outdir: "./out",
bytecode: true,
})

````

CLI```
bun build ./index.tsx --outdir ./out --bytecode
````

### [Executables](#executables)

Bun supports "compiling" a JavaScript/TypeScript entrypoint into a standalone executable. This executable contains a copy of the Bun binary.

```
bun build ./cli.tsx --outfile mycli --compile
```

```
./mycli
```

Refer to [Bundler > Executables](https://bun.com/docs/bundler/executables) for complete documentation.

## [Logs and errors](#logs-and-errors)

On failure, `Bun.build` returns a rejected promise with an `AggregateError`. This can be logged to the console for pretty printing of the error list, or programmatically read with a `try`/`catch` block.

```
try {
  const result = await Bun.build({
    entrypoints: ["./index.tsx"],
    outdir: "./out",
  });
} catch (e) {
  // TypeScript does not allow annotations on the catch clause
  const error = e as AggregateError;
  console.error("Build Failed");

  // Example: Using the built-in formatter
  console.error(error);

  // Example: Serializing the failure as a JSON string.
  console.error(JSON.stringify(error, null, 2));
}

```

Most of the time, an explicit `try`/`catch` is not needed, as Bun will neatly print uncaught exceptions. It is enough to just use a top-level `await` on the `Bun.build` call.

Each item in `error.errors` is an instance of `BuildMessage` or `ResolveMessage` (subclasses of Error), containing detailed information for each error.

```
class BuildMessage {
  name: string;
  position?: Position;
  message: string;
  level: "error" | "warning" | "info" | "debug" | "verbose";
}

class ResolveMessage extends BuildMessage {
  code: string;
  referrer: string;
  specifier: string;
  importKind: ImportKind;
}

```

On build success, the returned object contains a `logs` property, which contains bundler warnings and info messages.

```
const result = await Bun.build({
  entrypoints: ["./index.tsx"],
  outdir: "./out",
});

if (result.logs.length > 0) {
  console.warn("Build succeeded with warnings:");
  for (const message of result.logs) {
    // Bun will pretty print the message object
    console.warn(message);
  }
}

```

## [Reference](#reference)

```
interface Bun {
  build(options: BuildOptions): Promise;
}

interface BuildConfig {
  entrypoints: string[]; // list of file path
  outdir?: string; // output directory
  target?: Target; // default: "browser"
  /**
   * Output module format. Top-level await is only supported for `"esm"`.
   *
   * Can be:
   * - `"esm"`
   * - `"cjs"` (**experimental**)
   * - `"iife"` (**experimental**)
   *
   * @default "esm"
   */
  format?: "esm" | "cjs" | "iife";
  naming?:
    | string
    | {
        chunk?: string;
        entry?: string;
        asset?: string;
      };
  root?: string; // project root
  splitting?: boolean; // default true, enable code splitting
  plugins?: BunPlugin[];
  external?: string[];
  packages?: "bundle" | "external";
  publicPath?: string;
  define?: Record;
  loader?: { [k in string]: Loader };
  sourcemap?: "none" | "linked" | "inline" | "external" | "linked" | boolean; // default: "none", true -> "inline"
  /**
   * package.json `exports` conditions used when resolving imports
   *
   * Equivalent to `--conditions` in `bun build` or `bun run`.
   *
   * https://nodejs.org/api/packages.html#exports
   */
  conditions?: Array | string;

  /**
   * Controls how environment variables are handled during bundling.
   *
   * Can be one of:
   * - `"inline"`: Injects environment variables into the bundled output by converting `process.env.FOO`
   *   references to string literals containing the actual environment variable values
   * - `"disable"`: Disables environment variable injection entirely
   * - A string ending in `*`: Inlines environment variables that match the given prefix.
   *   For example, `"MY_PUBLIC_*"` will only include env vars starting with "MY_PUBLIC_"
   */
  env?: "inline" | "disable" | `${string}*`;
  minify?:
    | boolean
    | {
        whitespace?: boolean;
        syntax?: boolean;
        identifiers?: boolean;
      };
  /**
   * Ignore dead code elimination/tree-shaking annotations such as @__PURE__ and package.json
   * "sideEffects" fields. This should only be used as a temporary workaround for incorrect
   * annotations in libraries.
   */
  ignoreDCEAnnotations?: boolean;
  /**
   * Force emitting @__PURE__ annotations even if minify.whitespace is true.
   */
  emitDCEAnnotations?: boolean;

  /**
   * Generate bytecode for the output. This can dramatically improve cold
   * start times, but will make the final output larger and slightly increase
   * memory usage.
   *
   * Bytecode is currently only supported for CommonJS (`format: "cjs"`).
   *
   * Must be `target: "bun"`
   * @default false
   */
  bytecode?: boolean;
  /**
   * Add a banner to the bundled code such as "use client";
   */
  banner?: string;
  /**
   * Add a footer to the bundled code such as a comment block like
   *
   * `// made with bun!`
   */
  footer?: string;

  /**
   * Drop function calls to matching property accesses.
   */
  drop?: string[];

  /**
   * When set to `true`, the returned promise rejects with an AggregateError when a build failure happens.
   * When set to `false`, the `success` property of the returned object will be `false` when a build failure happens.
   *
   * This defaults to `true`.
   */
  throw?: boolean;
}

interface BuildOutput {
  outputs: BuildArtifact[];
  success: boolean;
  logs: Array;
}

interface BuildArtifact extends Blob {
  path: string;
  loader: Loader;
  hash: string | null;
  kind: "entry-point" | "chunk" | "asset" | "sourcemap" | "bytecode";
  sourcemap: BuildArtifact | null;
}

type Loader =
  | "js"
  | "jsx"
  | "ts"
  | "tsx"
  | "json"
  | "toml"
  | "file"
  | "napi"
  | "wasm"
  | "text";

interface BuildOutput {
  outputs: BuildArtifact[];
  success: boolean;
  logs: Array;
}

declare class ResolveMessage {
  readonly name: "ResolveMessage";
  readonly position: Position | null;
  readonly code: string;
  readonly message: string;
  readonly referrer: string;
  readonly specifier: string;
  readonly importKind:
    | "entry_point"
    | "stmt"
    | "require"
    | "import"
    | "dynamic"
    | "require_resolve"
    | "at"
    | "at_conditional"
    | "url"
    | "internal";
  readonly level: "error" | "warning" | "info" | "debug" | "verbose";

  toString(): string;
}

```

## CLI Usage

$bun build \<entrypoints...>### Flags

#### General Build Options

\--productionSet NODE\_ENV=production and enable minification--bytecodeUse a bytecode cache--target=<val>The intended execution environment for the bundle. "browser", "bun" or "node"--root=<val>Root directory used for multiple entry points--no-bundleTranspile file only, do not bundle--env=<val>Inline environment variables into the bundle as process.env.${name}. Defaults to 'disable'. To inline environment variables matching a prefix, use my prefix like 'FOO\_PUBLIC\_\*'.#### Output & File Management

\--outdir=<val>Default to "dist" if multiple files--outfile=<val>Write to a file--sourcemap=<val>Build with sourcemaps - 'linked', 'inline', 'external', or 'none'--public-path=<val>A prefix to be appended to any import paths in bundled code--entry-naming=<val>Customize entry point filenames. Defaults to "\[dir]/\[name].\[ext]"--chunk-naming=<val>Customize chunk filenames. Defaults to "\[name]-\[hash].\[ext]"--asset-naming=<val>Customize asset filenames. Defaults to "\[name]-\[hash].\[ext]"#### Minification & Optimization

\--splittingEnable code splitting--emit-dce-annotationsRe-emit DCE annotations in bundles. Enabled by default unless --minify-whitespace is passed.--minifyEnable all minification flags--minify-syntaxMinify syntax and inline data--minify-whitespaceMinify whitespace--minify-identifiersMinify identifiers--css-chunkingChunk CSS files together to reduce duplicated CSS loaded in a browser. Only has an effect when multiple entrypoints import CSS#### Module & Dependency Handling

\--format=<val>Specifies the module format to build to. "esm", "cjs" and "iife" are supported. Defaults to "esm".-e,--external=<val>Exclude module from transpilation (can use \* wildcards). ex: -e react--packages=<val>Add dependencies to bundle or keep them external. "external", "bundle" is supported. Defaults to "bundle".--conditions=<val>Pass custom conditions to resolve#### Development Workflow

\--watchAutomatically restart the process on file change--no-clear-screenDisable clearing the terminal screen on reload when --watch is enabled--react-fast-refreshEnable React Fast Refresh transform (does not emit hot-module code, use this for testing)#### Output Content Customization

\--banner=<val>Add a banner to the bundled output such as "use client"; for a bundle being used with RSCs--footer=<val>Add a footer to the bundled output such as // built with bun!#### Standalone Executable Build

\--compileGenerate a standalone Bun executable containing your bundled code. Implies --production--windows-hide-consoleWhen using --compile targeting Windows, prevent a Command prompt from opening alongside the executable--windows-icon=<val>When using --compile targeting Windows, assign an executable icon#### Experimental Web App Features

\--app(EXPERIMENTAL) Build a web app for production using Bun Bake.--server-components(EXPERIMENTAL) Enable server components--debug-dump-server-filesWhen --app is set, dump all server files to disk even when building statically--debug-no-minifyWhen --app is set, do not minify anything### Examples

Frontend web apps:bun build --outfile=bundle.js ./src/index.tsbun build --minify --splitting --outdir=out ./index.jsx ./lib/worker.tsBundle code to be run in Bun (reduces server startup time)bun build --target=bun --outfile=server.js ./server.tsCreating a standalone executable (see <https://bun.sh/docs/bundler/executables)bun> build --compile --outfile=my-app ./cli.tsA full list of flags is available at <https://bun.sh/docs/bundler>
