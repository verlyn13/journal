import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (typeof md === 'string') {
      localStorage.setItem('journal:md:draft', md);
    }
  }, [md]);

  // If initial content looks like HTML, convert to markdown once for better editing/preview
  useEffect(() => {
    if (!entry) return;
    if (typeof entry.content !== 'string') return;
    // Set current content directly on entry change
    setMd(entry.content);
    const looksLikeHtml = /<\w+[\s>]/.test(entry.content);
    if (looksLikeHtml) {
      (async () => {
        try {
          const mod = await import('../../utils/markdown-converter');
          const res = mod.convertHtmlToMarkdown(entry.content);
          if (res.success && res.markdown) {
            setMd(res.markdown);
          }
        } catch {
          // ignore
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]);

  // Debounced autosave when content changes
  useEffect(() => {
    if (!onSave) return;
    // skip if no entry yet
    if (!entry) return;

    // Clear any pending timer
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    setSaving(true);
    saveTimer.current = window.setTimeout(async () => {
      try {
        await onSave({ html: '', markdown: md });
        setLastSavedAt(Date.now());
      } finally {
        setSaving(false);
      }
    }, 1200);

    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [md, onSave, entry]);

  const saveLabel = useMemo(() => {
    if (saving) return 'Saving…';
    if (!lastSavedAt) return '';
    const secs = Math.max(1, Math.round((Date.now() - lastSavedAt) / 1000));
    return `Saved ${secs}s ago`;
  }, [saving, lastSavedAt]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="border border-sanctuary-border rounded-md">
        <div className="px-3 py-2 text-xs text-sanctuary-text-secondary border-b border-sanctuary-border">
          <div className="flex items-center justify-between">
            <span>Markdown Editor</span>
            <span className="text-[11px] text-sanctuary-text-tertiary">{saveLabel}</span>
          </div>
        </div>
        <div className="p-2">
          <MarkdownEditor value={md} onChange={setMd} height="70vh" />
          {/* Autosave enabled; manual save not shown */}
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
