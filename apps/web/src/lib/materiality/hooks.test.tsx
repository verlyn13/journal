import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  useElevation,
  useTexture,
  useGlassSupport,
  useMateriality,
  useParallax,
  useRipple,
} from './hooks';

describe('useElevation', () => {
  it('returns initial elevation and styles', () => {
    const { result } = renderHook(() => useElevation(2));
    
    expect(result.current.elevation).toBe(2);
    expect(result.current.elevationStyles).toHaveProperty('boxShadow');
    expect(result.current.elevationStyles.transition).toContain('box-shadow');
  });

  it('increases elevation on hover when interactive', () => {
    const { result } = renderHook(() => useElevation(2, true));
    
    act(() => {
      result.current.elevationHandlers.onMouseEnter();
    });
    
    expect(result.current.elevation).toBe(3);
  });

  it('decreases elevation on press when interactive', () => {
    const { result } = renderHook(() => useElevation(2, true));
    
    act(() => {
      result.current.elevationHandlers.onMouseDown();
    });
    
    expect(result.current.elevation).toBe(1);
  });

  it('resets elevation on mouse leave', () => {
    const { result } = renderHook(() => useElevation(2, true));
    
    act(() => {
      result.current.elevationHandlers.onMouseEnter();
    });
    expect(result.current.elevation).toBe(3);
    
    act(() => {
      result.current.elevationHandlers.onMouseLeave();
    });
    expect(result.current.elevation).toBe(2);
  });

  it('does not change elevation when not interactive', () => {
    const { result } = renderHook(() => useElevation(2, false));
    
    act(() => {
      result.current.elevationHandlers.onMouseEnter();
      result.current.elevationHandlers.onMouseDown();
    });
    
    expect(result.current.elevation).toBe(2);
  });

  it('respects max elevation on hover', () => {
    const { result } = renderHook(() => useElevation(5, true));
    
    act(() => {
      result.current.elevationHandlers.onMouseEnter();
    });
    
    expect(result.current.elevation).toBe(5); // Max is 5
  });

  it('respects min elevation on press', () => {
    const { result } = renderHook(() => useElevation(0, true));
    
    act(() => {
      result.current.elevationHandlers.onMouseDown();
    });
    
    expect(result.current.elevation).toBe(0); // Min is 0
  });
});

describe('useTexture', () => {
  it('returns opacity and styles for texture', () => {
    const { result } = renderHook(() => useTexture('paper', false));
    
    expect(result.current.textureOpacity).toBe(0.4);
    expect(result.current.textureStyles).toHaveProperty('--texture-opacity');
  });

  it('returns empty styles for none texture', () => {
    const { result } = renderHook(() => useTexture('none', false));
    
    expect(result.current.textureOpacity).toBe(0);
    expect(result.current.textureStyles).toEqual({});
  });

  it('reduces opacity in dark mode', () => {
    const { result: lightResult } = renderHook(() => useTexture('paper', false));
    const { result: darkResult } = renderHook(() => useTexture('paper', true));
    
    expect(darkResult.current.textureOpacity).toBeLessThan(lightResult.current.textureOpacity);
    expect(darkResult.current.textureOpacity).toBe(0.2); // 0.4 * 0.5
  });
});

describe('useGlassSupport', () => {
  it('detects backdrop-filter support', () => {
    const { result } = renderHook(() => useGlassSupport());
    
    expect(result.current.supported).toBe(true); // Mocked to true in test-setup
    expect(result.current.fallbackStyles).toEqual({});
  });

  it('provides fallback styles when not supported', () => {
    const originalSupports = window.CSS.supports;
    window.CSS.supports = vi.fn().mockReturnValue(false);
    
    const { result } = renderHook(() => useGlassSupport());
    
    waitFor(() => {
      expect(result.current.supported).toBe(false);
      expect(result.current.fallbackStyles).toHaveProperty('backgroundColor');
      expect(result.current.fallbackStyles).toHaveProperty('boxShadow');
    });
    
    window.CSS.supports = originalSupports;
  });
});

describe('useMateriality', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;
  });

  it('returns default configuration', () => {
    const { result } = renderHook(() => useMateriality());
    
    expect(result.current).toEqual({
      elevationScale: 1,
      textureOpacity: 1,
      glassBlur: 8,
      vibrantIntensity: 1,
      reducedMotion: false,
    });
  });

  it('merges custom configuration', () => {
    const { result } = renderHook(() => 
      useMateriality({ elevationScale: 1.5, glassBlur: 12 })
    );
    
    expect(result.current.elevationScale).toBe(1.5);
    expect(result.current.glassBlur).toBe(12);
    expect(result.current.textureOpacity).toBe(1); // Default
  });

  it('detects reduced motion preference', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMateriality());
    
    expect(result.current.reducedMotion).toBe(true);
  });

  it('responds to reduced motion changes', () => {
    let listener: ((e: any) => void) | null = null;
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (event: string, cb: (e: any) => void) => {
        if (event === 'change') listener = cb;
      },
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMateriality());
    
    expect(result.current.reducedMotion).toBe(false);
    
    // Simulate media query change
    act(() => {
      if (listener) listener({ matches: true });
    });
    
    expect(result.current.reducedMotion).toBe(true);
  });
});

describe('useParallax', () => {
  it('initializes with zero offset', () => {
    const { result } = renderHook(() => useParallax(1, true));
    
    expect(result.current.parallaxStyles.transform).toBe('translate3d(0px, 0px, 0)');
  });

  it('returns ref for element binding', () => {
    const { result } = renderHook(() => useParallax(1, true));
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
  });

  it('applies transition to parallax styles', () => {
    const { result } = renderHook(() => useParallax(1, true));
    
    expect(result.current.parallaxStyles.transition).toContain('transform');
  });

  it('does not apply transforms when disabled', () => {
    const { result } = renderHook(() => useParallax(1, false));
    
    expect(result.current.parallaxStyles.transform).toBe('translate3d(0px, 0px, 0)');
  });
});

describe('useRipple', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns rippleRef and createRipple function', () => {
    const { result } = renderHook(() => useRipple());
    
    expect(result.current.rippleRef).toBeDefined();
    expect(result.current.createRipple).toBeInstanceOf(Function);
  });

  it('creates ripple element on click', () => {
    const { result } = renderHook(() => useRipple());
    
    // Create a container for the ripple
    const container = document.createElement('div');
    document.body.appendChild(container);
    Object.defineProperty(result.current.rippleRef, 'current', {
      writable: true,
      value: container,
    });

    // Create mock event
    const mockEvent = {
      currentTarget: container,
      clientX: 100,
      clientY: 100,
    } as React.MouseEvent;

    // Mock getBoundingClientRect
    container.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
    });

    act(() => {
      result.current.createRipple(mockEvent);
    });

    const ripple = container.querySelector('.ripple');
    expect(ripple).toBeDefined();
    expect(ripple?.classList.contains('ripple')).toBe(true);
  });

  it('removes ripple after animation', async () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => useRipple());
    
    const container = document.createElement('div');
    document.body.appendChild(container);
    Object.defineProperty(result.current.rippleRef, 'current', {
      writable: true,
      value: container,
    });

    const mockEvent = {
      currentTarget: container,
      clientX: 100,
      clientY: 100,
    } as React.MouseEvent;

    container.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
    });

    act(() => {
      result.current.createRipple(mockEvent);
    });

    expect(container.querySelector('.ripple')).toBeDefined();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(container.querySelector('.ripple')).toBeNull();
    
    vi.useRealTimers();
  });

  it('handles missing rippleRef gracefully', () => {
    const { result } = renderHook(() => useRipple());
    
    const mockEvent = {
      currentTarget: document.createElement('div'),
      clientX: 100,
      clientY: 100,
    } as React.MouseEvent;

    // Should not throw
    expect(() => {
      act(() => {
        result.current.createRipple(mockEvent);
      });
    }).not.toThrow();
  });
});