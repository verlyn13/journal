// Motion Presets and Configurations

import type { MotionConfig, SpringConfig } from './types';

// Easing functions
export const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + --t * t * t * t * t,
  easeInOutQuint: (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t),
  easeInSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t: number) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
  easeInOutExpo: (t: number) =>
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2,
  easeInCirc: (t: number) => 1 - Math.sqrt(1 - t ** 2),
  easeOutCirc: (t: number) => Math.sqrt(1 - (t - 1) ** 2),
  easeInOutCirc: (t: number) =>
    t < 0.5 ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2,
  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? ((2 * t) ** 2 * ((c2 + 1) * 2 * t - c2)) / 2
      : ((2 * t - 2) ** 2 * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -(2 ** (10 * t - 10)) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? -(2 ** (20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (2 ** (-20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      const u = t - 1.5 / d1;
      return n1 * u * u + 0.75;
    } else if (t < 2.5 / d1) {
      const u = t - 2.25 / d1;
      return n1 * u * u + 0.9375;
    } else {
      const u = t - 2.625 / d1;
      return n1 * u * u + 0.984375;
    }
  },
  easeInBounce: (t: number) => 1 - easingFunctions.easeOutBounce(1 - t),
  easeInOutBounce: (t: number) =>
    t < 0.5
      ? (1 - easingFunctions.easeOutBounce(1 - 2 * t)) / 2
      : (1 + easingFunctions.easeOutBounce(2 * t - 1)) / 2,
};

// Spring presets
export const springPresets: Record<string, SpringConfig> = {
  gentle: {
    stiffness: 100,
    damping: 14,
    mass: 1,
  },
  wobbly: {
    stiffness: 180,
    damping: 12,
    mass: 1,
  },
  stiff: {
    stiffness: 400,
    damping: 25,
    mass: 1,
  },
  slow: {
    stiffness: 70,
    damping: 16,
    mass: 1,
  },
  molasses: {
    stiffness: 40,
    damping: 20,
    mass: 1.5,
  },
  snappy: {
    stiffness: 300,
    damping: 20,
    mass: 0.8,
  },
  bouncy: {
    stiffness: 200,
    damping: 10,
    mass: 1,
  },
  noWobble: {
    stiffness: 170,
    damping: 26,
    mass: 1,
  },
};

// Motion presets with configurations
export const motionPresets: Record<string, MotionConfig & { to?: Partial<CSSStyleDeclaration>; reset?: boolean }> = {
  fadeIn: {
    duration: 300,
    easing: 'ease-out',
    to: { opacity: '1' },
  },
  fadeOut: {
    duration: 300,
    easing: 'ease-out',
    to: { opacity: '0' },
  },
  slideUp: {
    duration: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    to: { transform: 'translateY(0)' },
  },
  slideDown: {
    duration: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    to: { transform: 'translateY(100%)' },
  },
  slideLeft: {
    duration: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    to: { transform: 'translateX(-100%)' },
  },
  slideRight: {
    duration: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    to: { transform: 'translateX(100%)' },
  },
  scaleIn: {
    duration: 300,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    to: { transform: 'scale(1)' },
  },
  scaleOut: {
    duration: 300,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    to: { transform: 'scale(0)' },
  },
  rotateIn: {
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    to: { transform: 'rotate(0deg)' },
  },
  rotateOut: {
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    to: { transform: 'rotate(360deg)' },
  },
  bounce: {
    duration: 800,
    easing: easingFunctions.easeOutBounce,
    to: { transform: 'translateY(0)' },
    reset: true,
  },
  pulse: {
    duration: 1000,
    easing: 'ease-in-out',
    loop: true,
    alternate: true,
    to: { transform: 'scale(1.05)' },
  },
  shake: {
    duration: 500,
    keyframes: [0, -10, 10, -10, 10, 0],
    times: [0, 0.2, 0.4, 0.6, 0.8, 1],
    to: { transform: 'translateX(0)' },
    reset: true,
  },
  swing: {
    duration: 1000,
    easing: easingFunctions.easeInOutElastic,
    to: { transform: 'rotate(0deg)' },
    reset: true,
  },
};

// Timing function strings for CSS
export const cssTimingFunctions: Record<string, string> = {
  // Standard CSS easing
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Custom cubic-bezier functions
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',
  easeInSine: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
  easeOutSine: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
  easeInOutSine: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
  easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
  easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Custom sanctuary theme timings
  sanctuarySmooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  sanctuaryBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  sanctuarySnap: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
};
