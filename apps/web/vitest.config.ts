import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Ensure __dirname works in ESM for reliable path resolution in CI
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.ts',
        '**/*.d.ts',
        '**/*.stories.tsx',
        '**/index.ts'
      ]
    },
    css: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  define: {
    'import.meta.env.VITE_EDITOR': JSON.stringify('html')
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      'monaco-editor': path.resolve(__dirname, './src/test-mocks/monaco-editor.ts')
    }
  }
});
