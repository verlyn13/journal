---
title: "write_to_file Tool Reference"
description: "Creates new files or completely overwrites existing files with provided content, featuring an interactive diff view for user review and approval."
category: "Tool Reference"
related_topics:
  - "File System Modification"
  - "apply_diff Tool"
  - "insert_content Tool"
  - "search_and_replace Tool"
  - "Configuration Files" # .rooignore
version: "1.0"
tags: ["file system", "write file", "create file", "overwrite", "diff view", "user approval"]
---

# write_to_file Tool Reference

The `write_to_file` tool allows Roo to create new files or completely replace the content of existing files within your project. A key feature is its interactive diff view, which presents the proposed content (or changes compared to the existing file) for user review, editing, and explicit approval before any write operation occurs.

**Important:** This tool **overwrites** the entire file. For modifying *parts* of an existing file, prefer using [`apply_diff`](./apply_diff-tool.md), [`insert_content`](#), or [`search_and_replace`](#) as they are generally safer and more efficient for targeted changes.

---

## Parameters

The tool requires the following parameters:

| Parameter    | Data Type | Required | Default | Description                                                                                                                                                                                                                            |
|--------------|-----------|----------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`       | String    | Yes      | N/A     | The path of the file to create or overwrite, relative to the project root (`/home/verlyn13/Projects/journal`). The tool will create necessary parent directories if they don't exist.                                                    |
| `content`    | String    | Yes      | N/A     | The **COMPLETE** intended content for the file. **Crucially, you must provide the entire file content, not just changes or snippets.** Omissions will result in data loss when overwriting existing files. Do not include line numbers. |
| `line_count` | Integer   | Yes      | N/A     | The exact total number of lines (including empty lines) in the provided `content`. This is used as a safety check to detect potential truncation by the AI model before presenting the diff.                                          |

---

## Core Functionality

- **File Creation:** Creates a new file at the specified `path` with the provided `content` if the file does not already exist. Automatically creates parent directories as needed.
- **File Overwrite:** If the file at `path` already exists, its entire content is replaced with the provided `content`. **All previous content is lost.**
- **Interactive Diff View:** Before writing, displays a diff view comparing the proposed `content` against the existing file (or showing the full content if creating a new file).
- **User Review & Edit:** Allows the user to review the proposed content in the diff view and make manual edits directly within that view before approving.
- **Explicit Approval:** Requires the user to explicitly approve the changes (including any manual edits) before the file is written to disk.
- **Content Sanitization:** Preprocesses the provided `content` to remove common AI artifacts like code block markers (e.g., ```), escaped HTML entities, or stray line numbers.
- **Safety Checks:** Validates the `path` against `.rooignore` rules, checks for potential content truncation using `line_count`, and ensures the path is within the workspace.

---

## Prerequisites

- **Valid Path:** The `path` must be a valid relative path within the project workspace.
- **Permissions:** Roo must have write permissions for the target directory and file.
- **Accurate `line_count`:** The provided `line_count` must accurately reflect the number of lines in the `content` parameter for the truncation check to be effective.
- **User Approval:** The user must review and explicitly approve the proposed content in the diff view.

---

## Use Cases

This tool is primarily intended for:

- **Creating New Files:** Generating initial source code files, configuration files (`.json`, `.yaml`), documentation (`.md`), HTML files, etc.
- **Complete File Replacement:** When the entire content of a file needs to be replaced with newly generated content (e.g., regenerating a configuration file based on new inputs).
- **Project Scaffolding:** Generating multiple boilerplate files for a new project structure.

**When NOT to use `write_to_file`:**

- **Modifying Existing Files:** For adding, removing, or changing specific lines or sections within an existing file, use [`apply_diff`](./apply_diff-tool.md), [`insert_content`](#), or [`search_and_replace`](#) instead. They are safer, more efficient, and preserve the rest of the file content.

---

## Key Features

- **Interactive Approval:** Guarantees user review before any file modification occurs.
- **In-Diff Editing:** Provides flexibility for the user to make final adjustments.
- **Truncation Detection:** Uses `line_count` as a safeguard against incomplete content generated by the AI.
- **Content Cleanup:** Automatically sanitizes common AI generation artifacts.
- **Directory Creation:** Handles the creation of necessary parent directories for new files.

---

## Limitations

- **Destructive Overwrite:** Completely replaces existing file content. **Use with extreme caution on existing files.** Prefer other editing tools for modifications.
- **Inefficient for Modifications:** Much less efficient than diff-based tools for small changes in large files.
- **Performance on Large Files:** Displaying the diff and writing very large files can be slow.
- **Requires Accurate `line_count`:** Relies on the AI providing an accurate line count for its truncation check.
- **Interactive Requirement:** Requires user interaction for approval, making it unsuitable for fully automated, non-interactive workflows.

---

## How It Works (Simplified Workflow)

1.  **Parameter Validation:** Checks for required `path`, `content`, `line_count`. Validates `path` against workspace boundaries and `.rooignore` rules.
2.  **Content Preprocessing:** Cleans the `content` string (removes code fences, etc.).
3.  **Truncation Check:** Compares the actual line count of the cleaned `content` with the provided `line_count`. If they don't match significantly, an error or warning about potential truncation is raised, often preventing the diff view from opening.
4.  **Diff View Generation:**
    - Reads the current content of the file at `path` (if it exists).
    - Opens an editor diff view showing the difference between the existing content (if any) and the proposed `content`.
    - Highlights changes and may scroll to the first difference.
5.  **User Interaction:**
    - Waits for the user to review the diff.
    - The user can approve, reject, or edit the proposed content directly in the diff editor.
6.  **Final Write (Upon Approval):**
    - If approved, takes the final content (including any user edits from the diff view).
    - Writes this final content to the file at `path`, overwriting it if it exists or creating it (and parent directories) if it doesn't.
7.  **Result Reporting:** Reports success or failure (including rejection by the user or errors during writing).

---

## Usage Examples

### Example 1: Creating a New JSON Configuration File

**Tool Call:**
```xml
<write_to_file>
  <path>config/app-settings.json</path>
  <content>{
  "serviceUrl": "https://service.example.com/api",
  "timeout": 5000,
  "featureFlags": {
    "newDashboard": true,
    "betaFeatureX": false
  }
}
