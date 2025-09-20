---
id: api-reference
title: Flask Journal API Reference
type: api
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- api
- python
priority: high
status: approved
visibility: internal
schema_version: v1
---

***

title: "Flask Journal API Reference"
description: "Comprehensive reference for all API endpoints in the Flask Journal application"
category: "API Reference"
date\_created: "2025-04-08"
last\_updated: "2025-04-08"
version: "1.0"
status: active
related\_topics:
\- "Authentication"
\- "Data Model"
tags: \["api", "reference", "endpoints", "flask"]
-------------------------------------------------

# Flask Journal API Reference

## Overview

This document provides a comprehensive reference for all API endpoints available in the Flask Journal application. The API enables programmatic interaction with journal entries, user authentication, and Markdown rendering capabilities.

## API Conventions

### Base URL

All API endpoints are relative to the base URL of your Flask Journal installation. For the development server, this is typically:

```
http://localhost:5000
```

### Authentication

Most endpoints require authentication using Flask-Login's session-based authentication. Protected endpoints will return a `401 Unauthorized` status code if accessed without proper authentication, or a `403 Forbidden` status code if the authenticated user lacks the necessary permissions.

### Response Format

API responses are returned in JSON format with the following general structure:

**Success Response:**

```json
{
  "data": {
    // Response data varies by endpoint
  }
}
```

**Error Response:**

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### HTTP Status Codes

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was malformed or contained invalid parameters
- `401 Unauthorized`: Authentication is required but was not provided
- `403 Forbidden`: The authenticated user lacks permission for the requested resource
- `404 Not Found`: The requested resource does not exist
- `500 Internal Server Error`: An unexpected error occurred on the server

## API Endpoints

### Markdown Rendering

#### Preview Markdown

Renders Markdown text as HTML for preview purposes.

| Attribute         | Value                      |
| ----------------- | -------------------------- |
| **URL**           | `/api/markdown/preview` |
| **Method**        | `POST`                     |
| **Auth Required** | Yes                        |

**Request Body:**

```json
{
  "text": "# Markdown content\n\nThis is some **bold** text."
}
```

**Success Response:**

Status Code: `200 OK`

```json
{
  "html": "<h1>Markdown content</h1>\n<p>This is some <strong>bold</strong> text.</p>"
}
```

**Error Responses:**

Status Code: `400 Bad Request`

```json
{
  "error": "Request must be JSON"
}
```

Status Code: `500 Internal Server Error`

```json
{
  "error": "Failed to render Markdown"
}
```

**Example Usage:**

```javascript
// JavaScript example using fetch
async function previewMarkdown(markdownText) {
  const response = await fetch('/api/markdown/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: markdownText }),
    credentials: 'same-origin' // Required for session authentication
  });
  
  if (!response.ok) {
    throw new Error('Failed to preview markdown');
  }
  
  const result = await response.json();
  return result.html;
}
```

**Notes:**

- This endpoint uses the Python `markdown` library with the following extensions enabled:
  \- `markdown.extensions.tables`
  \- `markdown.extensions.fenced_code`
  \- `markdown.extensions.extra`
- The endpoint is protected by `login_required` to prevent unauthorized usage
- Empty strings or null values for `text` will return an empty HTML result

### Authentication Endpoints

These endpoints are not traditional API endpoints but are HTML form-based routes that handle authentication. They are included here for completeness.

#### Register User

| Attribute         | Value            |
| ----------------- | ---------------- |
| **URL**           | `/auth/register` |
| **Method**        | `GET`, `POST`    |
| **Auth Required** | No               |

This endpoint displays a registration form (GET) and processes new user registrations (POST).

**Form Parameters:**

- `username`: Unique username for the new account
- `email`: Unique email address
- `password`: User's password
- `password2`: Password confirmation (must match password)

The endpoint performs validation including checking for duplicate usernames and emails before creating a new user account.

#### Login

| Attribute         | Value         |
| ----------------- | ------------- |
| **URL**           | `/auth/login` |
| **Method**        | `GET`, `POST` |
| **Auth Required** | No            |

This endpoint displays a login form (GET) and processes authentication requests (POST).

**Form Parameters:**

- `username`: Registered username
- `password`: User's password
- `remember_me`: Boolean field for persistent login session

**Notes:**

- Supports a `next` URL parameter for redirecting to protected pages after login
- Performs security checks on the `next` parameter to prevent open redirects

#### Logout

| Attribute         | Value          |
| ----------------- | -------------- |
| **URL**           | `/auth/logout` |
| **Method**        | `GET`          |
| **Auth Required** | Yes            |

This endpoint terminates the user's session. It is protected by the `login_required` decorator.

### Journal Entry Endpoints

These endpoints are primarily HTML-based routes that handle CRUD operations for journal entries. They are included here for completeness.

#### List Journal Entries

| Attribute         | Value         |
| ----------------- | ------------- |
| **URL**           | `/`, `/index` |
| **Method**        | `GET`         |
| **Auth Required** | Yes           |

Displays a paginated list of journal entries for the authenticated user.

**Query Parameters:**

- `page`: Page number for pagination (default: 1)

#### Create New Entry

| Attribute         | Value         |
| ----------------- | ------------- |
| **URL**           | `/new_entry`  |
| **Method**        | `GET`, `POST` |
| **Auth Required** | Yes           |

This endpoint displays an entry creation form (GET) and processes new journal entry submissions (POST).

**Form Parameters:**

- `title`: The title of the journal entry
- `body`: The main content of the journal entry
- `tags`: Optional comma-separated list of tags

#### View Entry

| Attribute         | Value               |
| ----------------- | ------------------- |
| **URL**           | `/entry/<entry_id>` |
| **Method**        | `GET`               |
| **Auth Required** | Yes                 |

Displays a detailed view of a single journal entry.

**URL Parameters:**

- `entry_id`: The ID of the entry to view

**Notes:**

- Returns 404 if the entry doesn't exist
- Returns 403 if the entry belongs to another user

#### Edit Entry

| Attribute         | Value                    |
| ----------------- | ------------------------ |
| **URL**           | `/edit_entry/<entry_id>` |
| **Method**        | `GET`, `POST`            |
| **Auth Required** | Yes                      |

This endpoint displays an edit form pre-populated with entry data (GET) and processes updates to an existing entry (POST).

**URL Parameters:**

- `entry_id`: The ID of the entry to edit

**Form Parameters:**

- `title`: The updated title of the journal entry
- `body`: The updated content of the journal entry
- `tags`: Optional comma-separated list of tags

**Notes:**

- Returns 404 if the entry doesn't exist
- Returns 403 if the entry belongs to another user

#### Delete Entry

| Attribute         | Value                      |
| ----------------- | -------------------------- |
| **URL**           | `/delete_entry/<entry_id>` |
| **Method**        | `POST`                     |
| **Auth Required** | Yes                        |

Deletes a journal entry.

**URL Parameters:**

- `entry_id`: The ID of the entry to delete

**Notes:**

- Only accepts POST requests for security reasons
- Returns 404 if the entry doesn't exist
- Returns 403 if the entry belongs to another user

#### Entries by Tag

| Attribute         | Value             |
| ----------------- | ----------------- |
| **URL**           | `/tag/<tag_name>` |
| **Method**        | `GET`             |
| **Auth Required** | Yes               |

Displays all journal entries associated with a specific tag.

**URL Parameters:**

- `tag_name`: The name of the tag to filter by

**Query Parameters:**

- `page`: Page number for pagination (default: 1)

**Notes:**

- Returns 404 if the tag doesn't exist
- Only shows entries belonging to the authenticated user

## API Extension Points

### Potential Future Endpoints

The following endpoints are not currently implemented but may be added in future versions:

- `GET /api/entries`: JSON API for retrieving journal entries
- `POST /api/entries`: JSON API for creating journal entries
- `GET /api/entries/<entry_id>`: JSON API for retrieving a specific entry
- `PUT /api/entries/<entry_id>`: JSON API for updating a specific entry
- `DELETE /api/entries/<entry_id>`: JSON API for deleting a specific entry
- `GET /api/tags`: JSON API for retrieving all tags

## Security Considerations

- All API endpoints that modify data (POST, PUT, DELETE) should include CSRF protection
- Authentication is currently session-based, requiring cookies to be sent with requests
- Future versions may add token-based authentication (JWT) for programmatic API access

## See Also

- [Authentication Guide](guides/authentication.md)
- [Data Model Documentation](guides/data-model.md)
