import { useEffect, useState } from 'react';

export default {
  title: 'Design/Sanctuary Theme',
  parameters: {
    layout: 'fullscreen',
  },
};

const ColorSwatch = ({
  name,
  value,
  description,
}: {
  name: string;
  value: string;
  description?: string;
}) => (
  <div className="flex items-center gap-3 p-3 bg-sanctuary-bg-secondary rounded-lg">
    <div
      className="w-12 h-12 rounded-lg border border-sanctuary-border"
      style={{ backgroundColor: value }}
    />
    <div className="flex-1">
      <div className="font-medium text-sanctuary-text-primary">{name}</div>
      <div className="text-sm text-sanctuary-text-secondary font-mono">{value}</div>
      {description && (
        <div className="text-xs text-sanctuary-text-secondary mt-1">{description}</div>
      )}
    </div>
  </div>
);

const TypographyExample = ({
  variant,
  text,
  className,
}: {
  variant: string;
  text: string;
  className: string;
}) => (
  <div className="p-4 bg-sanctuary-bg-secondary rounded-lg">
    <div className="text-sm text-sanctuary-text-secondary mb-2">{variant}</div>
    <div className={className}>{text}</div>
  </div>
);

export const SanctuaryTokens = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dusk');
    } else {
      root.setAttribute('data-theme', 'dawn');
    }
  }, [isDarkMode]);

  const colors = {
    dawn: {
      'Primary Background': '#F5F3F0',
      'Secondary Background': '#EAE8E3',
      'Tertiary Background': '#DDD8CE',
      'Primary Text': '#41454C',
      'Secondary Text': '#6B7280',
      Border: '#D1D5DB',
      Accent: '#A8B5C5',
      'Accent Hover': '#8FA0B0',
    },
    dusk: {
      'Primary Background': '#2C303A',
      'Secondary Background': '#383D4A',
      'Tertiary Background': '#505668',
      'Primary Text': '#D4D6D9',
      'Secondary Text': '#9CA3AF',
      Border: '#505668',
      Accent: '#D4AF8B',
      'Accent Hover': '#E4BF9B',
    },
  };

  const currentColors = isDarkMode ? colors.dusk : colors.dawn;

  return (
    <div className="min-h-screen bg-sanctuary-bg-primary text-sanctuary-text-primary p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-bold">Sanctuary Design System</h1>
          <p className="text-lg text-sanctuary-text-secondary max-w-2xl mx-auto">
            A calm, focused design system for journaling and creative expression
          </p>

          {/* Theme Toggle */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="text-sm text-sanctuary-text-secondary">Dawn</span>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out
                ${isDarkMode ? 'bg-sanctuary-accent' : 'bg-gray-300'}
              `}
            >
              <div
                className={`
                  absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-200 ease-in-out
                  ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}
                `}
              />
            </button>
            <span className="text-sm text-sanctuary-text-secondary">Dusk</span>
          </div>
        </div>

        {/* Color Palette */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">
            Color Palette - {isDarkMode ? 'Dusk' : 'Dawn'} Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(currentColors).map(([name, value]) => (
              <ColorSwatch
                key={name}
                name={name}
                value={value}
                description={
                  name.includes('Text')
                    ? 'For body text and labels'
                    : name.includes('Background')
                      ? 'For surfaces and containers'
                      : name.includes('Accent')
                        ? 'For interactive elements'
                        : undefined
                }
              />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Typography</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TypographyExample
              variant="Display Large"
              text="Journal Entry"
              className="text-4xl font-serif font-bold text-sanctuary-text-primary"
            />
            <TypographyExample
              variant="Heading 1"
              text="Morning Reflections"
              className="text-2xl font-serif font-bold text-sanctuary-text-primary"
            />
            <TypographyExample
              variant="Heading 2"
              text="Key Insights"
              className="text-xl font-serif font-semibold text-sanctuary-text-primary"
            />
            <TypographyExample
              variant="Body Large"
              text="This is body text for journal content. It should be comfortable to read for extended periods."
              className="text-lg text-sanctuary-text-primary leading-relaxed"
            />
            <TypographyExample
              variant="Body Regular"
              text="This is the default body text size used throughout the interface."
              className="text-base text-sanctuary-text-primary leading-normal"
            />
            <TypographyExample
              variant="Caption"
              text="Small text for metadata and secondary information"
              className="text-sm text-sanctuary-text-secondary"
            />
          </div>
        </section>

        {/* Component Examples */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">Component Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Button Examples */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Buttons</h3>
              <button
                type="button"
                className="px-4 py-2 bg-sanctuary-accent text-sanctuary-bg-primary rounded-lg hover:bg-sanctuary-accent-hover transition-colors"
              >
                Primary Button
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-sanctuary-border text-sanctuary-text-primary rounded-lg hover:bg-sanctuary-bg-secondary transition-colors"
              >
                Secondary Button
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sanctuary-accent hover:bg-sanctuary-accent/10 rounded-lg transition-colors"
              >
                Ghost Button
              </button>
            </div>

            {/* Input Examples */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Inputs</h3>
              <input
                type="text"
                placeholder="Search entries..."
                className="w-full px-3 py-2 bg-sanctuary-bg-secondary border border-sanctuary-border rounded-lg text-sanctuary-text-primary placeholder-sanctuary-text-secondary focus:outline-none focus:ring-2 focus:ring-sanctuary-accent focus:border-transparent"
              />
              <textarea
                placeholder="Write your thoughts..."
                rows={3}
                className="w-full px-3 py-2 bg-sanctuary-bg-secondary border border-sanctuary-border rounded-lg text-sanctuary-text-primary placeholder-sanctuary-text-secondary focus:outline-none focus:ring-2 focus:ring-sanctuary-accent focus:border-transparent resize-none"
              />
            </div>

            {/* Card Example */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Cards</h3>
              <div className="p-4 bg-sanctuary-bg-secondary rounded-lg border border-sanctuary-border">
                <h4 className="font-semibold text-sanctuary-text-primary mb-2">Card Title</h4>
                <p className="text-sanctuary-text-secondary text-sm">
                  This is a card component with proper spacing and hierarchy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="bg-sanctuary-bg-secondary rounded-xl p-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Usage Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Color Usage</h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>• Use primary background for main content areas</li>
                <li>• Secondary background for cards and panels</li>
                <li>• Tertiary background for subtle elements</li>
                <li>• Accent color sparingly for key interactions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Typography</h3>
              <ul className="space-y-2 text-sanctuary-text-secondary">
                <li>• Serif fonts for content and headings</li>
                <li>• Sans-serif for UI elements and navigation</li>
                <li>• Maintain 1.5-1.7 line height for readability</li>
                <li>• Use consistent vertical rhythm</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
