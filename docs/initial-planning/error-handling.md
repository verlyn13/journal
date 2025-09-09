---
title: "Error Handling Guide: Flask Journal System"
description: "Defines a consistent approach to error handling across the Flask Journal MVP, covering service layer exceptions, UI display, logging, and monitoring."
category: "System Design"
related_topics:
      - "Comprehensive Guide: Personal Flask Blog/Journal System"
      - "API Contract Guide"
      - "Testing Strategy Guide"
version: "1.0"
tags:
      - "error handling"
      - "exceptions"
      - "logging"
      - "monitoring"
      - "flask"
      - "htmx"
      - "service layer"
      - "ui"
      - "system design"
      - "mvp"
      - "robustness"
---


# Error Handling Guide for Flask Blog/Journal System

This guide establishes a consistent approach to error handling throughout the Flask journal application. Following the "lean and mean" philosophy, we'll implement robust error handling with minimal dependencies.

## Table of Contents

- [Error Handling Guide for Flask Blog/Journal System](#error-handling-guide-for-flask-blogjournal-system)
      - [Table of Contents](#table-of-contents)
      - [Service Layer Error Handling](#service-layer-error-handling)
      - [Custom Exception Hierarchy](#custom-exception-hierarchy)
      - [Standardized Result Objects](#standardized-result-objects)
      - [Transaction Management](#transaction-management)
      - [Expected vs. Unexpected Errors](#expected-vs-unexpected-errors)
      - [UI Error Display](#ui-error-display)
      - [Form Validation Errors](#form-validation-errors)
      - [Flash Message Categorization](#flash-message-categorization)
      - [HTMX Error Handling](#htmx-error-handling)
      - [Graceful Degradation](#graceful-degradation)
      - [Logging and Monitoring](#logging-and-monitoring)
      - [Structured Logging Format](#structured-logging-format)
      - [Error Severity Classification](#error-severity-classification)
      - [Context Inclusion](#context-inclusion)
      - [Systemd Journald Integration](#systemd-journald-integration)

## Service Layer Error Handling

### Custom Exception Hierarchy

Create a custom exception hierarchy to clearly categorize different types of errors:

```python
# app/errors/exceptions.py
class ApplicationError(Exception):
    """Base exception for all application errors."""
    
    def __init__(self, message, code=None, details=None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(ApplicationError):
    """Raised when input data fails validation."""
    
    def __init__(self, message="Invalid input", code="VALIDATION_ERROR", details=None):
        super().__init__(message, code, details)


class AuthorizationError(ApplicationError):
    """Raised when user attempts an unauthorized action."""
    
    def __init__(self, message="Unauthorized action", code="AUTHORIZATION_ERROR", details=None):
        super().__init__(message, code, details)


class ResourceNotFoundError(ApplicationError):
    """Raised when a requested resource cannot be found."""
    
    def __init__(self, message="Resource not found", code="NOT_FOUND", details=None):
        super().__init__(message, code, details)


class BusinessRuleError(ApplicationError):
    """Raised when a business rule is violated."""
    
    def __init__(self, message="Operation not allowed", code="BUSINESS_RULE_ERROR", details=None):
        super().__init__(message, code, details)


class ExternalServiceError(ApplicationError):
    """Raised when an external service (Redis, etc) fails."""
    
    def __init__(self, message="External service error", code="EXTERNAL_SERVICE_ERROR", details=None):
        super().__init__(message, code, details)


class ConcurrencyError(ApplicationError):
    """Raised when a concurrency issue is detected."""
    
    def __init__(self, message="Concurrency conflict detected", code="CONCURRENCY_ERROR", details=None):
        super().__init__(message, code, details)
```

### Standardized Result Objects

Implement an OperationResult pattern for consistent return values from service methods:

```python
# app/errors/result.py
from dataclasses import dataclass, field
from typing import Any, Dict, Optional, Type, TypeVar, Generic, List

T = TypeVar('T')

@dataclass
class OperationResult(Generic[T]):
    """Standardized result object for service operations."""
    success: bool
    message: str = None
    error_code: str = None
    error_details: Dict[str, Any] = field(default_factory=dict)
    data: Optional[T] = None
    status_code: int = 200  # Default HTTP status code
    
    @classmethod
    def success_result(cls, data: T = None, message: str = "Operation completed successfully"):
        """Create a success result."""
        return cls(success=True, message=message, data=data)
    
    @classmethod
    def failure_result(cls, 
                      message: str, 
                      error_code: str = "OPERATION_FAILED", 
                      error_details: Dict[str, Any] = None,
                      status_code: int = 400,
                      data: T = None):
        """Create a failure result."""
        return cls(
            success=False,
            message=message,
            error_code=error_code,
            error_details=error_details or {},
            data=data,
            status_code=status_code
        )
    
    @classmethod
    def from_exception(cls, exception: Exception):
        """Create a failure result from an exception."""
        if isinstance(exception, ValidationError):
            return cls.failure_result(
                message=exception.message,
                error_code=exception.code,
                error_details=exception.details,
                status_code=400
            )
        elif isinstance(exception, AuthorizationError):
            return cls.failure_result(
                message=exception.message,
                error_code=exception.code,
                error_details=exception.details,
                status_code=403
            )
        elif isinstance(exception, ResourceNotFoundError):
            return cls.failure_result(
                message=exception.message,
                error_code=exception.code,
                error_details=exception.details,
                status_code=404
            )
        elif isinstance(exception, BusinessRuleError):
            return cls.failure_result(
                message=exception.message,
                error_code=exception.code,
                error_details=exception.details,
                status_code=422  # Unprocessable Entity
            )
        elif isinstance(exception, ConcurrencyError):
            return cls.failure_result(
                message=exception.message,
                error_code=exception.code,
                error_details=exception.details,
                status_code=409  # Conflict
            )
        elif isinstance(exception, ExternalServiceError):
            return cls.failure_result(
                message=exception.message,
                error_code=exception.code,
                error_details=exception.details,
                status_code=502  # Bad Gateway
            )
        elif isinstance(exception, ApplicationError):
            return cls.failure_result(
                message=exception.message,
                error_code=exception.code,
                error_details=exception.details,
                status_code=500
            )
        else:
            # Unknown exception
            return cls.failure_result(
                message=str(exception) or "An unexpected error occurred",
                error_code="INTERNAL_ERROR",
                status_code=500
            )
```

### Transaction Management

Implement a robust transaction context manager that handles rollbacks:

```python
# app/errors/transaction.py
from contextlib import contextmanager
from flask import current_app
from sqlalchemy.exc import SQLAlchemyError
from app import db
from app.errors.exceptions import ExternalServiceError

@contextmanager
def transaction():
    """
    Context manager for database transactions.
    Automatically commits or rolls back on success/error.
    """
    try:
        yield
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        
        # Log the error but re-raise for proper error handling up the stack
        current_app.logger.error(f"Transaction error: {str(e)}", exc_info=True)
        
        # If it's a SQLAlchemy error, wrap it in our ExternalServiceError
        if isinstance(e, SQLAlchemyError):
            raise ExternalServiceError(
                message="Database operation failed",
                code="DATABASE_ERROR",
                details={"original_error": str(e)}
            ) from e
        
        # Otherwise, re-raise the original exception
        raise
```

### Expected vs. Unexpected Errors

Create utilities to distinguish between expected and unexpected errors:

```python
# app/errors/handlers.py
import traceback
from flask import jsonify, render_template, request, current_app
from app.errors.exceptions import ApplicationError
from app.errors.result import OperationResult

def handle_application_error(error):
    """
    Handler for expected application errors.
    Returns appropriate response based on request type (API vs. HTML).
    """
    result = OperationResult.from_exception(error)
    
    if request.path.startswith('/api/'):
        # API request - return JSON response
        response = jsonify({
            'success': False,
            'message': result.message,
            'error_code': result.error_code,
            'error_details': result.error_details
        })
        response.status_code = result.status_code
        return response
    else:
        # Regular request - return error template
        return render_template('errors/error.html', 
                              error=error, 
                              status_code=result.status_code), result.status_code

def handle_unexpected_error(error):
    """
    Handler for unexpected errors (not derived from ApplicationError).
    Logs the full traceback and returns a generic error response.
    """
    # Log the full traceback for debugging
    current_app.logger.error(f"Unexpected error: {str(error)}", exc_info=True)
    
    if request.path.startswith('/api/'):
        # API request - return JSON response
        response = jsonify({
            'success': False,
            'message': "An unexpected error occurred",
            'error_code': "INTERNAL_ERROR"
        })
        response.status_code = 500
        return response
    else:
        # Regular request - return error template
        return render_template('errors/500.html'), 500

def register_error_handlers(app):
    """Register all error handlers with the Flask app."""
    # Register handler for our custom exception hierarchy
    app.register_error_handler(ApplicationError, handle_application_error)
    
    # Register handlers for common HTTP errors
    app.register_error_handler(400, lambda e: render_template('errors/400.html', error=e), 400)
    app.register_error_handler(403, lambda e: render_template('errors/403.html', error=e), 403)
    app.register_error_handler(404, lambda e: render_template('errors/404.html', error=e), 404)
    app.register_error_handler(500, handle_unexpected_error)
```

## UI Error Display

### Form Validation Errors

Create reusable templates for displaying form validation errors:

```html
<!-- templates/components/form_field.html -->
{% macro render_field(field, label_class='', field_class='') %}
    <div class="form-group {% if field.errors %}has-error{% endif %}">
        {{ field.label(class=label_class) }}
        {{ field(class=field_class, **kwargs)|safe }}
        
        {% if field.errors %}
            <div class="error-messages">
                {% for error in field.errors %}
                    <div class="error-message">{{ error }}</div>
                {% endfor %}
            </div>
        {% endif %}
        
        {% if field.description %}
            <div class="field-description">{{ field.description }}</div>
        {% endif %}
    </div>
{% endmacro %}
```

Implement Alpine.js for client-side validation feedback:

```html
<!-- templates/entries/create.html -->
<form x-data="{
    formErrors: {},
    fieldHasError(field) {
        return Object.keys(this.formErrors).includes(field);
    },
    getError(field) {
        return this.fieldHasError(field) ? this.formErrors[field][0] : '';
    },
    validateTitle() {
        if (!this.$refs.title.value) {
            this.formErrors['title'] = ['Title is required.'];
            return false;
        } else if (this.$refs.title.value.length > 200) {
            this.formErrors['title'] = ['Title must be 200 characters or less.'];
            return false;
        }
        delete this.formErrors['title'];
        return true;
    },
    validateContent() {
        if (!this.$refs.content.value) {
            this.formErrors['content'] = ['Content is required.'];
            return false;
        }
        delete this.formErrors['content'];
        return true;
    },
    validateForm() {
        const titleValid = this.validateTitle();
        const contentValid = this.validateContent();
        return titleValid && contentValid;
    }
}" 
      @submit.prevent="if (validateForm()) $el.submit()" 
      action="{{ url_for('entries.create') }}" 
      method="POST">
    <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
    
    <div class="form-group" :class="{'has-error': fieldHasError('title')}">
        <label for="title">Title</label>
        <input type="text" id="title" name="title" x-ref="title" 
               @blur="validateTitle()" value="{{ form.title.data or '' }}">
        <div class="error-message" x-show="fieldHasError('title')" x-text="getError('title')"></div>
    </div>
    
    <div class="form-group" :class="{'has-error': fieldHasError('content')}">
        <label for="content">Content</label>
        <textarea id="content" name="content" x-ref="content" 
                 @blur="validateContent()">{{ form.content.data or '' }}</textarea>
        <div class="error-message" x-show="fieldHasError('content')" x-text="getError('content')"></div>
    </div>
    
    <div class="form-actions">
        <button type="submit" class="btn btn-primary">Save Entry</button>
    </div>
</form>
```

For server-side validation with WTForms:

```python
# app/forms/entry_forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Length, ValidationError
from app.models.content import Entry

class EntryForm(FlaskForm):
    """Form for creating and editing entries."""
    title = StringField('Title', validators=[
        DataRequired(message="Title is required."),
        Length(max=200, message="Title must be 200 characters or less.")
    ])
    
    content = TextAreaField('Content', validators=[
        DataRequired(message="Content is required.")
    ])
    
    is_public = BooleanField('Make Public')
    
    submit = SubmitField('Save Entry')
    
    def validate_title(self, field):
        """
        Custom validator to check for duplicate titles.
        Skip for edit forms where the title is unchanged.
        """
        if hasattr(self, 'entry_id') and self.entry_id:
            # Edit form - check for duplicates but exclude current entry
            entry = Entry.query.filter(
                Entry.title == field.data,
                Entry.id != self.entry_id
            ).first()
        else:
            # New entry - check for any duplicates
            entry = Entry.query.filter_by(title=field.data).first()
        
        if entry:
            raise ValidationError('An entry with this title already exists.')
```

### Flash Message Categorization

Create a structured flash message system with different categories:

```python
# app/utils/flash.py
from flask import flash as flask_flash
import json
from typing import Dict, Any, List, Optional, Union

def flash(message: str, 
          category: str = 'info', 
          actions: Optional[List[Dict[str, str]]] = None,
          dismiss_timeout: Optional[int] = None,
          details: Optional[Dict[str, Any]] = None):
    """
    Enhanced flash message with categorization and additional metadata.
    
    Args:
        message (str): The main message text
        category (str): Message category (info, success, warning, error)
        actions (List[Dict], optional): Action buttons for the message
        dismiss_timeout (int, optional): Auto-dismiss timeout in milliseconds
        details (Dict, optional): Additional structured details about the message
    """
    data = {
        'message': message,
        'category': category,
        'actions': actions or [],
        'dismiss_timeout': dismiss_timeout,
        'details': details or {}
    }
    
    flask_flash(json.dumps(data), category)


# Usage example
def example_view():
    # Success message with action
    flash(
        message="Entry saved successfully.",
        category="success",
        actions=[
            {'text': 'View Entry', 'url': url_for('entries.view', entry_id=entry.id)}
        ],
        dismiss_timeout=5000  # 5 seconds
    )
    
    # Error message with details
    flash(
        message="Failed to save entry.",
        category="error",
        details={
            'fields': ['title', 'content'],
            'reasons': ['Title is too long', 'Content is empty']
        }
    )
    
    # Warning message
    flash(
        message="You have unsaved changes.",
        category="warning",
        actions=[
            {'text': 'Save Now', 'url': '#', 'id': 'save-draft-btn'}
        ]
    )
```

Create a template to display flash messages:

```html
<!-- templates/components/flash_messages.html -->
<div class="flash-messages" x-data="{ 
    messages: JSON.parse('{{ get_flashed_messages(with_categories=True)|tojson }}'),
    removeMessage(index) {
        this.messages.splice(index, 1);
    }
}">
    <template x-for="(messageData, index) in messages" :key="index">
        <div class="flash-message" 
             :class="JSON.parse(messageData[1]).category"
             x-init="message = JSON.parse(messageData[1]); 
                     if (message.dismiss_timeout) {
                         setTimeout(() => removeMessage(index), message.dismiss_timeout);
                     }">
            <div class="flash-content">
                <div class="flash-icon" x-show="message.category">
                    <!-- Different icons based on category -->
                    <span x-show="message.category === 'success'">✅</span>
                    <span x-show="message.category === 'error'">❌</span>
                    <span x-show="message.category === 'warning'">⚠️</span>
                    <span x-show="message.category === 'info'">ℹ️</span>
                </div>
                <div class="flash-message-text" x-text="message.message"></div>
            </div>
            
            <!-- Action buttons -->
            <div class="flash-actions" x-show="message.actions && message.actions.length > 0">
                <template x-for="action in message.actions" :key="action.text">
                    <a :href="action.url" :id="action.id" class="flash-action-btn" x-text="action.text"></a>
                </template>
            </div>
            
            <!-- Close button -->
            <button class="flash-close-btn" @click="removeMessage(index)">×</button>
        </div>
    </template>
</div>
```

### HTMX Error Handling

Create HTMX-compatible error responses:

```python
# app/utils/htmx.py
from flask import Response, render_template
from typing import Dict, Any, Union, Optional

def htmx_error_response(status_code: int, 
                        message: str,
                        details: Optional[Dict[str, Any]] = None,
                        template: Optional[str] = None) -> Response:
    """
    Create an HTMX-compatible error response.
    
    Args:
        status_code (int): HTTP status code
        message (str): Error message
        details (Dict, optional): Additional error details
        template (str, optional): Template to render error content
        
    Returns:
        Response: Flask response object with appropriate headers
    """
    if template:
        content = render_template(template, message=message, details=details)
    else:
        # Default error template
        content = render_template(
            'errors/htmx_error.html',
            status_code=status_code,
            message=message,
            details=details
        )
    
    # Create response with proper status code and HTMX headers
    response = Response(content, status=status_code)
    response.headers['HX-Retarget'] = '#error-container'
    response.headers['HX-Reswap'] = 'innerHTML'
    
    return response
```

Create a template for HTMX error responses:

```html
<!-- templates/errors/htmx_error.html -->
<div class="error-notification" role="alert">
    <div class="error-header">
        <span class="error-status">{{ status_code }}</span>
        <button class="close-error" onclick="this.parentElement.parentElement.remove()">&times;</button>
    </div>
    <div class="error-body">
        <p class="error-message">{{ message }}</p>
        
        {% if details %}
        <div class="error-details">
            {% for key, value in details.items() %}
            <div class="error-detail">
                <span class="detail-key">{{ key }}:</span>
                <span class="detail-value">
                    {% if value is mapping %}
                        <pre>{{ value|tojson(indent=2) }}</pre>
                    {% else %}
                        {{ value }}
                    {% endif %}
                </span>
            </div>
            {% endfor %}
        </div>
        {% endif %}
    </div>
</div>
```

Use HTMX error handling in routes:

```python
# app/routes/entries.py
from app.utils.htmx import htmx_error_response

@entries_bp.route('/<int:entry_id>/delete', methods=['DELETE'])
@login_required
def delete_entry(entry_id):
    try:
        result = entry_service.delete_entry(entry_id=entry_id, user_id=current_user.id)
        
        if not result.success:
            return htmx_error_response(
                status_code=result.status_code,
                message=result.message,
                details=result.error_details
            )
        
        # If a HX-Trigger header is set, return empty response with trigger header
        response = Response('')
        response.headers['HX-Trigger'] = json.dumps({
            'entryDeleted': {
                'id': entry_id,
                'message': 'Entry deleted successfully'
            }
        })
        return response
        
    except ApplicationError as e:
        return htmx_error_response(
            status_code=OperationResult.from_exception(e).status_code,
            message=str(e),
            details=getattr(e, 'details', None)
        )
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return htmx_error_response(
            status_code=500,
            message="An unexpected error occurred while deleting the entry.",
            template='errors/server_error.html'
        )
```

Set up the client-side to handle HTMX errors:

```html
<!-- In your main layout or base template -->
<div id="error-container" class="global-error-container"></div>

<script>
    // Global HTMX event handlers for errors
    document.addEventListener('htmx:responseError', function(event) {
        // Check if the error has already been handled by HX-Retarget
        if (!event.detail.xhr.getAllResponseHeaders().includes('HX-Retarget')) {
            // If not, show a generic error message
            const errorContainer = document.getElementById('error-container');
            errorContainer.innerHTML = `
                <div class="error-notification" role="alert">
                    <div class="error-header">
                        <span class="error-status">${event.detail.xhr.status}</span>
                        <button class="close-error" onclick="this.parentElement.parentElement.remove()">&times;</button>
                    </div>
                    <div class="error-body">
                        <p class="error-message">An error occurred</p>
                    </div>
                </div>
            `;
        }
    });
</script>
```

### Graceful Degradation

Implement fallback patterns for when JavaScript is disabled:

```html
<!-- templates/entries/delete_entry.html -->
<!-- This form is shown when JS is disabled -->
<noscript>
    <form action="{{ url_for('entries.delete', entry_id=entry.id) }}" method="POST" class="delete-form">
        <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
        <button type="submit" class="btn btn-danger">Delete Entry</button>
    </form>
</noscript>

<!-- This is used when JS is enabled (with HTMX) -->
<button class="btn btn-danger"
        hx-delete="{{ url_for('api.entries.delete', entry_id=entry.id) }}"
        hx-confirm="Are you sure you want to delete this entry?"
        hx-target="#entry-{{ entry.id }}"
        hx-swap="outerHTML">
    Delete Entry
</button>
```

Create fallback routes for non-JavaScript browsers:

```python
# app/routes/entries.py
@entries_bp.route('/<int:entry_id>/delete', methods=['POST'])
@login_required
def delete_entry_form(entry_id):
    """Non-JS fallback for entry deletion."""
    try:
        result = entry_service.delete_entry(entry_id=entry_id, user_id=current_user.id)
        
        if result.success:
            flash("Entry deleted successfully", "success")
        else:
            flash(result.message, "error")
        
        return redirect(url_for('entries.list'))
        
    except ApplicationError as e:
        flash(str(e), "error")
        return redirect(url_for('entries.view', entry_id=entry_id))
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        flash("An unexpected error occurred while deleting the entry.", "error")
        return redirect(url_for('entries.view', entry_id=entry_id))
```

Add no-JavaScript styles:

```css
/* static/css/noscript.css */
.js-only {
    display: none;
}

.no-js-only {
    display: block;
}
```

```html
<!-- In base.html -->
<script>
    // Hide no-js elements and show js-only elements when JS is enabled
    document.addEventListener('DOMContentLoaded', function() {
        document.body.classList.remove('no-js');
        document.body.classList.add('js-enabled');
    });
</script>
<noscript>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/noscript.css') }}">
</noscript>
```

## Logging and Monitoring

### Structured Logging Format

Implement structured logging with JSON format:

```python
# app/utils/logging.py
import logging
import json
import traceback
from datetime import datetime
from flask import request, has_request_context, g, current_app

class StructuredLogFormatter(logging.Formatter):
    """
    Formatter that outputs JSON-formatted logs with standard fields.
    """
    def format(self, record):
        log_record = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add request context if available
        if has_request_context():
            log_record.update({
                'request_id': getattr(g, 'request_id', None),
                'method': request.method,
                'path': request.path,
                'remote_addr': request.remote_addr,
                'user_agent': request.user_agent.string,
                'user_id': getattr(g, 'user_id', None)
            })
        
        # Add exception info if available
        if record.exc_info:
            log_record['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'traceback': traceback.format_exception(*record.exc_info)
            }
        
        # Add custom attributes
        if hasattr(record, 'props'):
            log_record.update(record.props)
        
        return json.dumps(log_record)

def init_app_logging(app):
    """
    Configure structured logging for the application.
    
    Args:
        app: Flask application instance
    """
    # Remove default handlers
    app.logger.handlers = []
    
    # Set loglevel based on config
    log_level = app.config.get('LOG_LEVEL', 'INFO')
    app.logger.setLevel(getattr(logging, log_level))
    
    # Create console handler for development
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(StructuredLogFormatter())
    app.logger.addHandler(console_handler)
    
    # In production, logging to stdout/stderr will be captured by journald
    app.logger.info("Logging initialized", extra={
        'props': {
            'environment': app.config.get('ENV'),
            'debug': app.debug
        }
    })

def log_with_context(logger, level, message, **context):
    """
    Helper function to log with additional context.
    
    Args:
        logger: Logger instance
        level: Log level (info, error, warning, etc)
        message: Log message
        context: Additional context fields to include in the log
    """
    log_method = getattr(logger, level.lower())
    log_method(message, extra={'props': context})
```

### Error Severity Classification

Create a utility for classifying error severity:

```python
# app/errors/severity.py
from enum import Enum, auto
from flask import current_app

class ErrorSeverity(Enum):
    """Classification of error severity levels."""
    DEBUG = auto()      # Development debugging info
    INFO = auto()       # Tracking normal operations
    WARNING = auto()    # Potential issues that don't affect functionality
    ERROR = auto()      # Errors that affect functionality but allow continued operation
    CRITICAL = auto()   # Severe errors that prevent operation

def log_error(error, severity, context=None):
    """
    Log an error with the appropriate severity level.
    
    Args:
        error: The error or exception 
        severity: ErrorSeverity level
        context: Additional context dict
    """
    context = context or {}
    
    message = f"{error.__class__.__name__}: {str(error)}"
    
    if severity == ErrorSeverity.DEBUG:
        current_app.logger.debug(message, extra={'props': context}, exc_info=error)
    elif severity == ErrorSeverity.INFO:
        current_app.logger.info(message, extra={'props': context})
    elif severity == ErrorSeverity.WARNING:
        current_app.logger.warning(message, extra={'props': context}, exc_info=error)
    elif severity == ErrorSeverity.ERROR:
        current_app.logger.error(message, extra={'props': context}, exc_info=error)
    elif severity == ErrorSeverity.CRITICAL:
        current_app.logger.critical(message, extra={'props': context}, exc_info=error)
        # Potentially send alerts for critical errors
        send_error_alert(error, context)

def send_error_alert(error, context):
    """
    Send an alert for critical errors.
    This could email the admin, send a message to a chat service, etc.
    
    Args:
        error: The error or exception
        context: Additional context dict
    """
    # Simplified implementation:
    if current_app.config.get('ERROR_ALERTS_ENABLED'):
        from app.utils.notification import send_admin_notification
        
        # Prepare alert message
        alert_message = (
            f"CRITICAL ERROR: {error.__class__.__name__}\n"
            f"Message: {str(error)}\n"
            f"Context: {context}\n"
        )
        
        # Send notification
        send_admin_notification(alert_message)
```

### Context Inclusion

Create a middleware to add useful context to logs:

```python
# app/middleware/request_context.py
import time
import uuid
from flask import g, request, current_app

def request_context_middleware(app):
    """
    Middleware to add context information to each request.
    This enriches logs with valuable debugging information.
    
    Args:
        app: Flask application instance
    """
    @app.before_request
    def before_request():
        # Generate unique request ID
        g.request_id = str(uuid.uuid4())
        
        # Track start time for performance logging
        g.start_time = time.time()
        
        # Add user ID if authenticated
        if hasattr(request, 'user') and request.user.is_authenticated:
            g.user_id = request.user.id
        
        # Log incoming request
        current_app.logger.info(
            f"Request started: {request.method} {request.path}",
            extra={
                'props': {
                    'request_id': g.request_id,
                    'method': request.method,
                    'path': request.path,
                    'remote_addr': request.remote_addr,
                    'user_agent': request.user_agent.string
                }
            }
        )
    
    @app.after_request
    def after_request(response):
        # Calculate request duration
        if hasattr(g, 'start_time'):
            duration_ms = (time.time() - g.start_time) * 1000
            
            # Add response metrics to log
            current_app.logger.info(
                f"Request completed: {request.method} {request.path} {response.status_code}",
                extra={
                    'props': {
                        'request_id': getattr(g, 'request_id', None),
                        'method': request.method,
                        'path': request.path,
                        'status_code': response.status_code,
                        'duration_ms': round(duration_ms, 2),
                        'response_size': len(response.data) if response.data else 0
                    }
                }
            )
        
        return response
    
    @app.teardown_request
    def teardown_request(exception=None):
        if exception:
            # Log request exception
            current_app.logger.error(
                f"Request failed: {request.method} {request.path}",
                extra={
                    'props': {
                        'request_id': getattr(g, 'request_id', None),
                        'method': request.method,
                        'path': request.path,
                        'exception': str(exception)
                    }
                },
                exc_info=exception
            )
```

### Systemd Journald Integration

Configure the application for integration with systemd's journald:

```python
# app/utils/journald.py
import json
import logging
import sys
from flask import current_app

class JournaldFormatter(logging.Formatter):
    """
    Format logs for systemd's journald.
    For best integration, use the PRIORITY field to set log levels.
    """
    # Map Python log levels to syslog priority levels
    PRIORITY_MAP = {
        logging.DEBUG: 7,      # Debug
        logging.INFO: 6,       # Informational
        logging.WARNING: 4,    # Warning
        logging.ERROR: 3,      # Error
        logging.CRITICAL: 2    # Critical
    }
    
    def format(self, record):
        # Start with standard message formatting
        message = super().format(record)
        
        # Add systemd journal fields
        # https://www.freedesktop.org/software/systemd/man/systemd.journal-fields.html
        log_data = {
            'MESSAGE': message,
            'PRIORITY': self.PRIORITY_MAP.get(record.levelno, 6),
            'SYSLOG_IDENTIFIER': current_app.name,
            'CODE_FILE': record.pathname,
            'CODE_LINE': record.lineno,
            'CODE_FUNC': record.funcName
        }
        
        # Add custom fields with JOURNAL_ prefix as required by systemd
        if hasattr(record, 'props'):
            for key, value in record.props.items():
                # Convert complex objects to strings
                if not isinstance(value, (str, int, float, bool, type(None))):
                    value = json.dumps(value)
                
                # Add JOURNAL_ prefix for custom fields
                log_data[f'JOURNAL_{key.upper()}'] = value
        
        # Return the structured log entry
        return json.dumps(log_data)

def configure_journald_logging(app):
    """
    Configure application logging to output to stdout/stderr in a format
    that works well with systemd's journald.
    
    Args:
        app: Flask application instance
    """
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, app.config.get('LOG_LEVEL', 'INFO')))
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create and configure stderr handler
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(JournaldFormatter())
    root_logger.addHandler(handler)
    
    # Configure Flask app logger
    app.logger.handlers = []
    app.logger.propagate = True  # Use root logger's handlers
    
    app.logger.info("Journald logging configured")
```

Create a systemd service file that properly captures logs:

```ini
# /etc/systemd/system/journal.service
[Unit]
Description=Personal Journal Flask Application
After=network.target

[Service]
User=your_username
Group=your_username
WorkingDirectory=/path/to/your/app
ExecStart=/path/to/your/venv/bin/gunicorn --workers=2 --bind=127.0.0.1:8000 wsgi:app
Restart=on-failure
StandardOutput=journal
StandardError=journal

# Add additional journald metadata
SyslogIdentifier=journal
LogLevelMax=6  # Map to syslog priority (6 = info)

[Install]
WantedBy=multi-user.target
```

Create a utility to view recent application logs:

```bash
#!/bin/bash
# scripts/view_logs.sh
# View application logs from journald

# Default values
LINES=50
PRIORITY="info"
FOLLOW=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
      -n|--lines)
            LINES="$2"
            shift 2
            ;;
      -p|--priority)
            PRIORITY="$2"
            shift 2
            ;;
      -f|--follow)
            FOLLOW=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Map priority names to journald priority values
case $PRIORITY in
    debug)
        PRIORITY_VALUE="7"
        ;;
    info)
        PRIORITY_VALUE="6"
        ;;
    warning|warn)
        PRIORITY_VALUE="4"
        ;;
    error|err)
        PRIORITY_VALUE="3"
        ;;
    critical|crit)
        PRIORITY_VALUE="2"
        ;;
    *)
        echo "Unknown priority: $PRIORITY"
        exit 1
        ;;
esac

# Build the journalctl command
CMD="journalctl -u journal"
CMD="$CMD -p 0..$PRIORITY_VALUE"
CMD="$CMD -n $LINES"

if $FOLLOW; then
    CMD="$CMD -f"
fi

# Run the command
echo "Showing $PRIORITY+ logs for journal service:"
eval $CMD
```

This comprehensive guide provides a robust error handling strategy for your Flask journal application, focusing on practical implementations rather than theoretical discussions. By following these patterns, you'll create a system that gracefully handles errors at all levels, from the service layer to the UI, and provides detailed logging for monitoring and debugging.
