# PACKAGE MANAGER

*Source: https://bun.sh/docs/cli/install*
*Fetched: 2025-08-30T00:47:26.655Z*

---

The `bun` CLI contains a Node.js-compatible package manager designed to be a dramatically faster replacement for `npm`, `yarn`, and `pnpm`. It&#x27;s a standalone tool that will work in pre-existing Node.js projects; if your project has a `package.json`, `bun install` can help you speed up your workflow.

**⚡️ 25x faster** — Switch from `npm install` to `bun install` in any Node.js project to make your installations up to 25x faster.

[](https://user-images.githubusercontent.com/709451/147004342-571b6123-17a9-49a2-8bfd-dcfc5204047e.png)For Linux users

The recommended minimum Linux Kernel version is 5.6. If you&#x27;re on Linux kernel 5.1 - 5.5, `bun install` will work, but HTTP requests will be slow due to a lack of support for io_uring&#x27;s `connect()` operation.

If you&#x27;re using Ubuntu 20.04, here&#x27;s how to install a [newer kernel](https://wiki.ubuntu.com/Kernel/LTSEnablementStack):

```
# If this returns a version >= 5.6, you don't need to do anything
```

```
uname -r
```

```

# Install the official Ubuntu hardware enablement kernel
```

```
sudo apt install --install-recommends linux-generic-hwe-20.04
```

To install all dependencies of a project:

```
bun install
```

Running `bun install` will:

- **Install** all `dependencies`, `devDependencies`, and `optionalDependencies`. Bun will install `peerDependencies` by default.
- **Run** your project&#x27;s `{pre|post}install` and `{pre|post}prepare` scripts at the appropriate time. For security reasons Bun *does not execute* lifecycle scripts of installed dependencies.
- **Write** a `bun.lock` lockfile to the project root.

## [Logging](#logging)

To modify logging verbosity:

```
bun install --verbose # debug logging
```

```
bun install --silent  # no logging
```

## [Lifecycle scripts](#lifecycle-scripts)

Unlike other npm clients, Bun does not execute arbitrary lifecycle scripts like `postinstall` for installed dependencies. Executing arbitrary scripts represents a potential security risk.

To tell Bun to allow lifecycle scripts for a particular package, add the package to `trustedDependencies` in your package.json.

```
{
  "name": "my-app",
  "version": "1.0.0",
  "trustedDependencies": ["my-trusted-package"]
}
```

Then re-install the package. Bun will read this field and run lifecycle scripts for `my-trusted-package`.

Lifecycle scripts will run in parallel during installation. To adjust the maximum number of concurrent scripts, use the `--concurrent-scripts` flag. The default is two times the reported cpu count or GOMAXPROCS.

```
bun install --concurrent-scripts 5
```

## [Workspaces](#workspaces)

Bun supports `"workspaces"` in package.json. For complete documentation refer to [Package manager > Workspaces](https://bun.com/docs/install/workspaces).

package.json```
{
  "name": "my-app",
  "version": "1.0.0",
  "workspaces": ["packages/*"],
  "dependencies": {
    "preact": "^10.5.13"
  }
}

```

## [Installing dependencies for specific packages](#installing-dependencies-for-specific-packages)

In a monorepo, you can install the dependencies for a subset of packages using the `--filter` flag.

```
# Install dependencies for all workspaces except `pkg-c`
```

```
bun install --filter '!pkg-c'
```

```

# Install dependencies for only `pkg-a` in `./packages/pkg-a`
```

```
bun install --filter './packages/pkg-a'
```

For more information on filtering with `bun install`, refer to [Package Manager > Filtering](https://bun.com/docs/cli/filter#bun-install-and-bun-outdated)

## [Overrides and resolutions](#overrides-and-resolutions)

Bun supports npm&#x27;s `"overrides"` and Yarn&#x27;s `"resolutions"` in `package.json`. These are mechanisms for specifying a version range for *metadependencies*—the dependencies of your dependencies. Refer to [Package manager > Overrides and resolutions](https://bun.com/docs/install/overrides) for complete documentation.

package.json```
{
  "name": "my-app",
  "dependencies": {
    "foo": "^2.0.0"
  },
  "overrides": {
    "bar": "~4.4.0"
  }
}
```

## [Global packages](#global-packages)

To install a package globally, use the `-g`/`--global` flag. Typically this is used for installing command-line tools.

```
bun install --global cowsay # or `bun install -g cowsay`
```

```
cowsay "Bun!"
```

```
 ______

 ------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

## [Production mode](#production-mode)

To install in production mode (i.e. without `devDependencies` or `optionalDependencies`):

```
bun install --production
```

For reproducible installs, use `--frozen-lockfile`. This will install the exact versions of each package specified in the lockfile. If your `package.json` disagrees with `bun.lock`, Bun will exit with an error. The lockfile will not be updated.

```
bun install --frozen-lockfile
```

For more information on Bun&#x27;s lockfile `bun.lock`, refer to [Package manager > Lockfile](https://bun.com/docs/install/lockfile).

## [Omitting dependencies](#omitting-dependencies)

To omit dev, peer, or optional dependencies use the `--omit` flag.

```
# Exclude "devDependencies" from the installation. This will apply to the
# root package and workspaces if they exist. Transitive dependencies will
# not have "devDependencies".
```

```
bun install --omit dev
```

```

# Install only dependencies from "dependencies"
```

```
bun install --omit=dev --omit=peer --omit=optional
```

## [Dry run](#dry-run)

To perform a dry run (i.e. don&#x27;t actually install anything):

```
bun install --dry-run
```

## [Non-npm dependencies](#non-npm-dependencies)

Bun supports installing dependencies from Git, GitHub, and local or remotely-hosted tarballs. For complete documentation refer to [Package manager > Git, GitHub, and tarball dependencies](https://bun.com/docs/cli/add).

package.json```
{
  "dependencies": {
    "dayjs": "git+https://github.com/iamkun/dayjs.git",
    "lodash": "git+ssh://github.com/lodash/lodash.git#4.17.21",
    "moment": "git@github.com:moment/moment.git",
    "zod": "github:colinhacks/zod",
    "react": "https://registry.npmjs.org/react/-/react-18.2.0.tgz",
    "bun-types": "npm:@types/bun"
  }
}

```

## [Installation strategies](#installation-strategies)

Bun supports two package installation strategies that determine how dependencies are organized in `node_modules`:

### [Hoisted installs (default for single projects)](#hoisted-installs-default-for-single-projects)

The traditional npm/Yarn approach that flattens dependencies into a shared `node_modules` directory:

```
bun install --linker hoisted
```

### [Isolated installs](#isolated-installs)

A pnpm-like approach that creates strict dependency isolation to prevent phantom dependencies:

```
bun install --linker isolated
```

Isolated installs create a central package store in `node_modules/.bun/` with symlinks in the top-level `node_modules`. This ensures packages can only access their declared dependencies.

For complete documentation on isolated installs, refer to [Package manager > Isolated installs](https://bun.com/docs/install/isolated).

## [Configuration](#configuration)

The default behavior of `bun install` can be configured in `bunfig.toml`. The default values are shown below.

```
[install]

# whether to install optionalDependencies
optional = true

# whether to install devDependencies
dev = true

# whether to install peerDependencies
peer = true

# equivalent to `--production` flag
production = false

# equivalent to `--save-text-lockfile` flag
saveTextLockfile = false

# equivalent to `--frozen-lockfile` flag
frozenLockfile = false

# equivalent to `--dry-run` flag
dryRun = false

# equivalent to `--concurrent-scripts` flag
concurrentScripts = 16 # (cpu count or GOMAXPROCS) x2

# installation strategy: "hoisted" or "isolated"
# default: "hoisted"
linker = "hoisted"

```

## [CI/CD](#ci-cd)

Use the official [`oven-sh/setup-bun`](https://github.com/oven-sh/setup-bun) action to install `bun` in a GitHub Actions pipeline:

.github/workflows/release.yml```
name: bun-types
jobs:
  build:
    name: build-app
    runs-on: ubuntu-latest
    steps:
            - name: Checkout repo
        uses: actions/checkout@v4
            - name: Install bun
        uses: oven-sh/setup-bun@v2
            - name: Install dependencies
        run: bun install
            - name: Build app
        run: bun run build

```

For CI/CD environments that want to enforce reproducible builds, use `bun ci` to fail the build if the package.json is out of sync with the lockfile:

```
bun ci
```

This is equivalent to `bun install --frozen-lockfile`. It installs exact versions from `bun.lock` and fails if `package.json` doesn&#x27;t match the lockfile. To use `bun ci` or `bun install --frozen-lockfile`, you must commit `bun.lock` to version control.

And instead of running `bun install`, run `bun ci`.

.github/workflows/release.yml```
name: bun-types
jobs:
  build:
    name: build-app
    runs-on: ubuntu-latest
    steps:
            - name: Checkout repo
        uses: actions/checkout@v4
            - name: Install bun
        uses: oven-sh/setup-bun@v2
            - name: Install dependencies
        run: bun ci
            - name: Build app
        run: bun run build

```

## CLI Usage

$bun install <name>@<version>### Flags

#### General Configuration

-c,--config=<val>Specify path to config file (bunfig.toml)--cwd=<val>Set a specific cwd#### Dependency Scope & Management

-p,--productionDon&#x27;t install devDependencies--no-saveDon&#x27;t update package.json or save a lockfile--saveSave to package.json (true by default)--omit=<val>Exclude &#x27;dev&#x27;, &#x27;optional&#x27;, or &#x27;peer&#x27; dependencies from install--only-missingOnly add dependencies to package.json if they are not already present#### Dependency Type & Versioning

-d,--devAdd dependency to "devDependencies"--optionalAdd dependency to "optionalDependencies"--peerAdd dependency to "peerDependencies"-E,--exactAdd the exact version instead of the ^range#### Lockfile Control

-y,--yarnWrite a yarn.lock file (yarn v1)--frozen-lockfileDisallow changes to lockfile--save-text-lockfileSave a text-based lockfile--lockfile-onlyGenerate a lockfile without installing dependencies#### Network & Registry Settings

--ca=<val>Provide a Certificate Authority signing certificate--cafile=<val>The same as `--ca`, but is a file path to the certificate--registry=<val>Use a specific registry by default, overriding .npmrc, bunfig.toml and environment variables#### Installation Process Control

--dry-runDon&#x27;t install anything-f,--forceAlways request the latest versions from the registry & reinstall all dependencies-g,--globalInstall globally--backend=<val>Platform-specific optimizations for installing dependencies. Possible values: "clonefile" (default), "hardlink", "symlink", "copyfile"--filter=<val>Install packages for the matching workspaces-a,--analyzeAnalyze & install all dependencies of files passed as arguments recursively (using Bun&#x27;s bundler)#### Caching Options

--cache-dir=<val>Store & load cached data from a specific directory path--no-cacheIgnore manifest cache entirely#### Output & Logging

--silentDon&#x27;t log anything--verboseExcessively verbose logging--no-progressDisable the progress bar--no-summaryDon&#x27;t print a summary#### Security & Integrity

--no-verifySkip verifying integrity of newly downloaded packages--trustAdd to trustedDependencies in the project&#x27;s package.json and install the package(s)#### Concurrency & Performance

--concurrent-scripts=<val>Maximum number of concurrent jobs for lifecycle scripts (default 5)--network-concurrency=<val>Maximum number of concurrent network requests (default 48)#### Lifecycle Script Management

--ignore-scriptsSkip lifecycle scripts in the project&#x27;s package.json (dependency scripts are never run)#### Help Information

-h,--helpPrint this help menu### Examples

Install the dependencies for the current projectbun installSkip devDependenciesbun install --productionFull documentation is available at https://bun.sh/docs/cli/install.