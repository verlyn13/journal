---
title: Roo Code Documentation Index
description: "Index page for documentation related to Roo Code features, tools, concepts, and usage within the Flask Journal project."
category: "Roo Code"
status: active
tags: ["documentation", "index", "roo-code", "tools", "guides"]
---


# Roo Code Documentation Index

This directory contains detailed documentation for Roo Code's features, tools, and concepts.

## Core Concepts

Explanations of fundamental Roo Code mechanisms and workflows.

- **[How Tools Work: An Introduction](./how-tools-work.md):** A basic introduction to how Roo Code uses tools to interact with your development environment, including the workflow and user approval process.
- **[Tool Use Overview](./tool-use-overview.md):** Explains Roo Code's tool system in detail, how tools are categorized, accessed based on modes, and best practices for their use.
- **[Using Modes in Roo Code](./using-modes.md):** Explains the concept of operational modes, how to switch between them, and provides an overview of the built-in modes.
- **[Boomerang Tasks](./boomerang-tasks.md):** Explains how to use subtasks (Boomerang Tasks) and the `new_task` tool to break down complex projects and delegate work to specialized Roo modes.

## Tool Reference

Detailed documentation for specific tools available to Roo.

### File System & Code Analysis Tools
- **[`list_files`](./list_files-tool.md):** Lists files and directories within a specified path, either recursively or at the top level, respecting ignore rules.
- **[`read_file`](./read_file-tool.md):** Reads the content of a specified file, supporting full reads, specific line ranges, and text extraction from formats like PDF and DOCX.
- **[`search_files`](./search_files-tool.md):** Performs recursive regular expression searches across files within a specified directory, providing contextual results.
- **[`list_code_definition_names`](./list_code_definition_names-tool.md):** Scans source files in a directory (non-recursively) to list top-level code definitions like classes, functions, and interfaces.

### File Modification Tools
- **[`apply_diff`](./apply_diff-tool.md):** Applies precise, targeted changes to existing files using a search-and-replace block format. Preferred for modifications.
- **[`write_to_file`](./write_to_file-tool.md):** Creates new files or completely overwrites existing files with provided content, featuring an interactive diff view for user review and approval.
- **`insert_content`:** (Documentation To Be Added) Inserts new lines of content into a file at a specific location without overwriting existing lines.
- **`search_and_replace`:** (Documentation To Be Added) Performs find-and-replace operations within a file, supporting text or regex patterns.

### Command Execution Tools
- **[`execute_command`](./execute_command-tool.md):** Executes command-line interface (CLI) commands on the user's system within a specified working directory.

### Model Context Protocol (MCP) Tools
- **[`access_mcp_resource`](./access_mcp-tool.md):** Retrieves data (read-only) from resources exposed by connected Model Context Protocol (MCP) servers.
- **[`use_mcp_tool`](./use_mcp_tool.md):** Executes actions or operations provided by external tools hosted on connected Model Context Protocol (MCP) servers.

### Workflow & Interaction Tools (Always Available)
- **[`ask_followup_question`](./ask_followup_question-tool.md):** Enables interactive communication by asking the user specific questions to gather necessary information or clarify ambiguities.
- **[`attempt_completion`](./attempt_completion-tool.md):** Signals task completion, presents a summary of results, and optionally provides a command to demonstrate the outcome.
- **[`switch_mode`](./switch_mode-tool.md):** Allows Roo to request a change to a different operational mode (e.g., code, architect, ask, debug) within the current task.
- **[`new_task`](./new_task-tool.md):** Creates a new subtask, pausing the current (parent) task and starting the subtask in a specified mode with initial instructions.

## Usage Guides

Best practices and strategies for using Roo Code effectively.

- **[Implementing the Agentic Workflow with Roo Code](./agentic-workflow-implementation.md):** Details how Roo Code's tools, modes, and configurations can be used to implement the planned agentic workflow for the Flask Journal MVP.
- **[Working with Large Projects](./large-projects.md):** Provides strategies and best practices for effectively using Roo Code with large codebases, focusing on managing context window limitations.
- **[Prompt Engineering Tips](./prompt-engineering-tips.md):** Best practices for crafting effective prompts to guide Roo Code, leading to better results, fewer errors, and increased efficiency.

## Configuration

Information on customizing Roo Code's behavior and capabilities.

- **[Custom Instructions](./custom-instructions.md):** Explains how to personalize Roo's behavior using global, workspace, and mode-specific custom instructions via the Prompts Tab or .roorules files.
- **[Custom Modes](./custom-modes.md):** Explains how to create, configure, and manage custom modes in Roo Code to tailor behavior, restrict tools, and define specialized roles.

## Features & Concepts

Explanations of specific Roo Code features and interaction patterns.

- **[Context Mentions (@ Mentions)](./context-mentions.md):** Explains how to use @ mentions to provide specific context (files, folders, problems, Git info, URLs) to Roo Code.
- **[Enhance Prompt & Fast Edits Mechanism](./fast-edits.md):** Explains the 'Enhance Prompt' feature for refining user input and the 'Fast Edits' mechanism (diff-based file updates) for efficient file modifications.