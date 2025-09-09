// React Hooks for Materiality System

import { useCallback, useEffect, useRef, useState } from 'react';
import { getElevationStyles, getHoverElevation, getPressedElevation } from './elevation';
import { supportsBackdropFilter } from './glass';
import { getTextureOpacity } from './textures';
import type { ElevationLevel, MaterialityConfig, TextureType } from './types';

// Hook for interactive elevation
export function useElevation(
  initialLevel: ElevationLevel = 1,
  interactive = true,
): {
  elevation: ElevationLevel;
  elevationStyles: React.CSSProperties;
  elevationHandlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
  };
} {
  const [elevation, setElevation] = useState<ElevationLevel>(initialLevel);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const currentElevation = isPressed
    ? getPressedElevation(initialLevel)
    : isHovered
      ? getHoverElevation(initialLevel)
      : initialLevel;

  useEffect(() => {
    setElevation(currentElevation);
  }, [currentElevation]);

  const elevationHandlers = interactive
    ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => {
          setIsHovered(false);
          setIsPressed(false);
        },
        onMouseDown: () => setIsPressed(true),
        onMouseUp: () => setIsPressed(false),
      }
    : {
        onMouseEnter: () => {},
        onMouseLeave: () => {},
        onMouseDown: () => {},
        onMouseUp: () => {},
      };

  return {
    elevation,
    elevationStyles: {
      ...getElevationStyles(elevation),
      transition: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    elevationHandlers,
  };
}

// Hook for texture management
export function useTexture(
  type: TextureType = 'none',
  darkMode = false,
): {
  textureOpacity: number;
  textureStyles: React.CSSProperties;
} {
  const opacity = getTextureOpacity(type, darkMode);

  const textureStyles: React.CSSProperties =
    type === 'none'
      ? {}
      : ({
          '--texture-opacity': opacity,
        } as React.CSSProperties);

  return {
    textureOpacity: opacity,
    textureStyles,
  };
}

// Hook for glass morphism support detection
export function useGlassSupport(): {
  supported: boolean;
  fallbackStyles: React.CSSProperties;
} {
  const [supported, setSupported] = useState(() => {
    try {
      return supportsBackdropFilter();
    } catch (_e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      setSupported(supportsBackdropFilter());
    } catch (_e) {
      setSupported(false);
    }
  }, []);

  const fallbackStyles: React.CSSProperties = supported
    ? {}
    : {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      };

  return { supported, fallbackStyles };
}

// Hook for materiality configuration
export function useMateriality(config?: Partial<MaterialityConfig>): MaterialityConfig {
  const defaultConfig: MaterialityConfig = {
    elevationScale: 1,
    textureOpacity: 1,
    glassBlur: 8,
    vibrantIntensity: 1,
    reducedMotion: false,
  };

  const [materialityConfig, setMaterialityConfig] = useState<MaterialityConfig>({
    ...defaultConfig,
    ...config,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setMaterialityConfig((prev) => ({
        ...prev,
        reducedMotion: e.matches,
      }));
    };

    setMaterialityConfig((prev) => ({
      ...prev,
      reducedMotion: mediaQuery.matches,
    }));

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return materialityConfig;
}

// Hook for parallax depth effect
export function useParallax(
  depth = 1,
  enabled = true,
): {
  ref: React.RefObject<HTMLDivElement | null>;
  parallaxStyles: React.CSSProperties;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;

      setOffset({
        x: deltaX * depth * 10,
        y: deltaY * depth * 10,
      });
    };

    const handleMouseLeave = () => {
      setOffset({ x: 0, y: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [depth, enabled]);

  const parallaxStyles: React.CSSProperties = {
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return { ref, parallaxStyles };
}

// Hook for ripple effect
export function useRipple(): {
  rippleRef: React.RefObject<HTMLDivElement | null>;
  createRipple: (e: React.MouseEvent) => void;
} {
  const rippleRef = useRef<HTMLDivElement>(null);

  const createRipple = useCallback((e: React.MouseEvent) => {
    if (!rippleRef.current) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'ripple';

    rippleRef.current.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, []);

  return { rippleRef, createRipple };
}
