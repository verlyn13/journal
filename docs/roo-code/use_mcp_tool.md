---
title: "use_mcp_tool Tool Reference"
description: "Executes actions or operations provided by external tools hosted on connected Model Context Protocol (MCP) servers."
category: "Tool Reference"
related_topics:
  - "Model Context Protocol (MCP)"
  - "access_mcp_resource Tool"
  - "External Integrations"
  - "Custom Tools"
version: "1.0"
tags: ["mcp", "external tools", "actions", "integration", "rpc", "schema validation"]
---

# use_mcp_tool Tool Reference

The `use_mcp_tool` tool enables Roo to execute specific actions or operations offered by external tools running on connected Model Context Protocol (MCP) servers. This extends Roo's capabilities beyond its built-in tools, allowing it to leverage specialized, domain-specific, or proprietary functionality provided by these external servers.

**Contrast with `access_mcp_resource`:** While [`access_mcp_resource`](./access_mcp-tool.md) is used for *reading data* from MCP resources, `use_mcp_tool` is used for *executing actions* or operations defined by MCP tools.

---

## Parameters

The tool uses the following parameters:

| Parameter     | Data Type   | Required | Default | Description                                                                                                                                                                                             |
|---------------|-------------|----------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server_name` | String      | Yes      | N/A     | The unique name of the connected MCP server that provides the desired tool.                                                                                                                             |
| `tool_name`   | String      | Yes      | N/A     | The name of the specific tool (action/operation) to execute on the target server.                                                                                                                       |
| `arguments`   | JSON Object | Varies   | `{}`    | A JSON object containing the input parameters required by the specified `tool_name`. The structure must conform to the tool's defined input schema. Required if the tool expects input; optional otherwise. |

---

## Core Functionality

- **External Action Execution:** Invokes functions or operations defined by tools on remote MCP servers.
- **Argument Passing:** Sends structured input data (as a JSON object in the `arguments` parameter) to the external tool.
- **Schema Validation:** Automatically validates the provided `arguments` against the target tool's input schema (often defined using Zod) before sending the request, ensuring data integrity.
- **Response Handling:** Processes potentially complex responses from the MCP tool, which can include text, images, or references to other MCP resources.
- **Standardized Communication:** Uses the Model Context Protocol SDK for reliable and consistent interaction with MCP servers.

---

## Prerequisites

- **MCP Hub Connection:** Roo must be connected to an active MCP Hub.
- **Server Availability:** The target MCP server (specified by `server_name`) must be connected to the Hub and enabled.
- **Tool Existence:** The specified `tool_name` must exist and be exposed by the target `server_name`.
- **Valid Arguments:** The `arguments` JSON object must conform to the input schema defined by the target tool. Schema mismatches will result in errors.
- **User Approval:** Unless the specific tool on the server is configured as "always allow" in Roo's settings, the user must explicitly approve the execution request.

---

## Use Cases

This tool is essential when Roo needs to perform actions that require external capabilities:

- **Executing Specialized Operations:** Performing tasks not covered by Roo's built-in tools (e.g., triggering a build pipeline, deploying code via an external service).
- **Domain-Specific Processing:** Leveraging external tools for tasks requiring specific expertise (e.g., running a complex simulation, performing advanced statistical analysis, generating specialized reports).
- **Interacting with External Systems:** Sending commands or data to external APIs, databases, or services managed via an MCP server.
- **Data Transformation/Generation:** Using external tools to generate code, images, configuration files, or other artifacts based on provided inputs.
- **Accessing Proprietary Logic:** Interacting with closed-source or proprietary business logic exposed securely through an MCP tool.

---

## Key Features

- **MCP SDK Integration:** Relies on the `@modelcontextprotocol/sdk` for standardized communication.
- **Schema Validation (Zod):** Ensures argument integrity before requests are sent and potentially upon receiving responses.
- **Multi-Content Response Handling:** Can process responses containing text, images (with MIME types), and resource URIs.
- **Configurable Timeouts:** Protects against hanging operations with adjustable timeouts (default 60s).
- **User Approval Control:** Includes an "always allow" mechanism for trusted tools to bypass repeated user confirmation.
- **Server Management:** Integrates with features like automatic server restarts on code changes (if configured).

---

## Limitations

- **Server Dependency:** Functionality is entirely dependent on the availability, connection status, and correct implementation of the external MCP server and its tools.
- **Network Reliability:** Performance and success are subject to network connectivity between Roo and the MCP Hub/Server.
- **Tool Capabilities:** Limited to the specific tools and operations exposed by the connected servers.
- **User Approval Requirement:** Most operations require explicit user confirmation, adding an interaction step.
- **Sequential Execution:** Typically handles one MCP tool execution at a time per request.

---

## How It Works (Simplified Workflow)

1.  **Validation:**
    - Verifies MCP Hub connection, server existence/connection (`server_name`), and tool existence (`tool_name`).
    - Retrieves the target tool's input schema from the server.
    - Validates the provided `arguments` JSON against the schema.
    - Checks timeout configurations.
2.  **User Approval:** If the tool is not on the "always allow" list, presents the server name, tool name, and arguments to the user for approval.
3.  **Request Execution:**
    - Selects the appropriate communication transport (e.g., Stdio, SSE).
    - Sends the validated request (server, tool, arguments) to the MCP server via the Hub using the MCP SDK.
    - Applies the configured timeout to the operation.
4.  **Response Handling:**
    - Receives the response from the MCP server.
    - Checks for errors indicated by the server.
    - Processes the response content (text, image, resource references).
5.  **Result Formatting:** Formats the processed response (or error message) for display in the Roo interface and for the AI model's context.

---

## Usage Examples

### Example 1: Requesting a Weather Forecast (Text Response)

**Tool Call:**
```xml
<use_mcp_tool>
  <server_name>weather-server</server_name>
  <tool_name>get_forecast</tool_name>
  <arguments>{
  "city": "San Francisco",
  "days": 3,
  "units": "metric"
}</arguments>
</use_mcp_tool>
```
**Conceptual Outcome:** After approval, Roo sends the request to the `weather-server`. The `get_forecast` tool processes the arguments and returns a text-based weather forecast for San Francisco for the next 3 days in metric units. Roo displays this text.

### Example 2: Generating an Image

**Tool Call:**
```xml
<use_mcp_tool>
  <server_name>image-gen-service</server_name>
  <tool_name>create_logo</tool_name>
  <arguments>{
  "company_name": "Roo Code",
  "style_description": "Minimalist, tech-focused, blue and white",
  "output_format": "png"
}</arguments>
</use_mcp_tool>
```
**Conceptual Outcome:** After approval, the request goes to the `image-gen-service`. The `create_logo` tool generates a logo based on the prompt. The response likely contains image data (e.g., base64 encoded PNG), which Roo renders visually in the interface.

### Example 3: Triggering a Deployment Pipeline

**Tool Call:**
```xml
<use_mcp_tool>
  <server_name>ci-cd-gateway</server_name>
  <tool_name>trigger_deployment</tool_name>
  <arguments>{
  "environment": "staging",
  "service_name": "user-api",
  "commit_hash": "a1b2c3d4"
}</arguments>
</use_mcp_tool>
```
**Conceptual Outcome:** After approval, Roo interacts with the `ci-cd-gateway` server. The `trigger_deployment` tool initiates a deployment process for the specified service/commit to the staging environment. The response might be a simple text confirmation (e.g., "Deployment triggered successfully") or a URI pointing to the pipeline status ([`access_mcp_resource`](./access_mcp-tool.md) could then be used to check it).

### Example 4: Tool with No Arguments

**Tool Call:**
```xml
<use_mcp_tool>
  <server_name>system-status</server_name>
  <tool_name>ping</tool_name>
  <arguments>{}</arguments> <!-- Empty JSON object for no arguments -->
</use_mcp_tool>
```
**Conceptual Outcome:** After approval, Roo calls the `ping` tool on the `system-status` server. The tool likely performs a health check and returns a simple status message (e.g., "Pong" or "System OK").

---

## Related Concepts and Tools

- **Model Context Protocol (MCP):** The underlying standard enabling communication with external tools and resources.
- **[`access_mcp_resource`](./access_mcp-tool.md):** Used to *read data* from resources exposed by MCP servers, sometimes using URIs returned by `use_mcp_tool`.
- **Schema Validation (e.g., Zod):** Used by MCP servers to define and enforce the expected structure of tool arguments.
