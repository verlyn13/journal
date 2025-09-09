// React Hooks for Choreography System

import { useCallback, useEffect, useRef, useState } from 'react';
import { GestureCoordinator, type GestureEvent } from './gestures';
import { LayoutTransitionManager } from './layout';
import { ChoreographyOrchestrator } from './orchestrator';
import { Timeline } from './timeline';
import type {
  ChoreographyController,
  ChoreographySequence,
  ChoreographyState,
  GestureConfig,
  LayoutTransition,
} from './types';

// Global orchestrator instance
let globalOrchestrator: ChoreographyOrchestrator | null = null;

function getOrchestrator(): ChoreographyOrchestrator {
  if (!globalOrchestrator) {
    globalOrchestrator = new ChoreographyOrchestrator();
  }
  return globalOrchestrator;
}

// Hook for choreography sequences
export function useChoreography(sequence: ChoreographySequence): {
  play: () => Promise<void>;
  stop: () => void;
  controller: ChoreographyController | undefined;
  state: ChoreographyState;
  progress: number;
} {
  const orchestrator = getOrchestrator();
  const [state, setState] = useState<ChoreographyState>('idle');
  const [progress, setProgress] = useState(0);
  const [controller, setController] = useState<ChoreographyController>();
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    orchestrator.registerSequence(sequence);

    return () => {
      orchestrator.stop(sequence.id);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sequence, orchestrator]);

  const updateProgress = useCallback(() => {
    const ctrl = orchestrator.getController(sequence.id);
    if (ctrl) {
      setState(ctrl.state);
      setProgress(ctrl.progress);

      if (ctrl.state === 'playing') {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    }
  }, [orchestrator, sequence.id]);

  const play = useCallback(async () => {
    await orchestrator.play(sequence.id);
    const ctrl = orchestrator.getController(sequence.id);
    setController(ctrl);
    updateProgress();
  }, [orchestrator, sequence.id, updateProgress]);

  const stop = useCallback(() => {
    orchestrator.stop(sequence.id);
    setState('idle');
    setProgress(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [orchestrator, sequence.id]);

  return {
    play,
    stop,
    controller,
    state,
    progress,
  };
}

// Hook for timeline animations
export function useTimeline(config?: { duration?: number; ease?: string }): {
  timeline: Timeline;
  play: () => void;
  pause: () => void;
  restart: () => void;
  progress: number;
} {
  const [timeline] = useState(
    () => new Timeline(config ? { duration: config.duration || 1000, ...config } : undefined),
  );
  const [progress, setProgress] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const updateProgress = useCallback(() => {
    setProgress(timeline.progress);
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  }, [timeline]);

  const play = useCallback(() => {
    timeline.play();
    updateProgress();
  }, [timeline, updateProgress]);

  const pause = useCallback(() => {
    timeline.pause();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [timeline]);

  const restart = useCallback(() => {
    timeline.restart();
    updateProgress();
  }, [timeline, updateProgress]);

  useEffect(() => {
    return () => {
      timeline.clear();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [timeline]);

  return {
    timeline,
    play,
    pause,
    restart,
    progress,
  };
}

// Hook for gesture coordination
export function useGestures(config?: GestureConfig): {
  ref: React.RefObject<HTMLElement | null>;
  onSwipe: (callback: (event: GestureEvent) => void) => void;
  onPinch: (callback: (event: GestureEvent) => void) => void;
  onTap: (callback: (event: GestureEvent) => void) => void;
  onDrag: (callback: (event: GestureEvent) => void) => void;
} {
  const ref = useRef<HTMLElement>(null);
  const [coordinator] = useState(() => new GestureCoordinator(config));

  useEffect(() => {
    if (ref.current) {
      coordinator.attach(ref.current);
    }

    return () => {
      if (ref.current) {
        coordinator.detach(ref.current);
      }
    };
  }, [coordinator]);

  const onSwipe = useCallback(
    (callback: (event: GestureEvent) => void) => {
      coordinator.on('swipe', callback);
    },
    [coordinator],
  );

  const onPinch = useCallback(
    (callback: (event: GestureEvent) => void) => {
      coordinator.on('pinch', callback);
    },
    [coordinator],
  );

  const onTap = useCallback(
    (callback: (event: GestureEvent) => void) => {
      coordinator.on('tap', callback);
    },
    [coordinator],
  );

  const onDrag = useCallback(
    (callback: (event: GestureEvent) => void) => {
      coordinator.on('drag', callback);
    },
    [coordinator],
  );

  return {
    ref,
    onSwipe,
    onPinch,
    onTap,
    onDrag,
  };
}

// Hook for layout transitions
export function useLayoutTransition(): {
  capture: (key: string, selector: string) => void;
  captureGroup: (groupKey: string, selector: string) => void;
  transition: (key: string, config?: LayoutTransition) => Promise<void>;
  transitionGroup: (groupKey: string, config?: LayoutTransition) => Promise<void>;
  isTransitioning: (key: string) => boolean;
} {
  const [manager] = useState(() => new LayoutTransitionManager());

  const capture = useCallback(
    (key: string, selector: string) => {
      manager.capture(key, selector);
    },
    [manager],
  );

  const captureGroup = useCallback(
    (groupKey: string, selector: string) => {
      manager.captureGroup(groupKey, selector);
    },
    [manager],
  );

  const transition = useCallback(
    async (key: string, config?: LayoutTransition) => {
      await manager.transition(key, config);
    },
    [manager],
  );

  const transitionGroup = useCallback(
    async (groupKey: string, config?: LayoutTransition) => {
      await manager.transitionGroup(groupKey, config);
    },
    [manager],
  );

  const isTransitioning = useCallback(
    (key: string) => {
      return manager.isTransitioning(key);
    },
    [manager],
  );

  useEffect(() => {
    return () => {
      manager.clear();
    };
  }, [manager]);

  return {
    capture,
    captureGroup,
    transition,
    transitionGroup,
    isTransitioning,
  };
}

// Hook for entrance animations
export function useEntrance(
  ref: React.RefObject<HTMLElement | null>,
  options?: {
    delay?: number;
    duration?: number;
    easing?: string;
    threshold?: number;
  },
): boolean {
  const [hasEntered, setHasEntered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered) {
          setIsVisible(true);
          setHasEntered(true);

          // Animate entrance
          if (ref.current) {
            ref.current.animate(
              [
                { opacity: '0', transform: 'translateY(20px)' },
                { opacity: '1', transform: 'translateY(0)' },
              ],
              {
                duration: options?.duration || 400,
                delay: options?.delay || 0,
                easing: options?.easing || 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'both',
              },
            );
          }
        }
      },
      { threshold: options?.threshold || 0.1 },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, hasEntered, options]);

  return isVisible;
}

// Hook for exit animations
export function useExit(
  ref: React.RefObject<HTMLElement | null>,
  isExiting: boolean,
  options?: {
    duration?: number;
    easing?: string;
    onComplete?: () => void;
  },
): void {
  useEffect(() => {
    if (isExiting && ref.current) {
      const animation = ref.current.animate(
        [
          { opacity: '1', transform: 'scale(1)' },
          { opacity: '0', transform: 'scale(0.95)' },
        ],
        {
          duration: options?.duration || 200,
          easing: options?.easing || 'ease-in',
          fill: 'forwards',
        },
      );

      animation.finished.then(() => {
        options?.onComplete?.();
      });
    }
  }, [isExiting, ref, options]);
}

// Hook for stagger animations
export function useStagger(
  itemsRef: React.RefObject<HTMLElement[] | null>,
  options?: {
    stagger?: number;
    duration?: number;
    easing?: string;
  },
): {
  animate: () => void;
  reset: () => void;
} {
  const animate = useCallback(() => {
    if (!itemsRef.current) return;

    itemsRef.current.forEach((item, index) => {
      if (item) {
        item.animate(
          [
            { opacity: '0', transform: 'translateY(10px)' },
            { opacity: '1', transform: 'translateY(0)' },
          ],
          {
            duration: options?.duration || 300,
            delay: index * (options?.stagger || 50),
            easing: options?.easing || 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'both',
          },
        );
      }
    });
  }, [itemsRef, options]);

  const reset = useCallback(() => {
    if (!itemsRef.current) return;

    itemsRef.current.forEach((item) => {
      if (item) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
      }
    });
  }, [itemsRef]);

  return { animate, reset };
}
