/**
 * @fileoverview Theme configuration for the CodeMirror editor in Flask Journal.
 * Defines a custom theme with CSS variables to allow for customization.
 * @module editor/theme
 * @author Flask Journal Team
 */

import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight"; // Import tag system for styling

/**
 * CSS variable definitions for editor styling.
 * These variables should be defined in the application's CSS.
 * @type {Object.<string, string>}
 */
const colors = {
	background: "var(--editor-bg, #1e1e1e)",
	text: "var(--editor-text, #d4d4d4)",
	selection: "var(--editor-selection-bg, #3a3d41)",
	cursor: "var(--editor-cursor, #aeafad)",
	lineHighlight: "var(--editor-line-highlight-bg, #2a2a2a)",
	comment: "var(--editor-comment, #6a9955)",
	keyword: "var(--editor-keyword, #569cd6)",
	string: "var(--editor-string, #ce9178)",
	number: "var(--editor-number, #b5cea8)",
	heading: "var(--editor-heading, #4ec9b0)",
	link: "var(--editor-link, #9cdcfe)",
	operator: "var(--editor-operator, #d4d4d4)",
	punctuation: "var(--editor-punctuation, #808080)",
	// Add more as needed
};

/**
 * CodeMirror theme for Flask Journal editor.
 * Uses CSS variables for styling to allow for customization through the application's CSS.
 * Includes specialized styling for Markdown syntax elements.
 *
 * @type {Object}
 * @example
 * // Use in editor setup:
 * import { journalEditorTheme } from './theme';
 *
 * // Add to extensions when creating editor
 * const extensions = [
 *   basicSetup,
 *   markdown(),
 *   journalEditorTheme,
 *   // other extensions...
 * ];
 */
export const journalEditorTheme = EditorView.theme(
	{
		"&": {
			color: colors.text,
			backgroundColor: colors.background,
			height: "400px", // Default height, can be overridden
			border: "1px solid var(--editor-border-color, #333)",
			borderRadius: "var(--editor-border-radius, 4px)",
		},
		".cm-content": {
			caretColor: colors.cursor,
			fontFamily: "var(--editor-font-family, monospace)",
			fontSize: "var(--editor-font-size, 14px)",
			lineHeight: "var(--editor-line-height, 1.5)",
		},
		"&.cm-focused .cm-cursor": {
			borderLeftColor: colors.cursor,
		},
		"&.cm-focused .cm-selectionBackground, ::selection": {
			backgroundColor: colors.selection + " !important", // Use !important to override defaults if needed
		},
		".cm-gutters": {
			backgroundColor: colors.background,
			color: colors.punctuation, // Use punctuation color for line numbers
			border: "none",
		},
		".cm-activeLineGutter": {
			backgroundColor: colors.lineHighlight,
		},
		".cm-activeLine": {
			backgroundColor: colors.lineHighlight,
		},
		// Basic Markdown syntax highlighting using tags
		[t.heading]: { color: colors.heading, fontWeight: "bold" },
		[t.strong]: { fontWeight: "bold" },
		[t.emphasis]: { fontStyle: "italic" },
		[t.link]: { color: colors.link, textDecoration: "underline" },
		[t.url]: { color: colors.link },
		[t.quote]: { color: colors.comment, fontStyle: "italic" }, // Often styled like comments
		[t.keyword]: { color: colors.keyword }, // e.g., ```python
		[t.comment]: { color: colors.comment, fontStyle: "italic" }, // Code comments within blocks
		[t.string]: { color: colors.string },
		[t.number]: { color: colors.number },
		[t.operator]: { color: colors.operator },
		[t.punctuation]: { color: colors.punctuation },
		[t.monospace]: { fontFamily: "var(--editor-mono-font-family, monospace)" }, // For inline code
		[t.contentSeparator]: { color: colors.heading, fontWeight: "bold" }, // For --- horizontal rules
		[t.list]: { color: colors.text }, // Basic list item color
		[t.meta]: { color: colors.comment }, // e.g., Frontmatter
	},
	{ dark: true },
); // Assuming a dark theme by default
