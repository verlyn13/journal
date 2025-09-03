import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as KaTeX from 'katex';
import { useEffect, useState } from 'react';
import 'katex/dist/katex.min.css';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import BubbleToolbar from './BubbleToolbar';
import { CodeBlockMonaco } from './extensions/CodeBlockMonaco';
import { MathBlock, MathInline } from './extensions/Math';
import SlashCommands from './extensions/SlashCommands';
import FocusMode from './FocusMode';

export function Editor() {
  const [monacoLoaded, setMonacoLoaded] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({ openOnClick: false }),
      Highlight,
      Placeholder.configure({
        placeholder: "Start writing… Press '/' for commands",
      }),
      Typography,

      MathInline,
      MathBlock,
      CodeBlockMonaco,
      SlashCommands,
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        'aria-label': 'Editor',
        style: 'min-height: 320px; outline: none;',
      },
    },
  });

  // NodeViews handle KaTeX render; no post-pass needed.
  useEffect(() => {
    if (!editor) return;
    editor.on('update', () => {
      document.querySelectorAll<HTMLSpanElement>('span.math-inline').forEach((el) => {
        try {
          const tex = el.textContent || '';
          if (!tex.trim()) return;
          KaTeX.render(tex, el, { throwOnError: false });
        } catch {}
      });
    });
    // Initial pass
    setTimeout(() => editor.commands.setContent(editor.getHTML()), 0);
    return () => {
      // Cleanup if needed - editor.on doesn't return an unsubscribe function
    };
  }, [editor]);

  async function loadMonaco() {
    if (monacoLoaded) return;
    await import('monaco-editor');
    setMonacoLoaded(true);
  }

  return (
    <FocusMode>
      <BubbleToolbar editor={editor} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button type="button" onClick={() => editor?.commands.toggleBold()}>
          Bold
        </button>
        <button type="button" onClick={() => editor?.commands.toggleItalic()}>
          Italic
        </button>
        <button type="button" onClick={() => loadMonaco()}>
          Load Code Tools
        </button>
        {monacoLoaded && <span style={{ opacity: 0.8 }}>(Monaco ready)</span>}
      </div>
      <EditorContent editor={editor} />
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
        {editor && (
          <>
            <span>{editor.state.doc.textContent.length} chars</span>
            <span style={{ margin: '0 6px' }}>·</span>
            <span>
              {editor.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length || 0} words
            </span>
          </>
        )}
      </div>
    </FocusMode>
  );
}

export default Editor;
