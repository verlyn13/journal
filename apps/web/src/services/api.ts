/**
 * API Service for Journal App
 * Handles all API calls to the FastAPI backend
 */

import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens } from './authStore';
import { FLAGS } from '../config/flags';

function normalizeApiBase(raw?: string) {
  // Remove trailing slashes first
  const trimmed = (raw ?? '/api').trim().replace(/\/+$/, '');
  // If it already ends with /api, return as-is (no double /api)
  if (trimmed.endsWith('/api')) return trimmed;
  // Otherwise append /api
  return `${trimmed}/api`;
}

const API_BASE_URL = normalizeApiBase(import.meta.env?.VITE_API_URL);
if (typeof window !== 'undefined') {
  (window as Window & { __API_BASE__?: string }).__API_BASE__ = API_BASE_URL;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  markdown_content?: string;
  // Versioning fields from API (optimistic locking / content representation)
  content_version?: number;
  version?: number;
  date: string;
  time: string;
  preview: string;
  tags: string[];
  wordCount: number;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  entry_count: number;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface SearchResult {
  entry_id: string;
  title: string;
  content_snippet: string;
  score: number;
  created_at: string;
}

class ApiService {
  private getAccessToken(): string | null {
    return getAccessToken();
  }

  private setTokens(tokens: AuthTokens) {
    setAccessToken(tokens.access_token || null);
    if (tokens.refresh_token) setRefreshToken(tokens.refresh_token);
  }

  private clearTokens() {
    clearTokens();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = true,
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Editor-Mode':
        (import.meta as unknown as Record<string, Record<string, unknown>>).env?.VITE_EDITOR ===
        'markdown'
          ? 'markdown'
          : 'html',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add authorization header if token exists and auth is required
    if (requireAuth) {
      const token = this.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };
    const response = await fetch(url, config);

    // Handle unauthorized - try to refresh token
    if (response.status === 401 && requireAuth) {
      const refreshed = await this.refreshToken();
      const newToken = this.getAccessToken();
      if (refreshed && newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        const retryConfig: RequestInit = { ...options, headers };
        const retryResponse = await fetch(url, retryConfig);
        if (!retryResponse.ok) throw new Error(`API Error: ${retryResponse.statusText}`);
        if (retryResponse.status === 204) return {} as T;
        return await retryResponse.json();
      }
      this.clearTokens();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  }

  private async refreshToken(): Promise<boolean> {
    if (!FLAGS.USER_MGMT_ENABLED) return false; // preserve legacy behavior when flag off
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const tokens = await this.request<AuthTokens>(
        '/v1/auth/refresh',
        { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) },
        false,
      );
      // Persist rotated refresh token and update in-memory access
      this.setTokens(tokens);
      return true;
    } catch (_error) {
      this.clearTokens();
      return false;
    }
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<AuthTokens> {
    const tokens = await this.request<AuthTokens>(
      '/v1/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
      false, // Don't require auth for login
    );
    this.setTokens(tokens);
    return tokens;
  }

  async logout(): Promise<void> {
    try {
      const rt = getRefreshToken();
      if (FLAGS.USER_MGMT_ENABLED && rt) {
        await fetch(`${API_BASE_URL}/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: rt }),
        });
      } else {
        await this.request('/v1/auth/logout', { method: 'POST' });
      }
    } finally {
      this.clearTokens();
    }
  }

  async checkAuthStatus(): Promise<AuthStatus> {
    const token = this.getAccessToken();
    if (!token) {
      return { authenticated: false };
    }

    try {
      const user = await this.request<{ id: string; username: string; email: string }>(
        '/v1/auth/me',
      );
      return { authenticated: true, user };
    } catch {
      this.clearTokens();
      return { authenticated: false };
    }
  }

  // Entry endpoints
  async getEntries(): Promise<JournalEntry[]> {
    return this.request<JournalEntry[]>('/v1/entries');
  }

  async getEntry(id: string): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/v1/entries/${id}`);
  }

  async createEntry(entry: {
    title: string;
    content?: string;
    markdown_content?: string;
    content_version?: number;
  }): Promise<JournalEntry> {
    return this.request<JournalEntry>('/v1/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateEntry(
    id: string,
    entry: {
      title?: string;
      content?: string;
      markdown_content?: string;
      content_version?: number;
      is_deleted?: boolean;
      expected_version?: number;
    },
  ): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/v1/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  async deleteEntry(id: string, expectedVersion?: number): Promise<void> {
    // If version is provided, add it as query parameter for optimistic locking
    const versionParam =
      expectedVersion !== undefined ? `?expected_version=${expectedVersion}` : '';
    await this.request(`/v1/entries/${id}${versionParam}`, {
      method: 'DELETE',
    });
  }

  // Search endpoints
  async searchEntries(query: string, limit = 10): Promise<SearchResult[]> {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    return this.request<SearchResult[]>(`/v1/search?${params}`);
  }

  async semanticSearch(query: string, k = 5): Promise<SearchResult[]> {
    return this.request<SearchResult[]>('/v1/search/semantic', {
      method: 'POST',
      body: JSON.stringify({ query, k }),
    });
  }

  // Stats endpoints
  async getStats(): Promise<{
    total_entries: number;
    entries_today: number;
    entries_this_week: number;
    entries_this_month: number;
    recent_entries: number;
    favorite_entries: number;
  }> {
    return this.request('/v1/stats');
  }

  // Demo login for development (using regular login with demo credentials)
  async demoLogin(): Promise<AuthTokens> {
    return this.login('demo', 'demo123');
  }
}

export const api = new ApiService();
export default api;
