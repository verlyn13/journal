---
id: typescript
title: TYPESCRIPT
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- reference
- typescript
- react
priority: medium
status: approved
visibility: internal
schema_version: v1
---

# TYPESCRIPT

*Source: <https://bun.sh/docs/typescript>*
*Fetched: 2025-08-30T00:47:26.759Z*

***

To install the TypeScript definitions for Bun's built-in APIs, install `@types/bun`.

```
bun add -d @types/bun # dev dependency
```

At this point, you should be able to reference the `Bun` global in your TypeScript files without seeing errors in your editor.

```
console.log(Bun.version);

```

## [Suggested `compilerOptions`](#suggested-compileroptions)

Bun supports things like top-level await, JSX, and extensioned `.ts` imports, which TypeScript doesn't allow by default. Below is a set of recommended `compilerOptions` for a Bun project, so you can use these features without seeing compiler warnings from TypeScript.

```
{
  "compilerOptions": {
    // Environment setup & latest features
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,

    // Bundler mode
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,

    // Best practices
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    // Some stricter flags (disabled by default)
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false,
  },
}

```

If you run `bun init` in a new directory, this `tsconfig.json` will be generated for you. (The stricter flags are disabled by default.)

```
bun init
```
