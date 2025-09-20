---
id: linter
title: LINTER
type: reference
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

# LINTER

*Source: <https://biomejs.dev/linter>*
*Fetched: 2025-08-30T00:47:26.105Z*

***

# Linter

```
    Biome’s linter statically analyzes your code to find and fix common errors and to help you write better, modern code.
```

It [supports multiple languages](/internals/language-support) and provides a total of **349 rules**.
You can quickly try the Biome linter via the CLI. The following command runs the linter on all files from the root of your project:

- [  bun ](#tab-panel-194)
- [  pnpm ](#tab-panel-195)
- [  bun ](#tab-panel-196)
- [  deno ](#tab-panel-197)
- [  bun ](#tab-panel-198)

  ```
  ```

1npx @biomejs/biome lint

````

     ```
1pnpm exec biome lint
````

````
 ```
````

1bunx --bun biome lint

````

     ```
1deno run -A npm:@biomejs/biome lint
````

````
 ```
````

1yarn exec biome lint

````


Or you can specify one or multiple folders, for example `./src` and `./public`

   -  [  bun ](#tab-panel-199)
-  [  pnpm ](#tab-panel-200)
-  [  bun ](#tab-panel-201)
-  [  deno ](#tab-panel-202)
-  [  bun ](#tab-panel-203)

     ```
1npx @biomejs/biome lint ./src ./public
````

````
 ```
````

1pnpm exec biome lint ./src ./public

````

     ```
1bunx --bun biome lint ./src ./public
````

````
 ```
````

1deno run -A npm:@biomejs/biome lint ./src ./public

````

     ```
1yarn exec biome lint ./src ./public
````

The command accepts a list of files and directories.

Caution

If you pass a glob as a parameter, your shell will expand it. **Biome doesn’t support globs**.
The result of the expansion depends on your shell.
For example, some shells don’t support the recursive glob `**` or the alternation `{}` in the following command:Terminal window\`\`\`
1biome lint ./src/\*\*/\*.test.{js,ts}

````

Shell expansion has a performance cost and a limit on the number of files you can pass to the command.

The use of globs is **discouraged**, instead use the `includes` configuration.

For more information about all the available options, check the [CLI reference](/reference/cli#biome-lint).

## Rules

[Section titled “Rules”](#rules)
The linter is organized into rules. A rule is meant to enforce or deny a code style, the use of something that could lead to a bug, and more. Generally, a rule shouldn’t conflict with another rule, unless told otherwise.
Biome rules have a naming convention: Rules that start with `use*` are meant to enforce/suggest something, while rules that start with `no*` are meant to deny something. When a rule encounters a *violation* of its concept, it emits a diagnostic.
For example, the [noDebugger](/linter/rules/no-debugger) denies the use of `debugger` statements in JavaScript code, and it emits a diagnostic when it finds one.

Biome linter ships with a set of recommended rules that varies based on languages, which are enabled by default when you avail of the default Biome configuration (or no-configuration) when you run the `lint` or `check` command:

Terminal window```
1biome lint2biome check
````

Each lint rule ships with a default [severity](/reference/diagnostics#diagnostic-severity) which you can lean more about by reading the documentation of the rule.

The rules are divided into [groups](#linter-groups). For example, the `noDebugger` rule is part of the [`suspicious` group](#suspicious).

Biome supports *language-agnostic rules*. Those are rules that work across more than one language, such as `noUselessEscapeInString`, which can report useless escape sequences in both JavaScript and CSS.

Unlike other linters, Biome doesn’t provide any rules that check for code formatting; the [Biome formatter](/formatter/) is intended to handle all formatting decisions.

Many rules provide a **code fix** that can be automatically applied.

Biome makes a difference between [**safe fixes**](#safe-fixes) and [**unsafe fixes**](#unsafe-fixes), which work slightly differently: The main difference is that safe fixes can be automatically applied when saving a file, while unsafe fixes can’t. Users can override which fixes are considered safe however.

Biome linter comes with a set of recommended rules that are automatically enabled, and vary based on the language.

### Safe fixes

[Section titled “Safe fixes”](#safe-fixes)
Safe fixes are guaranteed to not change the semantic of your code.
They can be applied without explicit review.
To apply *safe fixes* from the CLI, use `--write`:

- [  bun ](#tab-panel-204)
- [  pnpm ](#tab-panel-205)
- [  bun ](#tab-panel-206)
- [  deno ](#tab-panel-207)
- [  bun ](#tab-panel-208)

  ```
  ```

1npx @biomejs/biome lint --write ./src

````

     ```
1pnpm exec biome lint --write ./src
````

````
 ```
````

1bunx --bun biome lint --write ./src

````

     ```
1deno run -A npm:@biomejs/biome lint --write ./src
````

````
 ```
````

1yarn exec biome lint --write ./src

````


From an LSP-compatible editor, you can apply safe fixes **on save** with the code action `source.fixAll.biome`.
Refer to the documentation of your extension to learn how to apply it.
### Unsafe fixes

[Section titled “Unsafe fixes”](#unsafe-fixes)
Unsafe fixes may change the semantic of your program.
Therefore, it’s advised to manually review the changes.
To apply both *safe fixes* and *unsafe fixes* from the CLI, use `--write --unsafe`:

   -  [  bun ](#tab-panel-209)
-  [  pnpm ](#tab-panel-210)
-  [  bun ](#tab-panel-211)
-  [  deno ](#tab-panel-212)
-  [  bun ](#tab-panel-213)

     ```
1npx @biomejs/biome lint --write --unsafe ./src
````

````
 ```
````

1pnpm exec biome lint --write --unsafe ./src

````

     ```
1bunx --bun biome lint --write --unsafe ./src
````

````
 ```
````

1deno run -A npm:@biomejs/biome lint --write --unsafe ./src

````

     ```
1yarn exec biome lint --write --unsafe ./src
````

From an LSP-compatible editor, it’s not possible to apply all unsafe fixes on save. It would be undesirable to change the semantics of your code on save. However, you can review the single code fix and choose to apply it.

### Rule pillars

[Section titled “Rule pillars”](#rule-pillars)
In Biome, rules should be informative and explain to the user why a rule is triggered and tell them what they should to do fix the error.
A rule should follow these **pillars**:

1. $1

2. $1

Tell the user what they should do. Generally, this is implemented using a code action.
If a code action is not applicable a note should tell the user what they should do to fix the error.

If you think a rule doesn’t follow these pillars, please [open an issue](https://github.com/biomejs/biome/issues/new?assignees=\&labels=S-To+triage\&projects=\&template=01_bug.yml\&title=%F0%9F%90%9B+%3CTITLE%3E).

## Configure the linter

[Section titled “Configure the linter”](#configure-the-linter)
In many cases, you want to change the linter based on your personal needs, or the needs or your organisation/project.
Biome allows you to customise the linter, and in this section you will learn how to do it.

### Disable a rule

[Section titled “Disable a rule”](#disable-a-rule)
You can turn off a rule with `off`.

The following configuration disables the recommended rule `noDebugger`:

biome.json\`\`\`
1{2  "linter": {3    "rules": {4      "suspicious": {5        "noDebugger": "off"6      }7    }8  }9}

```

### Disable recommended rules

[Section titled “Disable recommended rules”](#disable-recommended-rules)
You can disable the recommended rules with a simple configuration. This may be useful in cases when you only want to enable a few rules.

```

1{2  "linter": {3    "rules": {4      "recommended": false5    }6  }7}

````

### Change rule severity

[Section titled “Change rule severity”](#change-rule-severity)
Biome lint rules are shipped with their own default severity. If you want to avail of rule default severity, you can use the `"on"` configuration.

For example the `noShoutyConstants` isn’t recommended by default, and when it’s triggered in emits a diagnostic with information severity.

If you’re happy with this default and you want to avail of it, the configuration will look like this:

biome.json```
1{2  "linter": {3    "rules": {4      "style": {5        "noShoutyConstants": "on"6      }7    }8  }9}
````

If you aren’t happy with the default severity, Biome allows you to change it with `"error"`, `"warn"` and `"info"`

Diagnostics with the [`"error"`](/reference/diagnostics#error) always cause the CLI to exit with an error code. This severity can be useful when you want to block the CI if there’s a violation that belongs to a certain rule.

[Warnings](/reference/diagnostics#warning) are similar to errors, but they don’t cause the CLI to exit with an error code, unless the `--error-on-warnings` flag is used. A possible use for the `warn` severity is when you want to make the CI pass while there are still diagnostics for a given rule.

The [`info`](/reference/diagnostics#information) severity won’t affect the exit status code of the CLI, even when `--error-on-warnings` is passed.

### Change group severity

[Section titled “Change group severity”](#change-group-severity)
Additionally, you can control the severity of lint rules **at the group level**. This way, it’s possible to control the diagnostic severity of **all rules** that belong to a group.

For example, a project doesn’t require the use of `a11y` rules because it’s code that runs at the backend, so accessibility isn’t a concern. The following example turns off all rules that belong to the `a11y` group:

```
1{2  "linter": {3    "rules": {4      "a11y": "off"5    }6  }7}
```

### Configure the code fix

[Section titled “Configure the code fix”](#configure-the-code-fix)
As explained above, rules might emit code fixes that are **safe** or **unsafe**. Biome allows configuring a safe fix to be treated as unsafe and vice-versa. You can also turn the code fix off entirely.

Code fixes can be configured using the `fix` option. It can have one of three values:

- `none`: the rule won’t emit a code fix;

- `safe`: the rule will emit a [safe fix](#safe-fixes);

- `unsafe`: the rule will emit an [unsafe fix](#unsafe-fixes);

biome.jsonc\`\`\`
1{2  "linter": {3    "rules": {4      "correctness": {5        "noUnusedVariables": {6          "level": "error",7          "fix": "none" // no code fix suggested for noUnusedVariables8        }9      },10      "style": {11        "useConst": {12          "level": "warn",13          "fix": "unsafe" // the code fix for `useConst` is now considered unsafe14        },15        "useTemplate": {16          "level": "warn",17          "fix": "safe" // the code fix for `useTemplate` is now considered safe18        }19      }20    }21  }22}

````

### Skip a rule or a group

[Section titled “Skip a rule or a group”](#skip-a-rule-or-a-group)
The command `biome lint` accepts an option `--skip` that allows disabling individual rules or groups of rules.

For example, the following command skips all the rules that belong to the `style` group and the `suspicious/noExplicitAny` rule:

Terminal window```
1biome lint --skip=style --skip=suspicious/noExplicitAny
````

### Run only a rule or a group

[Section titled “Run only a rule or a group”](#run-only-a-rule-or-a-group)
The command `biome lint` accepts an option `--only` that allows running individual rules or groups of rules.

For example, the following command runs only the rule `style/useNamingConvention`, the rule `style/noInferrableTypes` and the rules that belong to `a11y`. If the rule is disabled in the configuration, then its severity level is set to `error` for a recommended rule or `warn` otherwise.

Terminal window\`\`\`
1biome lint --only=style/useNamingConvention --only=style/noInferrableTypes --only=a11y

````

### Rule options

[Section titled “Rule options”](#rule-options)
A few rules have options.
You can set them by shaping the value of the rule differently.

- `level` will indicate the severity of the diagnostic;

- `options` will change based on the rule.

biome.json```
1{2  "linter": {3    "rules": {4      "style": {5        "useNamingConvention": {6          "level": "error",7          "options": {8            "strictCase": false9          }10        }11      }12    }13  }14}
````

### Domains

[Section titled “Domains”](#domains)
Domains are a Biome feature that allow for grouping rules by technology, or well, *domain*. Examples of domains are `"react"`, `"solid"`, and `"test"`.

A domain:

- Has its own set of recommended rules.

- Can be automatically enabled when Biome detects certain dependencies in your `package.json` file.

- Can define additional global variables.

Biome’s linter will automatically enable the rules that belong to a domain when it detects certain dependencies in the nearest `package.json`. For example, if the `Vitest` dependency is detected, Biome will enable the **recommended rules** of the [`test`](/linter/domains#test) domain.

However, if there’s no `package.json` or the default configuration doesn’t apply, you can enable the domain via configuration:

biome.json\`\`\`
1{2  "linter": {3    "domains": {4      "test": "recommended"5    }6  }7}

````

Additionally, you can enable **all** rules that belong to a domain using the `"all"` value:

biome.json```
1{2  "linter": {3    "domains": {4      "test": "all"5    }6  }7}
````

Like rules and groups, you can also turn the rules that belong to a domains with the `"off"` value:

biome.json\`\`\`
1{2  "linter": {3    "domains": {4      "test": "off"5    }6  }7}

````

To learn more about each domain, consult [the appropriate page](/linter/domains).

## Suppress lint rules

[Section titled “Suppress lint rules”](#suppress-lint-rules)
You can refer to the [suppression page](/analyzer/suppressions).

## Integration with editors

[Section titled “Integration with editors”](#integration-with-editors)
The first-class integration with LSP-compatible editors allows you to configure certain aspects of how Biome should behave.

When a violation is detected by Biome, a diagnostic is sent to the editor alongside with an arbitrary number of code actions, that are meant to address the diagnostic.
Those actions are:

- A possible code fix. This code fix appears only if the rule **has** a code fix. The code fix appears regardless if it’s safe or unsafe.

- Suppress the diagnostic [with an inline suppression](/analyzer/suppressions#inline-suppressions).

- Suppress the diagnostic [with a top-level suppression](/analyzer/suppressions#top-level-suppressions).

Usually, by positioning your cursor in the range of the diagnostic and typing a certain shortcut (it varies per editor), a tooltip will appear with the possible code actions.

By default, these actions are always displayed by the editor, however it’s possible to opt-out from them.

### Apply actions on save

[Section titled “Apply actions on save”](#apply-actions-on-save)
Use the `source.fixAll.biome` code action to instruct Biome to apply all **safe fixes** on save.

   -  [  VS Code ](#tab-panel-214)
-  [  Zed ](#tab-panel-215)
-  [  Other editors ](#tab-panel-216)

     .vscode/settings.json```
1{2  "editor.codeActionsOnSave": {3    "source.fixAll.biome": "explicit",4  }5}
````

````
 .zed/settings.json```
````

1{2  "code\_actions\_on\_format": {3    "source.fixAll.biome": true,4  }5}

````


Use the source action code `source.fixAll.biome`
### Editor suppressions

[Section titled “Editor suppressions”](#editor-suppressions)
Use `source.suppressRule.inline.biome` to control whether the editor should show the inline suppression code action:

   -  [  VS Code ](#tab-panel-217)
-  [  Zed ](#tab-panel-218)
-  [  Other editors ](#tab-panel-219)

     .vscode/settings.json```
1{2  "editor.codeActionsOnSave": {3    "source.suppressRule.inline.biome": "never",4  }5}
````

````
 .zed/settings.json```
````

1{2  "code\_actions\_on\_format": {3    "source.suppressRule.inline.biome": false,4  }5}

````


Use the source action code `source.suppressRule.inline.biome`
Use `source.suppressRule.topLevel.biome` to control whether the editor should show the top-level suppression code action:

   -  [  VS Code ](#tab-panel-220)
-  [  Zed ](#tab-panel-221)
-  [  Other editors ](#tab-panel-222)

     .vscode/settings.json```
1{2  "editor.codeActionsOnSave": {3    "source.suppressRule.topLevel.biome": "never",4  }5}
````

````
 .zed/settings.json```
````

1{2  "code\_actions\_on\_format": {3    "source.suppressRule.topLevel.biome": false,4  }5}

````


Use the source action code `source.suppressRule.topLevel.biome`
## Migrate from other linters

[Section titled “Migrate from other linters”](#migrate-from-other-linters)
Many of Biome lint rules are inspired from other linters.
If you want to migrate from other linters such as Biome or `typescript-Biome`, check the [rules sources page](/linter/rules-sources).
If you are migrating from Biome, there’s a dedicated [migration guide](/guides/migrate-Biome-Biome#migrate-from-Biome).

Use the command `biome migrate Biome` to port the rules defined in your `Biome` configuration file to `biome.json`:
Terminal window```
1biome migrate Biome
````

Lint the project by suppressing possible new rules that are caught by Biome, using the following command:
Terminal window\`\`\`
1biome lint --write --unsafe --suppress="suppressed due to migration"

```

The command will suppress all linting violation that Biome finds, using the reason `"suppressed due to migration"`. Now the linter shouldn’t error anymore, and it’s possible to remove the suppression comments at a later stage.

## Linter Groups

[Section titled “Linter Groups”](#linter-groups)
The linter divides rules under *groups*. Groups are meant to offer some sort of category which rules falls under. This information becomes useful, for users, when choosing a rule to enable/disable, or for developers when creating new lint rules.

### Accessibility

[Section titled “Accessibility”](#accessibility)
Rules focused on preventing accessibility problems.

### Complexity

[Section titled “Complexity”](#complexity)
Rules that focus on inspecting complex code that could be simplified.

### Correctness

[Section titled “Correctness”](#correctness)
Rules that detect code that is guaranteed to be incorrect or useless.

### Nursery

[Section titled “Nursery”](#nursery)
New rules that are still under development.  Nursery rules require explicit opt-in via configuration on stable versions because they may still have bugs or performance problems. They are enabled by default on nightly builds, but as they are unstable their diagnostic severity may be set to either error or warning, depending on whether we intend for the rule to be recommended or not when it eventually gets stabilized. Nursery rules get promoted to other groups once they become stable or may be removed.  Rules that belong to this group are not subject to semantic version.

### Performance

[Section titled “Performance”](#performance)
Rules catching ways your code could be written to run faster, or generally be more efficient.

### Security

[Section titled “Security”](#security)
Rules that detect potential security flaws.

### Style

[Section titled “Style”](#style)
Rules enforcing a consistent and idiomatic way of writing your code. By default, these rules will only generate warnings instead of errors.

### Suspicious

[Section titled “Suspicious”](#suspicious)
Rules that detect code that is likely to be incorrect or useless.

## Frequently Asked Questions (FAQ)

[Section titled “Frequently Asked Questions (FAQ)”](#frequently-asked-questions-faq)
### Why does rule X have an *unsafe* fix? It seems safe to me.

[Section titled “Why does rule X have an unsafe fix? It seems safe to me.”](#why-does-rule-x-have-an-unsafe-fix-it-seems-safe-to-me)
There are different reasons why the Biome team decides to mark a fix unsafe, but mostly it boils down to the following:

- The lint rule is still under heavy development, as well as the fix.

- The rule fix can change the semantics of a program, so the fix must be opted in by the user.

- The rule fix can deteriorate the DX while typing and/or saving. An example is `noUnusedVariables`, which adds `_` to the name of unused variables. This can deteriorate the DX of programmers while typing and saving. You can change this behavior via [configuration](/linter/#configure-the-code-fix).

If a code fix doesn’t follow these three guidelines, it’s possible that the team forgot to make the rule fix safe. Please open an issue or send a PR!

### Why is Biome linter so slow compared to v1?

[Section titled “Why is Biome linter so slow compared to v1?”](#why-is-biome-linter-so-slow-compared-to-v1)
Since Biome v2, we’ve extended its architecture with a tool called Scanner. The Scanner is responsible for crawling your project files and creating important information
such as the module graph and the inferred types.
Such information **is needed** for some rules as `noFloatingPromises`, `noUnresolvedImports` or `noImportCycles`, which can’t function otherwise. Generally, for rules that belong to the [project domain](/linter/domains/#project)

The Scanner is **opt-in**, and it’s triggered only when a rule that belongs to the [project domain](/linter/domains#project-rules) is enabled.

Based on our tests, we noticed roughly these numbers:

Without ScannerWith Scanner~2k files~800ms~2s~5k files~1000ms~8s
It’s also worth mentioning that **we’re aware** of this impact on performance, and the team is pledged to improve the performance in this part of the software.

See the [Investigate slowness guide](/guides/investigate-slowness) for advice on investigating and mitigating slow-downs.

If you notice some abnormal numbers in terms of memory or time, please file an issue with a link to the repository, so we can help.

### Why is Biome using so much memory?

[Section titled “Why is Biome using so much memory?”](#why-is-biome-using-so-much-memory)
If you use an editor extension that uses Biome, you might notice that one of its processes could use a lot of memory.

This usually happens if you enable one of the rules that belong to the [project domain](/linter/domains/#project).

Since Biome v2, the toolchain is now able to use TypeScript to infer types and provide more powerful rules. To achieve this, Biome
scans `.d.ts` files inside the `node_modules (managed by Bun)` folder, including those of transitive dependencies.
While this might seem a silly mistake, this is intentional due to how the language works. Libraries
**can export types from its dependencies**, which end-users might not depend on from.
For example, you might depend on from a library `@org/entry` that exports the type `Validator`,
however this `Validator` comes from the library `@other-org/validator`, which is a *dependency of `@org/entry`*. However,
the library `@other-org/validator` isn’t a direct dependency of the project.
The **team is aware** of the constraint and will work towards optimizing the infrastructure with time and resources.

     Copyright (c) 2023-present Biome Developers and Contributors.
```
