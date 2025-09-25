import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { FLAGS } from '../config/flags';
import { useCreateEntry, useDeleteEntry, useEntriesList } from '../hooks/useEntryQueries';
import api, { type AuthStatus } from '../services/api';
import { subscribe } from '../services/authStore';
import EntryList from './layout/EntryList';
import Sidebar from './layout/Sidebar';
import PassphraseLogin from './auth/PassphraseLogin';

const MarkdownSplitPane = React.lazy(() => import('./markdown/MarkdownSplitPane'));

interface JournalAppState {
  selectedEntryId: string | null;
  selectedEntry: {
    id: string;
    title: string;
    content: string;
    contentVersion?: number;
    version?: number;
  } | null;
  isFocusMode: boolean;
  saving: boolean;
  loading: boolean;
  authenticated: boolean;
  user: AuthStatus['user'];
}

export function JournalApp() {
  const [state, setState] = useState<JournalAppState>({
    selectedEntryId: null,
    selectedEntry: null,
    isFocusMode: false,
    saving: false,
    loading: true,
    authenticated: false,
    user: undefined,
  });

  // Sidebar collapsed state (persisted)
  const SIDEBAR_COLLAPSED_KEY = 'journal:ui:sidebar-collapsed';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved === '1';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isSidebarCollapsed ? '1' : '0');
  }, [isSidebarCollapsed]);

  // Global keyboard shortcut: Cmd/Ctrl + B toggles sidebar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        e.stopPropagation();
        setIsSidebarCollapsed((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  // Cross-tab logout handling
  useEffect(() => {
    const unsub = subscribe((evt) => {
      if (evt && typeof evt === 'object' && 'type' in evt && evt.type === 'logout') {
        setState((prev) => ({ ...prev, authenticated: false, user: undefined }));
      }
    });
    return unsub;
  }, []);

  // Initialize app and check authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (FLAGS.USER_MGMT_ENABLED) {
          const authStatus = await api.checkAuthStatus();
          setState((prev) => ({
            ...prev,
            authenticated: authStatus.authenticated,
            user: authStatus.user,
            loading: false,
          }));
        } else {
          const authStatus = await api.checkAuthStatus();
          if (!authStatus.authenticated) {
            // Try demo login for development
            await api.demoLogin();
            const newAuthStatus = await api.checkAuthStatus();
            setState((prev) => ({
              ...prev,
              authenticated: newAuthStatus.authenticated,
              user: newAuthStatus.user,
              loading: false,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              authenticated: authStatus.authenticated,
              user: authStatus.user,
              loading: false,
            }));
          }
        }

        // Entries will be populated via react-query below
      } catch (_error) {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    initializeApp();
  }, []);

  // List entries via react-query (only when authenticated)
  const { data: listData = [], isLoading: listLoading } = useEntriesList(state.authenticated);

  // Handle entry selection - simplified without async
  const handleSelectEntry = useCallback((entryId: string) => {
    // Immediately update the selection for instant feedback
    setState((prev) => {
      return { ...prev, selectedEntryId: entryId };
    });

    // Load content asynchronously
    api
      .getEntry(entryId)
      .then((entry) => {
        // Prefer markdown_content for the markdown editor; convert HTML if needed
        let contentForEditor = entry.markdown_content as unknown as string | undefined;
        if (!contentForEditor && entry.content) {
          import('../utils/markdown-converter').then((mod) => {
            try {
              const res = mod.convertHtmlToMarkdown(entry.content as unknown as string);
              contentForEditor = res.markdown || entry.content;
            } catch {
              contentForEditor = (entry.content as unknown as string) || '';
            }

            setState((prev) => ({
              ...prev,
              selectedEntry: {
                id: entry.id,
                title: entry.title,
                content: contentForEditor || '',
                contentVersion: entry.content_version || 1,
                version: entry.version,
              },
            }));
            // entry state updated after HTML->Markdown conversion
          });
        } else {
          setState((prev) => ({
            ...prev,
            selectedEntry: {
              id: entry.id,
              title: entry.title,
              content: contentForEditor || '',
              contentVersion: entry.content_version || 1,
              version: entry.version,
            },
          }));
          // entry state updated
        }
      })
      .catch((_error) => {
        // Reset selection on error
        setState((prev) => ({
          ...prev,
          selectedEntryId: null,
          selectedEntry: null,
        }));
      });
  }, []);

  // Removed legacy save callback (replaced by MarkdownSplitPane onSave)

  // Handle entry deletion
  const deleteEntryMut = useDeleteEntry();
  const handleDeleteEntry = useCallback(
    async (entryId: string) => {
      try {
        // Fetch fresh entry data to get current version (avoid stale version issues)
        let version: number | undefined;
        try {
          const freshEntry = await api.getEntry(entryId);
          version = freshEntry.version;
        } catch {
          // If fetch fails, try with no version (server will handle conflict)
        }

        // Delete with version for optimistic locking
        await deleteEntryMut.mutateAsync({ entryId, version });

        // Clear selection if deleted entry was selected
        if (state.selectedEntryId === entryId) {
          setState((prev) => ({
            ...prev,
            selectedEntryId: null,
            selectedEntry: null,
          }));
        }
      } catch (_error) {
        // TODO: Add error notification
      }
    },
    [deleteEntryMut, state.selectedEntryId],
  );

  // Handle new entry creation
  const createEntryMut = useCreateEntry();
  const handleCreateEntry = useCallback(
    async (title?: string) => {
      try {
        // Generate default title if not provided
        const entryTitle = title || `New Entry - ${new Date().toLocaleDateString()}`;
        const created = await createEntryMut.mutateAsync({
          title: entryTitle,
          content: '# Start writing your thoughts...\n',
        });
        setState((prev) => ({
          ...prev,
          selectedEntryId: created.id,
          selectedEntry: {
            id: created.id,
            title: created.title || entryTitle,
            content:
              created.markdown_content || created.content || '# Start writing your thoughts...\n',
            contentVersion: created.content_version || 2,
            version: created.version || 1,
          },
        }));
      } catch (_error) {}
    },
    [createEntryMut],
  );

  // Handle focus mode toggle
  // Focus mode toggle (not used in current layout)

  // Show loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-sanctuary-bg-primary text-sanctuary-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sanctuary-text-primary mx-auto mb-4"></div>
          <p>Loading your journal...</p>
        </div>
      </div>
    );
  }

  // Show authentication required state (flag-aware)
  if (!state.authenticated && FLAGS.USER_MGMT_ENABLED) {
    return (
      <PassphraseLogin
        onSuccess={() => {
          // Reload auth state
          api.checkAuthStatus().then((authStatus) => {
            setState((prev) => ({
              ...prev,
              authenticated: authStatus.authenticated,
              user: authStatus.user,
              loading: false,
            }));
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sanctuary-bg-primary text-sanctuary-text-primary">
      {/* Three-Pane Layout */}
      <div
        className={`
        relative grid min-h-screen transition-all duration-300 ease-sanctuary
        ${
          state.isFocusMode
            ? 'grid-cols-1'
            : isSidebarCollapsed
              ? 'grid-cols-[1fr_minmax(480px,720px)]'
              : 'grid-cols-[260px_1fr_minmax(480px,720px)]'
        } 
        gap-4 p-4
        `}
      >
        {/* Left Sidebar */}
        {!isSidebarCollapsed && !state.isFocusMode ? (
          <aside data-testid="sidebar" className="transition-all duration-300 ease-sanctuary">
            <Sidebar
              onCreateEntry={() => handleCreateEntry()}
              onToggleCollapse={() => setIsSidebarCollapsed(true)}
              authenticated={state.authenticated}
            />
          </aside>
        ) : null}

        {/* Center - Entry List */}
        <main
          data-testid="entry-list"
          className={`
            transition-all duration-300 ease-sanctuary
            ${state.isFocusMode ? 'hidden' : 'block'}
          `}
        >
          <EntryList
            entries={listData}
            selectedEntry={state.selectedEntryId}
            onSelectEntry={handleSelectEntry}
            onCreateEntry={handleCreateEntry}
            onDeleteEntry={handleDeleteEntry}
            isLoading={listLoading}
          />
        </main>

        {/* Right - Editor */}
        <section
          className={`
          transition-all duration-300 ease-sanctuary
          ${state.isFocusMode ? 'max-w-prose mx-auto' : ''}
        `}
        >
          <Suspense
            fallback={
              <div className="p-4 text-sm text-sanctuary-text-tertiary">Loading editor…</div>
            }
          >
            <MarkdownSplitPane
              entry={
                state.selectedEntry
                  ? {
                      id: state.selectedEntry.id,
                      title: state.selectedEntry.title,
                      content: state.selectedEntry.content,
                    }
                  : null
              }
              onSave={async ({ markdown }) => {
                if (!state.selectedEntryId) return;
                try {
                  const updated = await api.updateEntry(state.selectedEntryId, {
                    title: state.selectedEntry?.title,
                    content: markdown,
                    markdown_content: markdown,
                    content_version: state.selectedEntry?.contentVersion === 1 ? 1 : 2,
                    expected_version: state.selectedEntry?.version || 1,
                  });
                  setState((prev) => ({
                    ...prev,
                    selectedEntry: {
                      id: updated.id,
                      title: updated.title,
                      content: markdown,
                      contentVersion: updated.content_version || 2,
                      version: updated.version,
                    },
                  }));
                } catch (_e) {
                  // TODO: Add proper error handling/notification
                }
              }}
            />
          </Suspense>
        </section>

        {/* Hover-peek tab for collapsed sidebar */}
        {isSidebarCollapsed && !state.isFocusMode ? (
          <div
            className="group absolute left-1 top-4 bottom-4 z-30 flex items-center"
            data-testid="sidebar-peek"
          >
            {/* Tab */}
            <button
              type="button"
              aria-label="Toggle sidebar"
              title="Toggle sidebar (Cmd/Ctrl+B)"
              className="h-28 w-6 rounded-r bg-sanctuary-accent/80 hover:bg-sanctuary-accent focus:ring-2 ring-sanctuary-accent-outline outline-none transition-colors flex items-center justify-center"
              onClick={() => setIsSidebarCollapsed(false)}
              onMouseEnter={() => {
                // No-op; hover handled by CSS to reveal panel
              }}
              data-testid="sidebar-peek-tab"
            >
              <svg
                className="w-3 h-3 text-sanctuary-bg-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Open sidebar</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            {/* Peek panel */}
            <div className="pointer-events-none ml-1 opacity-0 translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-sanctuary">
              <div className="pointer-events-auto w-[260px] shadow-xl rounded-xl overflow-hidden border border-sanctuary-border bg-sanctuary-bg-secondary">
                <Sidebar
                  onCreateEntry={() => handleCreateEntry()}
                  onToggleCollapse={() => setIsSidebarCollapsed(false)}
                  authenticated={state.authenticated}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Focus Mode Background */}
        <div
          className={`
            absolute inset-0 -z-10 pointer-events-none
            bg-gradient-radial from-evergreen-aqua/8 via-transparent to-transparent
            transition-opacity duration-500 ease-sanctuary
            ${state.isFocusMode ? 'opacity-100' : 'opacity-0'}
          `}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default JournalApp;
