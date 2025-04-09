---
title: "Phase 6: Tags Functionality Implementation Plan"
description: "Plan for implementing tag functionality (creation, association, display, filtering) for journal entries."
category: "Implementation Plan"
related_topics:
  - "docs/initial-planning/mvp-high-level-implementation-guide.md"
  - "docs/implementation/05-phase-five-summary.md"
version: "1.0"
tags:
  - "implementation"
  - "plan"
  - "phase-6"
  - "tags"
  - "flask"
  - "journal"
  - "many-to-many"
  - "filtering"
---

# Phase 6: Tags Functionality Implementation Plan

**Goal:** Implement the ability to add tags to journal entries, display them, and filter the entry list by a selected tag.

**Prerequisites:** Completion of Phase 1-5 (MVP).

**Affected Files/Modules:**

*   `journal/models/entry.py`
*   `journal/models/tag.py` (New)
*   `journal/models/__init__.py`
*   `journal/main/forms.py`
*   `journal/main/routes.py`
*   `journal/templates/main/create_entry.html`
*   `journal/templates/main/edit_entry.html`
*   `journal/templates/main/entry_detail.html`
*   `journal/templates/main/index.html`
*   `tests/` (Updates and new tests)
*   Potentially `journal/main/services.py` (If refactored from routes)

**Implementation Steps:**

1.  **Database Model (`DB Designer (SQLAlchemy)`):**
    *   Create `journal/models/tag.py` defining the `Tag` model (`id`, `name`).
    *   Define the `entry_tags` many-to-many association table (e.g., within `journal/models/tag.py` or `entry.py`).
    *   Add `tags` relationship to `journal/models/entry.py` (`db.relationship` with `secondary=entry_tags`).
    *   Add `entries` relationship to `journal/models/tag.py` (`db.relationship` with `secondary=entry_tags`).
    *   Import `Tag` in `journal/models/__init__.py`.

2.  **Database Migration (`Flask Specialist`):**
    *   Run `flask db migrate -m "Add Tag model and entry_tags association"`.
    *   Run `flask db upgrade`.
    *   Verify table creation.

3.  **Forms (`Flask Specialist`):**
    *   Add `tags = StringField('Tags (comma-separated)')` to `EntryForm` in `journal/main/forms.py`.

4.  **Backend Logic (Routes/Services) (`Flask Specialist`):**
    *   **Tag Processing Function:** Create a helper function (e.g., in routes or a new `utils.py`) `process_tags(tag_string)` that takes the comma-separated string, splits it, strips whitespace, removes duplicates/empty strings, finds or creates `Tag` objects, and returns a list of `Tag` instances.
    *   **Create/Edit Routes:**
        *   In `create_entry` route: Get `form.tags.data`, call `process_tags`, assign the resulting list to `entry.tags` before saving.
        *   In `edit_entry` route: Get `form.tags.data`, call `process_tags`. Clear the existing `entry.tags` list (`entry.tags.clear()`) and then append the new tags before saving. Pre-populate the form field on GET request by joining the existing `entry.tags` names with commas.
    *   **View/List Routes:**
        *   Pass the `entry.tags` list to the `entry_detail.html` template.
        *   Ensure `entry.tags` are loaded efficiently in the `index` route (e.g., using `options(joinedload(Entry.tags))` if performance becomes an issue, but likely fine for MVP+1). Pass tags to the `index.html` template.
    *   **Filter Route:**
        *   Create a new route `/tag/<tag_name>` decorated with `@login_required`.
        *   Query the `Tag` model by `tag_name`. If not found, 404.
        *   Query entries associated with that tag for the current user: `Tag.query.filter_by(name=tag_name).first_or_404().entries.filter_by(user_id=current_user.id).order_by(Entry.created_at.desc()).paginate(...)`.
        *   Render the `index.html` template, passing the filtered entries and the tag name (for display).

5.  **Templates (`Flask Specialist`):**
    *   **Forms:** Add `{{ render_field(form.tags) }}` to `create_entry.html` and `edit_entry.html`. Add helper text like "Enter tags separated by commas".
    *   **Detail View:** In `entry_detail.html`, add a section to display tags: Loop through `entry.tags`, display each `tag.name` as a link to `/tag/{{ tag.name }}`.
    *   **List View:**
        *   In `index.html`, below the title/date for each entry, display its tags similarly to the detail view (linked tag names).
        *   Add an optional header like `<h2>Entries tagged with '{{ tag_name }}'</h2>` if a `tag_name` variable is passed to the template (from the filter route).

6.  **Testing (`Test Writer (Pytest Boilerplate)` -> `Flask Specialist`):**
    *   Update existing CRUD tests to handle the tags field.
    *   Add unit tests for the `Tag` model.
    *   **Refinement:** Modify timestamp assertions in `test_tag_creation` (and potentially `test_entry_creation`) to use a time delta comparison (e.g., `abs(now - created_at) < timedelta(seconds=5)`) instead of exact `<=/>=` checks. This avoids failures due to microsecond timing variations between test execution and database default timestamp generation, especially with SQLite.
    *   Add integration tests for creating/editing entries with various tag inputs (new tags, existing tags, mixed, empty).
    *   Add integration tests for the `/tag/<tag_name>` route, verifying filtering and display.

**Verification:**

*   Manually test creating entries with tags.
*   Manually test editing entries, changing tags.
*   Verify tags are displayed correctly on the list and detail pages.
*   Click tag links and verify the filtered list works correctly.
*   Run all `pytest` tests.