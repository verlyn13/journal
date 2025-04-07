---
title: "list_code_definition_names Tool Reference"
description: "Scans source files in a directory (non-recursively) to list top-level code definitions like classes, functions, and interfaces."
category: "Tool Reference"
related_topics:
  - "Code Analysis"
  - "read_file Tool"
  - "Working with Large Projects"
  - "Context Management"
version: "1.0"
tags: ["code analysis", "definitions", "structure", "overview", "parsing", "tree-sitter"]
---

# list_code_definition_names Tool Reference

The `list_code_definition_names` tool provides a high-level structural overview of the code within a specific directory. It scans source files *only at the top level* of the given path (it does not recurse into subdirectories) and extracts major code definitions like classes, functions, methods, interfaces, etc., along with their starting line numbers and the definition signature. This helps Roo quickly understand the organization and key components of a module or directory without needing to read entire files.

---

## Parameters

The tool requires the following parameter:

| Parameter | Data Type | Required | Default                                   | Description                                                                                                                                                              |
|-----------|-----------|----------|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`    | String    | Yes      | Current working directory of the Roo project | The path of the directory whose top-level source files should be scanned for definitions. Relative paths are resolved from the project root (`/home/verlyn13/Projects/journal`). |

---

## Core Functionality

- **Non-Recursive Directory Scan:** Scans *only* the immediate files within the specified `path`. Subdirectories are ignored.
- **Source File Identification:** Identifies common source code files based on extensions (e.g., `.js`, `.ts`, `.py`, `.java`, `.rb`, `.go`, `.rs`, etc.).
- **Definition Extraction:** Uses language-specific parsers (Tree-sitter) to identify and extract top-level definitions (classes, functions, interfaces, methods within classes at the top level, etc.).
- **Structural Overview:** Presents a list of definitions grouped by file, including the starting line number and the definition's signature or first line.

---

## Prerequisites

- The specified `path` must be a valid directory accessible to Roo.
- The directory must contain source code files with recognizable extensions that are supported by the underlying Tree-sitter parsers.

---

## Use Cases

This tool is valuable for gaining a quick understanding of code structure without consuming excessive context:

- **Initial Code Exploration:** Getting a rapid overview of the main components (classes, functions) within a specific module or directory when encountering new code.
- **Planning Refactoring:** Identifying the primary definitions in a directory to understand potential scope and impact.
- **Understanding Module Organization:** Seeing how functionality is distributed across files within a single directory level.
- **Identifying Key Entry Points:** Locating major functions or classes that might serve as starting points for deeper analysis.
- **Context Gathering for Large Projects:** Providing a structural summary instead of including entire files in the context window. See [Working with Large Projects](./large-projects.md).

---

## Key Features

- **Broad Language Support:** Leverages Tree-sitter, supporting a wide range of common programming languages.
- **Concise Output:** Provides definition names and line numbers, offering a quick map without excessive detail.
- **Performance Optimized:** Limits the scan to the top level and processes a maximum number of files (e.g., 50) per request to ensure responsiveness.
- **Context-Efficient:** Helps understand code structure without adding large amounts of file content to the LLM context window.

---

## Limitations

- **Non-Recursive:** **Crucially, this tool does *not* scan subdirectories.** It only lists definitions from files directly within the specified `path`. To analyze nested structures, you need to call the tool separately for each subdirectory of interest.
- **Top-Level Definitions Only:** Primarily identifies definitions declared directly within the file scope or directly within top-level classes. It generally does not list functions defined inside other functions or deeply nested structures.
- **File Limit:** Processing may be capped at a certain number of files (e.g., 50) per directory scan for performance reasons.
- **Parser Accuracy:** The quality of definition extraction depends on the accuracy and completeness of the underlying Tree-sitter grammar for the specific language and code constructs used. Very unusual syntax might be missed.
- **No Usage Information:** Shows *what* is defined, but not *how* or *where* those definitions are used.
- **No Dynamic Analysis:** Cannot identify definitions created dynamically at runtime.

---

## How It Works (Simplified Workflow)

1.  **Parameter Validation:** Checks if the `path` parameter is provided and valid.
2.  **Path Resolution:** Resolves the `path` relative to the project root.
3.  **Directory Listing:** Reads the list of files directly within the specified directory.
4.  **File Filtering:** Selects recognized source code files (based on extension) up to the internal file limit. Ignores subdirectories and non-source files.
5.  **Parsing & Querying:** For each selected file:
    - Detects the language.
    - Parses the code into an Abstract Syntax Tree (AST) using the appropriate Tree-sitter grammar.
    - Executes pre-defined queries against the AST to find nodes representing top-level definitions.
6.  **Result Formatting:** Collects the definition names/signatures and their starting line numbers. Formats the output grouped by file path.
7.  **Output Generation:** Returns the formatted list of definitions.

---

## Output Format Example

The tool returns a textual representation listing files and their top-level definitions:

```text
path/to/directory/file1.py:
1--1 | class MyClass:
5--5 |   def __init__(self, value):
10--10 |   def process(self):
15--15 | def helper_function(data):

path/to/directory/file2.js:
1--1 | export function setup(config) {
10--10 | const DEFAULT_TIMEOUT = 5000;
12--12 | class ApiClient {
15--15 |   async fetchData(url) {
```

- Each file path is followed by its list of definitions.
- Each definition line shows `start_line--end_line | definition_signature`. (Note: End line might sometimes be the same as start line depending on the definition type and parser).

---

## Usage Examples

### Example 1: Listing Definitions in the Project Root

**Tool Call:**
```xml
<list_code_definition_names>
  <path>.</path>
</list_code_definition_names>
```
**Conceptual Outcome:** Roo scans source files directly in the `/home/verlyn13/Projects/journal` directory (e.g., `README.md` might be ignored, but a hypothetical `main.py` would be scanned) and lists their top-level functions, classes, etc.

### Example 2: Examining a Specific Service Directory

**Tool Call:**
```xml
<list_code_definition_names>
  <path>src/services</path>
</list_code_definition_names>
```
**Conceptual Outcome:** Roo scans files like `src/services/auth.js`, `src/services/payment.js` (but *not* files in `src/services/utils/` or other subdirectories) and lists the top-level functions/classes defined within them, providing an overview of the services available at that level.

### Example 3: Exploring Utility Functions

**Tool Call:**
```xml
<list_code_definition_names>
  <path>src/utils</path>
</list_code_definition_names>
```
**Conceptual Outcome:** Roo scans files directly within `src/utils` (e.g., `src/utils/helpers.ts`, `src/utils/validators.ts`) and lists the exported functions or classes, giving a quick inventory of available utility functions at that directory level.

---

## Related Concepts and Tools

- **`read_file`:** Use `read_file` to examine the full implementation details of a specific definition identified by `list_code_definition_names`.
- **Code Navigation:** This tool aids in navigating and understanding unfamiliar codebases by providing a structural map.
- **Context Management:** Useful in large projects to get an overview without loading entire files into the context window.
