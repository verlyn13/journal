// Gesture Coordination System

import type { GestureConfig } from './types';

export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'drag' | 'tap' | 'doubletap';
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  velocity?: number;
  scale?: number;
  target: Element;
}

export class GestureCoordinator {
  private listeners: Map<string, Set<(event: GestureEvent) => void>> = new Map();
  private activeGestures: Map<Element, GestureTracker> = new Map();

  constructor(private config: GestureConfig = {}) {
    this.config = {
      threshold: 50,
      direction: 'both',
      enabled: true,
      ...config,
    };
  }

  // Attach gesture tracking to element
  attach(element: Element): void {
    if (!this.config.enabled) return;

    const tracker = new GestureTracker(element, this.config);
    this.activeGestures.set(element, tracker);

    // Set up event listeners
    tracker.on('gesture', (event: GestureEvent) => {
      this.handleGesture(event);
    });

    tracker.start();
  }

  // Detach gesture tracking
  detach(element: Element): void {
    const tracker = this.activeGestures.get(element);
    if (tracker) {
      tracker.stop();
      this.activeGestures.delete(element);
    }
  }

  // Handle gesture event
  private handleGesture(event: GestureEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        listener(event);
      });
    }
  }

  // Subscribe to gesture events
  on(type: string, callback: (event: GestureEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);
  }

  // Unsubscribe from gesture events
  off(type: string, callback: (event: GestureEvent) => void): void {
    this.listeners.get(type)?.delete(callback);
  }

  // Clean up all gestures
  destroy(): void {
    this.activeGestures.forEach((tracker) => {
      tracker.stop();
    });
    this.activeGestures.clear();
    this.listeners.clear();
  }
}

// Individual gesture tracker
class GestureTracker {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private lastTapTime = 0;
  private isPinching = false;
  private initialDistance = 0;
  private listeners: Map<string, (event: GestureEvent) => void> = new Map();

  constructor(
    private element: Element,
    private config: GestureConfig,
  ) {}

  start(): void {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart as EventListener);
    this.element.addEventListener('touchmove', this.handleTouchMove as EventListener);
    this.element.addEventListener('touchend', this.handleTouchEnd as EventListener);

    // Mouse events (for desktop)
    this.element.addEventListener('mousedown', this.handleMouseDown as EventListener);
    this.element.addEventListener('mousemove', this.handleMouseMove as EventListener);
    this.element.addEventListener('mouseup', this.handleMouseUp as EventListener);
  }

  stop(): void {
    // Remove touch events
    this.element.removeEventListener('touchstart', this.handleTouchStart as EventListener);
    this.element.removeEventListener('touchmove', this.handleTouchMove as EventListener);
    this.element.removeEventListener('touchend', this.handleTouchEnd as EventListener);

    // Remove mouse events
    this.element.removeEventListener('mousedown', this.handleMouseDown as EventListener);
    this.element.removeEventListener('mousemove', this.handleMouseMove as EventListener);
    this.element.removeEventListener('mouseup', this.handleMouseUp as EventListener);
  }

  on(event: string, callback: (event: GestureEvent) => void): void {
    this.listeners.set(event, callback);
  }

  private emit(event: GestureEvent): void {
    const callback = this.listeners.get('gesture');
    if (callback) {
      callback(event);
    }
  }

  // Touch event handlers
  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length === 1) {
      // Single touch - potential swipe/drag
      const touch = e.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;
      this.startTime = Date.now();
    } else if (e.touches.length === 2) {
      // Two touches - potential pinch
      this.isPinching = true;
      this.initialDistance = this.getTouchDistance(e.touches);
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (this.isPinching && e.touches.length === 2) {
      const currentDistance = this.getTouchDistance(e.touches);
      const scale = currentDistance / this.initialDistance;

      this.emit({
        type: 'pinch',
        scale,
        target: this.element,
      });
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 0 && !this.isPinching) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.startX;
      const deltaY = touch.clientY - this.startY;
      const deltaTime = Date.now() - this.startTime;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      // Check for tap/double tap
      if (distance < 10 && deltaTime < 200) {
        const now = Date.now();
        if (now - this.lastTapTime < 300) {
          this.emit({
            type: 'doubletap',
            target: this.element,
          });
        } else {
          this.emit({
            type: 'tap',
            target: this.element,
          });
        }
        this.lastTapTime = now;
        return;
      }

      // Check for swipe
      if (distance > (this.config.threshold || 50) && velocity > 0.3) {
        const direction = this.getSwipeDirection(deltaX, deltaY);

        if (this.isDirectionAllowed(direction)) {
          this.emit({
            type: 'swipe',
            direction,
            distance,
            velocity,
            target: this.element,
          });
        }
      }
    }

    this.isPinching = false;
  };

  // Mouse event handlers (simplified for desktop)
  private handleMouseDown = (e: MouseEvent): void => {
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startTime = Date.now();
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (e.buttons === 1) {
      // Mouse is being dragged
      const deltaX = e.clientX - this.startX;
      const deltaY = e.clientY - this.startY;

      this.emit({
        type: 'drag',
        distance: Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        direction: this.getSwipeDirection(deltaX, deltaY),
        target: this.element,
      });
    }
  };

  private handleMouseUp = (e: MouseEvent): void => {
    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;
    const deltaTime = Date.now() - this.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check for click (tap equivalent)
    if (distance < 5 && deltaTime < 200) {
      const now = Date.now();
      if (now - this.lastTapTime < 300) {
        this.emit({
          type: 'doubletap',
          target: this.element,
        });
      } else {
        this.emit({
          type: 'tap',
          target: this.element,
        });
      }
      this.lastTapTime = now;
    }
  };

  // Helper methods
  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getSwipeDirection(deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  private isDirectionAllowed(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    const { direction: allowedDirection } = this.config;

    if (allowedDirection === 'both') return true;
    if (allowedDirection === 'horizontal') return direction === 'left' || direction === 'right';
    if (allowedDirection === 'vertical') return direction === 'up' || direction === 'down';

    return false;
  }
}
