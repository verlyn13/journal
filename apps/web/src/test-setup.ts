import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock localStorage and sessionStorage for React 19 compatibility
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() { return Object.keys(store).length; }
  };
})();

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() { return Object.keys(store).length; }
  };
})();

// Define localStorage and sessionStorage on global scope
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
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

// Mock window.matchMedia with a stable, configurable definition
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList),
  });
}

// Mock IntersectionObserver (configurable)
if (typeof (globalThis as any).IntersectionObserver !== 'function') {
  const NoopIntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
  Object.defineProperty(globalThis as any, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: NoopIntersectionObserver,
  });
}

// Mock ResizeObserver (configurable)
if (typeof (globalThis as any).ResizeObserver !== 'function') {
  const NoopResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Object.defineProperty(globalThis as any, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: NoopResizeObserver,
  });
}

// Mock Element.animate for Web Animations API
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  const animateImpl = function (this: Element, keyframes?: Keyframe[] | PropertyIndexedKeyframes, options?: number | KeyframeAnimationOptions): Animation {
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

// Also mock CSS.supports for consistency, but guard when CSS is undefined in jsdom
if (typeof window !== 'undefined') {
  // Ensure window.CSS exists before defining supports to avoid crashes in jsdom
  // @ts-expect-error: CSS may be undefined in the test environment
  if (!window.CSS || typeof window.CSS !== 'object') {
    // @ts-expect-error: creating minimal CSS namespace for tests
    Object.defineProperty(window, 'CSS', { configurable: true, writable: true, value: {} });
  }
  // Only define supports if not already provided by the environment
  // @ts-expect-error: CSS may be a minimal stub
  if (!('supports' in window.CSS)) {
    Object.defineProperty(window.CSS as object, 'supports', {
      configurable: true,
      writable: true,
      value: (property: string, _value?: string) => {
        // Always return false for backdrop-filter in test environment
        if (property === 'backdrop-filter' || property === '-webkit-backdrop-filter') {
          return false;
        }
        return false;
      },
    });
  }
}

// Local CSS namespace type helper for TS only
type CSSNamespace = { supports?: (property: string, value?: string) => boolean };
