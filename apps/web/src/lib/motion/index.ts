// Motion System v2.0
// Comprehensive animation and transition orchestration

export type { 
  MotionConfig, 
  SpringConfig, 
  TransitionConfig,
  AnimationState,
  MotionPreset 
} from './types';

export { 
  MotionOrchestrator,
  createSpring,
  createStagger,
  createTimeline 
} from './orchestrator';

export { 
  useMotion,
  useSpring,
  useStagger,
  useTimeline,
  useReducedMotion,
  useViewTransition 
} from './hooks';

export { 
  motionPresets,
  springPresets,
  easingFunctions 
} from './presets';

export { 
  applyMotion,
  getMotionDuration,
  interpolateSpring,
  calculateStagger 
} from './utils';