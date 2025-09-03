import { Extension, type Editor as TiptapEditor } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import type React from 'react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';

// Icons as simple React components
const Icons = {
  heading: () => (
    <svg
      role="img"
      aria-label="Heading"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Heading</title>
      <path d="M6 12h12M6 12V6m0 6v6m12-6V6m0 6v6M9 6h6m-6 12h6" />
    </svg>
  ),
  math: () => (
    <svg
      role="img"
      aria-label="Math"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Math</title>
      <path d="M12 4v16m-4-4l4-4 4 4M8 4h8" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  ),
  code: () => (
    <svg
      role="img"
      aria-label="Code"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Code</title>
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  ),
  list: () => (
    <svg
      role="img"
      aria-label="Bullet list"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Bullet list</title>
      <circle cx="5" cy="7" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="17" r="1" fill="currentColor" />
      <line x1="10" y1="7" x2="20" y2="7" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="17" x2="20" y2="17" />
    </svg>
  ),
  orderedList: () => (
    <svg
      role="img"
      aria-label="Numbered list"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Numbered list</title>
      <text x="4" y="9" fontSize="8" fill="currentColor">
        1
      </text>
      <text x="4" y="14" fontSize="8" fill="currentColor">
        2
      </text>
      <text x="4" y="19" fontSize="8" fill="currentColor">
        3
      </text>
      <line x1="10" y1="7" x2="20" y2="7" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="17" x2="20" y2="17" />
    </svg>
  ),
  task: () => (
    <svg
      role="img"
      aria-label="Task list"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Task list</title>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 11l3 3L22 4" />
    </svg>
  ),
  quote: () => (
    <svg
      role="img"
      aria-label="Quote"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Quote</title>
      <path d="M6 6v6s2 0 4-3M14 6v6s2 0 4-3" />
    </svg>
  ),
  divider: () => (
    <svg
      role="img"
      aria-label="Divider"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Divider</title>
      <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="4 4" />
    </svg>
  ),
  image: () => (
    <svg
      role="img"
      aria-label="Image"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Image</title>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  table: () => (
    <svg
      role="img"
      aria-label="Table"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Table</title>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  callout: () => (
    <svg
      role="img"
      aria-label="Callout"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Callout</title>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16v-6m0-4h.01" />
    </svg>
  ),
};

type CommandCategory = 'Basic' | 'Lists' | 'Media' | 'Advanced' | 'Templates';

interface CommandItem {
  title: string;
  category: CommandCategory;
  icon: () => React.ReactElement;
  description: string;
  keywords: string[];
  command: (ctx: { editor: TiptapEditor }) => void;
}

interface SlashMenuProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
  query: string;
}

type SlashMenuRef = { onKeyDown: (args: { event: KeyboardEvent }) => boolean };
const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(({ items, command, query }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState<CommandItem[]>(items);

  // Filter items based on query
  useEffect(() => {
    if (!query) {
      setFilteredItems(items);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery) ||
          item.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery)),
      );
      setFilteredItems(filtered);
    }
    setSelectedIndex(0);
  }, [items, query]);

  // Group items by category
  const groupedItems = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<CommandCategory, CommandItem[]>,
  );

  const selectItem = useCallback(
    (index: number) => {
      const item = filteredItems[index];
      if (item) command(item);
    },
    [filteredItems, command],
  );

  const upHandler = useCallback(() => {
    setSelectedIndex((selectedIndex + filteredItems.length - 1) % filteredItems.length);
  }, [filteredItems.length, selectedIndex]);

  const downHandler = useCallback(() => {
    setSelectedIndex((selectedIndex + 1) % filteredItems.length);
  }, [filteredItems.length, selectedIndex]);

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex);
  }, [selectItem, selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  if (filteredItems.length === 0) {
    return (
      <div className="slash-menu-empty">
        <p>No commands found for "{query}"</p>
      </div>
    );
  }

  let globalIndex = 0;

  return (
    <div className="slash-menu" data-testid="slash-commands">
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category} className="slash-menu-category">
          <div className="slash-menu-category-label">{category}</div>
          {categoryItems.map((item) => {
            const currentIndex = globalIndex++;
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={`${category}-${item.title}`}
                className={`slash-menu-item ${currentIndex === selectedIndex ? 'is-selected' : ''}`}
                data-testid={`slash-command-${currentIndex}`}
                data-selected={currentIndex === selectedIndex}
                onClick={() => selectItem(currentIndex)}
                onMouseEnter={() => setSelectedIndex(currentIndex)}
              >
                <div className="slash-menu-item-icon">
                  <Icon />
                </div>
                <div className="slash-menu-item-content">
                  <div className="slash-menu-item-title">{item.title}</div>
                  <div className="slash-menu-item-description">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
});

SlashMenu.displayName = 'SlashMenu';

function getCommandItems({ editor: _editor }: { editor: TiptapEditor }): CommandItem[] {
  return [
    // Basic blocks
    {
      title: 'Heading 1',
      category: 'Basic',
      icon: Icons.heading,
      description: 'Large section heading',
      keywords: ['h1', 'title', 'header'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: 'Heading 2',
      category: 'Basic',
      icon: Icons.heading,
      description: 'Medium section heading',
      keywords: ['h2', 'subtitle', 'header'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: 'Heading 3',
      category: 'Basic',
      icon: Icons.heading,
      description: 'Small section heading',
      keywords: ['h3', 'subheading'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: 'Quote',
      category: 'Basic',
      icon: Icons.quote,
      description: 'Add a blockquote',
      keywords: ['blockquote', 'citation'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: 'Divider',
      category: 'Basic',
      icon: Icons.divider,
      description: 'Insert horizontal rule',
      keywords: ['hr', 'separator', 'line'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().setHorizontalRule().run(),
    },

    // Lists
    {
      title: 'Bullet List',
      category: 'Lists',
      icon: Icons.list,
      description: 'Create an unordered list',
      keywords: ['ul', 'unordered', 'bullets'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: 'Numbered List',
      category: 'Lists',
      icon: Icons.orderedList,
      description: 'Create an ordered list',
      keywords: ['ol', 'ordered', 'numbers'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: 'Task List',
      category: 'Lists',
      icon: Icons.task,
      description: 'Create a checklist',
      keywords: ['todo', 'checkbox', 'checklist'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleTaskList().run(),
    },

    // Media
    {
      title: 'Image',
      category: 'Media',
      icon: Icons.image,
      description: 'Insert an image',
      keywords: ['picture', 'photo', 'img'],
      command: ({ editor }: { editor: TiptapEditor }) => {
        const url = window.prompt('Enter image URL:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
      },
    },

    // Advanced
    {
      title: 'Math Block',
      category: 'Advanced',
      icon: Icons.math,
      description: 'Insert LaTeX math equation',
      keywords: ['latex', 'equation', 'formula'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'mathBlock',
            attrs: { tex: 'a^2 + b^2 = c^2' },
          })
          .run(),
    },
    {
      title: 'Code Block',
      category: 'Advanced',
      icon: Icons.code,
      description: 'Insert code with syntax highlighting',
      keywords: ['javascript', 'python', 'programming'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'codeBlockMonaco',
            attrs: {
              language: 'javascript',
              code: '// Type your code here\nconsole.log("Hello, World!");',
            },
          })
          .run(),
    },
    {
      title: 'Table',
      category: 'Advanced',
      icon: Icons.table,
      description: 'Insert a table',
      keywords: ['grid', 'spreadsheet', 'data'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: 'Callout',
      category: 'Advanced',
      icon: Icons.callout,
      description: 'Highlighted information box',
      keywords: ['info', 'warning', 'note', 'tip'],
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'callout',
            attrs: { type: 'info' },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Important information...' }],
              },
            ],
          })
          .run(),
    },

    // Templates
    {
      title: 'Daily Note',
      category: 'Templates',
      icon: Icons.heading,
      description: 'Start your daily journal entry',
      keywords: ['diary', 'journal', 'today'],
      command: ({ editor }: { editor: TiptapEditor }) => {
        const today = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: today }],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Morning Thoughts' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: "Today's Goals" }],
            },
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Gratitude' }],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
              ],
            },
          ])
          .run();
      },
    },
    {
      title: 'Meeting Notes',
      category: 'Templates',
      icon: Icons.list,
      description: 'Template for meeting documentation',
      keywords: ['agenda', 'minutes', 'discussion'],
      command: ({ editor }: { editor: TiptapEditor }) => {
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Meeting Notes' }],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Date: ' },
                {
                  type: 'text',
                  marks: [{ type: 'bold' }],
                  text: new Date().toLocaleDateString(),
                },
              ],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Attendees: ' }],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Agenda' }],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Discussion' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Action Items' }],
            },
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
              ],
            },
          ])
          .run();
      },
    },
    {
      title: 'Lab Log',
      category: 'Templates',
      icon: Icons.code,
      description: 'Template for research and experiment documentation',
      keywords: ['experiment', 'research', 'lab', 'science'],
      command: ({ editor }: { editor: TiptapEditor }) => {
        const today = new Date().toLocaleDateString();
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: `Lab Log - ${today}` }],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Objective' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Hypothesis' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Materials & Methods' }],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Observations' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Results & Analysis' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Conclusions' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Next Steps' }],
            },
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
              ],
            },
          ])
          .run();
      },
    },
    {
      title: 'Lecture Notes',
      category: 'Templates',
      icon: Icons.heading,
      description: 'Template for capturing class or presentation notes',
      keywords: ['class', 'course', 'presentation', 'learning', 'notes'],
      command: ({ editor }: { editor: TiptapEditor }) => {
        const today = new Date().toLocaleDateString();
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Lecture Notes' }],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Course: ' },
                { type: 'text', marks: [{ type: 'bold' }], text: '' },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Date: ' },
                { type: 'text', marks: [{ type: 'bold' }], text: today },
              ],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Instructor: ' }],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Key Topics' }],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Detailed Notes' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Questions' }],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Action Items' }],
            },
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Review material' }],
                    },
                  ],
                },
              ],
            },
          ])
          .run();
      },
    },
    {
      title: 'Gratitude',
      category: 'Templates',
      icon: Icons.quote,
      description: 'Template for daily gratitude practice',
      keywords: ['gratitude', 'thankful', 'positive', 'mindfulness'],
      command: ({ editor }: { editor: TiptapEditor }) => {
        const today = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: `Gratitude - ${today}` }],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: "Three Things I'm Grateful For" }],
            },
            {
              type: 'orderedList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Why Am I Grateful?' }],
            },
            { type: 'paragraph' },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'How Can I Share This Gratitude?' }],
            },
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '' }],
                    },
                  ],
                },
              ],
            },
          ])
          .run();
      },
    },
  ];
}

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        allowSpaces: true,
        items: getCommandItems,
        render: () => {
          let component: ReactRenderer | null = null;
          let popup: TippyInstance[] = [];

          return {
            onStart: (props: {
              editor: TiptapEditor;
              clientRect?: () => DOMRect | null;
              items: CommandItem[];
              query: string;
              command: (item: CommandItem) => void;
            }) => {
              component = new ReactRenderer(SlashMenu, {
                props,
                editor: props.editor,
              });

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                maxWidth: '400px',
              });
            },

            onUpdate: (props: {
              editor: TiptapEditor;
              clientRect?: () => DOMRect | null;
              items: CommandItem[];
              query: string;
              command: (item: CommandItem) => void;
            }) => {
              component?.updateProps(props);
              popup[0]?.setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (props.event.key === 'Escape') {
                popup[0]?.hide();
                return true;
              }
              return component?.ref?.onKeyDown(props) || false;
            },

            onExit: () => {
              popup[0]?.destroy();
              component?.destroy();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default SlashCommands;
