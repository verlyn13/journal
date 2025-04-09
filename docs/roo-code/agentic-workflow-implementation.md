---
title: "Implementing the Agentic Workflow with Roo Code"
description: "Details how Roo Code's tools, modes, and configurations can be used to implement the planned agentic workflow for the Flask Journal MVP."
category: "Usage Guides" # Or "Workflow Examples"
related_topics:
  - "Agentic Orchestration Plan" # Link back to the conceptual plan if possible/desired
  - "Tool Use Overview"
  - "Using Modes in Roo Code"
  - "Custom Modes"
  - "Custom Instructions"
  - "Prompt Engineering Tips"
version: "1.0"
tags: ["workflow", "agentic", "implementation", "strategy", "tools", "modes", "configuration", "mvp"]
---

# Implementing the Agentic Workflow with Roo Code

This document outlines how the specific features of Roo Code—its tools, modes, and configuration options—can be strategically employed to realize the **Agentic Orchestration Plan** for building the Flask Journal MVP. It bridges the gap between the conceptual workflow defined in the planning document and the practical application of Roo's capabilities.

## Aligning with Core Principles

The planned workflow emphasizes human oversight, strict scope control, and using Roo as an accelerator. Roo Code features directly support these principles:

-   **Human Oversight & Critical Review:** The mandatory **User Approval** step for tools that modify the system ([`write_to_file`](./write_to_file-tool.md), [`apply_diff`](./apply_diff-tool.md), [`execute_command`](./execute_command-tool.md), [`use_mcp_tool`](./use_mcp_tool.md), [`new_task`](./new_task-tool.md), [`switch_mode`](./switch_mode-tool.md)) ensures the Lead Developer acts as the quality gatekeeper. The interactive diff views provided by `write_to_file` and `apply_diff` facilitate the meticulous review process mandated in the workflow plan.
-   **Strict Scope Management:** [Custom Instructions](./custom-instructions.md) (global or mode-specific) can embed MVP constraints directly into Roo's system prompt. [Custom Modes](./custom-modes.md) can be designed with limited tool access or specific instructions reinforcing the "lean and mean" philosophy. Precise [Prompt Engineering](./prompt-engineering-tips.md) by the Lead Developer is key to defining narrow task scopes.
-   **Roo as Accelerator:** Roo handles boilerplate generation ([`write_to_file`](./write_to_file-tool.md)), applies targeted changes ([`apply_diff`](./apply_diff-tool.md)), gathers information ([`read_file`](./read_file-tool.md), [`list_files`](./list_files-tool.md), [`search_files`](./search_files-tool.md)), and executes routine commands ([`execute_command`](./execute_command-tool.md)), freeing up the Lead Developer for higher-level tasks, review, and testing.

## Implementing Roles with Roo Features

-   **Lead Developer / Architect (Human):**
    -   Selects appropriate **Modes** using the UI dropdown or slash commands ([Using Modes](./using-modes.md)).
    -   Crafts precise prompts using **Prompt Engineering** best practices and **Context Mentions** (`@`) ([Prompt Engineering Tips](./prompt-engineering-tips.md), [Context Mentions](./context-mentions.md)).
    -   Critically reviews proposed tool actions in the **User Approval UI** (including diff views).
    -   Approves/Rejects tool calls.
    -   Provides iterative feedback via chat prompts.
    -   Manages Git commits (potentially using `@git-changes` for context).
    -   Writes and reviews core test logic.
-   **Roo Code (AI Assistant):**
    -   Executes tasks based on prompts within the constraints of the active **Mode** ([Using Modes](./using-modes.md), [Custom Modes](./custom-modes.md)) and **Custom Instructions** ([Custom Instructions](./custom-instructions.md)).
    -   Utilizes its documented **Toolset** ([Tool Use Overview](./tool-use-overview.md)) as needed (e.g., `read_file`, `apply_diff`, `write_to_file`, `execute_command`).
    -   Asks clarifying questions via [`ask_followup_question`](./ask_followup_question-tool.md).
    -   Proposes actions (tool calls) for user approval.
    -   Signals task segment completion via [`attempt_completion`](./attempt_completion-tool.md).

## Mapping Workflow Steps to Roo Features

The general pattern for each detailed implementation step translates to Roo Code interactions as follows:

1.  **Task Definition (Lead Dev):** Human identifies the micro-task. Selects the appropriate **Mode** (e.g., `db-designer-mode`) via UI/slash command. Determines the primary tool needed (e.g., `write_to_file` for a new model).
2.  **Prompt Crafting (Lead Dev -> Roo):** Human writes a detailed prompt in the chat input, incorporating:
    -   Target tool (e.g., "using `write_to_file` for `path/to/file`...").
    -   Specific file paths using `@` mentions (e.g., `@app/models/base.py`).
    -   Clear requirements and MVP constraints.
    -   Reference to [Custom Instructions](./custom-instructions.md) implicitly guides Roo.
3.  **Roo Processing & Output (Roo -> Lead Dev):** Roo, operating in the selected mode:
    -   May use read tools ([`read_file`](./read_file-tool.md), [`list_files`](./list_files-tool.md)) for context.
    -   May use [`ask_followup_question`](./ask_followup_question-tool.md) if needed.
    -   Generates the tool call (e.g., `<write_to_file>...</write_to_file>`) and presents it for approval.
4.  **CRITICAL REVIEW (Lead Dev):** Human examines the proposed tool call in the **User Approval UI**.
    -   For `write_to_file`/`apply_diff`, reviews the **diff view** meticulously.
    -   For `execute_command`, reviews the exact **command string** and **cwd**.
    -   Checks against MVP scope, correctness, style (guided by Custom Instructions).
5.  **Iteration / Clarification (Lead Dev <-> Roo):** If review fails, Human **Rejects** the tool call and provides corrective feedback in the chat. Roo generates a revised tool call.
6.  **Application of Change (Roo or Lead Dev):**
    -   If satisfied, Human **Approves ("Save")** the tool call in the UI. Roo executes the tool.
    -   Alternatively, for maximum control, Human might Reject and manually apply the change based on Roo's reviewed suggestion.
7.  **Verification (Lead Dev / QA Role):** Human performs verification steps, potentially using Roo with `read_file` or `execute_command` (e.g., `execute_command` to run `flask db migrate`).
8.  **Testing (Lead Dev / QA Role):**
    -   Human prompts Roo (perhaps in a `test-writer-mode`) using `write_to_file` to generate test boilerplate.
    -   Human writes/reviews test logic.
    -   Human uses [`execute_command`](./execute_command-tool.md) to run tests (e.g., `pytest -k test_name`).
9.  **Commit (Lead Dev):** Human uses standard Git commands, potentially aided by `@git-changes` context for commit messages.

## Tool Usage Strategy within Roo

This section maps the workflow's tool recommendations to specific Roo documentation:

-   **[`write_to_file`](./write_to_file-tool.md):** Primarily for creating *new* files (skeletons, configs). Requires full content review in the diff view.
-   **[`apply_diff`](./apply_diff-tool.md):** The preferred tool for *modifying existing* files. Aligns with the **[Fast Edits](./fast-edits.md)** mechanism when enabled. Requires careful review of search/replace blocks.
-   **Read Tools** ([`list_files`](./list_files-tool.md), [`read_file`](./read_file-tool.md), [`list_code_definition_names`](./list_code_definition_names-tool.md), [`search_files`](./search_files-tool.md)): Used by Roo internally for context or explicitly prompted by the Lead Dev for analysis before modification.
-   **[`execute_command`](./execute_command-tool.md):** Use cautiously for safe, well-understood commands (`pip install`, `flask db`, `pytest`, `git status`). Review the exact command string before approval.
-   **[`ask_followup_question`](./ask_followup_question-tool.md):** Facilitates clarification between the Lead Dev and Roo.
-   **[`new_task`](./new_task-tool.md):** Reserved for significant context/mode shifts, less likely needed for the linear MVP workflow but available if a deep dive (like debugging) is required temporarily. See [Boomerang Tasks](./boomerang-tasks.md).
-   **[`attempt_completion`](./attempt_completion-tool.md):** Roo signals the end of its part in a micro-task, prompting the Lead Dev's review/verification.
-   **MCP Tools** ([`access_mcp_resource`](./access_mcp-tool.md), [`use_mcp_tool`](./use_mcp_tool.md)): Not planned for use in this MVP workflow.

## Configuration Strategy with Roo

-   **[Custom Instructions](./custom-instructions.md):** Define project-wide standards (via `.roorules`) or mode-specific guidelines (via `.roorules-[mode]` or Prompts Tab) to enforce coding styles, MVP constraints, and the "lean" philosophy.
-   **[Custom Modes](./custom-modes.md):** Define the specialized modes (`flask-lead-architect`, `db-designer-mode`, etc.) via `.roomodes` file in the project root. Configure each mode with:
    -   A clear `roleDefinition`.
    -   Appropriate `customInstructions`.
    -   Restricted `groups` (tool access) – e.g., `db-designer-mode` might only need Read and Edit tools, not Command execution.

## Conclusion

Roo Code's features provide the necessary building blocks to implement the planned agentic workflow. By strategically using specific tools, configuring custom modes and instructions, leveraging context mentions, and adhering to a rigorous human review process, the Lead Developer can effectively guide Roo to accelerate the development of the Flask Journal MVP while maintaining quality and control.