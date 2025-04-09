---
title: "Implementation Plan: Phase 9 - Editor Refinement & Completion"
description: "Phase 9 implementation plan for the Flask Journal MVP, focusing on fixing editor bugs (view mode switching), implementing core features (live preview, toolbar actions), and adding basic tests."
category: "Implementation Plan"
related_topics:
  - "docs/implementation/08-phase-eight-editor-integration.md"
  - "docs/initial-planning/editor-implementation.md"
  - "docs/status/2025-04-07-stabilization-post-phase-8.md"
version: "1.0"
tags:
  - "implementation"
  - "phase 9"
  - "editor"
  - "codemirror"
  - "alpinejs"
  - "bugfix"
  - "refinement"
  - "preview"
  - "toolbar"
  - "testing"
  - "mvp"
---

# Implementation Plan: Phase 9 - Editor Refinement & Completion

## Goal

The primary goal of Phase 9 is to address critical bugs and complete the core interactive functionality of the CodeMirror editor integrated in Phase 8. This includes fixing the view mode switching, implementing the live Markdown preview, enabling toolbar actions, and adding initial tests for editor features.

## Prerequisites

*   Completion of Phase 8 and the subsequent stabilization efforts.
*   Understanding of the existing editor architecture involving CodeMirror 6, Alpine.js, and the backend preview API (`/api/v1/markdown`).
*   Familiarity with the relevant planning documents:
    *   [UI/UX Editor Implementation Guide: CodeMirror 6 Integration](../initial-planning/editor-implementation.md)
    *   [Implementation Plan: Phase 8 - CodeMirror Editor Integration](08-phase-eight-editor-integration.md)

## Implementation Steps

**1. Fix View Mode Switching Bug:**

*   **File:** `journal/templates/components/toolbar.html`
*   **Action:** Verify that all view mode buttons (Edit, Split, Preview) explicitly have `type="button"`. If they are already set correctly, investigate if the `@click="setMode('...')"` handler in the Alpine component needs to prevent default event propagation (`@click.prevent="setMode('...')"`).
*   **Verification:** Manually test clicking the view mode buttons on the create/edit entry pages ensures the view changes correctly without submitting the form or redirecting.

**2. Implement Live Preview Functionality:**

*   **File:** `src/js/editor/alpine-component.js`
*   **Action:** Refine the `updatePreview` and `debouncedUpdatePreview` methods within the `editor` Alpine.js component.
    *   Ensure the `fetch` call correctly targets `/api/v1/markdown` (POST), includes the CSRF token, and sends the current editor content (`this.content`) in the JSON body (`{ "text": this.content }`).
    *   Implement proper handling of the JSON response (expecting `{"html": "..."}`) and update `this.preview`.
    *   Include robust error handling for the fetch request (e.g., using `.catch()` and displaying an error message in the preview pane).
    *   Verify the `this.$nextTick(() => { window.MathJax.typesetPromise(...) });` call is correctly placed within the successful fetch response handler *after* `this.preview` is updated in the DOM via `x-html`.
    *   Ensure the `isPreviewLoading` flag is set/unset appropriately.
*   **Verification:** Type Markdown and LaTeX syntax in the editor; verify the preview pane updates automatically (after debounce) with correctly rendered HTML and MathJax output. Check browser console and network tab for errors.

**3. Implement Toolbar Actions:**

*   **File:** `src/js/editor/alpine-component.js`
*   **Action:** Update the placeholder toolbar action methods (`insertMarkdown`) to correctly call the `insertMarkdownSyntax` function imported from `src/js/editor/toolbar-actions.js`, passing the `this.editorView` instance and the action type ('image', 'table', 'code').
*   **File:** `src/js/editor/toolbar-actions.js`
*   **Action:** Review the `insertMarkdownSyntax` function to ensure the CodeMirror transaction logic correctly inserts the desired Markdown syntax and places the cursor appropriately for each action type.
*   **Verification:** Click the Image, Table, and Code Block buttons in the editor toolbar; verify the corresponding Markdown syntax is inserted into the CodeMirror editor at the current cursor position.

**4. Review and Refine Alpine Component:**

*   **File:** `src/js/editor/alpine-component.js`
*   **Action:** Conduct a general review of the `editor` component logic. Ensure state variables (`mode`, `content`, `preview`, `isPreviewLoading`) are managed correctly. Check initialization logic (`init()`) and mode setting (`setMode`). Ensure interaction with `EditorPersistence` is sound (basic draft saving/loading).
*   **Verification:** Perform general usability testing of the editor, switching modes, typing, using toolbar actions, and reloading the page (if draft persistence is expected to work).

**5. Add Basic Editor Tests:**

*   **Location:** `tests/` (likely new files, e.g., `tests/frontend/test_editor.js` using a JS test runner or `tests/integration/test_editor.py` using Flask test client and potentially Selenium/Playwright for full interaction).
*   **Action:** Implement initial tests covering:
    *   **Mode Switching:** Verify clicking mode buttons updates the component's `mode` state and potentially associated CSS classes (integration test might be needed).
    *   **Preview API Call:** Test that typing in the editor triggers a (mocked) fetch request to the preview API after debouncing (JS unit test).
    *   **Toolbar Action:** Test that clicking a toolbar button calls the appropriate CodeMirror command/transaction (JS unit test mocking `editorView` or integration test).
*   **Note:** Full end-to-end testing might be deferred, but basic unit/integration tests for the core logic should be added. Choose the testing approach (JS unit tests, Python integration tests, or both) appropriate for the project setup.

**6. Rebuild Frontend Assets:**

*   **Action:** Run `npm run build` after completing code changes.

## Testing Considerations (Phase 9)

*   Focus manual testing on the editor's interactive elements: mode switching, live preview updates (including MathJax), and toolbar button functionality.
*   Verify behavior across different browsers if possible.
*   Check for JavaScript errors in the browser console.
*   Run the newly added automated tests.

## Next Steps (Post-Phase 9)

*   Address any further bugs identified during testing.
*   Consider implementing additional editor features from the backlog (e.g., more toolbar buttons, improved styling, accessibility enhancements).
*   Update relevant documentation (Phase 9 Summary, potentially update Phase 8 summary/plan if significant overlaps were fixed).