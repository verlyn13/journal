---
id: markdown-linting-guide
title: Markdown Linting and Link Validation Guide
type: guide
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- guide
priority: medium
status: approved
visibility: internal
schema_version: v1
---

***

title: "Markdown Linting and Link Validation Guide"
description: "Guide for setting up and using Markdown linting and link validation tools for the Flask Journal documentation"
category: "Documentation"
phase: 17
related\_topics:
\- "Documentation Testing Process"
\- "Documentation Specialist Role"
version: "1.0"
tags: \["documentation", "quality-assurance", "linting", "markdown", "tools"]
status: active
--------------

# Markdown Linting and Link Validation Guide

This guide explains how to set up and use Markdown linting and link validation tools for the Flask Journal documentation. These tools help ensure documentation quality and consistency.

## Markdown Linting with markdownlint-cli

[markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli) is a command-line interface for the markdownlint library, which helps identify and fix Markdown issues.

### Installation

The markdownlint-cli package has been added as a dev dependency:

```bash
bun install --save-dev markdownlint-cli
```

### Configuration

Create a `.markdownlint.json` file in the project root with the following content:

```json
{
  "default": true,
  "MD013": {
    "line_length": 120,
    "code_blocks": false,
    "tables": false
  },
  "MD024": {
    "siblings_only": true
  },
  "MD033": false,
  "MD041": false
}
```

This configuration:

- Enforces a line length of 120 characters for regular text (excluding code blocks and tables)
- Allows duplicate headings in different sections
- Permits HTML elements when necessary
- Doesn't require the first line to be a top-level heading

### Recommended package.json Scripts

Add the following scripts to your `package.json`:

```json
"lint:md": "markdownlint \"docs/**/*.md\"",
"lint:md:fix": "markdownlint --fix \"docs/**/*.md\""
```

The first script will check all Markdown files in the docs directory for issues, while the second will automatically fix issues that can be auto-corrected.

## Link Validation with markdown-link-check

[markdown-link-check](https://github.com/tcort/markdown-link-check) validates links in Markdown files, checking for broken internal and external links.

### Installation

The markdown-link-check package has been added as a dev dependency:

```bash
bun install --save-dev markdown-link-check
```

### Configuration

Create a `.markdown-link-check.json` file in the project root with the following content:

```json
{
  "ignorePatterns": [
    {
      "pattern": "^http://localhost"
    },
    {
      "pattern": "^#"
    }
  ],
  "replacementPatterns": [
    {
      "pattern": "^@docs/",
      "replacement": "docs/"
    }
  ],
  "timeout": "5s",
  "retryOn429": true,
  "retryCount": 3,
  "fallbackRetryDelay": "30s",
  "aliveStatusCodes": [200, 206]
}
```

This configuration:

- Ignores localhost URLs and fragment identifiers
- Replaces `@docs/` references with `docs/` for proper path resolution
- Sets a 5-second timeout for link checking
- Retries when rate-limited (HTTP 429)
- Considers only HTTP 200 and 206 as valid responses

### Recommended package.json Scripts

Add the following scripts to your `package.json`:

```json
"lint:links": "find docs -name '*.md' -not -path 'node_modules (managed by Bun) (managed by Bun)/*' -exec markdown-link-check -c .markdown-link-check.json {} \\;",
"lint:links:file": "markdown-link-check -c .markdown-link-check.json"
```

The first script checks all Markdown files in the docs directory for broken links, while the second allows checking a specific file by passing it as an argument.

## Combined Documentation Testing Script

For convenience, add a combined script that runs both linting and link validation:

```json
"test:docs": "bun run lint:md && bun run lint:links"
```

## Running Linting and Link Validation

Once the scripts are added to package.json, you can run them with the following commands:

### Check Markdown formatting

```bash
bun run lint:md
```

### Auto-fix Markdown formatting issues

```bash
bun run lint:md:fix
```

### Check links in all Markdown files

```bash
bun run lint:links
```

### Check links in a specific file

```bash
bun run lint:links:file docs/guides/architecture-overview.md
```

### Run all documentation tests

```bash
bun run test:docs
```

## Manual Execution Without package.json Scripts

If you need to run the tools without updating package.json, you can use these commands directly:

```bash
# Check Markdown files
bunx markdownlint "docs/**/*.md"

# Fix Markdown issues
bunx markdownlint --fix "docs/**/*.md"

# Check links in all Markdown files
find docs -name '*.md' -not -path 'node_modules (managed by Bun) (managed by Bun)/*' -exec bunx markdown-link-check {} \;

# Check links in a specific file
bunx markdown-link-check docs/guides/architecture-overview.md
```

## Integration with Documentation Testing Process

These tools form a key part of the [Documentation Testing Process](guides/documentation-testing-process.md), which outlines the complete procedure for ensuring documentation quality, including both automated and manual checks.

When incorporated into a continuous integration workflow, these tools can automatically verify documentation quality for each change, ensuring consistent standards across the project.

***

By following this guide, you can efficiently validate and maintain the quality of Markdown documentation across the Flask Journal project.
