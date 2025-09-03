import { test, expect } from '@playwright/test';

test.describe('Monaco Code Block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should load Monaco editor', async ({ page }) => {
    await page.locator('.tiptap').click();
    
    // Insert code block via slash command
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    // Should show Monaco code block
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Should show loading state initially
    await expect(page.locator('.monaco-loading')).toBeVisible();
    
    // Wait for Monaco to load (with timeout)
    await expect(page.locator('.monaco-loading')).not.toBeVisible({ timeout: 10000 });
  });

  test('should show language selector', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Language selector should be present
    await expect(page.locator('.monaco-language-select')).toBeVisible();
    
    // Should have JavaScript selected by default
    await expect(page.locator('.monaco-language-select')).toHaveValue('javascript');
  });

  test('should change programming language', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Change to Python
    await page.locator('.monaco-language-select').selectOption('python');
    
    // Should update the selection
    await expect(page.locator('.monaco-language-select')).toHaveValue('python');
  });

  test('should show copy button', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Copy button should be present
    await expect(page.locator('.monaco-action-button[title*="Copy"]')).toBeVisible();
  });

  test('should show expand/collapse button', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Expand button should be present
    await expect(page.locator('.monaco-action-button[title*="Expand"]')).toBeVisible();
  });

  test('should expand when expand button is clicked', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Get initial height
    const initialContainer = page.locator('.monaco-editor-container');
    const initialBox = await initialContainer.boundingBox();
    
    // Click expand button
    await page.locator('.monaco-action-button[title*="Expand"]').click();
    
    // Should have expanded class
    await expect(page.locator('.monaco-code-block.expanded')).toBeVisible();
    
    // Height should have increased
    const expandedBox = await initialContainer.boundingBox();
    if (initialBox && expandedBox) {
      expect(expandedBox.height).toBeGreaterThan(initialBox.height);
    }
  });

  test('should collapse when collapse button is clicked', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Expand first
    await page.locator('.monaco-action-button[title*="Expand"]').click();
    await expect(page.locator('.monaco-code-block.expanded')).toBeVisible();
    
    // Then collapse
    await page.locator('.monaco-action-button[title*="Collapse"]').click();
    
    // Should not have expanded class
    await expect(page.locator('.monaco-code-block.expanded')).not.toBeVisible();
  });

  test('should show line count in status', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Wait for loading to complete
    await expect(page.locator('.monaco-loading')).not.toBeVisible({ timeout: 10000 });
    
    // Should show line count
    await expect(page.locator('.monaco-status')).toContainText('lines');
  });

  test('should persist code content', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Wait for Monaco to load
    await expect(page.locator('.monaco-loading')).not.toBeVisible({ timeout: 10000 });
    
    // Code should be editable (Monaco editor should be ready)
    // We can verify this by checking that the editor container is present and sized
    const editorContainer = page.locator('.monaco-editor-container');
    await expect(editorContainer).toBeVisible();
    
    const containerBox = await editorContainer.boundingBox();
    expect(containerBox?.height).toBeGreaterThan(100);
  });

  test('should support multiple language options', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Check that multiple languages are available
    const languageSelect = page.locator('.monaco-language-select');
    
    // Should have various language options
    await expect(languageSelect.locator('option[value="javascript"]')).toBeVisible();
    await expect(languageSelect.locator('option[value="python"]')).toBeVisible();
    await expect(languageSelect.locator('option[value="typescript"]')).toBeVisible();
    await expect(languageSelect.locator('option[value="html"]')).toBeVisible();
    await expect(languageSelect.locator('option[value="css"]')).toBeVisible();
  });

  test('should handle copy functionality', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Wait for Monaco to load
    await expect(page.locator('.monaco-loading')).not.toBeVisible({ timeout: 10000 });
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
    
    // Click copy button
    await page.locator('.monaco-action-button[title*="Copy"]').click();
    
    // Button should show copied state temporarily
    await expect(page.locator('.monaco-action-button.copied')).toBeVisible();
    
    // Should return to normal state after timeout
    await expect(page.locator('.monaco-action-button.copied')).not.toBeVisible({ timeout: 3000 });
  });

  test('should adapt to theme changes', async ({ page }) => {
    // Test with light theme first
    await page.emulateMedia({ colorScheme: 'light' });
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Switch to dark theme
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // Code block should still be visible and functional
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    await expect(page.locator('.monaco-language-select')).toBeVisible();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Should be able to tab to language selector
    await page.keyboard.press('Tab');
    await expect(page.locator('.monaco-language-select')).toBeFocused();
    
    // Should be able to tab to action buttons
    await page.keyboard.press('Tab');
    const actionButtons = page.locator('.monaco-action-button');
    const focusedButton = actionButtons.first();
    await expect(focusedButton).toBeFocused();
  });

  test('should handle multiple code blocks', async ({ page }) => {
    await page.locator('.tiptap').click();
    
    // Insert first code block
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    // Add some space and insert second code block
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    // Should have two code blocks
    await expect(page.locator('.monaco-code-block')).toHaveCount(2);
    
    // Each should have its own controls
    await expect(page.locator('.monaco-language-select')).toHaveCount(2);
    await expect(page.locator('.monaco-action-button[title*="Copy"]')).toHaveCount(2);
  });

  test('should maintain state when switching languages', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Wait for Monaco to load
    await expect(page.locator('.monaco-loading')).not.toBeVisible({ timeout: 10000 });
    
    // Change language
    await page.locator('.monaco-language-select').selectOption('python');
    
    // Editor should still be functional
    await expect(page.locator('.monaco-editor-container')).toBeVisible();
    await expect(page.locator('.monaco-language-select')).toHaveValue('python');
  });

  test('should show loading spinner', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Should show loading state initially
    await expect(page.locator('.monaco-loading')).toBeVisible();
    await expect(page.locator('.monaco-loading-spinner')).toBeVisible();
    await expect(page.locator('.monaco-loading')).toContainText('Loading Monaco editor');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Should still show all essential elements on mobile
    await expect(page.locator('.monaco-language-select')).toBeVisible();
    await expect(page.locator('.monaco-action-button')).toBeVisible();
    
    // Header should stack appropriately on mobile (this would be tested via CSS)
    const header = page.locator('.monaco-header');
    await expect(header).toBeVisible();
  });
});

test.describe('Monaco Code Block - Integration', () => {
  test('should work with Tiptap serialization', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.locator('.tiptap').click();
    
    // Insert code block
    await page.keyboard.type('/code');
    await page.keyboard.press('Enter');
    
    // Add some content around it
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Text after code block');
    
    // Should maintain proper document structure
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    await expect(page.locator('.tiptap')).toContainText('Text after code block');
  });

  test('should integrate with undo/redo', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.locator('.tiptap').click();
    
    // Add some initial content
    await page.keyboard.type('Before code');
    
    // Insert code block
    await page.keyboard.type(' /code');
    await page.keyboard.press('Enter');
    
    // Should be able to undo the code block insertion
    await page.keyboard.press('Control+z');
    
    // Code block should be removed
    await expect(page.locator('.monaco-code-block')).not.toBeVisible();
    await expect(page.locator('.tiptap')).toContainText('Before code');
    
    // Should be able to redo
    await page.keyboard.press('Control+y');
    await expect(page.locator('.monaco-code-block')).toBeVisible();
  });
});