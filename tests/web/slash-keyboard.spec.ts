import { test, expect } from '@playwright/test';

test('slash menu keyboard navigation and enter selection', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('[contenteditable="true"]');
  await editor.click();
  await editor.type('/');
  const menu = page.locator('.slash-menu');
  await expect(menu).toBeVisible();
  // Move down twice and hit Enter
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  // A block (code or math) should appear after selection
  await expect(page.locator('[data-code-block-monaco], [data-math-block]')).toBeVisible();
});
