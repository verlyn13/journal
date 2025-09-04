import { useCallback, useEffect, useState } from 'react';
import { useCreateEntry, useEntriesList } from '../hooks/useEntryQueries';
import api, { type AuthStatus } from '../services/api';
import EntryList from './layout/EntryList';
import Sidebar from './layout/Sidebar';
import MarkdownSplitPane from './markdown/MarkdownSplitPane';

interface JournalAppState {
  selectedEntryId: string | null;
  selectedEntry: { id: string; title: string; content: string } | null;
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

  // Initialize app and check authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
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

        // Entries will be populated via react-query below
      } catch (_error) {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    initializeApp();
  }, []);

  // List entries via react-query (only when authenticated)
  const { data: listData = [], isLoading: listLoading } = useEntriesList(state.authenticated);

  // Handle entry selection
  const handleSelectEntry = useCallback(async (entryId: string) => {
    setState((prev) => ({ ...prev, selectedEntryId: entryId }));

    try {
      const entry = await api.getEntry(entryId);
      // Prefer markdown_content for the markdown editor; convert HTML if needed
      let contentForEditor = entry.markdown_content as unknown as string | undefined;
      if (!contentForEditor && entry.content) {
        try {
          const mod = await import('../utils/markdown-converter');
          const res = mod.convertHtmlToMarkdown(entry.content as unknown as string);
          contentForEditor = res.markdown || entry.content;
        } catch {
          contentForEditor = (entry.content as unknown as string) || '';
        }
      }
      setState((prev) => ({
        ...prev,
        selectedEntry: { id: entry.id, title: entry.title, content: contentForEditor || '' },
      }));
    } catch (_error) {
      // Reset selection on error
      setState((prev) => ({
        ...prev,
        selectedEntryId: null,
        selectedEntry: null,
      }));
    }
  }, []);

  // Removed legacy save callback (replaced by MarkdownSplitPane onSave)

  // Handle new entry creation
  const createEntryMut = useCreateEntry();
  const handleCreateEntry = useCallback(
    async (title?: string) => {
      try {
        // Generate default title if not provided
        const entryTitle = title || `New Entry - ${new Date().toLocaleDateString()}`;
        const created = await createEntryMut.mutateAsync({
          title: entryTitle,
          markdown_content: '# Start writing your thoughts...\n',
          content_version: 2,
        });
        setState((prev) => ({
          ...prev,
          selectedEntryId: created.id,
          selectedEntry: {
            id: created.id,
            title: created.title || entryTitle,
            content: created.markdown_content || '# Start writing your thoughts...\n',
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

  // Show authentication required state
  if (!state.authenticated) {
    return (
      <div className="min-h-screen bg-sanctuary-bg-primary text-sanctuary-text-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Journal</h1>
          <p className="mb-4">Please authenticate to continue</p>
          <button
            type="button"
            onClick={async () => {
              try {
                await api.demoLogin();
                window.location.reload();
              } catch (_error) {}
            }}
            className="bg-sanctuary-accent text-white px-4 py-2 rounded hover:bg-sanctuary-accent/80"
          >
            Demo Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sanctuary-bg-primary text-sanctuary-text-primary">
      {/* Three-Pane Layout */}
      <div
        className={`
        relative grid min-h-screen transition-all duration-300 ease-sanctuary
        ${state.isFocusMode ? 'grid-cols-1' : 'grid-cols-[260px_1fr_minmax(480px,720px)]'} 
        gap-4 p-4
        `}
      >
        {/* Left Sidebar */}
        <aside
          data-testid="sidebar"
          className={`
            transition-all duration-300 ease-sanctuary
            ${state.isFocusMode ? 'hidden' : 'block'}
          `}
        >
          <Sidebar onCreateEntry={() => handleCreateEntry()} authenticated={state.authenticated} />
        </aside>

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
                  content_version: 2,
                });
                setState((prev) => ({
                  ...prev,
                  selectedEntry: { id: updated.id, title: updated.title, content: markdown },
                }));
              } catch (_e) {
                // TODO: Add proper error handling/notification
              }
            }}
          />
        </section>

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
