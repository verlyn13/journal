---
id: example-config
title: Example Configuration (Flask Journal)
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- reference
- react
priority: medium
status: approved
visibility: internal
schema_version: v1
---

***

title: "Example Configuration (Flask Journal)"
description: "Example CodeMirror configuration as implemented in the Flask Journal project."
category: "CodeMirror Examples"
date\_created: "2025-04-08"
last\_updated: "2025-04-08"
version: "1.0"
status: active
tags: \["codemirror", "configuration", "example", "setup", "flask-journal"]
related\_topics:
\- "CodeMirror Integration Guide"
\- "Editor Architecture"
------------------------

# Example Configuration (Flask Journal)

This document shows the core configuration used to set up the CodeMirror editor within the Flask Journal application, as implemented in `src/js/editor/setup.js`. Instead of using the pre-packaged `basicSetup`, the application uses a custom selection of extensions tailored to its needs.

```javascript
import { EditorState } from "@codemirror/state";
import { EditorView, placeholder, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine, keymap } from "@codemirror/view";
import { history, defaultKeymap, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { journalEditorTheme } from "./theme"; // Assuming theme.js is in the same directory

/**
 * Creates an update listener extension that calls the onChange callback
 * when document content changes.
 * @param {function(string)} onChange - Callback function
 * @returns {Extension}
 */
const contentChangeCallback = (onChange) => EditorView.updateListener.of((update) => {
    if (update.docChanged) {
        onChange(update.state.doc.toString());
    }
});

// Example Usage within a setup function:
function createJournalEditor(parentElement, initialDoc = "", onChangeCallbackFn = () => {}) {
    const state = EditorState.create({
        doc: initialDoc,
        extensions: [
            // Core editing features (similar to parts of basicSetup)
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            drawSelection(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            closeBrackets(),
            highlightActiveLine(),
            EditorState.allowMultipleSelections.of(true),
            EditorView.lineWrapping,

            // Keymaps
            keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...historyKeymap,
            ]),

            // Application-specific extensions
            markdown({ base: markdownLanguage, codeLanguages: languages }), // Markdown language support
            journalEditorTheme, // Custom application theme
            placeholder("Start writing your journal entry..."), // Placeholder text
            contentChangeCallback(onChangeCallbackFn), // Callback for content changes
        ],
    });

    const view = new EditorView({
        state,
        parent: parentElement,
    });

    return view;
}

// --- How to use it ---
// const editorContainer = document.getElementById('editor-container');
// const myOnChangeHandler = (newContent) => { console.log("Content updated:", newContent); };
// const editorInstance = createJournalEditor(editorContainer, "# Initial Content", myOnChangeHandler);

```

This configuration provides:

- Basic editing features (line numbers, history, highlighting).
- Standard keybindings.
- Markdown language support with syntax highlighting for code blocks.
- A custom theme (`journalEditorTheme`).
- Placeholder text for empty editors.
- A callback mechanism (`onChange`) for reacting to content changes.
