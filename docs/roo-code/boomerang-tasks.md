---
title: "Boomerang Tasks: Orchestrating Complex Workflows"
description: "Explains how to use subtasks (Boomerang Tasks) and the `new_task` tool to break down complex projects and delegate work to specialized Roo modes."
category: "Workflow Concepts"
related_topics:
  - "Custom Modes"
  - "new_task Tool"
  - "attempt_completion Tool"
  - "Task Management"
version: "1.0"
tags: ["subtask", "orchestration", "workflow", "delegation", "new_task", "custom mode"]
---

# Boomerang Tasks: Orchestrate Complex Workflows

Boomerang Tasks (also known as subtasks or task orchestration) provide a powerful mechanism to break down complex projects into smaller, manageable pieces. This pattern allows a primary task, often managed by a dedicated orchestrator mode, to delegate specific parts of the work to other, specialized Roo modes (like `code`, `architect`, or `debug`). Each subtask runs in its own isolated context.

---

## Overview: Concept vs. Custom Mode

It's important to distinguish between:

1.  **Boomerang Task (Concept):** The general pattern of creating a subtask using the `new_task` tool to delegate work, having it complete using `attempt_completion`, and resuming the parent task with the results. This pattern can potentially be initiated by various modes if they have access to the `new_task` tool.
2.  **Boomerang Mode (Example):** A specific *custom mode* designed explicitly for orchestration. This mode's primary function is to analyze complex requests, break them into subtasks, and delegate them using `new_task`. Instructions for setting up an example "Boomerang Mode" are provided below.

For more details on creating custom modes in general, see the [Custom Modes](./custom-modes.md) documentation.

---

## Why Use Boomerang Tasks?

Employing the Boomerang Task pattern offers several advantages:

- **Tackle Complexity:** Break large, multi-step projects (e.g., "build a new user authentication feature") into focused subtasks (e.g., "design database schema", "implement login API endpoint", "write frontend login form", "document authentication flow").
- **Leverage Specialization:** Delegate each subtask to the mode best suited for that specific job (e.g., `architect` for design, `code` for implementation, `ask` for documentation outlining).
- **Maintain Focus & Efficiency:** Each subtask operates with its own isolated conversation history. This keeps the parent (orchestrator) task's history clean and focused on the high-level workflow, free from the clutter of detailed code diffs or file analysis from subtasks.
- **Streamline Workflows:** The result summary from one subtask (provided via `attempt_completion`) can be used as input context for the next subtask (passed via the `message` parameter in `new_task`), creating a smooth, automated flow.

---

## How the Pattern Works

The Boomerang Task workflow typically follows these steps:

1.  **Task Decomposition:** An orchestrating task (often in a custom "Boomerang Mode") analyzes a complex user request and identifies a logical piece of work that can be delegated.
2.  **Delegation (`new_task`):** The orchestrator uses the [`new_task`](./new_task-tool.md) tool to create a subtask.
    - It specifies the appropriate `mode` for the subtask (e.g., `code`).
    - It provides detailed instructions and necessary context in the `message` parameter, clearly defining the subtask's scope and expected outcome.
3.  **Subtask Execution:** The parent task pauses. The new subtask starts in the specified mode and works towards its defined goal, potentially using various tools within its isolated context.
4.  **Subtask Completion (`attempt_completion`):** Once the subtask's goal is achieved, it uses the [`attempt_completion`](./attempt_completion-tool.md) tool.
    - It provides a concise yet comprehensive summary of its accomplishments and outcome in the `result` parameter.
5.  **Resuming the Parent Task:** The subtask closes, and the parent (orchestrator) task resumes. It receives *only the final `result` summary* from the completed subtask.
6.  **Workflow Continuation:** The orchestrator analyzes the subtask's result and determines the next step, potentially delegating another subtask or completing the overall workflow.

---

## Key Considerations

- **User Approval:** By default, the user must approve the creation of a new task via `new_task` and often the completion via `attempt_completion` (especially if it includes a command). This behavior can be modified in user settings (Auto-Approving Actions).
- **Context Isolation and Transfer:**
    - **Isolation:** Subtasks are completely separate. They do not share memory, state, or conversation history with the parent or sibling tasks beyond what is explicitly passed.
    - **Explicit Transfer:** Information transfer only happens at two points:
        - **Parent to Child:** Via the initial `message` parameter of the `new_task` tool call. This must contain *all* context the subtask needs.
        - **Child to Parent:** Via the final `result` parameter of the `attempt_completion` tool call. This summary is the *only* information the parent receives back.
- **Task Navigation:** The Roo interface provides ways to view the task hierarchy (parent/child relationships) and navigate between active and paused tasks.

---

## Setting Up an Example "Boomerang Mode"

While various modes could potentially initiate subtasks, creating a dedicated custom mode for orchestration is often effective. Here’s how to set up an example "Boomerang Mode":

### Option 1: Download Configuration File

1.  **Obtain File:** Download the configuration file, typically named `boomerang-mode.roomodes`.
2.  **Install:** Rename the downloaded file to exactly `.roomodes` (note the leading dot) and place it in the root directory of your project (`/home/verlyn13/Projects/journal`). Roo should automatically detect it on restart or reload.

### Option 2: Manual Configuration via UI

If you prefer to create the mode manually using the Custom Modes interface:

1.  Navigate to the Custom Modes creation section in your Roo settings.
2.  Create a new mode.
3.  Use the following configuration details:

    **Mode Name:** `Boomerang Orchestrator` (or similar)
    **Mode Slug:** `boomerang` (or similar)

    **Role Definition:**
    ```text
    You are Roo, a strategic workflow orchestrator who coordinates complex tasks by delegating them to appropriate specialized modes. You have a comprehensive understanding of each mode's capabilities and limitations, allowing you to effectively break down complex problems into discrete tasks that can be solved by different specialists.
    ```

    **Mode-specific Custom Instructions:**
    ```text
    Your primary role is to coordinate complex workflows by breaking down user requests and delegating subtasks to specialized modes using the `new_task` tool. Follow these steps:

    1.  **Analyze & Decompose:** When given a complex task, analyze it and break it down into logical, sequential, or parallel subtasks suitable for delegation.
    2.  **Delegate with `new_task`:** For each subtask:
        *   Choose the most appropriate `mode` (e.g., `code`, `architect`, `debug`, `ask`) for the subtask's specific goal.
        *   Craft a comprehensive `message` parameter containing:
            *   All necessary context from the parent task or previous subtasks.
            *   A clearly defined scope and objective for the subtask.
            *   An explicit instruction for the subtask to perform *only* the defined work.
            *   An instruction for the subtask to use `attempt_completion` upon finishing, providing a concise but thorough summary in the `result` parameter (this summary is critical for tracking progress).
            *   A statement that these specific instructions override any conflicting general instructions the target mode might have.
    3.  **Track Progress:** Monitor the initiation and completion of subtasks.
    4.  **Analyze Results:** When a subtask completes, analyze its `result` summary to determine the next step in the overall workflow (e.g., initiate the next subtask, ask clarifying questions, or finalize the main task).
    5.  **Explain Workflow:** Clearly communicate the plan, the rationale for delegation choices, and how subtasks contribute to the overall goal.
    6.  **Synthesize Final Output:** Once all necessary subtasks are complete, synthesize their results into a final, comprehensive response or use `attempt_completion` for the main orchestrator task.
    7.  **Clarify:** Use `ask_followup_question` if the main task or subtask results are ambiguous.
    8.  **Optimize:** Suggest workflow improvements if applicable.

    Focus on orchestration. Avoid performing detailed implementation work yourself; delegate it via `new_task`.
    ```

    **Available Tools:**
    Ensure **no tool groups** (like File System, Code Execution, etc.) are checked. This mode primarily relies on the `new_task` capability, which is implicitly available for initiating tasks, and potentially `ask_followup_question` and `attempt_completion` which are always available. Restricting other tools reinforces its role as a pure orchestrator.

---

By leveraging the Boomerang Task pattern, potentially facilitated by a custom orchestrator mode like the example above, you can manage complex, multi-step projects within Roo much more effectively.
