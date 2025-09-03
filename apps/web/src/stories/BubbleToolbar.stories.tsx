import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BubbleToolbar from '../components/editor/BubbleToolbar';

export default {
  title: 'Journal/BubbleToolbar',
  parameters: {
    layout: 'fullscreen',
  },
};

const BubbleToolbarDemo = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-sanctuary-accent hover:text-sanctuary-accent-hover underline cursor-pointer',
        },
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'rounded-sm px-1',
        },
      }),
    ],
    content: `
      <h2>Bubble Toolbar Demo</h2>
      <p>The bubble toolbar appears when you <strong>select text</strong> in the editor. Try selecting different parts of this content to see the toolbar in action.</p>
      
      <h3>Text Formatting Features</h3>
      <p>Select text to access <strong>bold</strong>, <em>italic</em>, <code>code</code>, and <s>strikethrough</s> formatting options.</p>
      
      <h3>Heading Controls</h3>
      <p>Select text and use heading buttons (H1, H2, H3) to convert paragraphs into headings of different sizes.</p>
      
      <h3>Link Management</h3>
      <p>Select text and click the link button to create links. The enhanced link editor includes:</p>
      <ul>
        <li>URL validation with real-time feedback</li>
        <li>Link preview showing the formatted URL</li>
        <li>Error messages for invalid URLs</li>
        <li>Support for various URL formats (http, https, mailto)</li>
      </ul>
      <p>Try creating a link to <a href="https://example.com">https://example.com</a> or editing this existing link.</p>
      
      <h3>Highlight Colors</h3>
      <p>Select text and use the highlight button to access color options:</p>
      <p><mark style="background-color: #fef08a">Yellow highlight</mark> for important information</p>
      <p><mark style="background-color: #fed7d7">Red highlight</mark> for urgent items</p>
      <p><mark style="background-color: #c6f6d5">Green highlight</mark> for completed tasks</p>
      <p><mark style="background-color: #bee3f8">Blue highlight</mark> for ideas</p>
      <p><mark style="background-color: #e9d8fd">Purple highlight</mark> for creative thoughts</p>
      
      <h3>List Formatting</h3>
      <p>Select text or place cursor and use list buttons:</p>
      <ul>
        <li>Bullet list item 1</li>
        <li>Bullet list item 2</li>
        <li>Bullet list item 3</li>
      </ul>
      <ol>
        <li>Numbered list item 1</li>
        <li>Numbered list item 2</li>
        <li>Numbered list item 3</li>
      </ol>
      
      <blockquote>
        <p>Select text in this quote to see all formatting options available in the bubble toolbar.</p>
      </blockquote>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sanctuary max-w-none focus:outline-none min-h-[400px]',
      },
    },
  });

  const features = [
    {
      title: 'Smart Text Selection',
      description: 'Toolbar appears automatically when text is selected',
      icon: '🎯',
    },
    {
      title: 'URL Validation',
      description: 'Real-time validation with visual feedback for links',
      icon: '🔗',
    },
    {
      title: 'Link Preview',
      description: 'Shows formatted URL before saving the link',
      icon: '👀',
    },
    {
      title: 'Error Handling',
      description: 'Clear error messages for invalid URLs or empty fields',
      icon: '⚠️',
    },
    {
      title: 'Multiple Highlights',
      description: '5 color options for different types of highlighting',
      icon: '🌈',
    },
    {
      title: 'Keyboard Shortcuts',
      description: 'Standard shortcuts work alongside visual controls',
      icon: '⌨️',
    },
  ];

  const colorExamples = [
    { name: 'Yellow', color: '#fef08a', description: 'General highlighting' },
    { name: 'Red', color: '#fed7d7', description: 'Important or urgent' },
    { name: 'Green', color: '#c6f6d5', description: 'Completed or positive' },
    { name: 'Blue', color: '#bee3f8', description: 'Ideas or notes' },
    { name: 'Purple', color: '#e9d8fd', description: 'Creative or special' },
  ];

  return (
    <div className="min-h-screen bg-sanctuary-bg-primary text-sanctuary-text-primary">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-bold">Bubble Toolbar</h1>
          <p className="text-lg text-sanctuary-text-secondary max-w-2xl mx-auto">
            Context-aware formatting toolbar with enhanced link management and highlight colors
          </p>
        </div>

        {/* Live Editor Demo */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-4">Interactive Demo</h2>
          <div className="bg-sanctuary-bg-secondary rounded-xl p-6 border border-sanctuary-border relative">
            <BubbleToolbar editor={editor} />
            <div className="prose prose-sanctuary max-w-none">
              <EditorContent editor={editor} />
            </div>
          </div>
          <p className="text-sm text-sanctuary-text-secondary mt-2">
            Select any text above to see the bubble toolbar appear with formatting options
          </p>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-4 bg-sanctuary-bg-secondary rounded-lg border border-sanctuary-border"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="font-medium text-sanctuary-text-primary">{feature.title}</span>
                </div>
                <p className="text-sm text-sanctuary-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Highlight Colors Reference */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Highlight Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {colorExamples.map((color) => (
              <div
                key={color.name}
                className="p-4 bg-sanctuary-bg-secondary rounded-lg border border-sanctuary-border text-center"
              >
                <div
                  className="w-12 h-12 rounded-lg mx-auto mb-3 border border-sanctuary-border"
                  style={{ backgroundColor: color.color }}
                />
                <div className="font-medium text-sanctuary-text-primary mb-1">{color.name}</div>
                <div className="text-xs text-sanctuary-text-secondary">{color.description}</div>
                <div className="text-xs font-mono text-sanctuary-text-secondary mt-1">
                  {color.color}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Toolbar Actions Reference */}
        <section className="bg-sanctuary-bg-secondary rounded-xl p-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Toolbar Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-sanctuary-accent">Text Formatting</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Bold</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">Cmd+B</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Italic</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">Cmd+I</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Code</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">Cmd+E</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Strikethrough</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">
                    Cmd+Shift+S
                  </kbd>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-sanctuary-accent">Structure</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Heading 1</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">Cmd+Alt+1</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Heading 2</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">Cmd+Alt+2</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Heading 3</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">Cmd+Alt+3</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sanctuary-text-secondary">Bullet List</span>
                  <kbd className="px-2 py-1 bg-sanctuary-bg-primary rounded text-xs">
                    Cmd+Shift+8
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Link Editor Features */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Enhanced Link Editor</h2>
          <div className="bg-sanctuary-bg-secondary rounded-lg p-6 border border-sanctuary-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-sanctuary-accent">URL Validation</h3>
                <ul className="space-y-2 text-sm text-sanctuary-text-secondary">
                  <li>✓ Automatic protocol detection (http/https)</li>
                  <li>✓ Domain validation with TLD checking</li>
                  <li>✓ Email link support (mailto:)</li>
                  <li>✓ Real-time validation feedback</li>
                  <li>✓ Clear error messages for invalid URLs</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sanctuary-accent">User Experience</h3>
                <ul className="space-y-2 text-sm text-sanctuary-text-secondary">
                  <li>✓ Live URL preview as you type</li>
                  <li>✓ Visual validation states (valid/invalid)</li>
                  <li>✓ Keyboard navigation support</li>
                  <li>✓ Cancel and save actions</li>
                  <li>✓ Automatic focus management</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="bg-sanctuary-bg-secondary rounded-xl p-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Usage Guidelines</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-sanctuary-accent">Best Practices</h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>• Use highlights sparingly to maintain visual hierarchy</li>
                <li>• Establish consistent color meanings across your journal</li>
                <li>• Validate links before saving to ensure they work properly</li>
                <li>• Use headings to structure your content logically</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-sanctuary-accent">Accessibility</h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>• All toolbar buttons are keyboard accessible</li>
                <li>• Color combinations meet WCAG contrast requirements</li>
                <li>• Screen readers can access all formatting options</li>
                <li>• Focus indicators are clearly visible</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export const BubbleToolbarShowcase = BubbleToolbarDemo;
