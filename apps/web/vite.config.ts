import react from "@vitejs/plugin-react";
import { defineConfig, UserConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
const API_PORT = Number(process.env.JOURNAL_API_PORT || 5000);
const WEB_PORT = Number(process.env.WEB_PORT || 5173);
const ENABLE_REACT_COMPILER = process.env.ENABLE_REACT_COMPILER === 'true';
const REACT_COMPILER_DEBUG = process.env.REACT_COMPILER_DEBUG === 'true';

// Log React Compiler status
if (ENABLE_REACT_COMPILER) {
	console.log('✨ React Compiler enabled (beta)');
	if (REACT_COMPILER_DEBUG) {
		console.log('🔍 React Compiler debug mode enabled');
	}
}

export default defineConfig({
	plugins: [
		react({
			jsxRuntime: 'automatic',
			jsxImportSource: 'react',
			include: /\.(js|jsx|ts|tsx)$/,
			babel: ENABLE_REACT_COMPILER ? {
				plugins: [['babel-plugin-react-compiler', {
					compilationMode: 'infer',
					panicThreshold: 'CRITICAL_ERRORS',
					// Additional options for better control
					sources: (filename: string) => {
						// Skip test files and stories
						if (filename.includes('.test.') || filename.includes('.stories.')) {
							return false;
						}
						return true;
					},
				}]]
			} : undefined
		})
	],
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
		target: 'es2022',
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
					// Split math libraries
					'math': ['katex'],
					// Split query libraries
					'query': ['@tanstack/react-query'],
				},
			},
		},
	},
	optimizeDeps: {
		include: ['react', 'react-dom', 'react/jsx-runtime']
	}
});
