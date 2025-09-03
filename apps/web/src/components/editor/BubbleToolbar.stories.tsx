import type { Meta, StoryObj } from '@storybook/react';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { BubbleToolbar } from './BubbleToolbar';
import './BubbleToolbar.css';

const meta: Meta<typeof BubbleToolbar> = {
  title: 'Editor/BubbleToolbar',
  component: BubbleToolbar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A rich text formatting toolbar that appears when text is selected. Includes text formatting, headings, links, highlights, and inline math.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BubbleToolbar>;

// Wrapper component to provide editor context
function EditorWrapper({ children }: { children: React.ReactNode }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: `
      <h1>Welcome to the Enhanced Editor</h1>
      <p>This editor features a powerful bubble toolbar. <strong>Select any text</strong> to see the formatting options appear!</p>
      <p>Try selecting this text to see options for:</p>
      <ul>
        <li><strong>Bold</strong>, <em>italic</em>, and <s>strikethrough</s> formatting</li>
        <li><code>Inline code</code> styling</li>
        <li>Converting to different heading levels</li>
        <li>Creating <a href="#">links</a></li>
        <li><mark style="background-color: #FEF08A;">Highlighting text</mark> with different colors</li>
        <li>Adding inline math expressions</li>
      </ul>
      <h2>Interactive Features</h2>
      <p>The bubble toolbar includes:</p>
      <blockquote>
        <p>Smart link editing with automatic protocol detection and a dedicated input interface.</p>
      </blockquote>
      <p>Color-coded highlights for different types of content, and seamless math expression insertion.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-h-96 p-4 border rounded-lg',
      },
    },
  });

  return (
    <div style={{ width: '800px', maxWidth: '100vw' }}>
      <div
        style={{
          padding: '24px',
          background: 'var(--color-bg, #F5F3F0)',
          borderRadius: '12px',
          border: '1px solid var(--color-border, #DDE3EA)',
        }}
      >
        <EditorContent editor={editor} />
        {children}
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <EditorWrapper>
      <BubbleToolbar editor={null} />
    </EditorWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The default bubble toolbar with all formatting options. Select text in the editor to see it appear.',
      },
    },
  },
};

export const WithSelectedText: Story = {
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Link.configure({ openOnClick: false }),
        Highlight.configure({ multicolor: true }),
      ],
      content:
        '<p><strong>This text is pre-selected</strong> to show the bubble toolbar immediately.</p>',
      onUpdate: ({ editor }) => {
        // Auto-select text on load
        setTimeout(() => {
          editor.commands.selectAll();
        }, 100);
      },
    });

    return (
      <div style={{ width: '600px' }}>
        <EditorContent editor={editor} />
        <BubbleToolbar editor={editor} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the bubble toolbar with text pre-selected to demonstrate the interface.',
      },
    },
  },
};

export const LinkEditing: Story = {
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Link.configure({ openOnClick: false }),
        Highlight.configure({ multicolor: true }),
      ],
      content:
        '<p>Select this <a href="https://example.com">existing link</a> or this plain text to test link editing functionality.</p>',
    });

    return (
      <div style={{ width: '600px' }}>
        <EditorContent editor={editor} />
        <BubbleToolbar editor={editor} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the link editing functionality. Select the link to edit it, or select plain text to create a new link.',
      },
    },
  },
};

export const HighlightColors: Story = {
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Link.configure({ openOnClick: false }),
        Highlight.configure({ multicolor: true }),
      ],
      content: `
        <p>This editor supports multiple highlight colors:</p>
        <p>
          <mark style="background-color: #FEF08A;">Yellow highlight</mark>, 
          <mark style="background-color: #BBF7D0;">green highlight</mark>, 
          <mark style="background-color: #BFDBFE;">blue highlight</mark>, and more!
        </p>
        <p>Select any text and use the highlight button to choose from available colors.</p>
      `,
    });

    return (
      <div style={{ width: '700px' }}>
        <EditorContent editor={editor} />
        <BubbleToolbar editor={editor} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the highlight color picker functionality. Select text and click the highlight button to see color options.',
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => (
    <div
      style={{
        backgroundColor: '#2C303A',
        color: '#D4D6D9',
        padding: '24px',
        borderRadius: '12px',
        minHeight: '400px',
      }}
    >
      <EditorWrapper>
        <BubbleToolbar editor={null} />
      </EditorWrapper>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The bubble toolbar in dark mode, using the Dusk theme colors from the Sanctuary design system.',
      },
    },
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#2C303A' }],
    },
  },
};

export const Responsive: Story = {
  render: () => (
    <div style={{ width: '320px' }}>
      <EditorWrapper>
        <BubbleToolbar editor={null} />
      </EditorWrapper>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'The bubble toolbar adapts to smaller screens with adjusted spacing and button sizes.',
      },
    },
  },
};
