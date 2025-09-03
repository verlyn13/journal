import { test, expect } from '@playwright/test';

test.describe('Slash menu', () => {
  test('opens and inserts code block', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('[contenteditable="true"]');
    await editor.click();
    await editor.type('/');
    await expect(page.locator('.slash-menu')).toBeVisible();
    await page.locator('.slash-menu li', { hasText: 'Code block' }).click();
    await expect(page.locator('[data-code-block-monaco]')).toBeVisible();
  });
});
