import Alpine from 'alpinejs';

// Initialize Alpine globally for all stories
window.Alpine = Alpine;

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#ffffff' },
      { name: 'dark', value: '#1a1a1a' },
    ],
  },
  viewport: {
    viewports: {
      mobile: {
        name: 'Mobile',
        styles: {
          width: '320px',
          height: '568px',
        },
      },
      tablet: {
        name: 'Tablet',
        styles: {
          width: '768px',
          height: '1024px',
        },
      },
      desktop: {
        name: 'Desktop',
        styles: {
          width: '1440px',
          height: '900px',
        },
      },
    },
  },
  a11y: {
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'label',
          enabled: true,
        },
      ],
    },
  },
};

export const decorators = [
  (Story) => {
    // Add Tailwind CSS classes to the story container
    return `
      <div class="min-h-screen bg-white dark:bg-gray-900 p-8">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css" rel="stylesheet">
        ${Story()}
      </div>
    `;
  },
  (Story, context) => {
    // Initialize Alpine.js after story renders
    requestAnimationFrame(() => {
      if (!Alpine.version) {
        Alpine.start();
      }
    });
    return Story();
  },
];