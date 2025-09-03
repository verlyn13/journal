import type { Meta, StoryObj } from '@storybook/react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SlashCommands } from './extensions/SlashCommands';
import './extensions/SlashCommands.css';

const meta: Meta = {
  title: 'Editor/SlashCommands',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive slash command menu for quickly inserting blocks, formatting, and templates. Type "/" in the editor to open the menu.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Wrapper component to provide editor context
function EditorWrapper({
  content,
  placeholder = "Type '/' to open the slash command menu...",
}: {
  content?: string;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable default code block to favor our Monaco version
        codeBlock: false,
      }),
      SlashCommands,
    ],
    content:
      content ||
      `
      <h1>Slash Commands Demo</h1>
      <p>Type <strong>/</strong> anywhere in this editor to open the command menu.</p>
      <p>Available commands include:</p>
      <ul>
        <li><strong>Basic blocks:</strong> Headings, quotes, dividers</li>
        <li><strong>Lists:</strong> Bullet lists, numbered lists, task lists</li>
        <li><strong>Advanced:</strong> Math blocks, code blocks, tables</li>
        <li><strong>Templates:</strong> Daily notes, meeting notes</li>
      </ul>
      <p>${placeholder}</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-h-96 p-6 border rounded-lg',
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
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <EditorWrapper />,
  parameters: {
    docs: {
      description: {
        story:
          'The default slash command interface. Type "/" in the editor to see all available commands organized by category.',
      },
    },
  },
};

export const EmptyEditor: Story = {
  render: () => <EditorWrapper content="" placeholder="Start typing or use '/' for commands..." />,
  parameters: {
    docs: {
      description: {
        story: 'An empty editor where you can immediately start typing "/" to access commands.',
      },
    },
  },
};

export const WithFiltering: Story = {
  render: () => (
    <EditorWrapper
      content="<p>The slash menu supports intelligent filtering. Try typing '/head' or '/list' or '/code' to see filtered results.</p><p></p>"
      placeholder="Try typing '/head' to filter heading commands..."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the filtering capability. Commands are filtered by title, description, and keywords as you type.',
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  render: () => (
    <EditorWrapper
      content="<p>The slash menu supports full keyboard navigation:</p><ul><li><strong>Arrow keys:</strong> Navigate up/down</li><li><strong>Enter:</strong> Execute command</li><li><strong>Escape:</strong> Close menu</li></ul><p></p>"
      placeholder="Type '/' and use arrow keys to navigate..."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows keyboard navigation support. Use arrow keys to navigate and Enter to select commands.',
      },
    },
  },
};

export const Categories: Story = {
  render: () => (
    <EditorWrapper
      content={`
        <h2>Command Categories</h2>
        <p>Commands are organized into logical categories:</p>
        <ul>
          <li><strong>Basic:</strong> Headings, quotes, dividers</li>
          <li><strong>Lists:</strong> Bullet, numbered, and task lists</li>
          <li><strong>Media:</strong> Images and embeds</li>
          <li><strong>Advanced:</strong> Math, code, tables, callouts</li>
          <li><strong>Templates:</strong> Pre-formatted content</li>
        </ul>
        <p></p>
      `}
      placeholder="Type '/' to see all categories..."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the categorized organization of commands for better discoverability.',
      },
    },
  },
};

export const Templates: Story = {
  render: () => (
    <EditorWrapper
      content="<p>Try the template commands to quickly insert structured content:</p><p></p>"
      placeholder="Type '/daily' or '/meeting' to try templates..."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows template functionality. Templates insert pre-structured content like daily notes and meeting templates.',
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
        minHeight: '500px',
      }}
    >
      <EditorWrapper />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The slash command menu in dark mode, using the Dusk theme from the Sanctuary design system.',
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
      <EditorWrapper placeholder="Type '/' for mobile-optimized commands..." />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'The slash menu adapts to mobile screens with adjusted sizing and touch-friendly interactions.',
      },
    },
  },
};

export const Icons: Story = {
  render: () => (
    <EditorWrapper
      content={`
        <h2>Command Icons</h2>
        <p>Each command has a distinctive icon for quick recognition:</p>
        <ul>
          <li>Headings use H1/H2/H3 icons</li>
          <li>Lists show bullet or numbered indicators</li>
          <li>Code blocks have coding symbols</li>
          <li>Math commands show mathematical notation</li>
        </ul>
        <p></p>
      `}
      placeholder="Type '/' to see all command icons..."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Showcases the icon system used in the slash menu for better visual recognition of commands.',
      },
    },
  },
};
