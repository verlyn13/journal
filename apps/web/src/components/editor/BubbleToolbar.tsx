import { BubbleMenu, type Editor } from '@tiptap/react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { isEditorReady } from '../../types/ui/editor';
import './BubbleToolbar.css';

// Icon components
const Icons = {
  bold: () => (
    <svg
      role="img"
      aria-label="Bold"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <title>Bold</title>
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  ),
  italic: () => (
    <svg
      role="img"
      aria-label="Italic"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <title>Italic</title>
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  strike: () => (
    <svg
      role="img"
      aria-label="Strikethrough"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <title>Strikethrough</title>
      <path d="M16 4H9a3 3 0 0 0-2.83 4" />
      <path d="M14 12a4 4 0 0 1 0 8H6" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  ),
  code: () => (
    <svg
      role="img"
      aria-label="Code"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <title>Code</title>
      <path d="M16 18l6-6-6-6" />
      <path d="M8 6l-6 6 6 6" />
    </svg>
  ),
  link: () => (
    <svg
      role="img"
      aria-label="Link"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <title>Link</title>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  unlink: () => (
    <svg
      role="img"
      aria-label="Remove link"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <title>Remove link</title>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      <line x1="8" y1="2" x2="16" y2="10" />
      <line x1="8" y1="22" x2="16" y2="14" />
    </svg>
  ),
  heading: () => (
    <svg
      role="img"
      aria-label="Heading"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <title>Heading</title>
      <path d="M6 12h12M6 12V6m0 6v6m12-6V6m0 6v6" />
    </svg>
  ),
  highlight: () => (
    <svg
      role="img"
      aria-label="Highlight"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <title>Highlight</title>
      <path d="M9 11H1l2-2 2-2 4 4zM22 12l-4 4-4-4 4-4 4 4zM11 9l4 4-4 4-4-4 4-4z" />
    </svg>
  ),
  math: () => (
    <svg
      role="img"
      aria-label="Math"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <title>Math</title>
      <path d="M12 4v16m-4-4l4-4 4 4M8 4h8" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  ),
};

interface LinkEditorProps {
  editor: Editor;
  initialUrl?: string;
  onSave: (url: string) => void;
  onCancel: () => void;
}

const LinkEditor: React.FC<LinkEditorProps> = ({ initialUrl = '', onSave, onCancel }) => {
  const [url, setUrl] = useState(initialUrl);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const validateUrl = useCallback((urlValue: string) => {
    const raw = urlValue.trim();
    if (!raw) {
      setErrorMessage('URL cannot be empty');
      return false;
    }

    // Support mailto: links explicitly
    const emailPattern = /^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(raw)) {
      setErrorMessage('');
      return true;
    }

    // Normalize: add https:// if missing (so URL() can parse)
    const normalized = /^(https?:\/\/)/i.test(raw) ? raw : `https://${raw}`;
    try {
      const parsed = new URL(normalized);
      const host = parsed.hostname;
      const hasTLD = host.includes('.');
      const isLocalhost = host === 'localhost';
      const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
      const validHost = hasTLD || isLocalhost || isIPv4;
      if (!validHost) {
        setErrorMessage('Please enter a valid host (domain, localhost, or IPv4)');
        return false;
      }
      setErrorMessage('');
      return true;
    } catch {
      setErrorMessage(
        'Please enter a valid URL (e.g., example.com, localhost:3000, or https://example.com)',
      );
      return false;
    }
  }, []);

  const handleSave = useCallback(() => {
    const trimmedUrl = url.trim();
    if (!validateUrl(trimmedUrl)) {
      setIsValid(false);
      return;
    }
    onSave(trimmedUrl);
  }, [url, onSave, validateUrl]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [handleSave, onCancel],
  );

  const getUrlPreview = useCallback((urlValue: string) => {
    if (!urlValue.trim()) return '';
    let preview = urlValue.trim();
    if (!/^https?:\/\//i.test(preview) && !preview.startsWith('mailto:')) {
      preview = `https://${preview}`;
    }
    try {
      const parsedUrl = new URL(preview);
      return parsedUrl.hostname + (parsedUrl.pathname !== '/' ? parsedUrl.pathname : '');
    } catch {
      return preview;
    }
  }, []);

  return (
    <div className="bubble-link-editor">
      <div className="bubble-link-input-container">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setIsValid(true);
            setErrorMessage('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter URL or email (e.g., example.com, mailto:user@example.com)"
          className={`bubble-link-input ${!isValid ? 'invalid' : ''}`}
        />
        {url.trim() && isValid && (
          <div className="bubble-link-preview">Preview: {getUrlPreview(url)}</div>
        )}
        {!isValid && errorMessage && <div className="bubble-link-error">{errorMessage}</div>}
      </div>
      <div className="bubble-link-actions">
        <button
          type="button"
          onClick={handleSave}
          className="bubble-link-save"
          disabled={!url.trim()}
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className="bubble-link-cancel">
          Cancel
        </button>
      </div>
    </div>
  );
};

interface BubbleToolbarProps {
  editor: Editor | null;
}

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [showHighlightColors, setShowHighlightColors] = useState(false);

  const isLinkActive = editor?.isActive('link') ?? false;
  const currentLink = isLinkActive && editor ? editor.getAttributes('link').href : '';

  const handleLinkToggle = useCallback(() => {
    if (!editor) return;
    if (isLinkActive) {
      // Remove link
      editor.chain().focus().unsetLink().run();
    } else {
      // Show link editor
      setShowLinkEditor(true);
    }
  }, [editor, isLinkActive]);

  const handleLinkSave = useCallback(
    (url: string) => {
      if (!editor) return;
      // Ensure URL has protocol
      let finalUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        finalUrl = `https://${url}`;
      }

      editor.chain().focus().setLink({ href: finalUrl }).run();
      setShowLinkEditor(false);
    },
    [editor],
  );

  const handleLinkCancel = useCallback(() => {
    setShowLinkEditor(false);
    editor?.commands.focus();
  }, [editor]);

  const toggleHeading = useCallback(
    (level: 1 | 2 | 3) => {
      if (!isEditorReady(editor)) return;
      if (editor.isActive('heading', { level })) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().toggleHeading({ level }).run();
      }
    },
    [editor],
  );

  const highlightColors = [
    { name: 'Yellow', value: '#FEF08A' },
    { name: 'Green', value: '#BBF7D0' },
    { name: 'Blue', value: '#BFDBFE' },
    { name: 'Purple', value: '#DDD6FE' },
    { name: 'Pink', value: '#FBCFE8' },
    { name: 'Orange', value: '#FED7AA' },
  ];

  const handleHighlight = useCallback(
    (color: string) => {
      if (!isEditorReady(editor)) return;
      if (editor.isActive('highlight', { color })) {
        editor.chain().focus().unsetHighlight().run();
      } else {
        editor.chain().focus().setHighlight({ color }).run();
      }
      setShowHighlightColors(false);
    },
    [editor],
  );

  if (showLinkEditor && isEditorReady(editor)) {
    return (
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <LinkEditor
          editor={editor}
          initialUrl={currentLink}
          onSave={handleLinkSave}
          onCancel={handleLinkCancel}
        />
      </BubbleMenu>
    );
  }

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
      <div className="bubble-toolbar">
        {/* Text formatting */}
        <div className="bubble-toolbar-group">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`bubble-toolbar-button ${editor?.isActive('bold') ? 'is-active' : ''}`}
            title="Bold (⌘B)"
          >
            <Icons.bold />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`bubble-toolbar-button ${editor?.isActive('italic') ? 'is-active' : ''}`}
            title="Italic (⌘I)"
          >
            <Icons.italic />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`bubble-toolbar-button ${editor?.isActive('strike') ? 'is-active' : ''}`}
            title="Strikethrough"
          >
            <Icons.strike />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleCode().run()}
            className={`bubble-toolbar-button ${editor?.isActive('code') ? 'is-active' : ''}`}
            title="Inline Code"
          >
            <Icons.code />
          </button>
        </div>

        {/* Headings */}
        <div className="bubble-toolbar-group">
          <button
            type="button"
            onClick={() => toggleHeading(1)}
            className={`bubble-toolbar-button heading-button ${editor?.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => toggleHeading(2)}
            className={`bubble-toolbar-button heading-button ${editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => toggleHeading(3)}
            className={`bubble-toolbar-button heading-button ${editor?.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Link */}
        <div className="bubble-toolbar-group">
          <button
            type="button"
            onClick={handleLinkToggle}
            className={`bubble-toolbar-button ${isLinkActive ? 'is-active' : ''}`}
            title={isLinkActive ? 'Remove Link' : 'Add Link'}
          >
            {isLinkActive ? <Icons.unlink /> : <Icons.link />}
          </button>
        </div>

        {/* Highlight */}
        <div className="bubble-toolbar-group bubble-toolbar-dropdown">
          <button
            type="button"
            onClick={() => setShowHighlightColors(!showHighlightColors)}
            className={`bubble-toolbar-button ${editor?.isActive('highlight') ? 'is-active' : ''}`}
            title="Highlight"
          >
            <Icons.highlight />
          </button>

          {showHighlightColors && (
            <div className="bubble-highlight-colors">
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().unsetHighlight().run();
                  setShowHighlightColors(false);
                }}
                className="bubble-highlight-remove"
                title="Remove Highlight"
              >
                None
              </button>
              {highlightColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleHighlight(color.value)}
                  className={`bubble-highlight-color ${editor?.isActive('highlight', { color: color.value }) ? 'is-active' : ''}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Math (if available) */}
        {editor?.isEditable && (
          <div className="bubble-toolbar-group">
            <button
              type="button"
              onClick={() => {
                if (!editor) return;
                const { from, to } = editor.state.selection;
                const selectedText = editor.state.doc.textBetween(from, to);
                editor
                  .chain()
                  .focus()
                  .insertContent(`$${selectedText || 'x^2'}$`)
                  .run();
              }}
              className="bubble-toolbar-button"
              title="Inline Math"
            >
              <Icons.math />
            </button>
          </div>
        )}
      </div>
    </BubbleMenu>
  );
}

export default BubbleToolbar;
