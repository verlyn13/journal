import { describe, expect, it } from 'vitest';
import { tokens } from './index';

// WCAG contrast ratio calculation
function luminance(rgb: string): number {
  // Convert hex to RGB
  const hex = rgb.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const [rs, gs, bs] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );

  // Calculate relative luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(color1: string, color2: string): number {
  const l1 = luminance(color1);
  const l2 = luminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Color Contrast Verification', () => {
  describe('Dawn Theme (Light)', () => {
    const dawn = tokens.color.dawn;

    it('should meet WCAG AA for primary text on background', () => {
      const ratio = contrastRatio(dawn.text.primary, dawn.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5); // AA for normal text
    });

    it('should meet WCAG AA for secondary text on background', () => {
      const ratio = contrastRatio(dawn.text.secondary, dawn.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5); // AA for normal text
    });

    it('should meet WCAG AA for accent on background', () => {
      const ratio = contrastRatio(dawn.accent.primary, dawn.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(3.0); // AA for large text/UI components
    });

    it('should have visible contrast for borders', () => {
      const ratio = contrastRatio(dawn.border, dawn.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(1.4); // Minimum visibility for decorative elements
    });

    it('should meet WCAG AAA for primary text (enhanced accessibility)', () => {
      const ratio = contrastRatio(dawn.text.primary, dawn.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(7.0); // AAA for normal text
    });
  });

  describe('Dusk Theme (Dark)', () => {
    const dusk = tokens.color.dusk;

    it('should meet WCAG AA for primary text on background', () => {
      const ratio = contrastRatio(dusk.text.primary, dusk.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5); // AA for normal text
    });

    it('should meet WCAG AA for secondary text on background', () => {
      const ratio = contrastRatio(dusk.text.secondary, dusk.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5); // AA for normal text
    });

    it('should meet WCAG AA for accent on background', () => {
      const ratio = contrastRatio(dusk.accent.primary, dusk.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(3.0); // AA for large text/UI components
    });

    it('should have visible contrast for borders', () => {
      const ratio = contrastRatio(dusk.border, dusk.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(2.0); // Minimum visibility for decorative elements in dark mode
    });

    it('should meet WCAG AAA for primary text (enhanced accessibility)', () => {
      const ratio = contrastRatio(dusk.text.primary, dusk.background.primary);
      expect(ratio).toBeGreaterThanOrEqual(7.0); // AAA for normal text
    });
  });

  describe('Cross-theme Consistency', () => {
    it('should have similar contrast ratios across themes', () => {
      const dawnRatio = contrastRatio(
        tokens.color.dawn.text.primary,
        tokens.color.dawn.background.primary,
      );
      const duskRatio = contrastRatio(
        tokens.color.dusk.text.primary,
        tokens.color.dusk.background.primary,
      );

      // Ratios should be within 2 points of each other
      expect(Math.abs(dawnRatio - duskRatio)).toBeLessThan(2);
    });
  });
});
