---
id: configuration
title: CONFIGURATION
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

# CONFIGURATION

*Source: <https://biomejs.dev/reference/configuration>*
*Fetched: 2025-08-30T00:47:25.770Z*

***

# Configuration

## `$schema`

[Section titled “$schema”](#schema)
Allows to pass a path to a JSON schema file.

We publish a JSON schema file for our `biome.json`/`biome.jsonc` files.

You can specify a relative path to the schema inside the `@biomejs/biome` bun package if it is installed in the `node_modules (managed by Bun)` folder:
biome.json\`\`\`
1{2  "$schema": "./node\_modules/@biomejs/biome/configuration\_schema.json"3}

````

If you have problems with resolving the physical file, you can use the one
published on this site:
biome.json```
1{2  "$schema": "https://biomejs.dev/schemas/2.0.5/schema.json"3}
````

## `extends`

[Section titled “extends”](#extends)
A list of paths to other Biome configuration files. Biome resolves and applies
the configuration settings from the files contained in the `extends` list, and
eventually applies the options contained in this `biome.json`/`biome.jsonc`
file.
The order of paths to extend goes from least relevant to most relevant.

Since v2, this option accepts a string that must match the value `"//"`, which can be used
when setting up [monorepos](/guides/big-projects#monorepo)

## `root`

[Section titled “root”](#root)
Whether this configuration should be treated as a root. By default, any configuration file is considered a root by default.
When a configuration file is a “nested configuration”, it must set `"root": false`, otherwise an error is thrown.
This is required so Biome can orchestrate multiple files in CLI and editors at the same time.

Default: `true`

## `files`

[Section titled “files”](#files)

### `files.includes`

[Section titled “files.includes”](#filesincludes)
A list of [glob patterns](#glob-syntax-reference) of files to process.

If a folder matches a glob pattern, all files inside that folder will be
processed.
The following example matches all files with a `.js` extension inside the `src`
folder:
biome.json\`\`\`
1{2  "files": {3    "includes": \["src/\*\*/\*.js"]4  }5}

````

`*` is used to match *all files in a folder*, while `**` *recursively* matches
all files and subfolders in a folder. For more information on globs, see the
[glob syntax reference](#glob-syntax-reference)
`includes` also supports negated patterns, or exceptions. These are patterns
that start with `!` and they can be used to instruct Biome to process all files
*except* those matching the negated pattern. When using a negated pattern, you
should always specify `**` first to match all files and folders, otherwise
the negated pattern will not match any files.
Note that exceptions are processed in order, allowing you to specify exceptions
to exceptions.
Consider the following example:

biome.json```
1{2  "files": {3    "includes": ["**", "!**/*.test.js", "**/special.test.js", "!test"]4  }5}
````

This example specifies that:

1. $1

2. $1

3. $1

… *except* when it occurs in the folder named `test`, because *no* files
inside that folder are processed.

Note

Using `!test` to completely exclude a directory is only supported in `files.includes`. In other places where `includes` is used (`linter.includes`, `formatter.includes`, etc.), you need to use `!/test/**` to exclude the directory.

This means that:

- `src/app.js` **is** processed.

- `src/app.test.js` **is not** processed.

- `src/special.test.js` **is** processed.

- `test/special.test.js` **is not** processed.

#### Note on Biome’s scanner

[Section titled “Note on Biome’s scanner”](#note-on-biomes-scanner)
Biome has a scanner that is responsible for discovering nested `.gitignore`
files as well as indexing projects if any of the rules from the project domain
are enabled.
The scanner respects the `files.includes` setting, but there is some fineprint.
See the [scanner documentation](/internals/architecture/#scanner) for more
information.

### `files.ignoreUnknown`

[Section titled “files.ignoreUnknown”](#filesignoreunknown)
If `true`, Biome won’t emit diagnostics if it encounters files that it can’t
handle.
biome.json\`\`\`
1{2  "files": {3    "ignoreUnknown": true4  }5}

````

Default: `false`

### `files.maxSize`

[Section titled “files.maxSize”](#filesmaxsize)
The maximum allowed size for source code files in bytes. Files above
this limit will be ignored for performance reasons.

Default: `1048576` (1024*1024, 1MB)

### `files.experimentalScannerIgnores`

[Section titled “files.experimentalScannerIgnores”](#filesexperimentalscannerignores)
An array of literal paths that the scanner should ignore during the crawling. The ignored files won’t be indexed, which means that these files won’t be part of the module graph, and types won’t be inferred from them.

In the following example, the folders `lodash` and `dist` and the file `RedisCommander.d.ts` will be ignored:

biome.json```
1{2  "files" : {3    "experimentalScannerIgnores": [4      "lodash",5      "dist",6      "RedisCommander.d.ts"7    ]8  }9}
````

You should use this option only as a last resort in cases Biome takes a lot of time to lint/check your project. (Glob) paths aren’t supported, and only basenames are matched.

See the [scanner documentation](/internals/architecture/#scanner) for more information.

Caution

As an experimental option, its usage is subject to change. The goal is to make Biome as fast as possible and eventually remove the option.

## `vcs`

[Section titled “vcs”](#vcs)
Set of properties to integrate Biome with a VCS (Version Control Software).

### `vcs.enabled`

[Section titled “vcs.enabled”](#vcsenabled)
Whether Biome should integrate itself with the VCS client

Default: `false`

### `vcs.clientKind`

[Section titled “vcs.clientKind”](#vcsclientkind)
The kind of client.

Values:

- `"git"`

### `vcs.useIgnoreFile`

[Section titled “vcs.useIgnoreFile”](#vcsuseignorefile)
Whether Biome should use the project’s VCS ignore files. When `true`, Biome will ignore the files
specified in the VCS ignore files as well as those specified in `.ignore` files.
This feature supports nested ignore files too.

The root ignore file yields the same semantics as the root [`files.includes`](/reference/configuration#filesincludes).

### `vcs.root`

[Section titled “vcs.root”](#vcsroot)
The folder where Biome should check for VCS files. By default, Biome will use the same
folder where `biome.json` was found.
If Biome can’t find the configuration, it will attempt to use the current working directory.
If no current working directory can’t be found, Biome won’t use the VCS integration, and a diagnostic
will be emitted

### `vcs.defaultBranch`

[Section titled “vcs.defaultBranch”](#vcsdefaultbranch)
The main branch of the project. Biome will use this branch when evaluating the changed files.

## `linter`

[Section titled “linter”](#linter)

### `linter.enabled`

[Section titled “linter.enabled”](#linterenabled)
Enables Biome’s linter.

Default: `true`

### `linter.includes`

[Section titled “linter.includes”](#linterincludes)
A list of [glob patterns](#glob-syntax-reference) of files to lint.

The following example lints all files with a `.js` extension inside the `src`
folder:
biome.json\`\`\`
1{2  "linter": {3    "includes": \["src/\*\*/\*.js"]4  }5}

````

`*` is used to match *all files in a folder*, while `**` *recursively* matches
all files and subfolders in a folder. For more information on globs, see the
[glob syntax reference](#glob-syntax-reference)
`includes` also supports negated patterns, or exceptions. These are patterns
that start with `!` and they can be used to instruct Biome to process all files
*except* those matching the negated pattern.
Note that exceptions are processed in order, allowing you to specify exceptions
to exceptions.
Consider the following example:

biome.json```
1{2  "linter": {3    "includes": ["**", "!**/*.test.js", "**/special.test.js"]4  }5}
````

This example specifies that:

1. $1

2. $1

3. $1

This means that:

- `src/app.js` **is** linted.

- `src/app.test.js` **is not** linted.

- `src/special.test.js` \**is* linted.

Note that `linter.includes` is applied *after* `files.includes`. This means
that any file that is not matched by `files.includes` can no longer be matched
`linter.includes`. This means the following example **doesn’t work**:
biome.jsonc\`\`\`
1{2  "files": {3    "includes": "src/**"4  },5  "linter": {6    // This matches nothing because there is no overlap with `files.includes`:7    "includes": "scripts/**"8  }9}

````

If `linter.includes` is not specified, all files matched by
[`files.includes`](#filesincludes) are linted.
Note

Due to a technical limitation, `linter.includes` also cannot match folders
while `files.includes` can. If you want to match all files inside a folder,
you should explicitly add `/**` at the end.
### `linter.rules.recommended`

[Section titled “linter.rules.recommended”](#linterrulesrecommended)
Enables the recommended rules for all groups.

Default: `true`

### `linter.rules.[group]`

[Section titled “linter.rules.[group]”](#linterrulesgroup)
Options that influence the rules of a single group. Biome supports the following groups:

- accessibility: Rules focused on preventing accessibility problems.

- complexity: Rules that focus on inspecting complex code that could be simplified.

- correctness: Rules that detect code that is guaranteed to be incorrect or useless.

- nursery: New rules that are still under development.  Nursery rules require explicit opt-in via configuration on stable versions because they may still have bugs or performance problems. They are enabled by default on nightly builds, but as they are unstable their diagnostic severity may be set to either error or warning, depending on whether we intend for the rule to be recommended or not when it eventually gets stabilized. Nursery rules get promoted to other groups once they become stable or may be removed.  Rules that belong to this group are not subject to semantic version.

- performance: Rules catching ways your code could be written to run faster, or generally be more efficient.

- security: Rules that detect potential security flaws.

- style: Rules enforcing a consistent and idiomatic way of writing your code.

- suspicious: Rules that detect code that is likely to be incorrect or useless.

Each group can accept, as a value, a string that represents the severity or an object where each rule can be configured.

When passing the severity, you can control the severity emitted by all the rules that belong to a group.
For example, you can configure the `a11y` group to emit information diagnostics:
biome.json```
1{2  "linter": {3    "rules": {4      "a11y": "info"5    }6  }7}
````

Here are the accepted values:

`"on"`: each rule that belongs to the group will emit a diagnostic with the default severity of the rule. Refer to the documentation of the rule, or use the `explain` command:
Terminal window\`\`\`
biome explain noDebugger

````

- `"off"`: none of the rules that belong to the group will emit any diagnostics.

- `"info"`: all rules that belong to the group will emit a [diagnostic with information severity](/reference/diagnostics#information).

- `"warn"`: all rules that belong to the group will emit a [diagnostic with warning severity](/reference/diagnostics#warning).

- `"error"`: all rules that belong to the group will emit a [diagnostic with error severity](/reference/diagnostics#error).

### `linter.rules.[group].recommended`

[Section titled “linter.rules.[group].recommended”](#linterrulesgrouprecommended)
Enables the recommended rules for a single group.

Example:

biome.json```
1{2  "linter": {3    "enabled": true,4    "rules": {5      "nursery": {6        "recommended": true7      }8    }9  }10}
````

## `assist`

[Section titled “assist”](#assist)

### `assist.enabled`

[Section titled “assist.enabled”](#assistenabled)
Enables Biome’s assist.

Default: `true`

### `assist.includes`

[Section titled “assist.includes”](#assistincludes)
A list of [glob patterns](#glob-syntax-reference) of files to lint.

The following example analyzes all files with a `.js` extension inside the `src`
folder:
biome.json\`\`\`
1{2  "assist": {3    "includes": \["src/\*\*/\*.js"]4  }5}

````

`*` is used to match *all files in a folder*, while `**` *recursively* matches
all files and subfolders in a folder. For more information on globs, see the
[glob syntax reference](#glob-syntax-reference)
`includes` also supports negated patterns, or exceptions. These are patterns
that start with `!` and they can be used to instruct Biome to process all files
*except* those matching the negated pattern.
Note that exceptions are processed in order, allowing you to specify exceptions
to exceptions.
Consider the following example:

biome.json```
1{2  "assist": {3    "includes": ["**", "!**/*.test.js", "**/special.test.js"]4  }5}
````

This example specifies that:

1. $1

2. $1

3. $1

This means that:

- `src/app.js` **is** analysed.

- `src/app.test.js` **is not** analyzed.

- `src/special.test.js` \**is* analyzed.

Note that `assist.includes` is applied *after* `files.includes`. This means
that any file that is not matched by `files.includes` can no longer be matched
`assist.includes`. This means the following example **doesn’t work**:
biome.jsonc\`\`\`
1{2  "files": {3    "includes": "src/**"4  },5  "assist": {6    // This matches nothing because there is no overlap with `files.includes`:7    "includes": "scripts/**"8  }9}

````

If `assist.includes` is not specified, all files matched by
[`files.includes`](#filesincludes) are linted.
Note

Due to a technical limitation, `assist.includes` also cannot match folders
while `files.includes` can. If you want to match all files inside a folder,
you should explicitly add `/**` at the end.
### `assist.actions.recommended`

[Section titled “assist.actions.recommended”](#assistactionsrecommended)
Enables the recommended actions for all groups.

### `assist.actions.[group]`

[Section titled “assist.actions.[group]”](#assistactionsgroup)
Options that influence the rules of a single group. Biome supports the following groups:

- source: This group represents those actions that can be safely applied to a document upon saving. These actions are all generally safe, they typically don’t change the functionality of the program.

### `assist.actions.[group].recommended`

[Section titled “assist.actions.[group].recommended”](#assistactionsgrouprecommended)
Enables the recommended rules for a single group.

Example:

biome.json```
1{2  "assist": {3    "enabled": true,4    "actions": {5      "source": {6        "recommended": true7      }8    }9  }10}
````

## `formatter`

[Section titled “formatter”](#formatter)
These options apply to all languages. There are additional language-specific formatting options below.

### `formatter.enabled`

[Section titled “formatter.enabled”](#formatterenabled)
Enables Biome’s formatter.

Default: `true`

### `formatter.includes`

[Section titled “formatter.includes”](#formatterincludes)
A list of [glob patterns](#glob-syntax-reference) of files to format.

The following example formats all files with a `.js` extension inside the `src`
folder:
biome.json\`\`\`
1{2  "formatter": {3    "includes": \["src/\*\*/\*.js"]4  }5}

````

`*` is used to match *all files in a folder*, while `**` *recursively* matches
all files and subfolders in a folder. For more information on globs, see the
[glob syntax reference](#glob-syntax-reference)
`includes` also supports negated patterns, or exceptions. These are patterns
that start with `!` and they can be used to instruct Biome to process all files
*except* those matching the negated pattern.
Note that exceptions are processed in order, allowing you to specify exceptions
to exceptions.
Consider the following example:

biome.json```
1{2  "formatter": {3    "includes": ["**", "!**/*.test.js", "**/special.test.js"]4  }5}
````

This example specifies that:

1. $1

2. $1

3. $1

This means that:

- `src/app.js` **is** formatted.

- `src/app.test.js` **is not** formatted.

- `src/special.test.js` **is** formatted.

Note that `formatter.includes` is applied *after* `files.includes`. This means
that any file that is not matched by `files.includes` can no longer be matched
`formatter.includes`. This means the following example **doesn’t work**:
biome.jsonc\`\`\`
1{2  "files": {3    "includes": "src/**"4  },5  "formatter": {6    // This matches nothing because there is no overlap with `files.includes`:7    "includes": "scripts/**"8  }9}

````

If `formatter.includes` is not specified, all files matched by
[`files.includes`](#filesincludes) are formatted.
Note

Due to a technical limitation, `formatter.includes` also cannot match folders
while `files.includes` can. If you want to match all files inside a folder,
you should explicitly add `/**` at the end.
### `formatter.formatWithErrors`

[Section titled “formatter.formatWithErrors”](#formatterformatwitherrors)
Allows to format a document that has syntax errors.

biome.json```
1{2  "formatter": {3    "formatWithErrors": true4  }5}
````

Default: `false`

### `formatter.indentStyle`

[Section titled “formatter.indentStyle”](#formatterindentstyle)
The style of the indentation. It can be `"tab"` or `"space"`.

Default: `"tab"`

### `formatter.indentWidth`

[Section titled “formatter.indentWidth”](#formatterindentwidth)
How big the indentation should be.

Default: `2`

### `formatter.lineEnding`

[Section titled “formatter.lineEnding”](#formatterlineending)
The type of line ending.

- `"lf"`, Line Feed only (`\n`), common on Linux and macOS as well as inside git repos;

- `"crlf"`, Carriage Return + Line Feed characters (`\r\n`), common on Windows;

- `"cr"`, Carriage Return character only (`\r`), used very rarely.

Default: `"lf"`

### `formatter.lineWidth`

[Section titled “formatter.lineWidth”](#formatterlinewidth)
The amount of characters that can be written on a single line..

Default: `80`

### `formatter.attributePosition`

[Section titled “formatter.attributePosition”](#formatterattributeposition)
The attribute position style in HTMLish languages.

- `"auto"`, the attributes are automatically formatted, and they will collapse in multiple lines only when they hit certain criteria;

- `"multiline"`, the attributes will collapse in multiple lines if more than 1 attribute is used.

Default: `"auto"`

### `formatter.bracketSpacing`

[Section titled “formatter.bracketSpacing”](#formatterbracketspacing)
Choose whether spaces should be added between brackets and inner values.

Default: `true`

### `formatter.expand`

[Section titled “formatter.expand”](#formatterexpand)
Whether to expand arrays and objects on multiple lines.

`"auto"`, object literals are formatted on multiple lines if the first property has a newline,
and array literals are formatted on a single line if it fits in the line.

- `"always"`, these literals are formatted on multiple lines, regardless of length of the list.

- `"never"`, these literals are formatted on a single line if it fits in the line.

When formatting `package.json`, Biome will use `always` unless configured otherwise.

Default: `"auto"`

### `formatter.useEditorconfig`

[Section titled “formatter.useEditorconfig”](#formatteruseeditorconfig)
Whether Biome should use the `.editorconfig` file to determine the formatting options.

The config files `.editorconfig` and `biome.json` will follow the following rules:

- Formatting settings in `biome.json` always take precedence over `.editorconfig` files.

- `.editorconfig` files that exist higher up in the hierarchy than a `biome.json` file are already ignored. This is to avoid loading formatting settings from someone’s home directory into a project with a `biome.json` file.

- Nested `.editorconfig` files aren’t supported currently.

Default: `false`

## `javascript`

[Section titled “javascript”](#javascript)
These options apply only to JavaScript (and TypeScript) files.

### `javascript.parser.unsafeParameterDecoratorsEnabled`

[Section titled “javascript.parser.unsafeParameterDecoratorsEnabled”](#javascriptparserunsafeparameterdecoratorsenabled)
Allows to support the unsafe/experimental parameter decorators.

biome.json\`\`\`
1{2  "javascript": {3    "parser": {4      "unsafeParameterDecoratorsEnabled": true5    }6  }7}

````

Default: `false`

### `javascript.parser.jsxEverywhere`

[Section titled “javascript.parser.jsxEverywhere”](#javascriptparserjsxeverywhere)
When set to `true`, allows to parse JSX syntax inside `.js` files. When set to `false`, Biome will raise diagnostics when it encounters JSX syntax inside `.js` files.

Default: `true`

biome.json```
1{2  "javascript": {3    "parser": {4      "jsxEverywhere": false5    }6  }7}
````

### `javascript.formatter.quoteStyle`

[Section titled “javascript.formatter.quoteStyle”](#javascriptformatterquotestyle)
The type of quote used when representing string literals. It can be `"single"` or `"double"`.

Default: `"double"`

### `javascript.formatter.jsxQuoteStyle`

[Section titled “javascript.formatter.jsxQuoteStyle”](#javascriptformatterjsxquotestyle)
The type of quote used when representing jsx string literals. It can be `"single"` or `"double"`.

Default: `"double"`

biome.json\`\`\`
1{2  "javascript": {3    "formatter": {4      "jsxQuoteStyle": "single"5    }6  }7}

````

### `javascript.formatter.quoteProperties`

[Section titled “javascript.formatter.quoteProperties”](#javascriptformatterquoteproperties)
When properties inside objects should be quoted. It can be `"asNeeded"` or `"preserve"`.

Default: `"asNeeded"`

biome.json```
1{2  "javascript": {3    "formatter": {4      "quoteProperties": "preserve"5    }6  }7}
````

### `javascript.formatter.trailingCommas`

[Section titled “javascript.formatter.trailingCommas”](#javascriptformattertrailingcommas)
Print trailing commas wherever possible in multi-line comma-separated syntactic structures. Possible values:

- `"all"`, the trailing comma is always added;

- `"es5"`, the trailing comma is added only in places where it’s supported by older version of JavaScript;

- `"none"`, trailing commas are never added.

Default: `"all"`

### `javascript.formatter.semicolons`

[Section titled “javascript.formatter.semicolons”](#javascriptformattersemicolons)
It configures where the formatter prints semicolons:

- `"always"`, the semicolons is always added at the end of each statement;

- `"asNeeded"`, the semicolons are added only in places where it’s needed, to protect from [ASI](https://en.wikibooks.org/wiki/JavaScript/Automatic_semicolon_insertion).

Default: `"always"`

Example:

biome.json\`\`\`
1{2  "javascript": {3    "formatter": {4      "semicolons": "asNeeded"5    }6  }7}

````

### `javascript.formatter.arrowParentheses`

[Section titled “javascript.formatter.arrowParentheses”](#javascriptformatterarrowparentheses)
Whether to add non-necessary parentheses to arrow functions:

- `"always"`, the parentheses are always added;

- `"asNeeded"`, the parentheses are added only when they are needed.

Default: `"always"`

### `javascript.formatter.enabled`

[Section titled “javascript.formatter.enabled”](#javascriptformatterenabled)
Enables Biome’s formatter for JavaScript (and its super languages) files.

Default: `true`

### `javascript.formatter.indentStyle`

[Section titled “javascript.formatter.indentStyle”](#javascriptformatterindentstyle)
The style of the indentation for JavaScript (and its super languages) files. It can be `"tab"` or `"space"`.

Default: `"tab"`

### `javascript.formatter.indentWidth`

[Section titled “javascript.formatter.indentWidth”](#javascriptformatterindentwidth)
How big the indentation should be for JavaScript (and its super languages) files.

Default: `2`

### `javascript.formatter.lineEnding`

[Section titled “javascript.formatter.lineEnding”](#javascriptformatterlineending)
The type of line ending for JavaScript (and its super languages) files.

- `"lf"`, Line Feed only (`\n`), common on Linux and macOS as well as inside git repos;

- `"crlf"`, Carriage Return + Line Feed characters (`\r\n`), common on Windows;

- `"cr"`, Carriage Return character only (`\r`), used very rarely.

Default: `"lf"`

### `javascript.formatter.lineWidth`

[Section titled “javascript.formatter.lineWidth”](#javascriptformatterlinewidth)
The amount of characters that can be written on a single line in JavaScript (and its super languages) files.

Default: `80`

### `javascript.formatter.bracketSameLine`

[Section titled “javascript.formatter.bracketSameLine”](#javascriptformatterbracketsameline)
Choose whether the ending `>` of a multi-line JSX element should be on the last attribute line or not

Default: `false`

### `javascript.formatter.bracketSpacing`

[Section titled “javascript.formatter.bracketSpacing”](#javascriptformatterbracketspacing)
Choose whether spaces should be added between brackets and inner values.

Default: `true`

### `javascript.formatter.attributePosition`

[Section titled “javascript.formatter.attributePosition”](#javascriptformatterattributeposition)
The attribute position style in jsx elements.

- `"auto"`, do not enforce single attribute per line.

- `"multiline"`, enforce single attribute per line.

Default: `"auto"`

### `javascript.formatter.expand`

[Section titled “javascript.formatter.expand”](#javascriptformatterexpand)
Whether to expand arrays and objects on multiple lines.

`"auto"`, object literals are formatted on multiple lines if the first property has a newline,
and array literals are formatted on a single line if it fits in the line.
- `"always"`, these literals are formatted on multiple lines, regardless of length of the list.

- `"never"`, these literals are formatted on a single line if it fits in the line.

Default: `"auto"`

### `javascript.formatter.operatorLinebreak`

[Section titled “javascript.formatter.operatorLinebreak”](#javascriptformatteroperatorlinebreak)
When breaking binary expressions into multiple lines, whether to break them before or after the binary operator.

Default: `"after"`.

`"after`: the operator is placed after the expression:
file.js```
1if (2  expressionOne &#x26;&#x26;3  expressionTwo &#x26;&#x26;4  expressionThree &#x26;&#x26;5  expressionFour6) {}
````

`"before`: the operator is placed before the expression:
file.js\`\`\`
1if (2  expressionOne3  && expressionTwo4  && expressionThree5  && expressionFour6) {}

````

### `javascript.globals`

[Section titled “javascript.globals”](#javascriptglobals)
A list of global names that Biome should ignore (analyzer, linter, etc.)

biome.json```
1{2  "javascript": {3    "globals": ["$", "_", "externalVariable"]4  }5}
````

### `javascript.jsxRuntime`

[Section titled “javascript.jsxRuntime”](#javascriptjsxruntime)
Indicates the type of runtime or transformation used for interpreting JSX.

`"transparent"` — Indicates a modern or native JSX environment, that
doesn’t require special handling by Biome.
`"reactClassic"` — Indicates a classic React environment that requires
the `React` import. Corresponds to the `react` value for the
`jsx` option in TypeScript’s [`tsconfig.json`](https://www.typescriptlang.org/tsconfig#jsx).

biome.json\`\`\`
1{2  "javascript": {3    "jsxRuntime": "reactClassic"4  }5}

````

For more information about the old vs. new JSX runtime, please see:
[https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

Default: `"transparent"`

### `javascript.linter.enabled`

[Section titled “javascript.linter.enabled”](#javascriptlinterenabled)
Enables Biome’s linter for JavaScript (and its super languages) files.

Default: `true`

biome.json```
1{2  "javascript": {3    "linter": {4      "enabled": false5    }6  }7}
````

### `javascript.assist.enabled`

[Section titled “javascript.assist.enabled”](#javascriptassistenabled)
Enables Biome’s assist for JavaScript (and its super languages) files.

Default: `true`

biome.json\`\`\`
1{2  "javascript": {3    "assist": {4      "enabled": false5    }6  }7}

````

## `json`

[Section titled “json”](#json)
Options applied to the JSON files.

### `json.parser.allowComments`

[Section titled “json.parser.allowComments”](#jsonparserallowcomments)
Enables the parsing of comments in JSON files.

biome.json```
1{2  "json": {3    "parser": {4      "allowComments": true5    }6  }7}
````

### `json.parser.allowTrailingCommas`

[Section titled “json.parser.allowTrailingCommas”](#jsonparserallowtrailingcommas)
Enables the parsing of trailing commas in JSON files.

biome.json\`\`\`
1{2  "json": {3    "parser": {4      "allowTrailingCommas": true5    }6  }7}

````

### `json.formatter.enabled`

[Section titled “json.formatter.enabled”](#jsonformatterenabled)
Enables Biome’s formatter for JSON (and its super languages) files.

Default: `true`

biome.json```
1{2  "json": {3    "formatter": {4      "enabled": false5    }6  }7}
````

### `json.formatter.indentStyle`

[Section titled “json.formatter.indentStyle”](#jsonformatterindentstyle)
The style of the indentation for JSON (and its super languages) files. It can be `"tab"` or `"space"`.

Default: `"tab"`

### `json.formatter.indentWidth`

[Section titled “json.formatter.indentWidth”](#jsonformatterindentwidth)
How big the indentation should be for JSON (and its super languages) files.

Default: `2`

### `json.formatter.lineEnding`

[Section titled “json.formatter.lineEnding”](#jsonformatterlineending)
The type of line ending for JSON (and its super languages) files.

- `"lf"`, Line Feed only (`\n`), common on Linux and macOS as well as inside git repos;

- `"crlf"`, Carriage Return + Line Feed characters (`\r\n`), common on Windows;

- `"cr"`, Carriage Return character only (`\r`), used very rarely.

Default: `"lf"`

### `json.formatter.lineWidth`

[Section titled “json.formatter.lineWidth”](#jsonformatterlinewidth)
The amount of characters that can be written on a single line in JSON (and its super languages) files.

Default: `80`

### `json.formatter.trailingCommas`

[Section titled “json.formatter.trailingCommas”](#jsonformattertrailingcommas)
Print trailing commas wherever possible in multi-line comma-separated syntactic structures.

Allowed values:

- `"none"`: the trailing comma is removed;

- `"all"`: the trailing comma is kept **and** preferred.

Default: `"none"`

### `json.formatter.bracketSpacing`

[Section titled “json.formatter.bracketSpacing”](#jsonformatterbracketspacing)
Choose whether spaces should be added between brackets and inner values.

Default: `true`

### `json.formatter.expand`

[Section titled “json.formatter.expand”](#jsonformatterexpand)
Whether to expand arrays and objects on multiple lines.

`"auto"`, object literals are formatted on multiple lines if the first property has a newline,
and array literals are formatted on a single line if it fits in the line.

- `"always"`, these literals are formatted on multiple lines, regardless of length of the list.

- `"never"`, these literals are formatted on a single line if it fits in the line.

When formatting `package.json`, Biome will use `always` unless configured otherwise.

Default: `"auto"`

### `json.linter.enabled`

[Section titled “json.linter.enabled”](#jsonlinterenabled)
Enables Biome’s formatter for JSON (and its super languages) files.

Default: `true`

biome.json\`\`\`
1{2  "json": {3    "linter": {4      "enabled": false5    }6  }7}

````

### `json.assist.enabled`

[Section titled “json.assist.enabled”](#jsonassistenabled)
Enables Biome’s assist for JSON (and its super languages) files.

Default: `true`

biome.json```
1{2  "json": {3    "assist": {4      "enabled": false5    }6  }7}
````

## `css`

[Section titled “css”](#css)
Options applied to the CSS files.

### `css.parser.cssModules`

[Section titled “css.parser.cssModules”](#cssparsercssmodules)
Enables parsing of [CSS modules](https://github.com/css-modules/css-modules)

Default: `false`

### `css.formatter.enabled`

[Section titled “css.formatter.enabled”](#cssformatterenabled)
Enables Biome’s formatter for CSS files.

Default: `false`

biome.json\`\`\`
1{2  "css": {3    "formatter": {4      "enabled": false5    }6  }7}

````

### `css.formatter.indentStyle`

[Section titled “css.formatter.indentStyle”](#cssformatterindentstyle)
The style of the indentation for CSS files. It can be `"tab"` or `"space"`.

Default: `"tab"`

### `css.formatter.indentWidth`

[Section titled “css.formatter.indentWidth”](#cssformatterindentwidth)
How big the indentation should be for CSS files.

Default: `2`

biome.json```
1{2  "css": {3    "formatter": {4      "indentWidth": 25    }6  }7}
````

### `css.formatter.lineEnding`

[Section titled “css.formatter.lineEnding”](#cssformatterlineending)
The type of line ending for CSS  files.

- `"lf"`, Line Feed only (`\n`), common on Linux and macOS as well as inside git repos;

- `"crlf"`, Carriage Return + Line Feed characters (`\r\n`), common on Windows;

- `"cr"`, Carriage Return character only (`\r`), used very rarely.

Default: `"lf"`

### `css.formatter.lineWidth`

[Section titled “css.formatter.lineWidth”](#cssformatterlinewidth)
The amount of characters that can be written on a single line in CSS files.

Default: `80`

### `css.formatter.quoteStyle`

[Section titled “css.formatter.quoteStyle”](#cssformatterquotestyle)
The type of quote used when representing string literals. It can be `"single"` or `"double"`.

Default: `"double"`

### `css.linter.enabled`

[Section titled “css.linter.enabled”](#csslinterenabled)
Enables Biome’s linter for CSS files.

Default: `true`

biome.json\`\`\`
1{2  "css": {3    "linter": {4      "enabled": false5    }6  }7}

````

### `css.assist.enabled`

[Section titled “css.assist.enabled”](#cssassistenabled)
Enables Biome’s assist for CSS files.

Default: `true`

biome.json```
1{2  "css": {3    "assist": {4      "enabled": false5    }6  }7}
````

## `graphql`

[Section titled “graphql”](#graphql)
Options applied to the GraphQL files.

### `graphql.formatter.enabled`

[Section titled “graphql.formatter.enabled”](#graphqlformatterenabled)
Enables Biome’s formatter for GraphQL files.

Default: `false`

### `graphql.formatter.indentStyle`

[Section titled “graphql.formatter.indentStyle”](#graphqlformatterindentstyle)
The style of the indentation for GraphQL files. It can be `"tab"` or `"space"`.

Default: `"tab"`

### `graphql.formatter.indentWidth`

[Section titled “graphql.formatter.indentWidth”](#graphqlformatterindentwidth)
How big the indentation should be for GraphQL files.

Default: `2`

### `graphql.formatter.lineEnding`

[Section titled “graphql.formatter.lineEnding”](#graphqlformatterlineending)
The type of line ending for GraphQL files.

- `"lf"`, Line Feed only (`\n`), common on Linux and macOS as well as inside git repos;

- `"crlf"`, Carriage Return + Line Feed characters (`\r\n`), common on Windows;

- `"cr"`, Carriage Return character only (`\r`), used very rarely.

Default: `"lf"`

### `graphql.formatter.lineWidth`

[Section titled “graphql.formatter.lineWidth”](#graphqlformatterlinewidth)
The amount of characters that can be written on a single line in GraphQL files.

Default: `80`

### `graphql.formatter.quoteStyle`

[Section titled “graphql.formatter.quoteStyle”](#graphqlformatterquotestyle)
The type of quote used when representing string literals. It can be `"single"` or `"double"`.

Default: `"double"`

### `graphql.linter.enabled`

[Section titled “graphql.linter.enabled”](#graphqllinterenabled)
Enables Biome’s linter for GraphQL files.

Default: `true`

### `graphql.assist.enabled`

[Section titled “graphql.assist.enabled”](#graphqlassistenabled)
Enables Biome’s assist for GraphQL files.

Default: `true`

## `grit`

[Section titled “grit”](#grit)
Options applied to the Grit files.

### `grit.formatter.enabled`

[Section titled “grit.formatter.enabled”](#gritformatterenabled)
Enables Biome’s formatter for Grit files.

Default: `false`

### `grit.formatter.indentStyle`

[Section titled “grit.formatter.indentStyle”](#gritformatterindentstyle)
The style of the indentation for Grit files. It can be `"tab"` or `"space"`.

Default: `"tab"`

### `grit.formatter.indentWidth`

[Section titled “grit.formatter.indentWidth”](#gritformatterindentwidth)
How big the indentation should be for Grit files.

Default: `2`

### `grit.formatter.lineEnding`

[Section titled “grit.formatter.lineEnding”](#gritformatterlineending)
The type of line ending for Grit files.

- `"lf"`, Line Feed only (`\n`), common on Linux and macOS as well as inside git repos;

- `"crlf"`, Carriage Return + Line Feed characters (`\r\n`), common on Windows;

- `"cr"`, Carriage Return character only (`\r`), used very rarely.

Default: `"lf"`

### `grit.formatter.lineWidth`

[Section titled “grit.formatter.lineWidth”](#gritformatterlinewidth)
The amount of characters that can be written on a single line in Grit files.

Default: `80`

### `grit.formatter.quoteStyle`

[Section titled “grit.formatter.quoteStyle”](#gritformatterquotestyle)
The type of quote used when representing string literals. It can be `"single"` or `"double"`.

Default: `"double"`

### `grit.linter.enabled`

[Section titled “grit.linter.enabled”](#gritlinterenabled)
Enables Biome’s linter for Grit files.

Default: `true`

biome.json\`\`\`
1{2  "grit": {3    "linter": {4      "enabled": false5    }6  }7}

````

### `grit.assist.enabled`

[Section titled “grit.assist.enabled”](#gritassistenabled)
Enables Biome’s assist for Grit files.

Default: `true`

biome.json```
1{2  "grit": {3    "assist": {4      "enabled": false5    }6  }7}
````

## `html`

[Section titled “html”](#html)
Caution

The HTML parser and formatter are still considered experimental, which means that breaking changes
can happen in patch and minor versions.

### `html.parser.interpolation`

[Section titled “html.parser.interpolation”](#htmlparserinterpolation)
Enables the parsing of double text expressions such as `{{ expression }}` inside `.html` files.

Default: `false`

### `html.formatter.enabled`

[Section titled “html.formatter.enabled”](#htmlformatterenabled)
Enables Biome’s formatter for HTML files.

Default: `false`

### `html.formatter.enabled`

[Section titled “html.formatter.enabled”](#htmlformatterenabled-1)
Whether this formatting option should be enabled.

Default: `true`

### `html.formatter.indentStyle`

[Section titled “html.formatter.indentStyle”](#htmlformatterindentstyle)
The style of the indentation for HTML files. It can be `"tab"` or `"space"`.

Default: `"tab"`

### `html.formatter.indentWidth`

[Section titled “html.formatter.indentWidth”](#htmlformatterindentwidth)
How big the indentation should be for HTML files.

Default: `2`

### `html.formatter.lineEnding`

[Section titled “html.formatter.lineEnding”](#htmlformatterlineending)
The type of line ending for HTML files.

- `"lf"`, Line Feed only (`\n`), common on Linux and macOS as well as inside git repos;

- `"crlf"`, Carriage Return + Line Feed characters (`\r\n`), common on Windows;

- `"cr"`, Carriage Return character only (`\r`), used very rarely.

Default: `"lf"`

### `html.formatter.lineWidth`

[Section titled “html.formatter.lineWidth”](#htmlformatterlinewidth)
The amount of characters that can be written on a single line in HTML files.

Default: `80`

### `html.formatter.attributePosition`

[Section titled “html.formatter.attributePosition”](#htmlformatterattributeposition)
The attribute position style in HTML elements.

- `"auto"`, the attributes are automatically formatted, and they will collapse in multiple lines only when they hit certain criteria;

- `"multiline"`, the attributes will collapse in multiple lines if more than 1 attribute is used.

Default: `"auto"`

### `html.formatter.bracketSameLine`

[Section titled “html.formatter.bracketSameLine”](#htmlformatterbracketsameline)
Whether to hug the closing bracket of multiline HTML tags to the end of the last line, rather than being alone on the following line.

Default: `false`

### `html.formatter.whitespacesSensitivity`

[Section titled “html.formatter.whitespacesSensitivity”](#htmlformatterwhitespacessensitivity)
Whether to account for whitespace sensitivity when formatting HTML (and its super languages).

Default: “css”

`"css"`: The formatter considers whitespace significant for elements that have an “inline” display style by default in browser’s user agent style sheets.

`"strict"`: Leading and trailing whitespace in content is considered significant for all elements.

The formatter should leave at least one whitespace character if whitespace is present.
Otherwise, if there is no whitespace, it should not add any after `>` or before `&#x3C;`. In other words, if there’s no whitespace, the text content should hug the tags.
Example of text hugging the tags:

```
1&#x3C;b2   >content&#x3C;/b3>
```

content">

`"ignore"`: whitespace is considered insignificant. The formatter is free to remove or add whitespace as it sees fit.

### `html.formatter.indentScriptAndStyle`

[Section titled “html.formatter.indentScriptAndStyle”](#htmlformatterindentscriptandstyle)
Whether to indent the `&#x3C;script>` and `&#x3C;style>` tags for HTML (and its super languages).

Default: `true`

### `html.formatter.selfCloseVoidElements`

[Section titled “html.formatter.selfCloseVoidElements”](#htmlformatterselfclosevoidelements)
Whether void elements should be self-closed. Defaults to never.

Default: `"never"`

- `"never"`: The slash `/` inside void elements is removed by the formatter.

- `"always"`: The slash `/` inside void elements is always added.

## `overrides`

[Section titled “overrides”](#overrides)
A list of patterns.

Use this configuration to change the behaviour of the tools for certain files.

When a file is matched against an override pattern, the configuration specified in that pattern will be override the top-level configuration.

The order of the patterns matter. If a file *can* match three patterns, only the first one is used.

### `overrides.&#x3C;ITEM>.includes`

[Section titled “overrides.\<ITEM>.includes”](#overridesitemincludes)
A list of [glob patterns](https://en.wikipedia.org/wiki/Glob_\(programming\)) of
files for which to apply customised settings.
biome.jsonc\`\`\`
1{2  "overrides": \[{3    "includes": \["scripts/\*.js"],4    // settings that should only apply to the files specified in the includes field.5  }]6}

````

### `overrides.&#x3C;ITEM>.formatter`

[Section titled “overrides.&#x3C;ITEM>.formatter”](#overridesitemformatter)
Includes the options of the [top level formatter](#formatter) configuration, minus `ignore` and `include`.

#### Examples

[Section titled “Examples”](#examples)
For example, it’s possible to modify the formatter `lineWidth`, `indentStyle` for certain files that are included in the glob path `generated/**`:

biome.json```
1{2  "formatter": {3    "lineWidth": 1004  },5  "overrides": [6    {7      "includes": ["generated/**"],8      "formatter": {9        "lineWidth": 160,10        "indentStyle": "space"11      }12    }13  ]14}
````

### `overrides.&#x3C;ITEM>.linter`

[Section titled “overrides.\<ITEM>.linter”](#overridesitemlinter)
Includes the options of the [top level linter](#linter) configuration, minus `ignore` and `include`.

#### Examples

[Section titled “Examples”](#examples-1)
You can disable certain rules for certain glob paths, and disable the linter for other glob paths:

biome.json\`\`\`
1{2  "linter": {3    "enabled": true,4    "rules": {5      "recommended": true6    }7  },8  "overrides": \[9    {10      "includes": \["lib/**"],11      "linter": {12        "rules": {13          "suspicious": {14            "noDebugger": "off"15          }16        }17      }18    },19    {20      "includes": \["shims/**"],21      "linter": {22        "enabled": false23      }24    }25  ]26}

````

### `overrides.&#x3C;ITEM>.javascript`

[Section titled “overrides.&#x3C;ITEM>.javascript”](#overridesitemjavascript)
Includes the options of the [top level javascript](#javascript) configuration. Lets you override JavaScript-specific settings for certain files.

#### Examples

[Section titled “Examples”](#examples-2)
You can change the formatting behaviour of JavaScript files in certain folders:

biome.json```
1{2  "formatter": {3    "lineWidth": 1204  },5  "javascript": {6    "formatter": {7      "quoteStyle": "single"8    }9  },10  "overrides": [11    {12      "includes": ["lib/**"],13      "javascript": {14        "formatter": {15          "quoteStyle": "double"16        }17      }18    }19  ]20}
````

### `overrides.&#x3C;ITEM>.json`

[Section titled “overrides.\<ITEM>.json”](#overridesitemjson)
Includes the options of the [top level json](#json) configuration. Lets you override JSON-specific settings for certain files.

#### Examples

[Section titled “Examples”](#examples-3)
You can enable parsing features for certain JSON files:

biome.json\`\`\`
1{2  "linter": {3    "enabled": true,4    "rules": {5      "recommended": true6    }7  },8  "overrides": \[9    {10      "includes": \[".vscode/\*\*"],11      "json": {12        "parser": {13          "allowComments": true,14          "allowTrailingCommas": true15        }16      }17    }18  ]19}

```

### `overrides.&#x3C;ITEM>.[language]`

[Section titled “overrides.&#x3C;ITEM>.[language]”](#overridesitemlanguage)
Includes the options of the top level language configuration. Lets you override language-specific settings for certain files.

## Glob syntax reference

[Section titled “Glob syntax reference”](#glob-syntax-reference)
Glob patterns are used to match paths of files and folders. Biome supports the
following syntax in globs:

- `*` matches zero or more characters. It cannot match the path separator `/`.

`**` recursively matches directories and files. This sequence must be used as
an entire path component, so both `**a` and `b**` are invalid and will result
in an error. A sequence of more than two consecutive `*` characters is also
invalid.
`[...]` matches any character inside the brackets.
Ranges of characters can also be specified, as ordered by Unicode, so e.g.
`[0-9]` specifies any character between 0 and 9 inclusive.
`[!...]` is the negation of `[...]`, i.e. it matches any characters **not** in
the brackets.
If the entire glob starts with `!`, it is a so-called negated pattern. This
glob only matches if the path *doesn’t* match the glob. Negated patterns
cannot be used alone, they can only be used as *exception* to a regular glob.
When determining whether a file is included or not, Biome considers the parent
folders too. This means that if you want to *include* all files in a folder,
you need to use the `/**` suffix to match those files. But if you want to
*ignore* all files in a folder, you may do so without the `/**` suffix. We
recommend ignoring folders without the trailing `/**`, to avoid needlessly
traversing it, as well as to avoid the risk of Biome loading a `biome.json` or
a `.gitignore` file from an ignored folder.

Some examples:

- `dist/**` matches the `dist/` folder and all files inside it.

- `!dist` ignores the `dist/` folder and all files inside it.

`**/test/**` matches all files under any folder named `test`, regardless of
where they are. E.g. `dist/test`, `src/test`.
- `**/*.js` matches all files ending with the extension `.js` in all folders.

Caution

Glob patterns can be used in a Biome configuration file, but they can also be
specified from the command line. When you specify a glob on the command line,
it is interpreted by your shell rather than by Biome. Shells may support
slightly different syntax for globs. For instance, some shells do not support
the recursive pattern `**`.     Copyright (c) 2023-present Biome Developers and Contributors.
```
