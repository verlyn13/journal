# INSTALLATION

*Source: https://bun.sh/docs/installation*
*Fetched: 2025-08-30T00:47:26.526Z*

---

Bun ships as a single executable with no dependencies that can be installed a few different ways.

## [Installing](#installing)

### [macOS and Linux](#macos-and-linux)

**Linux users** — The `unzip` package is required to install Bun. Use `sudo apt install unzip` to install `unzip` package. Kernel version 5.6 or higher is strongly recommended, but the minimum is 5.1. Use `uname -r` to check Kernel version.

macOS/Linux (curl)npmHomebrewDockermacOS/Linux (curl)```
curl -fsSL https://bun.com/install | bash # for macOS, Linux, and WSL
```

```
# to install a specific version
```

```
curl -fsSL https://bun.com/install | bash -s "bun-v1.2.21"
```

npm```
npm install -g bun # the last `npm` command you'll ever need
```

Homebrew```
brew install oven-sh/bun/bun # for macOS and Linux
```

Docker```
docker pull oven/bun
```

```
docker run --rm --init --ulimit memlock=-1:-1 oven/bun
```

### [Windows](#windows)

To install, paste this into a terminal:

PowerShell/cmd.exenpmScoopPowerShell/cmd.exe```
powershell -c "irm bun.sh/install.ps1|iex"
```

npm```
npm install -g bun # the last `npm` command you'll ever need
```

Scoop```
scoop install bun
```

Bun requires a minimum of Windows 10 version 1809

For support and discussion, please join the [#windows channel on our Discord](http://bun.com/discord).

## [Docker](#docker)

Bun provides a [Docker image](https://hub.docker.com/r/oven/bun/tags) that supports both Linux x64 and arm64.

```
docker pull oven/bun
```

```
docker run --rm --init --ulimit memlock=-1:-1 oven/bun
```

There are also image variants for different operating systems.

```
docker pull oven/bun:debian
```

```
docker pull oven/bun:slim
```

```
docker pull oven/bun:distroless
```

```
docker pull oven/bun:alpine
```

## [Checking installation](#checking-installation)

To check that Bun was installed successfully, open a new terminal window and run `bun --version`.

```
bun --version
```

```
1.x.y
```

To see the precise commit of [oven-sh/bun](https://github.com/oven-sh/bun) that you&#x27;re using, run `bun --revision`.

```
bun --revision
```

```
1.x.y+b7982ac13189
```

If you&#x27;ve installed Bun but are seeing a `command not found` error, you may have to manually add the installation directory (`~/.bun/bin`) to your `PATH`.

### [How to add your `PATH`](#how-to-add-your-path)

Linux / Mac

First, determine what shell you&#x27;re using:

```
echo $SHELL
```

```
/bin/zsh # or /bin/bash or /bin/fish
```

Then add these lines below to bottom of your shell&#x27;s configuration file.

~/.zshrc~/.bashrc~/.config/fish/config.fish~/.zshrc```
# add to ~/.zshrc
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

```

~/.bashrc```
# add to ~/.bashrc
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

```

~/.config/fish/config.fish```
# add to ~/.config/fish/config.fish
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

```

Save the file. You&#x27;ll need to open a new shell/terminal window for the changes to take effect.

Windows

First, determine if the bun binary is properly installed on your system:

```
& "$env:USERPROFILE\.bun\bin\bun" --version

```

If the command runs successfully but `bun --version` is not recognized, it means that bun is not in your system&#x27;s `PATH`. To fix this, open a Powershell terminal and run the following command:

```
[System.Environment]::SetEnvironmentVariable(
    "Path",
    [System.Environment]::GetEnvironmentVariable("Path", "User") + ";$env:USERPROFILE\.bun\bin",
    [System.EnvironmentVariableTarget]::User
)

```

After running the command, restart your terminal and test with `bun --version`

## [Upgrading](#upgrading)

Once installed, the binary can upgrade itself.

```
bun upgrade
```

**Homebrew users** — To avoid conflicts with Homebrew, use `brew upgrade bun` instead.

**Scoop users** — To avoid conflicts with Scoop, use `scoop update bun` instead.

## [Canary builds](#canary-builds)

Bun automatically releases an (untested) canary build on every commit to `main`. To upgrade to the latest canary build:

```
bun upgrade --canary
```

The canary build is useful for testing new features and bug fixes before they&#x27;re released in a stable build. To help the Bun team fix bugs faster, canary builds automatically upload crash reports to Bun&#x27;s team.

[View canary build](https://github.com/oven-sh/bun/releases/tag/canary)

**Note** — To switch back to a stable release from canary, run `bun upgrade --stable`.

## [Installing older versions of Bun](#installing-older-versions-of-bun)

Since Bun is a single binary, you can install older versions of Bun by re-running the installer script with a specific version.

### [Installing a specific version of Bun on Linux/Mac](#installing-a-specific-version-of-bun-on-linux-mac)

To install a specific version of Bun, you can pass the git tag of the version you want to install to the install script, such as `bun-v1.2.0` or `bun-v1.2.21`.

```
curl -fsSL https://bun.com/install | bash -s "bun-v1.2.21"
```

### [Installing a specific version of Bun on Windows](#installing-a-specific-version-of-bun-on-windows)

On Windows, you can install a specific version of Bun by passing the version number to the Powershell install script.

```
# PowerShell:
```

```
iex "& {$(irm https://bun.com/install.ps1)} -Version 1.2.21"
```

## [Downloading Bun binaries directly](#downloading-bun-binaries-directly)

To download Bun binaries directly, you can visit the [releases page](https://github.com/oven-sh/bun/releases) on GitHub.

For convenience, here are download links for the latest version:

- [`bun-linux-x64.zip`](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64.zip)
- [`bun-linux-x64-baseline.zip`](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-baseline.zip)
- [`bun-linux-x64-musl.zip`](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-musl.zip)
- [`bun-linux-x64-musl-baseline.zip`](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-musl-baseline.zip)
- [`bun-windows-x64.zip`](https://github.com/oven-sh/bun/releases/latest/download/bun-windows-x64.zip)
- [`bun-windows-x64-baseline.zip`](https://github.com/oven-sh/bun/releases/latest/download/bun-windows-x64-baseline.zip)
- [`bun-darwin-aarch64.zip`](https://github.com/oven-sh/bun/releases/latest/download/bun-darwin-aarch64.zip)
- [`bun-linux-aarch64.zip`](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-aarch64.zip)
- [`bun-linux-aarch64-musl.zip`](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-aarch64-musl.zip)
- [`bun-darwin-x64.zip`](https://github.com/oven-sh/bun/releases/latest/download/bun-darwin-x64.zip)

The `musl` binaries are built for distributions that do not ship with the glibc libraries by default, instead relying on musl. The two most popular distros are Void Linux and Alpine Linux, with the latter is used heavily in Docker containers. If you encounter an error like the following: `bun: /lib/x86_64-linux-gnu/libm.so.6: version GLIBC_2.29&#x27; not found (required by bun)`, try using the musl binary. Bun&#x27;s install script automatically chooses the correct binary for your system.

### [CPU requirements and `baseline` builds](#cpu-requirements-and-baseline-builds)

Bun&#x27;s `x64` binaries target the Haswell CPU architecture, which means they require AVX and AVX2 instructions. For Linux and Windows, the `x64-baseline` binaries are also available which target the Nehalem architecture. If you run into an "Illegal Instruction" error when running Bun, try using the `baseline` binaries instead. Bun&#x27;s install script automatically chooses the correct binary for your system which helps avoid this issue. Baseline builds are slower than regular builds, so use them only if necessary.

BuildIntel requirementAMD requirementx64Haswell (4th generation Core) or newer, except some low-end modelsExcavator or newerx64-baselineNehalem (1st generation Core) or newerBulldozer or newerBun does not currently support any CPUs older than the `baseline` target, which mandates the SSE4.2 extension.

Bun also publishes `darwin-x64-baseline` binaries, but these are just a copy of the `darwin-x64` ones so they still have the same CPU requirement. We only maintain these since some tools expect them to exist. Bun requires macOS 13.0 or later, which does not support any CPUs that don&#x27;t meet our requirement.

## [Uninstall](#uninstall)

If you need to remove Bun from your system, use the following commands.

macOS/Linux (curl)WindowsScoopnpmHomebrewmacOS/Linux (curl)```
rm -rf ~/.bun # for macOS, Linux, and WSL
```

Windows```
powershell -c ~\.bun\uninstall.ps1
```

Scoop```
scoop uninstall bun
```

npm```
npm uninstall -g bun
```

Homebrew```
brew uninstall bun
```