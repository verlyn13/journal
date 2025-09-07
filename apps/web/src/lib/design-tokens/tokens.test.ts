import { describe, expect, it } from 'vitest';
import { generateCSSVariables, tokens } from './index';

describe('Design Tokens', () => {
  it('should have consistent color structure for both themes', () => {
    expect(tokens.color.dawn.background.primary).toBe('#f5f3f0');
    expect(tokens.color.dusk.background.primary).toBe('#2c303a');

    // Both themes should have same structure
    expect(Object.keys(tokens.color.dawn)).toEqual(Object.keys(tokens.color.dusk));
  });

  it('should generate CSS variables for dawn theme', () => {
    const variables = generateCSSVariables('dawn');

    expect(variables).toContain('--sanctuary-background-primary: #f5f3f0;');
    expect(variables).toContain('--sanctuary-text-primary: #41454c;');
    expect(variables).toContain('--sanctuary-accent-primary: #a8b5c5;');
    expect(variables).toContain('--spacing-lg: 1.5rem;');
    expect(variables).toContain(
      '--elevation-sm: 0 1px 2px rgba(0,0,0,.06), 0 3px 6px rgba(0,0,0,.06);',
    );
  });

  it('should generate CSS variables for dusk theme', () => {
    const variables = generateCSSVariables('dusk');

    expect(variables).toContain('--sanctuary-background-primary: #2c303a;');
    expect(variables).toContain('--sanctuary-text-primary: #d4d6d9;');
    expect(variables).toContain('--sanctuary-accent-primary: #d4af8b;');
    expect(variables).toContain('--sanctuary-code: #1e1e2e;');
  });

  it('should have spacing scale that follows 8px base unit', () => {
    expect(tokens.spacing.sm).toBe('0.5rem'); // 8px
    expect(tokens.spacing.md).toBe('1rem'); // 16px
    expect(tokens.spacing.lg).toBe('1.5rem'); // 24px
    expect(tokens.spacing.xl).toBe('2rem'); // 32px
  });

  it('should have typography tokens with proper font stacks', () => {
    expect(tokens.typography.fonts.ui).toContain('Inter');
    expect(tokens.typography.fonts.content).toContain('Lora');
    expect(tokens.typography.fonts.code).toContain('JetBrains Mono');
  });

  it('should have motion tokens with cubic-bezier values', () => {
    expect(tokens.motion.panel).toContain('cubic-bezier');
    expect(tokens.motion.emphasis).toContain('cubic-bezier');
    expect(tokens.motion.standard).toBe('200ms ease');
  });
});
