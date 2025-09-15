import '@testing-library/jest-dom/vitest';
// Hint to application code that we are in a test environment
// Enables test-friendly code paths when needed
(globalThis as unknown as { __TEST__?: boolean }).__TEST__ = true;

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock localStorage and sessionStorage for React 19 compatibility
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

// Define localStorage and sessionStorage on global scope
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock,
  configurable: true,
  writable: true,
});

// Also define on window for browser-style access
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    configurable: true,
    writable: true,
  });
}

// Ensure strong test isolation between files and tests
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.resetModules();
  // Reset DOM and storage to avoid cross-test leakage
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
  // Clear our mocked storage
  localStorageMock.clear();
  sessionStorageMock.clear();
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
  const animateImpl = function (
    this: Element,
    keyframes?: Keyframe[] | PropertyIndexedKeyframes,
    options?: number | KeyframeAnimationOptions,
  ): Animation {
    const opts = (typeof options === 'number' ? { duration: options } : options) || {};
    const effectTiming = {
      duration: (opts as KeyframeAnimationOptions).duration || 0,
      delay: (opts as KeyframeAnimationOptions).delay || 0,
      endDelay: 0,
      fill: (opts as KeyframeAnimationOptions).fill || 'auto',
      iterationStart: 0,
      iterations: 1,
      easing: (opts as KeyframeAnimationOptions).easing || 'linear',
      direction: 'normal',
      progress: 0,
      currentIteration: 0,
      localTime: 0,
      activeDuration: (opts as KeyframeAnimationOptions).duration || 0,
      endTime: (opts as KeyframeAnimationOptions).duration || 0,
    } as unknown as ComputedEffectTiming;

    const anim: Partial<Animation> = {
      play: () => {},
      pause: () => {},
      cancel: () => {},
      finish: () => {},
      reverse: () => {},
      currentTime: 0,
      effect: { getComputedTiming: () => effectTiming } as unknown as AnimationEffect,
      finished: Promise.resolve() as unknown as Promise<Animation>,
      ready: Promise.resolve() as unknown as Promise<Animation>,
      startTime: null,
      playState: 'idle' as AnimationPlayState,
      playbackRate: 1,
      timeline: null,
      id: '',
      pending: false,
      onfinish: null,
      oncancel: null,
      onremove: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      commitStyles: () => {},
      persist: () => {},
      updatePlaybackRate: () => {},
    };

    return anim as Animation;
  };

  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    writable: true,
    value: animateImpl,
  });
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
// Mock requestIdleCallback for tests
(globalThis as any).requestIdleCallback ??= (cb: any) => setTimeout(cb, 0);
(globalThis as any).cancelIdleCallback ??= (id: any) => clearTimeout(id);
