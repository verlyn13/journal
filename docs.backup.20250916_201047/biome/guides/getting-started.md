# GETTING STARTED

*Source: <https://biomejs.dev/guides/getting-started>*
*Fetched: 2025-08-30T00:47:25.471Z*

***

# Getting Started

```
    Biome is best installed as a development dependency of your projects, but it is
```

also available as a [standalone executable](/guides/manual-installation) that doesn’t require Node.js.

- [  npm ](#tab-panel-152)
- [  pnpm ](#tab-panel-153)
- [  bun ](#tab-panel-154)
- [  deno ](#tab-panel-155)
- [  yarn ](#tab-panel-156)

  ```
  ```

1npm i -D -E @biomejs/biome

````

     ```
1pnpm add -D -E @biomejs/biome
````

````
 ```
````

1bun add -D -E @biomejs/biome

````

     ```
1deno add -D npm:@biomejs/biome
````

````
 ```
````

1yarn add -D -E @biomejs/biome

````


Version pinning

`-E` ensures that the package manager pins the version of Biome. See the
[versioning page](/internals/versioning)
for more information about [why pinning the version is important](/internals/versioning#why-pinning-the-version-is-important).
## Configuration

[Section titled “Configuration”](#configuration)
Although Biome can run with zero configuration, you’ll likely want to tweak some
settings to suit your project’s needs, in which case you can run the following
command to generate a `biome.json` configuration file.
   -  [  npm ](#tab-panel-157)
-  [  pnpm ](#tab-panel-158)
-  [  bun ](#tab-panel-159)
-  [  deno ](#tab-panel-160)
-  [  yarn ](#tab-panel-161)

     ```
1npx @biomejs/biome init
````

````
 ```
````

1pnpm exec biome init

````

     ```
1bunx --bun biome init
````

````
 ```
````

1deno run -A npm:@biomejs/biome init

````

     ```
1yarn exec biome init
````

## Usage

[Section titled “Usage”](#usage)
Lets get a quick overview of how to use Biome in your project.

### Command-line interface

[Section titled “Command-line interface”](#command-line-interface)
Biome provides a [command-line interface](/reference/cli) to format, lint, and check your code.

- [  npm ](#tab-panel-162)
- [  pnpm ](#tab-panel-163)
- [  bun ](#tab-panel-164)
- [  deno ](#tab-panel-165)
- [  yarn ](#tab-panel-166)

  ```
  ```

1# Format all files2npx @biomejs/biome format --write3
4# Format specific files5npx @biomejs/biome format --write \<files>6
7# Lint files and apply safe fixes to all files8npx @biomejs/biome lint --write9
10# Lint files and apply safe fixes to specific files11npx @biomejs/biome lint --write \<files>12
13# Format, lint, and organize imports of all files14npx @biomejs/biome check --write15
16# Format, lint, and organize imports of specific files17npx @biomejs/biome check --write \<files>

````

# Lint files and apply safe fixes to all filesnpx @biomejs/biome lint --write# Lint files and apply safe fixes to specific filesnpx @biomejs/biome lint --write # Format, lint, and organize imports of all filesnpx @biomejs/biome check --write# Format, lint, and organize imports of specific filesnpx @biomejs/biome check --write ">  ```
1# Format all files2pnpm exec biome format --write3
4# Format specific files5pnpm exec biome format --write &#x3C;files>6
7# Lint and apply safe fixes to all files8pnpm exec biome lint --write9
10# Lint files and apply safe fixes to specific files11pnpm exec biome lint --write &#x3C;files>12
13# Format, lint, and organize imports of all files14pnpm exec biome check --write15
16# Format, lint, and organize imports of specific files17pnpm exec biome check --write &#x3C;files>
````

# Lint and apply safe fixes to all filespnpm exec biome lint --write# Lint files and apply safe fixes to specific filespnpm exec biome lint --write # Format, lint, and organize imports of all filespnpm exec biome check --write# Format, lint, and organize imports of specific filespnpm exec biome check --write ">  \`\`\`
1# Format all files2bunx biome format --write3
4# Format specific files5bunx biome format --write \<files>6
7# Lint and apply safe fixes to all files8bunx biome lint --write9
10# Lint files and apply safe fixes to specific files11bunx biome lint --write \<files>12
13# Format, lint, and organize imports of all files14bunx biome check --write15
16# Format, lint, and organize imports of specific files17bunx biome check --write \<files>

````

# Lint and apply safe fixes to all filesbunx biome lint --write# Lint files and apply safe fixes to specific filesbunx biome lint --write # Format, lint, and organize imports of all filesbunx biome check --write# Format, lint, and organize imports of specific filesbunx biome check --write ">  ```
1# Format specific files2deno run -A npm:@biomejs/biome format --write &#x3C;files>3
4# Format all files5deno run -A npm:@biomejs/biome format --write6
7# Lint files and apply safe fixes to all files8deno run -A npm:@biomejs/biome lint --write9
10# Lint files and apply safe fixes to specific files11deno run -A npm:@biomejs/biome lint --write &#x3C;files>12
13# Format, lint, and organize imports of all files14deno run -A npm:@biomejs/biome check --write15
16# Format, lint, and organize imports of specific files17deno run -A npm:@biomejs/biome check --write &#x3C;files>
````

# Format all filesdeno run -A npm:@biomejs/biome format --write# Lint files and apply safe fixes to all filesdeno run -A npm:@biomejs/biome lint --write# Lint files and apply safe fixes to specific filesdeno run -A npm:@biomejs/biome lint --write # Format, lint, and organize imports of all filesdeno run -A npm:@biomejs/biome check --write# Format, lint, and organize imports of specific filesdeno run -A npm:@biomejs/biome check --write ">  \`\`\`
1# Format all files2yarn exec biome format --write3
4# Format specific files5yarn exec biome format --write \<files>6
7# Lint files and apply safe fixes to all files8yarn exec biome lint --write9
10# Lint files and apply safe fixes to specific files11yarn exec biome lint --write \<files>12
13# Format, lint, and organize imports of all files14yarn exec biome check --write15
16# Format, lint, and organize imports of specific files17yarn exec biome check --write \<files>

```

# Lint files and apply safe fixes to all filesyarn exec biome lint --write# Lint files and apply safe fixes to specific filesyarn exec biome lint --write # Format, lint, and organize imports of all filesyarn exec biome check --write# Format, lint, and organize imports of specific filesyarn exec biome check --write ">
### Editor integrations

[Section titled “Editor integrations”](#editor-integrations)
Biome is available as a first-party extension in your favorite editors.

- [VS Code](/guides/editors/first-party-extensions#vs-code)

- [IntelliJ](/guides/editors/first-party-extensions#intellij)

- [Zed](/guides/editors/first-party-extensions#zed)

There are also [community extensions](/guides/editors/third-party-extensions)
for other editors, such as **Vim**, **Neovim**, and **Sublime Text**, to name
a few.
### Continuous Integration

[Section titled “Continuous Integration”](#continuous-integration)
Run `biome ci` as part of your CI pipeline to enforce code quality and consistency
across your team. It works just like the `biome check` command, but is optimized for
CI environments.

- [GitHub Actions](/recipes/continuous-integration#github-actions)

- [GitLab CI](/recipes/continuous-integration#gitlab-ci)

See the [Continuous Integration](/recipes/continuous-integration) recipes for more examples.

## Next Steps

[Section titled “Next Steps”](#next-steps)
Success! You’re now ready to use Biome. 🥳

- [Migrate from ESLint and Prettier](/guides/migrate-eslint-prettier)

- Learn more about how to [configure Biome](/guides/configure-biome)

- Learn more about how to use and configure the [formatter](/formatter)

- Learn more about how to use and configure the [linter](/linter)

- Get familiar with the [CLI commands and options](/reference/cli)

- Get familiar with the [configuration options](/reference/configuration)

- Join our [community on Discord](https://biomejs.dev/chat)

     Copyright (c) 2023-present Biome Developers and Contributors.
```
