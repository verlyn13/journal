---
title: "search_files Tool Reference"
description: "Performs recursive regular expression searches across files within a specified directory, providing contextual results."
category: "Tool Reference"
related_topics:
  - "Code Analysis"
  - "Regular Expressions"
  - "list_files Tool"
  - "read_file Tool"
  - "Refactoring"
version: "1.0"
tags: ["search", "find", "regex", "regular expression", "code analysis", "ripgrep", "contextual search"]
---

# search_files Tool Reference

The `search_files` tool enables Roo to perform powerful regular expression (regex) searches across files within a specified directory and its subdirectories. It's designed to efficiently locate specific code patterns, text snippets, configuration values, or any other text-based content throughout your project, returning matches with surrounding context.

---

## Parameters

The tool uses the following parameters:

| Parameter      | Data Type | Required | Default | Description                                                                                                                                                                                          |
|----------------|-----------|----------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`         | String    | Yes      | N/A     | The path of the directory to search within, relative to the project root (`/home/verlyn13/Projects/journal`). The search will be performed recursively through all subdirectories within this path. |
| `regex`        | String    | Yes      | N/A     | The regular expression pattern to search for. **Uses Rust regex syntax.** Ensure proper escaping if needed, especially for characters with special meaning in regex (e.g., `.` `*` `+` `?` `(` `)` `[` `{`). |
| `file_pattern` | String    | No       | `*`     | An optional glob pattern to filter which files are searched (e.g., `*.ts`, `src/**/*.py`, `!**/node_modules/**`). If omitted, searches all files respecting default ignores.                     |

---

## Core Functionality

- **Recursive Regex Search:** Executes the provided `regex` pattern against the content of files found within the specified `path` and its subdirectories.
- **Contextual Output:** For each match found, the tool returns the matching line itself, plus one line of context immediately before and one line immediately after the match, aiding comprehension.
- **File Filtering:** Allows restricting the search to specific files using glob patterns via the `file_pattern` parameter.
- **Efficient Implementation:** Leverages high-performance backend tools (like Ripgrep) for speed, automatically respecting `.gitignore` and common ignore patterns.

---

## Prerequisites

- The specified `path` must be a valid directory accessible to Roo.
- The `regex` provided must be valid according to Rust regex syntax. Invalid patterns will cause errors.
- Roo must have read permissions for the files it attempts to search.

---

## Use Cases

This tool is invaluable for exploring and analyzing codebases:

- **Finding Usages:** Locating all occurrences where a specific function, class, variable, constant, or API key is used or defined.
- **Impact Analysis:** Identifying all code sections potentially affected by a planned refactoring or change.
- **Pattern Discovery:** Searching for specific coding patterns, anti-patterns, TODO/FIXME comments, specific import statements, or configuration settings across the project.
- **Code Auditing:** Searching for potentially insecure code patterns or deprecated API usage.
- **Consistency Checks:** Finding variations in naming conventions or implementation patterns.

---

## Key Features

- **High Performance:** Utilizes optimized search tools like Ripgrep (`rg`) for fast execution, even in large projects.
- **Contextual Snippets:** Provides one line of context above and below each match, making it easier to understand the match's relevance.
- **Glob Filtering:** Supports flexible file filtering using `file_pattern`.
- **Line Numbering:** Includes the line number for each matching line.
- **Result Limiting:** Caps the number of returned results (e.g., 300) to prevent excessive output, with a notification if the limit is reached.
- **Line Length Truncation:** Truncates very long lines (e.g., >500 chars) in the output for readability, adding a `[truncated...]` marker.
- **Match Grouping:** Merges nearby matches within the same file into single blocks in the output for better readability.
- **Ignore Rules:** Automatically respects `.gitignore` and common binary/generated file patterns.

---

## Limitations

- **Text Files Only:** Designed for searching text-based files. Results on binary files (images, executables, etc.) are generally meaningless or may cause errors.
- **Regex Flavor:** Requires **Rust regex syntax**, which may have slight differences compared to PCRE (used in JavaScript/Python) or other regex engines. Test complex patterns carefully.
- **No Compressed File Search:** Cannot search inside archives (e.g., `.zip`, `.tar.gz`).
- **Fixed Context Window:** Provides only one line of context before/after by default (though grouping merges close matches). Cannot configure a larger context window per match via parameters.
- **Performance on Massive Codebases:** While fast, searching extremely large monorepos with very broad patterns might still take noticeable time.

---

## How It Works (Simplified Workflow)

1.  **Parameter Validation:** Checks for required `path` and `regex`. Validates `file_pattern` if provided.
2.  **Path Resolution:** Resolves the `path` relative to the project root.
3.  **Search Execution:** Invokes the backend search tool (e.g., Ripgrep) with the specified `regex`, target `path`, and `file_pattern`. Instructs the tool to include one line of context before (`-B 1`) and after (`-A 1`) each match.
4.  **Result Processing:** Parses the output from the search tool.
5.  **Formatting & Grouping:** Formats each match with its file path, line number, and contextual lines. Groups adjacent or overlapping matches from the same file into blocks separated by `----`.
6.  **Limiting & Truncation:** Applies the result count limit and line length truncation. Adds notification messages if limits are hit.
7.  **Output Generation:** Returns the formatted search results.

---

## Search Results Format

The output groups matches by file.

```text
# path/relative/to/search/root/file1.ext
 [line_no] | [Context line before match (if exists)]
 [line_no] | [Line containing the match]
 [line_no] | [Context line after match (if exists)]
----
# path/relative/to/search/root/another_file.ext
 [line_no] | [Context line before match]
 [line_no] | [First matching line]
 [line_no] | [Second matching line (if close)]
 [line_no] | [Context line after match]
----
# Showing first 300 of 450 results. Use a more specific search or path if necessary.
```

- **File Header:** `# path/to/file.ext` indicates the file containing the following matches.
- **Line Format:** `[line_no] | [line_content]`. Line numbers are typically padded for alignment.
- **Separator:** `----` separates match groups from different files or distant matches within the same file.
- **Limit Notification:** A message is appended if the result limit (e.g., 300) was reached.

---

## Usage Examples

### Example 1: Searching for TODO/FIXME Comments in Python Files

**Tool Call:**
```xml
<search_files>
  <path>src</path>
  <regex>(TODO|FIXME):</regex>
  <file_pattern>*.py</file_pattern>
</search_files>
```
**Conceptual Outcome:** Roo searches all `.py` files within the `src` directory (and its subdirectories) for lines containing `TODO:` or `FIXME:`. It returns each match with one line of context before and after.

### Example 2: Finding All Definitions of a Function `calculateTotal`

**Tool Call:**
```xml
<search_files>
  <path>.</path>
  <regex>^(async\s+)?function\s+calculateTotal\s*\([^)]*\)</regex> <!-- Example regex for JS/TS function definition -->
  <file_pattern>*.{js,ts,jsx,tsx}</file_pattern>
</search_files>
```
**Conceptual Outcome:** Roo searches all specified JavaScript/TypeScript files in the entire project for lines defining a function named `calculateTotal` (allowing for `async`). Results show the definition line and its immediate context.

### Example 3: Locating Specific API Endpoint Usage

**Tool Call:**
```xml
<search_files>
  <path>src</path>
  <regex>fetch\(.*['"]/api/users['"]</regex> <!-- Example regex for fetch call -->
</search_files>
```
**Conceptual Outcome:** Roo searches all files under `src` for lines containing a `fetch` call that seems to target the `/api/users` endpoint. The results provide context around these API calls.
