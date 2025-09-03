import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'journal/static/js/tiptap-editor.js',
  output: {
    file: 'journal/static/dist/tiptap-editor.bundle.js',
    format: 'iife',
    name: 'JournalEditor',
    globals: {},
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    terser(),
  ],
});
