---
title: "Context Mentions (@ Mentions)"
description: "Explains how to use @ mentions to provide specific context (files, folders, problems, Git info, URLs) to Roo Code."
category: "Features & Concepts"
related_topics:
  - "Prompt Engineering Tips"
  - "Working with Large Projects"
  - "read_file Tool"
  - "list_files Tool"
  - "execute_command Tool"
version: "1.0"
tags: ["context", "mentions", "at-mentions", "files", "folders", "problems", "git", "urls", "prompting"]
---

# Context Mentions (@ Mentions)

Context mentions are a powerful feature in Roo Code that allow you to directly embed specific project information into your prompts using the `@` symbol. By referencing files, folders, diagnostic problems, Git information, terminal output, or even URLs, you provide Roo with precise, relevant context, leading to more accurate analysis, code generation, and task execution.

---

## Overview of Context Mentions

Using `@` mentions helps you:

- **Inject Specific Context:** Include relevant file contents, directory structures, error messages, or Git diffs directly into the conversation flow.
- **Improve Accuracy:** Ground Roo's understanding in the actual state of your project, reducing ambiguity and improving the relevance of its responses.
- **Streamline Workflow:** Avoid manual copy-pasting of code, error messages, or file paths.

Typing `@` in the chat input triggers a suggestions dropdown menu, typically showing:
- Recently opened files
- Visible files/folders in the explorer
- Recent Git commits
- Special keywords like `@problems`, `@terminal`, `@git-changes`

---

## Types of Context Mentions

Here's a summary of the available mention types:

| Mention Type      | Format Example                 | Description                                                                       | Related Tool(s) / Concept |
|-------------------|--------------------------------|-----------------------------------------------------------------------------------|---------------------------|
| **File**          | `@/path/to/file.ext`           | Includes file content with line numbers. Supports text, PDF, DOCX extraction.     | [`read_file`](./read_file-tool.md) |
| **Folder**        | `@/path/to/folder/`            | Displays a tree of the folder's immediate children (files/subfolders).            | [`list_files`](./list_files-tool.md) |
| **Problems**      | `@problems`                    | Imports diagnostics (errors/warnings) from the VS Code Problems panel.            | Diagnostics               |
| **Terminal**      | `@terminal`                    | Captures the last terminal command and its output.                                | [`execute_command`](./execute_command-tool.md) |
| **Git Commit**    | `@a1b2c3d` (commit hash)       | Shows commit details (message, author, date, diff).                               | Version Control           |
| **Git Changes**   | `@git-changes`                 | Shows uncommitted changes (`git status` + `git diff`).                            | Version Control           |
| **URL**           | `@https://example.com`         | Fetches external website content and converts it to Markdown.                     | Web Content               |
| **Symbol**        | `@MyFunction` (symbol name)    | (If supported) Includes code snippets related to a specific function/class/symbol. | Code Analysis             |

---

## Detailed Descriptions

### File Mentions (`@/path/to/file.ext`)
- **Path:** Must start with `/` relative to the workspace root.
- **Content:** Provides full file content with line numbers prepended. Uses [`read_file`](./read_file-tool.md) logic internally.
- **Formats:** Best for text files. Attempts text extraction for PDF/DOCX.
- **Use Case:** Referencing specific code, configuration, or documentation for analysis or modification.
- **Note:** Very large files might be truncated by the underlying `read_file` mechanism depending on settings/limits.

### Folder Mentions (`@/path/to/folder/`)
- **Path:** Must end with a trailing `/`.
- **Content:** Shows a non-recursive listing of the immediate contents (files and subdirectories) of the specified folder, similar to a basic [`list_files`](./list_files-tool.md) call.
- **Use Case:** Quickly understanding the structure of a specific directory.

### Problems Mention (`@problems`)
- **Content:** Embeds the current list of errors and warnings from the VS Code "Problems" panel, including severity, message, file path, and line number.
- **Use Case:** Asking Roo to fix specific diagnostics or explain errors.

### Terminal Mention (`@terminal`)
- **Content:** Includes the command and output from the most recently used integrated terminal instance.
- **Use Case:** Debugging failed commands, analyzing build output, or referencing results from [`execute_command`](./execute_command-tool.md).
- **Note:** Captures the visible buffer content; extremely long outputs might be truncated by the terminal itself.

### Git Mentions (`@commit-hash`, `@git-changes`)
- **`@commit-hash`:** Provides details for a specific commit (message, author, date, diff). Requires a valid Git commit hash.
- **`@git-changes`:** Shows the output of `git status` and `git diff` for currently staged and unstaged changes in the working directory.
- **Use Case:** Reviewing changes, generating commit messages, understanding recent modifications.

### URL Mentions (`@https://...`)
- **Content:** Fetches the content of the specified URL using a headless browser, attempts to clean it, and converts the main content area to Markdown.
- **Use Case:** Summarizing web pages, extracting information from documentation sites, analyzing online articles.
- **Note:** Accuracy depends heavily on the website's structure; complex JavaScript-heavy sites or pages behind logins may not render well.

### Symbol Mentions (`@SymbolName`)
- *(Availability and behavior may vary)*
- **Content:** If supported by underlying code intelligence, may insert relevant code snippets or definitions related to the specified symbol (function, class, variable) found in the project.
- **Use Case:** Quickly referencing the definition or key usages of a specific code element.

---

## How to Use Context Mentions

1.  **Trigger:** Type `@` in the chat input box.
2.  **Select/Filter:** Choose from the suggestions dropdown (use arrow keys or continue typing to filter) or type the full mention manually (e.g., `@/src/app.js`).
3.  **Insert:** Press Enter or click to insert the selected mention.
4.  **Combine:** Use multiple mentions in a single prompt for richer context. Example: `"Based on the requirements in @docs/spec.md, fix the @problems reported in @src/feature.ts."`

---

## Best Practices

- **Be Specific:** Use the most precise mention possible (e.g., file path over folder path if you need content).
- **Use Relative Paths:** Always start file/folder paths with `@/` from the workspace root.
- **Verify Mentions:** Double-check file paths, commit hashes, etc., for correctness.
- **Leverage for Clarity:** Use mentions instead of ambiguous descriptions ("the main file", "the recent error").
- **Combine Strategically:** Combine mentions to provide comprehensive context for complex requests. See [Prompt Engineering Tips](./prompt-engineering-tips.md).
- **Manage Context Size:** Be mindful when mentioning large files, as they contribute significantly to the context window. See [Working with Large Projects](./large-projects.md).

---

By effectively using context mentions, you provide Roo Code with the precise information it needs, leading to more accurate, efficient, and contextually relevant interactions.
