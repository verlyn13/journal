---
title: "list_files Tool Reference"
description: "Lists files and directories within a specified path, either recursively or at the top level, respecting ignore rules."
category: "Tool Reference"
related_topics:
  - "File System Navigation"
  - "Configuration Files" # .gitignore, .rooignore
  - "search_files Tool"
  - "read_file Tool"
version: "1.0"
tags: ["file system", "list files", "directory listing", "navigation", "recursive", "ignore rules"]
---

# list_files Tool Reference

The `list_files` tool allows Roo to explore the file system structure within your project by listing files and directories at a specified path. It can operate recursively to map out entire directory trees or list only the immediate contents of a single directory.

---

## Parameters

The tool uses the following parameters:

| Parameter   | Data Type | Required | Default | Description                                                                                                                                                                                             |
|-------------|-----------|----------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`      | String    | Yes      | N/A     | The path of the directory whose contents should be listed. Relative paths are resolved from the project root (`/home/verlyn13/Projects/journal`).                                                          |
| `recursive` | Boolean   | No       | `false` | If set to `true`, lists files and directories recursively through all subdirectories. If `false` or omitted, lists only the top-level contents of the specified `path`. |

---

## Core Functionality

- **Directory Listing:** Provides a list of files and subdirectories within the given `path`.
- **Recursive Exploration:** Optionally traverses subdirectories to create a comprehensive map of a directory tree (`recursive: true`).
- **Ignore Rule Handling:** Automatically respects rules defined in `.gitignore` files. It also handles `.rooignore` rules, potentially hiding or marking restricted files based on Roo's configuration (`showRooIgnoredFiles`).
- **Performance Safeguards:** Includes mechanisms like file count limits (e.g., ~200) and timeouts (e.g., 10 seconds) during recursive scans to prevent excessive resource usage or hangs on very large or complex directory structures.
- **Intelligent Filtering (Recursive):** When running recursively, it automatically skips common large, generated, or metadata directories like `node_modules`, `.git`, `dist`, `build`, etc., to keep the output relevant and performant.

---

## Prerequisites

- The specified `path` must be a valid directory accessible to Roo.
- For recursive scans, Roo needs read permissions for all subdirectories it attempts to traverse.

---

## Use Cases

This tool is fundamental for understanding and navigating the project structure:

- **Initial Project Exploration:** Getting an overview of how a project is organized when first starting work on it.
- **Locating Files:** Finding specific configuration files, source files, or assets before reading or editing them.
- **Understanding Module Structure:** Seeing the contents of a specific directory (e.g., `src/components`, `tests/`) to understand its internal organization.
- **Pre-computation for Other Tools:** Identifying target files or directories before using tools like [`read_file`](./read_file-tool.md) or [`search_files`](./search_files-tool.md).
- **Verifying Directory Contents:** Checking the files present in a specific location. (Note: Not intended for confirming the existence of files *just* created by Roo; rely on tool success messages for that).

---

## Key Features

- **Clear Output:** Distinguishes files from directories (directories have a trailing `/`).
- **Recursive Option:** Provides flexibility to see either a shallow or deep view of the directory structure.
- **Built-in Ignores:** Smartly skips irrelevant directories in recursive mode.
- **`.gitignore` / `.rooignore` Compliance:** Integrates with standard ignore file patterns.
- **Performance Limits:** Includes timeouts and file count limits to ensure responsiveness.
- **Logical Sorting:** Typically sorts output to list directories before files within the same level.

---

## Limitations

- **File Count Limit:** The number of items returned may be capped (e.g., around 200) to prevent overwhelming output and maintain performance. A message indicates if the listing was truncated.
- **Recursive Timeout:** Recursive scans have a time limit (e.g., 10 seconds). If exceeded, a partial list is returned along with a timeout notification.
- **Sensitive Directory Restrictions:** For security, the tool typically prevents listing sensitive system directories (e.g., root `/`, user home `~`).
- **No File Content:** Only lists names and types (file/directory), not file contents. Use [`read_file`](./read_file-tool.md) for content.
- **Not for Real-time Confirmation:** Should not be used immediately after a `write_to_file` or `execute_command` (like `mkdir`) to confirm creation; rely on the success/failure message of the preceding tool.

---

## How It Works (Simplified Workflow)

1.  **Parameter Validation:** Checks for the required `path` and optional `recursive` parameters.
2.  **Path Resolution & Security:** Resolves the `path` and checks against security restrictions (e.g., accessing root/home).
3.  **Scanning:**
    - **Non-Recursive (`recursive: false`):** Reads the immediate contents of the `path`.
    - **Recursive (`recursive: true`):** Initiates a traversal, reading directory contents level by level. Applies the timeout. Skips known large/irrelevant directories (e.g., `.git`, `node_modules`).
4.  **Filtering:** Applies `.gitignore` and `.rooignore` rules to the discovered files and directories.
5.  **Sorting & Formatting:** Sorts the results (often directories first) and adds trailing slashes `/` to directory names. Marks `.rooignore`d files if configured.
6.  **Truncation:** If the file count limit is reached, stops adding items and appends a truncation message.
7.  **Output Generation:** Returns the formatted list of files and directories. If a timeout occurred during recursive scan, a notification is included.

---

## Output Format Example

The output is a simple list of file and directory paths relative to the initial `path` provided.

**Non-Recursive Example (`path: src`, `recursive: false`):**
```text
components/
utils/
index.ts
main.ts
styles.css
```

**Recursive Example (`path: src`, `recursive: true`):**
```text
components/
components/Button.tsx
components/Modal.jsx
utils/
utils/auth.ts
utils/helpers.ts
index.ts
main.ts
styles.css
```

**Truncated Output Example:**
```text
api/
api/users.py
api/products.py
# ... many more files ...
tests/
tests/test_users.py
File listing truncated (showing 200 of 350 items). Use list_files on specific subdirectories for more details.
```

**With `.rooignore` Marking Example (`showRooIgnoredFiles: true`):**
```text
config/
config/database.yml
🔒 config/secrets.env
src/
src/app.py
```

---

## Usage Examples

### Example 1: Listing Top-Level Contents of Project Root

**Tool Call:**
```xml
<list_files>
  <path>.</path>
  <recursive>false</recursive> <!-- Or omit recursive, as false is default -->
</list_files>
```
**Conceptual Outcome:** Roo lists the files and directories directly inside `/home/verlyn13/Projects/journal`, such as `README.md`, `docs/`, `src/`, etc.

### Example 2: Recursively Listing All Files in `src` Directory

**Tool Call:**
```xml
<list_files>
  <path>src</path>
  <recursive>true</recursive>
</list_files>
```
**Conceptual Outcome:** Roo lists all files and subdirectories within `src/`, including nested ones like `src/components/Button.tsx`, `src/utils/helpers.ts`, etc., up to the file limit/timeout. It will likely skip directories like `src/node_modules` if present.

### Example 3: Examining Only the Top Level of `src/components`

**Tool Call:**
```xml
<list_files>
  <path>src/components</path>
  <recursive>false</recursive>
</list_files>
```
**Conceptual Outcome:** Roo lists only the files and subdirectories directly inside `src/components`, such as `Button.tsx`, `Modal.jsx`, `common/`, etc., without listing the contents of `src/components/common/`.
