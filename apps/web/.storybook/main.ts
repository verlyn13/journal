import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/components/**/*.stories.@(js|jsx|ts|tsx)"],
	addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	core: {},
	docs: {
		autodocs: true,
	},
};

export default config;
