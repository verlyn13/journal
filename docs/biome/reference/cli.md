---
id: cli
title: CLI
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

# CLI

*Source: <https://biomejs.dev/reference/cli>*
*Fetched: 2025-08-30T00:47:25.744Z*

***

# CLI

```
    # Command summary
```

[Section titled “Command summary”](#command-summary)

- [`biome`↴](#biome)

- [`biome version`↴](#biome-version)

- [`biome rage`↴](#biome-rage)

- [`biome start`↴](#biome-start)

- [`biome stop`↴](#biome-stop)

- [`biome check`↴](#biome-check)

- [`biome lint`↴](#biome-lint)

- [`biome format`↴](#biome-format)

- [`biome ci`↴](#biome-ci)

- [`biome init`↴](#biome-init)

- [`biome lsp-proxy`↴](#biome-lsp-proxy)

- [`biome migrate`↴](#biome-migrate)

- [`biome migrate Biome`↴](#biome-migrate-Biome)

- [`biome migrate Biome`↴](#biome-migrate-Biome)

- [`biome search`↴](#biome-search)

- [`biome explain`↴](#biome-explain)

- [`biome clean`↴](#biome-clean)

## biome

[Section titled “biome”](#biome)
Biome official CLI. Use it to check the health of your project or run it to check single files.

**Usage**: **`biome`** *`COMMAND ...`*

**Available options:**

**`-h`**, **`--help`** —
Prints help information
**`-V`**, **`--version`** —
Prints version information

**Available commands:**

**`version`** —
Shows the Biome version information and quit.
**`rage`** —
Prints information for debugging.
**`start`** —
Starts the Biome daemon server process.
**`stop`** —
Stops the Biome daemon server process.
**`check`** —
Runs formatter, linter and import sorting to the requested files.
**`lint`** —
Run various checks on a set of files.
**`format`** —
Run the formatter on a set of files.
**`ci`** —
Command to use in CI environments. Runs formatter, linter and import sorting to the requested files.
**`init`** —
Bootstraps a new biome project. Creates a configuration file with some defaults.
**`lsp-proxy`** —
Acts as a server for the Language Server Protocol over stdin/stdout.
**`migrate`** —
Updates the configuration when there are breaking changes.
**`search`** —
EXPERIMENTAL: Searches for Grit patterns across a project.
**`explain`** —
Shows documentation of various aspects of the CLI.
**`clean`** —
Cleans the logs emitted by the daemon.

## biome version

[Section titled “biome version”](#biome-version)
Shows the Biome version information and quit.

**Usage**: **`biome`** **`version`**

**Global options applied to all commands**

**`    --colors`**=*`&#x3C;off|force>`* —
Set the formatting mode for markup: “off” prints everything as plain text, “force” forces the formatting of markup using ANSI even if the console output is determined to be incompatible

**`    --use-server`** —
Connect to a running instance of the Biome daemon server.

**`    --verbose`** —
Print additional diagnostics, and some diagnostics show more information. Also, print out what files were processed and which ones were modified.

**`    --config-path`**=*`PATH`* —
Set the file path to the configuration file, or the directory path to find `biome.json` or `biome.jsonc`. If used, it disables the default configuration file resolution.
Uses environment variable **`BIOME_CONFIG_PATH`**

**`    --max-diagnostics`**=*`&#x3C;none|&#x3C;NUMBER>>`* —
Cap the amount of diagnostics displayed. When `none` is provided, the limit is lifted.
\[default: 20]

**`    --skip-parse-errors`** —
Skip over files containing syntax errors instead of emitting an error diagnostic.

**`    --no-errors-on-unmatched`** —
Silence errors that would be emitted in case no files were processed during the execution of the command.

**`    --error-on-warnings`** —
Tell Biome to exit with an error code if some diagnostics emit warnings.

**`    --reporter`**=*`&#x3C;json|json-pretty|github|junit|summary|gitlab>`* —
Allows to change how diagnostics and summary are reported.

**`    --log-file`**=*`ARG`* —
Optional path to redirect log messages to.
If omitted, logs are printed to stdout.

**`    --log-level`**=*`&#x3C;none|debug|info|warn|error>`* —
The level of logging. In order, from the most verbose to the least verbose: debug, info, warn, error.
The value `none` won’t show any logging.

\[default: none]

**`    --log-kind`**=*`&#x3C;pretty|compact|json>`* —
How the log should look like.
\[default: pretty]

**`    --diagnostic-level`**=*`&#x3C;info|warn|error>`* —
The level of diagnostics to show. In order, from the lowest to the most important: info, warn, error. Passing `--diagnostic-level=error` will cause Biome to print only diagnostics that contain only errors.
\[default: info]

**Available options:**

**`-h`**, **`--help`** —
Prints help information

## biome rage

[Section titled “biome rage”](#biome-rage)
Prints information for debugging.

**Usage**: **`biome`** **`rage`** \[**`--daemon-logs`**] \[**`--formatter`**] \[**`--linter`**]

**Global options applied to all commands**

**`    --colors`**=*`&#x3C;off|force>`* —
Set the formatting mode for markup: “off” prints everything as plain text, “force” forces the formatting of markup using ANSI even if the console output is determined to be incompatible

**`    --use-server`** —
Connect to a running instance of the Biome daemon server.

**`    --verbose`** —
Print additional diagnostics, and some diagnostics show more information. Also, print out what files were processed and which ones were modified.

**`    --config-path`**=*`PATH`* —
Set the file path to the configuration file, or the directory path to find `biome.json` or `biome.jsonc`. If used, it disables the default configuration file resolution.
Uses environment variable **`BIOME_CONFIG_PATH`**

**`    --max-diagnostics`**=*`&#x3C;none|&#x3C;NUMBER>>`* —
Cap the amount of diagnostics displayed. When `none` is provided, the limit is lifted.
\[default: 20]

**`    --skip-parse-errors`** —
Skip over files containing syntax errors instead of emitting an error diagnostic.

**`    --no-errors-on-unmatched`** —
Silence errors that would be emitted in case no files were processed during the execution of the command.

**`    --error-on-warnings`** —
Tell Biome to exit with an error code if some diagnostics emit warnings.

**`    --reporter`**=*`&#x3C;json|json-pretty|github|junit|summary|gitlab>`* —
Allows to change how diagnostics and summary are reported.

**`    --log-file`**=*`ARG`* —
Optional path to redirect log messages to.
If omitted, logs are printed to stdout.

**`    --log-level`**=*`&#x3C;none|debug|info|warn|error>`* —
The level of logging. In order, from the most verbose to the least verbose: debug, info, warn, error.
The value `none` won’t show any logging.

\[default: none]

**`    --log-kind`**=*`&#x3C;pretty|compact|json>`* —
How the log should look like.
\[default: pretty]

**`    --diagnostic-level`**=*`&#x3C;info|warn|error>`* —
The level of diagnostics to show. In order, from the lowest to the most important: info, warn, error. Passing `--diagnostic-level=error` will cause Biome to print only diagnostics that contain only errors.
\[default: info]

**Available options:**

**`    --daemon-logs`** —
Prints the Biome daemon server logs
**`    --formatter`** —
Prints the formatter options applied
**`    --linter`** —
Prints the linter options applied
**`-h`**, **`--help`** —
Prints help information

## biome start

[Section titled “biome start”](#biome-start)
Starts the Biome daemon server process.

**Usage**: **`biome`** **`start`**

**Available options:**

**`    --log-prefix-name`**=*`STRING`* —
Allows to change the prefix applied to the file name of the logs.
Uses environment variable **`BIOME_LOG_PREFIX_NAME`**

\[default: server.log]

**`    --log-path`**=*`PATH`* —
Allows to change the folder where logs are stored.
Uses environment variable **`BIOME_LOG_PATH`**

**`-h`**, **`--help`** —
Prints help information

## biome stop

[Section titled “biome stop”](#biome-stop)
Stops the Biome daemon server process.

**Usage**: **`biome`** **`stop`**

**Available options:**

**`-h`**, **`--help`** —
Prints help information

## biome check

[Section titled “biome check”](#biome-check)
Runs formatter, linter and import sorting to the requested files.

**Usage**: **`biome`** **`check`** \[**`--write`**] \[**`--unsafe`**] \[**`--assist-enabled`**=*`&#x3C;true|false>`*] \[**`--enforce-assist`**=*`&#x3C;true|false>`*] \[**`--staged`**] \[**`--changed`**] \[**`--since`**=*`REF`*] \[*`PATH`*]…

**The configuration that is contained inside the file `biome.json`**

**`    --vcs-enabled`**=*`&#x3C;true|false>`* —
Whether Biome should integrate itself with the VCS client

**`    --vcs-client-kind`**=*`&#x3C;git>`* —
The kind of client.

**`    --vcs-use-ignore-file`**=*`&#x3C;true|false>`* —
Whether Biome should use the VCS ignore file. When \[true], Biome will ignore the files specified in the ignore file.

**`    --vcs-root`**=*`PATH`* —
The folder where Biome should check for VCS files. By default, Biome will use the same folder where `biome.json` was found.
If Biome can’t find the configuration, it will attempt to use the current working directory. If no current working directory can’t be found, Biome won’t use the VCS integration, and a diagnostic will be emitted

**`    --vcs-default-branch`**=*`BRANCH`* —
The main branch of the project

**`    --files-max-size`**=*`NUMBER`* —
The maximum allowed size for source code files in bytes. Files above this limit will be ignored for performance reasons. Defaults to 1 MiB

**`    --files-ignore-unknown`**=*`&#x3C;true|false>`* —
Tells Biome to not emit diagnostics when handling files that doesn’t know

**`    --indent-style`**=*`&#x3C;tab|space>`* —
The indent style.

**`    --indent-width`**=*`NUMBER`* —
The size of the indentation, 2 by default

**`    --line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending.

**`    --line-width`**=*`NUMBER`* —
What’s the max width of a line. Defaults to 80.

**`    --attribute-position`**=*`&#x3C;multiline|auto>`* —
The attribute position style in HTML-ish languages. Defaults to auto.

**`    --bracket-same-line`**=*`&#x3C;true|false>`* —
Put the `>` of a multi-line HTML or JSX element at the end of the last line instead of being alone on the next line (does not apply to self closing elements).

**`    --bracket-spacing`**=*`&#x3C;true|false>`* —
Whether to insert spaces around brackets in object literals. Defaults to true.

**`    --expand`**=*`&#x3C;auto|always|never>`* —
Whether to expand arrays and objects on multiple lines. When set to `auto`, object literals are formatted on multiple lines if the first property has a newline, and array literals are formatted on a single line if it fits in the line. When set to `always`, these literals are formatted on multiple lines, regardless of length of the list. When set to `never`, these literals are formatted on a single line if it fits in the line. When formatting `package.json`, Biome will use `always` unless configured otherwise. Defaults to “auto”.

**`    --use-editorconfig`**=*`&#x3C;true|false>`* —
Use any `.editorconfig` files to configure the formatter. Configuration in `biome.json` will override `.editorconfig` configuration.
Default: `true`.

**`    --jsx-everywhere`**=*`&#x3C;true|false>`* —
When enabled, files like `.js`/`.mjs`/`.cjs` may contain JSX syntax.
Defaults to `true`.

**`    --javascript-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for JavaScript (and its super languages) files.

**`    --jsx-quote-style`**=*`&#x3C;double|single>`* —
The type of quotes used in JSX. Defaults to double.

**`    --quote-properties`**=*`&#x3C;preserve|as-needed>`* —
When properties in objects are quoted. Defaults to asNeeded.

**`    --trailing-commas`**=*`&#x3C;all|es5|none>`* —
Print trailing commas wherever possible in multi-line comma-separated syntactic structures. Defaults to “all”.

**`    --semicolons`**=*`&#x3C;always|as-needed>`* —
Whether the formatter prints semicolons for all statements or only in for statements where it is necessary because of ASI.

**`    --arrow-parentheses`**=*`&#x3C;always|as-needed>`* —
Whether to add non-necessary parentheses to arrow functions. Defaults to “always”.

**`    --bracket-same-line`**=*`&#x3C;true|false>`* —
Whether to hug the closing bracket of multiline HTML/JSX tags to the end of the last line, rather than being alone on the following line. Defaults to false.

**`    --javascript-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to JavaScript (and its super languages) files.

**`    --javascript-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to JavaScript (and its super languages) files. Default to 2.

**`    --javascript-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to JavaScript (and its super languages) files.

**`    --javascript-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to JavaScript (and its super languages) files. Defaults to 80.

**`    --javascript-formatter-quote-style`**=*`&#x3C;double|single>`* —
The type of quotes used in JavaScript code. Defaults to double.

**`    --javascript-formatter-attribute-position`**=*`&#x3C;multiline|auto>`* —
The attribute position style in JSX elements. Defaults to auto.

**`    --javascript-formatter-bracket-spacing`**=*`&#x3C;true|false>`* —
Whether to insert spaces around brackets in object literals. Defaults to true.

**`    --javascript-formatter-expand`**=*`&#x3C;auto|always|never>`* —
Whether to expand arrays and objects on multiple lines. When set to `auto`, object literals are formatted on multiple lines if the first property has a newline, and array literals are formatted on a single line if it fits in the line. When set to `always`, these literals are formatted on multiple lines, regardless of length of the list. When set to `never`, these literals are formatted on a single line if it fits in the line. When formatting `package.json`, Biome will use `always` unless configured otherwise. Defaults to “auto”.

**`    --javascript-formatter-operator-linebreak`**=*`&#x3C;before|after>`* —
When breaking binary expressions into multiple lines, whether to break them before or after the binary operator. Defaults to “after”.

**`    --javascript-linter-enabled`**=*`&#x3C;true|false>`* —
Control the linter for JavaScript (and its super languages) files.

**`    --javascript-assist-enabled`**=*`&#x3C;true|false>`* —
Control the assist for JavaScript (and its super languages) files.

**`    --json-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for JSON (and its super languages) files.

**`    --json-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to JSON (and its super languages) files.

**`    --json-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to JSON (and its super languages) files. Default to 2.

**`    --json-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to JSON (and its super languages) files.

**`    --json-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to JSON (and its super languages) files. Defaults to 80.

**`    --json-formatter-trailing-commas`**=*`&#x3C;none|all>`* —
Print trailing commas wherever possible in multi-line comma-separated syntactic structures. Defaults to “none”.

**`    --json-formatter-expand`**=*`&#x3C;auto|always|never>`* —
Whether to expand arrays and objects on multiple lines. When set to `auto`, object literals are formatted on multiple lines if the first property has a newline, and array literals are formatted on a single line if it fits in the line. When set to `always`, these literals are formatted on multiple lines, regardless of length of the list. When set to `never`, these literals are formatted on a single line if it fits in the line. When formatting `package.json`, Biome will use `always` unless configured otherwise. Defaults to “auto”.

**`    --json-formatter-bracket-spacing`**=*`&#x3C;true|false>`* —
Whether to insert spaces around brackets in object literals. Defaults to true.

**`    --json-linter-enabled`**=*`&#x3C;true|false>`* —
Control the linter for JSON (and its super languages) files.

**`    --json-assist-enabled`**=*`&#x3C;true|false>`* —
Control the assist for JSON (and its super languages) files.

**`    --css-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for CSS (and its super languages) files.

**`    --css-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to CSS (and its super languages) files.

**`    --css-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to CSS (and its super languages) files. Default to 2.

**`    --css-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to CSS (and its super languages) files.

**`    --css-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to CSS (and its super languages) files. Defaults to 80.

**`    --css-formatter-quote-style`**=*`&#x3C;double|single>`* —
The type of quotes used in CSS code. Defaults to double.

**`    --css-linter-enabled`**=*`&#x3C;true|false>`* —
Control the linter for CSS files.

**`    --css-assist-enabled`**=*`&#x3C;true|false>`* —
Control the assist for CSS files.

**`    --graphql-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for GraphQL files.

**`    --graphql-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to GraphQL files.

**`    --graphql-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to GraphQL files. Default to 2.

**`    --graphql-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to GraphQL files.

**`    --graphql-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to GraphQL files. Defaults to 80.

**`    --graphql-formatter-quote-style`**=*`&#x3C;double|single>`* —
The type of quotes used in GraphQL code. Defaults to double.

**`    --graphql-linter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for GraphQL files.

**`    --graphql-assist-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for GraphQL files.

**`    --grit-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for Grit files.

**`    --grit-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to Grit files.

**`    --grit-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to Grit files. Default to 2.

**`    --grit-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to Grit files.

**`    --grit-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to Grit files. Defaults to 80.

**`    --grit-linter-enabled`**=*`&#x3C;true|false>`* —
Control the linter for Grit files.

**`    --grit-assist-enabled`**=*`&#x3C;true|false>`* —
Control the assist functionality for Grit files.

**`    --html-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for HTML (and its super languages) files.

**`    --html-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to HTML (and its super languages) files.

**`    --html-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to HTML (and its super languages) files. Default to 2.

**`    --html-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to HTML (and its super languages) files.

**`    --html-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to HTML (and its super languages) files. Defaults to 80.

**`    --html-formatter-attribute-position`**=*`&#x3C;multiline|auto>`* —
The attribute position style in HTML elements. Defaults to auto.

**`    --html-formatter-bracket-same-line`**=*`&#x3C;true|false>`* —
Whether to hug the closing bracket of multiline HTML tags to the end of the last line, rather than being alone on the following line. Defaults to false.

**`    --html-formatter-whitespace-sensitivity`**=*`&#x3C;css|strict|ignore>`* —
Whether to account for whitespace sensitivity when formatting HTML (and its super languages). Defaults to “css”.

**`    --html-formatter-indent-script-and-style`**=*`&#x3C;true|false>`* —
Whether to indent the `&#x3C;script>` and `&#x3C;style>` tags for HTML (and its super languages). Defaults to false.

**`    --html-formatter-self-close-void-elements`**=*`&#x3C;always|never>`* —
Whether void elements should be self-closed. Defaults to never.

**`    --assist-enabled`**=*`&#x3C;true|false>`* —
Whether Biome should enable assist via LSP and CLI.

**Global options applied to all commands**

**`    --colors`**=*`&#x3C;off|force>`* —
Set the formatting mode for markup: “off” prints everything as plain text, “force” forces the formatting of markup using ANSI even if the console output is determined to be incompatible

**`    --use-server`** —
Connect to a running instance of the Biome daemon server.

**`    --verbose`** —
Print additional diagnostics, and some diagnostics show more information. Also, print out what files were processed and which ones were modified.

**`    --config-path`**=*`PATH`* —
Set the file path to the configuration file, or the directory path to find `biome.json` or `biome.jsonc`. If used, it disables the default configuration file resolution.
Uses environment variable **`BIOME_CONFIG_PATH`**

**`    --max-diagnostics`**=*`&#x3C;none|&#x3C;NUMBER>>`* —
Cap the amount of diagnostics displayed. When `none` is provided, the limit is lifted.
\[default: 20]

**`    --skip-parse-errors`** —
Skip over files containing syntax errors instead of emitting an error diagnostic.

**`    --no-errors-on-unmatched`** —
Silence errors that would be emitted in case no files were processed during the execution of the command.

**`    --error-on-warnings`** —
Tell Biome to exit with an error code if some diagnostics emit warnings.

**`    --reporter`**=*`&#x3C;json|json-pretty|github|junit|summary|gitlab>`* —
Allows to change how diagnostics and summary are reported.

**`    --log-file`**=*`ARG`* —
Optional path to redirect log messages to.
If omitted, logs are printed to stdout.

**`    --log-level`**=*`&#x3C;none|debug|info|warn|error>`* —
The level of logging. In order, from the most verbose to the least verbose: debug, info, warn, error.
The value `none` won’t show any logging.

\[default: none]

**`    --log-kind`**=*`&#x3C;pretty|compact|json>`* —
How the log should look like.
\[default: pretty]

**`    --diagnostic-level`**=*`&#x3C;info|warn|error>`* —
The level of diagnostics to show. In order, from the lowest to the most important: info, warn, error. Passing `--diagnostic-level=error` will cause Biome to print only diagnostics that contain only errors.
\[default: info]

**Available positional items:**

*`PATH`* —
Single file, single path or list of paths

**Available options:**

**`    --write`** —
Apply safe fixes, formatting and import sorting

**`    --unsafe`** —
Apply unsafe fixes. Should be used with `--write` or `--fix`

**`    --fix`** —
Alias for `--write`, writes safe fixes, formatting and import sorting

**`    --formatter-enabled`**=*`&#x3C;true|false>`* —
Allow enabling or disabling the formatter check.

**`    --linter-enabled`**=*`&#x3C;true|false>`* —
Allow enabling or disabling the linter check.

**`    --assist-enabled`**=*`&#x3C;true|false>`* —
Allow enabling or disabling the assist.

**`    --enforce-assist`**=*`&#x3C;true|false>`* —
Allows enforcing assist, and make the CLI fail if some actions aren’t applied. Defaults to `true`.

**`    --stdin-file-path`**=*`PATH`* —
Use this option when you want to format code piped from `stdin`, and print the output to `stdout`.
The file doesn’t need to exist on disk, what matters is the extension of the file. Based on the extension, Biome knows how to check the code.

Also, if you have overrides configured and/or nested configurations, the path may determine the settings being applied.

Example: `shell echo 'let a;' | biome check --stdin-file-path=file.js --write `

**`    --staged`** —
When set to true, only the files that have been staged (the ones prepared to be committed) will be linted. This option should be used when working locally.

**`    --changed`** —
When set to true, only the files that have been changed compared to your `defaultBranch` configuration will be linted. This option should be used in CI environments.

**`    --since`**=*`REF`* —
Use this to specify the base branch to compare against when you’re using the —changed flag and the `defaultBranch` is not set in your `biome.json`

**`-h`**, **`--help`** —
Prints help information

## biome lint

[Section titled “biome lint”](#biome-lint)
Run various checks on a set of files.

**Usage**: **`biome`** **`lint`** \[**`--write`**] \[**`--unsafe`**] \[**`--suppress`**] \[**`--reason`**=*`STRING`*] \[**`--only`**=*`&#x3C;GROUP|RULE>`*]… \[**`--skip`**=*`&#x3C;GROUP|RULE>`*]… \[**`--staged`**] \[**`--changed`**] \[**`--since`**=*`REF`*] \[*`PATH`*]…

**Set of properties to integrate Biome with a VCS software.**

**`    --vcs-enabled`**=*`&#x3C;true|false>`* —
Whether Biome should integrate itself with the VCS client

**`    --vcs-client-kind`**=*`&#x3C;git>`* —
The kind of client.

**`    --vcs-use-ignore-file`**=*`&#x3C;true|false>`* —
Whether Biome should use the VCS ignore file. When \[true], Biome will ignore the files specified in the ignore file.

**`    --vcs-root`**=*`PATH`* —
The folder where Biome should check for VCS files. By default, Biome will use the same folder where `biome.json` was found.
If Biome can’t find the configuration, it will attempt to use the current working directory. If no current working directory can’t be found, Biome won’t use the VCS integration, and a diagnostic will be emitted

**`    --vcs-default-branch`**=*`BRANCH`* —
The main branch of the project

**The configuration of the filesystem**

**`    --files-max-size`**=*`NUMBER`* —
The maximum allowed size for source code files in bytes. Files above this limit will be ignored for performance reasons. Defaults to 1 MiB
**`    --files-ignore-unknown`**=*`&#x3C;true|false>`* —
Tells Biome to not emit diagnostics when handling files that doesn’t know

**Linter options specific to the JavaScript linter**

**`    --javascript-linter-enabled`**=*`&#x3C;true|false>`* —
Control the linter for JavaScript (and its super languages) files.

**Linter options specific to the JSON linter**

**`    --json-linter-enabled`**=*`&#x3C;true|false>`* —
Control the linter for JSON (and its super languages) files.

**Global options applied to all commands**

**`    --colors`**=*`&#x3C;off|force>`* —
Set the formatting mode for markup: “off” prints everything as plain text, “force” forces the formatting of markup using ANSI even if the console output is determined to be incompatible

**`    --use-server`** —
Connect to a running instance of the Biome daemon server.

**`    --verbose`** —
Print additional diagnostics, and some diagnostics show more information. Also, print out what files were processed and which ones were modified.

**`    --config-path`**=*`PATH`* —
Set the file path to the configuration file, or the directory path to find `biome.json` or `biome.jsonc`. If used, it disables the default configuration file resolution.
Uses environment variable **`BIOME_CONFIG_PATH`**

**`    --max-diagnostics`**=*`&#x3C;none|&#x3C;NUMBER>>`* —
Cap the amount of diagnostics displayed. When `none` is provided, the limit is lifted.
\[default: 20]

**`    --skip-parse-errors`** —
Skip over files containing syntax errors instead of emitting an error diagnostic.

**`    --no-errors-on-unmatched`** —
Silence errors that would be emitted in case no files were processed during the execution of the command.

**`    --error-on-warnings`** —
Tell Biome to exit with an error code if some diagnostics emit warnings.

**`    --reporter`**=*`&#x3C;json|json-pretty|github|junit|summary|gitlab>`* —
Allows to change how diagnostics and summary are reported.

**`    --log-file`**=*`ARG`* —
Optional path to redirect log messages to.
If omitted, logs are printed to stdout.

**`    --log-level`**=*`&#x3C;none|debug|info|warn|error>`* —
The level of logging. In order, from the most verbose to the least verbose: debug, info, warn, error.
The value `none` won’t show any logging.

\[default: none]

**`    --log-kind`**=*`&#x3C;pretty|compact|json>`* —
How the log should look like.
\[default: pretty]

**`    --diagnostic-level`**=*`&#x3C;info|warn|error>`* —
The level of diagnostics to show. In order, from the lowest to the most important: info, warn, error. Passing `--diagnostic-level=error` will cause Biome to print only diagnostics that contain only errors.
\[default: info]

**Available positional items:**

*`PATH`* —
Single file, single path or list of paths

**Available options:**

**`    --write`** —
Writes safe fixes

**`    --unsafe`** —
Apply unsafe fixes. Should be used with `--write` or `--fix`

**`    --fix`** —
Alias for `--write`, writes safe fixes

**`    --suppress`** —
Fixes lint rule violations with comment suppressions instead of using a rule code action (fix)

**`    --reason`**=*`STRING`* —
Explanation for suppressing diagnostics with `--suppress`

**`    --only`**=*`&#x3C;GROUP|RULE>`* —
Run only the given rule or group of rules. If the severity level of a rule is `off`, then the severity level of the rule is set to `error` if it is a recommended rule or `warn` otherwise.
Example: `biome lint --only=correctness/noUnusedVariables --only=suspicious`

**`    --skip`**=*`&#x3C;GROUP|RULE>`* —
Skip the given rule or group of rules by setting the severity level of the rules to `off`. This option takes precedence over `--only`.
Example: `biome lint --skip=correctness/noUnusedVariables --skip=suspicious`

**`    --stdin-file-path`**=*`PATH`* —
Use this option when you want to format code piped from `stdin`, and print the output to `stdout`.
The file doesn’t need to exist on disk, what matters is the extension of the file. Based on the extension, Biome knows how to lint the code.

Example: `shell echo 'let a;' | biome lint --stdin-file-path=file.js --write `

**`    --staged`** —
When set to true, only the files that have been staged (the ones prepared to be committed) will be linted.

**`    --changed`** —
When set to true, only the files that have been changed compared to your `defaultBranch` configuration will be linted.

**`    --since`**=*`REF`* —
Use this to specify the base branch to compare against when you’re using the —changed flag and the `defaultBranch` is not set in your biome.json

**`-h`**, **`--help`** —
Prints help information

## biome format

[Section titled “biome format”](#biome-format)
Run the formatter on a set of files.

**Usage**: **`biome`** **`format`** \[**`--write`**] \[**`--staged`**] \[**`--changed`**] \[**`--since`**=*`REF`*] \[*`PATH`*]…

**Generic options applied to all files**

**`    --indent-style`**=*`&#x3C;tab|space>`* —
The indent style.

**`    --indent-width`**=*`NUMBER`* —
The size of the indentation, 2 by default

**`    --line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending.

**`    --line-width`**=*`NUMBER`* —
What’s the max width of a line. Defaults to 80.

**`    --attribute-position`**=*`&#x3C;multiline|auto>`* —
The attribute position style in HTML-ish languages. Defaults to auto.

**`    --bracket-same-line`**=*`&#x3C;true|false>`* —
Put the `>` of a multi-line HTML or JSX element at the end of the last line instead of being alone on the next line (does not apply to self closing elements).

**`    --bracket-spacing`**=*`&#x3C;true|false>`* —
Whether to insert spaces around brackets in object literals. Defaults to true.

**`    --expand`**=*`&#x3C;auto|always|never>`* —
Whether to expand arrays and objects on multiple lines. When set to `auto`, object literals are formatted on multiple lines if the first property has a newline, and array literals are formatted on a single line if it fits in the line. When set to `always`, these literals are formatted on multiple lines, regardless of length of the list. When set to `never`, these literals are formatted on a single line if it fits in the line. When formatting `package.json`, Biome will use `always` unless configured otherwise. Defaults to “auto”.

**`    --use-editorconfig`**=*`&#x3C;true|false>`* —
Use any `.editorconfig` files to configure the formatter. Configuration in `biome.json` will override `.editorconfig` configuration.
Default: `true`.

**Formatting options specific to the JavaScript files**

**`    --javascript-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for JavaScript (and its super languages) files.
**`    --jsx-quote-style`**=*`&#x3C;double|single>`* —
The type of quotes used in JSX. Defaults to double.
**`    --quote-properties`**=*`&#x3C;preserve|as-needed>`* —
When properties in objects are quoted. Defaults to asNeeded.
**`    --trailing-commas`**=*`&#x3C;all|es5|none>`* —
Print trailing commas wherever possible in multi-line comma-separated syntactic structures. Defaults to “all”.
**`    --semicolons`**=*`&#x3C;always|as-needed>`* —
Whether the formatter prints semicolons for all statements or only in for statements where it is necessary because of ASI.
**`    --arrow-parentheses`**=*`&#x3C;always|as-needed>`* —
Whether to add non-necessary parentheses to arrow functions. Defaults to “always”.
**`    --bracket-same-line`**=*`&#x3C;true|false>`* —
Whether to hug the closing bracket of multiline HTML/JSX tags to the end of the last line, rather than being alone on the following line. Defaults to false.
**`    --javascript-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to JavaScript (and its super languages) files.
**`    --javascript-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to JavaScript (and its super languages) files. Default to 2.
**`    --javascript-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to JavaScript (and its super languages) files.
**`    --javascript-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to JavaScript (and its super languages) files. Defaults to 80.
**`    --javascript-formatter-quote-style`**=*`&#x3C;double|single>`* —
The type of quotes used in JavaScript code. Defaults to double.
**`    --javascript-formatter-attribute-position`**=*`&#x3C;multiline|auto>`* —
The attribute position style in JSX elements. Defaults to auto.
**`    --javascript-formatter-bracket-spacing`**=*`&#x3C;true|false>`* —
Whether to insert spaces around brackets in object literals. Defaults to true.
**`    --javascript-formatter-expand`**=*`&#x3C;auto|always|never>`* —
Whether to expand arrays and objects on multiple lines. When set to `auto`, object literals are formatted on multiple lines if the first property has a newline, and array literals are formatted on a single line if it fits in the line. When set to `always`, these literals are formatted on multiple lines, regardless of length of the list. When set to `never`, these literals are formatted on a single line if it fits in the line. When formatting `package.json`, Biome will use `always` unless configured otherwise. Defaults to “auto”.
**`    --javascript-formatter-operator-linebreak`**=*`&#x3C;before|after>`* —
When breaking binary expressions into multiple lines, whether to break them before or after the binary operator. Defaults to “after”.

**Set of properties to integrate Biome with a VCS software.**

**`    --vcs-enabled`**=*`&#x3C;true|false>`* —
Whether Biome should integrate itself with the VCS client

**`    --vcs-client-kind`**=*`&#x3C;git>`* —
The kind of client.

**`    --vcs-use-ignore-file`**=*`&#x3C;true|false>`* —
Whether Biome should use the VCS ignore file. When \[true], Biome will ignore the files specified in the ignore file.

**`    --vcs-root`**=*`PATH`* —
The folder where Biome should check for VCS files. By default, Biome will use the same folder where `biome.json` was found.
If Biome can’t find the configuration, it will attempt to use the current working directory. If no current working directory can’t be found, Biome won’t use the VCS integration, and a diagnostic will be emitted

**`    --vcs-default-branch`**=*`BRANCH`* —
The main branch of the project

**The configuration of the filesystem**

**`    --files-max-size`**=*`NUMBER`* —
The maximum allowed size for source code files in bytes. Files above this limit will be ignored for performance reasons. Defaults to 1 MiB
**`    --files-ignore-unknown`**=*`&#x3C;true|false>`* —
Tells Biome to not emit diagnostics when handling files that doesn’t know

**Global options applied to all commands**

**`    --colors`**=*`&#x3C;off|force>`* —
Set the formatting mode for markup: “off” prints everything as plain text, “force” forces the formatting of markup using ANSI even if the console output is determined to be incompatible

**`    --use-server`** —
Connect to a running instance of the Biome daemon server.

**`    --verbose`** —
Print additional diagnostics, and some diagnostics show more information. Also, print out what files were processed and which ones were modified.

**`    --config-path`**=*`PATH`* —
Set the file path to the configuration file, or the directory path to find `biome.json` or `biome.jsonc`. If used, it disables the default configuration file resolution.
Uses environment variable **`BIOME_CONFIG_PATH`**

**`    --max-diagnostics`**=*`&#x3C;none|&#x3C;NUMBER>>`* —
Cap the amount of diagnostics displayed. When `none` is provided, the limit is lifted.
\[default: 20]

**`    --skip-parse-errors`** —
Skip over files containing syntax errors instead of emitting an error diagnostic.

**`    --no-errors-on-unmatched`** —
Silence errors that would be emitted in case no files were processed during the execution of the command.

**`    --error-on-warnings`** —
Tell Biome to exit with an error code if some diagnostics emit warnings.

**`    --reporter`**=*`&#x3C;json|json-pretty|github|junit|summary|gitlab>`* —
Allows to change how diagnostics and summary are reported.

**`    --log-file`**=*`ARG`* —
Optional path to redirect log messages to.
If omitted, logs are printed to stdout.

**`    --log-level`**=*`&#x3C;none|debug|info|warn|error>`* —
The level of logging. In order, from the most verbose to the least verbose: debug, info, warn, error.
The value `none` won’t show any logging.

\[default: none]

**`    --log-kind`**=*`&#x3C;pretty|compact|json>`* —
How the log should look like.
\[default: pretty]

**`    --diagnostic-level`**=*`&#x3C;info|warn|error>`* —
The level of diagnostics to show. In order, from the lowest to the most important: info, warn, error. Passing `--diagnostic-level=error` will cause Biome to print only diagnostics that contain only errors.
\[default: info]

**Available positional items:**

*`PATH`* —
Single file, single path or list of paths.

**Available options:**

**`    --json-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for JSON (and its super languages) files.

**`    --json-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to JSON (and its super languages) files.

**`    --json-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to JSON (and its super languages) files. Default to 2.

**`    --json-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to JSON (and its super languages) files.

**`    --json-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to JSON (and its super languages) files. Defaults to 80.

**`    --json-formatter-trailing-commas`**=*`&#x3C;none|all>`* —
Print trailing commas wherever possible in multi-line comma-separated syntactic structures. Defaults to “none”.

**`    --json-formatter-expand`**=*`&#x3C;auto|always|never>`* —
Whether to expand arrays and objects on multiple lines. When set to `auto`, object literals are formatted on multiple lines if the first property has a newline, and array literals are formatted on a single line if it fits in the line. When set to `always`, these literals are formatted on multiple lines, regardless of length of the list. When set to `never`, these literals are formatted on a single line if it fits in the line. When formatting `package.json`, Biome will use `always` unless configured otherwise. Defaults to “auto”.

**`    --json-formatter-bracket-spacing`**=*`&#x3C;true|false>`* —
Whether to insert spaces around brackets in object literals. Defaults to true.

**`    --stdin-file-path`**=*`PATH`* —
Use this option when you want to format code piped from `stdin`, and print the output to `stdout`.
The file doesn’t need to exist on disk, what matters is the extension of the file. Based on the extension, Biome knows how to format the code.

Example: `shell echo 'let a;' | biome format --stdin-file-path=file.js --write `

**`    --write`** —
Writes formatted files to a file system.

**`    --fix`** —
Alias of `--write`, writes formatted files to a file system.

**`    --staged`** —
When set to true, only the files that have been staged (the ones prepared to be committed) will be linted.

**`    --changed`** —
When set to true, only the files that have been changed compared to your `defaultBranch` configuration will be linted.

**`    --since`**=*`REF`* —
Use this to specify the base branch to compare against when you’re using the —changed flag, and the `defaultBranch` is not set in your biome.json

**`-h`**, **`--help`** —
Prints help information

## biome ci

[Section titled “biome ci”](#biome-ci)
Command to use in CI environments. Runs formatter, linter and import sorting to the requested files.

Files won’t be modified, the command is a read-only operation.

**Usage**: **`biome`** **`ci`** \[**`--formatter-enabled`**=*`&#x3C;true|false>`*] \[**`--linter-enabled`**=*`&#x3C;true|false>`*] \[**`--assist-enabled`**=*`&#x3C;true|false>`*] \[**`--enforce-assist`**=*`&#x3C;true|false>`*] \[**`--changed`**] \[**`--since`**=*`REF`*] \[*`PATH`*]…

**The configuration that is contained inside the file `biome.json`**

**`    --vcs-enabled`**=*`&#x3C;true|false>`* —
Whether Biome should integrate itself with the VCS client

**`    --vcs-client-kind`**=*`&#x3C;git>`* —
The kind of client.

**`    --vcs-use-ignore-file`**=*`&#x3C;true|false>`* —
Whether Biome should use the VCS ignore file. When \[true], Biome will ignore the files specified in the ignore file.

**`    --vcs-root`**=*`PATH`* —
The folder where Biome should check for VCS files. By default, Biome will use the same folder where `biome.json` was found.
If Biome can’t find the configuration, it will attempt to use the current working directory. If no current working directory can’t be found, Biome won’t use the VCS integration, and a diagnostic will be emitted

**`    --vcs-default-branch`**=*`BRANCH`* —
The main branch of the project

**`    --files-max-size`**=*`NUMBER`* —
The maximum allowed size for source code files in bytes. Files above this limit will be ignored for performance reasons. Defaults to 1 MiB

**`    --files-ignore-unknown`**=*`&#x3C;true|false>`* —
Tells Biome to not emit diagnostics when handling files that doesn’t know

**`    --indent-style`**=*`&#x3C;tab|space>`* —
The indent style.

**`    --indent-width`**=*`NUMBER`* —
The size of the indentation, 2 by default

**`    --line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending.

**`    --line-width`**=*`NUMBER`* —
What’s the max width of a line. Defaults to 80.

**`    --attribute-position`**=*`&#x3C;multiline|auto>`* —
The attribute position style in HTML-ish languages. Defaults to auto.

**`    --bracket-same-line`**=*`&#x3C;true|false>`* —
Put the `>` of a multi-line HTML or JSX element at the end of the last line instead of being alone on the next line (does not apply to self closing elements).

**`    --bracket-spacing`**=*`&#x3C;true|false>`* —
Whether to insert spaces around brackets in object literals. Defaults to true.

**`    --expand`**=*`&#x3C;auto|always|never>`* —
Whether to expand arrays and objects on multiple lines. When set to `auto`, object literals are formatted on multiple lines if the first property has a newline, and array literals are formatted on a single line if it fits in the line. When set to `always`, these literals are formatted on multiple lines, regardless of length of the list. When set to `never`, these literals are formatted on a single line if it fits in the line. When formatting `package.json`, Biome will use `always` unless configured otherwise. Defaults to “auto”.

**`    --use-editorconfig`**=*`&#x3C;true|false>`* —
Use any `.editorconfig` files to configure the formatter. Configuration in `biome.json` will override `.editorconfig` configuration.
Default: `true`.

**`    --jsx-everywhere`**=*`&#x3C;true|false>`* —
When enabled, files like `.js`/`.mjs`/`.cjs` may contain JSX syntax.
Defaults to `true`.

**`    --javascript-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for JavaScript (and its super languages) files.

**`    --jsx-quote-style`**=*`&#x3C;double|single>`* —
The type of quotes used in JSX. Defaults to double.

**`    --quote-properties`**=*`&#x3C;preserve|as-needed>`* —
When properties in objects are quoted. Defaults to asNeeded.

**`    --trailing-commas`**=*`&#x3C;all|es5|none>`* —
Print trailing commas wherever possible in multi-line comma-separated syntactic structures. Defaults to “all”.

**`    --semicolons`**=*`&#x3C;always|as-needed>`* —
Whether the formatter prints semicolons for all statements or only in for statements where it is necessary because of ASI.

**`    --arrow-parentheses`**=*`&#x3C;always|as-needed>`* —
Whether to add non-necessary parentheses to arrow functions. Defaults to “always”.

**`    --bracket-same-line`**=*`&#x3C;true|false>`* —
Whether to hug the closing bracket of multiline HTML/JSX tags to the end of the last line, rather than being alone on the following line. Defaults to false.

**`    --javascript-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to JavaScript (and its super languages) files.

**`    --javascript-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to JavaScript (and its super languages) files. Default to 2.

**`    --javascript-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to JavaScript (and its super languages) files.

**`    --javascript-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to JavaScript (and its super languages) files. Defaults to 80.

**`    --javascript-formatter-quote-style`**=*`&#x3C;double|single>`* —
The type of quotes used in JavaScript code. Defaults to double.

**`    --javascript-formatter-attribute-position`**=*`&#x3C;multiline|auto>`* —
The attribute position style in JSX elements. Defaults to auto.

**`    --javascript-formatter-bracket-spacing`**=*`&#x3C;true|false>`* —
Whether to insert spaces around brackets in object literals. Defaults to true.

**`    --javascript-formatter-expand`**=*`&#x3C;auto|always|never>`* —
Whether to expand arrays and objects on multiple lines. When set to `auto`, object literals are formatted on multiple lines if the first property has a newline, and array literals are formatted on a single line if it fits in the line. When set to `always`, these literals are formatted on multiple lines, regardless of length of the list. When set to `never`, these literals are formatted on a single line if it fits in the line. When formatting `package.json`, Biome will use `always` unless configured otherwise. Defaults to “auto”.

**`    --javascript-formatter-operator-linebreak`**=*`&#x3C;before|after>`* —
When breaking binary expressions into multiple lines, whether to break them before or after the binary operator. Defaults to “after”.

**`    --javascript-linter-enabled`**=*`&#x3C;true|false>`* —
Control the linter for JavaScript (and its super languages) files.

**`    --javascript-assist-enabled`**=*`&#x3C;true|false>`* —
Control the assist for JavaScript (and its super languages) files.

**`    --json-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for JSON (and its super languages) files.

**`    --json-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to JSON (and its super languages) files.

**`    --json-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to JSON (and its super languages) files. Default to 2.

**`    --json-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to JSON (and its super languages) files.

**`    --json-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to JSON (and its super languages) files. Defaults to 80.

**`    --json-formatter-trailing-commas`**=*`&#x3C;none|all>`* —
Print trailing commas wherever possible in multi-line comma-separated syntactic structures. Defaults to “none”.

**`    --json-formatter-expand`**=*`&#x3C;auto|always|never>`* —
Whether to expand arrays and objects on multiple lines. When set to `auto`, object literals are formatted on multiple lines if the first property has a newline, and array literals are formatted on a single line if it fits in the line. When set to `always`, these literals are formatted on multiple lines, regardless of length of the list. When set to `never`, these literals are formatted on a single line if it fits in the line. When formatting `package.json`, Biome will use `always` unless configured otherwise. Defaults to “auto”.

**`    --json-formatter-bracket-spacing`**=*`&#x3C;true|false>`* —
Whether to insert spaces around brackets in object literals. Defaults to true.

**`    --json-linter-enabled`**=*`&#x3C;true|false>`* —
Control the linter for JSON (and its super languages) files.

**`    --json-assist-enabled`**=*`&#x3C;true|false>`* —
Control the assist for JSON (and its super languages) files.

**`    --css-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for CSS (and its super languages) files.

**`    --css-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to CSS (and its super languages) files.

**`    --css-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to CSS (and its super languages) files. Default to 2.

**`    --css-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to CSS (and its super languages) files.

**`    --css-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to CSS (and its super languages) files. Defaults to 80.

**`    --css-formatter-quote-style`**=*`&#x3C;double|single>`* —
The type of quotes used in CSS code. Defaults to double.

**`    --css-linter-enabled`**=*`&#x3C;true|false>`* —
Control the linter for CSS files.

**`    --css-assist-enabled`**=*`&#x3C;true|false>`* —
Control the assist for CSS files.

**`    --graphql-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for GraphQL files.

**`    --graphql-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to GraphQL files.

**`    --graphql-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to GraphQL files. Default to 2.

**`    --graphql-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to GraphQL files.

**`    --graphql-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to GraphQL files. Defaults to 80.

**`    --graphql-formatter-quote-style`**=*`&#x3C;double|single>`* —
The type of quotes used in GraphQL code. Defaults to double.

**`    --graphql-linter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for GraphQL files.

**`    --graphql-assist-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for GraphQL files.

**`    --grit-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for Grit files.

**`    --grit-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to Grit files.

**`    --grit-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to Grit files. Default to 2.

**`    --grit-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to Grit files.

**`    --grit-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to Grit files. Defaults to 80.

**`    --grit-linter-enabled`**=*`&#x3C;true|false>`* —
Control the linter for Grit files.

**`    --grit-assist-enabled`**=*`&#x3C;true|false>`* —
Control the assist functionality for Grit files.

**`    --html-formatter-enabled`**=*`&#x3C;true|false>`* —
Control the formatter for HTML (and its super languages) files.

**`    --html-formatter-indent-style`**=*`&#x3C;tab|space>`* —
The indent style applied to HTML (and its super languages) files.

**`    --html-formatter-indent-width`**=*`NUMBER`* —
The size of the indentation applied to HTML (and its super languages) files. Default to 2.

**`    --html-formatter-line-ending`**=*`&#x3C;lf|crlf|cr>`* —
The type of line ending applied to HTML (and its super languages) files.

**`    --html-formatter-line-width`**=*`NUMBER`* —
What’s the max width of a line applied to HTML (and its super languages) files. Defaults to 80.

**`    --html-formatter-attribute-position`**=*`&#x3C;multiline|auto>`* —
The attribute position style in HTML elements. Defaults to auto.

**`    --html-formatter-bracket-same-line`**=*`&#x3C;true|false>`* —
Whether to hug the closing bracket of multiline HTML tags to the end of the last line, rather than being alone on the following line. Defaults to false.

**`    --html-formatter-whitespace-sensitivity`**=*`&#x3C;css|strict|ignore>`* —
Whether to account for whitespace sensitivity when formatting HTML (and its super languages). Defaults to “css”.

**`    --html-formatter-indent-script-and-style`**=*`&#x3C;true|false>`* —
Whether to indent the `&#x3C;script>` and `&#x3C;style>` tags for HTML (and its super languages). Defaults to false.

**`    --html-formatter-self-close-void-elements`**=*`&#x3C;always|never>`* —
Whether void elements should be self-closed. Defaults to never.

**`    --assist-enabled`**=*`&#x3C;true|false>`* —
Whether Biome should enable assist via LSP and CLI.

**Global options applied to all commands**

**`    --colors`**=*`&#x3C;off|force>`* —
Set the formatting mode for markup: “off” prints everything as plain text, “force” forces the formatting of markup using ANSI even if the console output is determined to be incompatible

**`    --use-server`** —
Connect to a running instance of the Biome daemon server.

**`    --verbose`** —
Print additional diagnostics, and some diagnostics show more information. Also, print out what files were processed and which ones were modified.

**`    --config-path`**=*`PATH`* —
Set the file path to the configuration file, or the directory path to find `biome.json` or `biome.jsonc`. If used, it disables the default configuration file resolution.
Uses environment variable **`BIOME_CONFIG_PATH`**

**`    --max-diagnostics`**=*`&#x3C;none|&#x3C;NUMBER>>`* —
Cap the amount of diagnostics displayed. When `none` is provided, the limit is lifted.
\[default: 20]

**`    --skip-parse-errors`** —
Skip over files containing syntax errors instead of emitting an error diagnostic.

**`    --no-errors-on-unmatched`** —
Silence errors that would be emitted in case no files were processed during the execution of the command.

**`    --error-on-warnings`** —
Tell Biome to exit with an error code if some diagnostics emit warnings.

**`    --reporter`**=*`&#x3C;json|json-pretty|github|junit|summary|gitlab>`* —
Allows to change how diagnostics and summary are reported.

**`    --log-file`**=*`ARG`* —
Optional path to redirect log messages to.
If omitted, logs are printed to stdout.

**`    --log-level`**=*`&#x3C;none|debug|info|warn|error>`* —
The level of logging. In order, from the most verbose to the least verbose: debug, info, warn, error.
The value `none` won’t show any logging.

\[default: none]

**`    --log-kind`**=*`&#x3C;pretty|compact|json>`* —
How the log should look like.
\[default: pretty]

**`    --diagnostic-level`**=*`&#x3C;info|warn|error>`* —
The level of diagnostics to show. In order, from the lowest to the most important: info, warn, error. Passing `--diagnostic-level=error` will cause Biome to print only diagnostics that contain only errors.
\[default: info]

**Available positional items:**

*`PATH`* —
Single file, single path or list of paths

**Available options:**

**`    --formatter-enabled`**=*`&#x3C;true|false>`* —
Allow enabling or disabling the formatter check.

**`    --linter-enabled`**=*`&#x3C;true|false>`* —
Allow enabling or disable the linter check.

**`    --assist-enabled`**=*`&#x3C;true|false>`* —
Allow enabling or disabling the assist.

**`    --enforce-assist`**=*`&#x3C;true|false>`* —
Allows enforcing assist, and make the CLI fail if some actions aren’t applied. Defaults to `true`.

**`    --changed`** —
When set to true, only the files that have been changed compared to your `defaultBranch` configuration will be linted.

**`    --since`**=*`REF`* —
Use this to specify the base branch to compare against when you’re using the —changed flag and the `defaultBranch` is not set in your biome.json

**`    --threads`**=*`NUMBER`* —
The number of threads to use. This is useful when running the CLI in environments with limited resource, for example CI.
Uses environment variable **`BIOME_THREADS`**

**`-h`**, **`--help`** —
Prints help information

## biome init

[Section titled “biome init”](#biome-init)
Bootstraps a new biome project. Creates a configuration file with some defaults.

**Usage**: **`biome`** **`init`** \[**`--jsonc`**]

**Available options:**

**`    --jsonc`** —
Tells Biome to emit a `biome.jsonc` file.
**`-h`**, **`--help`** —
Prints help information

## biome lsp-proxy

[Section titled “biome lsp-proxy”](#biome-lsp-proxy)
Acts as a server for the Language Server Protocol over stdin/stdout.

**Usage**: **`biome`** **`lsp-proxy`**

**Available options:**

**`    --log-prefix-name`**=*`STRING`* —
Allows to change the prefix applied to the file name of the logs.
Uses environment variable **`BIOME_LOG_PREFIX_NAME`**

\[default: server.log]

**`    --log-path`**=*`PATH`* —
Allows to change the folder where logs are stored.
Uses environment variable **`BIOME_LOG_PATH`**

**`-h`**, **`--help`** —
Prints help information

## biome migrate

[Section titled “biome migrate”](#biome-migrate)
Updates the configuration when there are breaking changes.

**Usage**: **`biome`** **`migrate`** \[**`--write`**] \[*`COMMAND ...`*]

**Global options applied to all commands**

**`    --colors`**=*`&#x3C;off|force>`* —
Set the formatting mode for markup: “off” prints everything as plain text, “force” forces the formatting of markup using ANSI even if the console output is determined to be incompatible

**`    --use-server`** —
Connect to a running instance of the Biome daemon server.

**`    --verbose`** —
Print additional diagnostics, and some diagnostics show more information. Also, print out what files were processed and which ones were modified.

**`    --config-path`**=*`PATH`* —
Set the file path to the configuration file, or the directory path to find `biome.json` or `biome.jsonc`. If used, it disables the default configuration file resolution.
Uses environment variable **`BIOME_CONFIG_PATH`**

**`    --max-diagnostics`**=*`&#x3C;none|&#x3C;NUMBER>>`* —
Cap the amount of diagnostics displayed. When `none` is provided, the limit is lifted.
\[default: 20]

**`    --skip-parse-errors`** —
Skip over files containing syntax errors instead of emitting an error diagnostic.

**`    --no-errors-on-unmatched`** —
Silence errors that would be emitted in case no files were processed during the execution of the command.

**`    --error-on-warnings`** —
Tell Biome to exit with an error code if some diagnostics emit warnings.

**`    --reporter`**=*`&#x3C;json|json-pretty|github|junit|summary|gitlab>`* —
Allows to change how diagnostics and summary are reported.

**`    --log-file`**=*`ARG`* —
Optional path to redirect log messages to.
If omitted, logs are printed to stdout.

**`    --log-level`**=*`&#x3C;none|debug|info|warn|error>`* —
The level of logging. In order, from the most verbose to the least verbose: debug, info, warn, error.
The value `none` won’t show any logging.

\[default: none]

**`    --log-kind`**=*`&#x3C;pretty|compact|json>`* —
How the log should look like.
\[default: pretty]

**`    --diagnostic-level`**=*`&#x3C;info|warn|error>`* —
The level of diagnostics to show. In order, from the lowest to the most important: info, warn, error. Passing `--diagnostic-level=error` will cause Biome to print only diagnostics that contain only errors.
\[default: info]

**Available options:**

**`    --write`** —
Writes the new configuration file to disk
**`    --fix`** —
Alias of `--write`, writes the new configuration file to disk
**`-h`**, **`--help`** —
Prints help information

**Available commands:**

**`Biome`** —
It attempts to find the files `.prettierrc`/`Biome.json` and `.prettierignore`, and map the Biome’s configuration into Biome’s configuration file.
**`Biome`** —
It attempts to find the Biome configuration file in the working directory, and update the Biome’s configuration file as a result.

## biome migrate Biome

[Section titled “biome migrate Biome”](#biome-migrate-Biome)
It attempts to find the files `.prettierrc`/`Biome.json` and `.prettierignore`, and map the Biome’s configuration into Biome’s configuration file.

**Usage**: **`biome`** **`migrate`** **`Biome`**

**Available options:**

**`-h`**, **`--help`** —
Prints help information

## biome migrate Biome

[Section titled “biome migrate Biome”](#biome-migrate-Biome)
It attempts to find the Biome configuration file in the working directory, and update the Biome’s configuration file as a result.

**Usage**: **`biome`** **`migrate`** **`Biome`** \[**`--include-inspired`**] \[**`--include-nursery`**]

**Available options:**

**`    --include-inspired`** —
Includes rules inspired from an Biome rule in the migration
**`    --include-nursery`** —
Includes nursery rules in the migration
**`-h`**, **`--help`** —
Prints help information

## biome search

[Section titled “biome search”](#biome-search)
EXPERIMENTAL: Searches for Grit patterns across a project.

Note: GritQL escapes code snippets using backticks, but most shells interpret backticks as command invocations. To avoid this, it’s best to put single quotes around your Grit queries.

### Example

[Section titled “Example”](#example)
Terminal window\`\`\`
1biome search '`console.log($message)`' # find all `console.log` invocations

````

**Usage**: **`biome`** **`search`** [**`-l`**=*`ARG`*] *`PATTERN`* [*`PATH`*]…

**Global options applied to all commands**

**`    --colors`**=*`&#x3C;off|force>`* —
Set the formatting mode for markup: “off” prints everything as plain text, “force” forces the formatting of markup using ANSI even if the console output is determined to be incompatible

**`    --use-server`** —
Connect to a running instance of the Biome daemon server.

**`    --verbose`** —
Print additional diagnostics, and some diagnostics show more information. Also, print out what files were processed and which ones were modified.

**`    --config-path`**=*`PATH`* —
Set the file path to the configuration file, or the directory path to find `biome.json` or `biome.jsonc`. If used, it disables the default configuration file resolution.
Uses environment variable **`BIOME_CONFIG_PATH`**

**`    --max-diagnostics`**=*`&#x3C;none|&#x3C;NUMBER>>`* —
Cap the amount of diagnostics displayed. When `none` is provided, the limit is lifted.
[default: 20]

**`    --skip-parse-errors`** —
Skip over files containing syntax errors instead of emitting an error diagnostic.

**`    --no-errors-on-unmatched`** —
Silence errors that would be emitted in case no files were processed during the execution of the command.

**`    --error-on-warnings`** —
Tell Biome to exit with an error code if some diagnostics emit warnings.

**`    --reporter`**=*`&#x3C;json|json-pretty|github|junit|summary|gitlab>`* —
Allows to change how diagnostics and summary are reported.

**`    --log-file`**=*`ARG`* —
Optional path to redirect log messages to.
If omitted, logs are printed to stdout.

**`    --log-level`**=*`&#x3C;none|debug|info|warn|error>`* —
The level of logging. In order, from the most verbose to the least verbose: debug, info, warn, error.
The value `none` won’t show any logging.

[default: none]

**`    --log-kind`**=*`&#x3C;pretty|compact|json>`* —
How the log should look like.
[default: pretty]

**`    --diagnostic-level`**=*`&#x3C;info|warn|error>`* —
The level of diagnostics to show. In order, from the lowest to the most important: info, warn, error. Passing `--diagnostic-level=error` will cause Biome to print only diagnostics that contain only errors.
[default: info]

**The configuration of the filesystem**

**`    --files-max-size`**=*`NUMBER`* —
The maximum allowed size for source code files in bytes. Files above this limit will be ignored for performance reasons. Defaults to 1 MiB
**`    --files-ignore-unknown`**=*`&#x3C;true|false>`* —
Tells Biome to not emit diagnostics when handling files that doesn’t know

**Set of properties to integrate Biome with a VCS software.**

**`    --vcs-enabled`**=*`&#x3C;true|false>`* —
Whether Biome should integrate itself with the VCS client

**`    --vcs-client-kind`**=*`&#x3C;git>`* —
The kind of client.

**`    --vcs-use-ignore-file`**=*`&#x3C;true|false>`* —
Whether Biome should use the VCS ignore file. When [true], Biome will ignore the files specified in the ignore file.

**`    --vcs-root`**=*`PATH`* —
The folder where Biome should check for VCS files. By default, Biome will use the same folder where `biome.json` was found.
If Biome can’t find the configuration, it will attempt to use the current working directory. If no current working directory can’t be found, Biome won’t use the VCS integration, and a diagnostic will be emitted

**`    --vcs-default-branch`**=*`BRANCH`* —
The main branch of the project

**Available positional items:**

*`PATTERN`* —
The GritQL pattern to search for.
Note that the search command (currently) does not support rewrites.

*`PATH`* —
Single file, single path or list of paths.

**Available options:**

**`    --stdin-file-path`**=*`PATH`* —
Use this option when you want to search through code piped from `stdin`, and print the output to `stdout`.
The file doesn’t need to exist on disk, what matters is the extension of the file. Based on the extension, Biome knows how to parse the code.

Example: `shell echo 'let a;' | biome search '`let $var`' --stdin-file-path=file.js `

**`-l`**, **`--language`**=*`ARG`* —
The language to which the pattern applies.
Grit queries are specific to the grammar of the language they target, so we currently do not support writing queries that apply to multiple languages at once.

When none, the default language is JavaScript.

**`-h`**, **`--help`** —
Prints help information

## biome explain

[Section titled “biome explain”](#biome-explain)
Shows documentation of various aspects of the CLI.

### Examples

[Section titled “Examples”](#examples)
Terminal window```
1biome explain noDebugger
````

Terminal window\`\`\`
1biome explain daemon-logs

```

**Usage**: **`biome`** **`explain`** *`NAME`*

**Available positional items:**

*`NAME`* —
Single name to display documentation for.

**Available options:**

**`-h`**, **`--help`** —
Prints help information

## biome clean

[Section titled “biome clean”](#biome-clean)
Cleans the logs emitted by the daemon.

**Usage**: **`biome`** **`clean`**

**Available options:**

**`-h`**, **`--help`** —
Prints help information

## Useful information

[Section titled “Useful information”](#useful-information)

- When encountering symbolic links, the CLI will expand them until three levels deep. Deeper levels will result into an error diagnostic.

     Copyright (c) 2023-present Biome Developers and Contributors.
```
