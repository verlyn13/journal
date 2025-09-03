/**
 * Domain types for Journal entries
 * Single source of truth for entry-related types
 */

// Branded types for type safety
export type UUID = string & { readonly __brand: 'UUID' };
export type Markdown = string & { readonly __brand: 'Markdown' };
export type HTML = string & { readonly __brand: 'HTML' };

// Entry format types
export type EntryFormat = 'html' | 'markdown';

// Core Entry interface - canonical definition
export interface Entry {
  id: UUID;
  title: string;
  content: string; // Current content (could be HTML or Markdown)
  format: EntryFormat;
  markdown?: Markdown; // Optional markdown version
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

// Entry creation type (without id)
export type NewEntry = Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>;

// Entry update type (partial with required id)
export type UpdateEntry = Partial<Entry> & { id: UUID };

// Entry list item (minimal fields for list views)
export interface EntryListItem {
  id: UUID;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

// Type guards
export function isUUID(value: unknown): value is UUID {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

export function isEntry(obj: unknown): obj is Entry {
  if (!obj || typeof obj !== 'object') return false;
  const e = obj as Record<string, unknown>;

  return (
    typeof e.id === 'string' &&
    typeof e.title === 'string' &&
    typeof e.content === 'string' &&
    (e.format === 'html' || e.format === 'markdown') &&
    (e.markdown === undefined || typeof e.markdown === 'string')
  );
}

export function isEntryFormat(value: unknown): value is EntryFormat {
  return value === 'html' || value === 'markdown';
}

// Type coercion functions
export function toUUID(value: string): UUID {
  if (!isUUID(value)) {
    throw new Error(`Invalid UUID: ${value}`);
  }
  return value;
}

export function toMarkdown(value: string): Markdown {
  return value as Markdown;
}

export function toHTML(value: string): HTML {
  return value as HTML;
}

// Normalizer for API responses
export function normalizeEntry(data: unknown): Entry {
  if (!isEntry(data)) {
    throw new Error('Invalid entry data');
  }

  return {
    id: toUUID(data.id),
    title: data.title,
    content: data.content,
    format: data.format,
    markdown: data.markdown ? toMarkdown(data.markdown) : undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    tags: data.tags,
  };
}
