---
id: agentic-workflow
title: Agentic Orchestration Plan
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- reference
- python
priority: medium
status: approved
visibility: internal
schema_version: v1
---

***

title: "Agentic Orchestration Plan for Flask Journal MVP"
description: "Outlines the human-guided workflow using Roo Code automation for building the Flask Journal MVP, defining roles and the step-by-step process."
category: "Project Planning"
related\_topics:
\- "Flask Journal MVP Scope Definition"
\- "Agentic Workflow Implementation with Roo Code" # Link to the doc created based on this plan
\- "Custom Modes"
\- "Tool Use Overview"
version: "1.0"
tags: \["planning", "workflow", "agentic", "orchestration", "mvp", "flask", "roo code", "process"]
--------------------------------------------------------------------------------------------------

# Agentic Orchestration Plan

## MVP Orchestration Plan: Flask Journal System with Roo Code Automation

**Project Goal:** Deliver the defined MVP (core CRUD, auth, PostgreSQL, basic UI, systemd deployment) of the Flask Journal application, adhering strictly to the "lean and mean" philosophy and leveraging Roo Code automation effectively.

**Underlying Principle:** Roo Code acts as an intelligent, automated assistant, accelerating development by handling boilerplate, performing analysis, generating code/diffs, and executing commands, **always under expert human guidance and critical review.** The human developer remains the architect and quality gatekeeper.

**Assumptions:**

1. The **Detailed MVP Implementation Steps** (broken down from the [high-level guide](initial-planning/mvp-high-level-implementation-guide.md)) have been created by the Major Project Architect and are available.
2. The target **Fedora environment** is set up with necessary base tools (Python, pip, git, systemd, Redis).
3. Developers assigned have the prerequisite **technical skills and personality traits** outlined previously.
4. Roo Code **[Custom Modes](../roo-code/custom-modes.md) and [Custom Instructions](../roo-code/custom-instructions.md)** (as recommended) are configured for the project workspace.

### Roles & Responsibilities (Simulated for Workflow Clarity)

1. **Lead Developer / Architect (Human):**

- **Responsibilities:** Oversees the entire process, makes architectural decisions *within* MVP scope, defines micro-tasks based on the detailed implementation plan, crafts precise prompts for Roo, *critically reviews all Roo output* (code, diffs, plans, command executions), applies or approves application of changes, performs final verification, writes/reviews core tests, manages Git commits.
- **Required Skills:** Deep Flask/Python/SQLAlchemy knowledge, systemd understanding, testing expertise, **Disciplined Scope Management**, **Implementation Precision**, **Structured Communication with Roo**, excellent **[Prompt Engineering](../roo-code/prompt-engineering-tips.md)**, critical review skills. Acts as the primary **Roo Operator**.

2. **Roo Code (AI Assistant):**

- **Responsibilities:** Executes tasks as directed by the Lead Dev via prompts, utilizes its toolset ([`read_file`](../roo-code/read_file-tool.md), [`write_to_file`](../roo-code/write_to_file-tool.md), [`apply_diff`](../roo-code/apply_diff-tool.md), [`execute_command`](../roo-code/execute_command-tool.md), [`list_files`](../roo-code/list_files-tool.md), etc. - see [Tool Overview](../roo-code/tool-use-overview.md)) to interact with the codebase and environment, generates code snippets/diffs/files, performs analysis ([`list_code_definition_names`](../roo-code/list_code_definition_names-tool.md)), asks clarifying questions ([`ask_followup_question`](../roo-code/ask_followup_question-tool.md)), executes commands, attempts task completion ([`attempt_completion`](../roo-code/attempt_completion-tool.md)). Operates within the constraints defined by custom modes and instructions.

3. **Quality Assurance (Human - Integrated Role):**

- **Responsibilities:** Primarily performed by the Lead Dev for MVP. Focuses on verifying each implementation step against requirements and the detailed plan, writing and running unit/integration tests, ensuring functionality meets expectations.
- **Required Skills:** Testing Proficiency, attention to detail, understanding of requirements.

### Optimized Workflow (Leveraging Roo Code Tools)

This workflow follows the **Staged MVP Implementation Guide**, applying Roo Code automation at each **detailed step** derived by the Major Project Architect.

**General Pattern for Each Detailed Implementation Step:**

1. **Task Definition (Lead Dev):**

- Identify the *precise* goal for the current micro-task from the Architect's detailed breakdown (e.g., "Define the `User` model class structure in `app/models/user.py`").
- Determine the best Roo tools (`write_to_file` for new file, `apply_diff` for modification, `execute_command`, etc.).
- Select the appropriate Roo **[Custom Mode](../roo-code/custom-modes.md)** (e.g., `flask-lead-architect`, `db-designer-mode`).

2. **Prompt Crafting (Lead Dev -> Roo):**

- Provide clear, concise instructions to Roo in the selected mode. See [Prompt Engineering Tips](../roo-code/prompt-engineering-tips.md).
- **Context is Key:** Specify file paths ([`@` mentions](../roo-code/context-mentions.md)), existing code context (if modifying), function/class names, required imports, **MVP constraints** (e.g., "Generate only the `User` model, exclude preference/draft relationships for MVP").
- **Desired Output:** Clearly state whether Roo should generate a full file (`write_to_file`), a diff (`apply_diff` plan), a code snippet, or execute a command.
- *Example Prompt (for User Model):* "In mode `db-designer-mode`, using `write_to_file` for `app/models/user.py`: Create the SQLAlchemy `User` model. Include imports for `db`, `UserMixin`, `generate_password_hash`, `check_password_hash`, `datetime`. Define columns: `id` (PK), `username` (String 80, unique, non-null), `email` (String 120, unique, non-null), `password_hash` (String 256, non-null), `created_at` (DateTime, default utcnow). Implement `set_password` using `generate_password_hash(method='argon2')` and `check_password`. Add a basic `__repr__`. **MVP Constraint:** Do *not* add `is_active` or `last_login` yet. Do *not* add relationships."

3. **Roo Processing & Output (Roo -> Lead Dev):**

- Roo analyzes the request within the mode's constraints.
- May use `read_file` or `list_files` for context.
- May [`ask_followup_question`](../roo-code/ask_followup_question-tool.md) if ambiguity exists.
- Generates the requested output: a plan for `write_to_file`, a diff block for `apply_diff`, or a plan for `execute_command`.

4. **CRITICAL REVIEW (Lead Dev):**

- **Meticulously examine Roo's proposed output.**
- **Scope Check:** Does it adhere *strictly* to the MVP definition and constraints?
- **Correctness:** Is the code syntactically correct? Does it implement the logic requested?
- **Security:** Are there any obvious security flaws (especially with `execute_command`)?
- **Style:** Does it match project conventions (via custom instructions)?
- **Diff Review:** If using `apply_diff`, review *every single line* of the proposed change. Understand the `search_block` and `replace_block`.
- **File Write Review:** If using `write_to_file`, review the *entire* proposed file content.

5. **Iteration / Clarification (Lead Dev <-> Roo):**

- If the output is incorrect or unsatisfactory, provide specific feedback to Roo and ask for revisions.
- Use `ask_followup_question` directed at Roo if its reasoning isn't clear.

6. **Application of Change (Roo or Lead Dev):**

- **For `apply_diff` / `write_to_file`:** Once satisfied, approve Roo's plan to apply the change. *Alternatively, for critical sections or early stages, the Lead Dev might manually copy/paste the reviewed code/diff.*
- **For `execute_command`:** Review the command *very* carefully. Approve Roo's plan to execute, or execute manually in a separate terminal for maximum control.

7. **Verification (Lead Dev / QA Role):**

- Execute the specific verification steps defined in the Architect's detailed breakdown for this task (e.g., run `flask db migrate`, check file content, access a URL, run a specific test).

8. **Testing (Lead Dev / QA Role):**

- Prompt Roo (e.g., in a `test-writer-mode`) to generate *boilerplate* for unit/integration tests relevant to the implemented feature (e.g., "Generate a pytest class skeleton for `app/models/user.py` in `tests/unit/test_models/test_user.py` including imports and basic fixture usage").
- **Lead Dev writes/reviews the actual test logic.**
- Run relevant tests (`pytest -k test_user_model` or similar). Ensure tests pass.

9. **Commit (Lead Dev):**

- Stage the changes (`git add`).
- Commit the verified, tested code with a clear, concise message referencing the completed task/step from the detailed plan (`git commit -m "Feat(models): Implement basic User model structure (MVP)"`).

**Tool Usage Strategy within Workflow:**

- **[`write_to_file`](../roo-code/write_to_file-tool.md):** Best for creating *new* files (configs, initial model/service/route/test skeletons). Requires **thorough review** of the *entire* generated content.
- **[`apply_diff`](../roo-code/apply_diff-tool.md) / [Fast Edits](../roo-code/fast-edits.md):** Preferred method for *modifying existing* files. Allows precise, targeted changes. Requires **meticulous review** of search/replace blocks before approval. Ideal for adding methods, fixing bugs, implementing features incrementally.
- **Read Tools** ([`list_files`](../roo-code/list_files-tool.md), [`read_file`](../roo-code/read_file-tool.md), [`list_code_definition_names`](../roo-code/list_code_definition_names-tool.md), [`search_files`](../roo-code/search_files-tool.md)): Used by Roo for context gathering or by the Lead Dev (via prompts) to understand the current state before planning modifications.
- **[`execute_command`](../roo-code/execute_command-tool.md):** Use with **extreme caution**. Best for running well-understood, safe commands like `uv uv uv pip install`, `flask db upgrade`, `uv run pytest`, `git status`. Review the exact command *before* execution. Avoid complex shell pipelines or commands with destructive potential unless absolutely necessary and fully understood.
- **[`ask_followup_question`](../roo-code/ask_followup_question-tool.md):** Essential for interactive clarification between Lead Dev and Roo.
- **[`new_task`](../roo-code/new_task-tool.md) / [Boomerang Tasks](../roo-code/boomerang-tasks.md):** Less critical for the linear MVP, but could be used if a specific sub-problem requires a temporary mode switch (e.g., switching to `debug-mode` to analyze a test failure, then returning).
- **[`attempt_completion`](../roo-code/attempt_completion-tool.md):** Used by Roo to signal it believes a task segment is done. Triggers the Lead Dev's review/verification cycle.
- **MCP Tools:** **Not used** for MVP implementation as per prior analysis.

### Roo Configuration Strategy

1. **`.roorules` / [Custom Instructions](../roo-code/custom-instructions.md):**

- Load the recommended custom instructions globally or for the workspace.
- Emphasize MVP scope constraints, coding standards, verification needs, and the "lean" philosophy.

2. **[Custom Modes](../roo-code/custom-modes.md):**

- Implement the suggested modes (`flask-lead-architect`, `db-designer-mode`, `auth-specialist-mode`, `test-writer-mode`) with appropriate `roleDefinition`, restricted tool `groups` (e.g., testing mode might not need `execute_command`), and tailored `customInstructions`.
- The Lead Dev explicitly selects the relevant mode when prompting Roo for specific tasks using [Mode Switching](../roo-code/using-modes.md).

### Verification & Quality Assurance

- Verification steps defined in the Architect's detailed breakdown are executed *after each micro-task*.
- Unit and integration tests are written *concurrently* with feature implementation. See [Testing Strategy Guide: Flask Journal System](initial-planning/testing.md).
- The full test suite (`uv run pytest`) is run frequently, especially before commits.
- Code reviews (even if self-review by the Lead Dev for MVP) focus on correctness, security, MVP adherence, and style.

***

This orchestration plan provides a structured, automation-assisted approach to building the MVP. The emphasis remains on **expert human oversight**, critical review, and adherence to the defined scope, using Roo Code as a powerful accelerator rather than an autonomous developer. This challenges the team to master not just the technical implementation but also the effective and safe utilization of AI development tools.
