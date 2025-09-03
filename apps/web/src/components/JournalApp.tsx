import { useCallback, useEffect, useState } from 'react';
import { useCreateEntry, useEntriesList } from '../hooks/useEntryQueries';
import { mdToHtml } from '../lib/mdToHtml';
import api, { type AuthStatus } from '../services/api';
import FocusMode from './editor/FocusMode';
import Editor from './editor/JournalEditor';
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
      setState((prev) => ({
        ...prev,
        selectedEntry: { id: entry.id, title: entry.title, content: entry.content },
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

  // Handle entry save
  const handleSaveEntry = useCallback(
    async (content: string, title: string) => {
      if (!state.selectedEntryId || !state.selectedEntry) return;

      try {
        setState((prev) => ({ ...prev, saving: true }));

        const updatedEntry = await api.updateEntry(state.selectedEntryId, {
          content,
          title,
        });

        // Update entry in state
        setState((prev) => ({
          ...prev,
          selectedEntry: { ...updatedEntry, title, content },
          saving: false,
        }));
      } catch (_error) {
        setState((prev) => ({ ...prev, saving: false }));
      }
    },
    [state.selectedEntryId, state.selectedEntry],
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
          content: '<p>Start writing your thoughts...</p>',
        });
        setState((prev) => ({
          ...prev,
          selectedEntryId: created.id,
          selectedEntry: {
            id: created.id,
            title: created.title || entryTitle,
            content: created.content || '<p>Start writing your thoughts...</p>',
          },
        }));
      } catch (_error) {}
    },
    [createEntryMut],
  );

  // Handle focus mode toggle
  const handleFocusChange = useCallback((focused: boolean) => {
    setState((prev) => ({ ...prev, isFocusMode: focused }));
  }, []);

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
          <Sidebar onCreateEntry={() => handleCreateEntry()} />
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
          {import.meta.env.VITE_EDITOR === 'markdown' ? (
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
                const html = mdToHtml(markdown);
                try {
                  const updated = await api.updateEntry(state.selectedEntryId, {
                    title: state.selectedEntry?.title,
                    content: html,
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
          ) : (
            <FocusMode onFocusChange={handleFocusChange} showToggle={true}>
              <Editor
                selectedEntry={state.selectedEntry || undefined}
                onSave={handleSaveEntry}
                saving={state.saving}
              />
            </FocusMode>
          )}
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
