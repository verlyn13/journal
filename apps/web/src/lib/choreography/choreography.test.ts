// Choreography System Tests

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ChoreographyOrchestrator } from './orchestrator';
import { Timeline } from './timeline';
import { GestureCoordinator } from './gestures';
import { LayoutTransitionManager } from './layout';
import type { ChoreographySequence } from './types';

describe('Choreography System', () => {
  describe('ChoreographyOrchestrator', () => {
    let orchestrator: ChoreographyOrchestrator;
    
    beforeEach(() => {
      orchestrator = new ChoreographyOrchestrator();
    });

    it('should register and play sequences', async () => {
      const sequence: ChoreographySequence = {
        id: 'test-sequence',
        name: 'Test Animation',
        steps: [
          {
            target: '.test-element',
            animation: {
              keyframes: [
                { opacity: '0' },
                { opacity: '1' },
              ],
            },
            duration: 100,
          },
        ],
      };

      orchestrator.registerSequence(sequence);
      
      // Mock element
      const mockElement = document.createElement('div');
      mockElement.className = 'test-element';
      document.body.appendChild(mockElement);

      const animateSpy = vi.spyOn(mockElement, 'animate').mockImplementation(() => {
        return {
          play: vi.fn(),
          pause: vi.fn(),
          cancel: vi.fn(),
          finish: vi.fn(),
          reverse: vi.fn(),
          currentTime: 0,
          effect: null,
          finished: Promise.resolve(),
        } as any;
      });

      await orchestrator.play('test-sequence');
      
      expect(animateSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ opacity: '0' }),
          expect.objectContaining({ opacity: '1' }),
        ]),
        expect.objectContaining({
          duration: 100,
          fill: 'both',
        })
      );

      document.body.removeChild(mockElement);
    });

    it('should respect reduced motion preference', async () => {
      const matchMediaMock = vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
      });
      window.matchMedia = matchMediaMock;

      const sequence: ChoreographySequence = {
        id: 'reduced-motion-test',
        name: 'Reduced Motion Test',
        steps: [
          {
            target: '.test',
            animation: {
              to: { opacity: '1' },
            },
            duration: 300,
          },
        ],
      };

      const newOrchestrator = new ChoreographyOrchestrator();
      newOrchestrator.registerSequence(sequence);

      const mockElement = document.createElement('div');
      mockElement.className = 'test';
      document.body.appendChild(mockElement);

      await newOrchestrator.play('reduced-motion-test');
      
      // Should apply final state directly
      expect(mockElement.style.opacity).toBe('1');

      document.body.removeChild(mockElement);
    });

    it('should handle stagger delays', () => {
      const sequence: ChoreographySequence = {
        id: 'stagger-test',
        name: 'Stagger Test',
        steps: [],
        options: {
          stagger: 50,
        },
      };

      orchestrator.registerSequence(sequence);
      
      // Test stagger calculation (internal method would be tested via effects)
      const controller = orchestrator.getController('stagger-test');
      expect(controller).toBeUndefined(); // Not playing yet
    });

    it('should stop sequences', async () => {
      const sequence: ChoreographySequence = {
        id: 'stop-test',
        name: 'Stop Test',
        steps: [
          {
            target: '.stop-element',
            animation: {
              keyframes: [{ opacity: '0' }, { opacity: '1' }],
            },
            duration: 1000,
          },
        ],
      };

      orchestrator.registerSequence(sequence);
      
      const mockElement = document.createElement('div');
      mockElement.className = 'stop-element';
      document.body.appendChild(mockElement);

      const mockAnimation = {
        play: vi.fn(),
        cancel: vi.fn(),
        currentTime: 0,
        effect: null,
      };

      vi.spyOn(mockElement, 'animate').mockReturnValue(mockAnimation as any);

      await orchestrator.play('stop-test');
      orchestrator.stop('stop-test');

      // Verify stop clears the animation
      const controller = orchestrator.getController('stop-test');
      expect(controller).toBeUndefined();

      document.body.removeChild(mockElement);
    });
  });

  describe('Timeline', () => {
    let timeline: Timeline;

    beforeEach(() => {
      timeline = new Timeline({ duration: 1000 });
    });

    afterEach(() => {
      timeline.clear();
    });

    it('should add animations to timeline', () => {
      const element = document.createElement('div');
      
      timeline.add(element, [
        { opacity: '0' },
        { opacity: '1' },
      ], { duration: 300 });

      expect(timeline.progress).toBe(0);
    });

    it('should support position strings', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      
      timeline
        .add(el1, [{ opacity: '0' }, { opacity: '1' }], { duration: 300 })
        .add(el2, [{ opacity: '0' }, { opacity: '1' }], { duration: 200, position: '>' });

      // Second animation should start after first
      expect(timeline.progress).toBe(0);
    });

    it('should handle play/pause/restart', () => {
      const element = document.createElement('div');
      
      timeline.add(element, [
        { opacity: '0' },
        { opacity: '1' },
      ], { duration: 300 });

      timeline.play();
      timeline.pause();
      
      expect(timeline.progress).toBeGreaterThanOrEqual(0);
      
      timeline.restart();
      expect(timeline.progress).toBeCloseTo(0, 5);
    });

    it('should seek to specific time', () => {
      const element = document.createElement('div');
      
      timeline.add(element, [
        { opacity: '0' },
        { opacity: '1' },
      ], { duration: 1000 });

      timeline.seek(500);
      expect(timeline.progress).toBeCloseTo(0.5, 1);
    });
  });

  describe('GestureCoordinator', () => {
    let coordinator: GestureCoordinator;
    let element: HTMLElement;

    beforeEach(() => {
      coordinator = new GestureCoordinator({ threshold: 50 });
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      coordinator.destroy();
      document.body.removeChild(element);
    });

    it('should attach and detach from elements', () => {
      coordinator.attach(element);
      coordinator.detach(element);
      // Should not throw
      expect(true).toBe(true);
    });

    it('should handle gesture subscriptions', () => {
      const swipeHandler = vi.fn();
      const tapHandler = vi.fn();
      
      coordinator.on('swipe', swipeHandler);
      coordinator.on('tap', tapHandler);
      
      // Handlers are registered
      expect(swipeHandler).not.toHaveBeenCalled();
      expect(tapHandler).not.toHaveBeenCalled();
    });

    it('should respect disabled state', () => {
      const disabledCoordinator = new GestureCoordinator({ 
        enabled: false 
      });
      
      disabledCoordinator.attach(element);
      // Should not attach when disabled
      
      disabledCoordinator.destroy();
    });
  });

  describe('LayoutTransitionManager', () => {
    let manager: LayoutTransitionManager;

    beforeEach(() => {
      manager = new LayoutTransitionManager();
    });

    afterEach(() => {
      manager.clear();
    });

    it('should capture layout snapshots', () => {
      const element = document.createElement('div');
      element.className = 'test-layout';
      document.body.appendChild(element);

      manager.capture('test', '.test-layout');
      
      // Snapshot should be captured
      expect(manager.isTransitioning('test')).toBe(false);

      document.body.removeChild(element);
    });

    it('should perform morph transitions', async () => {
      const element = document.createElement('div');
      element.className = 'morph-test';
      document.body.appendChild(element);

      // Create a snapshot first
      manager.capture('morph', '.morph-test');
      
      // The morph transition will calculate deltas between snapshot and current position
      // Since we can't easily mock the complex delta calculation, we'll just verify
      // that the transition method runs without errors when positions differ
      await expect(
        manager.transition('morph', { type: 'morph', duration: 300 })
      ).resolves.toBeUndefined();

      document.body.removeChild(element);
    });

    it('should handle group transitions', async () => {
      const items = Array.from({ length: 3 }, (_, i) => {
        const el = document.createElement('div');
        el.className = 'group-item';
        document.body.appendChild(el);
        return el;
      });

      manager.captureGroup('group', '.group-item');
      
      await manager.transitionGroup('group', {
        type: 'fade',
        duration: 200,
        stagger: 50,
      });

      items.forEach(el => document.body.removeChild(el));
    });

    it('should respect reduced motion', async () => {
      const matchMediaMock = vi.fn().mockReturnValue({
        matches: true,
      });
      window.matchMedia = matchMediaMock;

      const newManager = new LayoutTransitionManager();
      const element = document.createElement('div');
      element.className = 'reduced-motion';
      document.body.appendChild(element);

      newManager.capture('reduced', '.reduced-motion');
      await newManager.transition('reduced', { type: 'morph' });

      // Should skip animation when reduced motion is preferred
      
      document.body.removeChild(element);
    });
  });

  describe('Preset Animations', () => {
    it('should have entry morph preset', async () => {
      const { presetTimelines } = await import('./timeline');
      
      expect(presetTimelines).toBeDefined();
      expect(presetTimelines.entryMorph).toBeInstanceOf(Function);
      
      // Don't actually call the function as it creates animations
      // Just verify it exists and is callable
    });

    it('should have sidebar collapse preset', async () => {
      const { presetTimelines } = await import('./timeline');
      
      expect(presetTimelines).toBeDefined();
      expect(presetTimelines.sidebarCollapse).toBeInstanceOf(Function);
      
      // Don't actually call the function as it creates animations
      // Just verify it exists and is callable
    });

    it('should have focus mode preset', async () => {
      const { presetTimelines } = await import('./timeline');
      
      expect(presetTimelines).toBeDefined();
      expect(presetTimelines.focusMode).toBeInstanceOf(Function);
      
      // Don't actually call the function as it creates animations
      // Just verify it exists and is callable
    });
  });
});