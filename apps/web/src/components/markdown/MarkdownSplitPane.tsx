import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';

const MarkdownEditor = React.lazy(() => import('./MarkdownEditor'));
const MarkdownPreview = React.lazy(() => import('./MarkdownPreview'));

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

  // Layout state: side-by-side vs stacked (persisted)
  type LayoutMode = 'side' | 'stack';
  const LAYOUT_KEY = 'journal:splitpane:layout';
  const RATIO_KEY = 'journal:splitpane:ratio';
  const [layout, setLayout] = useState<LayoutMode>(() => {
    if (typeof window === 'undefined') return 'side';
    const saved = localStorage.getItem(LAYOUT_KEY) as LayoutMode | null;
    return saved === 'stack' || saved === 'side' ? saved : 'side';
  });
  const [ratio, setRatio] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.6;
    const saved = parseFloat(localStorage.getItem(RATIO_KEY) || '0.6');
    return Number.isFinite(saved) ? Math.min(0.85, Math.max(0.35, saved)) : 0.6;
  });

  // Persist layout/ratio
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LAYOUT_KEY, layout);
  }, [layout]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Snap to golden band if close
    const snapped = ratio >= 0.58 && ratio <= 0.62 ? 0.618 : ratio;
    localStorage.setItem(RATIO_KEY, String(snapped));
  }, [ratio]);

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
  }, [entry]);

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

  const gridStyle = useMemo(() => {
    if (layout === 'side') {
      const left = `${Math.round(ratio * 1000) / 10}%`;
      return { gridTemplateColumns: `${left} 1fr` } as React.CSSProperties;
    }
    const top = `${Math.round(ratio * 1000) / 10}%`;
    return { gridTemplateRows: `${top} 1fr` } as React.CSSProperties;
  }, [layout, ratio]);

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!e.altKey) return;
    e.preventDefault();
    const delta = Math.sign(e.deltaY) * -0.02; // invert natural scroll
    setRatio((r) => Math.min(0.85, Math.max(0.35, r + delta)));
  };

  return (
    <div
      className={`grid gap-4 ${layout === 'side' ? 'grid-cols-2' : ''}`}
      style={gridStyle}
      onWheel={handleWheel}
      data-testid="splitpane"
      data-layout={layout}
      data-ratio={ratio.toFixed(3)}
    >
      {/* Header controls */}
      <div
        className={`${layout === 'side' ? 'col-span-full' : ''} flex items-center justify-between text-xs text-sanctuary-text-secondary`}
      >
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle layout"
            title="Toggle layout (↔/↕)"
            className="px-2 py-1 border border-sanctuary-border rounded hover:bg-sanctuary-bg-tertiary"
            onClick={() => setLayout((m) => (m === 'side' ? 'stack' : 'side'))}
            data-testid="splitpane-toggle"
          >
            {layout === 'side' ? '↕' : '↔'}
          </button>
          <span className="text-[11px]">{layout === 'side' ? 'Side-by-side' : 'Top / Bottom'}</span>
          <span className="text-[11px] opacity-70">Alt + Scroll to resize</span>
        </div>
        <span className="text-[11px] text-sanctuary-text-tertiary">{saveLabel}</span>
      </div>
      <div className="border border-sanctuary-border rounded-md overflow-hidden">
        <div className="px-3 py-2 text-xs text-sanctuary-text-secondary border-b border-sanctuary-border">
          Markdown Editor
        </div>
        <div className="p-2">
          <Suspense
            fallback={<div className="text-xs text-sanctuary-text-tertiary">Loading editor…</div>}
          >
            <MarkdownEditor
              value={md}
              onChange={setMd}
              height={layout === 'stack' ? '35vh' : '70vh'}
            />
          </Suspense>
          {/* Autosave enabled; manual save not shown */}
        </div>
      </div>
      <div className="border border-sanctuary-border rounded-md overflow-hidden">
        <div className="px-3 py-2 text-xs text-sanctuary-text-secondary border-b border-sanctuary-border">
          Preview (sanitized)
        </div>
        <div
          className="p-4 overflow-y-auto"
          style={{ maxHeight: layout === 'stack' ? '35vh' : '70vh' }}
        >
          <Suspense
            fallback={
              <div className="text-xs text-sanctuary-text-tertiary">Rendering preview…</div>
            }
          >
            <MarkdownPreview markdown={md} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
