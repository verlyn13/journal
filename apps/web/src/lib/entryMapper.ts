import type { EntryApi, EntryDetailVm, EntryVm } from '../types/entry';

function isoToDate(iso?: string): Date | null {
  try {
    return iso ? new Date(iso) : null;
  } catch {
    return null;
  }
}

function formatYmd(d: Date | null): string {
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatHm(d: Date | null): string {
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function buildPreview(content: string, existing?: string | null): string {
  if (existing?.trim()) return existing;

  // Strip HTML tags first
  const withoutHtml = (content || '')
    .replace(/<[^>]*>/g, ' ')
    // Strip markdown formatting
    .replace(/#{1,6}\s+/g, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/__([^_]+)__/g, '$1') // Bold alt
    .replace(/_([^_]+)_/g, '$1') // Italic alt
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/```[^`]*```/g, ' ') // Code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/^[-*+]\s+/gm, '') // List items
    .replace(/^\d+\.\s+/gm, '') // Numbered lists
    .replace(/^>\s+/gm, '') // Blockquotes
    .replace(/\$\$[^$]+\$\$/g, '[math]') // Block math
    .replace(/\$([^$]+)\$/g, '$1') // Inline math
    .replace(/---+/g, ' ') // Horizontal rules
    .replace(/\s+/g, ' ')
    .trim();

  return withoutHtml.slice(0, 160) || '—';
}

function countWords(content: string): number {
  // Strip HTML and markdown formatting before counting
  const plainText = (content || '')
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/#{1,6}\s+/g, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`[^`]+`/g, ' code ') // Code (count as one word)
    .replace(/```[^`]*```/g, ' codeblock ') // Code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links (keep link text)
    .replace(/^[-*+]\s+/gm, '') // List markers
    .replace(/^\d+\.\s+/gm, '') // Numbered list markers
    .replace(/\$\$[^$]+\$\$/g, ' equation ') // Math blocks
    .replace(/\$[^$]+\$/g, ' equation ') // Inline math
    .trim();

  return plainText ? plainText.split(/\s+/).length : 0;
}

export function toEntryVm(api: EntryApi): EntryVm {
  const created = isoToDate(api.created_at);
  const _updated = isoToDate(api.updated_at);
  // Use markdown_content if available (when in markdown mode), otherwise fall back to content
  const contentForDisplay = api.markdown_content || api.content || '';
  const preview = buildPreview(contentForDisplay, api.preview ?? undefined);
  return {
    id: api.id,
    title: (api.title ?? '').trim() || 'Untitled',
    preview,
    date: formatYmd(created),
    time: formatHm(created),
    tags: [],
    wordCount: api.word_count || countWords(contentForDisplay),
    created_at: api.created_at,
    updated_at: api.updated_at,
    version: api.version,
  };
}

export function toEntryDetailVm(api: EntryApi): EntryDetailVm {
  const base = toEntryVm(api);
  // Use markdown_content if available, otherwise use content
  const contentForEditor = api.markdown_content || api.content || '';
  return { ...base, content: contentForEditor };
}
