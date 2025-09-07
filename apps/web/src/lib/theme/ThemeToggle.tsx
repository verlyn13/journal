import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  variant?: 'button' | 'select';
}

export function ThemeToggle({ className = '', variant = 'button' }: ThemeToggleProps) {
  const { mode, setMode, toggleMode } = useTheme();

  if (variant === 'select') {
    return (
      <select
        className={`text-xs bg-sanctuary-bg-tertiary border border-sanctuary-border rounded px-2 py-1 text-sanctuary-text-primary ${className}`}
        value={mode}
        onChange={(e) => setMode(e.target.value as 'dawn' | 'dusk')}
        aria-label="Select theme mode"
      >
        <option value="dawn">☀️ Dawn</option>
        <option value="dusk">🌙 Dusk</option>
      </select>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-sanctuary-bg-tertiary focus:outline-none focus:ring-2 focus:ring-sanctuary-accent ${className}`}
      aria-label={`Switch to ${mode === 'dawn' ? 'dusk' : 'dawn'} mode`}
      title={`Switch to ${mode === 'dawn' ? 'dusk' : 'dawn'} mode`}
    >
      <span className="text-sm">{mode === 'dawn' ? '🌙' : '☀️'}</span>
    </button>
  );
}

// Segmented control variant for more design-forward interfaces
export function ThemeSegmentedControl({ className = '' }: { className?: string }) {
  const { mode, setMode } = useTheme();

  return (
    <div className={`inline-flex bg-sanctuary-bg-tertiary rounded-lg p-1 ${className}`}>
      <button
        type="button"
        onClick={() => setMode('dawn')}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          mode === 'dawn'
            ? 'bg-sanctuary-accent text-sanctuary-bg-primary'
            : 'text-sanctuary-text-secondary hover:text-sanctuary-text-primary'
        }`}
        aria-pressed={mode === 'dawn'}
      >
        ☀️ Dawn
      </button>
      <button
        type="button"
        onClick={() => setMode('dusk')}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          mode === 'dusk'
            ? 'bg-sanctuary-accent text-sanctuary-bg-primary'
            : 'text-sanctuary-text-secondary hover:text-sanctuary-text-primary'
        }`}
        aria-pressed={mode === 'dusk'}
      >
        🌙 Dusk
      </button>
    </div>
  );
}
