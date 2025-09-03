import { describe, expect, it } from 'vitest';
import { convertHtmlToMarkdown } from '../markdown-converter';

describe('Markdown Converter Contract', () => {
  it('converts valid HTML to markdown', () => {
    const result = convertHtmlToMarkdown('<h1>Title</h1><p>Text</p>');
    expect(result.success).toBe(true);
    expect(result.markdown).toBe('# Title\n\nText');
  });

  it('handles invalid input gracefully', () => {
    const result = convertHtmlToMarkdown(null as unknown as string);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('preserves line breaks correctly', () => {
    const result = convertHtmlToMarkdown('Line 1<br>Line 2');
    expect(result.markdown).toContain('  \n');
  });

  it('converts math spans correctly', () => {
    const result = convertHtmlToMarkdown('<span class="math-inline">E=mc^2</span>');
    expect(result.markdown).toBe('$E=mc^2$');
  });
});
