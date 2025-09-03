import type { CanCommands, ChainedCommands, Range, SingleCommands } from '@tiptap/core';
import { mergeAttributes, Node } from '@tiptap/core';
import type { EditorState } from '@tiptap/pm/state';
import * as KaTeX from 'katex';

export const MathInline = Node.create({
  name: 'mathInline',
  inline: true,
  group: 'inline',
  atom: true,
  addAttributes() {
    return { tex: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'span[data-math-inline]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-math-inline': 'true' }), 0];
  },
  addInputRules() {
    // $$...$$ inline
    return [
      {
        find: /\$\$([^$]+)\$\$/,
        handler: ({
          range,
          match,
          chain,
        }: {
          state: EditorState;
          range: Range;
          match: RegExpMatchArray;
          commands: SingleCommands;
          chain: () => ChainedCommands;
          can: () => CanCommands;
        }) => {
          if (!match) return;
          const tex = match[1] || '';
          chain()
            .focus()
            .deleteRange(range)
            .insertContent({ type: 'mathInline', attrs: { tex } })
            .run();
        },
      },
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const span = document.createElement('span');
      span.setAttribute('data-math-inline', 'true');
      try {
        KaTeX.render(node.attrs.tex || node.textContent || '', span, {
          throwOnError: false,
        });
      } catch {
        span.textContent = node.attrs.tex || node.textContent || '';
      }
      return { dom: span };
    };
  },
});

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  code: true,
  defining: true,
  addAttributes() {
    return { tex: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'div[data-math-block]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-math-block': 'true' }), 0];
  },
  addInputRules() {
    // $$$\n...\n$$$ to block (simple demo)
    return [
      {
        find: /\$\$\$([\s\S]+?)\$\$\$/,
        handler: ({
          range,
          match,
          chain,
        }: {
          state: EditorState;
          range: Range;
          match: RegExpMatchArray;
          commands: SingleCommands;
          chain: () => ChainedCommands;
          can: () => CanCommands;
        }) => {
          if (!match) return;
          const tex = match[1] || '';
          chain()
            .focus()
            .deleteRange(range)
            .insertContent({ type: 'mathBlock', attrs: { tex } })
            .run();
        },
      },
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const div = document.createElement('div');
      div.setAttribute('data-math-block', 'true');
      try {
        KaTeX.render(node.attrs.tex || node.textContent || '', div, {
          throwOnError: false,
          displayMode: true,
        });
      } catch {
        div.textContent = node.attrs.tex || node.textContent || '';
      }
      return { dom: div };
    };
  },
});

export default { MathInline, MathBlock };
