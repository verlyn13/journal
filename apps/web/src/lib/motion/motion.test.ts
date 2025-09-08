import { describe, expect, it } from 'vitest';
import { createSpring, createStagger } from './orchestrator';
import { easingFunctions, motionPresets, springPresets } from './presets';
import { calculateStagger, getMotionDuration, interpolateSpring } from './utils';

describe('Motion System', () => {
  describe('Spring Physics', () => {
    it('should create spring with initial value', () => {
      const spring = createSpring(0, springPresets.gentle);
      expect(spring.position).toBe(0);
      expect(spring.velocity).toBe(0);
    });

    it('should update spring position over time', () => {
      const spring = createSpring(0, springPresets.gentle);
      spring.setTarget(100);

      // Simulate time steps
      for (let i = 0; i < 100; i++) {
        spring.update(0.016); // ~60fps
      }

      // Should be close to target
      expect(spring.position).toBeCloseTo(100, 0);
    });

    it('should settle when near target', () => {
      const spring = createSpring(0, springPresets.stiff);
      spring.setTarget(50);

      // Run until settled
      let iterations = 0;
      while (!spring.isSettled() && iterations < 1000) {
        spring.update(0.016);
        iterations++;
      }

      expect(spring.isSettled()).toBe(true);
      expect(spring.position).toBeCloseTo(50, 1);
    });
  });

  describe('Stagger Calculations', () => {
    it('should create linear stagger delays', () => {
      const delays = createStagger({
        children: 5,
        delayBetween: 100,
        from: 'first',
      });

      expect(delays).toEqual([0, 100, 200, 300, 400]);
    });

    it('should stagger from last', () => {
      const delays = createStagger({
        children: 4,
        delayBetween: 50,
        from: 'last',
      });

      expect(delays).toEqual([150, 100, 50, 0]);
    });

    it('should stagger from center', () => {
      const delays = createStagger({
        children: 5,
        delayBetween: 100,
        from: 'center',
      });

      // Center is at index 2, distances are [2, 1, 0, 1, 2]
      expect(delays).toEqual([200, 100, 0, 100, 200]);
    });

    it('should apply easing to stagger', () => {
      const delays = createStagger({
        children: 3,
        delayBetween: 100,
        from: 'first',
        ease: easingFunctions.easeIn,
      });

      // With easeIn, delays should be modified
      expect(delays[0]).toBe(0);
      expect(delays[1]).toBeGreaterThan(0);
      expect(delays[2]).toBeGreaterThan(delays[1]);
    });
  });

  describe('Motion Utilities', () => {
    it('should calculate motion duration', () => {
      expect(getMotionDuration({ duration: 500, delay: 100 })).toBe(600);
      expect(getMotionDuration({ duration: 300, loop: 3 })).toBe(900);
      expect(getMotionDuration({})).toBe(300); // Default duration
    });

    it('should interpolate spring values', () => {
      const config = springPresets.gentle;
      const value = interpolateSpring(0, 100, config, 0);
      expect(value).toBe(0);

      const midValue = interpolateSpring(0, 100, config, 0.5);
      expect(midValue).toBeGreaterThan(0);
      // Spring can overshoot target, so we allow for that
      expect(midValue).toBeLessThan(150);
    });

    it('should calculate stagger with different strategies', () => {
      const config = {
        children: 5,
        delayBetween: 50,
        from: 'first' as const,
      };

      expect(calculateStagger(0, 5, config)).toBe(0);
      expect(calculateStagger(2, 5, config)).toBe(100);

      (config as { from: 'first' | 'last' | 'center' }).from = 'last';
      expect(calculateStagger(0, 5, config)).toBe(200);
      expect(calculateStagger(4, 5, config)).toBe(0);
    });
  });

  describe('Motion Presets', () => {
    it('should have all easing functions', () => {
      expect(easingFunctions.linear(0.5)).toBe(0.5);
      expect(easingFunctions.easeIn(0)).toBe(0);
      expect(easingFunctions.easeIn(1)).toBe(1);
      expect(easingFunctions.easeOut(0.5)).toBeCloseTo(0.75, 2);
    });

    it('should have spring presets with required properties', () => {
      Object.values(springPresets).forEach((preset) => {
        expect(preset).toHaveProperty('stiffness');
        expect(preset).toHaveProperty('damping');
        expect(preset).toHaveProperty('mass');
      });
    });

    it('should have motion presets with configurations', () => {
      expect(motionPresets.fadeIn).toHaveProperty('duration');
      expect(motionPresets.fadeIn).toHaveProperty('easing');
      expect(motionPresets.bounce).toHaveProperty('reset');
      expect(motionPresets.pulse).toHaveProperty('loop');
    });
  });
});
