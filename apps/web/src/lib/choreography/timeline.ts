// Timeline System - Sequential and parallel animation control

import type { TimelineConfig } from './types';

export class Timeline {
  private animations: TimelineAnimation[] = [];
  private currentTime = 0;
  private duration = 0;
  private isPlaying = false;
  private startTime = 0;
  private rafId: number | null = null;

  constructor(private config?: TimelineConfig) {
    this.duration = config?.duration || 0;
  }

  // Add animation to timeline
  add(
    element: Element | Element[] | string,
    props: Keyframe[] | PropertyIndexedKeyframes,
    options?: KeyframeAnimationOptions & { position?: number | string },
  ): this {
    let elements: Element[];
    
    if (typeof element === 'string') {
      // Handle selector string
      const selected = document.querySelectorAll(element);
      elements = Array.from(selected);
    } else if (Array.isArray(element)) {
      elements = element;
    } else {
      elements = [element];
    }
    const { position = '>' } = options || {};

    elements.forEach((el, index) => {
      const startTime = this.calculatePosition(position, index);
      const animation = new TimelineAnimation(el, props, {
        ...options,
        delay: startTime,
      });

      this.animations.push(animation);
      this.updateDuration(animation);
    });

    return this;
  }

  // Calculate position in timeline
  private calculatePosition(position: number | string, index: number): number {
    if (typeof position === 'number') {
      return position;
    }

    const lastAnimation = this.animations[this.animations.length - 1];
    const lastEnd = lastAnimation ? lastAnimation.endTime : 0;

    switch (position) {
      case '>': // After previous
        return lastEnd;
      case '<': // With previous
        return lastAnimation ? (Number(lastAnimation.startTime) || 0) : 0;
      case '+=': // Relative to end
        return lastEnd + (Number(this.config?.stagger) || 0) * index;
      case '-=': // Overlap with previous
        return Math.max(0, lastEnd - (Number(this.config?.stagger) || 100));
      default:
        return 0;
    }
  }

  // Update total duration
  private updateDuration(animation: TimelineAnimation): void {
    this.duration = Math.max(this.duration, animation.endTime);
  }

  // Play timeline
  play(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startTime = performance.now() - this.currentTime;
    this.tick();
  }

  // Pause timeline
  pause(): void {
    this.isPlaying = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // Reverse timeline
  reverse(): void {
    this.animations.forEach((anim) => anim.reverse());
    this.play();
  }

  // Restart timeline
  restart(): void {
    this.currentTime = 0;
    this.animations.forEach((anim) => anim.restart());
    this.play();
  }

  // Seek to specific time
  seek(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
    this.animations.forEach((anim) => anim.seek(this.currentTime));
  }

  // Animation loop
  private tick = (): void => {
    if (!this.isPlaying) return;

    const now = performance.now();
    this.currentTime = now - this.startTime;

    // Update all animations
    this.animations.forEach((anim) => {
      anim.update(this.currentTime);
    });

    // Check if finished
    if (this.currentTime >= this.duration) {
      this.isPlaying = false;
      this.onComplete();
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  // Timeline complete callback
  private onComplete(): void {
    // Dispatch complete event
    const event = new CustomEvent('timeline:complete', {
      detail: { timeline: this },
    });
    window.dispatchEvent(event);
  }

  // Get progress
  get progress(): number {
    return this.duration > 0 ? this.currentTime / this.duration : 0;
  }

  // Clear timeline
  clear(): void {
    this.pause();
    this.animations.forEach((anim) => anim.cancel());
    this.animations = [];
    this.currentTime = 0;
    this.duration = 0;
  }
}

// Individual timeline animation
class TimelineAnimation {
  private animation: Animation | null = null;
  public startTime: number;
  public endTime: number;
  private element: Element;
  private keyframes: Keyframe[] | PropertyIndexedKeyframes;
  private options: KeyframeAnimationOptions;

  constructor(
    element: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions = {},
  ) {
    this.element = element;
    this.keyframes = keyframes;
    this.options = options;
    this.startTime = options.delay || 0;
    this.endTime = this.startTime + ((options.duration as number) || 0);

    this.createAnimation();
  }

  private createAnimation(): void {
    this.animation = this.element.animate(this.keyframes, {
      ...this.options,
      fill: 'both',
    });
    this.animation.pause();
  }

  update(time: number): void {
    if (!this.animation) return;

    if (time < this.startTime) {
      this.animation.currentTime = 0;
    } else if (time > this.endTime) {
      const duration = this.animation.effect?.getComputedTiming().duration || 0;
      this.animation.currentTime = typeof duration === 'number' ? duration : Number(duration) || 0;
    } else {
      this.animation.currentTime = time - this.startTime;
    }
  }

  seek(time: number): void {
    this.update(time);
  }

  reverse(): void {
    this.animation?.reverse();
  }

  restart(): void {
    if (this.animation) {
      this.animation.currentTime = 0;
    }
  }

  cancel(): void {
    this.animation?.cancel();
  }
}

// Create preset timelines
export const presetTimelines = {
  // Entry creation morphing
  entryMorph: () => {
    const timeline = new Timeline({ duration: 600 });

    return timeline
      .add(
        '.entry-create-button',
        [
          { transform: 'scale(1)', opacity: '1' },
          { transform: 'scale(0.95)', opacity: '0.8' },
          { transform: 'scale(1.5)', opacity: '0' },
        ],
        { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      )
      .add(
        '.entry-editor',
        [
          { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
          { transform: 'scale(1) translateY(0)', opacity: '1' },
        ],
        { duration: 400, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', position: '-=' },
      );
  },

  // Sidebar collapse with overshoot
  sidebarCollapse: () => {
    const timeline = new Timeline({ duration: 400 });

    return timeline
      .add(
        '.sidebar',
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-105%)' },
          { transform: 'translateX(-100%)' },
        ],
        { duration: 400, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
      )
      .add('.main-content', [{ marginLeft: '280px' }, { marginLeft: '0' }], {
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        position: '<',
      });
  },

  // Focus mode ceremony
  focusMode: () => {
    const timeline = new Timeline({ duration: 800 });

    return timeline
      .add(
        '.header, .sidebar',
        [
          { opacity: '1', transform: 'translateY(0)' },
          { opacity: '0', transform: 'translateY(-20px)' },
        ],
        { duration: 300, easing: 'ease-out' },
      )
      .add(
        '.editor-container',
        [
          { transform: 'scale(0.95)', opacity: '0.8' },
          { transform: 'scale(1)', opacity: '1' },
        ],
        { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', position: '-=' },
      )
      .add('.focus-overlay', [{ opacity: '0' }, { opacity: '1' }], {
        duration: 300,
        position: '<',
      });
  },
};
