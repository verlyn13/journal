---
title: "Implementation Plan: Phase 11 - Editor MVP Feature Completion"
description: "Phase 11 implementation plan for the Flask Journal MVP, focusing on adding essential Markdown formatting toolbar buttons (Bold, Italic, Link, Lists, Blockquote) and implementing draft clearing on successful submission."
category: "Implementation Plan"
related_topics:
      - "docs/implementation/09-phase-nine-editor-refinement.md"
      - "docs/initial-planning/editor-implementation.md"
version: "1.0"
tags:
      - "implementation"
      - "phase 11"
      - "editor"
      - "codemirror"
      - "alpinejs"
      - "toolbar"
      - "markdown"
      - "drafts"
      - "mvp"
---

# Implementation Plan: Phase 11 - Editor MVP Feature Completion

## Goal

The goal of Phase 11 is to implement the remaining essential features for the CodeMirror editor to meet MVP requirements. This includes adding common Markdown formatting buttons to the toolbar and ensuring local draft storage is cleared upon successful entry submission.

## Prerequisites

-   Completion of Phase 9 (Editor Refinement & Completion).
-   Understanding of the editor architecture (CodeMirror, Alpine.js, `toolbar-actions.js`, `persistence.js`).
-   Familiarity with the relevant planning documents.

## Implementation Steps

**1. Expand Toolbar HTML:**

-   **File:** `journal/templates/components/toolbar.html`
-   **Action:** Add new buttons within the "Formatting Controls Group" for:
-   Bold (`@click="insertMarkdown('bold')"`), Title/Aria-label: "Bold"
-   Italic (`@click="insertMarkdown('italic')"`), Title/Aria-label: "Italic"
-   Link (`@click="insertMarkdown('link')"`), Title/Aria-label: "Insert Link"
-   Unordered List (`@click="insertMarkdown('ul')"`), Title/Aria-label: "Bulleted List"
-   Ordered List (`@click="insertMarkdown('ol')"`), Title/Aria-label: "Numbered List"
-   Blockquote (`@click="insertMarkdown('blockquote')"`), Title/Aria-label: "Blockquote"
-   **Note:** Use appropriate SVG icons or text labels for the buttons, maintaining the existing style (`cli-modern-button`). Ensure `type="button"` is present.

**2. Implement Toolbar Logic:**

-   **File:** `src/js/editor/toolbar-actions.js`
-   **Action:** Extend the `switch` statement within the `insertMarkdownSyntax` function to handle the new types: `bold`, `italic`, `link`, `ul`, `ol`, `blockquote`.
-   **Bold/Italic:** Wrap selected text with `**` or `*`. If no text is selected, insert the markers and place the cursor between them.
-   **Link:** Wrap selected text like `[selected text](url)`. If no text is selected, insert `[link text](url)`. Place the cursor within the `(url)` part.
-   **Lists (ul/ol):** Prepend `- ` or `1. ` to the current line or selected lines. Handle indentation/nested lists if feasible for MVP, otherwise basic line prepending is sufficient.
-   **Blockquote:** Prepend `> ` to the current line or selected lines.
-   **Refinement:** Ensure the `createTransaction` helper or similar logic correctly handles cursor placement and selection updates for each case.

**3. Implement Draft Clearing Logic:**

-   **File:** `src/js/editor/persistence.js`
-   **Action:** Add a `clearDraft(entryId)` method to the `EditorPersistence` class. This method should remove the corresponding item from `localStorage` using the key generated from `entryId` (or the generic key for new entries).
-   **File:** `src/js/editor/alpine-component.js`
-   **Action:** Modify the `init()` method of the `editor` Alpine.js component.
-   After initializing `this.persistence`, check if a specific success indicator exists in the DOM. A reliable indicator is the presence of a success flash message (e.g., check if `document.querySelector('.flash-success')` is not null).
-   If the success indicator is found, call `this.persistence.clearDraft(this.persistence.entryId)` (assuming `entryId` is stored on the persistence instance).
-   **File:** `journal/main/routes.py` (or wherever flash messages are generated)
-   **Action:** Ensure a consistent success flash message (e.g., category 'success') is generated upon successful creation *and* successful update of an entry.

**4. Add Basic Tests:**

-   **Location:** `tests/` (e.g., `tests/frontend/test_editor_actions.js` or extend existing tests).
-   **Action:** Add tests for the new cases in `insertMarkdownSyntax`. Mock `editorView` and verify the dispatched transactions for bold, italic, link, lists, and blockquote insertion.
-   **Action:** Add a test (potentially integration) to verify that the draft is cleared from `localStorage` after successfully submitting the entry form and reloading the page (checking for the success flash message).

**5. Rebuild Frontend Assets:**

-   **Action:** Run `npm run build` after completing code changes.

## Testing Considerations

-   Manually test all new toolbar buttons with and without text selected.
-   Verify list and blockquote formatting works correctly, especially on multiple lines.
-   Test draft persistence: Create/edit an entry, type something, reload the page (draft should load). Submit the entry successfully, then go back to create/edit again – the previous draft should *not* load.
-   Run automated tests.

## Next Steps (Post-Phase 11)

-   Perform comprehensive manual testing of all editor features.
-   Address any remaining bugs.
-   Consider final deployment preparations or further enhancements based on project goals.