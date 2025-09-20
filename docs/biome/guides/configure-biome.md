---
id: configure-biome
title: CONFIGURE BIOME
type: guide
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- typescript
priority: medium
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-09'
---

# CONFIGURE BIOME

*Source: <https://biomejs.dev/guides/configure-biome>*
*Fetched: 2025-08-30T00:47:25.464Z*

***

# Configure Biome

```
    This guide will help you to understand how to configure Biome.
```

It explains the structure of a Biome configuration file and how Biome resolves its configuration.
If you are already familiar with the configuration, you may want to take a look at the [configuration reference](/reference/configuration/), which details all the options available.
Biome allows you to customize its behavior using CLI options or a configuration file named `biome.json` or `biome.jsonc`.
We recommend that you create a configuration file for each project.
This ensures that each team member has the same configuration in the CLI and in any editor that allows Biome integration.
Many of the options available in a configuration file are also available in the CLI.

## Configuration file structure

[Section titled “Configuration file structure”](#configuration-file-structure)
A Biome configuration file is named `biome.json` or `biome.jsonc`. It is usually
placed in your project’s root folder, next to your project’s `package.json`.
Because Biome is a toolchain, its configuration is organized around the tools it
provides. At the moment, Biome provides three tools: the formatter, the linter
and the assist. All of these tools are enabled by default. You can disable one
or several of them using the `&#x3C;tool>.enabled` field:
biome.json\`\`\`
1{2  "$schema": "<https://biomejs.dev/schemas/2.0.5/schema.json",3>  "formatter": {4    "enabled": false5  },6  "linter": {7    "enabled": false8  },9  "assist": {10    "enabled": false11  }12}

````

Options that apply to more than one language are placed in the corresponding tool field.
Language-specific options of a tool are placed under a `&#x3C;language>.&#x3C;tool>` field.
This also allows overriding general options for a given language.
You can also enable or disable a tool based on the language.
In the following example, we configure the general options `formatter.indentStyle` and `formatter.lineWidth` for all the languages.
Also, we set the JavaScript-specific option `quoteStyle` in `javascript.formatter` and we override `formatter.lineWidth`.
We disabled the formatter for JSON files.
biome.jsonc```
1{2  "formatter": {3    "indentStyle": "space", // default is `tab`4    "lineWidth": 100 // default is `80`5  },6  "javascript": {7    "formatter": {8      "quoteStyle": "single", // default is `double`9      "lineWidth": 120 // override `formatter.lineWidth`10    }11  },12  "json": {13    "formatter": {14      "enabled": false15    }16  }17}
````

Note

Biome refers to all variants of the JavaScript language as `javascript`.
This includes TypeScript, JSX and TSX.

## Configuration file resolution

[Section titled “Configuration file resolution”](#configuration-file-resolution)
Biome uses auto discovery to find the nearest configuration file. It looks in
the working directory and its parent folders until it finds a `biome.json` or a
`biome.jsonc` file. If no configuration is found, Biome’s default configuration
is used. If both `biome.json` and `biome.jsonc` are present in the same folder,
`biome.json` is used.
Here’s an example:

Directoryapp/
Directorybackend/

- biome.json
- package.json

Directoryfrontend/
Directorylegacy/

- package.json

Directorynew/

- package.json

biome.json

- Biome commands that run in `app/backend/package.json` will use the configuration file `app/backend/biome.json`;

Biome commands that run in `app/frontend/legacy/package.json` and `app/frontend/new/package.json`
will use the configuration file `app/frontend/biome.json`;

Note

Biome (since v2.0.0) supports nested `biome.json` files. For more information, read [Use Biome in big projects](/guides/big-projects#use-multiple-configuration-files).

## Specifying files to process

[Section titled “Specifying files to process”](#specifying-files-to-process)
You can control the files/folders to process using different strategies, either CLI, configuration and VCS.

Note

By default, Biome always ignores some files that are said to be **protected files**.
This means that no diagnostics will be ever emitted by Biome for those files.
At the moment, the following files are protected:

- `composer.lock`

- `npm-shrinkwrap.json`

- `package-lock.json`

- `bun.lock`

### Include files via CLI

[Section titled “Include files via CLI”](#include-files-via-cli)
The first way to control which files and folders are processed by Biome is to
list them in the CLI. In the following command, we only format `file1.js` and
all the files in the `src` folder, because folders are recursively traversed.
Terminal window\`\`\`
1biome format file1.js src/

````

Caution

Glob patterns used on the command line are not interpreted by Biome.
They are expanded by your shell.
Some shells don’t support the recursive glob `**`.
### Control files via configuration

[Section titled “Control files via configuration”](#control-files-via-configuration)
The Biome configuration file can be used to refine which files are processed.
You can explicitly list the files to be processed using
[the `files.includes` field](/reference/configuration/#filesincludes).
`files.includes` accepts
[glob patterns](/reference/configuration/#glob-syntax-reference) such as
`src/**/*.js`. Negated patterns starting with `!` can be used to exclude files.
Paths and globs inside Biome’s configuration file are resolved relative to the
folder the configuration file is in. An exception to this is when a
configuration file is [extended](/reference/configuration/#extends) by another.
`files.includes` applies to all of Biome’s tools, meaning the files specified
here are processed by the linter, the formatter and the assist, unless specified
otherwise. For the individual tools, you can further refine the matching files
using `&#x3C;tool>.includes`.
#### Include files via configuration

[Section titled “Include files via configuration”](#include-files-via-configuration)
Let’s take the following configuration, where we want to include only JavaScript files (`.js`) that are inside
the `src/` folder, the `test/` folder, and ignore files that have `.min.js` in their name:
biome.json```
1{2  "files": {3    "includes": ["src/**/*.js", "test/**/*.js", "!**/*.min.js"]4  },5  "linter": {6    "includes": ["**", "!test/**"]7  }8}
````

And run the following command:

Terminal window\`\`\`
1biome format test/

````

The command will format the files that end with the `.js` extension and don’t
end with the `.min.js` extension from the `test/` folder.
The files in `src/` are not formatted because the folder is not listed in the
CLI.
If we run the following command, no files are linted because files inside the
`test/` folder are explicitly ignored for the linter.
Terminal window```
1biome lint test/
````

Caution

The global `files.includes` has slightly different semantics than the more
specific `&#x3C;tool>.includes` fields. Any file or folder that doesn’t match
`files.includes` is excluded from use by any of Biome’s tools. This means that
any tool-specific `includes` field can never match a file that doesn’t also
match `files.includes`.

#### Exclude files via configuration

[Section titled “Exclude files via configuration”](#exclude-files-via-configuration)
If you want to exclude files and folders from being processed by Biome, you can use the `files.includes` configuration
and use the negated patterns, using the leading `!`.
Before listing the negated globs, **they must be preceded by the `**` pattern**.

In the following example, we tell Biome to include all files, except those in
any `dist/` folder, as well as those that end with `.generated.js`:
biome.json\`\`\`
1{2  "files": {3    "includes": \[4      "**",5      "!**/dist",6      "!\*\*/\*.generated.js"7    ]8  }9}

```

### Control files via VCS

[Section titled “Control files via VCS”](#control-files-via-vcs)
You can [ignore files ignored by your VCS](/guides/integrate-in-vcs#use-the-ignore-file).

## Well-known files

[Section titled “Well-known files”](#well-known-files)
Here are some well-known files that we specifically treat based on their file names, rather than their extensions.
Currently, the well-known files are JSON-like files only, but we may broaden the list to include other types when we support new parsers.
The following files are parsed as `JSON` files with both the options `json.parser.allowComments` and `json.parser.allowTrailingCommas` set to `false`.

- `.all-contributorsrc`

- `.arcconfig`

- `.auto-changelog`

- `.bowerrc`

- `.c8rc`

- `.htmlhintrc`

- `.imgbotconfig`

- `.jslintrc`

- `.nycrc`

- `.tern-config`

- `.tern-project`

- `.vuerc`

- `.watchmanconfig`

- `mcmod.info`

The following files are parsed as `JSON` files with the options `json.parser.allowComments` set to `true` but `json.parser.allowTrailingCommas` set to `false`. This is because the tools consuming these files can only strip comments.

- `.ember-cli`

- `.eslintrc.json`

- `.jscsrc`

- `.jshintrc`

- `tslint.json`

- `turbo.json`

The following files are parsed as `JSON` files with the options `json.parser.allowComments` and `json.parser.allowTrailingCommas` set to `true`. This is because the tools consuming these files are designed to accommodate such settings.

- `.babelrc`

- `.babelrc.json`

- `.devcontainer.json`

- `.hintrc`

- `.hintrc.json`

- `.swcrc`

- `api-documenter.json`

- `api-extractor.json`

- `babel.config.json`

- `deno.json`

- `devcontainer.json`

- `dprint.json`

- `jsconfig.json`

- `jsr.json`

- `language-configuration.json`

- `nx.json`

- `project.json`

- `tsconfig.json`

- `typedoc.json`

- `typescript.json`

     Copyright (c) 2023-present Biome Developers and Contributors.
```
