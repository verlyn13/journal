---
title: "apply_diff Tool Reference"
description: "Applies precise, targeted changes to files using a search-and-replace block format."
category: "Tool Reference"
related_topics:
  - "File Editing"
  - "write_to_file"
  - "insert_content"
  - "search_and_replace"
  - "Diff Strategies"
version: "1.1" # Updated based on enhanced description
---

# apply_diff Tool Reference

The `apply_diff` tool enables precise, surgical modifications to existing files. It works by searching for an exact block of existing content (including whitespace and indentation) and replacing it with new content. This tool is ideal for targeted refactoring, bug fixes, or updates where specific lines need replacement.

---

## Parameters

The tool requires the following parameters:

| Parameter    | Data Type | Required | Default | Description                                                                                                                               |
|--------------|-----------|----------|---------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `path`       | String    | Yes      | N/A     | The path of the file to modify, relative to the current working directory (`/home/verlyn13/Projects/journal`).                               |
| `diff`       | String    | Yes      | N/A     | A specially formatted string containing one or more search/replace blocks. See the "Diff Format" section below for details.                 |
| `start_line` | Integer   | No       | N/A     | *Deprecated/Internal:* Previously used as a hint for some internal strategies. Use the `:start_line:` marker within the `diff` block instead. |
| `end_line`   | Integer   | No       | N/A     | *Deprecated/Internal:* Previously used as a hint for some internal strategies. Use the `:end_line:` marker within the `diff` block instead.   |

**Note:** The `start_line` and `end_line` parameters are generally not used directly in the tool call anymore. Line numbers *must* be specified within the `diff` block itself using the `:start_line:` and `:end_line:` markers for each SEARCH section.

---

## Core Functionality

- **Targeted Replacement:** Replaces specific, contiguous blocks of lines within a file.
- **Exact Matching:** The `SEARCH` block must *exactly* match the content in the file, including line breaks, indentation, and whitespace.
- **Multiple Edits:** Supports applying multiple, non-overlapping changes within a single file in one operation via multiple `SEARCH/REPLACE` blocks in the `diff` parameter.
- **Formatting Preservation:** Automatically preserves the indentation of the surrounding code when replacing content.
- **User Review:** Presents the proposed changes in a diff view for user confirmation before applying them to the file.

---

## Use Cases

This tool is best suited for:

- **Precise Code Modifications:** When you know the exact lines of code you want to replace.
- **Refactoring Specific Functions or Blocks:** Replacing an old implementation with a new one.
- **Applying Standardized Fixes:** Correcting specific, known code patterns or errors across multiple locations (though potentially requiring multiple tool calls if in different files).
- **Updating Configuration Snippets:** Replacing specific configuration blocks.

**Important:** If you are unsure about the exact content to search for, use the `read_file` tool first to get the precise lines, including indentation. For adding new content without replacing existing lines, use `insert_content`. For find-and-replace operations on smaller text fragments within lines, use `search_and_replace`. For overwriting an entire file, use `write_to_file`.

---

## Key Features

- **Exact Match Requirement:** Ensures changes are applied only where intended, reducing ambiguity.
- **Multi-Block Diffs:** Allows for efficient application of several distinct changes in one go.
- **Indentation Handling:** Automatically adjusts the indentation of the replacement block to match the context.
- **User Confirmation Step:** Provides a safety check by showing a diff preview before modifying the file.
- **`.rooignore` Compliance:** Checks if the target file is allowed to be modified based on `.rooignore` rules.

---

## Limitations

- **Requires Exact Match:** Cannot perform fuzzy matching. The `SEARCH` block must be identical to the file content.
- **Sensitive to Whitespace/Indentation:** Any difference in whitespace or indentation in the `SEARCH` block will cause the match to fail.
- **Contiguous Blocks Only:** Can only replace a single, continuous block of lines per `SEARCH/REPLACE` section. Cannot easily modify non-adjacent lines within a single block.
- **Potential for Conflicts:** If the file content has changed between reading it and applying the diff, the operation might fail.
- **No Overlapping Changes:** Multiple `SEARCH/REPLACE` blocks within a single `diff` parameter cannot target overlapping line ranges.

---

## Prerequisites

- The target file specified by `path` must exist.
- The content within the `<<<<<<< SEARCH` and `-------` markers in the `diff` parameter must exactly match the content in the file at the specified `:start_line:` and `:end_line:`.
- The user must approve the changes presented in the diff preview.

---

## How It Works (Workflow)

1.  **Parameter Validation:** Checks if `path` and `diff` parameters are provided.
2.  **`.rooignore` Check:** Verifies the `path` is not excluded by `.rooignore` rules.
3.  **Diff Parsing:** Parses the `diff` string to extract the `SEARCH` and `REPLACE` blocks, along with their corresponding `:start_line:` and `:end_line:` numbers.
4.  **File Reading:** Reads the content of the target file specified by `path`.
5.  **Content Verification:** For each `SEARCH` block:
    - Extracts the lines from the file content based on the provided `:start_line:` and `:end_line:`.
    - Compares these lines *exactly* against the content provided in the `SEARCH` block.
    - If any block fails verification, the entire operation is aborted before making changes.
6.  **Change Generation:** If all blocks verify, prepares the proposed modifications by replacing the verified `SEARCH` content with the corresponding `REPLACE` content.
7.  **User Interaction:** Displays the proposed changes in a diff view, highlighting the lines to be removed and added. Awaits user approval.
8.  **Change Application:** If the user approves, writes the modified content back to the file.
9.  **Feedback:** Reports success or failure (including reasons for failure, like verification errors or user rejection).

---

## Diff Format (`diff` Parameter)

The `diff` parameter uses a specific format to define search-and-replace operations. You can include multiple blocks in a single `diff` string.

```diff
<<<<<<< SEARCH
:start_line:[start_line_number]
:end_line:[end_line_number]
-------
[Exact content to find, including all whitespace and indentation]
=======
[New content to replace with. Indentation relative to the start of the line matters, but the tool adjusts overall indentation.]
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:[another_start_line]
:end_line:[another_end_line]
-------
[More exact content to find...]
=======
[More new content...]
>>>>>>> REPLACE
```

- **`:start_line:` (Required):** The 1-based line number where the `SEARCH` block begins in the original file.
- **`:end_line:` (Required):** The 1-based line number where the `SEARCH` block ends in the original file.
- **`-------`:** Separator between the start/end line markers and the `SEARCH` content.
- **`=======`:** Separator between the `SEARCH` content and the `REPLACE` content. There must be exactly one `=======` separator per block.
- **`<<<<<<< SEARCH` and `>>>>>>> REPLACE`:** Markers defining the start and end of a single search/replace operation block.

### Example Diff Block

Consider this original file content:

```javascript
// Original file snippet
function calculate(value) {
  // Old calculation logic
  const result = value * 0.9; // Apply 10% discount
  return result;
}

// Some other code...

const config = {
  timeout: 5000,
  retries: 3
};
```

To update the calculation logic (lines 3-5) and the timeout value (line 10), the `diff` parameter would look like this:

```diff
<<<<<<< SEARCH
:start_line:3
:end_line:5
-------
  // Old calculation logic
  const result = value * 0.9; // Apply 10% discount
  return result;
=======
  // Updated calculation logic with logging
  console.log(`Calculating for value: ${value}`);
  const result = value * 0.95; // Adjusted factor: 5% discount
  return result;
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:10
:end_line:10
-------
  timeout: 5000,
=======
  timeout: 10000, // Increased timeout
>>>>>>> REPLACE
```

**Conceptual Outcome:** After applying this diff and user approval, the file content would be updated to reflect the new calculation logic and the increased timeout value, while preserving the surrounding code and indentation.

---

## Related Concepts and Tools

- **`read_file`:** Use this tool first if you are unsure of the exact content or line numbers needed for the `SEARCH` block.
- **`insert_content`:** Use this tool to add new lines without replacing existing ones.
- **`search_and_replace`:** Use this tool for replacing smaller text fragments or using regular expressions for replacement, rather than replacing entire blocks of lines.
- **`write_to_file`:** Use this tool to overwrite the entire file content. Useful for creating new files or making very extensive changes where a diff is impractical.
