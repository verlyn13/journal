import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "dist",
		sourcemap: true,
		manifest: true,
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
