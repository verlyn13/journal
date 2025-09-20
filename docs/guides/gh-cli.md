---
id: gh-cli
title: GitHub CLI Developer Guide
type: api
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- api
priority: high
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-09'
---

***

title: "GitHub CLI Developer Guide"
description: "A comprehensive guide to using the GitHub CLI (gh) for common development workflows."
category: "Development Guides"
version: "1.0"
status: "active"
tags: \["guide", "github", "cli", "gh", "developer-tools", "workflow"]
----------------------------------------------------------------------

# GitHub CLI Developer Guide

## Table of Contents

- [1. Introduction](#1-introduction)
- [2. Core Commands](#2-core-commands)
  - [gh auth](#gh-auth)
  - [gh browse](#gh-browse)
  - [gh codespace](#gh-codespace)
  - [gh gist](#gh-gist)
  - [gh issue](#gh-issue)
  - [gh org](#gh-org)
  - [gh pr](#gh-pr)
  - [gh project](#gh-project)
  - [gh release](#gh-release)
  - [gh repo](#gh-repo)
- [3. GitHub Actions Commands](#3-github-actions-commands)
  - [gh cache](#gh-cache)
  - [gh run](#gh-run)
  - [gh workflow](#gh-workflow)
- [4. Additional Commands](#4-additional-commands)
  - [gh alias](#gh-alias)
  - [gh api](#gh-api)
  - [gh attestation](#gh-attestation)
  - [gh completion](#gh-completion)
  - [gh config](#gh-config)
  - [gh extension](#gh-extension)
  - [gh gpg-key](#gh-gpg-key)
  - [gh label](#gh-label)
  - [gh ruleset](#gh-ruleset)
  - [gh search](#gh-search)
  - [gh secret](#gh-secret)
  - [gh ssh-key](#gh-ssh-key)
  - [gh status](#gh-status)
  - [gh variable](#gh-variable)
- [5. Global Options](#5-global-options)
  - [`--version`](#--version)

## 1. Introduction

The GitHub CLI (`gh`) is a command-line tool that allows you to interact with GitHub directly from your terminal. It streamlines many common GitHub workflows, such as creating pull requests, viewing issues, and managing repositories, without needing to open a web browser. This guide provides an overview of the core commands and how to use them effectively.

## 2. Core Commands

### gh auth

Manages authentication with GitHub.

- **`gh auth login`**: Authenticates the CLI with your GitHub account. This is the first command you'll typically run.
  ```bash
  gh auth login
  ```
- **`gh auth logout`**: Removes authentication credentials.
  ```bash
  gh auth logout
  ```
- **`gh auth status`**: Displays the current authentication status.
  ```bash
  gh auth status
  ```
- **`gh auth refresh`**: Refreshes authentication credentials.
  ```bash
  gh auth refresh
  ```

### gh browse

Opens the current repository or a specific URL in the browser.

- **`gh browse`**: Opens the current repository on GitHub in your default web browser.
  ```bash
  gh browse
  ```
- **`gh browse <path>`**: Opens a specific file or directory within the repository in the browser.
  ```bash
  gh browse docs/README.md
  ```
- **`gh browse --commit <commit>`**: Opens a specific commit in the browser.
  ```bash
  gh browse --commit main
  ```
- **`gh browse --issue <number>`**: Opens a specific issue in the browser.
  ```bash
  gh browse --issue 123
  ```
- **`gh browse --pr <number>`**: Opens a specific pull request in the browser.
  ```bash
  gh browse --pr 456
  ```

### gh codespace

Manages GitHub Codespaces.

- **`gh codespace create`**: Creates a new Codespace for the current repository.
  ```bash
  gh codespace create
  ```
- **`gh codespace list`**: Lists your active Codespaces.
  ```bash
  gh codespace list
  ```
- **`gh codespace view <codespace-name>`**: Opens the details of a specific Codespace.
  ```bash
  gh codespace view my-codespace
  ```
- **`gh codespace ssh <codespace-name>`**: Connects to a Codespace via SSH.
  ```bash
  gh codespace ssh my-codespace
  ```
- **`gh codespace delete <codespace-name>`**: Deletes a Codespace.
  ```bash
  gh codespace delete my-codespace
  ```

### gh gist

Manages GitHub Gists.

- **`gh gist create <files>`**: Creates a new Gist from the specified files.
  ```bash
  gh gist create file1.txt file2.py
  ```
- **`gh gist create --public <files>`**: Creates a public Gist.
  ```bash
  gh gist create --public my_script.sh
  ```
- **`gh gist create --private <files>`**: Creates a private Gist.
  ```bash
  gh gist create --private sensitive_info.txt
  ```
- **`gh gist list`**: Lists your Gists.
  ```bash
  gh gist list
  ```
- **`gh gist view <gist-id>`**: Views the content of a specific Gist.
  ```bash
  gh gist view 1a2b3c4d5e6f
  ```
- **`gh gist edit <gist-id> <files>`**: Edits an existing Gist.
  ```bash
  gh gist edit 1a2b3c4d5e6f updated_file.txt
  ```
- **`gh gist clone <gist-url>`**: Clones a Gist to your local machine.
  ```bash
  gh gist clone [https://gist.github.com/user/1a2b3c4d5e6f](https://gist.github.com/user/1a2b3c4d5e6f)
  ```

### gh issue

Manages GitHub Issues.

- **`gh issue create`**: Creates a new issue in the current repository. You'll be prompted for a title and body.
  ```bash
  gh issue create
  ```
- **`gh issue create --title "<Issue Title>" --body "<Issue Description>"`**: Creates a new issue with a specified title and body.
  ```bash
  gh issue create --title "Bug: Login functionality broken" --body "Users are unable to log in."
  ```
- **`gh issue list`**: Lists issues in the current repository.
  ```bash
  gh issue list
  ```
- **`gh issue list --assignee <username>`**: Lists issues assigned to a specific user.
  ```bash
  gh issue list --assignee octocat
  ```
- **`gh issue list --label <label-name>`**: Lists issues with a specific label.
  ```bash
  gh issue list --label bug
  ```
- **`gh issue view <issue-number>`**: Views the details of a specific issue.
  ```bash
  gh issue view 123
  ```
- **`gh issue edit <issue-number> --title "<New Title>"`**: Edits the title of an issue.
  ```bash
  gh issue edit 123 --title "Fix: Login functionality broken"
  ```
- **`gh issue close <issue-number>`**: Closes an issue.
  ```bash
  gh issue close 123
  ```
- **`gh issue reopen <issue-number>`**: Reopens a closed issue.
  ```bash
  gh issue reopen 123
  ```

### gh org

Manages GitHub Organizations.

- **`gh org list`**: Lists organizations you are a member of.
  ```bash
  gh org list
  ```
- **`gh org view <organization>`**: Views details about a specific organization.
  ```bash
  gh org view github
  ```

### gh pr

Manages GitHub Pull Requests.

- **`gh pr create`**: Creates a new pull request for the current branch. You'll be prompted for details.
  ```bash
  gh pr create
  ```
- **`gh pr create --title "<PR Title>" --body "<PR Description>" --base <target-branch>`**: Creates a new pull request with a specified title, body, and base branch.
  ```bash
  gh pr create --title "Implement new feature" --body "Adds the amazing new feature." --base main
  ```
- **`gh pr list`**: Lists pull requests in the current repository.
  ```bash
  gh pr list
  ```
- **`gh pr list --base <branch>`**: Lists pull requests targeting a specific branch.
  ```bash
  gh pr list --base main
  ```
- **`gh pr list --head <branch>`**: Lists pull requests originating from a specific branch.
  ```bash
  gh pr list --head my-feature-branch
  ```
- **`gh pr view <pr-number>`**: Views the details of a specific pull request.
  ```bash
  gh pr view 456
  ```
- **`gh pr checkout <pr-number>`**: Checks out a specific pull request locally.
  ```bash
  gh pr checkout 456
  ```
- **`gh pr merge <pr-number>`**: Merges a pull request.
  ```bash
  gh pr merge 456
  ```
- **`gh pr close <pr-number>`**: Closes a pull request.
  ```bash
  gh pr close 456
  ```
- **`gh pr review <pr-number>`**: Adds a review to a pull request.
  ```bash
  gh pr review 456
  ```

### gh project

Manages GitHub Projects (both classic and new Projects).

- **`gh project list`**: Lists your projects.
  ```bash
  gh project list
  ```
- **`gh project view <project-number>`**: Views details of a specific project.
  ```bash
  gh project view 1
  ```
- **`gh project create --title "<Project Title>"`**: Creates a new project.
  ```bash
  gh project create --title "Sprint Backlog"
  ```
- **`gh project column-list <project-number>`**: Lists columns in a project.
  ```bash
  gh project column-list 1
  ```
- **`gh project column-create <project-number> --name "<Column Name>"`**: Creates a new column in a project.
  ```bash
  gh project column-create 1 --name "To Do"
  ```
- **`gh project item-list <project-number>`**: Lists items in a project.
  ```bash
  gh project item-list 1
  ```
- **`gh project item-create <project-number> --title "<Item Title>"`**: Creates a new item in a project.
  ```bash
  gh project item-create 1 --title "Implement user authentication"
  ```

### gh release

Manages GitHub Releases.

- **`gh release create <tag-name>`**: Creates a new release. You'll be prompted for details.
  ```bash
  gh release create v1.0.0
  ```
- **`gh release create <tag-name> --title "<Release Title>" --notes "<Release Notes>"`**: Creates a new release with a specified title and notes.
  ```bash
  gh release create v1.0.0 --title "Version 1.0.0" --notes "Initial release of the software."
  ```
- **`gh release list`**: Lists releases in the current repository.
  ```bash
  gh release list
  ```
- **`gh release view <tag-name>`**: Views details of a specific release.
  ```bash
  gh release view v1.0.0
  ```
- **`gh release upload <tag-name> <files>`**: Uploads assets to a release.
  ```bash
  gh release upload v1.0.0 dist/mysoftware.zip
  ```
- **`gh release delete <tag-name>`**: Deletes a release.
  ```bash
  gh release delete v1.0.0
  ```

### gh repo

Manages GitHub Repositories.

- **`gh repo create [<repository-name>]`**: Creates a new repository. You'll be prompted for details.
  ```bash
  gh repo create my-new-repo
  ```
- **`gh repo create <username>/<repository-name>`**: Creates a new repository under a specific user or organization.
  ```bash
  gh repo create my-org/another-repo
  ```
- **`gh repo clone <repository-url>`**: Clones a remote repository to your local machine.
  ```bash
  gh repo clone [https://github.com/octocat/Spoon-Knife.git](https://github.com/octocat/Spoon-Knife.git)
  ```
- **`gh repo fork`**: Forks the current repository.
  ```bash
  gh repo fork
  ```
- **`gh repo view [<repository>]`**: Views details about a repository. If no repository is specified, it defaults to the current repository.
  ```bash
  gh repo view
  gh repo view octocat/Spoon-Knife
  ```
- **`gh repo edit`**: Edits repository settings.
  ```bash
  gh repo edit --description "A repository for testing"
  gh repo edit --homepage "[https://journal.local](https://journal.local)"
  gh repo edit --private
  ```
- **`gh repo delete <repository>`**: Deletes a repository. **Use with caution!**
  ```bash
  gh repo delete my-org/old-repo
  ```

## 3. GitHub Actions Commands

### gh cache

Manages GitHub Actions caches.

- **`gh cache list`**: Lists GitHub Actions caches.
  ```bash
  gh cache list
  ```
- **`gh cache delete <key>`**: Deletes a GitHub Actions cache by key.
  ```bash
  gh cache delete my-cache-key
  ```

### gh run

Manages GitHub Actions workflow runs.

- **`gh run list`**: Lists recent workflow runs for the current repository.
  ```bash
  gh run list
  ```
- **`gh run view <run-id>`**: Views details of a specific workflow run.
  ```bash
  gh run view 1234567890
  ```
- **`gh run logs <run-id>`**: Displays logs for a specific workflow run.
  ```bash
  gh run logs 1234567890
  ```
- **`gh run cancel <run-id>`**: Cancels a running workflow.
  ```bash
  gh run cancel 1234567890
  ```
- **`gh run rerun <run-id>`**: Reruns a workflow.
  ```bash
  gh run rerun 1234567890
  ```

### gh workflow

Manages GitHub Actions workflows.

- **`gh workflow list`**: Lists workflows in the current repository.
  ```bash
  gh workflow list
  ```
- **`gh workflow view <workflow-filename>`**: Views details of a specific workflow.
  ```bash
  gh workflow view main.yml
  ```
- **`gh workflow run <workflow-filename>`**: Manually triggers a workflow run.
  ```bash
  gh workflow run build.yml
  ```
- **`gh workflow enable <workflow-filename>`**: Enables a workflow.
  ```bash
  gh workflow enable deploy.yml
  ```
- **`gh workflow disable <workflow-filename>`**: Disables a workflow.
  ```bash
  gh workflow disable nightly-build.yml
  ```

## 4. Additional Commands

### gh alias

Manages command aliases.

- **`gh alias list`**: Lists configured aliases.
  ```bash
  gh alias list
  ```
- **`gh alias set <alias> <command>`**: Creates a new alias.
  ```bash
  gh alias set prl "pr list"
  ```
- **`gh alias delete <alias>`**: Deletes an alias.
  ```bash
  gh alias delete prl
  ```

### gh api

Makes raw GitHub API requests. This is useful for accessing features not yet directly exposed by other `gh` commands.

- **`gh api /repos/<owner>/<repo>`**: Makes a GET request to the specified API endpoint.
  ```bash
  gh api /repos/octocat/Spoon-Knife
  ```
- **`gh api -X POST /repos/<owner>/<repo>/issues -f title="My Issue" -f body="Issue details"`**: Makes a POST request with data.
  ```bash
  gh api -X POST /repos/octocat/Spoon-Knife/issues -f title="My Issue" -f body="Issue details"
  ```

### gh attestation

Manages Git commit attestations.

- **`gh attestation create`**: Creates a new attestation.
  ```bash
  gh attestation create
  ```
- **`gh attestation verify`**: Verifies commit attestations.
  ```bash
  gh attestation verify
  ```

### gh completion

Generates shell completion scripts for `gh`.

- **`gh completion --shell bash`**: Generates bash completion script.
  ```bash
  gh completion --shell bash
  ```
- **`gh completion --shell zsh`**: Generates zsh completion script.
  ```bash
  gh completion --shell zsh
  ```
  Follow the instructions output by this command to set up shell completion for your preferred shell.

### gh config

Manages `gh` configuration settings.

- **`gh config list`**: Lists the current configuration.
  ```bash
  gh config list
  ```
- **`gh config get <key>`**: Gets the value of a specific configuration key.
  ```bash
  gh config get editor
  ```
- **`gh config set <key> <value>`**: Sets the value of a configuration key.
  ```bash
  gh config set editor "nano"
  ```

### gh extension

Manages `gh` extensions. Extensions allow you to add custom commands to the GitHub CLI.

- **`gh extension list`**: Lists installed extensions.
  ```bash
  gh extension list
  ```
- **`gh extension install <repository>`**: Installs an extension from a GitHub repository.
  ```bash
  gh extension install owner/my-extension
  ```
- **`gh extension upgrade <extension-name>`**: Upgrades an installed extension.
  ```bash
  gh extension upgrade my-extension
  ```
- **`gh extension uninstall <extension-name>`**: Uninstalls an extension.
  ```bash
  gh extension uninstall my-extension
  ```

### gh gpg-key

Manages GPG keys for commit signing.

- **`gh gpg-key list`**: Lists your GPG keys on GitHub.
  ```bash
  gh gpg-key list
  ```
- **`gh gpg-key add <key-id>`**: Adds a GPG key to your GitHub account.
  ```bash
  gh gpg-key add 1234ABCD
  ```

### gh label

Manages issue and pull request labels.

- **`gh label list`**: Lists labels in the current repository.
  ```bash
  gh label list
  ```
- **`gh label create "<label-name>" --color <hex-color>`**: Creates a new label.
  ```bash
  gh label create "urgent" --color ff0000
  ```
- **`gh label edit "<label-name>" --color <new-hex-color>`**: Edits an existing label.
  ```bash
  gh label edit "urgent" --color 00ff00
  ```
- **`gh label delete "<label-name>"`**: Deletes a label.
  ```bash
  gh label delete "deprecated"
  ```

### gh ruleset

Manages repository rulesets.

- **`gh ruleset list`**: Lists rulesets for the current repository.
  ```bash
  gh ruleset list
  ```
- **`gh ruleset view <ruleset-id>`**: Views details for a specific ruleset.
  ```bash
  gh ruleset view 123
  ```

### gh search

Searches GitHub.

- **`gh search issues <query>`**: Searches for issues.
  ```bash
  gh search issues "bug in:octocat/Spoon-Knife"
  ```
- **`gh search prs <query>`**: Searches for pull requests.
  ```bash
  gh search prs "review requested:octocat"
  ```
- **`gh search repos <query>`**: Searches for repositories.
  ```bash
  gh search repos "topic:cli language:go"
  ```
- **`gh search users <query>`**: Searches for users.
  ```bash
  gh search users "location:Alaska"
  ```

### gh secret

Manages GitHub Actions secrets.

- **`gh secret list`**: Lists secrets in the current repository.
  ```bash
  gh secret list
  ```
- **`gh secret set <secret-name>`**: Sets the value of a secret. You'll be prompted for the value.
  ```bash
  gh secret set API_KEY
  ```
- **`gh secret set <secret-name> --body "<secret-value>"`**: Sets the value of a secret directly.
  ```bash
  gh secret set API_KEY --body "your_actual_api_key"
  ```
- **`gh secret delete <secret-name>`**: Deletes a secret.
  ```bash
  gh secret delete API_KEY
  ```

### gh ssh-key

Manages SSH keys for Git authentication.

- **`gh ssh-key list`**: Lists your SSH keys on GitHub.
  ```bash
  gh ssh-key list
  ```
- **`gh ssh-key add <key-file>`**: Adds an SSH key to your GitHub account.
  ```bash
  gh ssh-key add ~/.ssh/id_rsa.pub
  ```

### gh status

Displays the status of GitHub services and your local repository.

- **`gh status`**: Shows the status of GitHub.com.
  ```bash
  gh status
  ```
- **`gh status --local`**: Shows the status of your local Git repository.
  ```bash
  gh status --local
  ```

### gh variable

Manages GitHub Actions variables.

- **`gh variable list`**: Lists variables in the current repository.
  ```bash
  gh variable list
  ```
- **`gh variable set <variable-name> <variable-value>`**: Sets the value of a variable.
  ```bash
  gh variable set ENVIRONMENT production
  ```
- **`gh variable get <variable-name>`**: Gets the value of a variable.
  ```bash
  gh variable get ENVIRONMENT
  ```
- **`gh variable delete <variable-name>`**: Deletes a variable.
  ```bash
  gh variable delete ENVIRONMENT
  ```

## 5. Global Options

### `--version`

Shows the installed version of the GitHub CLI.

```bash
gh --version
```
