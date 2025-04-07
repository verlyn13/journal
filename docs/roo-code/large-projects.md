---
title: "Working with Large Projects"
description: "Provides strategies and best practices for effectively using Roo Code with large codebases, focusing on managing context window limitations."
category: "Usage Guides"
related_topics:
  - "Context Management"
  - "Prompt Engineering"
  - "Boomerang Tasks" # For task breakdown
  - "list_code_definition_names Tool" # For code overview
  - "Tool Usage Overview" # Mentions context symbols like @
version: "1.0"
tags: ["large projects", "context window", "tokens", "performance", "efficiency", "codebase management", "context mentions"]
---

# Working with Large Projects

Roo Code is designed to work with projects of all sizes. However, effectively interacting with large codebases requires specific strategies to manage the context provided to the underlying Large Language Models (LLMs). This guide outlines best practices for maintaining focus and achieving accurate results in complex projects.

---

## Understanding Context Limits

LLMs operate within a finite **context window**, which is the maximum amount of text (measured in tokens, roughly corresponding to words or parts of words) the model can consider simultaneously when processing a request and generating a response.

### What Contributes to Context?

The context window typically includes:

- **System Prompt:** Core instructions defining Roo's role, capabilities, and custom instructions.
- **Conversation History:** Recent messages exchanged between you and Roo. Older messages might be truncated if the limit is reached.
- **Referenced File Content:** Content from files explicitly included using context mentions (e.g., `@/path/to/file.py`).
- **Tool Outputs:** Results from tools used during the conversation (e.g., output from `list_files` or `execute_command`).
- **Your Current Prompt:** The instruction you just provided.

Exceeding the context window can lead to the model "forgetting" earlier parts of the conversation or referenced information, resulting in less accurate or incomplete responses.

---

## Strategies for Managing Context in Large Projects

Employ these techniques to keep the context focused and relevant:

### 1. Be Specific with Requests and References

- **Precise Paths:** Always use exact, relative file paths (e.g., `@src/services/auth_service.ts`) instead of vague descriptions ("the auth file").
- **Targeted Code:** Refer to specific functions, classes, or methods by name when possible (e.g., "Refactor the `calculate_totals` function in `@utils/calculations.py`").

### 2. Utilize Context Mentions Effectively

Leverage Roo's context mention syntax (using the `@` symbol) strategically:

- **Include Specific Files:** `@/path/to/relevant/file.ext` brings the content of that file into context. Use sparingly and only include files directly relevant to the current task.
- **Reference Problems:** `@problems` includes current errors and warnings from the editor's diagnostics, useful for debugging tasks.
- **Reference Git Commits:** `@commit-hash` (replace `commit-hash` with an actual hash) can reference changes introduced in a specific commit.
- *(Refer to the [Tool Usage Overview](./tool-use-overview.md) or relevant UI tooltips for a full list of available context mention types.)*

### 3. Break Down Complex Tasks

- **Subtasking:** Divide large goals (e.g., "Implement user profile feature") into smaller, sequential sub-tasks ("Design profile schema", "Create API endpoint", "Build UI component"). This keeps the context for each step manageable.
- **Boomerang Tasks:** For complex workflows involving multiple steps or different areas of expertise, consider using the [Boomerang Task](./boomerang-tasks.md) pattern to delegate subtasks to specialized modes, each with its own focused context.

### 4. Summarize Instead of Including Full Files

- **Manual Summaries:** If only a small part of a large file is relevant, describe or paste just that relevant snippet into your prompt instead of using `@` to include the entire file.
- **Request Summaries:** Ask Roo to summarize a file first before asking detailed questions about it (e.g., "Summarize the main purpose of `@src/core/event_handler.rs`").

### 5. Refresh Important Context

- **Reiterate Key Information:** Since older parts of the conversation might fall out of the context window, restate critical requirements or decisions if they are essential for the current step, especially in long conversations.

### 6. Leverage Caching (Where Available)

- **API Provider Caching:** Some LLM API providers (check your specific provider's documentation) support prompt caching. This can reduce latency and cost for repeated or similar requests by reusing parts of the cached prompt/response, indirectly helping manage context costs. Roo Code may leverage this feature if supported by the configured API provider.

---

## Example: Refactoring a Function in a Large File

Imagine you need to refactor a specific function within a large, complex component file (`src/components/UserProfileDashboard.jsx`).

1.  **Get an Overview (Optional but Recommended):** Use a tool to understand the file structure without loading the whole file into context immediately.
    ```
    # Request using list_code_definition_names tool
    # (Conceptual - actual tool call might differ based on mode)
    List the main functions/components defined in `src/components/UserProfileDashboard.jsx`.
    ```
    *(Alternatively, use the [`list_code_definition_names`](./list_code_definition_names-tool.md) tool if available in your mode).*

2.  **Target the Specific Function:** Focus the request on the function needing changes, referencing the file.
    ```
    In @src/components/UserProfileDashboard.jsx, refactor the `fetchUserData` function. It currently uses `.then()` chains; please update it to use `async/await` syntax for better readability.
    ```

3.  **Iterate on the Change:** Roo proposes the change (likely using `apply_diff`). Review the diff carefully.
    ```
    # Roo proposes a diff for fetchUserData
    # User reviews and approves/rejects/provides feedback
    ```

4.  **Address Related Code (If Necessary):** If the refactoring affects how `fetchUserData` is called elsewhere *within the same file*, address that in a subsequent, focused request.
    ```
    In @src/components/UserProfileDashboard.jsx, update the call to `fetchUserData` within the `useEffect` hook to correctly handle the new async function (e.g., ensure it's awaited or handled appropriately).
    ```

By breaking the task down (overview -> refactor function -> update call site) and using specific references (`@path/to/file`, function names), you keep the context relevant to each step, enabling Roo to work effectively even within a large file.
