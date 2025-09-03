/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				// Sanctuary theme colors
				sanctuary: {
					// Dawn Mode (Light)
					"bg-primary": "#F5F3F0", // Sand
					"bg-secondary": "#EAE8E3", // Off-white
					"bg-tertiary": "#DDE3EA", // Pastel Blue (very light)
					"text-primary": "#41454c", // Slate Gray
					"text-secondary": "#6B7280", // Muted gray
					accent: "#A8B5C5", // Stone Blue
					"accent-hover": "#8FA5B8", // Darker Stone Blue
					border: "#DDE3EA", // Light border

					// Dusk Mode (Dark) - prefixed with 'dark-'
					"dark-bg-primary": "#2C303A", // Evergreen
					"dark-bg-secondary": "#383D4A", // Charcoal
					"dark-bg-tertiary": "#505668", // Slate Blue
					"dark-text-primary": "#D4D6D9", // Light Gray
					"dark-text-secondary": "#9CA3AF", // Muted light gray
					"dark-accent": "#D4AF8B", // Burnished Gold
					"dark-accent-hover": "#C19B76", // Darker Gold
					"dark-border": "#505668", // Dark border
				},

				// Design system colors from refactor-ui-design.md
				"evergreen-aqua": "#00B894",
				"warm-sand": "#FFD166",
				midnight: "#0F1115",
				parchment: "#FAFAF7",
				"serene-blue": "#0F1B2B",
			},

			fontFamily: {
				sans: ["Inter", "sans-serif"], // UI & Headings
				serif: ["Lora", "serif"], // Body text
				mono: ["JetBrains Mono", "monospace"], // Code
			},

			maxWidth: {
				prose: "70ch", // Optimal reading width
			},

			spacing: {
				18: "4.5rem", // 72px - for generous padding
				22: "5.5rem", // 88px
			},

			borderRadius: {
				"2xl": "16px", // Design system radius
				"3xl": "20px", // Larger radius
			},

			transitionTimingFunction: {
				sanctuary: "cubic-bezier(0.4, 0, 0.2, 1)", // Smooth easing
			},

			transitionDuration: {
				240: "240ms", // Design system motion timing
			},
		},
	},
	plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
