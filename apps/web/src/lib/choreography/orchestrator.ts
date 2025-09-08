// Choreography Orchestrator - Central animation coordination

import type {
  ChoreographyController,
  ChoreographySequence,
  ChoreographyState,
  ChoreographyStep,
  StaggerConfig,
  TimelineConfig,
} from './types';

export class ChoreographyOrchestrator {
  private sequences: Map<string, ChoreographySequence> = new Map();
  private activeAnimations: Map<string, Animation[]> = new Map();
  private controllers: Map<string, ChoreographyController> = new Map();
  private reducedMotion: boolean;

  constructor() {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = mediaQuery ? mediaQuery.matches : false;

      // Listen for reduced motion changes
      if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', (e) => {
          this.reducedMotion = e.matches;
        });
      }
    } else {
      this.reducedMotion = false;
    }
  }

  // Register a choreography sequence
  registerSequence(sequence: ChoreographySequence): void {
    this.sequences.set(sequence.id, sequence);
  }

  // Play a sequence
  async play(sequenceId: string): Promise<void> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      console.warn(`Sequence ${sequenceId} not found`);
      return;
    }

    // Skip animations if reduced motion is preferred
    if (this.reducedMotion && !sequence.options?.autoPlay) {
      this.applyFinalStates(sequence);
      return;
    }

    const animations = await this.createAnimations(sequence);
    this.activeAnimations.set(sequenceId, animations);

    // Create controller
    const controller = this.createController(sequenceId, animations);
    this.controllers.set(sequenceId, controller);

    // Start animations
    animations.forEach((anim) => anim.play());
  }

  // Create animations from sequence
  private async createAnimations(sequence: ChoreographySequence): Promise<Animation[]> {
    const animations: Animation[] = [];
    const { steps, options } = sequence;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const delay = this.calculateDelay(i, options?.stagger, step.delay);

      const animation = await this.createAnimation(step, delay);
      if (animation) {
        animations.push(animation);
      }
    }

    return animations;
  }

  // Create single animation
  private async createAnimation(step: ChoreographyStep, delay: number): Promise<Animation | null> {
    const element = this.getElement(step.target);
    if (!element) return null;

    const { animation, duration = 300, easing = 'ease' } = step;

    // Use Web Animations API
    if (animation.keyframes) {
      return element.animate(animation.keyframes, {
        duration,
        delay,
        easing,
        fill: 'both',
        ...animation.options,
      });
    }

    // Fallback to CSS transitions
    if (animation.from && animation.to) {
      return this.createCSSAnimation(element, animation.from, animation.to, {
        duration,
        delay,
        easing,
      });
    }

    return null;
  }

  // Create CSS-based animation
  private createCSSAnimation(
    element: Element,
    from: Partial<CSSStyleDeclaration>,
    to: Partial<CSSStyleDeclaration>,
    options: { duration: number; delay: number; easing: string },
  ): Animation {
    // Remove offset property to avoid conflict with Keyframe type
    const { offset: _offsetFrom, ...fromWithoutOffset } = from as any;
    const { offset: _offsetTo, ...toWithoutOffset } = to as any;
    const keyframes: Keyframe[] = [fromWithoutOffset, toWithoutOffset];

    return element.animate(keyframes, {
      duration: options.duration,
      delay: options.delay,
      easing: options.easing,
      fill: 'both',
    });
  }

  // Calculate stagger delay
  private calculateDelay(
    index: number,
    stagger?: number | StaggerConfig,
    baseDelay?: number,
  ): number {
    let delay = baseDelay || 0;

    if (typeof stagger === 'number') {
      delay += index * stagger;
    } else if (stagger && typeof stagger === 'object') {
      delay += this.calculateComplexStagger(index, stagger);
    }

    return delay;
  }

  // Calculate complex stagger patterns
  private calculateComplexStagger(index: number, config: StaggerConfig): number {
    const { amount = 100, from = 'start', ease = 'linear' } = config;

    let progress = index;

    // Calculate progress based on 'from' direction
    if (from === 'center') {
      // Stagger from center outward
      progress = Math.abs(index - Math.floor(index / 2));
    } else if (from === 'end') {
      // Reverse stagger
      progress = -index;
    } else if (from === 'edges') {
      // Stagger from edges inward
      progress = Math.min(index, Math.abs(index - Math.floor(index / 2)));
    }

    return progress * amount;
  }

  // Create controller for animations
  private createController(sequenceId: string, animations: Animation[]): ChoreographyController {
    let state: ChoreographyState = 'playing';

    return {
      play: () => {
        animations.forEach((anim) => anim.play());
        state = 'playing';
      },
      pause: () => {
        animations.forEach((anim) => anim.pause());
        state = 'paused';
      },
      reverse: () => {
        animations.forEach((anim) => anim.reverse());
      },
      restart: () => {
        animations.forEach((anim) => {
          anim.currentTime = 0;
          anim.play();
        });
        state = 'playing';
      },
      seek: (time: number) => {
        animations.forEach((anim) => {
          anim.currentTime = time;
        });
      },
      get state() {
        return state;
      },
      get progress() {
        if (animations.length === 0) return 0;
        const firstAnim = animations[0];
        const duration = firstAnim.effect?.getComputedTiming().duration || 0;
        const durationNum = typeof duration === 'number' ? duration : Number(duration) || 0;
        const currentTime =
          typeof firstAnim.currentTime === 'number'
            ? firstAnim.currentTime
            : Number(firstAnim.currentTime) || 0;
        return durationNum > 0 ? currentTime / durationNum : 0;
      },
    };
  }

  // Get element from selector or element
  private getElement(target: string | HTMLElement): Element | null {
    if (typeof document === 'undefined') return null;
    if (typeof target === 'string') {
      return document.querySelector(target);
    }
    return target;
  }

  // Apply final states without animation
  private applyFinalStates(sequence: ChoreographySequence): void {
    sequence.steps.forEach((step) => {
      const element = this.getElement(step.target);
      if (element && element instanceof HTMLElement && step.animation.to) {
        Object.assign(element.style, step.animation.to);
      }
    });
  }

  // Stop a sequence
  stop(sequenceId: string): void {
    const animations = this.activeAnimations.get(sequenceId);
    if (animations) {
      animations.forEach((anim) => anim.cancel());
      this.activeAnimations.delete(sequenceId);
    }
    this.controllers.delete(sequenceId);
  }

  // Stop all sequences
  stopAll(): void {
    this.activeAnimations.forEach((animations, id) => {
      animations.forEach((anim) => anim.cancel());
    });
    this.activeAnimations.clear();
    this.controllers.clear();
  }

  // Get controller for a sequence
  getController(sequenceId: string): ChoreographyController | undefined {
    return this.controllers.get(sequenceId);
  }
}
