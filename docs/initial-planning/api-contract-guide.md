---
title: "API Contract Guide: Flask Journal System"
description: "Defines standards for internal API endpoints, including design principles, request/response formats, authentication, and documentation for the Flask Journal MVP."
category: "Project Planning"
related_topics:
  - "Flask Journal MVP Scope Definition"
  - "Error Handling Guide"
  - "Authentication/Authorization" # Conceptual link
version: "1.0"
tags: ["api", "contract", "flask", "json", "rest", "standards", "design", "mvp", "planning"]
---

# API Contract Guide for Flask Blog/Journal System

This guide establishes standards for the internal API endpoints that support UI functionality in your Flask blog/journal application. Following the "lean and mean" philosophy, this guide focuses on practical implementation examples using the agreed technology stack (Flask, SQLAlchemy, HTMX, Alpine.js, Redis).

## Table of Contents

- [API Contract Guide for Flask Blog/Journal System](#api-contract-guide-for-flask-blogjournal-system)
  - [Table of Contents](#table-of-contents)
  - [API Design Principles](#api-design-principles)
    - [URL Structure](#url-structure)
    - [HTTP Verb Usage](#http-verb-usage)
    - [Query Parameter Conventions](#query-parameter-conventions)
    - [Status Codes](#status-codes)
  - [Request/Response Formats](#requestresponse-formats)
    - [Standard JSON Structure](#standard-json-structure)
    - [Error Response Format](#error-response-format)
    - [Pagination Format](#pagination-format)
    - [Filtering and Sorting Conventions](#filtering-and-sorting-conventions)
  - [Authentication/Authorization](#authenticationauthorization)
    - [Authentication Mechanism](#authentication-mechanism)
    - [Required Headers](#required-headers)
    - [Permission Checking](#permission-checking)
    - [Rate Limiting Implementation](#rate-limiting-implementation)
  - [Documentation Standards](#documentation-standards)
    - [Inline Documentation](#inline-documentation)
    - [API Reference Documentation](#api-reference-documentation)
    - [Example Request/Response](#example-requestresponse)
  - [API Examples (Conceptual)](#api-examples-conceptual)
    - [Get API Token](#get-api-token)
    - [List Entries](#list-entries)
    - [Get Single Entry](#get-single-entry)
    - [Create Entry](#create-entry)
    - [Update Entry](#update-entry)
    - [Delete Entry](#delete-entry)
  - [Error Examples](#error-examples)
    - [Authentication Error](#authentication-error)
    - [Validation Error](#validation-error)
    - [Resource Not Found](#resource-not-found)
    - [Permission Denied](#permission-denied)
    - [Rate Limit Exceeded](#rate-limit-exceeded)

## API Design Principles

### URL Structure

Organize endpoints logically with a consistent URL structure:

```
/api/v1/{resource}/{id?}/{sub-resource?}
```

Examples:

- `/api/v1/entries` - List all entries
- `/api/v1/entries/123` - Get a specific entry
- `/api/v1/entries/123/tags` - Get tags for a specific entry

Implementation in Flask:

```python
# app/routes/api.py
from flask import Blueprint, request, jsonify
# Assuming services and decorators exist
# from app.services.entry_service import EntryService
# from app.auth.decorators import api_auth_required, current_user

# Create Blueprint with API prefix
api_bp = Blueprint('api', __name__, url_prefix='/api/v1')
# entry_service = EntryService() # Instantiate service

# Resource collection
@api_bp.route('/entries', methods=['GET'])
# @api_auth_required # Apply auth decorator
def get_entries():
    # Implementation for listing entries
    # user_id = current_user.id if current_user else None
    # result = entry_service.get_entries(user_id=user_id, ...)
    return jsonify({"message": "List entries endpoint"}), 200 # Placeholder

# Resource item
@api_bp.route('/entries/<int:entry_id>', methods=['GET'])
# @api_auth_required
def get_entry(entry_id):
    # Implementation for getting a specific entry
    # user_id = current_user.id if current_user else None
    # result = entry_service.get_entry(entry_id, user_id)
    return jsonify({"message": f"Get entry {entry_id}"}), 200 # Placeholder

# Sub-resource
@api_bp.route('/entries/<int:entry_id>/tags', methods=['GET'])
# @api_auth_required
def get_entry_tags(entry_id):
    # Implementation for getting tags of a specific entry
    # user_id = current_user.id if current_user else None
    # result = entry_service.get_entry_tags(entry_id, user_id)
    return jsonify({"message": f"Get tags for entry {entry_id}"}), 200 # Placeholder
```

Register the blueprint in the application factory:

```python
# app/__init__.py
from flask import Flask

def create_app(config_name='default'):
    app = Flask(__name__)
    # ... other app setup ...

    from app.routes.api import api_bp # Assuming routes are structured this way
    app.register_blueprint(api_bp)

    return app
```

### HTTP Verb Usage

Use appropriate HTTP verbs for each operation:

| Verb   | Purpose                             | Examples                        |
|--------|-------------------------------------|--------------------------------|
| GET    | Retrieve resource(s)                | Get entries, Get specific entry |
| POST   | Create new resource                 | Create new entry                |
| PUT    | Update entire resource              | Update entire entry             |
| PATCH  | Partial update of a resource        | Update only title of an entry   |
| DELETE | Remove a resource                   | Delete an entry                 |

Implementation example (Conceptual - requires `entry_service`, `current_user`, error handling, schemas):

```python
# CRUD operations for entries (Conceptual)

# Assume api_bp, api_auth_required, current_user, entry_service, jsonify exist
# Assume standard response/error functions (api_response, api_error) exist
# Assume schemas (e.g., entry_schema) exist for serialization

# Create - POST
@api_bp.route('/entries', methods=['POST'])
@api_auth_required
def create_entry():
    data = request.get_json()
    # result = entry_service.create_entry(current_user.id, data) # Service call
    # if result.success: return api_response(entry_schema.dump(result.data), status_code=201)
    # else: return api_error(result.message, code=result.error_code, status_code=result.status_code)
    return jsonify({"message": "Create entry"}), 201 # Placeholder

# Read - GET (Specific)
@api_bp.route('/entries/<int:entry_id>', methods=['GET'])
@api_auth_required
def get_entry(entry_id):
    # result = entry_service.get_entry(entry_id, current_user.id)
    # if result.success: return api_response(entry_schema.dump(result.data))
    # else: return api_error(result.message, code=result.error_code, status_code=result.status_code)
    return jsonify({"message": f"Get entry {entry_id}"}), 200 # Placeholder

# Update - PUT (Full update)
@api_bp.route('/entries/<int:entry_id>', methods=['PUT'])
@api_auth_required
def update_entry(entry_id):
    data = request.get_json()
    # result = entry_service.update_entry(entry_id, current_user.id, data)
    # if result.success: return api_response(entry_schema.dump(result.data))
    # else: return api_error(result.message, code=result.error_code, status_code=result.status_code)
    return jsonify({"message": f"Update entry {entry_id}"}), 200 # Placeholder

# Update - PATCH (Partial update)
@api_bp.route('/entries/<int:entry_id>', methods=['PATCH'])
@api_auth_required
def patch_entry(entry_id):
    data = request.get_json()
    # result = entry_service.update_entry(entry_id, current_user.id, data, partial=True)
    # if result.success: return api_response(entry_schema.dump(result.data))
    # else: return api_error(result.message, code=result.error_code, status_code=result.status_code)
    return jsonify({"message": f"Patch entry {entry_id}"}), 200 # Placeholder

# Delete - DELETE
@api_bp.route('/entries/<int:entry_id>', methods=['DELETE'])
@api_auth_required
def delete_entry(entry_id):
    # result = entry_service.delete_entry(entry_id, current_user.id)
    # if result.success: return '', 204 # No Content
    # else: return api_error(result.message, code=result.error_code, status_code=result.status_code)
    return '', 204 # Placeholder
```

### Query Parameter Conventions

Define standard query parameters for common operations:

| Parameter   | Purpose                          | Example                               |
|-------------|----------------------------------|---------------------------------------|
| `page`      | Pagination page number           | `/api/v1/entries?page=2`              |
| `per_page`  | Items per page                   | `/api/v1/entries?per_page=20`         |
| `sort`      | Sort field                       | `/api/v1/entries?sort=created_at`     |
| `order`     | Sort order (asc/desc)            | `/api/v1/entries?order=desc`          |
| `q`         | Search query                     | `/api/v1/entries?q=flask`             |
| `filter[x]` | Filter by field                  | `/api/v1/entries?filter[is_public]=1` |
| `include`   | Include related resources        | `/api/v1/entries?include=tags,author` |
| `fields`    | Sparse fieldsets for projection  | `/api/v1/entries?fields=title,content`|

Implementation example (Conceptual - requires service layer logic):

```python
@api_bp.route('/entries', methods=['GET'])
@api_auth_required
def get_entries():
    # Extract query parameters with defaults
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)  # Cap at 100
    sort_by = request.args.get('sort', 'created_at')
    sort_order = request.args.get('order', 'desc').lower()
    search_query = request.args.get('q', None)

    # Extract filters (example for simple key-value filters)
    filters = {}
    for key in request.args:
        if key.startswith('filter[') and key.endswith(']'):
            field = key[7:-1]  # Extract field name from filter[field]
            filters[field] = request.args.get(key)

    # Extract requested fields for sparse fieldsets
    fields_param = request.args.get('fields', None)
    fields = fields_param.split(',') if fields_param else None

    # Extract included relationships
    includes_param = request.args.get('include', None)
    includes = includes_param.split(',') if includes_param else None

    # Pass parameters to service layer
    # result = entry_service.get_entries(
    #     user_id=current_user.id,
    #     page=page,
    #     per_page=per_page,
    #     sort_by=sort_by,
    #     sort_order=sort_order,
    #     search_query=search_query,
    #     filters=filters,
    #     fields=fields, # For projection in service/schema
    #     includes=includes # For eager loading in service
    # )

    # if result.success:
    #     # Assuming result.data contains paginated items and pagination info
    #     return api_response(
    #         data=[entry_schema.dump(item, only=fields) for item in result.data.items], # Apply projection
    #         meta=get_pagination_meta(result.data, request.base_url) # Generate pagination meta
    #     )
    # else:
    #     return api_error(result.message, code=result.error_code, status_code=result.status_code)
    return jsonify({"message": "List entries with params"}), 200 # Placeholder
```

### Status Codes

Use appropriate HTTP status codes for responses:

| Code | Meaning               | Usage                                    |
|------|------------------------|------------------------------------------|
| 200  | OK                    | Successful GET, PUT, PATCH                |
| 201  | Created               | Successful resource creation (POST)       |
| 204  | No Content            | Successful DELETE                         |
| 400  | Bad Request           | Invalid input/syntax error (generic)      |
| 401  | Unauthorized          | Authentication required or failed         |
| 403  | Forbidden             | Authenticated but lacks permission        |
| 404  | Not Found             | Resource does not exist                   |
| 409  | Conflict              | Resource conflict (e.g., duplicate unique field) |
| 422  | Unprocessable Entity  | Semantic errors in input (validation failed) |
| 429  | Too Many Requests     | Rate limit exceeded                       |
| 500  | Internal Server Error | Unexpected server error                   |

## Request/Response Formats

### Standard JSON Structure

Define a consistent success response format using a helper function:

```python
# app/utils/api_helpers.py (Example location)
from flask import jsonify

def api_success(data=None, message=None, meta=None, status_code=200):
    """Standard JSON success response format."""
    response = {'success': True}
    if data is not None:
        response['data'] = data
    if message:
        response['message'] = message
    if meta:
        response['meta'] = meta
    return jsonify(response), status_code
```

Usage example:

```python
# In your route
# ... service call successful ...
# entry_data = entry_schema.dump(entry)
# return api_success(data=entry_data, message="Entry retrieved.")
```

### Error Response Format

Define a consistent error response format using a helper function:

```python
# app/utils/api_helpers.py (Example location)
from flask import jsonify

def api_error(message, code=None, details=None, status_code=400):
    """Standard JSON error response format."""
    response = {
        'success': False,
        'error': {'message': message}
    }
    if code:
        response['error']['code'] = code
    if details:
        response['error']['details'] = details
    return jsonify(response), status_code

# Example Custom Exception
class APIValidationError(Exception):
    def __init__(self, message="Validation Error", details=None, status_code=422, code="VALIDATION_ERROR"):
        super().__init__(message)
        self.details = details
        self.status_code = status_code
        self.code = code

# Example Error Handler
# @app.errorhandler(APIValidationError) # Register in app factory
# def handle_validation_error(error):
#     return api_error(
#         message=str(error),
#         details=error.details,
#         status_code=error.status_code,
#         code=error.code
#     )
```

Implementation example with validation errors using Marshmallow:

```python
# In your route
# from marshmallow import Schema, fields, ValidationError

# class EntrySchema(Schema): # Define your schema
#     title = fields.Str(required=True)
#     content = fields.Str(required=True)

# @api_bp.route('/entries', methods=['POST'])
# @api_auth_required
# def create_entry():
#     data = request.get_json()
#     schema = EntrySchema()
#     try:
#         validated_data = schema.load(data)
#     except ValidationError as err:
#         # Using helper function
#         return api_error(
#             message="Validation failed",
#             code="VALIDATION_ERROR",
#             details=err.messages,
#             status_code=422
#         )
#     # ... process validated_data ...
```

### Pagination Format

Define a standard pagination format, often included in the `meta` field of the success response.

```python
# app/utils/pagination.py (Example location)
from flask import url_for, request

def get_pagination_meta(pagination, endpoint, **kwargs):
    """
    Generate pagination metadata for API responses using Flask-SQLAlchemy pagination object.

    Args:
        pagination: Flask-SQLAlchemy Pagination object.
        endpoint: The Flask endpoint name (e.g., 'api.get_entries').
        **kwargs: Additional arguments needed to build the URL for the endpoint.

    Returns:
        Dictionary with pagination metadata.
    """
    base_args = {**request.view_args, **kwargs, 'per_page': pagination.per_page}
    meta = {
        'pagination': {
            'current_page': pagination.page,
            'per_page': pagination.per_page,
            'total_pages': pagination.pages,
            'total_items': pagination.total
        },
        'links': {
            'self': url_for(endpoint, page=pagination.page, **base_args),
            'first': url_for(endpoint, page=1, **base_args),
            'last': url_for(endpoint, page=pagination.pages, **base_args)
        }
    }
    if pagination.has_prev:
        meta['links']['prev'] = url_for(endpoint, page=pagination.prev_num, **base_args)
    if pagination.has_next:
        meta['links']['next'] = url_for(endpoint, page=pagination.next_num, **base_args)
    return meta
```

Implementation example:

```python
# In your route for listing entries
# @api_bp.route('/entries', methods=['GET'])
# @api_auth_required
# def get_entries():
#     page = request.args.get('page', 1, type=int)
#     per_page = min(request.args.get('per_page', 10, type=int), 100)
#
#     # Assume service returns a Flask-SQLAlchemy pagination object
#     entries_pagination = entry_service.get_entries_paginated(
#         user_id=current_user.id, page=page, per_page=per_page
#     )
#
#     # Generate response with pagination metadata
#     return api_success(
#         data=[entry_schema.dump(entry) for entry in entries_pagination.items],
#         meta=get_pagination_meta(entries_pagination, 'api.get_entries') # Pass endpoint name
#     )
```

Example response `meta` block:

```json
"meta": {
  "pagination": {
    "current_page": 2,
    "per_page": 10,
    "total_pages": 5,
    "total_items": 45
  },
  "links": {
    "self": "/api/v1/entries?page=2&per_page=10",
    "first": "/api/v1/entries?page=1&per_page=10",
    "prev": "/api/v1/entries?page=1&per_page=10",
    "next": "/api/v1/entries?page=3&per_page=10",
    "last": "/api/v1/entries?page=5&per_page=10"
  }
}
```

### Filtering and Sorting Conventions

-   **Filtering:** Use `filter[field_name]=value`. Handle multiple filters. Consider operators (e.g., `filter[created_at][gte]=2023-01-01`).
-   **Sorting:** Use `sort=field_name` and `order=asc|desc`. Allow sorting by multiple fields (e.g., `sort=status,created_at&order=asc,desc`).

Translate these query parameters into SQLAlchemy query modifications in your service layer.

```python
# app/services/entry_service.py (Conceptual)
# from app.models import Entry
# from app import db

# def _apply_filters(query, filters):
#     for field, value in filters.items():
#         if hasattr(Entry, field):
#             # Add more sophisticated filtering logic here (operators, types)
#             query = query.filter(getattr(Entry, field) == value)
#     return query

# def _apply_sorting(query, sort_by, sort_order):
#     if hasattr(Entry, sort_by):
#         column = getattr(Entry, sort_by)
#         if sort_order == 'desc':
#             query = query.order_by(column.desc())
#         else:
#             query = query.order_by(column.asc())
#     return query

# def get_entries(user_id, page, per_page, sort_by, sort_order, search_query, filters, fields, includes):
#     query = Entry.query.filter_by(user_id=user_id) # Base query
#
#     if search_query:
#         # Add search logic (e.g., against title and content)
#         query = query.filter(Entry.title.ilike(f'%{search_query}%') | Entry.content.ilike(f'%{search_query}%'))
#
#     query = _apply_filters(query, filters)
#     query = _apply_sorting(query, sort_by, sort_order)
#
#     # Handle includes (eager loading) - requires relationship setup
#     # if includes:
#     #     options = []
#     #     if 'tags' in includes and hasattr(Entry, 'tags'):
#     #         options.append(db.joinedload(Entry.tags))
#     #     if 'author' in includes and hasattr(Entry, 'author'):
#     #          options.append(db.joinedload(Entry.author))
#     #     if options:
#     #         query = query.options(*options)
#
#     pagination = query.paginate(page=page, per_page=per_page, error_out=False)
#     # Return a result object containing pagination, success status etc.
#     # return ServiceResult(success=True, data=pagination)
```

## Authentication/Authorization

### Authentication Mechanism

Use token-based authentication (e.g., JWT or simple opaque tokens stored securely).

-   **Token Generation:** Provide an endpoint (e.g., `/api/v1/auth/token`) where users exchange credentials (username/password) for a token.
-   **Token Storage:** Store tokens securely (e.g., in Redis with an expiry) or use stateless JWTs.
-   **Token Verification:** Verify tokens on each API request.

```python
# app/auth/token.py (Conceptual)
# import jwt
# from flask import current_app
# from datetime import datetime, timedelta, timezone
# from app.models import User

# def generate_token(user_id, expires_in=3600):
#     payload = {
#         'user_id': user_id,
#         'exp': datetime.now(timezone.utc) + timedelta(seconds=expires_in)
#     }
#     return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

# def verify_token(token):
#     try:
#         payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
#         user = User.query.get(payload['user_id'])
#         return user
#     except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError):
#         return None

# app/auth/decorators.py (Conceptual)
# from functools import wraps
# from flask import request, g
# from app.utils.api_helpers import api_error
# from .token import verify_token

# def api_auth_required(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         token = None
#         if 'Authorization' in request.headers:
#             auth_header = request.headers['Authorization']
#             parts = auth_header.split()
#             if len(parts) == 2 and parts[0].lower() == 'bearer':
#                 token = parts[1]
#
#         if not token:
#             return api_error("Authentication token required", code="AUTH_REQUIRED", status_code=401)
#
#         user = verify_token(token)
#         if not user:
#             return api_error("Invalid or expired token", code="INVALID_TOKEN", status_code=401)
#
#         g.current_user = user # Store user in Flask's application context global `g`
#         return f(*args, **kwargs)
#     return decorated_function

# Accessing the user in routes:
# from flask import g
# current_user = g.get('current_user', None)

# app/routes/auth.py (Conceptual)
# from flask import Blueprint, request
# from app.models import User
# from app.utils.api_helpers import api_success, api_error
# from .token import generate_token

# auth_bp = Blueprint('auth_api', __name__, url_prefix='/api/v1/auth')

# @auth_bp.route('/token', methods=['POST'])
# def get_token():
#     data = request.get_json()
#     if not data or 'username' not in data or 'password' not in data:
#         return api_error("Username and password required", status_code=400)
#
#     user = User.query.filter_by(username=data['username']).first()
#
#     if user is None or not user.check_password(data['password']):
#         return api_error("Invalid credentials", code="INVALID_CREDENTIALS", status_code=401)
#
#     token = generate_token(user.id)
#     return api_success(data={'token': token})

# Register this blueprint in app factory
```

### Required Headers

-   Clients must send the token in the `Authorization` header using the `Bearer` scheme:
    `Authorization: Bearer <your_token>`

Handle this in the `@api_auth_required` decorator.

```python
# Example check within decorator (already shown above)
# if 'Authorization' in request.headers:
#     auth_header = request.headers['Authorization']
#     parts = auth_header.split()
#     if len(parts) == 2 and parts[0].lower() == 'bearer':
#         token = parts[1]
#         user = verify_token(token)
#         if user:
#             g.current_user = user
#             return f(*args, **kwargs)
# return api_error("Unauthorized", status_code=401)
```

### Permission Checking

Implement permission checks within route handlers or service methods after authentication.

-   **Ownership:** Check if the authenticated user owns the resource they are trying to access/modify.
-   **Roles (If applicable):** If roles are implemented later, check user roles against required permissions.

```python
# app/auth/permissions.py (Conceptual)
# from flask import g
# from app.utils.api_helpers import api_error
# from functools import wraps

# def check_ownership(resource_user_id):
#     """Checks if the current user owns the resource."""
#     current_user = g.get('current_user')
#     if not current_user or current_user.id != resource_user_id:
#         return False
#     return True

# def require_ownership(resource_model, id_param_name='entry_id'):
#     """Decorator to enforce resource ownership."""
#     def decorator(f):
#         @wraps(f)
#         def decorated_function(*args, **kwargs):
#             resource_id = kwargs.get(id_param_name)
#             if resource_id is None:
#                 return api_error("Resource ID missing", status_code=500) # Should not happen if route is correct
#
#             resource = resource_model.query.get_or_404(resource_id) # Use get_or_404 for simplicity here
#
#             # Assuming the model has a 'user_id' attribute
#             if not hasattr(resource, 'user_id'):
#                  return api_error("Resource does not support ownership check", status_code=500)
#
#             if not check_ownership(resource.user_id):
#                 return api_error("Permission denied", code="FORBIDDEN", status_code=403)
#
#             # Store resource in g for potential use in route? Optional.
#             # g.current_resource = resource
#             return f(*args, **kwargs)
#         return decorated_function
#     return decorator

# Usage in routes:
# from app.models import Entry
# from .permissions import require_ownership

# @api_bp.route('/entries/<int:entry_id>', methods=['GET', 'PUT', 'PATCH', 'DELETE'])
# @api_auth_required
# @require_ownership(Entry, id_param_name='entry_id') # Apply decorator
# def handle_specific_entry(entry_id):
#     # User is authenticated and owns the entry
#     if request.method == 'GET':
#         # ... get logic ...
#     elif request.method == 'PUT':
#         # ... update logic ...
#     # etc.
```

### Rate Limiting Implementation

Use Flask extensions like `Flask-Limiter` with a Redis backend for effective rate limiting.

```python
# app/utils/rate_limit.py (Conceptual)
# from flask_limiter import Limiter
# from flask_limiter.util import get_remote_address
# from flask import g, current_app
# import redis

# # Initialize Redis client (configure URL in app config)
# redis_client = redis.from_url(current_app.config.get('REDIS_URL', 'redis://localhost:6379/0'))

# # Function to get identifier (IP or user ID if authenticated)
# def identifier():
#     user = g.get('current_user')
#     if user:
#         return str(user.id)
#     return get_remote_address()

# limiter = Limiter(
#     key_func=identifier,
#     storage_uri=current_app.config.get('REDIS_URL', 'redis://localhost:6379/0'), # Use Redis storage
#     strategy="fixed-window" # Or "moving-window"
# )

# # Apply limits in app factory
# def init_limiter(app):
#     limiter.init_app(app)

# # Define limits (can be done in config or directly)
# # Example: Apply different limits to blueprints or specific routes

# # Apply to the entire API blueprint
# limiter.limit("60/minute;1000/hour")(api_bp) # Default limit for the blueprint

# # Apply specific limits to routes
# @api_bp.route('/entries', methods=['POST'])
# @limiter.limit("10/minute") # Stricter limit for creating entries
# @api_auth_required
# def create_entry():
#     # ... route logic ...

# @auth_bp.route('/token', methods=['POST'])
# @limiter.limit("5/minute") # Very strict limit for token generation
# def get_token():
#     # ... route logic ...
```

Register limiter in `create_app`:

```python
# app/__init__.py
# def create_app(config_name='default'):
#     app = Flask(__name__)
#     # ... config ...
#     from .utils.rate_limit import init_limiter
#     init_limiter(app)
#     # ... register blueprints ...
#     return app
```

## Documentation Standards

### Inline Documentation

-   Use docstrings for all API route functions, service methods, and utility functions.
-   Explain the purpose, arguments, return values, and any potential exceptions.

```python
# Example Docstring
# def get_entry(entry_id, user_id):
#     """
#     Retrieves a specific journal entry by its ID, ensuring user ownership.
#
#     Args:
#         entry_id (int): The ID of the entry to retrieve.
#         user_id (int): The ID of the user requesting the entry.
#
#     Returns:
#         ServiceResult: Contains the Entry object if found and authorized,
#                        or an error message and status code otherwise.
#
#     Raises:
#         ResourceNotFoundError: If the entry with entry_id does not exist.
#         AuthorizationError: If the user_id does not match the entry's user_id.
#     """
#     # ... implementation ...
```

### API Reference Documentation

-   Consider using tools like `Flask-RESTX` or `connexion` (with OpenAPI/Swagger specs) if a formal, auto-generated API reference is needed later. For MVP, clear inline documentation might suffice.
-   If using manual documentation, maintain a separate Markdown file detailing each endpoint, its parameters, request/response formats, and status codes.

```python
# Example using Flask-RESTX (More complex setup, potentially beyond MVP)
# from flask_restx import Api, Resource, fields
#
# api = Api(api_bp, version='1.0', title='Journal API', description='API for Journal Entries')
# ns = api.namespace('entries', description='Entry operations')
#
# entry_model = api.model('Entry', {
#     'id': fields.Integer(readonly=True, description='The entry unique identifier'),
#     'title': fields.String(required=True, description='The entry title'),
#     # ... other fields
# })
#
# @ns.route('/')
# class EntryList(Resource):
#     @ns.doc('list_entries')
#     @ns.marshal_list_with(entry_model)
#     def get(self):
#         '''List all entries'''
#         # ... implementation ...
#         return entries
#
#     @ns.doc('create_entry')
#     @ns.expect(entry_model)
#     @ns.marshal_with(entry_model, code=201)
#     def post(self):
#         '''Create a new entry'''
#         # ... implementation ...
#         return new_entry, 201
#
# # ... more resources ...
```

### Example Request/Response

Include clear examples in documentation (either inline docstrings or separate API reference).

```markdown
**Example: Create Entry**

*Request:* `POST /api/v1/entries`
*Headers:* `Authorization: Bearer <token>`, `Content-Type: application/json`
*Body:*
```json
{
  "title": "My New Entry",
  "content": "This is the content of the new entry.",
  "is_public": false
}
```

*Response (Success 201):*
```json
{
  "success": true,
  "message": "Entry created successfully",
  "data": {
    "id": 124,
    "title": "My New Entry",
    "content": "This is the content of the new entry.",
    "is_public": false,
    "created_at": "2023-10-27T10:30:00Z",
    "updated_at": "2023-10-27T10:30:00Z",
    "user_id": 1
  }
}
```

*Response (Validation Error 422):*
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "title": ["Missing data for required field."]
    }
  }
}
```
```

---

## API Examples (Conceptual)

These examples illustrate potential request/response cycles based on the principles above.

### Get API Token

-   **Request:** `POST /api/v1/auth/token`
    ```json
    { "username": "testuser", "password": "password123" }
    ```
-   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
    ```

### List Entries

-   **Request:** `GET /api/v1/entries?page=1&per_page=5&sort=created_at&order=desc`
    *Headers:* `Authorization: Bearer <token>`
-   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [ /* array of 5 entry objects */ ],
      "meta": { /* pagination object */ }
    }
    ```

### Get Single Entry

-   **Request:** `GET /api/v1/entries/42`
    *Headers:* `Authorization: Bearer <token>`
-   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": { /* single entry object with id 42 */ }
    }
    ```

### Create Entry

-   **Request:** `POST /api/v1/entries`
    *Headers:* `Authorization: Bearer <token>`, `Content-Type: application/json`
    *Body:* `{ "title": "...", "content": "..." }`
-   **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Entry created successfully",
      "data": { /* newly created entry object */ }
    }
    ```

### Update Entry

-   **Request:** `PATCH /api/v1/entries/42`
    *Headers:* `Authorization: Bearer <token>`, `Content-Type: application/json`
    *Body:* `{ "title": "Updated Title" }`
-   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": { /* updated entry object with id 42 */ }
    }
    ```

### Delete Entry

-   **Request:** `DELETE /api/v1/entries/42`
    *Headers:* `Authorization: Bearer <token>`
-   **Response (204 No Content):** (Empty body)

---

## Error Examples

### Authentication Error

-   **Request:** `GET /api/v1/entries` (No or invalid token)
-   **Response (401 Unauthorized):**
    ```json
    {
      "success": false,
      "error": {
        "message": "Authentication token required" / "Invalid or expired token",
        "code": "AUTH_REQUIRED" / "INVALID_TOKEN"
      }
    }
    ```

### Validation Error

-   **Request:** `POST /api/v1/entries` (Missing required field)
    *Body:* `{ "content": "..." }`
-   **Response (422 Unprocessable Entity):**
    ```json
    {
      "success": false,
      "error": {
        "message": "Validation failed",
        "code": "VALIDATION_ERROR",
        "details": { "title": ["Missing data for required field."] }
      }
    }
    ```

### Resource Not Found

-   **Request:** `GET /api/v1/entries/9999` (Entry 9999 doesn't exist)
    *Headers:* `Authorization: Bearer <token>`
-   **Response (404 Not Found):**
    ```json
    {
      "success": false,
      "error": {
        "message": "Entry not found",
        "code": "NOT_FOUND"
      }
    }
    ```

### Permission Denied

-   **Request:** `GET /api/v1/entries/42` (User authenticated but doesn't own entry 42)
    *Headers:* `Authorization: Bearer <token>`
-   **Response (403 Forbidden):**
    ```json
    {
      "success": false,
      "error": {
        "message": "Permission denied",
        "code": "FORBIDDEN"
      }
    }
    ```

### Rate Limit Exceeded

-   **Request:** (Making too many requests quickly)
-   **Response (429 Too Many Requests):**
    ```json
    {
      "success": false,
      "error": {
        "message": "Rate limit exceeded. Try again later.",
        "code": "RATE_LIMIT_EXCEEDED"
      }
    }
