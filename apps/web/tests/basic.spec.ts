import { expect, test } from "@playwright/test";

test.describe("Basic Navigation", () => {
	test("should load the application", async ({ page }) => {
		await page.goto("/");

		// Wait for the page to be ready
		await page.waitForLoadState("domcontentloaded");

		// Check if main editor container exists
		await expect(page.locator("body")).toBeVisible();

		// Look for the Journal App content
		const sidebar = page.getByTestId("sidebar");
		await expect(sidebar).toBeVisible();
	});
});
