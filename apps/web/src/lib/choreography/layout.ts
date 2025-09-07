// Layout Transition System - FLIP animations and morphing

import type { LayoutTransition } from './types';

interface LayoutSnapshot {
  element: Element;
  rect: DOMRect;
  styles: {
    opacity: string;
    transform: string;
  };
}

export class LayoutTransitionManager {
  private snapshots: Map<string, LayoutSnapshot> = new Map();
  private activeTransitions: Set<string> = new Set();
  private reducedMotion: boolean;

  constructor() {
    if (typeof window !== 'undefined') {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } else {
      this.reducedMotion = false;
    }
  }

  // Capture layout state
  capture(key: string, selector: string): void {
    if (typeof document === 'undefined') return;
    const element = document.querySelector(selector);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const computedStyle = getComputedStyle(element);
    
    this.snapshots.set(key, {
      element,
      rect,
      styles: {
        opacity: computedStyle.opacity,
        transform: computedStyle.transform,
      },
    });
  }

  // Capture multiple elements
  captureGroup(groupKey: string, selector: string): void {
    if (typeof document === 'undefined') return;
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
      this.capture(`${groupKey}-${index}`, `${selector}:nth-child(${index + 1})`);
    });
  }

  // Perform layout transition
  async transition(
    key: string,
    transition: LayoutTransition = { type: 'morph' }
  ): Promise<void> {
    const snapshot = this.snapshots.get(key);
    if (!snapshot) return;

    const { element } = snapshot;
    const currentRect = element.getBoundingClientRect();
    
    // Skip if reduced motion
    if (this.reducedMotion) {
      this.snapshots.delete(key);
      return;
    }

    // Calculate deltas (FLIP technique)
    const deltaX = snapshot.rect.left - currentRect.left;
    const deltaY = snapshot.rect.top - currentRect.top;
    const deltaW = snapshot.rect.width / currentRect.width;
    const deltaH = snapshot.rect.height / currentRect.height;

    // Choose transition type
    switch (transition.type) {
      case 'morph':
        await this.morphTransition(element, { deltaX, deltaY, deltaW, deltaH }, transition);
        break;
      case 'fade':
        await this.fadeTransition(element, transition);
        break;
      case 'slide':
        await this.slideTransition(element, { deltaX, deltaY }, transition);
        break;
      case 'scale':
        await this.scaleTransition(element, { deltaW, deltaH }, transition);
        break;
      case 'flip':
        await this.flipTransition(element, { deltaX, deltaY, deltaW, deltaH }, transition);
        break;
    }

    this.snapshots.delete(key);
  }

  // Morph transition (smooth shape change)
  private async morphTransition(
    element: Element,
    deltas: { deltaX: number; deltaY: number; deltaW: number; deltaH: number },
    config: LayoutTransition
  ): Promise<void> {
    const duration = config.duration || 300;
    const ease = config.ease || 'cubic-bezier(0.4, 0, 0.2, 1)';

    const animation = element.animate([
      {
        transform: `
          translate(${deltas.deltaX}px, ${deltas.deltaY}px)
          scale(${deltas.deltaW}, ${deltas.deltaH})
        `,
      },
      {
        transform: 'none',
      },
    ], {
      duration,
      easing: ease,
      fill: 'both',
    });

    await animation.finished;
  }

  // Fade transition
  private async fadeTransition(
    element: Element,
    config: LayoutTransition
  ): Promise<void> {
    const duration = config.duration || 200;
    const ease = config.ease || 'ease-in-out';

    const animation = element.animate([
      { opacity: '0' },
      { opacity: '1' },
    ], {
      duration,
      easing: ease,
    });

    await animation.finished;
  }

  // Slide transition
  private async slideTransition(
    element: Element,
    deltas: { deltaX: number; deltaY: number },
    config: LayoutTransition
  ): Promise<void> {
    const duration = config.duration || 300;
    const ease = config.ease || 'cubic-bezier(0.4, 0, 0.2, 1)';

    const animation = element.animate([
      { transform: `translate(${deltas.deltaX}px, ${deltas.deltaY}px)` },
      { transform: 'none' },
    ], {
      duration,
      easing: ease,
    });

    await animation.finished;
  }

  // Scale transition
  private async scaleTransition(
    element: Element,
    deltas: { deltaW: number; deltaH: number },
    config: LayoutTransition
  ): Promise<void> {
    const duration = config.duration || 300;
    const ease = config.ease || 'cubic-bezier(0.34, 1.56, 0.64, 1)';

    const animation = element.animate([
      { transform: `scale(${deltas.deltaW}, ${deltas.deltaH})` },
      { transform: 'scale(1, 1)' },
    ], {
      duration,
      easing: ease,
    });

    await animation.finished;
  }

  // FLIP transition (First, Last, Invert, Play)
  private async flipTransition(
    element: Element,
    deltas: { deltaX: number; deltaY: number; deltaW: number; deltaH: number },
    config: LayoutTransition
  ): Promise<void> {
    const duration = config.duration || 400;
    const ease = config.ease || 'cubic-bezier(0.4, 0, 0.2, 1)';

    // Invert phase
    const animation = element.animate([
      {
        transform: `
          translate(${deltas.deltaX}px, ${deltas.deltaY}px)
          scale(${deltas.deltaW}, ${deltas.deltaH})
        `,
      },
      {
        transform: 'none',
      },
    ], {
      duration,
      easing: ease,
      fill: 'both',
    });

    // Play phase
    await animation.finished;
  }

  // Batch layout transitions
  async transitionGroup(
    groupKey: string,
    transition: LayoutTransition = { type: 'morph' }
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    const stagger = transition.stagger || 0;

    this.snapshots.forEach((snapshot, key) => {
      if (key.startsWith(groupKey)) {
        const index = parseInt(key.split('-').pop() || '0', 10);
        const delay = index * stagger;
        
        promises.push(
          new Promise(resolve => {
            setTimeout(async () => {
              await this.transition(key, transition);
              resolve();
            }, delay);
          })
        );
      }
    });

    await Promise.all(promises);
  }

  // Clear all snapshots
  clear(): void {
    this.snapshots.clear();
  }

  // Check if element is transitioning
  isTransitioning(key: string): boolean {
    return this.activeTransitions.has(key);
  }
}

// Preset layout transitions
export const layoutPresets = {
  // Entry list reordering
  listReorder: (manager: LayoutTransitionManager) => {
    manager.captureGroup('entry-list', '.entry-item');
    // After DOM update
    setTimeout(() => {
      manager.transitionGroup('entry-list', {
        type: 'morph',
        duration: 300,
        stagger: 30,
      });
    }, 0);
  },

  // Card expansion
  cardExpand: (manager: LayoutTransitionManager, cardId: string) => {
    manager.capture(`card-${cardId}`, `#card-${cardId}`);
    // After DOM update (card expanded)
    setTimeout(() => {
      manager.transition(`card-${cardId}`, {
        type: 'morph',
        duration: 400,
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      });
    }, 0);
  },

  // Modal appearance
  modalAppear: (manager: LayoutTransitionManager) => {
    manager.capture('modal-backdrop', '.modal-backdrop');
    manager.capture('modal-content', '.modal-content');
    
    setTimeout(() => {
      manager.transition('modal-backdrop', {
        type: 'fade',
        duration: 200,
      });
      manager.transition('modal-content', {
        type: 'scale',
        duration: 300,
        ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      });
    }, 0);
  },

  // Navigation transition
  navigationSlide: (manager: LayoutTransitionManager) => {
    manager.captureGroup('nav-items', '.nav-item');
    
    setTimeout(() => {
      manager.transitionGroup('nav-items', {
        type: 'slide',
        duration: 250,
        stagger: 20,
      });
    }, 0);
  },
};