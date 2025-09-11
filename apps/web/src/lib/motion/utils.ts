// Motion System Utilities

import { cssTimingFunctions } from './presets';
import type { MotionConfig, SpringConfig, StaggerConfig } from './types';

// Apply motion to an element
export function applyMotion(
  element: HTMLElement,
  from: Partial<CSSStyleDeclaration>,
  to: Partial<CSSStyleDeclaration>,
  config: MotionConfig = {},
): Animation {
  const duration = config.duration ?? 300;
  const delay = config.delay ?? 0;
  const easing =
    typeof config.easing === 'string'
      ? (cssTimingFunctions[config.easing] ?? config.easing)
      : 'ease';

  // Remove offset property from CSS styles to avoid conflicts with Keyframe type
  const { offset: _offsetFrom, ...fromRest } = from;
  const { offset: _offsetTo, ...toRest } = to;
  const keyframes: Keyframe[] = [fromRest as unknown as Keyframe, toRest as unknown as Keyframe];

  return element.animate(keyframes, {
    duration,
    delay,
    easing,
    iterations: config.loop === true ? Infinity : typeof config.loop === 'number' ? config.loop : 1,
    direction: config.alternate ? 'alternate' : config.reverse ? 'reverse' : 'normal',
    fill: 'forwards',
  });
}

// Calculate motion duration including delays
export function getMotionDuration(config: MotionConfig): number {
  const baseDuration = config.duration ?? 300;
  const delay = config.delay ?? 0;
  const iterations = config.loop === true ? 1 : (config.loop ?? 1);

  return delay + baseDuration * (typeof iterations === 'number' ? iterations : 1);
}

// Interpolate spring values
export function interpolateSpring(
  from: number,
  to: number,
  config: SpringConfig,
  time: number,
): number {
  const { stiffness, damping, mass } = config;

  // Simplified spring interpolation
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  if (zeta < 1) {
    // Underdamped
    const omegaDamped = omega * Math.sqrt(1 - zeta * zeta);
    const amplitude = from - to;
    const decay = Math.exp(-zeta * omega * time);
    const oscillation = Math.cos(omegaDamped * time);

    return to + amplitude * decay * oscillation;
  } else if (zeta === 1) {
    // Critically damped
    const amplitude = from - to;
    const decay = Math.exp(-omega * time);

    return to + amplitude * decay * (1 + omega * time);
  } else {
    // Overdamped
    const r1 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
    const r2 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
    const amplitude = from - to;
    const c1 = (amplitude * r2) / (r2 - r1);
    const c2 = (-amplitude * r1) / (r2 - r1);

    return to + c1 * Math.exp(r1 * time) + c2 * Math.exp(r2 * time);
  }
}

// Calculate stagger delays
export function calculateStagger(index: number, total: number, config: StaggerConfig): number {
  const { delayBetween = 50, from = 'first', ease } = config;

  let effectiveIndex = index;

  if (from === 'last') {
    effectiveIndex = total - 1 - index;
  } else if (from === 'center') {
    const center = (total - 1) / 2;
    effectiveIndex = Math.abs(index - center);
  } else if (typeof from === 'number') {
    effectiveIndex = Math.abs(index - from);
  }

  let delay = effectiveIndex * delayBetween;

  // Apply easing to stagger
  if (ease) {
    const progress = index / (total - 1);
    delay = delay * ease(progress);
  }

  return delay;
}

// Convert easing function to CSS timing function
export function easingToCss(easing: string | ((t: number) => number)): string {
  if (typeof easing === 'string') {
    return cssTimingFunctions[easing] ?? easing;
  }

  // For custom functions, approximate with cubic-bezier
  // Sample the function at key points
  const p1 = easing(0.25);
  const p2 = easing(0.75);

  // Approximate control points
  const x1 = 0.25;
  const y1 = p1;
  const x2 = 0.75;
  const y2 = p2;

  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
}

// Merge motion configs with precedence
export function mergeMotionConfigs(...configs: Partial<MotionConfig>[]): MotionConfig {
  const result: MotionConfig = {} as MotionConfig;
  for (const config of configs) {
    Object.assign(result, config);
    if (config.spring) {
      result.spring = { ...(result.spring ?? {}), ...config.spring };
    }
  }
  return result;
}

// Check if motion is currently active
export function isMotionActive(element: HTMLElement): boolean {
  return element.getAnimations().some((animation) => animation.playState === 'running');
}

// Cancel all animations on element
export function cancelMotion(element: HTMLElement): void {
  element.getAnimations().forEach((animation) => {
    animation.cancel();
  });
}

// Wait for all animations to complete
export function waitForMotion(element: HTMLElement): Promise<void> {
  const animations = element.getAnimations();

  if (animations.length === 0) {
    return Promise.resolve();
  }

  return Promise.all(animations.map((animation) => animation.finished)).then(() => undefined);
}

// Create a motion observer for element changes
export function observeMotion(
  element: HTMLElement,
  callback: (isAnimating: boolean) => void,
): () => void {
  let animationCount = 0;

  const handleStart = () => {
    animationCount++;
    if (animationCount === 1) {
      callback(true);
    }
  };

  const handleEnd = () => {
    animationCount--;
    if (animationCount === 0) {
      callback(false);
    }
  };

  element.addEventListener('animationstart', handleStart);
  element.addEventListener('animationend', handleEnd);
  element.addEventListener('animationcancel', handleEnd);

  // Cleanup function
  return () => {
    element.removeEventListener('animationstart', handleStart);
    element.removeEventListener('animationend', handleEnd);
    element.removeEventListener('animationcancel', handleEnd);
  };
}

// Batch motion updates for performance
export function batchMotion(updates: Array<() => void>): void {
  requestAnimationFrame(() => {
    for (const update of updates) {
      update();
    }
  });
}

// Debounce motion triggers
export function debounceMotion<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number,
): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// Throttle motion triggers
export function throttleMotion<T extends unknown[]>(
  fn: (...args: T) => void,
  limit: number,
): (...args: T) => void {
  let inThrottle = false;

  return (...args: T) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
