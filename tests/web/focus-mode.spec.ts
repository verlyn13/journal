import { test, expect } from '@playwright/test';

test.describe('Focus Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should have focus toggle button visible', async ({ page }) => {
    // Look for focus toggle button
    const focusToggle = page.locator('button:has-text("Focus")');
    await expect(focusToggle).toBeVisible();
  });

  test('should toggle focus mode on button click', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    const focusContainer = page.locator('[data-focus]');
    
    // Initially should be off
    await expect(focusContainer).toHaveAttribute('data-focus', 'off');
    await expect(focusToggle).toHaveAttribute('aria-pressed', 'false');
    
    // Click to enable focus mode
    await focusToggle.click();
    
    await expect(focusContainer).toHaveAttribute('data-focus', 'on');
    await expect(focusToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(focusToggle).toContainText('Exit Focus');
    
    // Click to disable focus mode
    await focusToggle.click();
    
    await expect(focusContainer).toHaveAttribute('data-focus', 'off');
    await expect(focusToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(focusToggle).toContainText('Focus');
  });

  test('should toggle focus mode with F key', async ({ page }) => {
    const focusContainer = page.locator('[data-focus]');
    
    // Initially should be off
    await expect(focusContainer).toHaveAttribute('data-focus', 'off');
    
    // Press F key to enable focus mode
    await page.keyboard.press('f');
    
    await expect(focusContainer).toHaveAttribute('data-focus', 'on');
    
    // Press F key again to disable
    await page.keyboard.press('f');
    
    await expect(focusContainer).toHaveAttribute('data-focus', 'off');
  });

  test('should not trigger F key when typing in editor', async ({ page }) => {
    const editor = page.locator('.tiptap');
    const focusContainer = page.locator('[data-focus]');
    
    // Click in editor to focus
    await editor.click();
    
    // Type 'f' - should not trigger focus mode
    await page.keyboard.type('f');
    
    // Focus mode should still be off
    await expect(focusContainer).toHaveAttribute('data-focus', 'off');
    
    // Content should contain the typed 'f'
    await expect(editor).toContainText('f');
  });

  test('should persist focus mode state in localStorage', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    const focusContainer = page.locator('[data-focus]');
    
    // Enable focus mode
    await focusToggle.click();
    await expect(focusContainer).toHaveAttribute('data-focus', 'on');
    
    // Check localStorage
    const storedValue = await page.evaluate(() => localStorage.getItem('journal:focus'));
    expect(storedValue).toBe('on');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Focus mode should still be enabled
    const reloadedContainer = page.locator('[data-focus]');
    await expect(reloadedContainer).toHaveAttribute('data-focus', 'on');
    
    const reloadedToggle = page.locator('button:has-text("Exit Focus")');
    await expect(reloadedToggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('should apply 70ch width limit in focus mode', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    const focusContainer = page.locator('[data-focus]');
    
    // Get initial width
    const initialBounds = await focusContainer.boundingBox();
    
    // Enable focus mode
    await focusToggle.click();
    await expect(focusContainer).toHaveAttribute('data-focus', 'on');
    
    // Wait for transition
    await page.waitForTimeout(350); // Slightly longer than CSS transition
    
    // Check that width constraint is applied
    const focusedBounds = await focusContainer.boundingBox();
    
    // In focus mode, the container should have max-width applied
    // This is approximate since exact pixel calculation depends on font size
    expect(focusedBounds?.width).toBeLessThan(initialBounds?.width || Infinity);
    
    // Check CSS max-width is applied
    const maxWidth = await focusContainer.evaluate((el) => 
      window.getComputedStyle(el).maxWidth
    );
    
    // Should have 70ch max-width (exact value depends on font)
    expect(maxWidth).toMatch(/\d+px/);
    expect(maxWidth).not.toBe('none');
  });

  test('should show calm background in focus mode', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    const calmBackground = page.locator('[aria-hidden="true"]').first();
    
    // Initially, calm background should be invisible
    const initialOpacity = await calmBackground.evaluate((el) => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(initialOpacity)).toBe(0);
    
    // Enable focus mode
    await focusToggle.click();
    
    // Wait for transition
    await page.waitForTimeout(300);
    
    // Calm background should be visible
    const focusedOpacity = await calmBackground.evaluate((el) => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(focusedOpacity)).toBe(1);
  });

  test('should have smooth transitions', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    const focusContainer = page.locator('[data-focus]');
    
    // Check transition property is set
    const transition = await focusContainer.evaluate((el) => 
      window.getComputedStyle(el).transition
    );
    
    // Should have transition defined (exact values may vary)
    expect(transition).toContain('all');
    expect(transition).toContain('0.3s');
    expect(transition).toContain('cubic-bezier');
    
    // Test actual transition timing
    const startTime = Date.now();
    await focusToggle.click();
    
    // Wait for transition to complete
    await page.waitForTimeout(350);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time (300ms + buffer)
    expect(duration).toBeGreaterThan(300);
    expect(duration).toBeLessThan(500);
  });

  test('should work with keyboard modifiers disabled', async ({ page }) => {
    const focusContainer = page.locator('[data-focus]');
    
    // Test various key combinations that should NOT trigger focus mode
    await page.keyboard.press('Control+f');
    await expect(focusContainer).toHaveAttribute('data-focus', 'off');
    
    await page.keyboard.press('Meta+f');  // Cmd+f on Mac
    await expect(focusContainer).toHaveAttribute('data-focus', 'off');
    
    await page.keyboard.press('Alt+f');
    await expect(focusContainer).toHaveAttribute('data-focus', 'off');
    
    await page.keyboard.press('Shift+f');
    await expect(focusContainer).toHaveAttribute('data-focus', 'off');
    
    // But plain 'f' should work
    await page.keyboard.press('f');
    await expect(focusContainer).toHaveAttribute('data-focus', 'on');
  });

  test('should handle rapid toggling', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    const focusContainer = page.locator('[data-focus]');
    
    // Rapidly toggle focus mode
    for (let i = 0; i < 5; i++) {
      await focusToggle.click();
      await page.waitForTimeout(50); // Small delay between clicks
    }
    
    // Should end in focused state (odd number of clicks)
    await expect(focusContainer).toHaveAttribute('data-focus', 'on');
    
    // State should be stable
    await page.waitForTimeout(100);
    await expect(focusContainer).toHaveAttribute('data-focus', 'on');
  });

  test('should maintain editor functionality in focus mode', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    const editor = page.locator('.tiptap');
    
    // Enable focus mode
    await focusToggle.click();
    
    // Editor should still be functional
    await editor.click();
    await page.keyboard.type('Testing focus mode editing');
    
    await expect(editor).toContainText('Testing focus mode editing');
    
    // Formatting should work
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+b');
    
    // Check for bold formatting
    await expect(editor.locator('strong')).toBeVisible();
  });
});

test.describe('Focus Mode - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should work on mobile viewport', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    const focusContainer = page.locator('[data-focus]');
    
    // Should be visible on mobile
    await expect(focusToggle).toBeVisible();
    
    // Should toggle correctly
    await focusToggle.click();
    await expect(focusContainer).toHaveAttribute('data-focus', 'on');
    
    // Width constraint should still apply appropriately
    const bounds = await focusContainer.boundingBox();
    expect(bounds?.width).toBeLessThan(375); // Should be constrained within mobile viewport
  });

  test('should handle touch interactions', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    const focusContainer = page.locator('[data-focus]');
    
    // Simulate touch tap
    await focusToggle.tap();
    
    await expect(focusContainer).toHaveAttribute('data-focus', 'on');
  });
});

test.describe('Focus Mode - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    
    // Should have aria-pressed attribute
    await expect(focusToggle).toHaveAttribute('aria-pressed', 'false');
    
    // Should have title for tooltip
    await expect(focusToggle).toHaveAttribute('title');
    
    // Click and check updated ARIA
    await focusToggle.click();
    await expect(focusToggle).toHaveAttribute('aria-pressed', 'true');
    
    const title = await focusToggle.getAttribute('title');
    expect(title).toContain('Exit');
  });

  test('should be keyboard accessible', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    
    // Should be focusable
    await focusToggle.focus();
    await expect(focusToggle).toBeFocused();
    
    // Should activate with Enter
    await page.keyboard.press('Enter');
    
    const focusContainer = page.locator('[data-focus]');
    await expect(focusContainer).toHaveAttribute('data-focus', 'on');
    
    // Should activate with Space
    await page.keyboard.press(' ');
    await expect(focusContainer).toHaveAttribute('data-focus', 'off');
  });

  test('should have visible focus indicators', async ({ page }) => {
    const focusToggle = page.locator('button:has-text("Focus")');
    
    await focusToggle.focus();
    
    // Check for focus outline
    const outline = await focusToggle.evaluate((el) => 
      window.getComputedStyle(el).outline
    );
    
    // Should have some kind of focus indicator
    expect(outline).not.toBe('none');
  });
});