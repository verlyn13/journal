import type { EntryApi, EntryDetailVm, EntryVm } from "../types/entry";

function isoToDate(iso?: string): Date | null {
  try {
    return iso ? new Date(iso) : null;
  } catch {
    return null;
  }
}

function formatYmd(d: Date | null): string {
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatHm(d: Date | null): string {
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function buildPreview(content: string, existing?: string | null): string {
  if (existing && existing.trim()) return existing;
  const raw = (content || "")
    .replace(/[#*`>_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return raw.slice(0, 160) || "—";
}

function countWords(content: string): number {
  const t = (content || "").trim();
  return t ? t.split(/\s+/).length : 0;
}

export function toEntryVm(api: EntryApi): EntryVm {
  const created = isoToDate(api.created_at);
  const updated = isoToDate(api.updated_at);
  const preview = buildPreview(api.content, api.preview ?? undefined);
  return {
    id: api.id,
    title: (api.title ?? "").trim() || "Untitled",
    preview,
    date: formatYmd(created),
    time: formatHm(created),
    tags: [],
    wordCount: countWords(api.content),
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

export function toEntryDetailVm(api: EntryApi): EntryDetailVm {
  const base = toEntryVm(api);
  return { ...base, content: api.content };
}

