---
title: "ask_followup_question Tool Reference"
description: "Enables interactive communication by asking the user specific questions to gather necessary information or clarify ambiguities."
category: "Tool Reference"
related_topics:
  - "User Interaction"
  - "Tool Usage"
  - "Error Handling"
version: "1.0"
---

# ask_followup_question Tool Reference

The `ask_followup_question` tool facilitates interactive problem-solving by allowing Roo to pause the current task and ask the user a specific question. This is crucial when encountering ambiguities, needing clarification, requiring configuration details, or seeking user preference to proceed effectively. It often includes suggested answers to guide the user.

---

## Parameters

The tool uses the following parameters:

| Parameter   | Data Type | Required | Default | Description                                                                                                                                                              |
|-------------|-----------|----------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `question`  | String    | Yes      | N/A     | The clear, specific question to ask the user.                                                                                                                            |
| `follow_up` | String    | Yes      | N/A     | An XML fragment containing 2-4 suggested answers, each enclosed in its own `<suggest>` tag. These suggestions should be specific, actionable, and complete answers. |

**`follow_up` Structure:**

The `follow_up` parameter requires a specific XML structure:

```xml
<follow_up>
  <suggest>Complete suggested answer 1</suggest>
  <suggest>Complete suggested answer 2</suggest>
  <suggest>Complete suggested answer 3 (optional)</suggest>
  <suggest>Complete suggested answer 4 (optional)</suggest>
</follow_up>
```

- Each `<suggest>` tag contains one complete, potential answer to the `question`.
- Provide between 2 and 4 suggestions.
- Suggestions should be actionable and directly address the question without requiring further input or placeholders.

---

## Core Functionality

- **Interactive Querying:** Pauses task execution to present a question directly to the user.
- **Guided Responses:** Displays suggested answers (provided via `follow_up`) as clickable buttons in the UI, simplifying user input.
- **Contextual Clarification:** Allows Roo to resolve ambiguities or gather missing details necessary for task completion.
- **User Decision Point:** Enables Roo to present choices or options to the user when multiple valid paths exist.

---

## Use Cases

This tool should be used judiciously when:

- **Critical Information is Missing:** Essential details (e.g., file paths, API keys, configuration values) were not provided in the initial request.
- **Ambiguity Resolution:** The user's request is unclear or open to multiple interpretations.
- **Choosing Between Options:** Roo identifies several valid implementation strategies or technical choices and needs user input to select one.
- **Requesting Confirmation:** Before performing potentially destructive or irreversible actions (though user approval is often built into other tools).
- **Gathering Preferences:** When user preference is needed for aspects like styling, naming conventions, or optional features.

**Note:** Avoid using this tool if the required information can be reasonably inferred or obtained using other tools (e.g., using `list_files` instead of asking for a path, or `read_file` instead of asking for file content). Excessive use can slow down task completion.

---

## Key Features

- **Structured Questioning:** Presents a clear question alongside optional, pre-defined answer suggestions.
- **UI Integration:** Renders the question and suggestion buttons directly in the user interface for easy interaction.
- **Response Handling:** Captures the user's selected suggestion or custom typed answer, wrapping it in `<answer>` tags for clear identification in the conversation history.
- **Error Counter Reset:** Successfully receiving an answer resets the consecutive error counter for the task.
- **Universal Availability:** Accessible across all Roo modes.

---

## Limitations

- **Single Question Only:** Each use of the tool can only ask one question. Multiple questions require multiple tool calls.
- **Suggestion Guidance, Not Enforcement:** While suggestions are provided, the user can still type a custom answer. The tool doesn't validate the answer against the suggestions.
- **Potential for Slowdown:** Overuse can lead to excessive back-and-forth, hindering task progress. Use only when necessary.

---

## Prerequisites

- Roo must identify a genuine need for specific information that cannot be obtained through other means or reasonable inference.
- The question formulated must be clear, concise, and directly relevant to unblocking the current task.
- If providing suggestions, they must be well-formed within the `<follow_up>` structure and represent valid, complete answers.

---

## How It Works (Workflow)

1.  **Information Gap Identified:** Roo determines that essential information is missing or ambiguous.
2.  **Question Formulation:** Roo crafts a specific `question` string.
3.  **Suggestion Generation (Optional but Recommended):** Roo creates 2-4 relevant, complete answers and formats them within the `<follow_up>` XML structure.
4.  **Tool Invocation:** Roo calls `ask_followup_question` with the `question` and `follow_up` parameters.
5.  **Parameter Validation:** The system checks for the required `question` and validates the structure of the `follow_up` XML.
6.  **UI Presentation:** The question is displayed to the user, along with clickable buttons for each suggestion. A text input field is also available for custom answers.
7.  **User Response:** The user either clicks a suggestion button or types a custom answer and submits it.
8.  **Response Processing:** The system captures the user's input, wraps it in `<answer>` tags, and adds it to the conversation history.
9.  **Task Resumption:** Roo receives the user's answer and uses this new information to continue the task.

---

## Response Format

User responses obtained via this tool are wrapped in `<answer>` tags in the conversation history:

```xml
<answer>
[User's selected suggestion or custom typed answer text]
</answer>
```

This distinguishes the user's direct reply from Roo's own messages or tool outputs.

---

## Usage Examples

### Example 1: Asking About Implementation Preferences

**Tool Call:**
```xml
<ask_followup_question>
  <question>Which styling approach would you prefer for this web application?</question>
  <follow_up>
    <suggest>Use Bootstrap for rapid development with consistent components</suggest>
    <suggest>Use Tailwind CSS for utility-first styling with maximum flexibility</suggest>
    <suggest>Use vanilla CSS with custom styling for complete control</suggest>
  </follow_up>
</ask_followup_question>
```
**Interaction:** The user sees the question "Which styling approach..." and three buttons corresponding to the suggestions. They can click one button or type a different answer.
**Conceptual Outcome:** Roo receives the user's choice (e.g., `<answer>Use Tailwind CSS for utility-first styling with maximum flexibility</answer>`) and proceeds to implement the application using Tailwind CSS.

### Example 2: Requesting Technical Clarification

**Tool Call:**
```xml
<ask_followup_question>
  <question>What database should this application use for storing user data?</question>
  <follow_up>
    <suggest>PostgreSQL</suggest>
    <suggest>MongoDB</suggest>
    <suggest>SQLite</suggest>
  </follow_up>
</ask_followup_question>
```
**Interaction:** The user sees the question about the database and three suggestion buttons (PostgreSQL, MongoDB, SQLite).
**Conceptual Outcome:** Roo receives the selected database type (e.g., `<answer>PostgreSQL</answer>`) and configures the application accordingly.

### Example 3: Clarifying a File Path

**Tool Call:**
```xml
<ask_followup_question>
  <question>Please provide the relative path to the main configuration file.</question>
  <follow_up>
    <suggest>config/app.yaml</suggest>
    <suggest>settings.json</suggest>
    <suggest>src/config.py</suggest>
  </follow_up>
</ask_followup_question>
```
**Interaction:** The user sees the request for the configuration file path and suggestion buttons.
**Conceptual Outcome:** Roo receives the file path (e.g., `<answer>config/app.yaml</answer>`) and can now use tools like `read_file` or `apply_diff` on that specific file.

---

## Related Concepts and Tools

- **Tool Usage Flow:** This tool interrupts the normal flow of using other tools (`read_file`, `apply_diff`, `execute_command`, etc.) when input parameters are missing or ambiguous.
- **Error Handling:** Used as a mechanism to recover from situations where a lack of information would otherwise lead to errors or incorrect actions.
