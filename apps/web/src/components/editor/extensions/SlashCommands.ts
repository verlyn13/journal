import { Extension, type Editor as TiptapEditor } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import tippy, { type Instance as TippyInstance } from 'tippy.js';

type Item = {
  title: string;
  emoji?: string;
  section?: 'Blocks' | 'Templates';
  command: (props: { editor: TiptapEditor }) => void;
};

function getItems({ query = '' }: { query?: string }): Item[] {
  const q = (query || '').toLowerCase();
  const items: Item[] = [
    // Basic Blocks
    {
      section: 'Blocks',
      title: 'Heading 1',
      emoji: 'H1',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      section: 'Blocks',
      title: 'Heading 2',
      emoji: 'H2',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      section: 'Blocks',
      title: 'Heading 3',
      emoji: 'H3',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      section: 'Blocks',
      title: 'Math block',
      emoji: '∑',
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
      section: 'Blocks',
      title: 'Code block',
      emoji: '</>',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'codeBlockMonaco',
            attrs: {
              language: 'javascript',
              code: "console.log('Hello, world!');",
            },
          })
          .run(),
    },
    {
      section: 'Blocks',
      title: 'Bullet list',
      emoji: '•',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleBulletList().run(),
    },
    {
      section: 'Blocks',
      title: 'Numbered list',
      emoji: '1.',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleOrderedList().run(),
    },
    {
      section: 'Blocks',
      title: 'Quote',
      emoji: '❝',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().toggleBlockquote().run(),
    },
    {
      section: 'Blocks',
      title: 'Divider',
      emoji: '―',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor.chain().focus().setHorizontalRule().run(),
    },

    // Rich Templates
    {
      section: 'Templates',
      title: 'Daily Reflection',
      emoji: '☀️',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent(`
<h2>🌅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>

<h3>🙏 What I'm Grateful For</h3>
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>

<h3>🎯 Top 3 Priorities Today</h3>
<ol>
  <li></li>
  <li></li>
  <li></li>
</ol>

<h3>💭 Notes</h3>
<p>What do I want to focus on today?</p>

<h3>🌙 Evening Reflection</h3>
<p>What went well today? What can I improve tomorrow?</p>
      `)
          .run(),
    },

    {
      section: 'Templates',
      title: 'Meeting Notes',
      emoji: '🤝',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent(`
<h2>📋 Meeting Notes</h2>

<p><strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
<strong>Attendees:</strong> <br>
<strong>Duration:</strong> </p>

<h3>🎯 Agenda</h3>
<ul>
  <li></li>
  <li></li>
</ul>

<h3>💬 Discussion Points</h3>
<ul>
  <li></li>
  <li></li>
</ul>

<h3>✅ Action Items</h3>
<ul>
  <li><strong>[Name]</strong> - </li>
  <li><strong>[Name]</strong> - </li>
</ul>

<h3>📅 Next Steps</h3>
<p></p>
      `)
          .run(),
    },

    {
      section: 'Templates',
      title: 'Lab Log',
      emoji: '🧪',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent(`
<h2>🔬 Lab Log - ${new Date().toLocaleDateString()}</h2>

<h3>🎯 Objective</h3>
<p></p>

<h3>📋 Materials & Methods</h3>
<ul>
  <li></li>
  <li></li>
</ul>

<h3>⚗️ Protocol</h3>
<ol>
  <li></li>
  <li></li>
  <li></li>
</ol>

<h3>📊 Observations</h3>
<p></p>

<h3>📈 Results</h3>
<p></p>

<h3>🤔 Analysis & Conclusions</h3>
<p></p>

<h3>📝 Next Steps</h3>
<p></p>
      `)
          .run(),
    },

    {
      section: 'Templates',
      title: 'Lecture Notes',
      emoji: '📚',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent(`
<h2>📖 Lecture Notes</h2>

<p><strong>Course:</strong> <br>
<strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
<strong>Topic:</strong> </p>

<h3>🔑 Key Concepts</h3>
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>

<h3>📝 Detailed Notes</h3>
<p></p>

<h3>💡 Important Formulas/Definitions</h3>
<blockquote>
  <p></p>
</blockquote>

<h3>❓ Questions for Review</h3>
<ul>
  <li></li>
  <li></li>
</ul>

<h3>📚 Additional Reading</h3>
<p></p>
      `)
          .run(),
    },

    {
      section: 'Templates',
      title: 'Project Planning',
      emoji: '📋',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent(`
<h2>🚀 Project Planning</h2>

<h3>📌 Project Overview</h3>
<p><strong>Project Name:</strong> <br>
<strong>Start Date:</strong> ${new Date().toLocaleDateString()}<br>
<strong>Deadline:</strong> <br>
<strong>Team Members:</strong> </p>

<h3>🎯 Goals & Objectives</h3>
<ul>
  <li></li>
  <li></li>
</ul>

<h3>📋 Key Milestones</h3>
<ul>
  <li>[ ] </li>
  <li>[ ] </li>
  <li>[ ] </li>
</ul>

<h3>⚠️ Risks & Mitigation</h3>
<ul>
  <li><strong>Risk:</strong>  → <strong>Mitigation:</strong> </li>
</ul>

<h3>📊 Success Metrics</h3>
<p></p>
      `)
          .run(),
    },

    {
      section: 'Templates',
      title: 'Book Review',
      emoji: '📖',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent(`
<h2>📚 Book Review</h2>

<p><strong>Title:</strong> <br>
<strong>Author:</strong> <br>
<strong>Date Read:</strong> ${new Date().toLocaleDateString()}<br>
<strong>Rating:</strong> ⭐⭐⭐⭐⭐</p>

<h3>📝 Summary</h3>
<p></p>

<h3>💡 Key Insights</h3>
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>

<h3>❤️ Favorite Quotes</h3>
<blockquote>
  <p></p>
</blockquote>

<h3>🤔 Personal Reflections</h3>
<p>How does this book relate to my life and goals?</p>

<h3>📊 Actionable Takeaways</h3>
<ul>
  <li>[ ] </li>
  <li>[ ] </li>
</ul>
      `)
          .run(),
    },

    {
      section: 'Templates',
      title: 'Gratitude Practice',
      emoji: '💗',
      command: ({ editor }: { editor: TiptapEditor }) =>
        editor
          .chain()
          .focus()
          .insertContent(`
<h2>🙏 Gratitude Practice - ${new Date().toLocaleDateString()}</h2>

<h3>✨ Three Things I'm Grateful For</h3>
<ol>
  <li><strong></strong> - </li>
  <li><strong></strong> - </li>
  <li><strong></strong> - </li>
</ol>

<h3>💫 Someone I Appreciate</h3>
<p><strong>Who:</strong> <br>
<strong>Why:</strong> </p>

<h3>🌱 A Challenge I'm Grateful For</h3>
<p>What difficult situation has taught me something valuable?</p>

<h3>🌍 Something Beautiful I Noticed Today</h3>
<p></p>
      `)
          .run(),
    },
  ];

  // Enhanced fuzzy filtering with weighted scoring
  const filtered = items.filter((item) => {
    if (!q) return true;
    const titleMatch = item.title.toLowerCase().includes(q);
    const sectionMatch = (item.section || '').toLowerCase().includes(q);
    return titleMatch || sectionMatch;
  });

  // Sort by relevance (exact matches first, then partial matches)
  return filtered.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const aExact = aTitle.startsWith(q);
    const bExact = bTitle.startsWith(q);
    if (aExact && !bExact) return -1;
    if (bExact && !aExact) return 1;
    return aTitle.localeCompare(bTitle);
  });
}

export const SlashCommands = Extension.create({
  name: 'slashCommands',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        allowSpaces: true,
        items: getItems,
        render: () => {
          let popup: TippyInstance[] = [];
          let container: HTMLDivElement | null = null;
          let selectedIndex = 0;

          const select = (props: { items: Item[]; command: (item: Item) => void }) => {
            const { items, command } = props;
            const item = items[selectedIndex];
            if (item) command(item);
          };

          return {
            onStart: (props: {
              items: Item[];
              clientRect?: () => DOMRect | null;
              command: (item: Item) => void;
            }) => {
              container = document.createElement('div');
              container.className = 'slash-menu';
              container.setAttribute('data-testid', 'slash-commands');
              updateList(container, props, selectedIndex);
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect
                  ? () => props.clientRect?.() || new DOMRect()
                  : () => new DOMRect(),
                appendTo: () => document.body,
                content: container,
                showOnCreate: true,
                interactive: true,
                placement: 'bottom-start',
              });
            },
            onUpdate: (props: {
              items: Item[];
              clientRect?: () => DOMRect | null;
              command: (item: Item) => void;
            }) => {
              if (!container) return;
              updateList(container, props, selectedIndex);
              popup[0]?.setProps({
                getReferenceClientRect: props.clientRect
                  ? () => props.clientRect?.() || new DOMRect()
                  : () => new DOMRect(),
              });
            },
            onKeyDown: (props: {
              items: Item[];
              event: KeyboardEvent;
              command?: (item: Item) => void;
            }) => {
              const { event, items } = props;
              if (event.key === 'Escape') {
                popup[0]?.hide();
                return true;
              }
              if (event.key === 'ArrowDown') {
                selectedIndex = (selectedIndex + 1) % items.length;
                if (container && props.command) {
                  updateList(container, { items, command: props.command }, selectedIndex);
                }
                return true;
              }
              if (event.key === 'ArrowUp') {
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                if (container && props.command) {
                  updateList(container, { items, command: props.command }, selectedIndex);
                }
                return true;
              }
              if (event.key === 'Enter') {
                if (props.command) {
                  select({ items, command: props.command });
                }
                return true;
              }
              return false;
            },
            onExit: () => {
              popup[0]?.destroy();
            },
          };
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },
});

function updateList(
  container: HTMLDivElement,
  props: { items: Item[]; command: (item: Item) => void },
  selectedIndex = 0,
) {
  const { items, command } = props;
  container.innerHTML = '';
  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.margin = '0';
  ul.style.padding = '6px';
  ul.style.background = 'rgba(30,30,30,0.95)';
  ul.style.borderRadius = '10px';
  ul.style.color = '#fff';
  let lastSection: string | undefined;
  // Track only actionable items (exclude section headers) for selection + testids
  const actionableItems: HTMLLIElement[] = [];
  let actionableIndex = 0;
  items.forEach((item: Item, _idx: number) => {
    if (item.section && item.section !== lastSection) {
      const header = document.createElement('li');
      header.textContent = item.section;
      header.style.opacity = '0.7';
      header.style.fontSize = '12px';
      header.style.padding = '6px 10px 4px';
      ul.appendChild(header);
      lastSection = item.section;
    }
    const li = document.createElement('li');
    li.style.padding = '8px 12px';
    li.style.cursor = 'pointer';
    li.style.borderRadius = '8px';
    li.style.display = 'flex';
    li.style.gap = '8px';
    li.style.alignItems = 'center';
    // Playwright-friendly test id for each actionable item
    li.setAttribute('data-testid', `slash-command-${actionableIndex}`);
    if (item.emoji) {
      const icon = document.createElement('span');
      icon.textContent = item.emoji;
      icon.style.opacity = '0.9';
      li.appendChild(icon);
    }
    const title = document.createElement('span');
    title.textContent = item.title;
    li.appendChild(title);
    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      command(item);
    });
    ul.appendChild(li);
    actionableItems.push(li);
    actionableIndex += 1;
  });
  // Highlight and mark selected item (by actionable index)
  actionableItems.forEach((el, i) => {
    if (i === selectedIndex) {
      el.style.background = 'rgba(255,255,255,0.08)';
      el.setAttribute('data-selected', 'true');
    } else {
      el.removeAttribute('data-selected');
    }
  });
  container.appendChild(ul);
}

export default SlashCommands;
