---
title: "How Tools Work: An Introduction"
description: "A basic introduction to how Roo Code uses tools to interact with your development environment, including the workflow and user approval process."
category: "Getting Started" # Or "Core Concepts"
related_topics:
  - "Tool Use Overview"
  - "Prompt Engineering Tips"
  - "Modes"
version: "1.0"
tags: ["tools", "introduction", "workflow", "user approval", "getting started"]
---

# How Tools Work: An Introduction

Roo Code uses **Tools** as specialized helpers to interact with your code and development environment. Think of them as Roo's capabilities for performing actions like reading files, making edits, running commands, or searching your codebase. This system allows Roo to automate common development tasks based on your instructions.

---

## The Basic Tool Workflow

When you ask Roo to perform a task that requires interacting with your project (like modifying a file or running a command), the typical workflow is:

1.  **User Request:** You provide instructions in natural language (e.g., "Create a file named `config.json` with default settings").
2.  **AI Tool Selection:** Roo analyzes your request and determines the most appropriate tool to use (e.g., `write_to_file`).
3.  **Tool Proposal & User Review:** Roo presents the selected tool and the specific parameters it intends to use (e.g., the file path and content for `write_to_file`). This is shown in an interactive interface.
4.  **User Approval:** You review the proposed action and parameters. You must explicitly approve it (e.g., by clicking "Save" or similar).
5.  **Execution:** Once approved, Roo executes the tool with the specified parameters.
6.  **Result Display:** Roo shows you the outcome of the tool execution (e.g., "File saved successfully" or any error messages).
7.  **Continuation:** Roo uses the result to continue the task or signals completion if the task is finished.

---

## Why User Approval is Important

Most tool actions require your explicit approval before execution. This crucial safety step ensures you maintain full control over:

- Which files are created or modified.
- What content is written to files.
- Which commands are executed on your system.

When Roo proposes a tool action, you will typically see options to:

- **Approve ("Save"):** Execute the tool as proposed (or after your edits in the diff view).
- **Reject:** Cancel the proposed tool action.
- **Edit (for some tools like `write_to_file`):** Modify the proposed parameters (e.g., file content) before approving.

Always review tool proposals carefully before approving them. You may also have options in settings to auto-approve certain trusted or low-risk actions.

---

## Overview of Tool Categories

Tools are broadly categorized by their function:

- **Read:** Accessing file content and understanding code structure (e.g., reading files, listing directories, searching code).
- **Edit:** Creating or modifying files (e.g., writing new files, applying changes to existing ones).
- **Execute:** Running commands in the terminal (e.g., installing dependencies, running scripts).
- **Workflow:** Managing the conversation flow, tasks, and modes (e.g., asking questions, switching modes, creating subtasks).
- **Other:** Specialized categories like Browser interaction or MCP integration may also exist.

The specific tools available depend on the active [Mode](./custom-modes.md).

---

## Quick Reference: Common Tools

Here are some of the frequently used tools:

| Tool Name                                       | Brief Description                                        | Category |
|-------------------------------------------------|----------------------------------------------------------|----------|
| [`read_file`](./read_file-tool.md)                | Reads the content of a file with line numbers            | Read     |
| [`search_files`](./search_files-tool.md)            | Searches for text or regex patterns across files         | Read     |
| [`list_files`](./list_files-tool.md)                | Lists files and directories in a specified location      | Read     |
| [`list_code_definition_names`](./list_code_definition_names-tool.md) | Lists code definitions like classes and functions        | Read     |
| [`write_to_file`](./write_to_file-tool.md)           | Creates new files or overwrites existing ones            | Edit     |
| [`apply_diff`](./apply_diff-tool.md)              | Makes precise changes to specific parts of a file        | Edit     |
| [`execute_command`](./execute_command-tool.md)       | Runs commands in the VS Code terminal                    | Execute  |
| [`ask_followup_question`](./ask_followup_question-tool.md) | Asks you a clarifying question                           | Workflow |
| [`attempt_completion`](./attempt_completion-tool.md)    | Indicates the task is complete                           | Workflow |
| [`switch_mode`](./switch_mode-tool.md)             | Changes to a different operational mode                  | Workflow |
| [`new_task`](./new_task-tool.md)                  | Creates a new subtask with a specific starting mode      | Workflow |

*(This is not an exhaustive list. See the Tool Use Overview for more details).*

---

## Learn More

For a more comprehensive explanation of the tool system, including detailed descriptions of all tools, mode-based access control, and advanced concepts, please refer to the **[Tool Use Overview](./tool-use-overview.md)** documentation.
