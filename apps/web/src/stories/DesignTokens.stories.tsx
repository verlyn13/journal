import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Sanctuary Theme',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Sanctuary theme provides a calm, focused journaling experience with carefully chosen colors, typography, and spacing that reduce cognitive load and encourage writing.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Color palette component
function ColorPalette() {
  const dawnColors = {
    'Primary Background': '#F5F3F0',
    'UI Elements': '#EAE8E3',
    'Primary Text': '#41454c',
    'Accent Color': '#A8B5C5',
    'Subtle Accent': '#DDE3EA',
  };

  const duskColors = {
    'Primary Background': '#2C303A',
    'UI Elements': '#383D4A',
    'Primary Text': '#D4D6D9',
    'Accent Color': '#D4AF8B',
    'Subtle Accent': '#505668',
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '2rem' }}>
        Sanctuary Design System
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '1rem' }}>
            Dawn Mode (Light)
          </h2>
          <p
            style={{
              fontFamily: 'Lora, serif',
              color: '#41454c',
              marginBottom: '1.5rem',
              lineHeight: 1.6,
            }}
          >
            Evokes the feeling of soft morning light. Airy, calm, and designed for clarity.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(dawnColors).map(([name, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '4rem',
                    height: '3rem',
                    backgroundColor: color,
                    border: '1px solid #DDE3EA',
                    borderRadius: '0.5rem',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.8rem',
                      color: '#41454c',
                      opacity: 0.8,
                    }}
                  >
                    {color}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              marginBottom: '1rem',
              color: '#D4D6D9',
            }}
          >
            Dusk Mode (Dark)
          </h2>
          <p
            style={{
              fontFamily: 'Lora, serif',
              color: '#D4D6D9',
              marginBottom: '1.5rem',
              lineHeight: 1.6,
              backgroundColor: '#2C303A',
              padding: '1rem',
              borderRadius: '0.5rem',
            }}
          >
            Creates a cozy, intimate, and focused environment, perfect for evening reflection.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              backgroundColor: '#2C303A',
              padding: '1.5rem',
              borderRadius: '0.75rem',
            }}
          >
            {Object.entries(duskColors).map(([name, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '4rem',
                    height: '3rem',
                    backgroundColor: color,
                    border: '1px solid #505668',
                    borderRadius: '0.5rem',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      color: '#D4D6D9',
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.8rem',
                      color: '#D4D6D9',
                      opacity: 0.8,
                    }}
                  >
                    {color}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Typography showcase
function Typography() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '2rem' }}>Typography System</h1>

      <div style={{ marginBottom: '3rem' }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            marginBottom: '1rem',
            fontSize: '1.5rem',
          }}
        >
          Inter - UI & Headings (Sans-Serif)
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#41454c',
            marginBottom: '1rem',
            fontSize: '1rem',
          }}
        >
          Clean, modern, and exceptionally legible for all UI elements, from buttons to menu items.
          Its neutral yet friendly character keeps the interface uncluttered.
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '2rem',
              fontWeight: 700,
            }}
          >
            Heading 1 - Bold
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 600,
            }}
          >
            Heading 2 - Semibold
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 500,
            }}
          >
            Heading 3 - Medium
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              fontWeight: 400,
            }}
          >
            Body Text - Regular
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 400,
            }}
          >
            Small Text - Regular
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            marginBottom: '1rem',
            fontSize: '1.5rem',
          }}
        >
          Lora - Body Text (Serif)
        </h2>
        <div
          style={{
            fontFamily: 'Lora, serif',
            color: '#41454c',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            marginBottom: '1rem',
          }}
        >
          A classic, well-balanced serif with gentle curves that is perfect for long-form reading.
          It renders beautifully on screens, reducing eye strain and adding a touch of literary
          elegance to the user's entries.
        </div>
        <div
          style={{
            fontFamily: 'Lora, serif',
            fontSize: '1rem',
            lineHeight: 1.6,
            color: '#41454c',
            background: '#F5F3F0',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            borderLeft: '4px solid #A8B5C5',
          }}
        >
          This is how journal content looks in the Sanctuary theme. The serif typography provides
          excellent readability for extended writing sessions, while the generous line height and
          optimal character width (66-72ch) ensure comfortable reading. The warm background colors
          create an inviting atmosphere that encourages daily journaling practice.
        </div>
      </div>

      <div>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            marginBottom: '1rem',
            fontSize: '1.5rem',
          }}
        >
          JetBrains Mono - Code (Monospace)
        </h2>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: '#F5F3F0',
            border: '1px solid #DDE3EA',
            borderRadius: '0.5rem',
            padding: '1rem',
            fontSize: '0.9rem',
            color: '#41454c',
          }}
        >
          <div>{/* Code blocks use JetBrains Mono */}</div>
          <div>function journalEntry() {`{`}</div>
          <div>&nbsp;&nbsp;return "Beautiful typography for code";</div>
          <div>{`}`}</div>
        </div>
      </div>
    </div>
  );
}

// Spacing and layout showcase
function SpacingSystem() {
  const spacingValues = [
    { name: '2xs', value: '0.25rem', px: '4px' },
    { name: 'xs', value: '0.5rem', px: '8px' },
    { name: 'sm', value: '0.75rem', px: '12px' },
    { name: 'md', value: '1rem', px: '16px' },
    { name: 'lg', value: '1.5rem', px: '24px' },
    { name: 'xl', value: '2rem', px: '32px' },
    { name: '2xl', value: '3rem', px: '48px' },
    { name: '3xl', value: '4rem', px: '64px' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '2rem' }}>Spacing System</h1>
      <p
        style={{
          fontFamily: 'Lora, serif',
          color: '#41454c',
          marginBottom: '2rem',
          lineHeight: 1.6,
        }}
      >
        A consistent 8px grid system used for all margins, padding, and positioning to ensure visual
        harmony and rhythm throughout the application.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
        }}
      >
        {spacingValues.map(({ name, value, px }) => (
          <div
            key={name}
            style={{
              border: '1px solid #DDE3EA',
              borderRadius: '0.5rem',
              padding: '1rem',
              background: '#F5F3F0',
            }}
          >
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8rem',
                color: '#41454c',
                marginBottom: '0.75rem',
              }}
            >
              {value} ({px})
            </div>
            <div
              style={{
                height: value,
                backgroundColor: '#A8B5C5',
                borderRadius: '0.25rem',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '1rem' }}>Border Radius</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { name: 'sm', value: '0.25rem' },
            { name: 'md', value: '0.5rem' },
            { name: 'lg', value: '0.75rem' },
            { name: 'xl', value: '1rem' },
            { name: '2xl', value: '1.25rem' },
          ].map(({ name, value }) => (
            <div key={name} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#A8B5C5',
                  borderRadius: value,
                  marginBottom: '0.5rem',
                }}
              />
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.7rem',
                  color: '#41454c',
                  opacity: 0.8,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const ColorPalettes: Story = {
  render: () => <ColorPalette />,
  parameters: {
    docs: {
      description: {
        story:
          'The Dawn (light) and Dusk (dark) color palettes that form the foundation of the Sanctuary theme.',
      },
    },
  },
};

export const TypographySystem: Story = {
  render: () => <Typography />,
  parameters: {
    docs: {
      description: {
        story:
          'The typography system featuring Inter for UI elements, Lora for body text, and JetBrains Mono for code.',
      },
    },
  },
};

export const Spacing: Story = {
  render: () => <SpacingSystem />,
  parameters: {
    docs: {
      description: {
        story:
          'The 8px grid-based spacing system and border radius tokens used throughout the interface.',
      },
    },
  },
};

export const DarkTheme: Story = {
  render: () => (
    <div style={{ backgroundColor: '#2C303A', minHeight: '100vh' }}>
      <ColorPalette />
    </div>
  ),
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#2C303A' }],
    },
    docs: {
      description: {
        story: 'The complete design system shown in dark mode (Dusk theme).',
      },
    },
  },
};

export const Components: Story = {
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '2rem' }}>Component Examples</h1>

      {/* Buttons */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '1rem' }}>Buttons</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{
              backgroundColor: '#A8B5C5',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Primary Button
          </button>
          <button
            type="button"
            style={{
              backgroundColor: 'transparent',
              color: '#A8B5C5',
              border: '1px solid #A8B5C5',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Secondary Button
          </button>
          <button
            type="button"
            style={{
              backgroundColor: '#F5F3F0',
              color: '#41454c',
              border: '1px solid #DDE3EA',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Tertiary Button
          </button>
        </div>
      </section>

      {/* Form elements */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '1rem' }}>Form Elements</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '400px',
          }}
        >
          <input
            type="text"
            placeholder="Text input"
            style={{
              padding: '0.75rem',
              border: '1px solid #DDE3EA',
              borderRadius: '0.5rem',
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              background: '#F5F3F0',
            }}
          />
          <select
            style={{
              padding: '0.75rem',
              border: '1px solid #DDE3EA',
              borderRadius: '0.5rem',
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              background: '#F5F3F0',
            }}
          >
            <option>Select option</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
          <textarea
            placeholder="Textarea"
            rows={4}
            style={{
              padding: '0.75rem',
              border: '1px solid #DDE3EA',
              borderRadius: '0.5rem',
              fontFamily: 'Lora, serif',
              fontSize: '1rem',
              background: '#F5F3F0',
              resize: 'vertical',
            }}
          />
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '1rem' }}>Cards</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: '#F5F3F0',
              border: '1px solid #DDE3EA',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(168, 181, 197, 0.1)',
            }}
          >
            <h3
              style={{
                fontFamily: 'Inter, sans-serif',
                marginBottom: '0.5rem',
                fontSize: '1.25rem',
              }}
            >
              Journal Entry Card
            </h3>
            <p
              style={{
                fontFamily: 'Lora, serif',
                color: '#41454c',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              This is how a journal entry preview might look in the Sanctuary theme. The card design
              is subtle and unobtrusive, letting the content shine.
            </p>
          </div>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of common UI components styled with the Sanctuary theme design tokens.',
      },
    },
  },
};
