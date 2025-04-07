---
title: "Custom Instructions"
description: "Explains how to personalize Roo's behavior using global, workspace, and mode-specific custom instructions via the Prompts Tab or .roorules files."
category: "Configuration"
related_topics:
  - "Custom Modes"
  - "Configuration Files"
  - "System Prompt"
version: "1.0"
tags: ["customization", "configuration", "instructions", "prompts", "roorules", "personalization"]
---

# Custom Instructions

Custom Instructions allow you to personalize and guide Roo's behavior by providing specific directives that shape its responses, coding style, decision-making processes, and overall approach within your projects.

---

## What Are Custom Instructions?

Custom Instructions are user-defined guidelines that supplement Roo's core role definition and mode-specific instructions. They act as persistent directives within the system prompt, influencing how Roo operates. You can use them to specify preferences and constraints related to:

- Coding style conventions (e.g., indentation, naming)
- Documentation standards
- Testing requirements or methodologies
- Preferred libraries or frameworks
- Architectural patterns
- Communication style (e.g., "Explain reasoning before coding")
- Workflow practices

---

## Levels of Custom Instructions

Custom instructions can be applied at different scopes:

### 1. Global Custom Instructions

- **Scope:** Apply across *all* your workspaces.
- **Purpose:** Maintain consistent personal preferences regardless of the project.
- **How to Set:**
    1.  Open the **Prompts Tab** (click the icon in the Roo Code top menu bar).
    2.  Locate the **"Custom Instructions for All Modes"** section.
    3.  Enter your instructions in the text area.
    4.  Click **"Done"** to save.

### 2. Workspace Custom Instructions

- **Scope:** Apply only within the *current* workspace/project.
- **Purpose:** Define project-specific standards or guidelines.
- **How to Set:** Create a file named exactly `.roorules` in the root directory of your workspace (`/home/verlyn13/Projects/journal`). Enter your workspace-wide instructions directly into this file.

### 3. Mode-Specific Custom Instructions

- **Scope:** Apply only when a *specific mode* is active. Can be set globally (via Prompts Tab) or per-workspace (via `.roorules-[mode]` file).
- **Purpose:** Tailor the behavior of individual modes (e.g., provide specific coding standards only for the `code` mode).
- **How to Set (Two Independent Methods, Can Be Used Together):**

    **Method A: Via Prompts Tab (Global or Workspace Specific)**
    1.  Open the **Prompts Tab**.
    2.  Under the **Modes** heading, click the button for the mode you wish to customize (e.g., `code`).
    3.  Enter instructions in the **"Mode-specific Custom Instructions (optional)"** text area.
    4.  Click **"Done"** to save.
    *Note: If the mode itself is global (like built-in modes), these instructions apply globally for that mode. If the mode is workspace-specific (a custom mode defined in the workspace's `.roomodes`), these instructions apply only within that workspace.*

    **Method B: Via `.roorules-[mode]` File (Workspace Specific)**
    1.  Create a file named `.roorules-[mode_slug]` in your workspace root directory (e.g., `.roorules-code` for the `code` mode, `.roorules-architect` for the `architect` mode).
    2.  Enter your mode-specific instructions directly into this file. These instructions will *only* apply within this workspace when that specific mode is active.

---

## How Instructions Are Combined and Applied

Roo combines instructions from different sources and injects them into the system prompt before processing your request. The order of inclusion generally follows this structure:

```plaintext
====
USER'S CUSTOM INSTRUCTIONS
The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

[Language Preference (if set via Prompts Tab)]

Global Instructions:
[Content from Global Custom Instructions set in Prompts Tab]

Mode-specific Custom Instructions:
[Content from Mode-Specific Instructions set in Prompts Tab for the active mode]
[Content from the .roorules-[mode_slug] file, if it exists]

Workspace-Wide Instructions:
[Content from the .roorules file, if it exists]
====
```

**Key Points on Combination:**

- **Additive:** Instructions from different sources (Global, Mode-Specific Tab, Mode-Specific File, Workspace File) are typically concatenated, not overridden. Roo attempts to follow all provided instructions.
- **Specificity:** While not a strict hierarchy, more specific instructions (e.g., mode-specific) might implicitly guide interpretation when conflicts arise, but Roo aims to adhere to all directives.
- **`.roorules` File Rules:**
    - Must be in the workspace root.
    - Empty or missing files are ignored.
    - Content is included verbatim.
- **Clarity is Key:** Write clear, unambiguous instructions to avoid conflicting directives.

---

## Examples of Effective Custom Instructions

- "Always use 4 spaces for indentation in Python code."
- "Prefer functional components and React Hooks over class components."
- "Generate Jest unit tests for all new JavaScript functions."
- "Include JSDoc comments for all exported functions."
- "When suggesting libraries, prioritize those with active maintenance and strong community support."
- "Explain potential trade-offs when presenting architectural options."
- "Ensure all generated HTML includes appropriate ARIA attributes for accessibility."
- "Use `async/await` for asynchronous operations in JavaScript."

---

## Pro Tip: Team Standards with `.roorules`

For development teams, committing `.roorules` and `.roorules-[mode]` files to your version control repository (e.g., Git) is an excellent way to enforce consistent standards. This ensures every team member's Roo instance adheres to the same project-specific guidelines for coding style, documentation, commit messages, etc.

---

## Combining with Custom Modes

For the highest level of customization, combine Custom Instructions with [Custom Modes](./custom-modes.md). This allows you to create highly specialized Roo personas for specific tasks within a project, complete with:

- Tailored role definitions and instructions.
- Restricted tool access.
- Specific file access permissions.

This powerful combination enables the creation of fine-tuned workflows optimized for your project's unique requirements.
