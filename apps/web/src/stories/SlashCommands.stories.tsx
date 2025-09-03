import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SlashCommands } from '../components/editor/extensions/SlashCommands';

export default {
  title: 'Journal/SlashCommands',
  parameters: {
    layout: 'fullscreen',
  },
};

const SlashCommandsDemo = () => {
  const editor = useEditor({
    extensions: [StarterKit, SlashCommands],
    content: `
      <h2>Slash Commands Demo</h2>
      <p>Type <strong>/</strong> to open the slash command menu and explore all available templates and commands.</p>
      <p>Try these examples:</p>
      <ul>
        <li><code>/daily</code> - Daily Reflection template</li>
        <li><code>/meeting</code> - Meeting Notes template</li>
        <li><code>/lab</code> - Lab Log template</li>
        <li><code>/code</code> - Code block</li>
        <li><code>/h1</code> - Heading 1</li>
      </ul>
      <p>Start typing below:</p>
      <p></p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sanctuary max-w-none focus:outline-none',
      },
    },
  });

  const categories = [
    {
      name: 'Templates',
      commands: [
        {
          title: 'Daily Reflection',
          emoji: '☀️',
          description: 'Structured daily reflection with gratitude, priorities, and insights',
        },
        {
          title: 'Meeting Notes',
          emoji: '📝',
          description: 'Professional meeting template with attendees, agenda, and action items',
        },
        {
          title: 'Lab Log',
          emoji: '🧪',
          description: 'Scientific experiment log with hypothesis, procedure, and results',
        },
        {
          title: 'Project Plan',
          emoji: '📋',
          description: 'Comprehensive project planning template with timeline and milestones',
        },
        {
          title: 'Quick Note',
          emoji: '💭',
          description: 'Simple note template for capturing quick thoughts',
        },
        {
          title: 'Reading Notes',
          emoji: '📚',
          description: 'Book or article notes with key takeaways and quotes',
        },
        {
          title: 'Recipe',
          emoji: '👨‍🍳',
          description: 'Recipe template with ingredients, instructions, and notes',
        },
        {
          title: 'Travel Log',
          emoji: '✈️',
          description: 'Travel journal entry with location, activities, and memories',
        },
        {
          title: 'Workout',
          emoji: '💪',
          description: 'Fitness log with exercises, sets, reps, and progress notes',
        },
      ],
    },
    {
      name: 'Formatting',
      commands: [
        {
          title: 'Heading 1',
          emoji: '📰',
          description: 'Large heading for main sections',
        },
        {
          title: 'Heading 2',
          emoji: '📄',
          description: 'Medium heading for subsections',
        },
        {
          title: 'Heading 3',
          emoji: '📃',
          description: 'Small heading for sub-subsections',
        },
        {
          title: 'Bullet List',
          emoji: '•',
          description: 'Unordered list with bullet points',
        },
        {
          title: 'Numbered List',
          emoji: '1.',
          description: 'Ordered list with numbers',
        },
        {
          title: 'Task List',
          emoji: '☑️',
          description: 'Checklist with checkboxes',
        },
        {
          title: 'Quote',
          emoji: '💬',
          description: 'Blockquote for emphasis or citations',
        },
        {
          title: 'Divider',
          emoji: '➖',
          description: 'Horizontal line to separate content',
        },
        {
          title: 'Code Block',
          emoji: '💻',
          description: 'Syntax-highlighted code with language detection',
        },
      ],
    },
    {
      name: 'Media',
      commands: [
        {
          title: 'Table',
          emoji: '📊',
          description: '3x3 table for structured data',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-sanctuary-bg-primary text-sanctuary-text-primary">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-bold">Slash Commands</h1>
          <p className="text-lg text-sanctuary-text-secondary max-w-2xl mx-auto">
            Powerful slash commands with rich templates and smart filtering for efficient journaling
          </p>
        </div>

        {/* Live Editor Demo */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-4">Interactive Demo</h2>
          <div className="bg-sanctuary-bg-secondary rounded-xl p-6 border border-sanctuary-border">
            <div className="prose prose-sanctuary max-w-none">
              <EditorContent editor={editor} />
            </div>
          </div>
          <p className="text-sm text-sanctuary-text-secondary mt-2">
            Click in the editor above and type <code>/</code> to see the slash command menu
          </p>
        </section>

        {/* Command Reference */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Available Commands</h2>
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.name}>
                <h3 className="text-xl font-serif font-semibold mb-4 text-sanctuary-accent">
                  {category.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.commands.map((command) => (
                    <div
                      key={command.title}
                      className="p-4 bg-sanctuary-bg-secondary rounded-lg border border-sanctuary-border hover:border-sanctuary-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{command.emoji}</span>
                        <span className="font-medium text-sanctuary-text-primary">
                          {command.title}
                        </span>
                      </div>
                      <p className="text-sm text-sanctuary-text-secondary">{command.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-sanctuary-bg-secondary rounded-xl p-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-sanctuary-accent">Smart Filtering</h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>• Fuzzy matching with weighted scoring</li>
                <li>• Search by title, emoji, or keywords</li>
                <li>• Category-based organization</li>
                <li>• Instant results as you type</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-sanctuary-accent">Rich Templates</h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>• Pre-structured content for common use cases</li>
                <li>• Dynamic date insertion</li>
                <li>• Professional formatting</li>
                <li>• Customizable placeholders</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-sanctuary-accent">
                Keyboard Navigation
              </h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>• Arrow keys to navigate options</li>
                <li>• Enter to select command</li>
                <li>• Escape to close menu</li>
                <li>• Tab for quick selection</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-sanctuary-accent">
                Context Awareness
              </h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>• Adapts to current cursor position</li>
                <li>• Respects existing formatting</li>
                <li>• Smart content insertion</li>
                <li>• Maintains editor state</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Template Examples</h2>
          <div className="space-y-6">
            <div className="bg-sanctuary-bg-secondary rounded-lg border border-sanctuary-border overflow-hidden">
              <div className="px-4 py-3 bg-sanctuary-bg-tertiary border-b border-sanctuary-border">
                <div className="flex items-center gap-2">
                  <span className="text-lg">☀️</span>
                  <span className="font-medium">Daily Reflection Template</span>
                </div>
              </div>
              <div className="p-4">
                <pre className="text-sm text-sanctuary-text-secondary whitespace-pre-wrap">
                  {`🌅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}

## 🙏 What I'm Grateful For
• 
• 
• 

## 🎯 Top 3 Priorities Today
1. 
2. 
3. 

## 💭 Key Insights & Reflections


## 📝 Notes & Ideas


---
*"Every day is a new beginning. Take a deep breath and start again."*`}
                </pre>
              </div>
            </div>

            <div className="bg-sanctuary-bg-secondary rounded-lg border border-sanctuary-border overflow-hidden">
              <div className="px-4 py-3 bg-sanctuary-bg-tertiary border-b border-sanctuary-border">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <span className="font-medium">Meeting Notes Template</span>
                </div>
              </div>
              <div className="p-4">
                <pre className="text-sm text-sanctuary-text-secondary whitespace-pre-wrap">
                  {`# Meeting: [Topic]
**Date:** ${new Date().toLocaleDateString()}  
**Time:** [Start Time] - [End Time]

## 👥 Attendees
• 
• 
• 

## 📋 Agenda
1. 
2. 
3. 

## 📝 Discussion Notes


## ✅ Action Items
- [ ] [Action Item] - Assigned to [Person] - Due: [Date]
- [ ] [Action Item] - Assigned to [Person] - Due: [Date]

## 📅 Next Meeting
**Date:** [Date]  
**Focus:** [Topic]`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export const SlashCommandsShowcase = SlashCommandsDemo;
