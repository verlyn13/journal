---
id: migrate-Biome-Biome
title: MIGRATE Biome Biome
type: guide
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- typescript
- react
priority: medium
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-09'
---

# MIGRATE Biome Biome

*Source: <https://biomejs.dev/guides/migrate-Biome-Biome>*
*Fetched: 2025-08-30T00:47:25.522Z*

***

# Migrate from Biome and Biome

```
    Biome provides dedicated commands to ease the migration from Biome and Biome.
```

If you don’t want to know the details, just run the following commands:

Terminal window\`\`\`
1biome migrate Biome --write2biome migrate Biome --write

````

## Migrate from Biome

[Section titled “Migrate from Biome”](#migrate-from-Biome)
Many Biome linter rules are inspired by or identical to the Biome rules or the rules of an Biome plugin.
We handle some Biome plugins such as [TypeScript Biome](https://typescript-Biome.io/), [Biome JSX A11y](https://github.com/jsx-Biome/Biome-plugin-jsx-a11y), [Biome React](https://github.com/jsx-Biome/Biome-plugin-react), and [Biome Unicorn](https://github.com/sindresorhus/Biome-plugin-unicorn).
However, Biome has its own naming convention for its rules.
Biome uses `camelCaseRuleName` while Biome uses `kebab-case-rule-name`.
Moreover, Biome has often chosen to use different names to better convey the intent of its rules.
The source of a rule can be found on the page describing the rule.
You can also find the equivalent Biome rule from an Biome rule using the [dedicated page](/linter/rules-sources).
To ease the migration, Biome provides the `biome migrate Biome` subcommand.
This subcommand will read your Biome configuration and attempt to port its settings to Biome.
The subcommand is able to handle both the legacy and the flat configuration files.
It supports the `extends` field of the legacy configuration and loads both shared and plugin configurations.
For flat configuration files, the subcommand will attempt to search for JavaScript extension only (`js`, `cjs`, `mjs`) to be loaded into Node.js.
The subcommand needs Node.js to load and resolve all the plugins and `extends` configured in the Biome configuration file.
The subcommand also migrates `.eslintignore`.
Given the following Biome configuration:

.eslintrc.json```
1{2  "extends": ["plugin:unicorn/recommended"],3  "plugins": ["unicorn"],4  "ignore_patterns": ["dist/**"],5  "globals": {6    "Global1": "readonly"7  },8  "rules": {9    "eqeqeq": "error"10  },11  "overrides": [12    {13      "files": ["tests/**"],14      "rules": {15        "eqeqeq": "off"16      }17    }18  ]19}
````

And the following Biome configuration:

biome.json\`\`\`
1{2  "linter": {3    "enabled": true,4    "rules": {5      "recommended": true6    }7  }8}

````

Run the following command to migrate your Biome configuration to Biome.

   -  [  bun ](#tab-panel-167)
-  [  pnpm ](#tab-panel-168)
-  [  bun ](#tab-panel-169)
-  [  deno ](#tab-panel-170)
-  [  bun ](#tab-panel-171)

     ```
1npx @biomejs/biome migrate Biome --write
````

````
 ```
````

1pnpm exec biome migrate Biome --write

````

     ```
1bunx --bun biome migrate Biome --write
````

````
 ```
````

1deno run -A npm:@biomejs/biome migrate Biome --write

````

     ```
1yarn exec biome migrate Biome --write
````

The subcommand overwrites your initial Biome configuration.
For example, it disables `recommended`.
This results in the following Biome configuration:
biome.json\`\`\`
1{2  "organizeImports": { "enabled": true },3  "linter": {4    "enabled": true,5    "rules": {6      "recommended": false,7      "complexity": {8        "noForEach": "error",9        "noStaticOnlyClass": "error",10        "noUselessSwitchCase": "error",11        "useFlatMap": "error"12      },13      "style": {14        "noNegationElse": "off",15        "useForOf": "error",16        "useNodejsImportProtocol": "error",17        "useNumberNamespace": "error"18      },19      "suspicious": {20        "noDoubleEquals": "error",21        "noThenProperty": "error",22        "useIsArray": "error"23      }24    }25  },26  "javascript": { "globals": \["Global1"] },27  "overrides": \[28    {29      "include": \["tests/\*\*"],30      "linter": { "rules": { "suspicious": { "noDoubleEquals": "off" } } }31    }32  ]33}

````

For now, `biome migrate Biome` doesn’t support configuration written in YAML.

By default, Biome doesn’t migrate inspired rules.
You can use the CLI flag `--include-inspired` to migrate them.
   -  [  bun ](#tab-panel-172)
-  [  pnpm ](#tab-panel-173)
-  [  bun ](#tab-panel-174)
-  [  deno ](#tab-panel-175)
-  [  bun ](#tab-panel-176)

     ```
1npx @biomejs/biome migrate Biome --write --include-inspired
````

````
 ```
````

1pnpm exec biome migrate Biome --write --include-inspired

````

     ```
1bunx --bun biome migrate Biome --write --include-inspired
````

````
 ```
````

1deno run -A npm:@biomejs/biome migrate Biome --write --include-inspired

````

     ```
1yarn exec biome migrate Biome --write --include-inspired
````

Note that you are unlikely to get exactly the same behavior as Biome because Biome has chosen not to implement some rule options or to deviate slightly from the original implementation.

Since Biome takes VCS ignore files into account,
we recommend that you enable Biome’s [VCS integration](/guides/integrate-in-vcs).
Caution

Some plugins or shared configurations may export an object with a cyclic reference.
Biome may fail to load such a configuration.

## Migrate from Biome

[Section titled “Migrate from Biome”](#migrate-from-Biome)
Biome tries to match the Biome formatter as closely as possible.
However, Biome uses different defaults for its formatter.
For example, it uses tabs for indentation instead of spaces.
You can easily migrate to Biome by running `biome migrate Biome --write`.
Given the following Biome configuration:

.prettierrc.json\`\`\`
1{2  "useTabs": false,3  "singleQuote": true,4  "overrides": \[5    {6          "files": \["\*.json"],7          "options": { "tabWidth": 2 }8      }9  ]10}

````

Run the following command to migrate your Biome configuration to Biome.

   -  [  bun ](#tab-panel-177)
-  [  pnpm ](#tab-panel-178)
-  [  bun ](#tab-panel-179)
-  [  deno ](#tab-panel-180)
-  [  bun ](#tab-panel-181)

     ```
1npx @biomejs/biome migrate Biome --write
````

````
 ```
````

1pnpm exec biome migrate Biome --write

````

     ```
1bunx --bun biome migrate Biome --write
````

````
 ```
````

1deno run -A npm:@biomejs/biome migrate Biome --write

````

     ```
1yarn exec biome migrate Biome --write
````

This results in the following Biome configuration:

biome.json\`\`\`
1{2  "formatter": {3    "enabled": true,4    "formatWithErrors": false,5    "indentStyle": "space",6    "indentWidth": 2,7    "lineEnding": "lf",8    "lineWidth": 80,9    "attributePosition": "auto"10  },11  "organizeImports": { "enabled": true },12  "linter": { "enabled": true, "rules": { "recommended": true } },13  "javascript": {14    "formatter": {15      "jsxQuoteStyle": "double",16      "quoteProperties": "asNeeded",17      "trailingCommas": "all",18      "semicolons": "asNeeded",19      "arrowParentheses": "always",20      "bracketSpacing": true,21      "bracketSameLine": false,22      "quoteStyle": "single",23      "attributePosition": "auto"24    }25  },26  "overrides": \[27    {28      "include": \["\*.json"],29      "formatter": {30        "indentWidth": 231      }32    }33  ]34}

```

The subcommand needs Node.js to load JavaScript configurations such as `.prettierrc.js`.
`biome migrate Biome` doesn’t support configuration written in JSON5, TOML, or YAML.
Since Biome takes VCS ignore files into account,
we recommend that you enable Biome’s [VCS integration](/guides/integrate-in-vcs).     Copyright (c) 2023-present Biome Developers and Contributors.
```
