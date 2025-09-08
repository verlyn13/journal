// React Hooks for Motion System

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createStagger, createTimeline, getOrchestrator } from './orchestrator';
import { motionPresets } from './presets';
import type {
  AnimationState,
  MotionConfig,
  ReducedMotionOptions,
  SpringConfig,
  StaggerConfig,
  TimelineStep,
  ViewTransitionConfig,
} from './types';

// Hook for reduced motion preferences
export function useReducedMotion(options: ReducedMotionOptions = { strategy: 'respect' }): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (options.strategy === 'ignore') {
      setPrefersReducedMotion(false);
      return;
    }

    if (options.strategy === 'force') {
      setPrefersReducedMotion(true);
      return;
    }

    // Respect user preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [options.strategy]);

  return prefersReducedMotion;
}

// Main motion hook
export function useMotion<T extends HTMLElement = HTMLDivElement>(
  config: MotionConfig = {},
): {
  ref: React.RefObject<T>;
  animate: (to: Partial<CSSStyleDeclaration>) => Promise<void>;
  state: AnimationState;
} {
  const ref = useRef<T>(null);
  const [state, setState] = useState<AnimationState>({
    value: 0,
    velocity: 0,
    isAnimating: false,
    hasAnimated: false,
  });

  const prefersReducedMotion = useReducedMotion();
  const animationRef = useRef<Animation | null>(null);

  const animate = useCallback(
    async (to: Partial<CSSStyleDeclaration>) => {
      if (!ref.current) return;

      // Cancel previous animation
      if (animationRef.current) {
        animationRef.current.cancel();
      }

      setState((prev) => ({ ...prev, isAnimating: true }));

      const element = ref.current;
      const duration = prefersReducedMotion ? 0 : (config.duration ?? 300);

      // Use Web Animations API
      const keyframes: Keyframe[] = [
        {}, // Current state
        to as Keyframe, // Target state
      ];

      animationRef.current = element.animate(keyframes, {
        duration,
        delay: config.delay ?? 0,
        easing: typeof config.easing === 'string' ? config.easing : 'ease',
        iterations: config.loop === true ? Infinity : (config.loop ?? 1),
        direction: config.alternate ? 'alternate' : config.reverse ? 'reverse' : 'normal',
        fill: 'forwards',
      });

      await animationRef.current.finished;

      setState({
        value: 1,
        velocity: 0,
        isAnimating: false,
        hasAnimated: true,
      });
    },
    [config, prefersReducedMotion],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, []);

  return { ref, animate, state };
}

// Spring animation hook
export function useSpring(
  initialValue: number = 0,
  config: SpringConfig = {
    stiffness: 100,
    damping: 10,
    mass: 1,
  },
): {
  value: number;
  set: (target: number) => void;
  velocity: number;
  isAnimating: boolean;
} {
  const [value, setValue] = useState(initialValue);
  const [velocity, setVelocity] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const springIdRef = useRef(`spring-${Math.random()}`);
  const orchestrator = useMemo(() => getOrchestrator(), []);

  const set = useCallback(
    (target: number) => {
      const spring = orchestrator.createSpring(springIdRef.current, value, config);

      spring.setTarget(target);
      setIsAnimating(true);

      // Update values during animation
      const updateLoop = () => {
        setValue(spring.position);
        setVelocity(spring.velocity);

        if (!spring.isSettled()) {
          requestAnimationFrame(updateLoop);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(updateLoop);
    },
    [value, config, orchestrator],
  );

  return { value, set, velocity, isAnimating };
}

// Stagger animation hook
export function useStagger(config: StaggerConfig): {
  delays: number[];
  getDelay: (index: number) => number;
  animateAll: (elements: HTMLElement[], animation: Partial<CSSStyleDeclaration>) => Promise<void>;
} {
  const delays = useMemo(
    () => createStagger(config),
    [config.children, config.delayBetween, config.from, config.ease, config],
  );

  const getDelay = useCallback((index: number) => delays[index] ?? 0, [delays]);

  const animateAll = useCallback(
    async (elements: HTMLElement[], animation: Partial<CSSStyleDeclaration>) => {
      const animations = elements.map((element, index) => {
        const delay = delays[index] ?? 0;

        return element.animate(
          [
            {}, // Current state
            animation as Keyframe, // Target state
          ],
          {
            duration: 300,
            delay,
            easing: 'ease',
            fill: 'forwards',
          },
        );
      });

      await Promise.all(animations.map((a) => a.finished));
    },
    [delays],
  );

  return { delays, getDelay, animateAll };
}

// Timeline animation hook
export function useTimeline(steps: TimelineStep[]): {
  play: () => void;
  pause: () => void;
  reset: () => void;
  isPlaying: boolean;
} {
  const [isPlaying, setIsPlaying] = useState(false);
  const timelineRef = useRef(createTimeline(steps));

  const play = useCallback(() => {
    timelineRef.current.start();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    timelineRef.current.pause();
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    timelineRef.current = createTimeline(steps);
    setIsPlaying(false);
  }, [steps]);

  return { play, pause, reset, isPlaying };
}

// View Transition API hook
export function useViewTransition(): {
  startTransition: (config: ViewTransitionConfig) => Promise<void>;
  isSupported: boolean;
} {
  const orchestrator = useMemo(() => getOrchestrator(), []);
  const isSupported = 'startViewTransition' in document;

  const startTransition = useCallback(
    async (config: ViewTransitionConfig) => {
      await orchestrator.startViewTransition(config);
    },
    [orchestrator],
  );

  return { startTransition, isSupported };
}

// Preset motion hook
export function usePresetMotion<T extends HTMLElement = HTMLDivElement>(
  preset: keyof typeof motionPresets,
): {
  ref: React.RefObject<T>;
  trigger: () => Promise<void>;
  state: AnimationState;
} {
  const config = motionPresets[preset];
  const { ref, animate, state } = useMotion<T>(config);

  const trigger = useCallback(async () => {
    if (!ref.current) return;

    const element = ref.current;
    const computedStyle = window.getComputedStyle(element);

    // Store original values
    const original = {
      opacity: computedStyle.opacity,
      transform: computedStyle.transform,
    };

    // Apply preset animation
    await animate(config.to as Partial<CSSStyleDeclaration>);

    // Optionally reset if needed
    if (config.reset) {
      await animate(original as Partial<CSSStyleDeclaration>);
    }
  }, [ref, animate, config]);

  return { ref, trigger, state };
}
