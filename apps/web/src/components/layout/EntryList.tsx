import { useState } from 'react';
import type { EntryVm } from '../../types/entry';

interface EntryListProps {
  entries: ReadonlyArray<EntryVm>;
  selectedEntry: string | null;
  onSelectEntry: (entryId: string) => void;
  onCreateEntry: (title: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function EntryList({
  entries,
  selectedEntry,
  onSelectEntry,
  onCreateEntry,
  isLoading,
}: EntryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'river'>('list');

  const allEntries = entries;

  const filteredEntries = allEntries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const formatDate = (dateStr: string) => {
    if (dateStr === 'Today') return dateStr;
    if (dateStr === 'Yesterday') return dateStr;
    return dateStr;
  };

  return (
    <div className="bg-sanctuary-bg-secondary rounded-xl p-4 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-sanctuary-text-primary">
            Journal Entries
          </h2>
          <div className="flex items-center gap-1 bg-sanctuary-bg-tertiary rounded-lg p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-sanctuary-accent text-sanctuary-bg-primary'
                  : 'text-sanctuary-text-secondary hover:text-sanctuary-text-primary'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-sanctuary-accent text-sanctuary-bg-primary'
                  : 'text-sanctuary-text-secondary hover:text-sanctuary-text-primary'
              }`}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode('river')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                viewMode === 'river'
                  ? 'bg-sanctuary-accent text-sanctuary-bg-primary'
                  : 'text-sanctuary-text-secondary hover:text-sanctuary-text-primary'
              }`}
            >
              River
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="search"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-sanctuary-bg-tertiary border border-sanctuary-border rounded-lg text-sm text-sanctuary-text-primary placeholder-sanctuary-text-secondary focus:outline-none focus:ring-2 focus:ring-sanctuary-accent focus:border-transparent"
            id="search-input"
            name="q"
            aria-label="Search entries"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-sanctuary-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Search</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-sanctuary-text-secondary">
          {isLoading ? (
            <span>Loading entries...</span>
          ) : allEntries.length === 0 ? (
            <div className="text-sm text-sanctuary-text-secondary">
              No entries yet.{' '}
              <button
                type="button"
                onClick={() => onCreateEntry('Untitled')}
                className="underline text-sanctuary-accent hover:text-sanctuary-accent/80"
              >
                Create your first entry
              </button>
            </div>
          ) : (
            <>
              <span>{filteredEntries.length} entries</span>
              <span>•</span>
              <span>
                {filteredEntries.reduce((acc, entry) => acc + entry.wordCount, 0).toLocaleString()}{' '}
                words total
              </span>
            </>
          )}
        </div>
      </div>

      {/* Entry List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredEntries.map((entry) => (
          <button
            type="button"
            key={entry.id}
            onClick={() => onSelectEntry(entry.id)}
            className={`
              w-full p-3 rounded-lg text-left transition-all duration-200 group
              ${
                selectedEntry === entry.id
                  ? 'bg-sanctuary-accent text-sanctuary-bg-primary shadow-md'
                  : 'bg-sanctuary-bg-tertiary hover:bg-sanctuary-bg-primary/50 text-sanctuary-text-primary hover:shadow-sm'
              }
            `}
          >
            {/* Entry Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium text-sm truncate ${
                    selectedEntry === entry.id
                      ? 'text-sanctuary-bg-primary'
                      : 'text-sanctuary-text-primary group-hover:text-sanctuary-text-primary'
                  }`}
                >
                  {entry.title}
                </h3>
                <div
                  className={`flex items-center gap-2 text-xs mt-1 ${
                    selectedEntry === entry.id
                      ? 'text-sanctuary-bg-primary/80'
                      : 'text-sanctuary-text-secondary'
                  }`}
                >
                  <span>{formatDate(entry.date)}</span>
                  <span>•</span>
                  <span>{entry.time}</span>
                  <span>•</span>
                  <span>{entry.wordCount} words</span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {/* Mood removed as it's not in API */}
              </div>
            </div>

            {/* Entry Preview */}
            <p
              className={`text-xs leading-relaxed mb-2 line-clamp-2 ${
                selectedEntry === entry.id
                  ? 'text-sanctuary-bg-primary/90'
                  : 'text-sanctuary-text-secondary'
              }`}
            >
              {entry.preview}
            </p>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedEntry === entry.id
                        ? 'bg-sanctuary-bg-primary/20 text-sanctuary-bg-primary'
                        : 'bg-sanctuary-accent/20 text-sanctuary-accent'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
                {entry.tags.length > 3 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedEntry === entry.id
                        ? 'bg-sanctuary-bg-primary/20 text-sanctuary-bg-primary'
                        : 'bg-sanctuary-bg-tertiary text-sanctuary-text-secondary'
                    }`}
                  >
                    +{entry.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-sanctuary-border">
        <div className="flex items-center justify-between text-xs text-sanctuary-text-secondary">
          <span>Scroll for more entries</span>
          <button type="button" className="text-sanctuary-accent hover:text-sanctuary-accent-hover">
            View All
          </button>
        </div>
      </div>
    </div>
  );
}

export default EntryList;
