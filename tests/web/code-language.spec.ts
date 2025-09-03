import { test, expect } from '@playwright/test';

test('code block language switching updates status and attribute', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('[contenteditable="true"]');
  await editor.click();
  await editor.type('/');
  await page.locator('.slash-menu li', { hasText: 'Code block' }).click();
  const block = page.locator('[data-code-block-monaco]');
  await expect(block).toBeVisible();
  const select = page.locator('.monaco-language-select');
  await expect(select).toBeVisible();
  await select.selectOption('python');
  await expect(page.locator('.monaco-status')).toContainText('lines');
});
