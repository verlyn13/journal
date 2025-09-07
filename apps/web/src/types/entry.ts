// Distinct types for API payloads and UI view-models

export type EntryApi = {
  id: string;
  title: string | null;
  content: string; // HTML or markdown depending on mode
  markdown_content?: string | null; // Markdown version when available
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
  preview?: string | null;
  date?: string | null;
  version?: number; // For optimistic locking
  content_version?: number; // Content format version
  word_count?: number; // Word count from backend
};

// View model used by UI components (list)
export type EntryVm = {
  id: string;
  title: string;
  preview: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (locale)
  tags: string[];
  wordCount: number;
  created_at?: string;
  updated_at?: string;
  version?: number; // For optimistic locking
};

// Detail VM for editor view
export type EntryDetailVm = EntryVm & {
  content: string;
};
