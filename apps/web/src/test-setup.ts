/// <reference types="@vitest/runner" />
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

// Also mock CSS.supports for consistency
// First ensure window.CSS exists
if (!window.CSS) {
  (window as Window & { CSS: unknown }).CSS = {};
}

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

// Mock WebAuthn API
global.PublicKeyCredential = vi.fn() as unknown as typeof PublicKeyCredential;
global.AuthenticatorAssertionResponse = vi.fn() as unknown as typeof AuthenticatorAssertionResponse;
global.AuthenticatorAttestationResponse = vi.fn() as unknown as typeof AuthenticatorAttestationResponse;

// Mock navigator.credentials
Object.defineProperty(navigator, 'credentials', {
  writable: true,
  value: {
    create: vi.fn(),
    get: vi.fn(),
    preventSilentAccess: vi.fn(),
    store: vi.fn(),
  },
});
