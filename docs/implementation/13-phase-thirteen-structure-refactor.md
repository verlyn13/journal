***

title: Phase 13 - Structural Refactoring
phase: 13
description: "Outlines the tasks and plan for implementing structural refactoring and best practices based on initial planning recommendations."
status: active
related\_docs:
\- ../initial-planning/structure-update.md
------------------------------------------

# Phase 13: Structural Refactoring and Best Practices Implementation

**Goal:** Implement the recommendations outlined in the [Structural and Procedural Recommendations](./../initial-planning/structure-update.md) document to improve project structure, maintainability, testability, and robustness.

**Lead Architect:** flask-lead-architect

***

## Task Breakdown and Assignments

This phase involves coordinated changes across the backend, frontend, build pipeline, and testing setup. Tasks will be assigned to specialist modes.

### 1. Backend Refactoring (Flask Specialist - `flask-specialist`)

- **Task 1.1:** Review and potentially remove Flask-Assets (`journal/assets.py`) if Rollup fully covers its functionality. Ensure asset URLs are correctly generated/referenced post-removal.
- **Task 1.2:** Implement consistent data passing using `<script type="application/json">` in relevant templates (e.g., entry edit/create pages) instead of relying solely on `data-*` attributes or complex Jinja interpolation for initial editor content.
- **Task 1.3:** Create or refine API endpoints if needed (e.g., a dedicated `/api/v1/markdown/preview` endpoint) to separate concerns, as suggested for handling data formats.
- **Task 1.4:** Enhance backend logging using structured logging practices as recommended. Configure Flask's logger appropriately.
- **Task 1.5:** Implement basic backend unit tests (`pytest`) for core models and utility functions if not already covered.
- **Task 1.6:** Implement backend API tests (`pytest` with test client) for key endpoints, including auth and CRUD operations, and the new preview endpoint (if created).

### 2. Frontend Refactoring (Editor Specialist - `editor-specialist`)

- **Task 2.1:** Refactor frontend JavaScript (`src/js/`) to group Alpine/CodeMirror components logically (e.g., `src/js/editor/`). Ensure clear separation of concerns (e.g., CodeMirror setup in `editor/setup.js`).
- **Task 2.2:** Update Alpine components to read initial data from the `<script type="application/json">` implemented in Task 1.2.
- **Task 2.3:** Review and standardize Alpine component initialization (`x-init` vs. `init()` method with `$nextTick`). Ensure DOM elements (`$refs`) are reliably available before use.
- **Task 2.4:** Refactor CodeMirror integration: Ensure `createEditor` is clean, extensions are modular, and the initial `doc` is passed correctly.
- **Task 2.5:** Implement frontend logging improvements (strategic console logs, potentially `Alpine.onerror` hook for production error reporting).
- **Task 2.6:** Implement basic frontend unit tests (using Jest/Vitest - *Setup required if not present*) for critical utility functions or component logic.

### 3. Build Pipeline Refinements (Editor Specialist - `editor-specialist`)

- **Task 3.1:** Review `rollup.config.js` for clarity, consistency, and proper handling of JS bundling and CSS extraction.
- **Task 3.2:** Verify the cache-busting strategy is robust and consistently applied.
- **Task 3.3:** Enhance build script diagnostics to provide clearer output, especially on errors or when generating manifests.

### 4. Integration Testing Setup (Deferred / Future Phase)

- **Task 4.1:** Evaluate and implement an end-to-end testing framework (e.g., Cypress, Playwright) to test user flows involving the editor and other key features. *This is a larger task and may be deferred.*

***

## Implementation Sequence

1. Start with Backend Refactoring (Task 1.1, 1.2) and Frontend Refactoring (Task 2.1, 2.2) related to data passing and structure.
2. Proceed with parallel backend (1.3, 1.4) and frontend (2.3, 2.4, 2.5) refinements.
3. Address build pipeline refinements (Task 3.x).
4. Implement backend tests (Task 1.5, 1.6).
5. Implement frontend tests (Task 2.6).

*Coordination between Flask Specialist and Editor Specialist will be crucial, especially for data passing changes.*

***

## Current Status

*As of 2025-04-08*

- **Task 1 (Backend):** Not started.
- **Task 2 (Frontend):** Not started.
- **Task 3 (Build):**
  \- Task 3.1: Completed.
  \- Task 3.2: Completed.
  \- Task 3.3: Completed.
- **Task 4 (Integration Testing):** Deferred.
