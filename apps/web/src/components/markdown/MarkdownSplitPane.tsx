import { useEffect, useState } from 'react';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';

type EntryLike = {
  id: string;
  title: string;
  content: string;
};

type Props = {
  entry?: EntryLike | null;
  onSave?: (payload: { html: string; markdown: string }) => void;
};

export default function MarkdownSplitPane({ entry, onSave }: Props) {
  const [md, setMd] = useState(entry?.content ?? '# Markdown Editor\n\nStart typing…');

  useEffect(() => {
    if (typeof md === 'string') {
      localStorage.setItem('journal:md:draft', md);
    }
  }, [md]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="border border-sanctuary-border rounded-md">
        <div className="px-3 py-2 text-xs text-sanctuary-text-secondary border-b border-sanctuary-border">
          Markdown Editor
        </div>
        <div className="p-2">
          <MarkdownEditor value={md} onChange={setMd} height="70vh" />
          {onSave && (
            <div className="mt-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded bg-sanctuary-accent text-white hover:bg-sanctuary-accent/80"
                onClick={() => onSave?.({ html: '', markdown: md })}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="border border-sanctuary-border rounded-md">
        <div className="px-3 py-2 text-xs text-sanctuary-text-secondary border-b border-sanctuary-border">
          Preview (sanitized)
        </div>
        <div className="p-4">
          <MarkdownPreview markdown={md} />
        </div>
      </div>
    </div>
  );
}
