import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: [
        "../src/components/**/*.stories.@(js|jsx|ts|tsx)",
        "../src/stories/**/*.stories.@(js|jsx|ts|tsx)"
    ],
    addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],

    framework: {
		name: "@storybook/react-vite",
		options: {},
	},

    core: {}
};

export default config;
