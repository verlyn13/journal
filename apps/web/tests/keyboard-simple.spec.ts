import { expect, test } from "@playwright/test";

test.describe("Basic Keyboard Interactions", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");
		await page.waitForSelector('[data-testid="sidebar"]', { state: "visible" });

		// Find and focus the editor
		await page.waitForSelector(".ProseMirror", { state: "visible" });

		// Clear existing content and focus the editor
		await page.click(".ProseMirror");
		await page.keyboard.press("Control+a");
		await page.keyboard.press("Delete");
	});

	test("should type text in editor", async ({ page }) => {
		await page.keyboard.type("Hello World");

		const editorContent = await page.locator(".ProseMirror").textContent();
		expect(editorContent).toContain("Hello World");
	});

	test("should apply bold formatting", async ({ page }) => {
		await page.keyboard.type("Bold Text");
		await page.keyboard.press("Control+a");
		await page.keyboard.press("Control+b");

		// Check if the new bold element contains our text
		const boldElements = await page.locator(".ProseMirror strong").all();
		let found = false;
		for (const element of boldElements) {
			const text = await element.textContent();
			if (text?.includes("Bold Text")) {
				found = true;
				break;
			}
		}
		expect(found).toBe(true);
	});

	test("should handle undo operation", async ({ page }) => {
		await page.keyboard.type("Test Text");

		// Verify text exists
		let content = await page.locator(".ProseMirror").textContent();
		expect(content).toContain("Test Text");

		// Undo
		await page.keyboard.press("Control+z");

		// Verify text is removed
		content = await page.locator(".ProseMirror").textContent();
		expect(content).not.toContain("Test Text");
	});

	test("should focus mode toggle with F key", async ({ page }) => {
		// Initial state check
		await expect(page.getByTestId("sidebar")).toBeVisible();

		// Click somewhere outside the editor to remove focus from contenteditable
		await page.click("body");

		// Press F to toggle focus mode
		await page.keyboard.press("f");
		await page.waitForTimeout(500);

		// Check if sidebar has hidden class
		const sidebar = page.getByTestId("sidebar");
		const classes = await sidebar.getAttribute("class");
		expect(classes).toContain("hidden");

		// Press F again to toggle back
		await page.keyboard.press("f");
		await page.waitForTimeout(500);

		// Verify sidebar is visible again
		await expect(page.getByTestId("sidebar")).toBeVisible();
	});
});
