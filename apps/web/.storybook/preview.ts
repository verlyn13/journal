import type { Preview } from "@storybook/react-vite";
import "../src/index.css";
import "../src/styles/tailwind.css";
import "../src/styles/tokens.css";

const preview: Preview = {
    parameters: {
		layout: "fullscreen",
		controls: { expanded: true },
		a11y: { disable: false },
	},

    decorators: [
		(Story) => {
			// Honor persisted theme if set
			if (typeof document !== "undefined") {
				const saved = localStorage.getItem("journal:theme");
				document.documentElement.classList.toggle("dark", saved === "dusk");
			}
			return Story();
		},
	],

    tags: ["autodocs"]
};

export default preview;
