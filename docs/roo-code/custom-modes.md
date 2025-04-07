---
title: "Custom Modes"
description: "Explains how to create, configure, and manage custom modes in Roo Code to tailor behavior, restrict tools, and define specialized roles."
category: "Configuration"
related_topics:
  - "Custom Instructions"
  - "Configuration Files"
  - "Tool Access Control"
  - "System Prompt"
version: "1.0"
tags: ["customization", "configuration", "modes", "roles", "permissions", "tools", "file restrictions", "json", ".roomodes"]
---

# Custom Modes

Roo Code allows you to define **Custom Modes** to tailor Roo's capabilities and behavior for specific tasks, workflows, or projects. Think of modes as specialized "personas" for Roo, each with its own role, instructions, and permitted tools.

---

## Why Use Custom Modes?

Creating custom modes offers several benefits:

- **Specialization:** Design modes optimized for specific roles like "Documentation Writer," "Test Case Generator," "Database Schema Designer," or "Code Refactoring Assistant."
- **Safety & Control:** Restrict a mode's access to sensitive files (e.g., configuration files) or powerful tools (e.g., command execution). Create read-only "Review" modes.
- **Consistency:** Define standard workflows and behaviors for specific tasks across a team by sharing project-specific modes.
- **Experimentation:** Safely test different prompt strategies, role definitions, and tool configurations without affecting built-in or other custom modes.

---

## Components of a Custom Mode

Each custom mode is defined by several key components:

- **Name and Slug:** A user-friendly display name (e.g., "Documentation Writer") and a unique, machine-readable identifier (`slug`, e.g., `docs-writer`). The slug uses lowercase letters, numbers, and hyphens.
- **Role Definition:** Text placed at the *beginning* of the system prompt. This defines the mode's core identity, expertise, and overall personality, fundamentally shaping its approach.
- **Custom Instructions:** Additional guidelines placed *later* in the system prompt. These refine behavior, specify preferences, or add constraints. See [Custom Instructions](./custom-instructions.md) for more details on how these interact with other instruction sources.
- **Allowed Tools:** A selection of tool groups (`read`, `edit`, `browser`, `command`, `mcp`) that the mode is permitted to use.
- **File Restrictions (Optional):** Regular expressions defining patterns for file paths that the mode is allowed (or disallowed) to access, particularly for editing operations.

---

## Configuration Methods

You can define custom modes in two primary ways, which determine their scope:

1.  **Project-Specific Modes (`.roomodes` file):**
    - **Scope:** Available only within the specific workspace/project where the file resides.
    - **How:** Create a file named exactly `.roomodes` in the root directory of your project (`/home/verlyn13/Projects/journal`). Define your mode(s) inside this file using the JSON format described below.
    - **Use Case:** Defining modes tailored to a specific project's needs, codebase, or team standards. Often committed to version control.

2.  **Global Modes (Prompts Tab / `custom_modes.json`):**
    - **Scope:** Available across *all* your workspaces.
    - **How:** Use the **Prompts Tab** UI (icon in the top menu bar) to create or edit modes. These configurations are saved in a global `custom_modes.json` file managed by Roo Code.
    - **Use Case:** Defining personal, reusable modes that you want available everywhere, independent of the specific project.

**Configuration Precedence:** If a mode with the *same slug* is defined in both the project's `.roomodes` file and globally, the **project-specific (`.roomodes`) definition takes precedence** and completely overrides the global one for that workspace.

---

## Configuration Format (JSON)

Both `.roomodes` and the global `custom_modes.json` use the same JSON structure. The root object contains a `customModes` array, where each element defines one mode:

```json
{
  "customModes": [
    {
      // Mode Definition 1
    },
    {
      // Mode Definition 2
    }
    // ... more modes
  ]
}
```

### Mode Definition Object Properties:

- **`slug` (String, Required):**
    - Unique identifier (lowercase, numbers, hyphens).
    - Example: `"docs-writer"`, `"test-generator"`

- **`name` (String, Required):**
    - Display name shown in the UI.
    - Example: `"Documentation Writer"`, `"Test Generator"`

- **`roleDefinition` (String, Required):**
    - Detailed description of the mode's role, expertise, and personality.
    - Example: `"You are an expert technical writer specializing in creating clear, concise, and accurate documentation for software APIs and features."`

- **`groups` (Array, Required):**
    - Defines allowed tool groups and file restrictions.
    - Available group strings: `"read"`, `"edit"`, `"browser"`, `"command"`, `"mcp"`.
    - **File Restriction Format:** To restrict a group (typically `edit`), replace the group string with a two-element array: `[groupName, restrictionObject]`.
        ```json
        // Example: Allow reading all files, but editing only Markdown files.
        "groups": [
          "read",
          ["edit", {
            "fileRegex": "\\.md$", // Regex pattern (JSON escaped)
            "description": "Markdown files only" // Optional description for UI/logs
          }]
        ]
        ```
        See the "Regex for File Restrictions" section below for details.

- **`customInstructions` (String, Optional):**
    - Additional behavioral guidelines appended to the system prompt for this mode.
    - Complements instructions from `.roorules` files (see [Custom Instructions](./custom-instructions.md)).
    - Example: `"Always provide code examples for functions. Use a formal tone."`

- **`apiConfiguration` (Object, Optional):**
    - Advanced settings to override default AI model parameters specifically for this mode.
    - Example: `{"model": "claude-3-opus", "temperature": 0.3}`

---

## Creating and Managing Custom Modes

You have several ways to create and manage modes:

### 1. Ask Roo (Recommended for Simple Modes)

- **How:** Simply ask Roo in the chat interface.
- **Example Prompt:** *"Create a new project-specific mode called 'Markdown Editor'. It should only be able to read files and edit files ending in `.md`."*
- **Process:** Roo will likely use the `fetch_instructions` tool with the `create_mode` task (or similar internal mechanism) to guide the creation process, potentially asking clarifying questions and then generating the necessary configuration in the appropriate location (`.roomodes` or global settings).

### 2. Using the Prompts Tab UI

- **How:**
    1. Click the icon (Prompts Tab) in the Roo Code top menu bar.
    2. Click the `+` button next to the "Modes" heading.
    3. Fill in the fields: Name, Slug, Save Location (Global or Project), Role Definition, Available Tools (checkboxes), Custom Instructions (optional).
    4. Click "Create Mode".
- **Limitations:** The UI currently does not support adding fine-grained file restrictions (`fileRegex`); these must be added by manually editing the JSON configuration.

### 3. Manual JSON Configuration

- **How:** Directly edit the configuration files.
    1. Open the Prompts Tab.
    2. Click the settings (gear) icon next to the "Modes" heading.
    3. Choose "Edit Global Modes" (opens `custom_modes.json`) or "Edit Project Modes" (opens `.roomodes` if it exists, otherwise offers to create it).
    4. Modify the JSON according to the format described above.
    5. Save the file. Roo Code automatically detects changes.
- **Use Case:** Necessary for advanced configurations like `fileRegex` restrictions or `apiConfiguration`.

---

## Regex for File Restrictions

Regular expressions (`fileRegex`) provide precise control over which files a mode can access, primarily for the `edit` tool group.

- **JSON Escaping:** Remember that backslashes (`\`) in regex patterns must be escaped with another backslash within the JSON string. So, `\.` becomes `\\.`, `\d` becomes `\\\\d`, etc.
- **Matching:** Patterns match against the full, relative file path within the workspace.
- **Case Sensitivity:** Matching is case-sensitive by default.
- **Common Examples (JSON Escaped):**
    - Match only Markdown files: `"fileRegex": "\\.md$"`
    - Match only JS/TS files in `src/`: `"fileRegex": "^src/.*\\.(js|ts)$"`
    - Match CSS or SCSS files: `"fileRegex": "\\.(css|scss)$"`
    - Exclude test files: `"fileRegex": "^(?!.*\\.(test|spec))\\.js$"` (Matches `.js` files not containing `.test` or `.spec`)

**Tip:** Ask Roo to help generate complex regex patterns! *"Create a JSON-escaped regex pattern that matches Python files but excludes files in any `__pycache__` directory."*

---

## Example Mode Configurations

### Documentation Writer (Markdown Only)

```json
{
  "customModes": [{
    "slug": "docs-writer",
    "name": "Documentation Writer",
    "roleDefinition": "You are a technical writer specializing in clear, concise Markdown documentation.",
    "groups": [
      "read", // Can read any file for context
      ["edit", { "fileRegex": "\\.md$", "description": "Markdown files only" }]
    ],
    "customInstructions": "Focus on clarity, accuracy, and providing code examples where relevant. Adhere to standard Markdown syntax."
  }]
}
```

### Test Engineer (Test Files Only)

```json
{
  "customModes": [{
    "slug": "test-engineer",
    "name": "Test Engineer",
    "roleDefinition": "You are a test engineer focused on writing effective unit and integration tests using Jest.",
    "groups": [
      "read", // Can read source files for context
      ["edit", { "fileRegex": "\\.(test|spec)\\.(js|ts)$", "description": "JS/TS test files only" }],
      "command" // May need to run test commands
    ],
    "customInstructions": "Write tests covering edge cases. Use descriptive test names. Ensure tests are independent."
  }]
}
```

---

## Community Gallery

Explore the Custom Modes Gallery (link if available, otherwise remove this section) to discover and share custom modes created by other Roo Code users!
