/**
 * @fileoverview CodeMirror editor setup and configuration for Flask Journal.
 * Creates and configures the CodeMirror editor instance with appropriate extensions.
 * @module editor/setup
 * @author Flask Journal Team
 */

import { EditorState } from "@codemirror/state";
import { EditorView, placeholder, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine, keymap } from "@codemirror/view"; // Added keymap import
import { history, defaultKeymap, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"; // Needed for bracket handling
import { journalEditorTheme } from "./theme";

// Removed coreExtensions function as we now use basicSetup

/**
 * Creates an update listener extension that calls the onChange callback when document content changes.
 * 
 * @private
 * @param {function(string)} onChange - Callback function to call with the new content
 * @returns {Extension} CodeMirror extension for handling content changes
 */
const contentChangeCallback = (onChange) => EditorView.updateListener.of((update) => {
    if (update.docChanged) {
        onChange(update.state.doc.toString());
    }
});

/**
 * Creates a CodeMirror editor instance in the given parent element.
 * This is the main function for initializing the Markdown editor. It configures the editor
 * with a custom set of extensions providing core functionality (line numbers, history, keymaps),
 * Markdown language support, the application's custom theme, placeholder text, and a
 * callback mechanism for content changes.
 *
 * @param {HTMLElement} parentElement - The DOM element to attach the editor to
 * @param {string} initialDoc - The initial document content for the editor
 * @param {Object} options - Configuration options
 * @param {function(string)} [options.onChange] - Callback function triggered on content change
 * @param {Array} [options.additionalExtensions=[]] - Array of extra CodeMirror extensions
 * @returns {EditorView} The created CodeMirror editor view instance
 * @example
 * // Create a basic editor with default settings
 * const editor = createEditor(document.getElementById('editor-container'), '# Hello World');
 * 
 * // Create an editor with content change notification
 * const editor = createEditor(
 *   document.getElementById('editor-container'),
 *   'Initial content',
 *   { 
 *     onChange: (newContent) => console.log('Content changed:', newContent) 
 *   }
 * );
 */
export function createEditor(parentElement, initialDoc = "", options = {}) {
    const { onChange = () => {}, additionalExtensions = [] } = options;
    const state = EditorState.create({
        doc: initialDoc,
        extensions: [
            // Minimal setup - replacing basicSetup
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            drawSelection(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }), // Basic syntax highlighting
            bracketMatching(),
            closeBrackets(),
            highlightActiveLine(),
            EditorState.allowMultipleSelections.of(true), // Often part of basic setup
            EditorView.lineWrapping, // Enable line wrapping

            // Keymaps (order might matter)
            keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...historyKeymap,
                // ...searchKeymap, // Add if search is needed
                // ...lintKeymap // Add if linting is needed
            ]),

            // Original extensions
            markdown({ base: markdownLanguage, codeLanguages: languages }), // Add Markdown support
            journalEditorTheme, // Add custom theme
            placeholder("Start writing your journal entry..."), // Add placeholder text
            contentChangeCallback(onChange), // Add our change listener
            ...additionalExtensions // Spread any additional extensions provided
        ],
    });

    const view = new EditorView({
        state,
        parent: parentElement,
    });

    return view;
}

// Mode state is managed by the Alpine component (alpine-component.js)