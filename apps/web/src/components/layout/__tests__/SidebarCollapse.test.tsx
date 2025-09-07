import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JournalApp } from '../../../components/JournalApp';

// Mock the API module to avoid network and control auth
vi.mock('../../../services/api', () => {
  return {
    __esModule: true,
    default: {
      getEntries: vi.fn(async () => []),
      getEntry: vi.fn(async (id: string) => ({ id, title: 'T', content: '# T' })),
      createEntry: vi.fn(async ({ title }: { title: string }) => ({
        id: 'e1',
        title,
        content: '',
      })),
      updateEntry: vi.fn(async (_id: string, payload: Record<string, unknown>) => ({
        id: 'e1',
        title: (payload.title as string) || 'T',
        content: (payload.markdown_content as string) || '',
      })),
      deleteEntry: vi.fn(),
      checkAuthStatus: vi.fn(async () => ({
        authenticated: true,
        user: { id: '1', username: 'demo', email: 'demo@example.com' },
      })),
      demoLogin: vi.fn(async () => ({ access_token: 't', token_type: 'bearer' })),
      logout: vi.fn(),
      searchEntries: vi.fn(async () => []),
      semanticSearch: vi.fn(async () => []),
      getStats: vi.fn(async () => ({
        total_entries: 0,
        entries_today: 0,
        entries_this_week: 0,
        entries_this_month: 0,
        recent_entries: 0,
        favorite_entries: 0,
      })),
    },
  };
});

describe('Sidebar collapse + keyboard toggle', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (component: React.ReactElement) =>
    render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset persisted state
    localStorage.removeItem('journal:ui:sidebar-collapsed');
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  it('toggles collapse with Cmd/Ctrl+B and shows hover-peek tab', async () => {
    renderWithProviders(<JournalApp />);

    await waitFor(() => {
      // Loading screen should be gone
      expect(screen.queryByText('Loading your journal...') === null).toBe(true);
    });

    // Sidebar visible initially
    expect(!!screen.getByTestId('sidebar')).toBe(true);

    // Press Ctrl+B (simulate Windows/Linux)
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });

    // Sidebar hidden, peek tab visible
    await waitFor(() => {
      expect(screen.queryByTestId('sidebar')).toBeNull();
      expect(!!screen.getByTestId('sidebar-peek-tab')).toBe(true);
    });

    // Clicking the tab expands back
    fireEvent.click(screen.getByTestId('sidebar-peek-tab'));

    await waitFor(() => {
      expect(!!screen.getByTestId('sidebar')).toBe(true);
    });
  });

  it('persists collapsed state across reloads', async () => {
    const { unmount } = renderWithProviders(<JournalApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading your journal...') === null).toBe(true);
    });

    // Collapse via Cmd+B (simulate macOS)
    fireEvent.keyDown(window, { key: 'b', metaKey: true });

    await waitFor(() => {
      expect(screen.queryByTestId('sidebar')).toBeNull();
      expect(localStorage.getItem('journal:ui:sidebar-collapsed')).toBe('1');
    });

    // Unmount + remount
    unmount();
    renderWithProviders(<JournalApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading your journal...') === null).toBe(true);
    });

    // Should remain collapsed
    expect(screen.queryByTestId('sidebar')).toBeNull();
    expect(!!screen.getByTestId('sidebar-peek-tab')).toBe(true);
  });
});
