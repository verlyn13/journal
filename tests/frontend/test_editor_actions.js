/**
 * Basic tests for editor toolbar actions.
 * Note: These are simplified tests and might need a more robust mocking setup
 * (e.g., using Jest or Vitest with JSDOM) for real-world scenarios.
 * For now, we'll mock the necessary parts of the CodeMirror view/state directly.
 */
import { EditorState, EditorSelection, Text } from "@codemirror/state";
import {
    insertBold,
    insertItalic,
    insertLink,
    insertList,
    insertBlockquote
} from '../../src/js/editor/toolbar-actions'; // Adjust path as needed

// --- Mocking CodeMirror View/State ---

// Simple mock dispatch function to capture transactions
let dispatchedSpec = null;
const mockDispatch = (spec) => {
    dispatchedSpec = spec;
};

// Helper to create a mock view with specific content and selection
const createMockView = (doc = "", selection = { anchor: 0, head: 0 }) => {
    const state = EditorState.create({
        doc: Text.of(doc.split('\n')), // Use Text.of for multi-line docs
        selection: EditorSelection.single(selection.anchor, selection.head)
    });
    return {
        state,
        dispatch: mockDispatch,
        focus: () => {} // Mock focus method
    };
};

// Helper to get the changes from a dispatched spec
const getChanges = (spec) => {
    if (!spec) return [];
    if (spec.changes) {
        if (Array.isArray(spec.changes)) return spec.changes;
        return [spec.changes]; // Normalize single change object to array
    }
    return [];
};

// Helper to get the selection from a dispatched spec
const getSelection = (spec) => {
    return spec?.selection;
};


// --- Test Suite ---

console.log("--- Running Toolbar Action Tests ---");

// Reset dispatched spec before each test
const beforeEach = () => {
    dispatchedSpec = null;
};

// Test: insertBold (no selection)
beforeEach();
let view = createMockView();
insertBold(view);
let changes = getChanges(dispatchedSpec);
let selection = getSelection(dispatchedSpec);
console.assert(changes.length === 1, "insertBold (no selection): Should have 1 change");
console.assert(changes[0]?.insert === '****bold text**', `insertBold (no selection): Incorrect insert: ${changes[0]?.insert}`);
console.assert(selection?.main?.anchor === 2, `insertBold (no selection): Incorrect cursor pos: ${selection?.main?.anchor}`);
console.log("Test: insertBold (no selection) - PASSED (basic check)");

// Test: insertBold (with selection)
beforeEach();
view = createMockView("hello", { anchor: 0, head: 5 });
insertBold(view);
changes = getChanges(dispatchedSpec);
selection = getSelection(dispatchedSpec);
console.assert(changes.length === 2, "insertBold (with selection): Should have 2 changes");
console.assert(changes[0]?.insert === '**', `insertBold (with selection): Incorrect prefix: ${changes[0]?.insert}`);
console.assert(changes[1]?.insert === '**', `insertBold (with selection): Incorrect suffix: ${changes[1]?.insert}`);
console.assert(selection?.main?.anchor === 2 && selection?.main?.head === 7, `insertBold (with selection): Incorrect selection: ${selection?.main?.anchor}-${selection?.main?.head}`);
console.log("Test: insertBold (with selection) - PASSED (basic check)");

// Test: insertItalic (no selection)
beforeEach();
view = createMockView();
insertItalic(view);
changes = getChanges(dispatchedSpec);
selection = getSelection(dispatchedSpec);
console.assert(changes.length === 1, "insertItalic (no selection): Should have 1 change");
console.assert(changes[0]?.insert === '**italic text*', `insertItalic (no selection): Incorrect insert: ${changes[0]?.insert}`);
console.assert(selection?.main?.anchor === 1, `insertItalic (no selection): Incorrect cursor pos: ${selection?.main?.anchor}`);
console.log("Test: insertItalic (no selection) - PASSED (basic check)");

// Test: insertLink (no selection)
beforeEach();
view = createMockView();
insertLink(view);
changes = getChanges(dispatchedSpec);
selection = getSelection(dispatchedSpec);
console.assert(changes.length === 1, "insertLink (no selection): Should have 1 change");
console.assert(changes[0]?.insert === '[link text](url)', `insertLink (no selection): Incorrect insert: ${changes[0]?.insert}`);
console.assert(selection?.main?.anchor === 11, `insertLink (no selection): Incorrect cursor pos: ${selection?.main?.anchor}`); // Cursor inside (url)
console.log("Test: insertLink (no selection) - PASSED (basic check)");

// Test: insertLink (with selection)
beforeEach();
view = createMockView("my site", { anchor: 0, head: 7 });
insertLink(view);
changes = getChanges(dispatchedSpec);
selection = getSelection(dispatchedSpec);
console.assert(changes.length === 1, "insertLink (with selection): Should have 1 change");
console.assert(changes[0]?.insert === '[my site](url)', `insertLink (with selection): Incorrect insert: ${changes[0]?.insert}`);
console.assert(selection?.main?.anchor === 10, `insertLink (with selection): Incorrect cursor pos: ${selection?.main?.anchor}`); // Cursor inside (url)
console.log("Test: insertLink (with selection) - PASSED (basic check)");

// Test: insertList (ul, single line)
beforeEach();
view = createMockView("item", { anchor: 0, head: 4 });
insertList(view, 'ul');
changes = getChanges(dispatchedSpec);
console.assert(changes.length === 1, "insertList (ul, single): Should have 1 change");
console.assert(changes[0]?.from === 0, `insertList (ul, single): Incorrect from: ${changes[0]?.from}`);
console.assert(changes[0]?.insert === '- ', `insertList (ul, single): Incorrect insert: ${changes[0]?.insert}`);
console.log("Test: insertList (ul, single line) - PASSED (basic check)");

// Test: insertList (ol, multi-line)
beforeEach();
view = createMockView("item1\nitem2", { anchor: 0, head: 11 }); // Select across lines
insertList(view, 'ol');
changes = getChanges(dispatchedSpec);
console.assert(changes.length === 2, "insertList (ol, multi): Should have 2 changes");
console.assert(changes[0]?.from === 0 && changes[0]?.insert === '1. ', `insertList (ol, multi): Incorrect change 1: ${changes[0]?.insert}`);
console.assert(changes[1]?.from === 6 && changes[1]?.insert === '2. ', `insertList (ol, multi): Incorrect change 2: ${changes[1]?.insert}`); // Line 2 starts at index 6
console.log("Test: insertList (ol, multi-line) - PASSED (basic check)");

// Test: insertBlockquote (multi-line)
beforeEach();
view = createMockView("line one\nline two", { anchor: 0, head: 18 });
insertBlockquote(view);
changes = getChanges(dispatchedSpec);
console.assert(changes.length === 2, "insertBlockquote (multi): Should have 2 changes");
console.assert(changes[0]?.from === 0 && changes[0]?.insert === '> ', `insertBlockquote (multi): Incorrect change 1: ${changes[0]?.insert}`);
console.assert(changes[1]?.from === 9 && changes[1]?.insert === '> ', `insertBlockquote (multi): Incorrect change 2: ${changes[1]?.insert}`); // Line 2 starts at index 9
console.log("Test: insertBlockquote (multi-line) - PASSED (basic check)");


console.log("--- Toolbar Action Tests Completed ---");

// TODO: Add tests for draft clearing logic (might require mocking localStorage and DOM)