---
title: "new_task Tool Reference"
description: "Creates a new subtask, pausing the current (parent) task and starting the subtask in a specified mode with initial instructions."
category: "Tool Reference"
related_topics:
  - "Boomerang Tasks"
  - "Custom Modes"
  - "Task Management"
  - "attempt_completion Tool"
version: "1.0"
tags: ["subtask", "new task", "delegation", "orchestration", "workflow", "task management", "mode switching"]
---

# new_task Tool Reference

The `new_task` tool is the core mechanism for implementing the **[Boomerang Task](./boomerang-tasks.md)** pattern. It allows an active Roo task (the parent) to create and delegate work to a new, separate task (the child or subtask). The parent task is paused while the subtask runs, typically in a different, specialized mode. Upon completion, the subtask's result is returned to the parent, which then resumes.

---

## Parameters

The tool requires the following parameters:

| Parameter | Data Type | Required | Default | Description                                                                                                                                                                                             |
|-----------|-----------|----------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mode`    | String    | Yes      | N/A     | The **slug** (unique identifier, e.g., `code`, `architect`, `docs-writer`) of the mode in which the new subtask should run. This mode must exist (either built-in or custom).                               |
| `message` | String    | Yes      | N/A     | The initial prompt or set of instructions for the new subtask. This message *must* contain all necessary context from the parent task, as the subtask runs in isolation and does not inherit history. |

---

## Core Functionality

- **Subtask Creation:** Instantiates a new, independent Roo task instance.
- **Mode Specialization:** Starts the new subtask in the specified `mode`, leveraging that mode's unique role definition, instructions, and tool access.
- **Context Isolation:** The subtask operates with its own separate conversation history and context window. It does *not* see the parent task's history.
- **Parent Task Pausing:** Automatically pauses the current (parent) task when the subtask is created.
- **Workflow Orchestration:** Enables breaking down complex problems into smaller, manageable steps, each handled by the most appropriate mode.

---

## Prerequisites

- **Mode Existence:** The `mode` specified by its slug must be a valid, existing mode (either built-in or a defined [Custom Mode](./custom-modes.md)). Attempting to use a non-existent mode slug will result in an error.
- **User Approval:** By default, the user must explicitly approve the creation of the new task when prompted by Roo. This can be configured in user settings (Auto-Approving Actions).
- **Clear Instructions (`message`):** The `message` parameter must provide sufficient context and clear instructions for the subtask to perform its work successfully in isolation.

---

## Use Cases

This tool is primarily used by orchestrator modes (like the example "Boomerang Mode") or in scenarios requiring structured task delegation:

- **Implementing Boomerang Tasks:** The fundamental tool for delegating work in the [Boomerang Task](./boomerang-tasks.md) pattern.
- **Phase-Based Workflows:** Separating distinct phases of a project (e.g., design -> implement -> document -> test) into subtasks run by appropriate modes (`architect` -> `code` -> `ask` -> `code`/`debug`).
- **Complex Problem Decomposition:** Breaking a large, multifaceted request into smaller, focused sub-problems that can be solved independently.
- **Maintaining Parent Task Clarity:** Keeping the parent task's history focused on high-level orchestration by offloading detailed execution steps to subtasks.

---

## Key Features

- **Isolated Contexts:** Ensures subtasks don't interfere with each other or the parent's context window.
- **Task Stack Management:** Roo manages the stack of paused parent tasks and the active subtask.
- **Mode Switching:** Seamlessly transitions execution to the specified mode for the subtask.
- **Result Propagation:** When a subtask completes using [`attempt_completion`](./attempt_completion-tool.md), its `result` summary is passed back to the resuming parent task.

---

## Limitations

- **Requires Existing Mode:** Cannot create tasks for modes that haven't been defined.
- **User Approval Step:** Adds an interaction step unless auto-approval is enabled.
- **Context Transfer is Manual:** All necessary information must be explicitly passed *down* via the `message` parameter and *up* via the subtask's final `result`. There is no automatic context inheritance.
- **Potential for Deep Nesting:** While possible, creating deeply nested subtasks (subtasks creating subtasks) can become complex to manage and track.

---

## How It Works (Simplified Workflow)

1.  **Tool Invocation:** The parent task calls `new_task` with a target `mode` and initial `message`.
2.  **Parameter & Mode Validation:** Checks if `mode` and `message` are provided and verifies that the specified `mode` slug corresponds to an existing mode definition.
3.  **User Approval:** Prompts the user to confirm the creation of the new subtask in the specified mode.
4.  **Parent Task Pause:** If approved, the current (parent) task's state is saved, and it is marked as paused.
5.  **Subtask Initialization:**
    - A new task instance is created with a unique ID.
    - The specified `mode` is loaded.
    - The provided `message` becomes the first message in the subtask's conversation history.
6.  **Subtask Execution:** The new subtask becomes the active task, and Roo begins processing its initial `message` within the context of the specified `mode`.
7.  **(Later) Subtask Completion:** The subtask eventually finishes, typically by calling [`attempt_completion`](./attempt_completion-tool.md).
8.  **Result Transfer & Parent Resumption:** The `result` from the subtask's completion is recorded. The subtask is closed. The parent task is reactivated, receives the subtask's result as input/context, and resumes execution.

---

## Usage Examples

### Example 1: Delegating Implementation to `code` Mode

*(Scenario: An `architect` mode task has just designed a feature)*
**Tool Call (from `architect` mode):**
```xml
<new_task>
  <mode>code</mode>
  <message>
Implement the login API endpoint based on the following specification:
- Endpoint: POST /api/auth/login
- Accepts: { email, password }
- Returns: { userId, token } on success, error message on failure.
- Use bcrypt for password hashing comparison.
Reference file: @src/models/User.ts
Target file for implementation: src/controllers/authController.ts
Ensure proper error handling for invalid credentials or database errors.
Use `attempt_completion` with a summary when done.
  </message>
</new_task>
```
**Conceptual Outcome:** The `architect` task pauses. A new task starts in `code` mode with the detailed implementation instructions. The user approves. The `code` mode task works on the implementation and eventually uses `attempt_completion`. The `architect` task resumes, receiving the summary (e.g., "Implemented login endpoint in authController.ts").

### Example 2: Requesting Documentation Generation

*(Scenario: A `code` mode task has just finished implementing a feature)*
**Tool Call (from `code` mode):**
```xml
<new_task>
  <mode>ask</mode> <!-- Assuming 'ask' or a custom 'docs' mode is suited for writing -->
  <message>
Generate Markdown documentation for the new user profile feature. Key aspects to cover:
- API endpoints: GET /api/profile, PUT /api/profile
- Data structure for profile object.
- Authentication requirements (user must be logged in).
Relevant files: @src/controllers/profileController.ts, @src/models/Profile.ts
Focus on clear explanations for developers using this API.
Use `attempt_completion` with the generated Markdown content in the result when finished.
  </message>
</new_task>
```
**Conceptual Outcome:** The `code` task pauses. A new task starts in `ask` (or `docs`) mode with the documentation request. After user approval, it generates the documentation and completes. The `code` task resumes, receiving the documentation content in the result summary.
