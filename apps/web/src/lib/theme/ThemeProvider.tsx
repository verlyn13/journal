import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { generateCSSVariables, type ThemeMode } from '../design-tokens';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultMode = 'dawn',
  storageKey = 'journal-theme-mode',
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as ThemeMode | null;
      if (stored && (stored === 'dawn' || stored === 'dusk')) {
        setModeState(stored);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey]);

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;

    // Remove previous theme class
    root.classList.remove('dawn', 'dusk', 'dark');

    // Add new theme class
    root.classList.add(mode);

    // Add 'dark' class for Tailwind dark mode when in dusk mode
    if (mode === 'dusk') {
      root.classList.add('dark');
    }

    // Generate and apply CSS custom properties
    const cssVariables = generateCSSVariables(mode);

    // Create or update style element
    let styleElement = document.getElementById('theme-variables');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'theme-variables';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      :root {
        ${cssVariables}
      }
      
      /* Smooth theme transitions */
      * {
        transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
      }
      
      /* Disable transitions during theme change to prevent flicker */
      .theme-changing * {
        transition: none !important;
      }
    `;

    // Persist to localStorage
    try {
      localStorage.setItem(storageKey, mode);
    } catch {
      // Ignore localStorage errors
    }
  }, [mode, storageKey]);

  const setMode = (newMode: ThemeMode) => {
    // Add temporary class to disable transitions
    document.documentElement.classList.add('theme-changing');

    setModeState(newMode);

    // Remove the class after a brief delay
    setTimeout(() => {
      document.documentElement.classList.remove('theme-changing');
    }, 50);
  };

  const toggleMode = () => {
    setMode(mode === 'dawn' ? 'dusk' : 'dawn');
  };

  const value: ThemeContextType = {
    mode,
    setMode,
    toggleMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
