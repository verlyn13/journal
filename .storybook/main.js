export default {
  stories: ['../journal/static/js/components/**/*.stories.js'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    'storybook-addon-performance'
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {}
  },
  core: {
    builder: '@storybook/builder-vite'
  },
  viteFinal: async (config) => {
    // Add Alpine.js and HTMX as globals
    config.define = {
      ...config.define,
      'process.env.NODE_ENV': '"development"'
    };
    
    // Ensure proper module resolution
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': '/journal/static/js'
      }
    };
    
    // Disable public directory to prevent copying our redirect index.html
    config.publicDir = false;
    
    return config;
  }
};