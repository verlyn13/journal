import { test, expect } from '@playwright/test';

// Typing latency measurement utility
async function measureTypingLatency(page: any, text: string, selector: string = '.tiptap') {
  const startTime = Date.now();
  const editor = page.locator(selector);
  
  // Type the text
  await editor.type(text);
  
  // Wait for the text to appear in the DOM
  await expect(editor).toContainText(text);
  
  const endTime = Date.now();
  const latency = endTime - startTime;
  
  console.log(`Typing latency for "${text}": ${latency}ms`);
  return latency;
}

test.describe('Slash Commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should open slash menu when typing /', async ({ page }) => {
    // Click in the editor
    await page.locator('.tiptap').click();
    
    // Type slash
    await page.keyboard.type('/');
    
    // Wait for menu to appear
    await expect(page.locator('.slash-menu')).toBeVisible();
  });

  test('should show categorized commands', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/');
    
    // Check for category labels
    await expect(page.locator('.slash-menu-category-label').first()).toBeVisible();
    
    // Check for specific categories
    await expect(page.locator('.slash-menu-category-label:has-text("Basic")')).toBeVisible();
    await expect(page.locator('.slash-menu-category-label:has-text("Lists")')).toBeVisible();
    await expect(page.locator('.slash-menu-category-label:has-text("Advanced")')).toBeVisible();
  });

  test('should filter commands when typing query', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/head');
    
    await expect(page.locator('.slash-menu')).toBeVisible();
    
    // Should show heading commands
    await expect(page.locator('.slash-menu-item:has-text("Heading 1")')).toBeVisible();
    await expect(page.locator('.slash-menu-item:has-text("Heading 2")')).toBeVisible();
    
    // Should not show unrelated commands
    await expect(page.locator('.slash-menu-item:has-text("Bullet List")')).not.toBeVisible();
  });

  test('should navigate with keyboard arrows', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/');
    
    await expect(page.locator('.slash-menu')).toBeVisible();
    
    // First item should be selected by default
    await expect(page.locator('.slash-menu-item.is-selected').first()).toBeVisible();
    
    // Press down arrow
    await page.keyboard.press('ArrowDown');
    
    // Second item should now be selected
    const selectedItems = page.locator('.slash-menu-item.is-selected');
    await expect(selectedItems).toHaveCount(1);
  });

  test('should execute command on Enter', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/head');
    
    // Press Enter to select first heading command
    await page.keyboard.press('Enter');
    
    // Menu should disappear
    await expect(page.locator('.slash-menu')).not.toBeVisible();
    
    // Should have inserted a heading
    await expect(page.locator('.tiptap h1, .tiptap h2')).toBeVisible();
  });

  test('should close on Escape', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/');
    
    await expect(page.locator('.slash-menu')).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(page.locator('.slash-menu')).not.toBeVisible();
  });

  test('should show icons for commands', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/');
    
    await expect(page.locator('.slash-menu')).toBeVisible();
    
    // Check that menu items have icons
    const menuItems = page.locator('.slash-menu-item');
    const firstItem = menuItems.first();
    
    await expect(firstItem.locator('.slash-menu-item-icon svg')).toBeVisible();
  });

  test('should show command descriptions', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/');
    
    await expect(page.locator('.slash-menu')).toBeVisible();
    
    // Check that descriptions are visible
    await expect(page.locator('.slash-menu-item-description').first()).toBeVisible();
    
    // Check specific description
    const headingItem = page.locator('.slash-menu-item:has-text("Heading 1")');
    await expect(headingItem.locator('.slash-menu-item-description')).toContainText('Large section heading');
  });

  test('should work with mouse clicks', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/');
    
    await expect(page.locator('.slash-menu')).toBeVisible();
    
    // Click on a command
    await page.locator('.slash-menu-item:has-text("Heading 2")').click();
    
    // Menu should disappear
    await expect(page.locator('.slash-menu')).not.toBeVisible();
    
    // Should have inserted the content
    await expect(page.locator('.tiptap h2')).toBeVisible();
  });

  test('should show empty state for no matches', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/xyz123notfound');
    
    await expect(page.locator('.slash-menu-empty')).toBeVisible();
    await expect(page.locator('.slash-menu-empty')).toContainText('No commands found');
  });

  test('should insert template content', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/daily');
    
    await expect(page.locator('.slash-menu')).toBeVisible();
    
    // Select daily note template
    await page.keyboard.press('Enter');
    
    // Should have inserted structured content
    await expect(page.locator('.tiptap h1')).toBeVisible();
    await expect(page.locator('.tiptap h2')).toBeVisible();
    await expect(page.locator('.tiptap ul[data-type="taskList"]')).toBeVisible();
  });

  test('should handle multiple slash commands in sequence', async ({ page }) => {
    await page.locator('.tiptap').click();
    
    // Insert first command
    await page.keyboard.type('/head');
    await page.keyboard.press('Enter');
    
    // Move cursor and insert second command
    await page.keyboard.press('Enter');
    await page.keyboard.type('/list');
    await page.keyboard.press('Enter');
    
    // Should have both elements
    await expect(page.locator('.tiptap h1, .tiptap h2')).toBeVisible();
    await expect(page.locator('.tiptap ul')).toBeVisible();
  });

  test('should maintain focus after command execution', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.keyboard.type('/head');
    await page.keyboard.press('Enter');
    
    // Editor should still have focus
    await expect(page.locator('.tiptap')).toBeFocused();
    
    // Should be able to continue typing
    await page.keyboard.type('My heading text');
    await expect(page.locator('.tiptap h1, .tiptap h2')).toContainText('My heading text');
  });

  test('should work at different cursor positions', async ({ page }) => {
    await page.locator('.tiptap').click();
    
    // Type some initial content
    await page.keyboard.type('First paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    
    // Use slash command in the middle
    await page.keyboard.type('/head');
    await page.keyboard.press('Enter');
    
    // Should have heading after the paragraph
    const headings = page.locator('.tiptap h1, .tiptap h2');
    await expect(headings).toBeVisible();
    
    // Original content should still be there
    await expect(page.locator('.tiptap')).toContainText('First paragraph');
  });
});

test.describe('Slash Commands - Math Integration', () => {
  test('should insert math block with correct syntax', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.locator('.tiptap').click();
    await page.keyboard.type('/math');
    
    await expect(page.locator('.slash-menu')).toBeVisible();
    await page.keyboard.press('Enter');
    
    // Should have inserted math block
    await expect(page.locator('[data-type="mathBlock"]')).toBeVisible();
  });
});

test.describe('Slash Commands - Code Block Integration', () => {
  test('should insert Monaco code block', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.locator('.tiptap').click();
    await page.keyboard.type('/code');
    
    await expect(page.locator('.slash-menu')).toBeVisible();
    await page.keyboard.press('Enter');
    
    // Should have inserted Monaco code block
    await expect(page.locator('.monaco-code-block')).toBeVisible();
    
    // Should show loading state initially
    await expect(page.locator('.monaco-loading')).toBeVisible();
  });
});

test.describe('Slash Commands - Performance', () => {
  test('should have acceptable typing latency', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.locator('.tiptap').click();
    
    // Test basic typing latency (should be < 100ms for short text)
    const basicLatency = await measureTypingLatency(page, 'Hello world');
    expect(basicLatency).toBeLessThan(100);
    
    // Clear and test slash command latency
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    
    const slashLatency = await measureTypingLatency(page, '/');
    expect(slashLatency).toBeLessThan(50); // Slash should be instant
    
    // Wait for menu to appear
    await expect(page.locator('.slash-menu')).toBeVisible();
  });

  test('should handle rapid typing without lag', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.locator('.tiptap').click();
    
    // Type multiple characters rapidly
    const rapidText = 'This is a test of rapid typing to ensure the editor can keep up with fast input';
    const startTime = Date.now();
    
    for (const char of rapidText) {
      await page.keyboard.type(char, { delay: 10 }); // 100 WPM equivalent
    }
    
    const endTime = Date.now();
    const totalLatency = endTime - startTime;
    
    // Verify text appears correctly
    await expect(page.locator('.tiptap')).toContainText(rapidText);
    
    // Total latency should be reasonable (text length * 10ms + buffer)
    expect(totalLatency).toBeLessThan(rapidText.length * 20);
  });

  test('should maintain performance with large document', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.locator('.tiptap').click();
    
    // Create a large document
    const largeText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100);
    await page.keyboard.type(largeText);
    
    // Test typing at the end of large document
    const latency = await measureTypingLatency(page, '\nNew line with more text');
    
    // Should still maintain good performance
    expect(latency).toBeLessThan(150); // Slightly higher threshold for large documents
  });
});