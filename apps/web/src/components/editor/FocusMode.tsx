import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

interface FocusModeProps {
  /** Callback when focus mode state changes */
  onFocusChange?: (isFocused: boolean) => void;
  /** Initial focus state */
  initialFocus?: boolean;
  /** Show the focus toggle button */
  showToggle?: boolean;
  /** Children components */
  children: React.ReactNode;
}

const STORAGE_KEY = 'journal:focus';

/**
 * Focus Mode component that provides distraction-free writing environment
 * with 70ch width lock and calm background overlay using Sanctuary theme.
 */
export const FocusMode: React.FC<FocusModeProps> = ({
  children,
  onFocusChange,
  initialFocus = false,
  showToggle = true,
}) => {
  const [isFocused, setIsFocused] = useState(() => {
    // Load from localStorage on client-side only
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'on';
    }
    return initialFocus;
  });

  // Handle focus toggle
  const toggleFocus = useCallback(() => {
    setIsFocused((prev) => {
      const newFocus = !prev;

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newFocus ? 'on' : 'off');
      }

      // Notify parent
      onFocusChange?.(newFocus);

      return newFocus;
    });
  }, [onFocusChange]);

  // Keyboard shortcut (F key)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Only trigger on 'f' key when no input is focused and no modifiers
      if (
        event.key === 'f' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !document.activeElement?.getAttribute('contenteditable')
      ) {
        event.preventDefault();
        toggleFocus();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [toggleFocus]);

  // Sync with localStorage changes (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const newValue = event.newValue === 'on';
        setIsFocused(newValue);
        onFocusChange?.(newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [onFocusChange]);

  return (
    <div
      className={`
        relative transition-all duration-300 ease-sanctuary
        ${isFocused ? 'max-w-prose mx-auto' : ''}
      `}
      data-focus={isFocused ? 'on' : 'off'}
    >
      {/* Calm Background Overlay */}
      <div
        className={`
          absolute inset-0 -z-10 pointer-events-none
          bg-gradient-radial from-sanctuary-accent/10 via-transparent to-transparent
          transition-opacity duration-300 ease-sanctuary rounded-3xl
          ${isFocused ? 'opacity-100 calm-bg-animated' : 'opacity-0'}
        `}
        style={{
          background: `radial-gradient(60% 40% at 80% 20%, 
            rgba(var(--evergreen-aqua-rgb), 0.12), 
            transparent 60%)`,
        }}
        aria-hidden="true"
      />

      {/* Focus Toggle Button */}
      {showToggle && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={toggleFocus}
            aria-pressed={isFocused}
            title={`${isFocused ? 'Exit' : 'Enter'} Focus Mode (F)`}
            className={`
              px-3 py-1.5 text-sm font-medium font-sans
              border border-sanctuary-accent rounded-lg
              transition-all duration-200 ease-sanctuary
              focus:outline-none focus:ring-2 focus:ring-sanctuary-accent focus:ring-offset-2
              hover:scale-105 active:scale-95
              ${
                isFocused
                  ? 'bg-sanctuary-accent text-sanctuary-bg-primary shadow-md'
                  : 'bg-transparent text-sanctuary-accent hover:bg-sanctuary-accent hover:text-sanctuary-bg-primary'
              }
              dark:border-sanctuary-dark-accent dark:text-sanctuary-dark-accent
              ${
                isFocused
                  ? 'dark:bg-sanctuary-dark-accent dark:text-sanctuary-dark-bg-primary'
                  : 'dark:hover:bg-sanctuary-dark-accent dark:hover:text-sanctuary-dark-bg-primary'
              }
            `}
          >
            {isFocused ? '✕ Exit Focus' : '◯ Focus Mode'}
          </button>
        </div>
      )}

      {/* Content Container */}
      <div
        className={`
        transition-all duration-300 ease-sanctuary
        ${isFocused ? 'px-6' : ''}
      `}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Hook for managing focus mode state without the component wrapper
 */
export const useFocusMode = (initialFocus = false) => {
  const [isFocused, setIsFocused] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'on';
    }
    return initialFocus;
  });

  const toggleFocus = useCallback(() => {
    setIsFocused((prev) => {
      const newFocus = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newFocus ? 'on' : 'off');
      }
      return newFocus;
    });
  }, []);

  const setFocus = useCallback((focus: boolean) => {
    setIsFocused(focus);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, focus ? 'on' : 'off');
    }
  }, []);

  return {
    isFocused,
    toggleFocus,
    setFocus,
  };
};

export default FocusMode;
