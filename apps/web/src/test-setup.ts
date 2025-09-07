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

// Mock CSS.supports for glass morphism tests
// jsdom doesn't actually support backdrop-filter, so we return false
// This ensures tests properly skip backdrop-filter assertions
Object.defineProperty(window.CSS, 'supports', {
  writable: true,
  value: vi.fn().mockImplementation((property: string, _value?: string) => {
    // jsdom doesn't support backdrop-filter, return false
    if (property === 'backdrop-filter' || property === '-webkit-backdrop-filter') {
      return false;
    }
    // Always return false for jsdom environment
    return false;
  }),
});
