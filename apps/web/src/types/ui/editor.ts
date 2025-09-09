/**
 * UI types for the editor components
 */

// TODO: Uncomment when TipTap is installed
// import type { Editor } from '@tiptap/react';
type Editor = unknown; // Temporary placeholder
import type { Entry } from '../domain/entry';

// Editor state types
export interface EditorState {
  isReady: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  lastSaved?: Date;
}

// Editor props
export interface EditorProps {
  entry?: Entry;
  onChange?: (content: string) => void;
  onSave?: (entry: Entry) => void;
  placeholder?: string;
  readOnly?: boolean;
}

// Focus mode types
export interface FocusModeProps {
  children: React.ReactNode;
  onFocusChange?: (isFocused: boolean) => void;
  initialFocus?: boolean;
  showToggle?: boolean;
}

// Bubble toolbar types
export interface BubbleToolbarProps {
  editor: Editor | null;
}

// Type guard for Editor instance
export function isEditorReady(editor: Editor | null): editor is Editor {
  return editor !== null && !editor.isDestroyed;
}

// Helper to safely execute editor commands
export function withEditor<T>(
  editor: Editor | null,
  callback: (editor: Editor) => T,
  defaultValue?: T,
): T | undefined {
  if (isEditorReady(editor)) {
    return callback(editor);
  }
  return defaultValue;
}
