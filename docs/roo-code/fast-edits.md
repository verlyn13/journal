---
title: "Enhance Prompt & Fast Edits Mechanism"
description: "Explains the 'Enhance Prompt' feature for refining user input and the 'Fast Edits' mechanism (diff-based file updates) for efficient file modifications."
category: "Features & Concepts"
related_topics:
  - "User Interface"
  - "Configuration"
  - "apply_diff Tool"
  - "write_to_file Tool"
  - "Prompt Engineering"
version: "1.0"
tags: ["enhance prompt", "fast edits", "diff", "configuration", "prompting", "efficiency", "file editing"]
---

# Enhance Prompt & Fast Edits Mechanism

This document provides an overview of two distinct features in Roo Code designed to improve workflow efficiency and accuracy:

1.  **Enhance Prompt:** A user-facing feature to automatically refine chat prompts before sending them to the AI.
2.  **Fast Edits Mechanism:** An internal behavior, controlled by settings, that influences how Roo applies changes to files, preferring efficient diff-based updates over full file rewrites.

---

## Enhance Prompt Feature

The **Enhance Prompt** feature helps improve the quality and effectiveness of your instructions to Roo *before* they are processed. By clicking the dedicated **✨ icon** in the chat input area, Roo automatically analyzes and refines your initial request, aiming to make it clearer, more specific, and better contextualized for the AI model.

### Why Use Enhance Prompt?

- **Improved Clarity:** Rephrases potentially ambiguous requests for better AI comprehension.
- **Context Injection:** Can automatically add relevant context, like the currently open file path or selected code snippet, to your prompt.
- **Instruction Refinement:** May add implicit instructions based on the context, such as requesting specific output formats or adherence to project standards.
- **Reduced Ambiguity:** Helps ensure Roo accurately understands your intent, leading to more relevant responses and actions.
- **Prompt Consistency:** Encourages a more structured prompt format, potentially leading to more predictable AI behavior.

### How to Use Enhance Prompt

1.  **Type Initial Prompt:** Enter your request in the Roo chat input box.
2.  **Click Enhance Icon:** Instead of sending immediately, click the **✨ icon** (typically located in the bottom right of the input box).
3.  **Review Enhanced Prompt:** Roo replaces your text with the refined version. Carefully review it to ensure it still accurately reflects your goal. You can edit it further if needed.
4.  **Send Prompt:** Press Enter or click the Send icon to submit the (potentially edited) enhanced prompt.

### Customizing the Enhancement Process

The enhancement itself uses an AI call based on a configurable template:

1.  **Open Prompts Tab:** Click the icon in the Roo Code top menu bar.
2.  **Select "ENHANCE" Tab:** Navigate to the "ENHANCE" support prompt configuration.
3.  **Edit Template:** Modify the text in the "Prompt" field. The `${userInput}` placeholder represents your original typed text. Adjust the surrounding template to guide how your prompts are enhanced (e.g., "Rewrite the following user request to be clearer and include relevant context: ${userInput}").
4.  **Configure API (Optional):** Use the "API Configuration" dropdown on the same tab to select a specific AI provider/model for the enhancement process itself, if you want it to differ from the main chat configuration.

### Limitations and Best Practices

- **Experimental:** The quality of enhancement depends on your input, the template, and the AI model used. Results may vary.
- **Review is Crucial:** *Always* review the enhanced prompt before sending. Ensure it hasn't misinterpreted your intent.
- **Iterative Use:** You can apply enhancement multiple times if desired.
- **Not a Substitute for Clarity:** While helpful, it works best when starting with a reasonably clear initial prompt. It's not a magic fix for extremely vague requests.

---

## Fast Edits Mechanism (Diff-Based File Updates)

**Fast Edits** refers to Roo's preferred method for modifying files, which prioritizes using diff-based tools like [`apply_diff`](./apply_diff-tool.md) instead of rewriting entire files with [`write_to_file`](./write_to_file-tool.md). This mechanism is controlled by user settings and aims to improve speed and safety.

### "Enable Editing Through Diffs" Setting

This setting directly controls the Fast Edits behavior:

1.  **Location:** Settings (Gear icon) -> Advanced section.
2.  **Enabled (Default):**
    - Roo will *prefer* to use tools like `apply_diff` when modifying existing files. It analyzes the requested change and generates a diff to apply.
    - **Benefits:** Generally faster execution, lower token usage (as only the change is processed, not the whole file), and includes safeguards against applying changes to the wrong location (see Match Precision).
    - **Truncation Prevention:** This mode often includes checks to ensure the AI provides complete diffs, reducing the risk of file corruption from incomplete patches.
3.  **Disabled:**
    - Roo will primarily rely on the [`write_to_file`](./write_to_file-tool.md) tool, rewriting the entire file content even for small changes.
    - **Drawbacks:** Can be significantly slower, consumes more tokens, and bypasses some safety checks inherent in diff application.

### "Match Precision" Setting

This slider, relevant when "Enable editing through diffs" is active, controls the tolerance for applying diffs when the context found in the file doesn't *exactly* match what the AI expected:

1.  **Location:** Settings (Gear icon) -> Advanced section (usually near the "Enable editing through diffs" toggle).
2.  **100% (Default):** Requires an *exact* match between the `SEARCH` block of the diff (provided by the AI) and the actual content in the file at the specified lines. This is the safest option, minimizing the risk of applying a change in the wrong place.
3.  **Lower Values (e.g., 80%-99%):** Enables "fuzzy matching." Roo (using the underlying logic of `apply_diff`) will attempt to apply the diff even if the content in the file has minor differences from the `SEARCH` block (e.g., whitespace changes, small edits).
    - **Use with Caution:** Lowering precision increases the risk of applying a patch incorrectly if the code has changed significantly or if similar-looking code exists elsewhere. Always carefully review changes made with fuzzy matching enabled.
    - **Mechanism:** This adjusts an internal threshold (e.g., `fuzzyMatchThreshold`) often using algorithms like Levenshtein distance to calculate similarity.

---

By understanding and utilizing the **Enhance Prompt** feature and configuring the **Fast Edits Mechanism** appropriately, you can streamline your interactions with Roo, leading to clearer instructions, faster execution, and more reliable file modifications.
