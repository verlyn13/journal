---
title: "switch_mode Tool Reference"
description: "Allows Roo to request a change to a different operational mode (e.g., code, architect, ask, debug) within the current task."
category: "Tool Reference"
related_topics:
  - "Modes"
  - "Custom Modes"
  - "Task Management"
  - "new_task Tool" # Contrast: new_task creates a subtask, switch_mode changes mode in the current task
version: "1.0"
tags: ["mode switching", "modes", "workflow", "task state", "permissions"]
---

# switch_mode Tool Reference

The `switch_mode` tool enables Roo to transition its operational mode *within the current task*. This allows Roo to adapt its capabilities, available tools, and interaction style when the focus of the work shifts, without creating a separate subtask. For example, Roo might switch from `architect` mode to `code` mode after design discussions are complete.

**Contrast with `new_task`:** While `new_task` creates a *new, separate subtask* often in a different mode, `switch_mode` changes the mode of the *currently active task*.

---

## Parameters

The tool uses the following parameters:

| Parameter   | Data Type | Required | Default | Description                                                                                                                               |
|-------------|-----------|----------|---------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `mode_slug` | String    | Yes      | N/A     | The **slug** (unique identifier, e.g., `code`, `architect`, `ask`, `debug`, or a custom mode slug) of the mode to switch into.             |
| `reason`    | String    | No       | N/A     | An optional, user-facing explanation for why the mode switch is necessary or beneficial for the current task. Displayed during approval. |

---

## Core Functionality

- **In-Task Mode Transition:** Changes the active operational mode for the current task instance.
- **Capability Adjustment:** Modifies Roo's available tools, file access permissions (based on mode restrictions), and potentially its underlying instructions or persona according to the definition of the target mode.
- **Context Preservation:** Maintains the existing conversation history and task context during the mode switch. The underlying task remains the same, only the active mode changes.
- **User Approval:** Requires explicit user confirmation before the mode switch takes effect.

---

## Prerequisites

- **Mode Existence:** The target `mode_slug` must correspond to a valid, defined mode (either built-in or a [Custom Mode](./custom-modes.md)).
- **User Approval:** The user must explicitly approve the mode switch request when prompted.
- **Not Already in Target Mode:** The tool cannot be used to switch to the mode that is already active.

---

## Use Cases

This tool is typically used when the nature of the work within a *single continuous task* changes:

- **Design to Implementation:** Switching from `architect` to `code` after finalizing a design within the same conversation.
- **Implementation to Debugging:** Switching from `code` to `debug` upon encountering errors that require systematic diagnosis within the current coding effort.
- **Coding to Explanation:** Switching from `code` to `ask` to provide detailed explanations or documentation about the code just written.
- **Adapting to User Request:** If the user's follow-up request is better suited to a different mode's capabilities than the current one.

---

## Key Features

- **Seamless Transition:** Changes the active mode while keeping the current task context and history intact.
- **Reasoning Display:** Shows the provided `reason` to the user during the approval step.
- **Mandatory User Approval:** Ensures user control over mode changes.
- **Dynamic Capability Update:** Automatically adjusts available tools and enforces file restrictions based on the new mode's configuration upon successful switching.
- **Short Activation Delay:** Includes a brief internal delay after switching to ensure the new mode's settings are fully active before proceeding.

---

## Limitations

- **Requires Existing Mode:** Cannot switch to an undefined mode slug.
- **User Approval Bottleneck:** Requires user interaction for every switch.
- **No Subtask Creation:** Does *not* create a new task or isolate context like [`new_task`](./new_task-tool.md). The conversation history continues within the same task.
- **File Restrictions Apply Immediately:** If switching to a mode with stricter file restrictions (e.g., `architect` only allowing `.md` edits), attempts to use tools like `apply_diff` on disallowed file types will fail *after* the switch.

---

## How It Works (Simplified Workflow)

1.  **Tool Invocation:** Roo calls `switch_mode` with a target `mode_slug` and optional `reason`.
2.  **Validation:** Checks if `mode_slug` is provided, if the target mode exists, and if it's different from the current mode.
3.  **User Approval Request:** Presents the request to the user, showing the target mode and the `reason` (if provided).
4.  **Mode Activation (Upon Approval):**
    - Updates the system state to reflect the new active mode for the current task.
    - Modifies the available toolset in the UI and backend based on the new mode's configuration.
    - Applies the new mode's role definition and custom instructions for subsequent AI interactions.
    - Enforces any file restrictions associated with the new mode.
    - Waits briefly (e.g., 500ms) for the changes to stabilize.
5.  **Task Continuation:** Roo continues processing the task, now operating under the rules and capabilities of the newly activated mode. The conversation history remains unchanged.

---

## Mode Definitions

Modes (both built-in and custom) define Roo's behavior. Key aspects include:

- **Role Definition:** The core persona and expertise.
- **Custom Instructions:** Specific behavioral guidelines.
- **Allowed Tools (`groups`):** Which tool categories are enabled.
- **File Restrictions:** Regex patterns limiting file access for certain tools (especially `edit`).

Refer to the [Custom Modes](./custom-modes.md) documentation for details on how modes are defined and configured.

---

## Usage Examples

### Example 1: Switching from Architect to Code

*(Scenario: After discussing and documenting architecture in `architect` mode)*
**Tool Call:**
```xml
<switch_mode>
  <mode_slug>code</mode_slug>
  <reason>Switching to Code mode to begin implementing the user authentication module based on the agreed design.</reason>
</switch_mode>
```
**Conceptual Outcome:** User approves. The current task's mode changes from `architect` to `code`. Roo now has access to code editing tools (`apply_diff`, `write_to_file` on code files, etc.) and will operate based on the `code` mode's persona and instructions.

### Example 2: Switching from Code to Debug

*(Scenario: Encountering unexpected errors during implementation in `code` mode)*
**Tool Call:**
```xml
<switch_mode>
  <mode_slug>debug</mode_slug>
  <reason>Encountered a persistent 'TypeError'. Switching to Debug mode to systematically diagnose the issue in the `processOrder` function.</reason>
</switch_mode>
```
**Conceptual Outcome:** User approves. The task mode changes to `debug`. Roo might now have access to specific diagnostic tools or follow different troubleshooting methodologies defined in the `debug` mode's instructions.

### Example 3: Switching from Code to Ask

*(Scenario: After implementing a function, the user asks for a detailed explanation)*
**Tool Call:**
```xml
<switch_mode>
  <mode_slug>ask</mode_slug>
  <reason>Switching to Ask mode to provide a detailed explanation of the algorithm used in the `calculateRiskScore` function.</reason>
</switch_mode>
```
**Conceptual Outcome:** User approves. The task mode changes to `ask`. Roo focuses on providing clear, informative explanations based on the `ask` mode's configuration, likely without attempting further code modifications unless prompted again (potentially requiring another mode switch).
