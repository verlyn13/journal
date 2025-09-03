import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import FocusMode from './FocusMode';

export function SimpleEditor() {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Highlight],
    content: '<p>Welcome to the Sanctuary Journal Editor! Press F to toggle Focus Mode.</p>',
    editorProps: {
      attributes: {
        'aria-label': 'Editor',
        class: 'tiptap prose prose-sanctuary max-w-none min-h-80 outline-none p-4',
      },
    },
  });

  return (
    <FocusMode>
      <div className="space-y-4">
        {/* Editor Toolbar */}
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => editor?.commands.toggleBold()}
            className="px-3 py-1.5 text-sm font-medium bg-sanctuary-bg-secondary hover:bg-sanctuary-accent hover:text-sanctuary-bg-primary rounded-md transition-all border border-sanctuary-border"
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => editor?.commands.toggleItalic()}
            className="px-3 py-1.5 text-sm font-medium bg-sanctuary-bg-secondary hover:bg-sanctuary-accent hover:text-sanctuary-bg-primary rounded-md transition-all border border-sanctuary-border"
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => editor?.commands.toggleHighlight()}
            className="px-3 py-1.5 text-sm font-medium bg-sanctuary-bg-secondary hover:bg-sanctuary-accent hover:text-sanctuary-bg-primary rounded-md transition-all border border-sanctuary-border"
          >
            Highlight
          </button>
        </div>

        {/* Editor Content */}
        <div className="border border-sanctuary-border rounded-xl bg-sanctuary-bg-secondary">
          <EditorContent editor={editor} className="min-h-80" />
        </div>

        {/* Status Bar */}
        <div className="text-sm text-sanctuary-text-secondary">
          Press <kbd className="px-2 py-1 bg-sanctuary-bg-tertiary rounded">F</kbd> to toggle Focus
          Mode
        </div>
      </div>
    </FocusMode>
  );
}

export default SimpleEditor;
