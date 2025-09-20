#!/usr/bin/env python3
"""
OpenAPI to Markdown generator for Journal application.
Generates structured API documentation from FastAPI OpenAPI spec.
"""

from datetime import datetime
import json
from pathlib import Path
import sys
from typing import Any, Dict, List

import yaml


# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class OpenAPIToMarkdownGenerator:
    """Converts OpenAPI spec to structured Markdown documentation."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.api_dir = project_root / "docs" / "api" / "v1"
        self.api_dir.mkdir(parents=True, exist_ok=True)

    def generate_from_fastapi(self) -> Dict[str, Any]:
        """Extract OpenAPI spec from FastAPI application."""
        try:
            # Import FastAPI app
            sys.path.insert(0, str(self.project_root / "apps" / "api"))
            from fastapi.openapi.utils import get_openapi

            from app.main import app

            # Generate OpenAPI spec
            openapi_spec = get_openapi(
                title=app.title,
                version=app.version,
                description=app.description,
                routes=app.routes,
            )

            return openapi_spec

        except ImportError as e:
            print(f"Error importing FastAPI app: {e}")
            print("Falling back to manual OpenAPI generation...")
            return self._generate_fallback_spec()

    def _generate_fallback_spec(self) -> Dict[str, Any]:
        """Generate OpenAPI spec by scanning route files."""
        spec = {
            "openapi": "3.0.0",
            "info": {
                "title": "Journal API",
                "version": "1.0.0",
                "description": "Personal journaling application API",
            },
            "servers": [{"url": "/api/v1", "description": "API v1"}],
            "paths": {},
            "components": {
                "schemas": {},
                "securitySchemes": {
                    "bearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT",
                    }
                },
            },
        }

        # Scan API route files
        api_v1_dir = self.project_root / "apps" / "api" / "app" / "api" / "v1"
        if api_v1_dir.exists():
            for py_file in api_v1_dir.glob("*.py"):
                if py_file.stem == "__init__":
                    continue
                self._extract_routes_from_file(py_file, spec)

        return spec

    def _extract_routes_from_file(self, file_path: Path, spec: Dict):
        """Extract route information from a Python file."""
        resource = file_path.stem

        # Common CRUD patterns
        if resource == "auth":
            spec["paths"]["/auth/login"] = {
                "post": {
                    "summary": "User login",
                    "tags": ["Authentication"],
                    "operationId": "login",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/LoginRequest"}
                            }
                        },
                    },
                    "responses": {
                        "200": {
                            "description": "Successful login",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/TokenResponse"
                                    }
                                }
                            },
                        }
                    },
                }
            }
            spec["paths"]["/auth/refresh"] = {
                "post": {
                    "summary": "Refresh access token",
                    "tags": ["Authentication"],
                    "security": [{"bearerAuth": []}],
                }
            }

        elif resource == "entries":
            spec["paths"]["/entries"] = {
                "get": {
                    "summary": "List journal entries",
                    "tags": ["Entries"],
                    "security": [{"bearerAuth": []}],
                    "parameters": [
                        {"name": "skip", "in": "query", "schema": {"type": "integer"}},
                        {"name": "limit", "in": "query", "schema": {"type": "integer"}},
                    ],
                },
                "post": {
                    "summary": "Create journal entry",
                    "tags": ["Entries"],
                    "security": [{"bearerAuth": []}],
                },
            }
            spec["paths"]["/entries/{entry_id}"] = {
                "get": {
                    "summary": "Get entry by ID",
                    "tags": ["Entries"],
                    "security": [{"bearerAuth": []}],
                    "parameters": [
                        {
                            "name": "entry_id",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                        }
                    ],
                },
                "put": {
                    "summary": "Update entry",
                    "tags": ["Entries"],
                    "security": [{"bearerAuth": []}],
                },
                "delete": {
                    "summary": "Delete entry",
                    "tags": ["Entries"],
                    "security": [{"bearerAuth": []}],
                },
            }

    def generate_markdown(self, openapi_spec: Dict) -> Dict[str, str]:
        """Convert OpenAPI spec to Markdown files."""
        markdown_files = {}

        # Group paths by tag
        paths_by_tag = self._group_paths_by_tag(openapi_spec)

        # Generate a file for each tag/resource
        for tag, paths in paths_by_tag.items():
            filename = f"{tag.lower().replace(' ', '-')}.md"
            content = self._generate_resource_markdown(tag, paths, openapi_spec)
            markdown_files[filename] = content

        # Generate overview file
        markdown_files["README.md"] = self._generate_overview_markdown(
            openapi_spec, paths_by_tag
        )

        return markdown_files

    def _group_paths_by_tag(self, spec: Dict) -> Dict[str, List]:
        """Group API paths by their tags."""
        paths_by_tag = {}

        for path, methods in spec.get("paths", {}).items():
            for method, operation in methods.items():
                if method in ["parameters", "servers"]:
                    continue

                tags = operation.get("tags", ["Untagged"])
                for tag in tags:
                    if tag not in paths_by_tag:
                        paths_by_tag[tag] = []
                    paths_by_tag[tag].append(
                        {"path": path, "method": method.upper(), "operation": operation}
                    )

        return paths_by_tag

    def _generate_resource_markdown(self, tag: str, paths: List, spec: Dict) -> str:
        """Generate Markdown for a specific resource/tag."""
        # Generate frontmatter
        frontmatter = {
            "title": f"{tag} API",
            "type": "api",
            "version": spec.get("info", {}).get("version", "1.0.0"),
            "created": datetime.now().strftime("%Y-%m-%d"),
            "updated": datetime.now().strftime("%Y-%m-%d"),
            "author": "API Generator",
            "tags": ["api", tag.lower().replace(" ", "-")],
            "priority": "high",
            "status": "approved",
        }

        content = f"""---
{yaml.dump(frontmatter, default_flow_style=False)}---

# {tag} API

## Overview

API endpoints for {tag.lower()} operations.

## Authentication

"""
        # Add authentication info
        if any(p["operation"].get("security") for p in paths):
            content += "These endpoints require Bearer token authentication.\n\n"
            content += "```http\nAuthorization: Bearer <access_token>\n```\n\n"
        else:
            content += "These endpoints do not require authentication.\n\n"

        content += "## Endpoints\n\n"

        # Generate endpoint documentation
        for path_info in sorted(paths, key=lambda x: (x["path"], x["method"])):
            content += self._generate_endpoint_markdown(path_info, spec)

        content += """## Errors

Common error responses:

| Status Code | Description |
|------------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

## Rate Limiting

API rate limits:
- Authenticated: 1000 requests per hour
- Unauthenticated: 100 requests per hour

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp
"""

        return content

    def _generate_endpoint_markdown(self, path_info: Dict, spec: Dict) -> str:
        """Generate Markdown for a single endpoint."""
        path = path_info["path"]
        method = path_info["method"]
        operation = path_info["operation"]

        content = f"""### {method} {path}

**{operation.get("summary", "No summary")}**

{operation.get("description", "")}

"""
        # Operation ID
        if operation.get("operationId"):
            content += f"Operation ID: `{operation['operationId']}`\n\n"

        # Parameters
        params = operation.get("parameters", [])
        if params:
            content += "#### Parameters\n\n"
            content += "| Name | In | Type | Required | Description |\n"
            content += "|------|-----|------|----------|-------------|\n"

            for param in params:
                name = param.get("name", "")
                in_type = param.get("in", "")
                schema = param.get("schema", {})
                param_type = schema.get("type", "string")
                required = "Yes" if param.get("required") else "No"
                description = param.get("description", "")
                content += f"| {name} | {in_type} | {param_type} | {required} | {description} |\n"

            content += "\n"

        # Request body
        if operation.get("requestBody"):
            content += "#### Request Body\n\n"
            req_body = operation["requestBody"]
            if req_body.get("required"):
                content += "**Required**\n\n"

            if "content" in req_body:
                for content_type, schema_info in req_body["content"].items():
                    content += f"Content-Type: `{content_type}`\n\n"

                    # Add schema example if available
                    if "$ref" in schema_info.get("schema", {}):
                        ref = schema_info["schema"]["$ref"].split("/")[-1]
                        content += f"Schema: [{ref}](#/components/schemas/{ref})\n\n"
                    else:
                        content += "```json\n"
                        content += json.dumps(schema_info.get("schema", {}), indent=2)
                        content += "\n```\n\n"

        # Responses
        if operation.get("responses"):
            content += "#### Responses\n\n"

            for status_code, response in operation["responses"].items():
                description = response.get("description", "")
                content += f"##### {status_code} - {description}\n\n"

                if "content" in response:
                    for content_type, schema_info in response["content"].items():
                        content += f"Content-Type: `{content_type}`\n\n"

                        if "example" in schema_info:
                            content += "Example:\n```json\n"
                            content += json.dumps(schema_info["example"], indent=2)
                            content += "\n```\n\n"
                        elif "$ref" in schema_info.get("schema", {}):
                            ref = schema_info["schema"]["$ref"].split("/")[-1]
                            content += (
                                f"Schema: [{ref}](#/components/schemas/{ref})\n\n"
                            )

        content += "---\n\n"
        return content

    def _generate_overview_markdown(self, spec: Dict, paths_by_tag: Dict) -> str:
        """Generate API overview Markdown."""
        info = spec.get("info", {})

        frontmatter = {
            "title": "API Reference Overview",
            "type": "api",
            "version": info.get("version", "1.0.0"),
            "created": datetime.now().strftime("%Y-%m-%d"),
            "updated": datetime.now().strftime("%Y-%m-%d"),
            "author": "API Generator",
            "tags": ["api", "reference", "overview"],
            "priority": "high",
            "status": "approved",
        }

        content = f"""---
{yaml.dump(frontmatter, default_flow_style=False)}---

# {info.get("title", "API")} Reference

Version: {info.get("version", "1.0.0")}

## Description

{info.get("description", "API documentation for the Journal application.")}

## Base URL

```
{spec.get("servers", [{"url": "/api/v1"}])[0]["url"]}
```

## Authentication

This API uses JWT Bearer token authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

## Resources

"""
        # List all resources
        for tag in sorted(paths_by_tag.keys()):
            endpoint_count = len(paths_by_tag[tag])
            filename = f"{tag.lower().replace(' ', '-')}.md"
            content += f"- [{tag}](./{filename}) - {endpoint_count} endpoints\n"

        content += """
## Common Headers

### Request Headers
- `Content-Type`: application/json
- `Authorization`: Bearer <token>

### Response Headers
- `Content-Type`: application/json
- `X-Request-ID`: Unique request identifier

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

## Pagination

List endpoints support pagination:
- `skip`: Number of items to skip (default: 0)
- `limit`: Number of items to return (default: 20, max: 100)
"""

        return content

    def save_markdown_files(self, markdown_files: Dict[str, str]):
        """Save generated Markdown files to disk."""
        for filename, content in markdown_files.items():
            file_path = self.api_dir / filename
            file_path.write_text(content)
            print(f"  Generated: {file_path.relative_to(self.project_root)}")

    def validate_coverage(self, spec: Dict) -> Dict[str, Any]:
        """Validate API documentation coverage."""
        coverage = {
            "total_paths": 0,
            "documented_paths": 0,
            "missing_summaries": [],
            "missing_descriptions": [],
            "missing_examples": [],
            "coverage_percentage": 0,
        }

        for path, methods in spec.get("paths", {}).items():
            for method, operation in methods.items():
                if method in ["parameters", "servers"]:
                    continue

                coverage["total_paths"] += 1

                if operation.get("summary"):
                    coverage["documented_paths"] += 1
                else:
                    coverage["missing_summaries"].append(f"{method.upper()} {path}")

                if not operation.get("description"):
                    coverage["missing_descriptions"].append(f"{method.upper()} {path}")

                # Check for response examples
                has_example = False
                for response in operation.get("responses", {}).values():
                    if "content" in response:
                        for content in response["content"].values():
                            if "example" in content or "examples" in content:
                                has_example = True
                                break

                if not has_example:
                    coverage["missing_examples"].append(f"{method.upper()} {path}")

        if coverage["total_paths"] > 0:
            coverage["coverage_percentage"] = (
                coverage["documented_paths"] / coverage["total_paths"]
            ) * 100

        return coverage


def main():
    """Main function."""
    project_root = Path(__file__).parent.parent
    generator = OpenAPIToMarkdownGenerator(project_root)

    print("Generating API documentation from OpenAPI spec...")

    # Generate OpenAPI spec
    openapi_spec = generator.generate_from_fastapi()

    # Save OpenAPI spec
    spec_file = project_root / "docs" / "api" / "openapi.json"
    spec_file.parent.mkdir(parents=True, exist_ok=True)
    with open(spec_file, "w") as f:
        json.dump(openapi_spec, f, indent=2)
    print(f"  Saved OpenAPI spec to: {spec_file.relative_to(project_root)}")

    # Generate Markdown files
    markdown_files = generator.generate_markdown(openapi_spec)

    # Save Markdown files
    generator.save_markdown_files(markdown_files)

    # Validate coverage
    coverage = generator.validate_coverage(openapi_spec)

    print("\nAPI Documentation Coverage:")
    print(f"  Total endpoints: {coverage['total_paths']}")
    print(f"  Documented: {coverage['documented_paths']}")
    print(f"  Coverage: {coverage['coverage_percentage']:.1f}%")

    if coverage["missing_summaries"]:
        print(f"  Missing summaries: {len(coverage['missing_summaries'])}")

    if coverage["missing_examples"]:
        print(f"  Missing examples: {len(coverage['missing_examples'])}")

    # Save coverage report
    coverage_file = (
        project_root / "docs" / "_generated" / "reports" / "api_coverage.json"
    )
    coverage_file.parent.mkdir(parents=True, exist_ok=True)
    with open(coverage_file, "w") as f:
        json.dump(coverage, f, indent=2)

    print("\n✅ API documentation generated successfully!")


if __name__ == "__main__":
    main()
