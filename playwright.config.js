import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.js', '**/*.test.js', '**/*.spec.ts', '**/*.test.ts'],

  // Parallel execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  // Shared settings
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Viewport settings for consistency
    viewport: { width: 1280, height: 720 },

    // Navigation timeout
    navigationTimeout: 30000,

    // Action timeout
    actionTimeout: 10000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet viewports
    {
      name: 'iPad',
      use: { ...devices['iPad (gen 7)'] },
    },

    // Visual regression tests
    {
      name: 'visual',
      testDir: './tests/visual',
      testMatch: '**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        // Disable animations for consistent screenshots
        launchOptions: {
          args: ['--disable-animations'],
        },
      },
    },

    // Accessibility tests
    {
      name: 'a11y',
      testDir: './tests/a11y',
      testMatch: '**/*.test.js',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    // Web editor tests against Vite dev server
    {
      name: 'web-editor',
      testDir: './tests/web',
      testMatch: '**/*.spec.ts',
      use: {
        baseURL: 'http://localhost:5173',
        ...devices['Desktop Chrome'],
      },
      webServer: {
        command: 'bun run web:dev',
        port: 5173,
        timeout: 120 * 1000,
        reuseExistingServer: true,
      },
    },
  ],

  // Local dev server configuration
  webServer: process.env.CI
    ? undefined
    : {
        command: 'REACT_EDITOR=true make dev-py',
        port: 5000,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
      },

  // Output folder
  outputDir: 'test-results/',
});
