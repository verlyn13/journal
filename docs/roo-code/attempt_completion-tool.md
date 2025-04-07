---
title: "attempt_completion Tool Reference"
description: "Signals task completion, presents a summary of results, and optionally provides a command to demonstrate the outcome."
category: "Tool Reference"
related_topics:
  - "Task Lifecycle"
  - "User Interaction"
  - "Tool Usage"
  - "execute_command" # Related as it can execute commands
version: "1.0"
---

# attempt_completion Tool Reference

The `attempt_completion` tool is used by Roo to signal that it believes the current task or subtask is complete. It presents a final summary of the work accomplished and optionally provides a command-line instruction that the user can approve to demonstrate the result (e.g., opening a file or running an application). This tool serves as a crucial checkpoint for user feedback before concluding the task.

---

## Parameters

The tool uses the following parameters:

| Parameter | Data Type | Required | Default | Description                                                                                                                               |
|-----------|-----------|----------|---------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `result`  | String    | Yes      | N/A     | A clear and concise summary describing the final outcome and accomplishments of the task. Should be formulated as a final statement.        |
| `command` | String    | No       | N/A     | An optional CLI command that, if approved by the user, will be executed to demonstrate the result (e.g., `open index.html`, `npm start`). |

---

## Core Functionality

- **Task Finalization:** Signals the successful conclusion of the current task or subtask.
- **Result Summarization:** Provides a clear, user-facing description of what was achieved.
- **Outcome Demonstration (Optional):** Allows Roo to suggest a command to showcase the result, pending user approval.
- **Feedback Checkpoint:** Creates an explicit point for the user to review the outcome and provide feedback for potential refinements.
- **UI Presentation:** Displays the result summary and optional command in a distinct UI format to signify task completion.

---

## Prerequisites

**CRITICAL:** This tool **MUST ONLY** be used after Roo has received confirmation from the user that all preceding tool operations (like `write_to_file`, `apply_diff`, `execute_command`, etc.) within the current task have completed successfully. Failure to wait for confirmation before using `attempt_completion` can lead to presenting incomplete or incorrect results, or attempting completion based on failed prior steps.

---

## Use Cases

This tool is used exclusively at the end of a task or subtask when:

- Roo has completed all necessary steps to fulfill the user's request.
- All previous tool actions have been confirmed as successful by the user.
- A final summary of the work performed is ready to be presented.
- Optionally, a command can effectively demonstrate the completed work.

**Do NOT use this tool for:**
- Progress updates.
- Signalling partial completion.
- Before confirming the success of prior file modifications or command executions.

---

## Key Features

- **Clear Completion Signal:** Provides an unambiguous indication that Roo considers the task finished.
- **Optional Demonstration Command:** Supports suggesting a relevant command for immediate result verification (requires user approval).
- **Feedback Loop:** Integrates seamlessly with the user feedback mechanism, allowing for iterative refinement if the result isn't satisfactory.
- **Structured UI:** Presents the completion information in a dedicated `completion_result` format for clarity.
- **Telemetry:** Captures data about task completion for system analysis.
- **Subtask Handling:** Facilitates nested workflows by allowing subtasks to complete and return control to parent tasks.

---

## Limitations

- **Requires Prior Success:** Its correct usage is dependent on the confirmed success of previous steps.
- **Single Command:** Only one optional demonstration `command` can be provided per use.
- **User Approval for Command:** The provided `command` will not execute without explicit user approval.
- **No Further Actions:** This tool signals an *end* to Roo's actions for the current task phase; subsequent actions only occur if the user provides feedback requesting changes.
- **Result Text Formatting:** The system may automatically strip certain formatting (like XML closing tags) from the `result` text during display.

---

## How It Works (Workflow)

1.  **Confirmation Check (Roo's Internal Logic):** Roo verifies internally (based on user responses to previous tool calls) that all preceding operations were successful.
2.  **Tool Invocation:** Roo calls `attempt_completion` with the `result` summary and an optional `command`.
3.  **Parameter Validation:** The system checks for the required `result` parameter.
4.  **UI Presentation:**
    - The `result` text is displayed in a distinct "completion" UI element.
    - If a `command` is provided, a button or prompt is displayed offering the user the option to execute it.
5.  **Command Execution (Conditional):**
    - If a `command` was provided and the user approves its execution, the system runs the command.
    - Command output (if any) is displayed to the user.
6.  **Feedback Prompt:** The UI implicitly or explicitly prompts the user for feedback on the completed task.
7.  **Waiting State:** Roo waits for the user's response (either acceptance or feedback requesting further changes).
8.  **Continuation:**
    - If the user accepts, the task is considered fully closed.
    - If the user provides feedback, Roo processes it and attempts to make the requested refinements, potentially using other tools again before another `attempt_completion`.

---

## Result Formatting Guidelines (`result` Parameter)

- **Be Final:** Formulate the result as a concluding statement. Do *not* end with questions or offers for further assistance.
- **Be Clear and Specific:** State exactly what was accomplished. Use lists if helpful.
- **Be Concise:** Avoid unnecessary jargon or filler words.
- **Focus on Value:** Briefly highlight how the changes address the user's request.
- **Professional Tone:** Maintain a direct and informative tone.

---

## Command Selection Guidelines (`command` Parameter)

- **Demonstrate Visually/Functionally:** Prefer commands that show the result directly (e.g., opening a web page, running an app, showing a generated file).
- **Avoid Trivial Output:** Do *not* use commands that just print text already known or easily inferred (e.g., `echo "Done"`, `cat file_i_just_wrote.txt`).
- **Platform Compatibility:** Ensure the command is likely to work on the user's OS (check SYSTEM INFORMATION if unsure).
- **Examples:** `open index.html`, `open http://localhost:3000`, `npm start`, `python main.py`, `code report.pdf`.

---

## Usage Examples

### Example 1: Completing a Task with Result Summary Only

**Tool Call:**
```xml
<attempt_completion>
  <result>
I have updated the project's README.md file to include:
- A revised project description.
- Updated installation instructions.
- Added a section on contribution guidelines.
  </result>
</attempt_completion>
```
**Conceptual Outcome:** The user sees the summary message in a distinct completion format, indicating the README update is finished. They can then provide feedback or accept the completion.

### Example 2: Completing a Web Dev Task with Demo Command

**Tool Call:**
```xml
<attempt_completion>
  <result>
I've created the basic HTML structure and CSS styling for the landing page as requested. It includes the header, hero section, and footer.
  </result>
  <command>open landing_page.html</command>
</attempt_completion>
```
**Conceptual Outcome:** The user sees the result summary. They are also presented with an option (e.g., a button) to run `open landing_page.html`. If they approve, their default browser opens the newly created HTML file.

### Example 3: Completing a Scripting Task with Execution Command

**Tool Call:**
```xml
<attempt_completion>
  <result>
I have written the Python script `process_data.py`. It reads data from `input.csv`, calculates the required averages, and writes the results to `output.json`.
  </result>
  <command>python process_data.py</command>
</attempt_completion>
```
**Conceptual Outcome:** The user sees the summary. They are offered the option to run `python process_data.py`. If approved, the script executes in their terminal, potentially printing output or creating the `output.json` file, demonstrating its function.

---

## Related Concepts and Tools

- **Task Lifecycle:** This tool marks the end point of a task execution phase.
- **User Feedback:** Essential for the iterative refinement process that follows `attempt_completion`.
- **Tool Success Confirmation:** The critical dependency on receiving positive confirmation from the user after each preceding tool use.
