# FORMATTER

*Source: <https://biomejs.dev/formatter>*
*Fetched: 2025-08-30T00:47:26.030Z*

***

# Formatter

```
    Biome is an opinionated formatter that [supports multiple languages](/internals/language-support).
```

It follows a similar [philosophy to Prettier](https://prettier.io/docs/en/option-philosophy.html),
only supporting a few options to avoid debates over styles, turning into debates over Biome options.
It deliberately [resists the urge to add new options](https://github.com/prettier/prettier/issues/40) to prevent [bike-shed discussions](https://en.wikipedia.org/wiki/Law_of_triviality) in teams so they can focus on what really matters instead.

## CLI

[Section titled “CLI”](#cli)
The following command checks the formatting of the files in the `src` directory.
It emits text differences if it finds code that is not formatted.

- [  npm ](#tab-panel-142)
- [  pnpm ](#tab-panel-143)
- [  bun ](#tab-panel-144)
- [  deno ](#tab-panel-145)
- [  yarn ](#tab-panel-146)

  ```
  ```

1npx @biomejs/biome format ./src

````

     ```
1pnpm exec biome format ./src
````

````
 ```
````

1bunx --bun biome format ./src

````

     ```
1deno run -A npm:@biomejs/biome format ./src
````

````
 ```
````

1yarn exec biome format ./src

````


If you want to **apply** the new formatting, pass the `--write` option:

   -  [  npm ](#tab-panel-147)
-  [  pnpm ](#tab-panel-148)
-  [  bun ](#tab-panel-149)
-  [  deno ](#tab-panel-150)
-  [  yarn ](#tab-panel-151)

     ```
1npx @biomejs/biome format --write ./src
````

````
 ```
````

1pnpm exec biome format --write ./src

````

     ```
1bunx --bun biome format --write ./src
````

````
 ```
````

1deno run -A npm:@biomejs/biome format --write ./src

````

     ```
1yarn exec biome format --write ./src
````

The command accepts a list of files and directories.

Caution

If you pass a glob as a parameter, your shell will expand it.
The result of the expansion depends on your shell.
For example, some shells don’t support the recursive glob `**` or the alternation `{}` in the following command:Terminal window\`\`\`
1biome format ./src/\*\*/\*.test.{js,ts}

````

Shell expansion has a performance cost and a limit on the number of files you can pass to the command.

For more information about all the available options, check the [CLI reference](/reference/cli#biome-format).

## Options

[Section titled “Options”](#options)
Biome provides some options to tune the behavior of its formatter.
Differently from other tools, Biome separates language-agnostic options from language-specific options.
The formatter options can be set on the [CLI](/reference/cli/#biome-format) or via a [Biome configuration file](/guides/configure-biome).
As of v1.9, Biome supports loading `.editorconfig` files.
It’s recommended to use a [Biome configuration file](/guides/configure-biome) to ensure that both the Biome CLI and the Biome LSP apply the same options.
The following defaults are applied:
biome.json```
1{2  "formatter": {3    "enabled": true,4    "formatWithErrors": false,5    "ignore": [],6    "attributePosition": "auto",7    "indentStyle": "tab",8    "indentWidth": 2,9    "lineWidth": 80,10    "lineEnding": "lf"11  },12  "javascript": {13    "formatter": {14      "arrowParentheses":"always",15      "bracketSameLine": false,16      "bracketSpacing": true,17      "jsxQuoteStyle": "double",18      "quoteProperties": "asNeeded",19      "semicolons": "always",20      "trailingCommas": "all"21    }22  },23  "json": {24    "formatter": {25      "trailingCommas": "none"26    }27  }28}
````

The main language-agnostic options supported by the Biome formatter are:

- indent style (default: `tab`): Use spaces or tabs for indentation;

- indent width (default: `2`): The number of spaces per indentation level.

- line width (default: `80`): The column width at which Biome wraps code;

See the [configuration reference](/reference/configuration#formatter) for more details.

## Ignore Code

[Section titled “Ignore Code”](#ignore-code)
There are times when the formatted code isn’t ideal.

For these cases, you can use a format suppression comment:

example.js\`\`\`
1// biome-ignore format: \<explanation>

````

">
Example:

example.js```
1const expr =2  // biome-ignore format: the array should not be formatted3  [4    (2 * n) / (r - l),5    0,6    (r + l) / (r - l),7    0,8    0,9    (2 * n) / (t - b),10    (t + b) / (t - b),11    0,12    0,13    0,14    -(f + n) / (f - n),15    -(2 * f * n) / (f - n),16    0,17    0,18    -1,19    0,20  ];
````

Biome doesn’t provide ignore comments that ignore an entire file.
However, you can [ignore a file using the Biome configuration file](/guides/configure-biome/#ignore-files).     Copyright (c) 2023-present Biome Developers and Contributors.
