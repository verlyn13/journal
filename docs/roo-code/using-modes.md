---
title: "Using Modes in Roo Code"
description: "Explains the concept of operational modes in Roo Code, how to switch between them, and provides an overview of the built-in modes (Code, Ask, Architect, Debug)."
category: "Core Concepts" # Or "Getting Started"
related_topics:
  - "Modes"
  - "Custom Modes"
  - "switch_mode Tool"
  - "Tool Use Overview"
version: "1.0"
tags: ["modes", "switching modes", "code mode", "ask mode", "architect mode", "debug mode", "workflow", "user interface"]
---

# Using Modes in Roo Code

**Modes** in Roo Code define specialized "personas" or operational contexts for the AI assistant. Each mode is tailored with specific capabilities, expertise, tool access levels, and potentially custom instructions to optimize Roo's behavior for different types of tasks within your development workflow.

---

## Why Use Different Modes?

Switching between modes allows you to:

- **Leverage Task Specialization:** Get assistance optimized for your current goal, whether it's writing code, designing architecture, asking questions, or debugging.
- **Enhance Safety:** Use modes with restricted permissions (like `ask` mode, which cannot edit files) when you only need information or analysis, preventing accidental modifications.
- **Improve Focus:** Receive responses and actions tailored to the specific context (e.g., `architect` mode focuses on planning, `debug` mode focuses on diagnostics).
- **Optimize Workflow:** Seamlessly transition between different phases of development (e.g., planning in `architect`, implementing in `code`, fixing in `debug`).

---

## Switching Between Modes

You can change the active mode for the current task using several methods:

1.  **Mode Dropdown Menu:** Click the mode selector dropdown menu located to the left of the chat input box and choose the desired mode.
2.  **Slash Commands:** Type a forward slash followed by the mode's **slug** directly in the chat input and press Enter (e.g., `/code`, `/ask`, `/architect`, `/debug`, or `/custom-mode-slug`).
3.  **Keyboard Shortcut:** Use the assigned keyboard shortcut to cycle through the available modes (built-in and custom). The default is typically:
    - **macOS:** `⌘ + .` (Command + Period)
    - **Windows/Linux:** `Ctrl + .` (Control + Period)
4.  **AI Suggestion (`switch_mode` tool):** Roo itself might suggest switching modes using the [`switch_mode`](./switch_mode-tool.md) tool if it determines a different mode is better suited for the next step. You will need to approve this suggestion.

---

## Built-in Modes Overview

Roo Code comes with several pre-configured modes:

### Code Mode (`/code`) - Default
- **Persona:** A skilled software engineer proficient in various languages, patterns, and best practices.
- **Capabilities:** Full access to all tool categories (Read, Edit, Command, Browser, MCP). No file restrictions by default.
- **Best For:** General development tasks, writing and implementing code, refactoring, running tests, applying fixes identified during debugging.

### Ask Mode (`/ask`)
- **Persona:** A knowledgeable technical assistant focused on providing information and explanations.
- **Capabilities:** Restricted tool access, typically allowing Read, Browser, and MCP tools but **disallowing Edit and Command tools**. Cannot modify files or execute system commands.
- **Best For:** Asking questions about code, concepts, libraries, or technologies; learning; getting explanations without risking code changes.

### Architect Mode (`/architect`)
- **Persona:** An experienced technical leader focused on system design, planning, and high-level strategy.
- **Capabilities:** Typically allows Read, Browser, and MCP tools. Edit access is often **restricted to specific file types** (e.g., Markdown `.md` files only) suitable for documentation and planning. Command execution is usually disabled.
- **Best For:** Designing system architecture, planning implementation steps, discussing trade-offs, creating diagrams (if supported), writing design documents.

### Debug Mode (`/debug`)
- **Persona:** An expert troubleshooter specializing in systematic problem diagnosis and resolution.
- **Capabilities:** Full access to all tool categories, similar to Code mode, enabling reading files, executing diagnostic commands, and applying fixes.
- **Best For:** Identifying the root cause of bugs, analyzing errors (`@problems`, `@terminal`), stepping through logic (conceptually), proposing and applying fixes. Employs a methodical diagnostic approach.

---

## Custom Modes

Beyond the built-in options, you can create your own **[Custom Modes](./custom-modes.md)**. This allows you to define highly specialized assistants with:

- **Tailored Personas:** Define specific roles (e.g., "Database Optimizer," "Accessibility Tester," "API Documentation Writer").
- **Granular Tool Access:** Select precisely which tool groups the mode can use.
- **Specific File Permissions:** Restrict editing or reading to certain file types or directories using regular expressions.
- **Unique Instructions:** Embed custom guidelines, standards, or knowledge directly into the mode's configuration.

Custom modes provide powerful flexibility for adapting Roo to specific project needs, team standards, or complex workflows.

---

By understanding and utilizing the different modes effectively, you can significantly enhance your productivity and ensure you're getting the most appropriate assistance from Roo Code for any given task.
