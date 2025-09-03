import { expect, test } from "@playwright/test";

test.describe("Focus Mode Keyboard Interactions", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");

		// Wait for the page to be ready
		await page.waitForLoadState("domcontentloaded");

		// Wait for the sidebar to be visible (indicating app is loaded)
		await page.waitForSelector('[data-testid="sidebar"]', { state: "visible" });
	});

	test("should toggle Focus Mode with F key", async ({ page }) => {
		// Verify initial state (not in focus mode)
		await expect(page.getByTestId("sidebar")).toBeVisible();
		await expect(page.getByTestId("entry-list")).toBeVisible();

		// Focus on the page to ensure keyboard events are captured
		await page.keyboard.press("Tab");

		// Press F to toggle focus mode
		await page.keyboard.press("f");

		// Wait a moment for the transition
		await page.waitForTimeout(500);

		// In focus mode, sidebar and entry list should be hidden
		// Note: They might still exist in DOM but be hidden via CSS
		const sidebar = page.getByTestId("sidebar");
		const entryList = page.getByTestId("entry-list");

		// Check if they have 'hidden' class or are not visible
		const sidebarClasses = await sidebar.getAttribute("class");
		const entryListClasses = await entryList.getAttribute("class");

		expect(sidebarClasses).toContain("hidden");
		expect(entryListClasses).toContain("hidden");

		// Press F again to toggle back
		await page.keyboard.press("f");

		// Wait a moment for the transition
		await page.waitForTimeout(500);

		// Verify focus mode is disabled
		await expect(page.getByTestId("sidebar")).toBeVisible();
		await expect(page.getByTestId("entry-list")).toBeVisible();
	});

	test("should persist focus mode state in localStorage", async ({ page }) => {
		// Focus on the page
		await page.keyboard.press("Tab");

		// Enable focus mode
		await page.keyboard.press("f");

		// Wait for the change to be applied
		await page.waitForTimeout(500);

		// Verify localStorage has the focus mode setting
		const focusModeState = await page.evaluate(() => {
			return localStorage.getItem("journal:focus");
		});

		expect(focusModeState).toBe("on");

		// Reload the page
		await page.reload();
		await page.waitForLoadState("domcontentloaded");
		await page.waitForSelector('[data-testid="sidebar"]', {
			state: "attached",
		});

		// Wait for app to initialize and read localStorage
		await page.waitForTimeout(1000);

		// Verify focus mode is still active after reload
		const sidebar = page.getByTestId("sidebar");
		const sidebarClasses = await sidebar.getAttribute("class");
		expect(sidebarClasses).toContain("hidden");
	});
});
