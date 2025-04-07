---
title: "access_mcp_resource Tool Reference"
description: "Retrieves data from resources exposed by connected Model Context Protocol (MCP) servers."
category: "Tool Reference"
related_topics:
  - "Model Context Protocol (MCP)"
  - "use_mcp_tool"
  - "Tool Usage"
version: "1.0"
---

# access_mcp_resource Tool Reference

The `access_mcp_resource` tool retrieves data from resources exposed by connected Model Context Protocol (MCP) servers. It allows Roo to access files, API responses, documentation, or system information that provides additional context for tasks. Unlike `use_mcp_tool`, this tool focuses solely on data retrieval, not action execution.

---

## Parameters

The tool requires the following parameters:

| Parameter     | Data Type | Required | Default | Description                                           |
|---------------|-----------|----------|---------|-------------------------------------------------------|
| `server_name` | String    | Yes      | N/A     | The name of the MCP server providing the resource.    |
| `uri`         | String    | Yes      | N/A     | The URI identifying the specific resource to access. |

---

## Core Functionality

- **External Data Retrieval:** Connects to specified MCP servers and fetches data from their exposed resources using the provided URI.
- **Context Provision:** Retrieves additional context (such as text or images) needed for task completion without executing actions on the resource.
- **Resource-Based Access:** Uses URI-based addressing to precisely identify and access the desired resource on the target server.
- **Content Handling:** Processes responses that can include both text and image data, rendering them appropriately in the Roo interface.

---

## Use Cases

This tool is typically used in the following scenarios:

- **Gathering Additional Context:** When Roo requires extra information from external systems (like documentation, configuration files, or API data) to better understand or complete a task.
- **Accessing Domain-Specific Data:** When specialized or proprietary data hosted on an external MCP server is needed.
- **Retrieving Reference Documentation:** To fetch API documentation, technical guides, or other reference materials hosted by MCP servers.
- **Integrating Real-Time Data:** When accessing current data from external APIs exposed via MCP is necessary to incorporate into the task execution.

---

## Key Features

- **Multiple Content Types:** Retrieves and processes both text and image data from MCP resources.
- **User Approval:** Requires explicit user confirmation before accessing any external resource, ensuring security and control.
- **Standardized Communication:** Leverages the Model Context Protocol (MCP) SDK for consistent and secure interactions with servers.
- **Timeouts and Reliability:** Supports configurable timeouts to manage network operations reliably and prevent indefinite hangs.
- **Server Connection Management:** Integrates with the MCP Hub to manage server connection states (connected, connecting, disconnected) and discover available resources.
- **Structured Response Processing:** Handles structured responses from MCP servers, which include metadata and content arrays for comprehensive resource data.

---

## Limitations

- **Server Dependency:** Functionality relies entirely on external MCP servers being available, connected, and properly configured.
- **Resource Availability:** Access is limited to the specific resources exposed by the connected MCP servers. It cannot access data from disabled or disconnected servers.
- **Network Issues:** Network latency or instability can affect the reliability and performance of resource access.
- **Timeout Constraints:** Resource access operations are subject to configured timeouts, which might cause failures on slow networks or with large resources.
- **URI Format Variability:** The exact format, structure, and required parameters within URIs are determined by the specific MCP server implementation. Refer to the server's documentation for details.
- **No Offline Access:** Does not support offline or cached resource retrieval; requires an active connection to the MCP Hub and the target server.

---

## Prerequisites

Before using this tool, ensure the following conditions are met:

- A Model Context Protocol (MCP) Hub must be running and accessible.
- The target MCP server (specified by `server_name`) must be registered and connected to the Hub.
- The user (or the system running Roo) must have the necessary permissions to access the specified resource URI on the target server.
- The user must approve the access request when prompted by Roo.

---

## How It Works (Workflow)

1.  **Connection Validation:**
    - Verifies that an MCP hub is available and initialized.
    - Confirms the specified `server_name` exists in the list of connected servers.
    - Checks if the target server is enabled; returns an error if it's disabled.
2.  **User Approval:**
    - Presents the resource access request details (server name and resource URI) to the user for verification.
    - Proceeds only if the user explicitly approves the access.
3.  **Resource Request:**
    - Uses the Model Context Protocol SDK to send a `resources/read` request to the specified server via the MCP Hub.
    - Applies configured timeouts to the network request.
4.  **Response Processing:**
    - Receives a structured response from the server, typically containing metadata and an array of content items (text or images).
    - Processes text content for display.
    - Handles image data for appropriate rendering in the user interface.
    - Returns the processed resource data (text and/or image references) to Roo for use in the ongoing task.

---

## Resource Types Provided by MCP Servers

MCP servers can expose resources in two main ways:

- **Standard Resources:** Fixed resources identified by specific, static URIs. These often represent static data files or endpoints providing real-time information (e.g., `config://production/database`).
- **Resource Templates:** Parameterized resources with placeholders in the URI structure. These allow for dynamic resource generation based on parameters provided within the URI itself (e.g., `weather://{city}/{forecast_type}`). The specific template format depends on the server implementation.

---

## Usage Examples

Below are examples demonstrating how to use the `access_mcp_resource` tool. Note that the exact structure and content of the returned data depend on the specific MCP server and resource implementation.

### Example 1: Accessing Current Weather Data

**Input:**
```xml
<access_mcp_resource>
  <server_name>weather-server</server_name>
  <uri>weather://san-francisco/current</uri>
</access_mcp_resource>
```
**Expected Output (Conceptual):** The tool would return structured data (e.g., JSON or formatted text) containing the current weather conditions for San Francisco, as provided by the `weather-server`. The user would see this data displayed in the interface.

### Example 2: Retrieving API Documentation

**Input:**
```xml
<access_mcp_resource>
  <server_name>api-docs</server_name>
  <uri>docs://payment-service/endpoints</uri>
</access_mcp_resource>
```
**Expected Output (Conceptual):** The tool would return the API documentation content (likely Markdown or plain text) for the payment service endpoints from the `api-docs` server. This text would be displayed to the user.

### Example 3: Accessing Domain-Specific Knowledge

**Input:**
```xml
<access_mcp_resource>
  <server_name>knowledge-base</server_name>
  <uri>kb://medical/terminology/common</uri>
</access_mcp_resource>
```
**Expected Output (Conceptual):** The tool would retrieve information related to common medical terminology from the specified knowledge base server, displaying the relevant text or data.

### Example 4: Fetching System Configuration

**Input:**
```xml
<access_mcp_resource>
  <server_name>infra-monitor</server_name>
  <uri>config://production/database</uri>
</access_mcp_resource>
```
**Expected Output (Conceptual):** The tool would return configuration details (e.g., connection strings, settings as text or JSON) for the production database, sourced from the `infra-monitor` server.

---

## Related Concepts and Tools

- **Model Context Protocol (MCP):** The underlying protocol used for communication between Roo and external servers. Understanding MCP concepts (Hub, Servers, Resources) provides essential context for this tool.
- **`use_mcp_tool`:** A related tool that *executes actions* on MCP resources rather than just retrieving data. Use `access_mcp_resource` for reading information and `use_mcp_tool` for performing operations. See the `use_mcp_tool` documentation for details.
