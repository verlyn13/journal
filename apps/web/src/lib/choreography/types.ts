// Choreography Types and Interfaces

export interface ChoreographySequence {
  id: string;
  name: string;
  steps: ChoreographyStep[];
  options?: ChoreographyOptions;
}

export interface ChoreographyStep {
  target: string | HTMLElement;
  animation: AnimationConfig;
  delay?: number;
  duration?: number;
  easing?: string;
}

export interface AnimationConfig {
  from?: Partial<CSSStyleDeclaration>;
  to?: Partial<CSSStyleDeclaration>;
  keyframes?: Keyframe[];
  options?: KeyframeAnimationOptions;
}

export interface ChoreographyOptions {
  stagger?: number;
  overlap?: number;
  reverse?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
}

export interface TimelineConfig {
  duration: number;
  ease?: string;
  stagger?: number | StaggerConfig;
  delay?: number;
}

export interface StaggerConfig {
  amount?: number;
  from?: 'start' | 'end' | 'center' | 'edges' | number;
  grid?: [number, number];
  axis?: 'x' | 'y';
  ease?: string;
}

export interface GestureConfig {
  threshold?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  enabled?: boolean;
}

export interface LayoutTransition {
  type: 'morph' | 'fade' | 'slide' | 'scale' | 'flip';
  duration?: number;
  ease?: string;
  stagger?: number;
}

export type ChoreographyState = 'idle' | 'playing' | 'paused' | 'finished';

export interface ChoreographyController {
  play(): void;
  pause(): void;
  reverse(): void;
  restart(): void;
  seek(time: number): void;
  state: ChoreographyState;
  progress: number;
}
