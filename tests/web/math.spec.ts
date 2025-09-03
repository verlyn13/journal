import { test, expect } from '@playwright/test';

test('block math renders with KaTeX', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('[contenteditable="true"]');
  await editor.click();
  await editor.type('$$$\\int_0^1 x^2 dx$$$');
  await expect(page.locator('div[data-math-block] .katex-display')).toBeVisible({ timeout: 3000 });
});
