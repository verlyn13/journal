import { describe, expect, it } from 'vitest';
import {
  getElevationStyles,
  getHoverElevation,
  getPressedElevation,
  isElevationAccessible,
} from './elevation';
import { getTextureStyles, getTextureOpacity, isTextureAccessible } from './textures';

describe('Materiality System', () => {
  describe('Elevation System', () => {
    it('should generate correct elevation styles', () => {
      const styles = getElevationStyles(2);
      expect(styles.boxShadow).toBeDefined();
      expect(styles.boxShadow).toContain('6px');
    });

    it('should increase elevation on hover', () => {
      expect(getHoverElevation(2)).toBe(3);
      expect(getHoverElevation(5)).toBe(5); // Max elevation
    });

    it('should decrease elevation on press', () => {
      expect(getPressedElevation(2)).toBe(1);
      expect(getPressedElevation(0)).toBe(0); // Min elevation
    });

    it('should check elevation accessibility', () => {
      expect(isElevationAccessible(2, '#ffffff')).toBe(true);
      expect(isElevationAccessible(4, '#ffffff')).toBe(true);
      expect(isElevationAccessible(5, '#000000')).toBe(false);
    });
  });

  describe('Texture System', () => {
    it('should generate texture styles', () => {
      const styles = getTextureStyles('paper');
      expect(styles.backgroundImage).toBeDefined();
      expect(styles.backgroundRepeat).toBe('repeat');
    });

    it('should return empty styles for none texture', () => {
      const styles = getTextureStyles('none');
      expect(Object.keys(styles).length).toBe(0);
    });

    it('should adjust opacity for dark mode', () => {
      const lightOpacity = getTextureOpacity('paper', false);
      const darkOpacity = getTextureOpacity('paper', true);
      expect(darkOpacity).toBeLessThan(lightOpacity);
    });

    it('should check texture accessibility', () => {
      expect(isTextureAccessible('paper', '#000000', '#ffffff')).toBe(true);
      expect(isTextureAccessible('none', '#000000', '#ffffff')).toBe(true);
    });
  });
});
