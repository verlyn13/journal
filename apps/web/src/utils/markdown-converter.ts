import type { TurndownNode } from 'turndown';
import TurndownService from 'turndown';
import type { ConversionResult } from '../types/markdown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
});

turndownService.addRule('lineBreaks', {
  filter: 'br',
  replacement: () => '  \n',
});

// Convert inline math spans to $...$
turndownService.addRule('mathInline', {
  filter: (node: TurndownNode) =>
    node.nodeName === 'SPAN' && (node.classList?.contains('math-inline') ?? false),
  replacement: (_content: string, node: TurndownNode) => {
    const tex = node.textContent || '';
    return `$${tex}$`;
  },
});

export function convertHtmlToMarkdown(html: string): ConversionResult {
  try {
    if (!html || typeof html !== 'string') {
      return { markdown: '', success: false, errors: ['Invalid HTML input'] };
    }
    const markdown = turndownService.turndown(html);
    return { markdown, success: true };
  } catch (error: unknown) {
    return {
      markdown: html,
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown conversion error'],
    };
  }
}
