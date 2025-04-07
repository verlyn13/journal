---
title: "Tool Use Overview"
description: "Explains Roo Code's tool system, how tools are categorized, accessed based on modes, and best practices for their use."
category: "Core Concepts"
related_topics:
  - "Modes"
  - "Custom Modes"
  - "Prompt Engineering Tips"
  # Add links to individual tool docs implicitly via the list below
version: "1.0"
tags: ["tools", "tool usage", "capabilities", "modes", "permissions", "workflow"]
---

# Tool Use Overview

Roo Code utilizes a system of **Tools** to interact with your development environment, perform actions, and gather information. These tools allow Roo to read and write files, execute commands, search code, manage tasks, and more, acting as its hands and eyes within your project. Understanding how tools work is key to collaborating effectively with Roo.

---

## Available Tools & Categories

Tools are generally grouped by their primary function. Access to these tools is typically determined by the active [Mode](./custom-modes.md).

### File System & Code Analysis (Read Group)

Tools for exploring and understanding your project files and code structure.

- **[`list_files`](./list_files-tool.md):** Lists files and directories at a specified path (optionally recursive).
- **[`read_file`](./read_file-tool.md):** Reads the content of a specific file, supporting line ranges and some special formats (PDF, DOCX).
- **[`search_files`](./search_files-tool.md):** Performs recursive regex searches across files, returning matches with context.
- **[`list_code_definition_names`](./list_code_definition_names-tool.md):** Scans source files in a directory (non-recursively) to list top-level definitions (classes, functions, etc.).

### File System Modification (Edit Group)

Tools for changing file content. Access is often restricted by mode.

- **[`apply_diff`](./apply_diff-tool.md):** Applies precise, targeted changes to existing files using a search/replace block format. Preferred for modifications.
- **[`write_to_file`](./write_to_file-tool.md):** Creates new files or completely overwrites existing ones. Use with caution on existing files; `apply_diff` or `insert_content` are often better.
- **[`insert_content`](#):** (Documentation link needed if available) Inserts new lines of content into a file at a specific location without overwriting existing lines. Ideal for adding functions, imports, etc.
- **[`search_and_replace`](#):** (Documentation link needed if available) Performs find-and-replace operations within a file, supporting text or regex patterns. Useful for smaller, targeted text changes within lines.

### Command Execution (Command Group)

Tools for running shell commands.

- **[`execute_command`](./execute_command-tool.md):** Executes CLI commands on the user's system (requires user approval).

### Model Context Protocol (MCP Group)

Tools for interacting with external systems via the MCP standard.

- **[`access_mcp_resource`](./access_mcp-tool.md):** Retrieves data (read-only) from resources exposed by connected MCP servers.
- **[`use_mcp_tool`](./use_mcp_tool.md):** Executes actions or operations exposed by tools on connected MCP servers.

### Browser Automation (Browser Group)

Tools for interacting with web browsers (details may vary based on specific implementation).

- **`browser_action`:** (Documentation link needed if available) Performs actions within a web browser instance.

### Workflow & Interaction Management (Always Available)

These essential tools manage the flow of the conversation and task execution. They are generally available in *all* modes.

- **[`ask_followup_question`](./ask_followup_question-tool.md):** Allows Roo to ask the user for clarification or additional information.
- **[`attempt_completion`](./attempt_completion-tool.md):** Used by Roo to signal that it believes the task is complete and present the results.
- **[`switch_mode`](./switch_mode-tool.md):** Requests a change to a different operational mode *within the current task*.
- **[`new_task`](./new_task-tool.md):** Creates a *new subtask* (pausing the current one), often starting in a different mode (part of the [Boomerang Task](./boomerang-tasks.md) pattern).

---

## How Tool Access is Controlled: Modes

The primary way Roo determines which tools it can use is through the active **Mode**.

- **Built-in Modes:** Modes like `code`, `architect`, `ask`, and `debug` come with pre-configured sets of allowed tool groups. For example:
    - `code` mode typically has access to Read, Edit, and Command tools.
    - `architect` mode might only have Read access and Edit access restricted to Markdown files.
    - `ask` mode might primarily have Read access.
- **[Custom Modes](./custom-modes.md):** You can define custom modes with specific tool group permissions and file restrictions, tailoring capabilities precisely to a task or workflow.
- **Always Available Tools:** As noted above, workflow management tools are generally accessible regardless of the mode's specific tool group configuration.

When Roo attempts to use a tool, the system checks if that tool (or its group) is permitted by the currently active mode. If not, the action is blocked.

---

## How Tools Are Called

1.  **AI Decision:** Based on your prompt and the current context, the AI model decides which action is needed next to progress the task. If that action requires interacting with the environment, it formulates a tool call.
2.  **Tool Call Formulation:** The AI generates the tool call in a specific format (typically XML-like), specifying the tool name and required parameters.
3.  **System Interception:** Roo Code intercepts this generated tool call.
4.  **Validation & Permission Check:** The system validates the tool name, parameters, and checks if the active mode permits the use of this tool (and respects file restrictions, `.rooignore` rules, etc.).
5.  **User Approval (Usually Required):** For most tools that modify files, execute commands, or access external resources, Roo Code presents the intended tool call and parameters to you for explicit approval. Read-only tools like `list_files` or `read_file` may sometimes be auto-approved depending on settings.
6.  **Execution:** If approved (or auto-approved), the system executes the tool's function.
7.  **Result Return:** The tool's output (e.g., file content, command output, success/error message) is captured.
8.  **AI Processing:** The result is formatted and sent back to the AI model as context for it to determine the next step.

---

## Best Practices for Tool Usage (Prompting Roo)

While Roo decides *which* tool to use, you can influence this through effective prompting:

- **Be Specific:** Clear, unambiguous requests make it easier for Roo to choose the correct tool and parameters. (See [Prompt Engineering Tips](./prompt-engineering-tips.md)).
- **Provide Context:** Use `@` mentions for files (`@/path/to/file`) or problems (`@problems`) so Roo knows what to operate on.
- **Suggest Actions (Implicitly):** Phrasing like "Read the contents of `config.yaml`" guides Roo towards `read_file`. "Refactor the `getUser` function in `auth.ts`" guides it towards analysis (`read_file`) and modification (`apply_diff`). "Run the unit tests" guides it towards `execute_command`.
- **Break Down Tasks:** Complex goals requiring multiple tool uses should be broken into smaller steps in your prompts.

---

## Error Handling

If a tool call fails (due to invalid parameters, permissions errors, file not found, command errors, user rejection, etc.), Roo receives an error message instead of the expected result. It should then ideally:

- Report the error to you.
- Potentially ask for clarification using `ask_followup_question`.
- Attempt a different approach or tool if applicable.
- Avoid retrying the exact same failing tool call without modification or further information.
