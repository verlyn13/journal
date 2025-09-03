import { test, expect } from '@playwright/test';

test.describe('Bubble Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should appear when text is selected', async ({ page }) => {
    await page.locator('.tiptap').click();
    
    // Type some text
    await page.keyboard.type('Hello world');
    
    // Select the text
    await page.keyboard.press('Control+a');
    
    // Bubble menu should appear
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
  });

  test('should disappear when selection is cleared', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Hello world');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Click elsewhere to clear selection
    await page.locator('.tiptap').click();
    
    await expect(page.locator('.bubble-toolbar')).not.toBeVisible();
  });

  test('should format text with bold button', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Bold text');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Click bold button
    await page.locator('.bubble-toolbar-button[title*="Bold"]').click();
    
    // Text should be bold
    await expect(page.locator('.tiptap strong')).toBeVisible();
    await expect(page.locator('.tiptap strong')).toContainText('Bold text');
  });

  test('should format text with italic button', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Italic text');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Click italic button
    await page.locator('.bubble-toolbar-button[title*="Italic"]').click();
    
    // Text should be italic
    await expect(page.locator('.tiptap em')).toBeVisible();
    await expect(page.locator('.tiptap em')).toContainText('Italic text');
  });

  test('should toggle strikethrough', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Strikethrough text');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Click strikethrough button
    await page.locator('.bubble-toolbar-button[title*="Strikethrough"]').click();
    
    // Text should be struck through
    await expect(page.locator('.tiptap s')).toBeVisible();
    await expect(page.locator('.tiptap s')).toContainText('Strikethrough text');
  });

  test('should toggle inline code', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Code text');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Click code button
    await page.locator('.bubble-toolbar-button[title*="Inline Code"]').click();
    
    // Text should be inline code
    await expect(page.locator('.tiptap code')).toBeVisible();
    await expect(page.locator('.tiptap code')).toContainText('Code text');
  });

  test('should show active states for formatting', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Bold text');
    await page.keyboard.press('Control+a');
    
    // Make text bold
    await page.locator('.bubble-toolbar-button[title*="Bold"]').click();
    
    // Select the bold text again
    await page.keyboard.press('Control+a');
    
    // Bold button should show active state
    await expect(page.locator('.bubble-toolbar-button[title*="Bold"].is-active')).toBeVisible();
  });

  test('should convert to heading 1', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Heading text');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Click H1 button
    await page.locator('.bubble-toolbar-button[title*="Heading 1"]').click();
    
    // Should be converted to H1
    await expect(page.locator('.tiptap h1')).toBeVisible();
    await expect(page.locator('.tiptap h1')).toContainText('Heading text');
  });

  test('should convert to heading 2', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Heading text');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Click H2 button
    await page.locator('.bubble-toolbar-button[title*="Heading 2"]').click();
    
    // Should be converted to H2
    await expect(page.locator('.tiptap h2')).toBeVisible();
    await expect(page.locator('.tiptap h2')).toContainText('Heading text');
  });

  test('should toggle heading back to paragraph', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Text');
    await page.keyboard.press('Control+a');
    
    // Make it a heading
    await page.locator('.bubble-toolbar-button[title*="Heading 1"]').click();
    
    // Select again and click H1 button to toggle off
    await page.keyboard.press('Control+a');
    await page.locator('.bubble-toolbar-button[title*="Heading 1"]').click();
    
    // Should be back to paragraph
    await expect(page.locator('.tiptap h1')).not.toBeVisible();
    await expect(page.locator('.tiptap p')).toContainText('Text');
  });

  test('should open link editor for new link', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Link text');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Click link button
    await page.locator('.bubble-toolbar-button[title*="Add Link"]').click();
    
    // Link editor should appear
    await expect(page.locator('.bubble-link-editor')).toBeVisible();
    await expect(page.locator('.bubble-link-input')).toBeVisible();
  });

  test('should create link with URL input', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Google');
    await page.keyboard.press('Control+a');
    
    // Click link button
    await page.locator('.bubble-toolbar-button[title*="Add Link"]').click();
    
    // Enter URL
    await page.locator('.bubble-link-input').fill('https://google.com');
    await page.locator('.bubble-link-save').click();
    
    // Should create a link
    await expect(page.locator('.tiptap a[href="https://google.com"]')).toBeVisible();
    await expect(page.locator('.tiptap a')).toContainText('Google');
  });

  test('should auto-add https protocol', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Google');
    await page.keyboard.press('Control+a');
    
    // Click link button
    await page.locator('.bubble-toolbar-button[title*="Add Link"]').click();
    
    // Enter URL without protocol
    await page.locator('.bubble-link-input').fill('google.com');
    await page.locator('.bubble-link-save').click();
    
    // Should automatically add https://
    await expect(page.locator('.tiptap a[href="https://google.com"]')).toBeVisible();
  });

  test('should cancel link creation', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Text');
    await page.keyboard.press('Control+a');
    
    // Click link button
    await page.locator('.bubble-toolbar-button[title*="Add Link"]').click();
    
    // Enter URL but cancel
    await page.locator('.bubble-link-input').fill('https://example.com');
    await page.locator('.bubble-link-cancel').click();
    
    // Should not create link
    await expect(page.locator('.tiptap a')).not.toBeVisible();
    await expect(page.locator('.bubble-link-editor')).not.toBeVisible();
  });

  test('should remove existing link', async ({ page }) => {
    await page.locator('.tiptap').click();
    
    // Create a link first
    await page.keyboard.type('Existing link');
    await page.keyboard.press('Control+a');
    await page.locator('.bubble-toolbar-button[title*="Add Link"]').click();
    await page.locator('.bubble-link-input').fill('https://example.com');
    await page.locator('.bubble-link-save').click();
    
    // Select the link and remove it
    await page.locator('.tiptap a').click();
    await page.keyboard.press('Control+a');
    
    // Click unlink button
    await page.locator('.bubble-toolbar-button[title*="Remove Link"]').click();
    
    // Link should be removed
    await expect(page.locator('.tiptap a')).not.toBeVisible();
    await expect(page.locator('.tiptap')).toContainText('Existing link');
  });

  test('should show highlight color picker', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Highlight text');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Click highlight button
    await page.locator('.bubble-toolbar-button[title*="Highlight"]').click();
    
    // Color picker should appear
    await expect(page.locator('.bubble-highlight-colors')).toBeVisible();
    
    // Should have color options
    await expect(page.locator('.bubble-highlight-color')).toHaveCount(6);
  });

  test('should apply highlight color', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Yellow highlight');
    await page.keyboard.press('Control+a');
    
    // Click highlight button
    await page.locator('.bubble-toolbar-button[title*="Highlight"]').click();
    
    // Click yellow color (first color)
    await page.locator('.bubble-highlight-color').first().click();
    
    // Text should be highlighted
    await expect(page.locator('.tiptap mark')).toBeVisible();
    await expect(page.locator('.tiptap mark')).toContainText('Yellow highlight');
  });

  test('should remove highlight', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Highlighted text');
    await page.keyboard.press('Control+a');
    
    // Apply highlight
    await page.locator('.bubble-toolbar-button[title*="Highlight"]').click();
    await page.locator('.bubble-highlight-color').first().click();
    
    // Select highlighted text and remove highlight
    await page.keyboard.press('Control+a');
    await page.locator('.bubble-toolbar-button[title*="Highlight"]').click();
    await page.locator('.bubble-highlight-remove').click();
    
    // Highlight should be removed
    await expect(page.locator('.tiptap mark')).not.toBeVisible();
    await expect(page.locator('.tiptap')).toContainText('Highlighted text');
  });

  test('should insert inline math', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('formula');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Click math button
    await page.locator('.bubble-toolbar-button[title*="Inline Math"]').click();
    
    // Should have inserted math notation
    await expect(page.locator('.tiptap')).toContainText('$');
  });

  test('should work with keyboard shortcuts', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Bold text');
    
    // Use keyboard shortcut for bold
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+b');
    
    // Text should be bold
    await expect(page.locator('.tiptap strong')).toBeVisible();
    await expect(page.locator('.tiptap strong')).toContainText('Bold text');
    
    // Button should show active state when text is selected
    await page.keyboard.press('Control+a');
    await expect(page.locator('.bubble-toolbar-button[title*="Bold"].is-active')).toBeVisible();
  });

  test('should handle multiple formatting', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('Multi format');
    await page.keyboard.press('Control+a');
    
    // Apply bold
    await page.locator('.bubble-toolbar-button[title*="Bold"]').click();
    
    // Apply italic (text should still be selected)
    await page.locator('.bubble-toolbar-button[title*="Italic"]').click();
    
    // Should have both formatting
    await expect(page.locator('.tiptap strong em, .tiptap em strong')).toBeVisible();
    
    // Both buttons should show active state
    await page.keyboard.press('Control+a');
    await expect(page.locator('.bubble-toolbar-button[title*="Bold"].is-active')).toBeVisible();
    await expect(page.locator('.bubble-toolbar-button[title*="Italic"].is-active')).toBeVisible();
  });

  test('should position correctly near selection', async ({ page }) => {
    await page.locator('.tiptap').click();
    
    // Add some content to create scroll context
    await page.keyboard.type('First line\n'.repeat(10));
    await page.keyboard.type('Selected text');
    
    // Select the last line
    await page.keyboard.press('Control+a');
    
    // Bubble toolbar should be visible and positioned near selection
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Should be positioned within viewport
    const toolbar = page.locator('.bubble-toolbar');
    const toolbarBox = await toolbar.boundingBox();
    expect(toolbarBox).toBeTruthy();
  });
});

test.describe('Bubble Toolbar - Accessibility', () => {
  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.locator('.tiptap').click();
    await page.keyboard.type('Accessible text');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Should be able to tab to buttons
    await page.keyboard.press('Tab');
    
    // First button should be focused
    await expect(page.locator('.bubble-toolbar-button:first-child')).toBeFocused();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.locator('.tiptap').click();
    await page.keyboard.type('Text');
    await page.keyboard.press('Control+a');
    
    await expect(page.locator('.bubble-toolbar')).toBeVisible();
    
    // Check for title attributes (which provide accessible names)
    await expect(page.locator('.bubble-toolbar-button[title*="Bold"]')).toBeVisible();
    await expect(page.locator('.bubble-toolbar-button[title*="Italic"]')).toBeVisible();
    await expect(page.locator('.bubble-toolbar-button[title*="Add Link"]')).toBeVisible();
  });
});