import { markdown } from '@codemirror/lang-markdown';
import CodeMirror from '@uiw/react-codemirror';
import { useMemo } from 'react';

type Props = {
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
  height?: string;
};

export default function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  height = '60vh',
}: Props) {
  const extensions = useMemo(() => [markdown()], []);
  return (
    <CodeMirror
      value={value}
      height={height}
      readOnly={readOnly}
      extensions={extensions}
      onChange={onChange}
    />
  );
}
