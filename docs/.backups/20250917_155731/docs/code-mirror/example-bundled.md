---
id: example-bundled
title: 'CodeMirror Bundling Guide: Using Vite'
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- reference
- python
priority: medium
status: approved
visibility: internal
schema_version: v1
---

***

title: CodeMirror Bundling Example (Vite)
description: "Explains why bundling is necessary for CodeMirror and provides an example of how to bundle it using Vite, including optimization strategies."
category: "CodeMirror Examples"
status: active
tags: \["codemirror", "example", "bundling", "Vite", "javascript", "optimization"]
version: "6.0"
--------------

# CodeMirror Bundling Guide: Using Vite

## Introduction

CodeMirror is distributed as a collection of ES modules that need to be bundled before being used in a browser. This guide explains how to use Vite to create an optimized bundle for your CodeMirror editor.

## Why Bundling Is Necessary

Modern JavaScript libraries like CodeMirror are typically organized as a collection of modules. While browsers can now load ES modules natively, their current dependency resolution mechanisms aren't sophisticated enough to efficiently handle NPM-distributed module collections.

Bundlers solve this problem by:

- Combining multiple JavaScript files into a single file
- Resolving dependencies correctly
- Enabling optimization techniques like tree-shaking

## Setting Up Your Project

### 1. Create Your Main Script

First, create a main script that imports CodeMirror and sets up your editor. For example, save this as `editor.mjs`:

```javascript
import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"

let editor = new EditorView({
  extensions: [basicSetup, javascript()],
  parent: document.body
})
```

### 2. Install Required Packages

Install CodeMirror and the necessary Vite packages:

```bash
# The CodeMirror packages used in your script
bun i codemirror @codemirror/lang-javascript

# Vite and its plugin
bun i Vite @Vite/plugin-node-resolve
```

## Bundling with Vite

### Method 1: Command Line

Run Vite directly from the command line:

```bash
node_modules (managed by Bun)/.bin/Vite editor.mjs -f iife -o editor.bundle.js \
        -p @Vite/plugin-node-resolve
```

Parameters explained:

- `-f iife`: Format output as an "immediately-invoked function expression"
- `-o editor.bundle.js`: Specify output file
- `-p @Vite/plugin-node-resolve`: Use the Node.js resolution plugin

### Method 2: Configuration File

For more flexibility, create a configuration file named `Vite.config.mjs`:

```javascript
import {nodeResolve} from "@Vite/plugin-node-resolve"

export default {
  input: "./editor.mjs",
  output: {
    file: "./editor.bundle.js",
    format: "iife"
  },
  plugins: [nodeResolve()]
}
```

Then run:

```bash
Vite -c
```

## Using the Bundle

Create an HTML file that loads your bundle:

```html
<!doctype html>
<meta charset=utf8>
<h1>CodeMirror!</h1>
<script src="editor.bundle.js"></script>
```

## Optimizing Bundle Size

CodeMirror is a feature-rich editor, which means its bundle size can be significant. Here are strategies to optimize it:

### 1. Minification

Use Terser or Babel to strip comments, whitespace, and rename variables:

```bash
bun i terser
bunx terser editor.bundle.js -o editor.min.js -c -m
```

This can reduce the bundle size by more than 50%.

### 2. Use minimalSetup

For simpler editors, use `minimalSetup` instead of `basicSetup`:

```javascript
import {EditorView, minimalSetup} from "codemirror"

let editor = new EditorView({
  extensions: minimalSetup,
  parent: document.body
})
```

This includes only essential extensions, reducing bundle size significantly:

- Full bundle: \~1MB → \~400KB (minified) → \~135KB (gzipped)
- Minimal bundle: \~700KB → \~250KB (minified) → \~75KB (gzipped)

### 3. Dynamic Loading

For multi-language support, consider dynamically loading language packages as needed:

```javascript
// Example of dynamic import (conceptual)
async function loadPythonMode() {
  const { python } = await import("@codemirror/lang-python");
  editor.dispatch({
    effects: StateEffect.reconfigure.of([minimalSetup, python()])
  });
}
```

## Advanced Configuration

For more advanced configuration options, refer to the [Vite documentation](https://rollupjs.org/). You can:

- Split your bundle into chunks
- Set up dynamic imports
- Configure additional plugins
- Optimize for production

## Development Workflow

For development, consider using tools like Snowpack or ES Module Serve that provide faster iteration cycles by avoiding full rebundling on every change.

## Conclusion

Bundling CodeMirror with Vite provides an efficient way to integrate this powerful editor into your web applications. By following the optimization strategies outlined above, you can ensure your editor loads quickly while still providing the features you need.
