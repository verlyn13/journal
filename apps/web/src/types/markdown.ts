export interface MarkdownEditorProps {
  initialContent: string;
  format: 'html' | 'markdown';
  onContentChange: (content: string) => void;
  readOnly?: boolean;
}

export interface ConversionResult {
  markdown: string;
  success: boolean;
  errors?: string[];
}

export interface MarkdownEntry {
  id: string;
  content: string;
  format: 'html' | 'markdown';
  markdown?: string;
}

export interface EditorState {
  content: string;
  isDirty: boolean;
  lastSaved: string;
  format: 'markdown';
}
