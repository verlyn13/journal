// Motion Orchestrator
// Central coordination for all animations and transitions

import type {
  AnimationState,
  SpringConfig,
  SpringPhysics,
  StaggerConfig,
  TimelineStep,
  ViewTransitionConfig,
} from './types';

// Spring Physics Implementation
class SpringPhysicsImpl implements SpringPhysics {
  position: number;
  velocity: number;
  private target: number;
  private config: Required<SpringConfig>;

  constructor(initialValue: number, config: SpringConfig) {
    this.position = initialValue;
    this.velocity = config.velocity ?? 0;
    this.target = initialValue;
    this.config = {
      stiffness: config.stiffness,
      damping: config.damping,
      mass: config.mass,
      velocity: config.velocity ?? 0,
      precision: config.precision ?? 0.01,
      restSpeed: config.restSpeed ?? 0.01,
      restDelta: config.restDelta ?? 0.01,
    };
  }

  update(deltaTime: number): void {
    const force = -this.config.stiffness * (this.position - this.target);
    const damping = -this.config.damping * this.velocity;
    const acceleration = (force + damping) / this.config.mass;

    this.velocity += acceleration * deltaTime;
    this.position += this.velocity * deltaTime;
  }

  setTarget(target: number): void {
    this.target = target;
  }

  isSettled(): boolean {
    const displacement = Math.abs(this.position - this.target);
    const speed = Math.abs(this.velocity);

    return displacement < this.config.restDelta && speed < this.config.restSpeed;
  }
}

// Main Motion Orchestrator
export class MotionOrchestrator {
  private animations = new Map<string, AnimationState>();
  private rafId: number | null = null;
  private lastTime = 0;
  private springs = new Map<string, SpringPhysicsImpl>();
  private timelines = new Map<string, Timeline>();

  // Check for View Transitions API support
  private supportsViewTransitions = 'startViewTransition' in document;

  // Start animation loop
  private startLoop(): void {
    if (this.rafId !== null) return;

    const loop = (currentTime: number) => {
      const deltaTime = Math.min(
        (currentTime - this.lastTime) / 1000,
        0.1, // Cap at 100ms to prevent huge jumps
      );

      this.lastTime = currentTime;

      // Update all springs
      for (const [id, spring] of this.springs) {
        spring.update(deltaTime);

        if (spring.isSettled()) {
          this.springs.delete(id);
        }
      }

      // Update all timelines
      for (const [id, timeline] of this.timelines) {
        timeline.update(deltaTime);

        if (timeline.isComplete()) {
          this.timelines.delete(id);
        }
      }

      // Continue loop if animations exist
      if (this.springs.size > 0 || this.timelines.size > 0) {
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.stopLoop();
      }
    };

    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(loop);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // Create and manage springs
  createSpring(id: string, initialValue: number, config: SpringConfig): SpringPhysicsImpl {
    const spring = new SpringPhysicsImpl(initialValue, config);
    this.springs.set(id, spring);
    this.startLoop();
    return spring;
  }

  // View Transitions API wrapper
  async startViewTransition(config: ViewTransitionConfig): Promise<void> {
    if (!this.supportsViewTransitions) {
      // Fallback to immediate update
      if (config.updateCallback) {
        await config.updateCallback();
      }
      return;
    }

    type ViewTransition = {
      updateCallbackDone: Promise<void>;
      finished: Promise<void>;
    };
    const transition = (
      document as Document & {
        startViewTransition?: (cb: () => void | Promise<void>) => ViewTransition;
      }
    ).startViewTransition!(config.updateCallback);

    if (config.name) {
      transition.updateCallbackDone.then(() => {
        // Apply custom transition properties
        const style = document.createElement('style');
        style.textContent = `
          ::view-transition-old(${config.name}),
          ::view-transition-new(${config.name}) {
            animation-duration: ${config.duration ?? 300}ms;
            animation-timing-function: ${config.easing ?? 'ease'};
          }
        `;
        document.head.appendChild(style);

        // Clean up after transition
        transition.finished.then(() => {
          document.head.removeChild(style);
        });
      });
    }

    await transition.finished;
  }

  // Clean up all animations
  destroy(): void {
    this.stopLoop();
    this.animations.clear();
    this.springs.clear();
    this.timelines.clear();
  }
}

// Timeline implementation
class Timeline {
  private steps: TimelineStep[];
  private currentTime = 0;
  private currentStep = 0;
  private isRunning = false;

  constructor(steps: TimelineStep[]) {
    this.steps = steps;
  }

  update(deltaTime: number): void {
    if (!this.isRunning) return;

    this.currentTime += deltaTime * 1000; // Convert to ms

    // Process steps that should start
    while (this.currentStep < this.steps.length && this.shouldStartStep(this.currentStep)) {
      this.startStep(this.currentStep);
      this.currentStep++;
    }
  }

  private shouldStartStep(index: number): boolean {
    const step = this.steps[index];
    if (!step.at) return true;

    if (typeof step.at === 'number') {
      return this.currentTime >= step.at;
    }

    // Handle relative timing (e.g., '+100', '-50')
    if (typeof step.at === 'string') {
      const match = step.at.match(/^([+-])(\d+)$/);
      if (match) {
        const [, sign, value] = match;
        const offset = parseInt(value, 10);
        const baseTime = this.getLastStepTime(index - 1);
        const targetTime = sign === '+' ? baseTime + offset : baseTime - offset;
        return this.currentTime >= targetTime;
      }
    }

    return false;
  }

  private getLastStepTime(index: number): number {
    if (index < 0) return 0;

    const step = this.steps[index];
    if (typeof step.at === 'number') return step.at;

    // Recursively calculate for relative timings
    return this.getLastStepTime(index - 1);
  }

  private startStep(index: number): void {
    const _step = this.steps[index];
  }

  start(): void {
    this.isRunning = true;
  }

  pause(): void {
    this.isRunning = false;
  }

  isComplete(): boolean {
    return this.currentStep >= this.steps.length;
  }
}

// Factory functions
export function createSpring(initialValue: number, config: SpringConfig): SpringPhysicsImpl {
  return new SpringPhysicsImpl(initialValue, config);
}

export function createStagger(config: StaggerConfig): number[] {
  const delays: number[] = [];
  const { children, delayBetween = 50, from = 'first', ease } = config;

  for (let i = 0; i < children; i++) {
    let index = i;

    if (from === 'last') {
      index = children - 1 - i;
    } else if (from === 'center') {
      const center = (children - 1) / 2;
      index = Math.abs(i - center);
    } else if (typeof from === 'number') {
      index = Math.abs(i - from);
    }

    let delay = index * delayBetween;

    // Apply easing to stagger
    if (ease) {
      const progress = i / (children - 1);
      delay = delay * ease(progress);
    }

    delays.push(delay);
  }

  return delays;
}

export function createTimeline(steps: TimelineStep[]): Timeline {
  return new Timeline(steps);
}

// Global orchestrator instance
let globalOrchestrator: MotionOrchestrator | null = null;

export function getOrchestrator(): MotionOrchestrator {
  if (!globalOrchestrator) {
    globalOrchestrator = new MotionOrchestrator();
  }
  return globalOrchestrator;
}
