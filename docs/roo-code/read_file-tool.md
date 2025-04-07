---
title: "read_file Tool Reference"
description: "Reads the content of a specified file, supporting full reads, specific line ranges, and text extraction from formats like PDF and DOCX."
category: "Tool Reference"
related_topics:
  - "File System Navigation"
  - "list_files Tool"
  - "search_files Tool"
  - "apply_diff Tool"
  - "Working with Large Projects"
  - "Configuration Files" # .rooignore
version: "1.0"
tags: ["file system", "read file", "file content", "context", "pdf", "docx", "ipynb", "truncation"]
---

# read_file Tool Reference

The `read_file` tool allows Roo to access and examine the content of files within your project. It's essential for understanding code, reading configuration, analyzing documentation, and gathering context necessary for various tasks. The tool can read entire files, specific line ranges, and even extract text from certain non-plain-text formats.

---

## Parameters

The tool uses the following parameters:

| Parameter       | Data Type | Required | Default | Description                                                                                                                                                                                             |
|-----------------|-----------|----------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`          | String    | Yes      | N/A     | The path of the file to read, relative to the project root (`/home/verlyn13/Projects/journal`).                                                                                                            |
| `start_line`    | Integer   | No       | N/A     | The **1-based** line number to start reading from. If omitted, reading starts from the beginning of the file (line 1).                                                                                   |
| `end_line`      | Integer   | No       | N/A     | The **1-based**, *inclusive* line number to stop reading at. If omitted, reading continues to the end of the file.                                                                                        |
| `auto_truncate` | Boolean   | No       | `false` | If `true` and *no* line range (`start_line`/`end_line`) is specified, the tool may automatically truncate the output of very large files (e.g., >1000 lines) to a configured limit, adding a notice. |

---

## Core Functionality

- **File Content Retrieval:** Reads and returns the text content of the specified file.
- **Line Numbering:** Prepends line numbers (1-based) to each line of the output (e.g., `1 | content`).
- **Partial Reads (Line Ranges):** Efficiently reads only a specific segment of a file when `start_line` and/or `end_line` are provided. Ideal for large files.
- **Special Format Handling:** Attempts to extract readable text content from PDF (`.pdf`), DOCX (`.docx`), and Jupyter Notebook (`.ipynb`) files.
- **Automatic Truncation (Optional):** When `auto_truncate` is enabled and no line range is given, it prevents excessive output from very large files by returning only the initial portion (e.g., first 1000 lines) along with a truncation notice.

---

## Prerequisites

- The file specified by `path` must exist and be accessible to Roo.
- Roo must have read permissions for the file.
- The file must not be blocked by `.rooignore` rules.

---

## Use Cases

This tool is frequently used when Roo needs to "see" the contents of a file:

- **Code Analysis & Understanding:** Reading source code to understand logic, identify bugs, or plan refactoring.
- **Configuration Review:** Examining configuration files (`.json`, `.yaml`, `.ini`, etc.) to check settings or find parameters.
- **Documentation Reading:** Accessing content from Markdown files or other documentation formats.
- **Context Gathering:** Providing specific code snippets or file sections as context for a request.
- **Verification Before Editing:** Checking the exact current content (including line numbers and whitespace) before using tools like [`apply_diff`](./apply_diff-tool.md).
- **Extracting Text from Documents:** Reading content from supported PDF or DOCX files.

---

## Key Features

- **Line-Numbered Output:** Makes it easy to reference specific lines in subsequent prompts or diffs.
- **Efficient Range Reading:** When a line range is specified, the tool often streams only the necessary lines, making it efficient for large log files, CSVs, etc.
- **Text Extraction:** Built-in support for extracting text from PDF, DOCX, and IPYNB formats.
- **Configurable Truncation:** Optional safeguard against overwhelming context from large files.

---

## Limitations

- **Binary Files:** For most binary file types (images, executables, archives, etc., *except* supported formats like PDF/DOCX), the tool will return raw, likely unreadable content. It's generally not suitable for inspecting arbitrary binary data.
- **Performance on Very Large Files (Full Read):** Reading an entire extremely large file (millions of lines) without specifying a line range or using `auto_truncate` can be slow and may consume significant resources or hit context limits. **Using line ranges is strongly recommended for large files.**
- **Extraction Accuracy:** Text extraction quality from PDF/DOCX/IPYNB depends on the file's internal structure and the reliability of the extraction libraries. Complex formatting might be lost or misinterpreted.
- **Encoding:** Assumes standard text encodings (like UTF-8). Files with unusual encodings might not be read correctly.

---

## How It Works (Reading Strategy)

The tool determines how to read the file based on the provided parameters and file characteristics:

1.  **Parameter Validation & Path Resolution:** Checks parameters, resolves the `path`.
2.  **`.rooignore` Check:** Verifies the file is not blocked by ignore rules.
3.  **Strategy Selection (Priority Order):**
    a.  **Explicit Line Range:** If `start_line` or `end_line` is provided, the tool reads *only* the specified lines. This is the most efficient method for large files.
    b.  **Auto-Truncation:** If *no* line range is given, `auto_truncate` is `true`, *and* the file exceeds a configured line limit (e.g., 1000 lines), the tool reads only the beginning portion (up to the limit) and appends a truncation notice.
    c.  **Full File Read:** If neither (a) nor (b) applies, the tool attempts to read the entire file content.
        - For `.pdf`, `.docx`, `.ipynb`, it uses specialized text extraction libraries.
        - For other types, it reads the content as text.
4.  **Content Processing & Formatting:**
    - Prepends 1-based line numbers to each line (`N | content`).
    - Adds truncation notices if applicable.
    - Returns the formatted content or an error message (e.g., file not found, access denied).

---

## Output Format

The tool returns the file content with each line prefixed by its 1-based line number and a pipe separator.

**Example Output:**
```text
1 | import React from 'react';
2 | 
3 | function MyComponent({ title }) {
4 |   return (
5 |     <div>
6 |       <h1>{title}</h1>
7 |     </div>
8 |   );
9 | }
10| 
11| export default MyComponent;
```

**Truncated Output Example:**
```text
1 | // Start of a very long file...
...
1000| // Line 1000 content
[... truncated 5234 lines ...]
```

---

## Usage Examples

### Example 1: Reading an Entire Small File

**Tool Call:**
```xml
<read_file>
  <path>src/config.json</path>
</read_file>
```
**Conceptual Outcome:** Roo returns the full content of `src/config.json`, with line numbers prepended.

### Example 2: Reading a Specific Function (Lines 46-68)

**Tool Call:**
```xml
<read_file>
  <path>src/services/userService.js</path>
  <start_line>46</start_line>
  <end_line>68</end_line>
</read_file>
```
**Conceptual Outcome:** Roo efficiently reads and returns only lines 46 through 68 (inclusive) from `userService.js`, with corresponding line numbers.

### Example 3: Reading the Beginning of a Large Log File

**Tool Call:**
```xml
<read_file>
  <path>logs/application.log</path>
  <end_line>100</end_line> <!-- Read only the first 100 lines -->
</read_file>
```
**Conceptual Outcome:** Roo returns the first 100 lines of `application.log`.

### Example 4: Reading a Large File with Auto-Truncation

**Tool Call:**
```xml
<read_file>
  <path>data/large_dataset.csv</path>
  <auto_truncate>true</auto_truncate>
</read_file>
```
**Conceptual Outcome:** Assuming `large_dataset.csv` is over the truncation threshold (e.g., 1000 lines), Roo reads and returns only the first ~1000 lines, adding a notice like `[... truncated X lines ...]`.

### Example 5: Extracting Text from a PDF

**Tool Call:**
```xml
<read_file>
  <path>docs/specification.pdf</path>
</read_file>
```
**Conceptual Outcome:** Roo attempts to extract the text content from `specification.pdf` and returns it with line numbers (formatting may vary based on PDF structure).
