---
title: "act Reference Guide: Run GitHub Actions Locally"
description: "A guide to using 'act', a tool for running GitHub Actions workflows locally for faster feedback and testing."
category: "Tooling"
related_topics:
      - "GitHub Actions"
      - "CI/CD"
      - "Docker"
      - "Local Development"
version: "1.0"
---

# Act Reference Guide: Run GitHub Actions Locally

> "Think globally, `act` locally"

`act` is a command-line tool that allows you to run your GitHub Actions workflows locally. This provides faster feedback during development compared to committing/pushing changes to GitHub and enables using your workflows as a local task runner.

## Prerequisites

-   **Docker:** `act` uses Docker (or a compatible container engine like Podman) to run workflow jobs in containers. Ensure Docker is installed and running.
-   **Repository:** You need a local copy of a repository containing GitHub Actions workflows (`.github/workflows/`).

## How `act` Works

When executed, `act`:

1.  **Reads Workflows:** Parses the workflow files located in `.github/workflows/`.
2.  **Determines Actions:** Identifies the sequence of actions to be executed based on job dependencies.
3.  **Prepares Images:** Uses the Docker API to pull or build the required container images specified in the workflows (or uses default images).
4.  **Runs Containers:** Executes each action within a Docker container, configuring the environment variables and filesystem to mimic the GitHub Actions environment.

## Core Concepts and Usage

This section covers the fundamental concepts and command-line flags for using `act`.

### Running Workflows by Event

GitHub Actions are triggered by events. `act` simulates these events locally.

-   **Default Event (`push`):** Running `act` without specifying an event defaults to simulating a `push` event.
    ```sh
    act
    ```
-   **Specific Events:** You can trigger workflows based on other events like `pull_request` or `schedule`.
    ```sh
    # Simulate a pull request event
    act pull_request

    # Simulate a schedule event
    act schedule
    ```
-   **Listing Workflows for an Event:** Use the `-l` or `--list` flag to see which workflows would run for a specific event without executing them.
    ```sh
    act -l pull_request
    ```
-   **Providing Event Payloads (`-e`, `--eventpath`):** Some workflows depend on data from the event payload (e.g., the branch name in a `pull_request`). You can provide this data using a JSON file specified with the `-e` flag.

    *Example `pull_request_event.json`:*
    ```json
    {
      "pull_request": {
        "head": { "ref": "feature-branch" },
        "base": { "ref": "main" }
      }
    }
    ```
    *Command:*
    ```sh
    act pull_request -e pull_request_event.json
    ```

    *Example `push_tag_event.json`:*
    ```json
    {
      "ref": "refs/tags/v1.0.0"
    }
    ```
    *Command:*
    ```sh
    act push -e push_tag_event.json
    ```

### Selecting Workflows and Jobs

By default, `act` runs all workflows triggered by the specified event. You can narrow the scope:

-   **Specify Workflow File (`-W`, `--workflows`):** Run only the workflows defined in a specific file.
    ```sh
    # Run only the checks.yml workflow for the default 'push' event
    act -W .github/workflows/checks.yml
    ```
-   **Specify Job (`-j`, `--job`):** Run only a specific job (by its ID) within the triggered workflows.
    ```sh
    # Run only the job with ID 'test' in any workflow triggered by 'push'
    act -j test
    ```

### Managing Secrets and Variables

Workflows often require secrets (like API keys) and variables.

-   **Secrets (`-s`, `--secret`):** Provide secrets needed by the workflow.
    ```sh
    # Provide MY_SECRET directly (potentially insecure, check shell history)
    act -s MY_SECRET=some_value

    # Prompt securely for MY_SECRET if env var MY_SECRET isn't set
    act -s MY_SECRET

    # Load secrets from a file (format like .env)
    act --secret-file my.secrets
    ```
-   **Variables (`--var`):** Provide repository/organization variables accessible via `${{ vars.MY_VAR }}`.
    ```sh
    # Provide MY_VAR directly
    act --var MY_VAR=some_value

    # Load variables from a file (format like .env)
    act --var-file my.variables
    ```
-   **`GITHUB_TOKEN`:** Workflows often need the standard `GITHUB_TOKEN`. You must provide a [Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with appropriate permissions.
    ```sh
    # Prompt securely for the token
    act -s GITHUB_TOKEN

    # Use GitHub CLI (if installed and authenticated)
    act -s GITHUB_TOKEN="$(gh auth token)"
    ```
    > **Warning:** Passing tokens directly on the command line can expose them in shell history. Use secure prompts or environment variables where possible.

-   **`.env` / `.secrets` File Format:** These files use the `godotenv` format.
    ```dotenv
    # Example my.secrets file
    MY_API_KEY="your_api_key_here"
    export ANOTHER_SECRET='secret_value' # 'export' is optional
    MULTI_LINE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
    ```

### Configuring Runners (`-P`)

`act` uses Docker images to simulate GitHub Actions runners (like `ubuntu-latest`).

-   **Default Images:** `act` uses lightweight default images (e.g., `node:16-buster-slim` for micro, `catthehacker/ubuntu:act-latest` for medium `ubuntu-latest`). These may lack tools present in GitHub's hosted runners. See the table in the original document or `act --help` for defaults.
-   **Specifying Runner Images (`-P`):** Use the `-P` flag to map a platform specified in your workflow (e.g., `ubuntu-latest`) to a specific Docker image.
    ```sh
    # Use a larger image for ubuntu-latest
    act -P ubuntu-latest=catthehacker/ubuntu:full-latest

    # Use a specific versioned image
    act -P ubuntu-20.04=catthehacker/ubuntu:full-20.04

    # Use the comprehensive but large nektos image for ubuntu-18.04
    act -P ubuntu-18.04=nektos/act-environments-ubuntu:18.04

    # Specify multiple platforms if needed
    act -P ubuntu-latest=catthehacker/ubuntu:full-latest -P ubuntu-20.04=catthehacker/ubuntu:act-20.04
    ```
-   **Using Host Runner (`-self-hosted`):** For macOS and Windows workflows run on a matching host OS, you can bypass Docker.
    ```sh
    # Run macos-latest jobs directly on your Mac host
    act -P macos-latest=-self-hosted
    ```

### Controlling Image Pulling (`--pull`)

-   By default (`--pull=true`), `act` attempts to pull the latest runner image on each run.
-   To use locally cached images and prevent pulling:
    ```sh
    act --pull=false
    ```

### Skipping Steps and Jobs

-   **Skipping Steps (`env.ACT`):** `act` injects the `ACT=true` environment variable. Use this in step `if` conditions.
    ```yaml
    steps:
            - name: Deploy to Production
        if: ${{ !env.ACT }} # Skip this step when running locally with act
        run: ./deploy.sh
    ```
-   **Skipping Jobs (`github.event.act`):** You cannot use `env.ACT` at the job level. Instead, pass a custom property in your event JSON and check it in the job's `if` condition.

    *Example `skip_job_event.json`:*
    ```json
    { "act": true }
    ```
    *Workflow Snippet:*
    ```yaml
    jobs:
      production-deploy:
        if: ${{ !github.event.act }} # Skip job if 'act' property is true in event payload
        runs-on: ubuntu-latest
        steps:
          - run: echo "Deploying..."
    ```
    *Command:*
    ```sh
    act push -e skip_job_event.json
    ```

### Working with Matrices (`--matrix`)

Select specific matrix combinations to run.

-   **Example Matrix:**
    ```yaml
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        node: [16, 18, 20]
    ```
-   **Run only Node 18 jobs:**
    ```sh
    act --matrix node:18
    # Runs: {os: ubuntu-latest, node: 18}, {os: macos-latest, node: 18}
    ```
-   **Run only Node 20 on macOS:**
    ```sh
    act --matrix node:20 --matrix os:macos-latest
    # Runs: {os: macos-latest, node: 20}
    ```
    > Note: `--matrix` only selects *existing* combinations; it cannot add new ones. Workflow `exclude` rules still apply.

### Offline Mode (`--action-offline-mode`)

Use cached actions and images, preventing pulls for existing resources. Useful for unstable connections or speeding up runs.

```sh
gh act --action-offline-mode
```

### Artifacts (`--artifact-server-path`)

`act` does not start the artifact server by default. To enable artifact upload/download between jobs in a *single workflow run*:

```sh
# Store artifacts in a local .artifacts directory
gh act --artifact-server-path $PWD/.artifacts
```
> Note: Downloading artifacts from *different* runs/workflows is not supported locally.

### Configuration File (`.actrc`)

Place common flags in an `.actrc` file (one flag per line) in your project root, home directory, or XDG config directory. `act` reads these in order and appends CLI flags.

*Example `.actrc`:*
```
--secret-file .secrets
--var-file .vars
--pull=false
--container-architecture=linux/amd64 # Example: Force architecture
```

### Custom Container Engine (`DOCKER_HOST`)

Use Podman or a remote Docker engine by setting the `DOCKER_HOST` environment variable.

-   **Podman:**
    ```sh
    # Check your Podman socket path
    export DOCKER_HOST='unix:///run/user/1000/podman/podman.sock' # Example path
    act
    ```
-   **Remote Docker via SSH:**
    ```sh
    export DOCKER_HOST='ssh://user@your-docker-host'
    act
    ```

## Troubleshooting

-   **Missing Tools:** Default runner images are minimal. If tools are missing, use a larger image (`catthehacker/ubuntu:full-*` or `nektos/act-environments-*`) via the `-P` flag or install tools within your workflow steps.
-   **`systemd` Issues:** `systemd` often doesn't work correctly inside Docker containers used by `act`.
-   **Permissions:** Ensure Docker/Podman has the necessary permissions to mount volumes and run containers.
-   **`GITHUB_TOKEN` Errors:** Provide a valid PAT using `-s GITHUB_TOKEN=...` or the secure prompt `-s GITHUB_TOKEN`.
