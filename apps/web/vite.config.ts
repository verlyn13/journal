import react from "@vitejs/plugin-react";
import { defineConfig, UserConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
const API_PORT = Number(process.env.JOURNAL_API_PORT || 5000);
const WEB_PORT = Number(process.env.WEB_PORT || 5173);

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(fileURLToPath(new URL('.', import.meta.url)), "./src"),
		},
		dedupe: [
			'@codemirror/state',
			'@codemirror/view',
			'@codemirror/commands',
			'@codemirror/language',
			'@codemirror/autocomplete',
			'@codemirror/search',
		],
	},
	server: {
		port: WEB_PORT,
		proxy: {
			"/api": {
				target: `http://localhost:${API_PORT}`,
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: "dist",
		sourcemap: true,
		manifest: true,
    // Increase warning threshold to account for editor/markdown lazy chunks
    // The heavy Markdown editor/preview are code-split and loaded on demand.
    // Raising this limit avoids noisy warnings while keeping core bundle small.
    chunkSizeWarningLimit: 1200,
		rollupOptions: {
			input: {
				app: "index.html",
			},
			output: {
				manualChunks: {
					// Split monaco-editor into its own chunk
					'monaco-editor': ['monaco-editor'],
					// Split React and related libraries
					'react-vendor': ['react', 'react-dom'],
					// Split TipTap editor
					'editor': ['@tiptap/react', '@tiptap/core', '@tiptap/starter-kit', '@tiptap/extension-highlight', '@tiptap/extension-link', '@tiptap/extension-placeholder', '@tiptap/extension-typography'],
					// Split math libraries
					'math': ['katex'],
					// Split query libraries
					'query': ['@tanstack/react-query'],
				},
			},
		},
	},
});
