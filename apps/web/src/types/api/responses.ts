/**
 * API response types
 */

import type { Entry, EntryListItem } from '../domain/entry';

// Generic API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Entry API responses
export type EntryResponse = ApiResponse<Entry>;
export type EntryListResponse = ApiResponse<PaginatedResponse<EntryListItem>>;
export type EntryCreateResponse = ApiResponse<Entry>;
export type EntryUpdateResponse = ApiResponse<Entry>;
export type EntryDeleteResponse = ApiResponse<{ success: boolean }>;

// Search response
export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  highlights: string[];
}

export type SearchResponse = ApiResponse<SearchResult[]>;
