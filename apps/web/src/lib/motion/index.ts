// Motion System v2.0
// Comprehensive animation and transition orchestration

export {
  useMotion,
  useReducedMotion,
  useSpring,
  useStagger,
  useTimeline,
  useViewTransition,
} from './hooks';

export {
  createSpring,
  createStagger,
  createTimeline,
  MotionOrchestrator,
} from './orchestrator';
export {
  easingFunctions,
  motionPresets,
  springPresets,
} from './presets';
export type {
  AnimationState,
  MotionConfig,
  MotionPreset,
  SpringConfig,
  TransitionConfig,
} from './types';

export {
  applyMotion,
  calculateStagger,
  getMotionDuration,
  interpolateSpring,
} from './utils';
