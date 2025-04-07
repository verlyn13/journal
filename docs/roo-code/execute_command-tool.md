---
title: "execute_command Tool Reference"
description: "Executes command-line interface (CLI) commands on the user's system within a specified working directory."
category: "Tool Reference"
related_topics:
  - "Command Line Interface (CLI)"
  - "Tool Access Control"
  - "Configuration Files" # .rooignore
  - "System Interaction"
version: "1.0"
tags: ["cli", "terminal", "command execution", "shell", "system operations", "automation"]
---

# execute_command Tool Reference

The `execute_command` tool provides Roo with the capability to run Command Line Interface (CLI) commands directly on the user's operating system. This enables a wide range of actions, such as installing dependencies, building projects, running scripts, managing files, and interacting with version control systems.

---

## Parameters

The tool uses the following parameters:

| Parameter | Data Type | Required | Default                                   | Description                                                                                                                               |
|-----------|-----------|----------|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `command` | String    | Yes      | N/A                                       | The exact CLI command string to execute. Must be valid for the user's operating system and default shell. Complex commands with pipes (`|`) or sequences (`&&`, `;`) are supported. |
| `cwd`     | String    | No       | Current working directory of the Roo project | The absolute or relative path to the directory where the command should be executed. If relative, it's resolved from the project root (`/home/verlyn13/Projects/journal`). |

---

## Core Functionality

- **CLI Execution:** Runs the provided `command` string in a terminal instance managed by Roo Code, integrated with the VS Code terminal environment.
- **Working Directory Control:** Executes the command within the specified `cwd` (Current Working Directory) or the project's root directory if `cwd` is omitted.
- **Output Streaming:** Captures and displays standard output (stdout) and standard error (stderr) from the command in real-time within the Roo interface.
- **Long-Running Process Support:** Handles commands that run continuously (like development servers) or take a significant time to complete.
- **Security Validation:** Includes checks to prevent the execution of potentially dangerous command patterns.

---

## Prerequisites

- **User Approval:** The user must explicitly approve the execution of the command when prompted by Roo.
- **Valid Command:** The `command` string must be syntactically correct and executable within the user's default shell environment (considering their OS).
- **Permissions:** The user running VS Code must have the necessary operating system permissions to execute the command and access any files or directories involved. Commands requiring elevated privileges (e.g., `sudo`) may fail or require manual intervention.
- **Tool Availability:** The command itself (e.g., `npm`, `git`, `python`) must be installed and accessible in the system's PATH environment variable.
- **`.rooignore` Compliance:** The command execution and any file access it implies must comply with applicable `.rooignore` rules.

---

## Use Cases

This tool is essential for tasks involving system-level operations or interactions with development toolchains:

- **Project Setup:** Initializing repositories (`git init`), installing dependencies (`npm install`, `pip install -r requirements.txt`, `bundle install`).
- **Building & Compiling:** Running build scripts (`npm run build`, `make`, `mvn package`, `go build`).
- **Running Applications:** Starting development servers (`npm start`, `flask run`, `rails server`), executing scripts (`python main.py`, `node script.js`).
- **Testing & Linting:** Executing test suites (`npm test`, `pytest`), running linters (`eslint .`, `flake8`).
- **Version Control:** Performing Git operations (`git add .`, `git commit -m "message"`, `git push`).
- **File System Operations:** Creating directories (`mkdir`), moving files (`mv`), deleting files (`rm`) when more complex than basic file tools allow.
- **System Diagnostics:** Running commands to check system status or configurations (`npm -v`, `python --version`, `git status`).

---

## Key Features

- **VS Code Terminal Integration:** Leverages VS Code's underlying terminal infrastructure for robust execution.
- **Terminal Management:** Manages terminal instances, potentially reusing them for efficiency while preserving state like `cwd`.
- **Real-time Output:** Provides immediate feedback by streaming command output.
- **Background Process Handling:** Monitors and manages long-running commands.
- **Security Checks:** Incorporates shell-quoting and pattern validation to mitigate risks associated with executing arbitrary commands.
- **ANSI/Escape Code Handling:** Cleans up terminal output by processing common escape sequences.

---

## Limitations

- **Security Restrictions:** Execution is subject to built-in safety checks and `.rooignore` rules. Certain command patterns (e.g., complex subshells) might be blocked.
- **Permissions:** Cannot bypass operating system permissions. Commands requiring `sudo` or administrator rights will likely fail without manual user intervention in the terminal itself.
- **OS Dependency:** Command syntax and availability are specific to the user's operating system (Linux, macOS, Windows) and configured shell.
- **Interactive Prompts:** Commands requiring interactive input (e.g., prompts for passwords, confirmations) may hang or fail as Roo cannot typically provide this input.
- **Environment Variables:** Relies on the environment variables available to the VS Code process, which might differ from a standard user terminal session.

---

## How It Works (Simplified Workflow)

1.  **Parameter Validation:** Checks for the required `command` parameter. Resolves `cwd` if provided.
2.  **Security & `.rooignore` Check:** Parses the command using shell-quoting principles. Validates the command against known dangerous patterns and checks for potential `.rooignore` violations related to file access.
3.  **User Approval:** Presents the exact command and target `cwd` to the user for explicit approval.
4.  **Terminal Acquisition:** Obtains a managed terminal instance, potentially reusing an existing one or creating a new one. Sets the working directory to `cwd`.
5.  **Execution:** Sends the `command` string to the acquired terminal for execution via VS Code's shell integration.
6.  **Output Streaming:** Listens for stdout and stderr data from the terminal process. Streams cleaned-up output (removing ANSI codes) back to the Roo interface in near real-time.
7.  **Monitoring:** Tracks the command's execution state (running, completed, failed). Detects exit codes and signals.
8.  **Result Reporting:** Once the command finishes or is terminated, reports the final status, exit code/signal, and captured output to Roo. For long-running commands, provides ongoing status updates.

---

## Usage Examples

### Example 1: Running a Development Server

**Tool Call:**
```xml
<execute_command>
  <command>npm run dev</command>
  <cwd>./my-web-app</cwd>
</execute_command>
```
**Conceptual Outcome:** Roo requests user approval. If granted, it executes `npm run dev` within the `./my-web-app` directory. Output from the server (e.g., "Server started on port 3000") is streamed to the Roo interface. The command likely continues running until stopped manually or by another Roo action.

### Example 2: Installing Project Dependencies

**Tool Call:**
```xml
<execute_command>
  <command>pip install -r requirements.txt</command>
  <cwd>./python-project</cwd>
</execute_command>
```
**Conceptual Outcome:** After approval, Roo runs the `pip install` command in the specified directory. Output detailing the installation process (downloading packages, building wheels, successful installation messages, or errors) is displayed. The command completes once installation finishes.

### Example 3: Running Multiple Commands Sequentially

**Tool Call:**
```xml
<execute_command>
  <command>npm run build &amp;&amp; npm run deploy</command>
  <cwd>./deployable-app</cwd>
</execute_command>
```
**Note:** The `&` in `&&` is escaped as `&amp;` in XML.
**Conceptual Outcome:** After approval, Roo executes `npm run build`. If the build succeeds (exits with code 0), it then executes `npm run deploy` in the same terminal instance and directory. Output from both commands is streamed.

### Example 4: Checking Git Status

**Tool Call:**
```xml
<execute_command>
  <command>git status</command>
</execute_command>
```
**Conceptual Outcome:** After approval, Roo runs `git status` in the project's root directory (since `cwd` is omitted). The output showing the current branch, tracked/untracked files, etc., is displayed in the interface. The command completes quickly.

---

## Related Concepts and Tools

- **File System Tools (`read_file`, `write_to_file`, etc.):** Use file system tools for direct file manipulation when possible, as they are often safer and more specific than general CLI commands like `cp` or `rm`.
- **`.rooignore`:** Understand how `.rooignore` rules can restrict file access, potentially impacting commands that interact with specific paths.
- **Operating System Shells:** Familiarity with the user's likely shell (Bash, Zsh, PowerShell, Cmd) helps in crafting correct command syntax.
