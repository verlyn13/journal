---
title: "Implementation Plan: Phase 2 - Journal Entry CRUD"
description: "Phase 2 implementation plan for the Flask Journal MVP, covering the Entry model, database migration, forms, routes, and templates for basic CRUD operations on journal entries."
category: "Implementation Plan"
related_topics:
      - "Implementation Plan: Phase 1 - Project Setup & Core Authentication" # Link to ./01-phase-one-setup-auth.md
      - "Flask Journal MVP Scope Definition" # Link to ../initial-planning/mvp-high-level-implementation-guide.md
      - "Comprehensive Guide: Personal Flask Blog/Journal System" # Link to ../initial-planning/comprehensive-guide-personal.md
version: "1.0"
tags:
      - "implementation"
      - "phase 2"
      - "crud"
      - "journal entry"
      - "flask"
      - "sqlalchemy"
      - "flask-wtf"
      - "mvp"
---

# Implementation Plan: Phase 2 - Journal Entry CRUD

## Goal

The primary goal of Phase 2 is to implement the core functionality of the journal: allowing authenticated users to Create, Read, Update, and Delete their own journal entries.

## Prerequisites

-   Completion of Phase 1 ([Project Setup & Core Authentication](./01-phase-one-setup-auth.md)).
-   Familiarity with the overall project goals and architecture outlined in:
-   [Flask Journal MVP Scope Definition](../initial-planning/mvp-high-level-implementation-guide.md)
-   [Comprehensive Guide: Personal Flask Blog/Journal System](../initial-planning/comprehensive-guide-personal.md)

## Implementation Steps

**1. Define `Entry` Model (`journal/models/entry.py`):**

-   Create a new file `journal/models/entry.py`.
-   Define the `Entry` model inheriting from `db.Model`.
-   Include fields as defined in the MVP scope:
-   `id` (Integer, Primary Key)
-   `title` (String, required)
-   `body` (Text, required)
-   `timestamp` (DateTime, default=utcnow, indexed)
-   `user_id` (Integer, ForeignKey to `user.id`)
-   Establish the relationship back to the `User` model in `journal/models/user.py` (e.g., `entries = db.relationship('Entry', backref='author', lazy='dynamic')`).
-   Update `journal/models/__init__.py` to import the `Entry` model.

**2. Database Migration:**

-   Generate the database migration script: `flask db migrate -m "Add Entry model"`.
-   Review the generated migration script in `migrations/versions/`.
-   Apply the migration: `flask db upgrade`.

**3. Entry Forms (`journal/main/forms.py`):**

-   Create a new file `journal/main/forms.py`.
-   Define an `EntryForm` using Flask-WTF.
-   Include fields: `title` (StringField), `body` (TextAreaField), `submit` (SubmitField).
-   Add necessary validators (e.g., `DataRequired`, `Length`).
-   Update `journal/main/__init__.py` to import `forms`.

**4. Main Routes/Views (`journal/main/routes.py`):**

-   Modify the existing `index` route (`/`) to display a list of the *logged-in user's* journal entries (or a welcome message if none). Query `current_user.entries`.
-   Implement a route for creating a new entry (`/new_entry`, GET/POST):
-   Requires login (`@login_required`).
-   GET: Display the `EntryForm`.
-   POST: Validate the form, create a new `Entry` object associated with `current_user`, add it to the database session, commit, flash a success message, and redirect to the index or the new entry's detail page.
-   Implement a route for viewing a single entry (`/entry/<int:entry_id>`, GET):
-   Requires login.
-   Fetch the entry by ID.
-   **Crucially:** Verify the entry belongs to the `current_user`. Abort with 403 (Forbidden) if not.
-   Render a template displaying the entry details.
-   Implement a route for updating an existing entry (`/edit_entry/<int:entry_id>`, GET/POST):
-   Requires login.
-   Fetch the entry by ID.
-   Verify the entry belongs to the `current_user` (abort 403 if not).
-   GET: Populate the `EntryForm` with the existing entry data.
-   POST: Validate the form, update the fetched entry object, commit, flash a success message, and redirect to the entry's detail page.
-   Implement a route for deleting an entry (`/delete_entry/<int:entry_id>`, POST):
-   Requires login.
-   Fetch the entry by ID.
-   Verify the entry belongs to the `current_user` (abort 403 if not).
-   Delete the entry from the database session, commit, flash a success message, and redirect to the index page. (Consider using a confirmation mechanism, though basic POST deletion is acceptable for MVP).
-   Ensure all routes requiring authentication use the `@login_required` decorator.

**5. Update Templates (`journal/templates/`):**

-   **`index.html`:**
-   Modify to loop through `entries` passed from the view.
-   Display entry titles, timestamps, and links to view details (`/entry/<id>`), edit (`/edit_entry/<id>`), and delete (perhaps a small form with a button posting to `/delete_entry/<id>`).
-   Add a prominent link/button to create a new entry (`/new_entry`).
-   Handle the case where there are no entries.
-   **`base.html`:**
-   Ensure navigation reflects logged-in state appropriately (e.g., show "My Entries" link).
-   **Create `journal/templates/main/` directory.**
-   **Create `main/entry_detail.html`:**
-   Extends `base.html`.
-   Displays the full entry title and body.
-   Includes links/buttons to edit or delete *this* entry.
-   **Create `main/create_entry.html`:**
-   Extends `base.html`.
-   Renders the `EntryForm` for creating a new entry.
-   Includes a clear title (e.g., "New Journal Entry").
-   **Create `main/edit_entry.html`:**
-   Extends `base.html`.
-   Renders the `EntryForm` for editing an existing entry.
-   Includes a clear title (e.g., "Edit Journal Entry").

## Testing Considerations (Phase 2)

-   Unit tests for `Entry` model properties and relationships.
-   Unit tests for `EntryForm` validation.
-   Integration tests for all CRUD routes:
-   Test access control (only logged-in users, only owners can view/edit/delete).
-   Test successful creation, viewing, updating, and deletion.
-   Test form validation errors.
-   Test redirects after successful operations.
-   Test handling of non-existent entries (404).
-   Test access attempts by non-owners (403).

## Next Steps (Phase 3 Preview)

-   Basic styling improvements (potentially using a lightweight CSS framework like Pico.css or Bootstrap).
-   Adding pagination for the entry list.
-   Refining user feedback/flash messages.
-   Potential enhancements like Markdown support for entry bodies (if deemed within extended MVP scope).