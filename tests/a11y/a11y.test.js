import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, configureAxe } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Inject axe-core
    await injectAxe(page);
    
    // Configure axe
    await configureAxe(page, {
      rules: {
        // Enable specific rules
        'color-contrast': { enabled: true },
        'label': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'button-name': { enabled: true },
        'link-name': { enabled: true },
        'image-alt': { enabled: true },
        
        // Disable rules that might not apply
        'region': { enabled: false },
        'landmark-one-main': { enabled: false }
      }
    });
  });
  
  test('Homepage meets WCAG 2.2 AA', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      },
      wcagTags: ['wcag2aa', 'wcag22aa']
    });
  });
  
  test('Navigation is keyboard accessible', async ({ page }) => {
    // Tab through navigation
    await page.keyboard.press('Tab');
    const firstLink = await page.locator(':focus');
    expect(await firstLink.isVisible()).toBe(true);
    
    // Check skip link
    const skipLink = page.locator('[href="#main"]');
    if (await skipLink.count() > 0) {
      await skipLink.focus();
      await expect(skipLink).toBeVisible();
    }
    
    // Check navigation landmarks
    await checkA11y(page, 'nav', {
      rules: {
        'aria-required-attr': { enabled: true },
        'button-name': { enabled: true }
      }
    });
  });
  
  test('Forms have proper labels and ARIA attributes', async ({ page }) => {
    await page.goto('/new-entry');
    
    // Check form accessibility
    await checkA11y(page, 'form', {
      rules: {
        'label': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-invalid': { enabled: true },
        'aria-describedby-consistent': { enabled: true }
      }
    });
    
    // Test form field focus
    const titleInput = page.locator('#title');
    await titleInput.focus();
    
    // Check if label is properly associated
    const label = await page.locator('label[for="title"]');
    await expect(label).toBeVisible();
    
    // Check error messages are announced
    await titleInput.fill('');
    await page.locator('button[type="submit"]').click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Check if error is properly associated
    const errorId = await titleInput.getAttribute('aria-describedby');
    if (errorId) {
      const errorElement = page.locator(`#${errorId}`);
      await expect(errorElement).toBeVisible();
    }
  });
  
  test('Data table is accessible', async ({ page }) => {
    await page.goto('/entries');
    
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Check table accessibility
    await checkA11y(page, 'table', {
      rules: {
        'table-duplicate-name': { enabled: true },
        'td-headers-attr': { enabled: true },
        'th-has-data-cells': { enabled: true },
        'scope-attr-valid': { enabled: true }
      }
    });
    
    // Check table has proper caption or aria-label
    const table = page.locator('table');
    const caption = await table.locator('caption').count();
    const ariaLabel = await table.getAttribute('aria-label');
    
    expect(caption > 0 || ariaLabel !== null).toBe(true);
  });
  
  test('Modals are focus-trapped and accessible', async ({ page }) => {
    await page.goto('/');
    
    // Open a modal (assuming there's a trigger)
    const modalTrigger = page.locator('[data-modal-trigger]').first();
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();
      
      // Wait for modal to open
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      // Check modal accessibility
      await checkA11y(page, '[role="dialog"]', {
        rules: {
          'aria-dialog-name': { enabled: true },
          'aria-modal': { enabled: true }
        }
      });
      
      // Test focus trap
      const modal = page.locator('[role="dialog"]');
      const focusableElements = modal.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const focusableCount = await focusableElements.count();
      
      if (focusableCount > 0) {
        // Tab through modal elements
        for (let i = 0; i < focusableCount + 1; i++) {
          await page.keyboard.press('Tab');
        }
        
        // Focus should wrap back to first element
        const focusedElement = await page.locator(':focus');
        const isWithinModal = await modal.locator(':focus').count() > 0;
        expect(isWithinModal).toBe(true);
      }
      
      // Test escape key closes modal
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });
  
  test('Color contrast meets WCAG standards', async ({ page }) => {
    // Test light theme
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'light';
    });
    
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
    
    // Test dark theme
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
    });
    
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });
  
  test('Images have appropriate alt text', async ({ page }) => {
    await checkA11y(page, 'img', {
      rules: {
        'image-alt': { enabled: true },
        'image-redundant-alt': { enabled: true }
      }
    });
    
    // Check decorative images
    const decorativeImages = page.locator('img[alt=""]');
    const count = await decorativeImages.count();
    
    for (let i = 0; i < count; i++) {
      const img = decorativeImages.nth(i);
      const role = await img.getAttribute('role');
      
      // Decorative images should have role="presentation" or aria-hidden="true"
      const ariaHidden = await img.getAttribute('aria-hidden');
      expect(role === 'presentation' || ariaHidden === 'true').toBe(true);
    }
  });
  
  test('Headings have proper hierarchy', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = [];
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName);
      const level = parseInt(tagName.charAt(1));
      headingLevels.push(level);
    }
    
    // Check there's exactly one h1
    const h1Count = headingLevels.filter(level => level === 1).length;
    expect(h1Count).toBe(1);
    
    // Check heading hierarchy doesn't skip levels
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });
  
  test('Links are distinguishable and have focus indicators', async ({ page }) => {
    const links = page.locator('a[href]');
    const count = await links.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = links.nth(i);
      
      // Check link has text or aria-label
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      expect(text?.trim() || ariaLabel).toBeTruthy();
      
      // Check focus indicator
      await link.focus();
      const outline = await link.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline || styles.boxShadow;
      });
      expect(outline).not.toBe('none');
    }
  });
  
  test('Error messages are accessible', async ({ page }) => {
    await page.goto('/new-entry');
    
    // Submit empty form to trigger errors
    await page.locator('button[type="submit"]').click();
    
    // Wait for errors
    await page.waitForTimeout(500);
    
    // Check error messages
    const errors = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
    const errorCount = await errors.count();
    
    if (errorCount > 0) {
      await checkA11y(page, '[role="alert"]', {
        rules: {
          'aria-valid-attr': { enabled: true },
          'aria-live-region-accessible': { enabled: true }
        }
      });
    }
  });
});