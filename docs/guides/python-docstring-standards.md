---
title: "Python Docstring Standards Guide"
description: "Standards and best practices for Python docstrings in the Flask Journal project"
category: "Documentation"
created_date: "2025-04-08" 
updated_date: "2025-04-08"
version: "1.0"
status: active
related_topics:
  - "Documentation Standards"
  - "JSDoc Standards Guide"
  - "Code Quality"
tags: ["documentation", "standards", "python", "docstrings", "sphinx"]
---

# Python Docstring Standards Guide

## Overview

This guide outlines the standards for documenting Python code in the Flask Journal project using docstrings. Consistent docstring documentation is essential for improving code maintainability, enabling effective automated documentation generation, and supporting AI assistance during development.

## Core Principles

1. **Completeness**: Document all public modules, classes, functions, and methods
2. **Clarity**: Use clear, concise language that precisely describes the code's behavior
3. **Consistency**: Follow the same format and style throughout the codebase
4. **AI-Consumability**: Structure documentation in a way that's easily parsed by AI tools

## Docstring Style

Flask Journal uses **Google style** docstrings. This style is chosen for its:

- Readability and clarity
- Widespread adoption in the Python community
- Compatibility with Sphinx and other documentation generators
- Similarity to our JSDoc standards, providing consistency across languages

## Required Docstring Elements

### Module Docstrings

Each Python module (.py file) should include a module-level docstring:

```python
"""
Brief description of the module.

Detailed description that explains the purpose and contents
of the module. This can span multiple lines.

Attributes:
    module_level_variable (type): Description of variable and its purpose.
"""
```

### Class Docstrings

Class docstrings should include:

```python
class MyClass:
    """Brief description of the class.
    
    Detailed description that explains what the class does
    and how it should be used. Provide context and usage notes.
    
    Attributes:
        attr_name (type): Description of the attribute.
        another_attr (type): Description of another attribute.
    """
```

### Function and Method Docstrings

Functions and methods should include:

```python
def my_function(param1, param2=None, *args, **kwargs):
    """Brief description of what the function does.
    
    Extended description providing additional details, 
    context, and important usage information.
    
    Args:
        param1 (type): Description of parameter.
        param2 (type, optional): Description of optional parameter.
            Defaults to None.
        *args: Variable length argument list.
        **kwargs: Arbitrary keyword arguments.
    
    Returns:
        return_type: Description of the return value.
        
    Raises:
        ExceptionType: When and why this exception is raised.
        
    Examples:
        >>> my_function('value', param2='other_value')
        Expected result
    """
```

### Property Docstrings

Properties should be documented with:

```python
@property
def my_property(self):
    """Brief description of the property.
    
    Returns:
        type: Description of the return value.
    """
```

## Docstring Sections Reference

The following sections should be used when applicable:

| Section | Purpose | Format |
|---------|---------|--------|
| Args | Document function parameters | Name (type): Description |
| Returns | Document return value | type: Description |
| Raises | Document exceptions | ExceptionType: Description |
| Attributes | Document class attributes | Name (type): Description |
| Examples | Provide usage examples | >>> code\nResult |
| Notes | Additional information | Free text |
| Warnings | Important cautions | Free text |
| See Also | Reference related items | function_name, ClassName |

## Examples

### Module Docstring

```python
"""
Authentication related forms.

This module contains all forms related to user authentication,
including login, registration, and password reset.

Attributes:
    password_min_length (int): Minimum required password length.
"""

password_min_length = 8
```

### Class Docstring

```python
class User(UserMixin, db.Model):
    """User model for authentication and authorization.
    
    This class represents a user in the system and stores authentication
    information as well as relationships to user content.
    
    Attributes:
        id (int): Primary key for the user record.
        username (str): Unique username for the user.
        email (str): User's email address.
        password_hash (str): Hashed password for security.
        entries (relationship): Relationship to user's journal entries.
    """
```

### Function Docstring

```python
def create_app(config_class_name='config.Config'):
    """Application factory function.
    
    Creates and configures an instance of the Flask application
    based on the provided configuration class.
    
    Args:
        config_class_name (str): Dotted path to the configuration
            class. Defaults to 'config.Config'.
    
    Returns:
        Flask: A configured Flask application instance.
    
    Examples:
        >>> app = create_app()
        >>> test_app = create_app('config.TestConfig')
    """
```

### Method Docstring

```python
def set_password(self, password):
    """Hash and store a user's password.
    
    Securely hashes the provided password using Werkzeug's
    generate_password_hash function and stores it in the user model.
    
    Args:
        password (str): The plaintext password to hash and store.
    
    Raises:
        ValueError: If password is too short or otherwise invalid.
    """
```

## Best Practices for AI-Consumable Docstrings

To ensure that documentation is easily consumable by AI systems:

1. **Use consistent terminology**: Maintain a consistent vocabulary throughout the documentation
2. **Provide complete examples**: Include both simple and complex use cases when appropriate
3. **Document edge cases**: Describe behavior with unusual inputs or conditions
4. **Be specific about types**: Clearly indicate parameter and return types
5. **Keep descriptions concise**: Be thorough but avoid unnecessary verbosity
6. **Document side effects**: Note when functions modify state outside their scope
7. **Include context**: Explain why certain design decisions were made

## Documentation Tools

### Recommended Python Docstring Tools

The following tools can help enforce and work with our docstring standards:

1. **pydocstyle**: Linter that checks compliance with Python docstring conventions
2. **Sphinx**: Documentation generator that can create HTML documentation from docstrings
3. **sphinx-autodoc**: Sphinx extension that automatically includes documented modules
4. **flake8-docstrings**: Flake8 plugin for checking docstring style
5. **docformatter**: Tool to automatically format docstrings to conform to PEP 257

### Integration with Documentation Workflow

While not currently implemented, these tools could be integrated into our workflow:

```bash
# Check docstring style compliance
pydocstyle journal/

# Generate HTML documentation from docstrings
sphinx-build -b html docs/sphinx docs/sphinx/build
```

## Relationship to JSDoc Standards

This Python docstring standard complements our [JSDoc Standards](jsdoc-standards.md) for JavaScript. The two standards follow similar patterns to maintain consistency across languages, with adaptations for language-specific conventions.

## See Also

- [JSDoc Standards Guide](jsdoc-standards.md)
- [Documentation Templates Guide](documentation-templates.md)
- [Python PEP 257 (Docstring Conventions)](https://peps.python.org/pep-0257/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings)