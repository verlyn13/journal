// Motion System Type Definitions

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
  velocity?: number;
  precision?: number;
  restSpeed?: number;
  restDelta?: number;
}

export interface TransitionConfig {
  duration?: number;
  delay?: number;
  easing?: string | ((t: number) => number);
  loop?: boolean | number;
  reverse?: boolean;
  alternate?: boolean;
}

export interface MotionConfig extends TransitionConfig {
  spring?: SpringConfig;
  type?: 'tween' | 'spring' | 'keyframes';
  keyframes?: number[];
  times?: number[];
}

export interface AnimationState {
  value: number | number[];
  velocity: number | number[];
  isAnimating: boolean;
  hasAnimated: boolean;
}

export interface StaggerConfig {
  children: number;
  delayBetween?: number;
  from?: 'first' | 'last' | 'center' | number;
  ease?: (t: number) => number;
}

export interface TimelineStep {
  target: string | Element | Element[];
  motion: MotionConfig;
  at?: number | string;
}

export interface ViewTransitionConfig {
  name?: string;
  duration?: number;
  easing?: string;
  updateCallback?: () => void | Promise<void>;
}

export type MotionPreset =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleIn'
  | 'scaleOut'
  | 'rotateIn'
  | 'rotateOut'
  | 'bounce'
  | 'pulse'
  | 'shake'
  | 'swing';

export interface MotionValue<T = number> {
  get(): T;
  set(value: T): void;
  subscribe(callback: (value: T) => void): () => void;
  animate(to: T, config?: MotionConfig): Promise<void>;
  stop(): void;
}

export interface ReducedMotionOptions {
  strategy: 'respect' | 'ignore' | 'force';
  fallback?: MotionConfig;
}

export interface SpringPhysics {
  position: number;
  velocity: number;
  update(deltaTime: number): void;
  setTarget(target: number): void;
  isSettled(): boolean;
}
