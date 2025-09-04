import { defaultSchema } from 'rehype-sanitize';
import type { Schema } from '../types/rehype-sanitize';

export const markdownSanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      ['className', 'math'],
      ['className', 'math-display'],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ['className', 'math'],
      ['className', 'math-inline'],
      ['className', /^hljs-/],
    ],
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-/]],
    pre: [...(defaultSchema.attributes?.pre ?? []), ['className', /^language-/]],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    // Common markdown structural tags
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'code',
    'math',
    'semantics',
    'mrow',
    'mi',
    'mo',
    'mn',
    'msup',
    'mfrac',
  ],
};
