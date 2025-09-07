import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock backdrop-filter support for glass morphism tests
// The supportsBackdropFilter function checks for __BACKDROP_SUPPORT_OVERRIDE__ first
// This works in both jsdom and happy-dom environments
(window as unknown as { __BACKDROP_SUPPORT_OVERRIDE__?: boolean }).__BACKDROP_SUPPORT_OVERRIDE__ =
  false;

// Also mock CSS.supports for consistency
Object.defineProperty(window.CSS, 'supports', {
  writable: true,
  value: vi.fn().mockImplementation((property: string, _value?: string) => {
    // Always return false for backdrop-filter in test environment
    if (property === 'backdrop-filter' || property === '-webkit-backdrop-filter') {
      return false;
    }
    return false;
  }),
});
