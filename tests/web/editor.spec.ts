import { test, expect } from '@playwright/test';

test.describe('React Editor (Vite)', () => {
  test('loads and renders inline math after typing $$...$$', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#react-editor-root')).toBeVisible();
    const editor = page.locator('[contenteditable="true"]');
    await editor.click();
    await editor.type(' $$e^{i\\pi}+1=0$$ ');
    await expect(page.locator('span.katex')).toBeVisible({ timeout: 3000 });
  });

  test('lazy-loads Monaco when requested', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Load Code Tools')).toBeVisible();
    await page.getByText('Load Code Tools').click();
    await expect(page.getByText('(Monaco ready)')).toBeVisible();
  });
});
