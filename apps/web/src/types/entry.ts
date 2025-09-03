// Distinct types for API payloads and UI view-models

export type EntryApi = {
  id: string;
  title: string | null;
  content: string; // markdown or serialized rich text
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
  preview?: string | null;
  date?: string | null;
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
};

// Detail VM for editor view
export type EntryDetailVm = EntryVm & {
  content: string;
};
