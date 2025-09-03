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
