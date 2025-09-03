/**
 * Type definitions for rehype plugins used in ReactMarkdown
 */

import type { Plugin } from 'unified';

declare module 'rehype-katex' {
  const rehypeKatex: Plugin;
  export default rehypeKatex;
}

declare module 'rehype-highlight' {
  const rehypeHighlight: Plugin;
  export default rehypeHighlight;
}
