import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import BubbleToolbar from './BubbleToolbar';
import { CodeBlockMonaco } from './extensions/CodeBlockMonaco';
import { MathBlock, MathInline } from './extensions/Math';
import SlashCommands from './extensions/SlashCommands';

interface JournalEditorProps {
  selectedEntry?: {
    id: string;
    title: string;
    content: string;
  };
  onSave?: (content: string, title: string) => void;
  saving?: boolean;
}

export function JournalEditor({ selectedEntry, onSave, saving }: JournalEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [entryTitle, setEntryTitle] = useState(selectedEntry?.title || 'Untitled Entry');
  const [hasChanges, setHasChanges] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-sanctuary-accent hover:text-sanctuary-accent-hover underline',
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-warm-sand/30 px-1 rounded',
        },
      }),
      Typography,
      MathInline,
      MathBlock,
      CodeBlockMonaco,
      SlashCommands,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Heading ${node.attrs.level}`;
          }
          return 'Start writing your thoughts... Let the words flow naturally.';
        },
      }),
    ],
    content: selectedEntry
      ? selectedEntry.content
      : `
      <h1>Welcome to Your Sanctuary</h1>
      <p>This is your personal space for reflection, planning, and creative expression. Here are some features to get you started:</p>
      
      <h2>✨ What You Can Do</h2>
      <ul>
        <li><strong>Focus Mode</strong>: Press <kbd>F</kbd> or click the Focus button for distraction-free writing</li>
        <li><strong>Rich Formatting</strong>: Use the toolbar that appears when you select text</li>
        <li><strong>Quick Actions</strong>: Type <code>/</code> to access slash commands (coming soon)</li>
        <li><strong>Mathematical Expressions</strong>: Write equations with LaTeX support (coming soon)</li>
      </ul>

      <h2>🌅 Daily Practice</h2>
      <p>Consider starting each entry with:</p>
      <ul>
        <li>Three things you're grateful for</li>
        <li>Your primary intention for the day</li>
        <li>A moment of recent joy or learning</li>
      </ul>

      <h2>📝 Your Space</h2>
      <p>This editor grows with you. Feel free to delete this content and make it truly yours. Remember:</p>
      <blockquote>
        <p><em>"The act of writing is the act of discovering what you believe."</em></p>
      </blockquote>

      <p>Take a deep breath, press F to enter Focus Mode when ready, and let your thoughts flow...</p>
    `,
    editorProps: {
      attributes: {
        'aria-label': 'Journal Editor',
        class:
          'prose prose-sanctuary prose-lg max-w-none min-h-96 outline-none p-6 font-serif leading-relaxed',
        style: 'font-family: "Lora", serif; line-height: 1.75;',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.split(' ').filter((word) => word.length > 0).length);
      setCharacterCount(text.length);

      // Track if content has changed
      const currentContent = editor.getHTML();
      if (currentContent !== lastSavedContent) {
        setHasChanges(true);
      }
    },
  });

  // Update editor content when entry changes
  useEffect(() => {
    if (!editor || !selectedEntry) return;

    if (selectedEntry.content && selectedEntry.content !== editor.getHTML()) {
      editor.commands.setContent(selectedEntry.content);
      setLastSavedContent(selectedEntry.content);
      setHasChanges(false);
    }

    if (selectedEntry.title) {
      setEntryTitle(selectedEntry.title);
    }
  }, [editor, selectedEntry]);

  // Add keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editor && onSave && hasChanges) {
          const content = editor.getHTML();
          onSave(content, entryTitle);
          setLastSavedContent(content);
          setHasChanges(false);
          localStorage.setItem('journal:draft', content);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, onSave, hasChanges, entryTitle]);

  // Auto-save functionality
  useEffect(() => {
    if (!editor) return;

    const saveInterval = setInterval(() => {
      const content = editor.getHTML();
      localStorage.setItem('journal:draft', content);
    }, 10000); // Save every 10 seconds

    return () => clearInterval(saveInterval);
  }, [editor]);

  // Load saved draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('journal:draft');
    if (savedDraft && editor) {
      // Don't overwrite if user has already started typing
      const currentContent = editor.getText().trim();
      if (currentContent.length < 100) {
        // Only load if minimal content
        editor.commands.setContent(savedDraft);
      }
    }
  }, [editor]);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = () => {
    if (!editor || !onSave) return;

    const content = editor.getHTML();
    onSave(content, entryTitle);
    setLastSavedContent(content);
    setHasChanges(false);

    // Also save to localStorage
    localStorage.setItem('journal:draft', content);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-b border-sanctuary-border pb-4">
        <div className="flex items-center justify-between mb-2">
          <input
            type="text"
            value={entryTitle}
            onChange={(e) => {
              setEntryTitle(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Enter title..."
            className="text-2xl font-serif font-bold bg-transparent border-none outline-none text-sanctuary-text-primary placeholder-sanctuary-text-secondary/50 flex-1"
          />
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                hasChanges && !saving
                  ? 'bg-sanctuary-accent text-sanctuary-bg-primary hover:bg-sanctuary-accent-hover'
                  : 'bg-sanctuary-bg-tertiary text-sanctuary-text-secondary cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : hasChanges ? 'Save Entry' : 'Saved'}
            </button>
            <div className="text-sm text-sanctuary-text-secondary">
              <time dateTime={new Date().toISOString()}>
                {formatDate()} • {formatTime()}
              </time>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-sanctuary-text-secondary">
          <span>{wordCount} words</span>
          <span>{characterCount} characters</span>
          <span className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-yellow-500' : 'bg-evergreen-aqua'}`}
            ></div>
            {hasChanges ? 'Unsaved changes' : 'All changes saved'}
          </span>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-sanctuary-border/50">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all border ${
            editor?.isActive('heading', { level: 1 })
              ? 'bg-sanctuary-accent text-sanctuary-bg-primary border-sanctuary-accent'
              : 'bg-sanctuary-bg-secondary hover:bg-sanctuary-bg-tertiary border-sanctuary-border'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all border ${
            editor?.isActive('heading', { level: 2 })
              ? 'bg-sanctuary-accent text-sanctuary-bg-primary border-sanctuary-accent'
              : 'bg-sanctuary-bg-secondary hover:bg-sanctuary-bg-tertiary border-sanctuary-border'
          }`}
        >
          H2
        </button>
        <div className="w-px h-6 bg-sanctuary-border"></div>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all border ${
            editor?.isActive('bold')
              ? 'bg-sanctuary-accent text-sanctuary-bg-primary border-sanctuary-accent'
              : 'bg-sanctuary-bg-secondary hover:bg-sanctuary-bg-tertiary border-sanctuary-border'
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all border ${
            editor?.isActive('italic')
              ? 'bg-sanctuary-accent text-sanctuary-bg-primary border-sanctuary-accent'
              : 'bg-sanctuary-bg-secondary hover:bg-sanctuary-bg-tertiary border-sanctuary-border'
          }`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHighlight().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all border ${
            editor?.isActive('highlight')
              ? 'bg-warm-sand text-sanctuary-text-primary border-warm-sand'
              : 'bg-sanctuary-bg-secondary hover:bg-sanctuary-bg-tertiary border-sanctuary-border'
          }`}
        >
          ✨
        </button>
        <div className="w-px h-6 bg-sanctuary-border"></div>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all border ${
            editor?.isActive('bulletList')
              ? 'bg-sanctuary-accent text-sanctuary-bg-primary border-sanctuary-accent'
              : 'bg-sanctuary-bg-secondary hover:bg-sanctuary-bg-tertiary border-sanctuary-border'
          }`}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all border ${
            editor?.isActive('orderedList')
              ? 'bg-sanctuary-accent text-sanctuary-bg-primary border-sanctuary-accent'
              : 'bg-sanctuary-bg-secondary hover:bg-sanctuary-bg-tertiary border-sanctuary-border'
          }`}
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all border ${
            editor?.isActive('blockquote')
              ? 'bg-sanctuary-accent text-sanctuary-bg-primary border-sanctuary-accent'
              : 'bg-sanctuary-bg-secondary hover:bg-sanctuary-bg-tertiary border-sanctuary-border'
          }`}
        >
          "
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        <BubbleToolbar editor={editor} />
        <div className="border border-sanctuary-border rounded-xl bg-sanctuary-bg-secondary/30 backdrop-blur-sm min-h-96 focus-within:border-sanctuary-accent/50 transition-colors">
          <EditorContent editor={editor} className="min-h-96" />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-xs text-sanctuary-text-secondary space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-2 py-1 bg-sanctuary-bg-tertiary rounded text-xs">Ctrl+S</kbd> to
              Save
            </span>
            <span>
              <kbd className="px-2 py-1 bg-sanctuary-bg-tertiary rounded text-xs">F</kbd> for Focus
              Mode
            </span>
            <span>
              <kbd className="px-2 py-1 bg-sanctuary-bg-tertiary rounded text-xs">/</kbd> for
              commands
            </span>
          </div>
          <div className="text-right">
            <div>Last saved: {formatTime()}</div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-sanctuary-border to-transparent"></div>
        <div className="text-center py-2">
          <p className="italic">
            Your thoughts matter. Write freely, think deeply, grow continuously.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default JournalEditor;
