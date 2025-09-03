import { expect, test } from "@playwright/test";

test.describe("Editor Keyboard Interactions", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");

		// Wait for the editor to be ready
		await page.waitForSelector(".ProseMirror", { state: "visible" });

		// Focus the editor
		await page.click(".ProseMirror");
	});

	test.describe("Focus Mode", () => {
		test("should toggle Focus Mode with F key", async ({ page }) => {
			// Verify initial state (not in focus mode)
			await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
			await expect(page.locator('[data-testid="entry-list"]')).toBeVisible();

			// Press F to toggle focus mode
			await page.keyboard.press("f");

			// Verify focus mode is active
			await expect(page.locator('[data-testid="sidebar"]')).toBeHidden();
			await expect(page.locator('[data-testid="entry-list"]')).toBeHidden();

			// Press F again to toggle back
			await page.keyboard.press("f");

			// Verify focus mode is disabled
			await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
			await expect(page.locator('[data-testid="entry-list"]')).toBeVisible();
		});

		test("should persist focus mode state in localStorage", async ({
			page,
		}) => {
			// Enable focus mode
			await page.keyboard.press("f");

			// Reload the page
			await page.reload();
			await page.waitForSelector(".ProseMirror", { state: "visible" });

			// Verify focus mode is still active
			await expect(page.locator('[data-testid="sidebar"]')).toBeHidden();
			await expect(page.locator('[data-testid="entry-list"]')).toBeHidden();
		});
	});

	test.describe("Slash Commands", () => {
		test("should open slash command menu with / key", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("/");

			// Verify slash command menu appears
			await expect(
				page.locator('[data-testid="slash-commands"]'),
			).toBeVisible();

			// Verify some default commands are visible
			await expect(page.locator("text=Daily Reflection")).toBeVisible();
			await expect(page.locator("text=Meeting Notes")).toBeVisible();
			await expect(page.locator("text=Heading 1")).toBeVisible();
		});

		test("should filter commands as user types", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("/daily");

			// Verify filtered results
			await expect(page.locator("text=Daily Reflection")).toBeVisible();
			await expect(page.locator("text=Meeting Notes")).toBeHidden();
		});

		test("should navigate commands with arrow keys", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("/");

			await page.waitForSelector('[data-testid="slash-commands"]');

			// Press down arrow to select first command
			await page.keyboard.press("ArrowDown");

			// Verify first command is highlighted
			await expect(
				page.locator('[data-testid="slash-command-0"]'),
			).toHaveAttribute("data-selected", "true");

			// Press down arrow again
			await page.keyboard.press("ArrowDown");

			// Verify second command is highlighted
			await expect(
				page.locator('[data-testid="slash-command-1"]'),
			).toHaveAttribute("data-selected", "true");

			// Press up arrow
			await page.keyboard.press("ArrowUp");

			// Verify first command is highlighted again
			await expect(
				page.locator('[data-testid="slash-command-0"]'),
			).toHaveAttribute("data-selected", "true");
		});

		test("should select command with Enter key", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("/daily");

			await page.waitForSelector('[data-testid="slash-commands"]');
			await page.keyboard.press("ArrowDown"); // Select Daily Reflection
			await page.keyboard.press("Enter");

			// Verify slash menu is closed
			await expect(page.locator('[data-testid="slash-commands"]')).toBeHidden();

			// Verify daily reflection template is inserted
			await expect(page.locator(".ProseMirror")).toContainText(
				"What I'm Grateful For",
			);
			await expect(page.locator(".ProseMirror")).toContainText(
				"Top 3 Priorities Today",
			);
		});

		test("should close slash menu with Escape key", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("/");

			await page.waitForSelector('[data-testid="slash-commands"]');
			await page.keyboard.press("Escape");

			// Verify slash menu is closed
			await expect(page.locator('[data-testid="slash-commands"]')).toBeHidden();

			// Verify the '/' character is removed
			await expect(page.locator(".ProseMirror")).not.toContainText("/");
		});
	});

	test.describe("Text Formatting Shortcuts", () => {
		test("should apply bold formatting with Cmd+B", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Hello World");

			// Select the text
			await page.keyboard.press("Control+a");

			// Apply bold formatting
			await page.keyboard.press("Control+b");

			// Verify bold is applied
			await expect(page.locator(".ProseMirror strong")).toContainText(
				"Hello World",
			);
		});

		test("should apply italic formatting with Cmd+I", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Hello World");

			// Select the text
			await page.keyboard.press("Control+a");

			// Apply italic formatting
			await page.keyboard.press("Control+i");

			// Verify italic is applied
			await expect(page.locator(".ProseMirror em")).toContainText(
				"Hello World",
			);
		});

		test("should apply code formatting with Cmd+E", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("console.log");

			// Select the text
			await page.keyboard.press("Control+a");

			// Apply code formatting
			await page.keyboard.press("Control+e");

			// Verify code is applied
			await expect(page.locator(".ProseMirror code")).toContainText(
				"console.log",
			);
		});

		test("should apply strikethrough with Cmd+Shift+S", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("strikethrough text");

			// Select the text
			await page.keyboard.press("Control+a");

			// Apply strikethrough formatting
			await page.keyboard.press("Control+Shift+s");

			// Verify strikethrough is applied
			await expect(page.locator(".ProseMirror s")).toContainText(
				"strikethrough text",
			);
		});
	});

	test.describe("Heading Shortcuts", () => {
		test("should create Heading 1 with Cmd+Alt+1", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Main Heading");

			// Select the text
			await page.keyboard.press("Control+a");

			// Apply Heading 1
			await page.keyboard.press("Control+Alt+Digit1");

			// Verify H1 is applied
			await expect(page.locator(".ProseMirror h1")).toContainText(
				"Main Heading",
			);
		});

		test("should create Heading 2 with Cmd+Alt+2", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Sub Heading");

			// Select the text
			await page.keyboard.press("Control+a");

			// Apply Heading 2
			await page.keyboard.press("Control+Alt+Digit2");

			// Verify H2 is applied
			await expect(page.locator(".ProseMirror h2")).toContainText(
				"Sub Heading",
			);
		});

		test("should create Heading 3 with Cmd+Alt+3", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Minor Heading");

			// Select the text
			await page.keyboard.press("Control+a");

			// Apply Heading 3
			await page.keyboard.press("Control+Alt+Digit3");

			// Verify H3 is applied
			await expect(page.locator(".ProseMirror h3")).toContainText(
				"Minor Heading",
			);
		});
	});

	test.describe("List Shortcuts", () => {
		test("should create bullet list with Cmd+Shift+8", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("First item");

			// Create bullet list
			await page.keyboard.press("Control+Shift+Digit8");

			// Verify bullet list is created
			await expect(page.locator(".ProseMirror ul li")).toContainText(
				"First item",
			);
		});

		test("should create numbered list with Cmd+Shift+7", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("First item");

			// Create numbered list
			await page.keyboard.press("Control+Shift+Digit7");

			// Verify numbered list is created
			await expect(page.locator(".ProseMirror ol li")).toContainText(
				"First item",
			);
		});

		test("should indent list item with Tab", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("First item");
			await page.keyboard.press("Control+Shift+Digit8");
			await page.keyboard.press("Enter");
			await page.keyboard.type("Second item");

			// Indent the second item
			await page.keyboard.press("Tab");

			// Verify nested list structure
			await expect(page.locator(".ProseMirror ul ul li")).toContainText(
				"Second item",
			);
		});

		test("should outdent list item with Shift+Tab", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("First item");
			await page.keyboard.press("Control+Shift+Digit8");
			await page.keyboard.press("Enter");
			await page.keyboard.type("Second item");
			await page.keyboard.press("Tab"); // Indent

			// Outdent the second item
			await page.keyboard.press("Shift+Tab");

			// Verify item is back at root level
			await expect(page.locator(".ProseMirror > ul > li")).toHaveCount(2);
		});
	});

	test.describe("Code Block Shortcuts", () => {
		test("should create code block with Ctrl+Alt+C", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.press("Control+Alt+c");

			// Verify code block is created
			await expect(page.locator(".monaco-code-block")).toBeVisible();
		});

		test("should exit code block with Escape", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.press("Control+Alt+c");

			// Wait for Monaco to load
			await page.waitForSelector(".monaco-editor", { state: "visible" });

			// Type some code
			await page.keyboard.type('console.log("Hello");');

			// Press Escape to exit
			await page.keyboard.press("Escape");

			// Verify focus returns to main editor
			await expect(page.locator(".ProseMirror")).toBeFocused();
		});
	});

	test.describe("Undo/Redo", () => {
		test("should undo with Cmd+Z", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Hello World");

			// Undo the typing
			await page.keyboard.press("Control+z");

			// Verify text is removed
			await expect(page.locator(".ProseMirror")).not.toContainText(
				"Hello World",
			);
		});

		test("should redo with Cmd+Shift+Z", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Hello World");
			await page.keyboard.press("Control+z"); // Undo

			// Redo the typing
			await page.keyboard.press("Control+Shift+z");

			// Verify text is restored
			await expect(page.locator(".ProseMirror")).toContainText("Hello World");
		});
	});

	test.describe("Selection and Navigation", () => {
		test("should select all with Cmd+A", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Hello World\nSecond Line");

			// Select all content
			await page.keyboard.press("Control+a");

			// Apply formatting to verify selection
			await page.keyboard.press("Control+b");

			// Verify all text is bold
			await expect(page.locator(".ProseMirror strong")).toContainText(
				"Hello World",
			);
			await expect(page.locator(".ProseMirror strong")).toContainText(
				"Second Line",
			);
		});

		test("should move by word with Ctrl+Arrow", async ({ page }) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Hello beautiful world");

			// Move to beginning
			await page.keyboard.press("Control+Home");

			// Move by word
			await page.keyboard.press("Control+ArrowRight");
			await page.keyboard.press("Control+ArrowRight");

			// Select current word
			await page.keyboard.press("Control+Shift+ArrowRight");

			// Apply formatting to verify position
			await page.keyboard.press("Control+b");

			// Verify only 'world' is bold
			await expect(page.locator(".ProseMirror strong")).toContainText("world");
			await expect(page.locator(".ProseMirror strong")).not.toContainText(
				"Hello",
			);
		});
	});

	test.describe("BubbleToolbar Keyboard Navigation", () => {
		test("should show bubble toolbar when text is selected", async ({
			page,
		}) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Select this text");

			// Select the text
			await page.keyboard.press("Control+a");

			// Wait for bubble toolbar to appear
			await expect(page.locator(".bubble-toolbar")).toBeVisible();

			// Verify toolbar buttons are present
			await expect(
				page.locator('.bubble-toolbar-button[title="Bold"]'),
			).toBeVisible();
			await expect(
				page.locator('.bubble-toolbar-button[title="Italic"]'),
			).toBeVisible();
		});

		test("should hide bubble toolbar when selection is cleared", async ({
			page,
		}) => {
			await page.click(".ProseMirror");
			await page.keyboard.type("Select this text");
			await page.keyboard.press("Control+a");

			// Wait for bubble toolbar to appear
			await expect(page.locator(".bubble-toolbar")).toBeVisible();

			// Click elsewhere to clear selection
			await page.keyboard.press("ArrowRight");

			// Verify bubble toolbar is hidden
			await expect(page.locator(".bubble-toolbar")).toBeHidden();
		});
	});
});
