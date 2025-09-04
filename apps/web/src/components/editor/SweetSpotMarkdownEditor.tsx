import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';
import 'katex/dist/katex.min.css';
import { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import 'react-reflex/styles.css';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

// Allow only the classes needed for math and highlight.
// Keep this minimal; extend as you encounter legit cases.
const baseAttrs = defaultSchema.attributes ?? {};
const mathAndCodeSchema = {
  ...defaultSchema,
  attributes: {
    ...baseAttrs,
    // KaTeX (keep tight; start with math classes only)
    div: [...(baseAttrs.div || []), ['className', 'math', 'math-display']],
    span: [
      ...(baseAttrs.span || []),
      ['className', 'math', 'math-inline'],
      // If using rehype-highlight after sanitize, you can also allow hljs- classes here
      // ["className", /^hljs-.*/]
    ],
    code: [
      ...(baseAttrs.code || []),
      // Allow language-* class on <code>
      ['className', /^language-.*/],
    ],
  },
};

interface SweetSpotMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SweetSpotMarkdownEditor({ value, onChange }: SweetSpotMarkdownEditorProps) {
  const [source, setSource] = useState(value);

  const handleChange = useCallback(
    (value: string) => {
      setSource(value);
      onChange(value);
    },
    [onChange],
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <CodeMirror
        value={source}
        onChange={handleChange}
        theme={oneDark}
        extensions={[markdown({ base: markdownLanguage })]}
        height="100%"
      />
      <article className="prose dark:prose-invert max-w-[70ch]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
          rehypePlugins={[
            [rehypeSanitize, mathAndCodeSchema], // sanitize first
            rehypeKatex,
            [rehypeHighlight, { detect: false }], // keep detect off for predictability/size
          ]}
        >
          {source}
        </ReactMarkdown>
      </article>
    </div>
  );
}
