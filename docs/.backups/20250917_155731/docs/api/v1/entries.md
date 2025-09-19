---
author: API Generator
created: '2025-09-16'
priority: high
status: approved
tags:
- api
- entries
title: Entries API
type: api
updated: '2025-09-16'
version: 1.0.0
---

# Entries API

## Overview

API endpoints for entries operations.

## Authentication

These endpoints require Bearer token authentication.

```http
Authorization: Bearer <access_token>
```

## Endpoints

### GET /entries

**List journal entries**



#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| skip | query | integer | No |  |
| limit | query | integer | No |  |

---

### POST /entries

**Create journal entry**



---

### DELETE /entries/{entry_id}

**Delete entry**



---

### GET /entries/{entry_id}

**Get entry by ID**



#### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| entry_id | path | string | Yes |  |

---

### PUT /entries/{entry_id}

**Update entry**



---

## Errors

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
