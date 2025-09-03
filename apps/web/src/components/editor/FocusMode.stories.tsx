import type { Meta, StoryObj } from '@storybook/react';
import Editor from './Editor';
import FocusMode, { useFocusMode } from './FocusMode';

const meta = {
  title: 'Editor/FocusMode',
  component: FocusMode,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Focus Mode provides a distraction-free writing environment with:
- 70ch width lock for optimal reading line length
- Calm background gradient overlay
- Keyboard shortcut (F key) for quick toggle
- localStorage persistence across sessions
- Smooth transitions and animations

Compatible with Flask backend focus mode state synchronization.
        `,
      },
    },
  },
  argTypes: {
    onFocusChange: { action: 'focus changed' },
    initialFocus: {
      control: 'boolean',
      description: 'Initial focus state',
    },
    showToggle: {
      control: 'boolean',
      description: 'Show the focus toggle button',
    },
  },
} satisfies Meta<typeof FocusMode>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample content for demonstration
const SampleContent = () => (
  <div
    style={{
      padding: '24px',
      background: 'var(--sanctuary-bg-secondary)',
      borderRadius: '12px',
      border: '1px solid var(--sanctuary-border)',
      minHeight: '400px',
    }}
  >
    <h1>Sample Journal Entry</h1>
    <p>
      This is a sample journal entry to demonstrate Focus Mode functionality. In focus mode, the
      content is centered and limited to 70 characters width for optimal readability, with a calm
      background overlay to reduce distractions.
    </p>
    <h2>Benefits of Focus Mode</h2>
    <ul>
      <li>Improved concentration through reduced visual clutter</li>
      <li>Optimal line length for comfortable reading</li>
      <li>Immersive writing experience with calm background</li>
      <li>Quick toggle with keyboard shortcut (F key)</li>
    </ul>
    <p>
      Focus mode persists across browser sessions and syncs with the Flask backend when integrated.
      The smooth transitions provide a pleasant user experience without jarring layout shifts.
    </p>
  </div>
);

export const Default: Story = {
  args: {
    showToggle: true,
    initialFocus: false,
    children: <SampleContent />,
  },
  render: (args) => (
    <div style={{ padding: '20px', minHeight: '600px' }}>
      <FocusMode {...args} />
    </div>
  ),
};

export const InitiallyFocused: Story = {
  args: {
    showToggle: true,
    initialFocus: true,
    children: <SampleContent />,
  },
  render: (args) => (
    <div style={{ padding: '20px', minHeight: '600px' }}>
      <FocusMode {...args} />
    </div>
  ),
};

export const NoToggleButton: Story = {
  args: {
    showToggle: false,
    initialFocus: false,
    children: <SampleContent />,
  },
  render: (args) => (
    <div style={{ padding: '20px', minHeight: '600px' }}>
      <FocusMode {...args} />
      <p
        style={{
          marginTop: '16px',
          fontSize: '14px',
          color: 'var(--sanctuary-text-secondary)',
        }}
      >
        Toggle hidden - use F key to toggle focus mode
      </p>
    </div>
  ),
};

export const WithEditor: Story = {
  args: {
    showToggle: true,
    initialFocus: false,
    children: (
      <div
        style={{
          background: 'var(--sanctuary-bg-secondary)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--sanctuary-border)',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Journal Editor</h2>
        <Editor />
      </div>
    ),
  },
  render: (args) => (
    <div style={{ padding: '20px', minHeight: '600px' }}>
      <FocusMode {...args} />
    </div>
  ),
};

// Interactive demo using the hook
const HookDemo = () => {
  const { isFocused, toggleFocus, setFocus } = useFocusMode();

  return (
    <div style={{ padding: '20px', minHeight: '600px' }}>
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={toggleFocus}
          style={{
            padding: '8px 16px',
            background: isFocused ? 'var(--sanctuary-accent)' : 'transparent',
            color: isFocused ? 'var(--sanctuary-bg-primary)' : 'var(--sanctuary-text-primary)',
            border: '1px solid var(--sanctuary-accent)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Toggle Focus ({isFocused ? 'On' : 'Off'})
        </button>
        <button
          type="button"
          onClick={() => setFocus(true)}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: 'var(--sanctuary-text-primary)',
            border: '1px solid var(--sanctuary-border)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Force On
        </button>
        <button
          type="button"
          onClick={() => setFocus(false)}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: 'var(--sanctuary-text-primary)',
            border: '1px solid var(--sanctuary-border)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Force Off
        </button>
      </div>

      <FocusMode showToggle={false} onFocusChange={(_focused) => {}}>
        <div
          style={{
            padding: '24px',
            background: 'var(--sanctuary-bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--sanctuary-border)',
            minHeight: '400px',
          }}
        >
          <h1>Hook Demo</h1>
          <p>
            Current state: <strong>{isFocused ? 'Focused' : 'Normal'}</strong>
          </p>
          <p>
            This demo shows the useFocusMode hook in action. The hook provides direct access to
            focus state management without requiring the component wrapper.
          </p>
          <p>Press F key to toggle, or use the buttons above.</p>
          <div
            style={{
              background: isFocused ? 'rgba(0, 184, 148, 0.1)' : 'transparent',
              padding: '16px',
              borderRadius: '8px',
              marginTop: '16px',
              transition: 'background-color 0.3s ease',
            }}
          >
            <p>This content area changes background when focused to show the state change.</p>
          </div>
        </div>
      </FocusMode>
    </div>
  );
};

export const UsingHook: Story = {
  args: {
    children: <div />,
  },
  render: () => <HookDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the useFocusMode hook for programmatic control of focus state.',
      },
    },
  },
};

// Responsive demo
export const ResponsiveDemo: Story = {
  args: {
    showToggle: true,
    initialFocus: false,
    children: <SampleContent />,
  },
  render: (args) => (
    <div>
      {/* Desktop layout */}
      <div style={{ padding: '20px', minHeight: '600px' }}>
        <h3>Desktop Layout (try resizing browser)</h3>
        <FocusMode {...args}>
          <div
            style={{
              padding: '24px',
              background: 'var(--sanctuary-bg-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--sanctuary-border)',
              minHeight: '300px',
            }}
          >
            <h1>Responsive Focus Mode</h1>
            <p>
              Focus Mode automatically adapts to different screen sizes. On mobile devices, the 70ch
              limit provides comfortable reading width, while on desktop it prevents overly wide
              text lines that are hard to read.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '16px',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  background: 'var(--sanctuary-bg-tertiary)',
                  borderRadius: '6px',
                }}
              >
                <h4>Column 1</h4>
                <p>
                  This layout adapts to available space while respecting focus mode constraints.
                </p>
              </div>
              <div
                style={{
                  padding: '12px',
                  background: 'var(--sanctuary-bg-tertiary)',
                  borderRadius: '6px',
                }}
              >
                <h4>Column 2</h4>
                <p>Try toggling focus mode to see how the layout changes.</p>
              </div>
            </div>
          </div>
        </FocusMode>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows how Focus Mode handles responsive layouts and different screen sizes.',
      },
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1200px', height: '800px' },
        },
      },
    },
  },
};
