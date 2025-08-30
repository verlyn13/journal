/**
 * Visual Regression Testing Configuration
 * Defines viewports, components, and states to test
 */
export default {
  // Breakpoints for responsive testing
  viewports: [
    { name: 'mobile', width: 320, height: 568 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'wide', width: 1920, height: 1080 }
  ],
  
  // Components to test
  components: [
    {
      name: 'DataTable',
      url: '/components/data-table',
      selectors: {
        root: '[data-component="data-table"]',
        header: 'thead',
        rows: 'tbody tr',
        pagination: '[data-pagination]'
      }
    },
    {
      name: 'FormInput',
      url: '/components/form-input',
      selectors: {
        root: '[data-component="form-input"]',
        input: 'input',
        label: 'label',
        error: '[data-error]'
      }
    },
    {
      name: 'Modal',
      url: '/components/modal',
      selectors: {
        root: '[data-component="modal"]',
        overlay: '[data-overlay]',
        content: '[data-content]',
        close: '[data-close]'
      }
    },
    {
      name: 'Notification',
      url: '/components/notification',
      selectors: {
        root: '[data-component="notification"]',
        message: '[data-message]',
        dismiss: '[data-dismiss]'
      }
    }
  ],
  
  // States to capture
  states: [
    { name: 'default', actions: [] },
    { name: 'hover', actions: ['hover'] },
    { name: 'focus', actions: ['focus'] },
    { name: 'active', actions: ['click'] },
    { name: 'disabled', setup: 'disable' },
    { name: 'error', setup: 'error' },
    { name: 'loading', setup: 'loading' },
    { name: 'empty', setup: 'empty' }
  ],
  
  // Theme variations
  themes: ['light', 'dark'],
  
  // Screenshot comparison options
  comparison: {
    threshold: 0.01, // 1% difference threshold
    maxDiffPixels: 100,
    animations: 'disabled',
    caret: 'hide'
  },
  
  // Output configuration
  output: {
    dir: 'tests/visual/screenshots',
    format: 'png',
    fullPage: false,
    omitBackground: false
  },
  
  // Baseline management
  baseline: {
    dir: 'tests/visual/baseline',
    update: process.env.UPDATE_BASELINE === 'true',
    skipMissing: false
  }
};