/**
 * API Service for Journal App
 * Handles all API calls to the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
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
    return localStorage.getItem('access_token');
  }

  private setTokens(tokens: AuthTokens) {
    localStorage.setItem('access_token', tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
  }

  private clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };
    const response = await fetch(url, config);

    // Handle unauthorized - try to refresh token
    if (response.status === 401 && requireAuth) {
      await this.refreshToken();
      const newToken = this.getAccessToken();
      if (newToken) {
        // Retry with new token
        return this.request(endpoint, options, requireAuth);
      }
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

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return;

    try {
      const tokens = await this.request<AuthTokens>(
        '/v1/auth/refresh',
        {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
        false, // Don't require auth for refresh
      );
      this.setTokens(tokens);
    } catch (_error) {
      this.clearTokens();
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
      await this.request('/v1/auth/logout', { method: 'POST' });
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
    },
  ): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/v1/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  async deleteEntry(id: string): Promise<void> {
    await this.request(`/v1/entries/${id}`, {
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
