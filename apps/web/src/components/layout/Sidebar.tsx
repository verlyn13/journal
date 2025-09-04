import { useEffect, useState } from 'react';
import type { Tag } from '../../services/api';
import api from '../../services/api';

interface SidebarProps {
  onCreateEntry?: () => void;
  onSelectView?: (view: string) => void;
  authenticated?: boolean;
}

export function Sidebar({ onCreateEntry, onSelectView, authenticated = false }: SidebarProps) {
  // Theme state sync with localStorage and documentElement class
  const THEME_STORAGE_KEY = 'journal:theme';
  const [theme, setTheme] = useState<'dawn' | 'dusk'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as 'dawn' | 'dusk' | null;
      if (saved === 'dawn' || saved === 'dusk') return saved;
      // Default to system preference
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dusk' : 'dawn';
    }
    return 'dusk';
  });

  // State for real data
  const [stats, setStats] = useState({
    total_entries: 0,
    entries_today: 0,
    entries_this_week: 0,
    entries_this_month: 0,
    recent_entries: 0,
    favorite_entries: 0,
  });
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('today');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const isDark = theme === 'dusk';
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsData = await api.getStats().catch(() => ({
          total_entries: 0,
          entries_today: 0,
          entries_this_week: 0,
          entries_this_month: 0,
          recent_entries: 0,
          favorite_entries: 0,
        }));

        setStats(statsData);
        setTags([]); // No tags support yet
      } catch (_error) {
      } finally {
        setLoading(false);
      }
    };

    if (!authenticated) return; // avoid 401 spam before auth
    fetchData();
    // Refresh data every 30 seconds when authenticated
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [authenticated]);

  const handleViewClick = (view: string) => {
    setSelectedView(view);
    onSelectView?.(view);
  };

  const handleCreateEntry = () => {
    onCreateEntry?.();
  };

  const quickLinks = [
    {
      name: 'Today',
      icon: '📝',
      count: stats.entries_today,
      view: 'today',
      active: selectedView === 'today',
    },
    {
      name: 'This Week',
      icon: '📅',
      count: stats.entries_this_week,
      view: 'week',
      active: selectedView === 'week',
    },
    {
      name: 'Recently edited',
      icon: '⏱️',
      count: stats.recent_entries,
      view: 'recent',
      active: selectedView === 'recent',
    },
    {
      name: 'Favorites',
      icon: '⭐',
      count: stats.favorite_entries,
      view: 'favorites',
      active: selectedView === 'favorites',
    },
  ];

  // For notebooks, we'll use placeholder data for now
  // This would typically come from a separate API endpoint
  const notebooks = [
    { name: 'Personal', count: Math.floor(stats.total_entries * 0.4), color: 'bg-blue-500' },
    { name: 'Work', count: Math.floor(stats.total_entries * 0.3), color: 'bg-green-500' },
    { name: 'Ideas', count: Math.floor(stats.total_entries * 0.2), color: 'bg-purple-500' },
    { name: 'Other', count: Math.floor(stats.total_entries * 0.1), color: 'bg-orange-500' },
  ];

  return (
    <div className="bg-sanctuary-bg-secondary rounded-xl p-4 h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-serif font-bold text-sanctuary-text-primary">Journal</h1>
        <button
          type="button"
          className="w-8 h-8 bg-sanctuary-accent hover:bg-sanctuary-accent-hover text-sanctuary-bg-primary rounded-lg flex items-center justify-center transition-colors"
          title="New Entry"
          onClick={handleCreateEntry}
        >
          <span className="text-sm font-bold">+</span>
        </button>
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <h2 className="text-xs font-medium text-sanctuary-text-secondary uppercase tracking-wide">
          Quick Access
        </h2>
        {quickLinks.map((link) => (
          <button
            type="button"
            key={link.name}
            onClick={() => handleViewClick(link.view)}
            className={`
              w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left
              ${
                link.active
                  ? 'bg-sanctuary-accent text-sanctuary-bg-primary'
                  : 'text-sanctuary-text-primary hover:bg-sanctuary-bg-tertiary'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </div>
            <span
              className={`
              text-xs px-2 py-0.5 rounded-full 
              ${
                link.active
                  ? 'bg-sanctuary-bg-primary/20 text-sanctuary-bg-primary'
                  : 'bg-sanctuary-bg-tertiary text-sanctuary-text-secondary'
              }
            `}
            >
              {loading ? '...' : link.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notebooks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-sanctuary-text-secondary uppercase tracking-wide">
            Notebooks
          </h2>
          <button
            type="button"
            className="text-xs text-sanctuary-accent hover:text-sanctuary-accent-hover"
            onClick={() => {}}
          >
            + New
          </button>
        </div>
        {notebooks.map((notebook) => (
          <button
            type="button"
            key={notebook.name}
            onClick={() => handleViewClick(`notebook:${notebook.name.toLowerCase()}`)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-sanctuary-text-primary hover:bg-sanctuary-bg-tertiary transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${notebook.color}`}></div>
              <span>{notebook.name}</span>
            </div>
            <span className="text-xs text-sanctuary-text-secondary">
              {loading ? '...' : notebook.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-sanctuary-text-secondary uppercase tracking-wide">
            Tags ({tags.length})
          </h2>
          <button
            type="button"
            className="text-xs text-sanctuary-accent hover:text-sanctuary-accent-hover"
            onClick={() => {}}
          >
            Manage
          </button>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {loading ? (
            <div className="text-xs text-sanctuary-text-secondary px-2 py-1">Loading tags...</div>
          ) : tags.length === 0 ? (
            <div className="text-xs text-sanctuary-text-secondary px-2 py-1">No tags yet</div>
          ) : (
            tags.slice(0, 15).map((tag) => (
              <button
                type="button"
                key={tag.name}
                onClick={() => handleViewClick(`tag:${tag.name}`)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-sanctuary-text-primary hover:bg-sanctuary-bg-tertiary transition-colors text-left"
              >
                <span className="text-sanctuary-accent"># {tag.name}</span>
                <span className="text-sanctuary-text-secondary">{tag.entry_count}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="pt-4 border-t border-sanctuary-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-sanctuary-text-secondary">Theme</span>
          <select
            className="text-xs bg-sanctuary-bg-tertiary border border-sanctuary-border rounded px-2 py-1 text-sanctuary-text-primary"
            value={theme}
            onChange={(e) => setTheme(e.target.value === 'dusk' ? 'dusk' : 'dawn')}
            aria-label="Theme selector"
            id="theme-select"
            name="theme"
          >
            <option value="dawn">Dawn</option>
            <option value="dusk">Dusk</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
