---
id: ci-setup
title: CI SETUP
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- docker
priority: medium
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-09'
---

# CI SETUP

*Source: <https://biomejs.dev/recipes/continuous-integration>*
*Fetched: 2025-08-30T00:47:25.976Z*

***

# Continuous Integration

```
    Running Biome in a CI environment is easy. Check out the following examples for some inspiration.
```

## GitHub Actions

[Section titled “GitHub Actions”](#github-actions)
We provide a first-party [GitHub Action](https://github.com/marketplace/actions/setup-biome) to setup Biome in your runner.
Here’s what a simple workflow might look like:
pull\_request.yml\`\`\`
1name: Code quality2
3on:4  push:5  pull\_request:6
7jobs:8  quality:9    runs-on: ubuntu-latest10    permissions:11      contents: read12    steps:13      - name: Checkout14        uses: actions/checkout\@v515        with:16          persist-credentials: false17      - name: Setup Biome18        uses: biomejs/setup-biome\@v219        with:20          version: latest21      - name: Run Biome22        run: biome ci .

```

If your Biome configuration has external dependencies (e.g., extends a config from a package), you’ll need to setup Node.js and install dependencies using your preferred package manager before running Biome:

```

1- name: Setup Node.js2  uses: actions/setup-node\@v43  with:4    node-version: 22 # or your preferred version5    cache: "npm" # or 'bun', 'pnpm'6- name: Install dependencies7  run: bun ci # or bun install --frozen-lockfile, pnpm install --frozen-lockfile

````

### Third-party actions

[Section titled “Third-party actions”](#third-party-actions)
These are actions maintained by other communities, that you use in your runner:

- [reviewdog-action-biome](https://github.com/marketplace/actions/run-biome-with-reviewdog): run Biome with reviewdog and make comments and commit suggestions on the pull request.

pull_request.yml```
1name: reviewdog2on: [pull_request]3jobs:4  biome:5    name: runner / Biome6    runs-on: ubuntu-latest7    permissions:8      contents: read9      pull-requests: write10    steps:11      - uses: actions/checkout@v512      - uses: mongolyy/reviewdog-action-biome@v113        with:14          github_token: ${{ secrets.github_token }}15          reporter: github-pr-review
````

## GitLab CI

[Section titled “GitLab CI”](#gitlab-ci)
Below is an example configuration:

.gitlab-ci.yml\`\`\`
1# Define pipeline stages2stages:3  - quality4
5# Lint job configuration: runs code quality checks using Biome6lint:7    image:8      name: ghcr.io/biomejs/biome:latest  # Use the latest Biome Docker image9      entrypoint: \[""]                    # This is required for the image to work in GitLab CI10    stage: quality                        # Run in the quality stage11    script:12        - biome ci --reporter=gitlab --colors=off > /tmp/code-quality.json13        - cp /tmp/code-quality.json code-quality.json14    artifacts:15      reports:16        codequality:17          - code-quality.json    # Collect the code quality report artifact18    rules:19        - if: $CI\_COMMIT\_BRANCH    # Run job for commits on branches20        - if: $CI\_MERGE\_REQUEST\_ID # Run job for merge requests

```

 /tmp/code-quality.json        - cp /tmp/code-quality.json code-quality.json    artifacts:      reports:        codequality:          - code-quality.json    # Collect the code quality report artifact    rules:        - if: $CI_COMMIT_BRANCH    # Run job for commits on branches        - if: $CI_MERGE_REQUEST_ID # Run job for merge requests">     Copyright (c) 2023-present Biome Developers and Contributors.
```
