import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia defensively
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock IntersectionObserver defensively
if (typeof (window as any).IntersectionObserver !== 'function') {
  (window as any).IntersectionObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
  };
}

// Mock ResizeObserver defensively
if (typeof (window as any).ResizeObserver !== 'function') {
  (window as any).ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
}

// Mock DOMRect if missing
if (typeof (window as any).DOMRect !== 'function') {
  (window as any).DOMRect = class {
    static fromRect(_rect?: Partial<DOMRect>) {
      return new (window as any).DOMRect();
    }
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    top = 0;
    right = 0;
    bottom = 0;
    left = 0;
  };
}

// Mock Element.animate for Web Animations API
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  Element.prototype.animate = vi.fn().mockImplementation((keyframes, options) => ({
    play: vi.fn(),
    pause: vi.fn(),
    cancel: vi.fn(),
    finish: vi.fn(),
    reverse: vi.fn(),
    currentTime: 0,
    effect: {
      getComputedTiming: vi.fn().mockReturnValue({
        duration: options?.duration || 0,
        delay: options?.delay || 0,
        endDelay: 0,
        fill: options?.fill || 'auto',
        iterationStart: 0,
        iterations: 1,
        easing: options?.easing || 'linear',
        direction: 'normal',
        progress: 0,
        currentIteration: 0,
        localTime: 0,
        activeDuration: options?.duration || 0,
        endTime: options?.duration || 0,
      }),
    },
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    startTime: null,
    playState: 'idle',
    playbackRate: 1,
    timeline: null,
    id: '',
    pending: false,
    onfinish: null,
    oncancel: null,
    onremove: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    commitStyles: vi.fn(),
    persist: vi.fn(),
    updatePlaybackRate: vi.fn(),
  }));
}

// Mock backdrop-filter support for glass morphism tests
// The supportsBackdropFilter function checks for __BACKDROP_SUPPORT_OVERRIDE__ first
// This works in both jsdom and happy-dom environments
(window as unknown as { __BACKDROP_SUPPORT_OVERRIDE__?: boolean }).__BACKDROP_SUPPORT_OVERRIDE__ =
  false;

// Ensure window.CSS exists before defining supports
if (!('CSS' in window) || typeof (window as any).CSS !== 'object' || (window as any).CSS === null) {
  // Define a minimal CSS object
  Object.defineProperty(window, 'CSS', {
    configurable: true,
    writable: true,
    value: {},
  });
}

// Provide CSS.supports if not available
if (typeof (window as any).CSS.supports !== 'function') {
  Object.defineProperty((window as any).CSS, 'supports', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((property: string, _value?: string) => {
      // Always return false for backdrop-filter in test environment
      if (property === 'backdrop-filter' || property === '-webkit-backdrop-filter') {
        return false;
      }
      return false;
    }),
  });
}

// Mock HTMLElement constructor for instanceof checks
if (typeof window !== 'undefined' && typeof HTMLElement === 'undefined') {
  (globalThis as any).HTMLElement = class HTMLElement {
    static [Symbol.hasInstance](obj: any) {
      return obj && typeof obj === 'object' && obj.nodeType === 1;
    }
  };
}

// Ensure Element constructor exists for instanceof checks
if (typeof window !== 'undefined' && typeof Element === 'undefined') {
  (globalThis as any).Element = class Element {
    static [Symbol.hasInstance](obj: any) {
      return obj && typeof obj === 'object' && obj.nodeType === 1;
    }
  };
}

// Mock DocumentType for instanceof checks
if (typeof window !== 'undefined' && typeof DocumentType === 'undefined') {
  (globalThis as any).DocumentType = class DocumentType {
    static [Symbol.hasInstance](obj: any) {
      return obj && typeof obj === 'object' && obj.nodeType === 10;
    }
  };
}
