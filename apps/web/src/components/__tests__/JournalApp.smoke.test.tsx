import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock API service used by JournalApp
vi.mock('../../services/api', () => {
  return {
    default: {
      checkAuthStatus: vi.fn(async () => ({
        authenticated: true,
        user: { id: 'u1', email: 'u@test' },
      })),
      demoLogin: vi.fn(async () => ({ ok: true })),
      getEntry: vi.fn(async (id: string) => ({
        id,
        title: 'Sample',
        content: '# Hello',
        version: 1,
        content_version: 2,
      })),
      updateEntry: vi.fn(async (id: string, body: unknown) => ({
        id,
        title: 'Sample',
        version: 2,
        content_version: 2,
        ...(typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}),
      })),
    },
  };
});

// Mock react-query hooks used by JournalApp
vi.mock('../../hooks/useEntryQueries', () => {
  return {
    useEntriesList: () => ({
      data: [
        {
          id: 'e1',
          title: 'First',
          preview: 'Preview content',
          date: 'Today',
          time: '10:00',
          wordCount: 10,
          tags: ['t1'],
        },
      ],
      isLoading: false,
    }),
    useCreateEntry: () => ({
      mutateAsync: vi.fn(async () => ({
        id: 'e2',
        title: 'New',
        content: '',
        version: 1,
        content_version: 2,
      })),
    }),
    useDeleteEntry: () => ({ mutateAsync: vi.fn(async () => ({})) }),
  };
});

import { JournalApp } from '../JournalApp';

describe('JournalApp smoke', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders entry list and editor area', async () => {
    render(<JournalApp />);
    // Header
    expect(await screen.findByText(/Journal Entries/i)).toBeDefined();
    // One entry listed
    expect(await screen.findByText('First')).toBeDefined();
  });
});
