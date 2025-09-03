import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { editor as MonacoEditorNS } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import './CodeBlockMonaco.css';

// Language configurations
const LANGUAGE_OPTIONS = [
  {
    value: 'javascript',
    label: 'JavaScript',
    extensions: ['.js', '.mjs'],
    keywords: ['function', 'const', 'let', 'var', 'console.log', 'async', 'await'],
  },
  {
    value: 'typescript',
    label: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    keywords: ['interface', 'type', 'enum', 'namespace', 'declare'],
  },
  {
    value: 'python',
    label: 'Python',
    extensions: ['.py'],
    keywords: ['def', 'class', 'import', 'from', 'print', 'if __name__'],
  },
  {
    value: 'markdown',
    label: 'Markdown',
    extensions: ['.md'],
    keywords: ['#', '##', '```', '[', ']('],
  },
  {
    value: 'html',
    label: 'HTML',
    extensions: ['.html', '.htm'],
    keywords: ['<html>', '<div>', '<span>', 'class=', 'id='],
  },
  {
    value: 'css',
    label: 'CSS',
    extensions: ['.css'],
    keywords: ['{', '}', ':', ';', 'color:', 'background:', 'margin:', 'padding:'],
  },
  {
    value: 'json',
    label: 'JSON',
    extensions: ['.json'],
    keywords: ['{', '}', '[', ']', '":', ','],
  },
  {
    value: 'yaml',
    label: 'YAML',
    extensions: ['.yml', '.yaml'],
    keywords: ['---', ':', '-', 'version:', 'name:'],
  },
  {
    value: 'bash',
    label: 'Bash',
    extensions: ['.sh', '.bash'],
    keywords: ['#!/bin/bash', 'echo', 'cd', 'ls', 'chmod', 'export'],
  },
  {
    value: 'sql',
    label: 'SQL',
    extensions: ['.sql'],
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE'],
  },
  {
    value: 'rust',
    label: 'Rust',
    extensions: ['.rs'],
    keywords: ['fn', 'let', 'mut', 'pub', 'struct', 'enum', 'impl'],
  },
  {
    value: 'go',
    label: 'Go',
    extensions: ['.go'],
    keywords: ['package', 'func', 'var', 'const', 'type', 'import', 'fmt.Println'],
  },
  {
    value: 'java',
    label: 'Java',
    extensions: ['.java'],
    keywords: ['public class', 'private', 'public', 'static', 'void', 'System.out'],
  },
  {
    value: 'cpp',
    label: 'C++',
    extensions: ['.cpp', '.cc', '.cxx'],
    keywords: ['#include', 'std::', 'cout', 'cin', 'namespace', 'class'],
  },
  {
    value: 'plaintext',
    label: 'Plain Text',
    extensions: ['.txt'],
    keywords: [],
  },
];

// Language auto-detection function
const detectLanguage = (code: string): string => {
  if (!code.trim()) return 'javascript';

  const _codeLines = code.toLowerCase().split('\n');
  const fullCode = code.toLowerCase();

  // Check for specific patterns
  for (const lang of LANGUAGE_OPTIONS) {
    if (lang.value === 'plaintext') continue; // Skip plaintext in detection

    let score = 0;
    const keywordCount = lang.keywords?.length || 0;

    lang.keywords?.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase();
      if (fullCode.includes(keywordLower)) {
        // Give more weight to unique keywords
        if (
          keywordLower.includes('def ') ||
          keywordLower.includes('class ') ||
          keywordLower.includes('import ')
        ) {
          score += 3;
        } else {
          score += 1;
        }
      }
    });

    // Calculate confidence based on keyword matches
    const confidence = keywordCount > 0 ? score / keywordCount : 0;

    // Strong indicators for specific languages
    if (confidence > 0.3) {
      return lang.value;
    }
  }

  // Fallback patterns
  if (
    fullCode.includes('function') ||
    fullCode.includes('const ') ||
    fullCode.includes('console.')
  ) {
    return 'javascript';
  }
  if (fullCode.includes('def ') || fullCode.includes('import ') || fullCode.includes('print(')) {
    return 'python';
  }
  if (fullCode.includes('<html>') || fullCode.includes('<div>') || fullCode.includes('</')) {
    return 'html';
  }
  if (fullCode.includes('select ') || fullCode.includes('from ') || fullCode.includes('where ')) {
    return 'sql';
  }

  return 'javascript'; // Default fallback
};

// Icons
const Icons = {
  copy: () => (
    <svg
      role="img"
      aria-label="Copy"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Copy</title>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  check: () => (
    <svg
      role="img"
      aria-label="Copied"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Copied</title>
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  expand: () => (
    <svg
      role="img"
      aria-label="Expand"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Expand</title>
      <polyline points="15,3 21,3 21,9" />
      <polyline points="9,21 3,21 3,15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
  language: () => (
    <svg
      role="img"
      aria-label="Language"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Language</title>
      <path d="M12 2l3.09 6.26L22 9l-5.09 3.09L14 22l-2-8.09L3 15l7-4.09L12 2z" />
    </svg>
  ),
  autoDetect: () => (
    <svg
      role="img"
      aria-label="Auto detect"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Auto detect</title>
      <path d="M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9z" />
      <path d="M20 3v4h-4" />
    </svg>
  ),
};

type EditorLike = {
  getValue: () => string;
  setValue: (v: string) => void;
  getModel: () => unknown;
  dispose?: () => void;
  onDidChangeModelContent?: (fn: () => void) => void;
};

interface MonacoViewProps {
  node: { attrs: { language?: string; code?: string }; textContent?: string };
  updateAttributes: (attrs: { code?: string; language?: string }) => void;
  editor: import('@tiptap/core').Editor;
}

function MonacoView({ node, updateAttributes }: MonacoViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<EditorLike | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  const language = node.attrs.language || 'javascript';
  const code = node.attrs.code || node.textContent || '';

  // Provide expanded language options once Monaco loads (fallback to seed list)
  const [languageOptions, setLanguageOptions] = useState<{ value: string; label: string }[]>(
    LANGUAGE_OPTIONS.map((l) => ({ value: l.value, label: l.label })),
  );

  // Theme configuration for Monaco based on Sanctuary theme
  const getMonacoTheme = useCallback(() => {
    if (isDarkMode) {
      return {
        base: 'vs-dark' as const,
        inherit: true,
        rules: [
          { token: 'comment', foreground: 'A8B5C5', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'D4AF8B' },
          { token: 'string', foreground: '8BC34A' },
          { token: 'number', foreground: 'FFB74D' },
          { token: 'type', foreground: '81C784' },
          { token: 'function', foreground: '64B5F6' },
        ],
        colors: {
          'editor.background': '#2C303A',
          'editor.foreground': '#D4D6D9',
          'editor.lineHighlightBackground': '#383D4A20',
          'editor.selectionBackground': '#D4AF8B40',
          'editorLineNumber.foreground': '#505668',
          'editorLineNumber.activeForeground': '#D4AF8B',
        },
      };
    } else {
      return {
        base: 'vs' as const,
        inherit: true,
        rules: [
          { token: 'comment', foreground: 'A8B5C5', fontStyle: 'italic' },
          { token: 'keyword', foreground: '1976D2' },
          { token: 'string', foreground: '388E3C' },
          { token: 'number', foreground: 'F57C00' },
          { token: 'type', foreground: '7B1FA2' },
          { token: 'function', foreground: '1565C0' },
        ],
        colors: {
          'editor.background': '#F5F3F0',
          'editor.foreground': '#41454c',
          'editor.lineHighlightBackground': '#EAE8E320',
          'editor.selectionBackground': '#A8B5C540',
          'editorLineNumber.foreground': '#A8B5C5',
          'editorLineNumber.activeForeground': '#41454c',
        },
      };
    }
  }, [isDarkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let monacoEditor: EditorLike | null = null;
    (async () => {
      try {
        const monaco = await import('monaco-editor');
        if (!containerRef.current) return;

        // Define custom theme
        const customTheme = getMonacoTheme();
        monaco.editor.defineTheme('sanctuary', customTheme);

        // Expand language options using Monaco's registered languages
        try {
          const dyn = (monaco.languages.getLanguages?.() || []).map(
            (l: { id: string; aliases?: string[] }) => ({
              value: String(l.id),
              label: l.aliases?.[0] || String(l.id).charAt(0).toUpperCase() + String(l.id).slice(1),
            }),
          );
          const merged = [
            ...LANGUAGE_OPTIONS.map((l) => ({
              value: l.value,
              label: l.label,
            })),
            ...dyn,
          ];
          const seen = new Set<string>();
          const unique = merged.filter((opt) => {
            if (seen.has(opt.value)) return false;
            seen.add(opt.value);
            return true;
          });
          unique.sort((a, b) => a.label.localeCompare(b.label));
          setLanguageOptions(unique);
        } catch {}

        monacoEditor = monaco.editor.create(containerRef.current, {
          value: code,
          language: language,
          theme: 'sanctuary',
          automaticLayout: true,
          minimap: { enabled: false },
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
          padding: { top: 12, bottom: 12 },
          roundedSelection: false,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalSliderSize: 8,
            horizontalSliderSize: 8,
          },
        });

        monacoRef.current = monacoEditor;

        // Handle content changes and persist to node
        let debounceTimeout: NodeJS.Timeout;
        monacoEditor?.onDidChangeModelContent?.(() => {
          const value = monacoEditor?.getValue() || '';
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            updateAttributes({ code: value });
          }, 300);
        });

        setReady(true);
      } catch (_error) {}
    })();

    return () => {
      try {
        monacoEditor?.dispose?.();
      } catch (_error) {}
    };
  }, [language, getMonacoTheme, code, updateAttributes]);

  // Update Monaco content when node content changes externally
  useEffect(() => {
    if (monacoRef.current && code !== monacoRef.current.getValue()) {
      monacoRef.current.setValue(code);
    }
  }, [code]);

  // Update Monaco theme when dark mode changes
  useEffect(() => {
    if (monacoRef.current) {
      const monaco = require('monaco-editor');
      const customTheme = getMonacoTheme();
      monaco.editor.defineTheme('sanctuary', customTheme);
      monaco.editor.setTheme('sanctuary');
    }
  }, [getMonacoTheme]);

  const handleCopy = useCallback(async () => {
    try {
      const textToCopy = monacoRef.current?.getValue() || code;
      if (!textToCopy.trim()) return;

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      // Fallback for older browsers
      try {
        const textToCopy = monacoRef.current?.getValue() || code;
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (_fallbackError) {}
    }
  }, [code]);

  const handleLanguageChange = useCallback(
    (newLanguage: string) => {
      updateAttributes({ language: newLanguage });
      if (monacoRef.current) {
        const monaco = require('monaco-editor');
        monaco.editor.setModelLanguage(
          monacoRef.current.getModel() as MonacoEditorNS.ITextModel,
          newLanguage,
        );
      }
    },
    [updateAttributes],
  );

  const handleAutoDetect = useCallback(() => {
    const currentCode = monacoRef.current?.getValue() || code;
    if (!currentCode.trim()) return;

    const detectedLanguage = detectLanguage(currentCode);
    if (detectedLanguage !== language) {
      handleLanguageChange(detectedLanguage);
    }
  }, [code, language, handleLanguageChange]);

  return (
    <div className={`monaco-code-block ${isExpanded ? 'expanded' : ''}`}>
      <div className="monaco-header">
        <div className="monaco-language-selector">
          <Icons.language />
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="monaco-language-select"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAutoDetect}
            className="monaco-auto-detect-button"
            title="Auto-detect language"
            disabled={!ready || !code.trim()}
          >
            <Icons.autoDetect />
          </button>
        </div>

        <div className="monaco-actions">
          <span className="monaco-status">
            {ready ? `${code.split('\n').length} lines` : 'Loading...'}
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="monaco-action-button"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <Icons.expand />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`monaco-action-button ${copied ? 'copied' : ''}`}
            title="Copy code"
            disabled={!ready}
          >
            {copied ? <Icons.check /> : <Icons.copy />}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="monaco-editor-container"
        style={{
          height: isExpanded ? '400px' : '220px',
          transition: 'height 0.2s ease',
        }}
      />

      {!ready && (
        <div className="monaco-loading">
          <div className="monaco-loading-spinner" />
          <span>Loading Monaco editor...</span>
        </div>
      )}
    </div>
  );
}

export const CodeBlockMonaco = Node.create({
  name: 'codeBlockMonaco',
  group: 'block',
  content: 'text*',
  code: true,
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      language: {
        default: 'javascript',
        parseHTML: (element) => element.getAttribute('data-language'),
        renderHTML: (attributes) => ({ 'data-language': attributes.language }),
      },
      code: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-code') || element.textContent,
        renderHTML: (attributes) => ({ 'data-code': attributes.code }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-code-block-monaco]',
        getAttrs: (element) => {
          if (typeof element === 'string') return null;
          return {
            language: element.getAttribute('data-language') || 'javascript',
            code: element.getAttribute('data-code') || element.textContent || '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-code-block-monaco': 'true',
        'data-language': node.attrs.language,
        'data-code': node.attrs.code,
      }),
      ['code', {}, node.attrs.code || '// Start coding...'],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => (
      <MonacoView
        node={props.node}
        updateAttributes={(attrs: { code?: string; language?: string }) => {
          props.updateAttributes(attrs);
          // Ensure the node's text content is synchronized for proper serialization
          if (attrs.code !== undefined) {
            const pos = props.getPos();
            props.editor
              .chain()
              .command(({ tr, dispatch }) => {
                if (dispatch && pos !== undefined) {
                  // Update node attributes
                  tr.setNodeMarkup(pos, undefined, {
                    ...props.node.attrs,
                    ...attrs,
                  });

                  // Synchronize text content with code attribute
                  const node = tr.doc.nodeAt(pos);
                  if (node) {
                    tr.replaceWith(
                      pos + 1,
                      pos + 1 + node.content.size,
                      props.editor.schema.text(attrs.code || ''),
                    );
                  }
                }
                return true;
              })
              .run();
          }
        }}
        editor={props.editor}
      />
    ));
  },

  // Ensure proper serialization
  addStorage() {
    return {
      markdown: {
        serialize: (state: unknown, node: unknown) => {
          const s = state as {
            write: (t: string) => void;
            text: (t: string, esc: boolean) => void;
          };
          const n = node as { attrs: { language?: string; code?: string } };
          const language = n.attrs.language || 'javascript';
          const code = n.attrs.code || '';
          s.write(`\`\`\`${language}\n`);
          s.text(code, false);
          s.write('\n```');
          if ('closeBlock' in s && typeof s.closeBlock === 'function') {
            s.closeBlock(n);
          }
        },
        parse: {
          // This will be handled by the markdown parser
        },
      },
    };
  },
});

export default CodeBlockMonaco;
