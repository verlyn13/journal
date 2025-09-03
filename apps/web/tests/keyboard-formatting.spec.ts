import { expect, test } from "@playwright/test";

test.describe("Text Formatting Keyboard Shortcuts", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");

		// Wait for the page to be ready
		await page.waitForLoadState("domcontentloaded");

		// Wait for the sidebar to be visible (indicating app is loaded)
		await page.waitForSelector('[data-testid="sidebar"]', { state: "visible" });

		// Click on the editor area to focus it
		// Look for the ProseMirror editor
		await page.waitForSelector(".ProseMirror", { state: "visible" });
		await page.click(".ProseMirror");
	});

	test("should apply bold formatting with Ctrl+B", async ({ page }) => {
		// Type some text
		await page.keyboard.type("Hello World");

		// Select all the text
		await page.keyboard.press("Control+a");

		// Apply bold formatting
		await page.keyboard.press("Control+b");

		// Check if bold formatting is applied
		const boldElement = page.locator(".ProseMirror strong");
		await expect(boldElement).toContainText("Hello World");
	});

	test("should apply italic formatting with Ctrl+I", async ({ page }) => {
		// Type some text
		await page.keyboard.type("Hello World");

		// Select all the text
		await page.keyboard.press("Control+a");

		// Apply italic formatting
		await page.keyboard.press("Control+i");

		// Check if italic formatting is applied
		const italicElement = page.locator(".ProseMirror em");
		await expect(italicElement).toContainText("Hello World");
	});

	test("should apply code formatting with Ctrl+E", async ({ page }) => {
		// Type some text
		await page.keyboard.type("console.log");

		// Select all the text
		await page.keyboard.press("Control+a");

		// Apply code formatting
		await page.keyboard.press("Control+e");

		// Check if code formatting is applied
		const codeElement = page.locator(".ProseMirror code");
		await expect(codeElement).toContainText("console.log");
	});

	test("should create heading with Ctrl+Alt+1", async ({ page }) => {
		// Type some text
		await page.keyboard.type("Main Heading");

		// Select all the text
		await page.keyboard.press("Control+a");

		// Apply Heading 1
		await page.keyboard.press("Control+Alt+Digit1");

		// Check if H1 is applied
		const headingElement = page.locator(".ProseMirror h1");
		await expect(headingElement).toContainText("Main Heading");
	});

	test("should create bullet list with Ctrl+Shift+8", async ({ page }) => {
		// Type some text
		await page.keyboard.type("First item");

		// Create bullet list
		await page.keyboard.press("Control+Shift+Digit8");

		// Check if bullet list is created
		const listItem = page.locator(".ProseMirror ul li");
		await expect(listItem).toContainText("First item");
	});

	test("should handle undo with Ctrl+Z", async ({ page }) => {
		// Type some text
		await page.keyboard.type("Hello World");

		// Undo the typing
		await page.keyboard.press("Control+z");

		// Check if text is removed
		const proseMirror = page.locator(".ProseMirror");
		await expect(proseMirror).not.toContainText("Hello World");
	});

	test("should handle redo with Ctrl+Shift+Z", async ({ page }) => {
		// Type some text
		await page.keyboard.type("Hello World");

		// Undo
		await page.keyboard.press("Control+z");

		// Redo
		await page.keyboard.press("Control+Shift+z");

		// Check if text is restored
		const proseMirror = page.locator(".ProseMirror");
		await expect(proseMirror).toContainText("Hello World");
	});
});
