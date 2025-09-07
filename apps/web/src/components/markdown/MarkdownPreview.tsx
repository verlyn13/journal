import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import type { Plugin } from 'unified';
import { markdownSanitizeSchema } from '../../utils/sanitization-schema';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

type Props = { markdown: string };

export function MarkdownPreview({ markdown }: Props) {
  if (typeof markdown !== 'string') {
    return <div>Invalid content</div>;
  }
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[
          [rehypeSanitize, markdownSanitizeSchema],
          rehypeKatex as unknown as Plugin,
          rehypeHighlight as unknown as Plugin,
        ]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownPreview;
