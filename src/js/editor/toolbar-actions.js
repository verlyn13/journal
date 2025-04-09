import { EditorSelection, Text } from "@codemirror/state";

/**
 * Helper to create a transaction spec for inserting text around a selection or at the cursor.
 * Handles placing the cursor correctly for empty selections.
 *
 * @param {EditorState} state - The current editor state.
 * @param {string} prefix - Text to insert before.
 * @param {string} suffix - Text to insert after.
 * @param {string} placeholder - Text to insert if selection is empty.
 * @param {number} [cursorOffset=prefix.length] - Where to place the cursor relative to the start of the insertion when empty.
 * @returns {object} A transaction spec { changes, selection }
 */
function createWrappingTransaction(state, prefix, suffix, placeholder, cursorOffset = prefix.length) {
    const range = state.selection.main;
    if (range.empty) {
        const textToInsert = prefix + placeholder + suffix;
        return {
            changes: { from: range.from, insert: textToInsert },
            selection: EditorSelection.cursor(range.from + cursorOffset)
        };
    } else {
        return {
            changes: [
                { from: range.from, insert: prefix },
                { from: range.to, insert: suffix }
            ],
            selection: EditorSelection.range(range.from + prefix.length, range.to + prefix.length) // Keep selection, adjusted for prefix
        };
    }
}

/**
 * Helper to create a transaction spec for prepending text to selected lines.
 *
 * @param {EditorState} state - The current editor state.
 * @param {string} prefix - The text to prepend to each line.
 * @param {boolean} [numberLines=false] - Whether to number the lines (for ordered lists).
 * @returns {object} A transaction spec { changes }
 */
function createLinePrependingTransaction(state, prefix, numberLines = false) {
    const changes = [];
    let currentNumber = 1;
    const range = state.selection.main;
    const startLine = state.doc.lineAt(range.from);
    const endLine = state.doc.lineAt(range.to);

    for (let i = startLine.number; i <= endLine.number; i++) {
        const line = state.doc.line(i);
        // Skip empty lines unless it's the only line selected and it's empty
        if (line.length === 0 && startLine.number !== endLine.number) continue;

        let linePrefix = prefix;
        if (numberLines) {
            linePrefix = `${currentNumber}. `;
            currentNumber++;
        }
        changes.push({ from: line.from, insert: linePrefix });
    }
    return { changes };
}


// --- Exported Toolbar Actions ---

export function insertBold(view) {
    const spec = createWrappingTransaction(view.state, '**', '**', 'bold text');
    view.dispatch(view.state.update(spec, { userEvent: 'input.format.bold' }));
    view.focus();
}

export function insertItalic(view) {
    const spec = createWrappingTransaction(view.state, '*', '*', 'italic text');
    view.dispatch(view.state.update(spec, { userEvent: 'input.format.italic' }));
    view.focus();
}

export function insertLink(view) {
    const { state } = view;
    const range = state.selection.main;
    let spec;

    if (range.empty) {
        const textToInsert = '[link text](url)';
        spec = {
            changes: { from: range.from, insert: textToInsert },
            // Place cursor inside (url) -> length of "[link text](" is 11
            selection: EditorSelection.cursor(range.from + 11)
        };
    } else {
        const selectedText = state.sliceDoc(range.from, range.to);
        const textToInsert = `[${selectedText}](url)`;
        spec = {
            changes: { from: range.from, to: range.to, insert: textToInsert },
            // Place cursor inside (url) -> length of `[${selectedText}](` is selectedText.length + 3
            selection: EditorSelection.cursor(range.from + selectedText.length + 3)
        };
    }
    view.dispatch(view.state.update(spec, { userEvent: 'input.format.link' }));
    view.focus();
}

export function insertList(view, type) {
    const prefix = type === 'ol' ? '1. ' : '- ';
    const numberLines = type === 'ol';
    const spec = createLinePrependingTransaction(view.state, prefix, numberLines);
    if (spec.changes.length > 0) {
        view.dispatch(view.state.update(spec, { userEvent: `input.format.${type}` }));
    }
    view.focus();
}

export function insertBlockquote(view) {
    const spec = createLinePrependingTransaction(view.state, '> ');
    if (spec.changes.length > 0) {
        view.dispatch(view.state.update(spec, { userEvent: 'input.format.blockquote' }));
    }
    view.focus();
}


/**
 * Original generic function for inserting Markdown syntax, handling both inline and block elements.
 * Kept primarily for compatibility with older/complex buttons (Image, Table, Code Block).
 * Handles wrapping selected text or inserting placeholders with prefixes/suffixes.
 * For block elements, ensures prefixes/suffixes are placed on appropriate new lines.
 *
 * @param {EditorView} view - The CodeMirror EditorView instance.
 * @param {string} prefix - The syntax to insert before the selection or placeholder (e.g., '```\n').
 * @param {string} [suffix=''] - The syntax to insert after the selection or placeholder (e.g., '\n```').
 * @param {string} [placeholder=''] - Text to insert between prefix and suffix if there's no selection.
 * @param {boolean} [block=false] - If true, treats the insertion as a block element, managing newlines around the prefix and suffix.
 */
export function insertMarkdownSyntax(view, prefix, suffix = '', placeholder = '', block = false) {
    const { state } = view;
    const changes = [];
    const range = state.selection.main; // Get the primary selection range
    const startLine = state.doc.lineAt(range.from); // Define startLine here for potential use later

    let insertPrefix = prefix;
    let insertSuffix = suffix;
    let insertPlaceholder = placeholder || prefix + (suffix || ''); // Default placeholder

    if (block) {
        // Ensure block elements are on new lines
        // const startLine = state.doc.lineAt(range.from); // Already defined above
        const endLine = state.doc.lineAt(range.to);

        if (startLine.from > 0 && state.doc.sliceString(startLine.from - 1, startLine.from) !== '\n') {
            insertPrefix = '\n' + insertPrefix;
        }
        if (startLine.number === endLine.number && startLine.length === 0) {
             // Empty line, just insert block with placeholder
             insertPlaceholder = insertPrefix + '\n' + placeholder + '\n' + insertSuffix;
             changes.push({ from: range.from, to: range.to, insert: insertPlaceholder });
        } else {
            // Insert prefix before the start of the line containing the selection start
            changes.push({ from: startLine.from, insert: insertPrefix + '\n' });

            // Insert suffix after the end of the line containing the selection end
            // Ensure it's on a new line if content exists after the selection on the same line
            let suffixPos = endLine.to;
            if (endLine.to < state.doc.length && state.doc.sliceString(endLine.to, endLine.to + 1) !== '\n') {
                 insertSuffix = '\n' + insertSuffix;
            } else if (endLine.to === state.doc.length) {
                 // If at the very end of the doc, ensure newline before suffix if needed
                 if (state.doc.sliceString(endLine.to -1, endLine.to) !== '\n') {
                    insertSuffix = '\n' + insertSuffix;
                 }
            }
            changes.push({ from: endLine.to, insert: '\n' + insertSuffix });
        }

    } else {
        // Inline element handling
        if (range.empty) {
            // No selection, insert placeholder with prefix/suffix
            changes.push({ from: range.from, insert: insertPrefix + placeholder + insertSuffix });
        } else {
            // Wrap selection
            changes.push({ from: range.from, insert: insertPrefix });
            changes.push({ from: range.to, insert: insertSuffix });
        }
    }

    // Dispatch transaction
    view.dispatch({
        changes,
        selection: range.empty && !block
            ? EditorSelection.cursor(range.from + insertPrefix.length) // Place cursor after prefix if empty inline
            : range.empty && block
            ? EditorSelection.cursor(startLine.from + insertPrefix.length + 1 + placeholder.length + 1) // Place cursor inside block placeholder
            : undefined, // Keep selection if text was selected
        userEvent: 'input.format' // Tag the transaction type
    });

    // Focus the editor after the action
    view.focus();
}

// --- Keep existing placeholders for reference or future use ---
// export function insertImage(view) {
//     // Example: insertMarkdownSyntax(view, '![', '](url)', 'alt text');
//     // Using the new helper:
//     const spec = createWrappingTransaction(view.state, '![', '](url)', 'alt text', 2); // Cursor after ![
//     view.dispatch(view.state.update(spec, { userEvent: 'input.format.image' }));
//     view.focus();
// }

// export function insertTable(view) {
//     const table = `| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |\n| Cell 3 | Cell 4 |`;
//     // Needs block insertion logic - could adapt createLinePrependingTransaction or use simpler insert
//     const { state } = view;
//     const range = state.selection.main;
//     // Basic insertion at cursor, potentially needs newline logic like original insertMarkdownSyntax block part
//     view.dispatch({
//         changes: { from: range.from, insert: table + '\n' },
//         userEvent: 'input.format.table'
//     });
//     view.focus();
// }

// export function insertCodeBlock(view) {
//     // Using the new helper:
//     const spec = createWrappingTransaction(view.state, '```\n', '\n```', 'code here', 4); // Cursor after ```\n
//     view.dispatch(view.state.update(spec, { userEvent: 'input.format.codeblock' }));
//     view.focus();
// }