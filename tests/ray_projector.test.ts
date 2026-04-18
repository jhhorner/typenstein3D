import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { p5Mock } from './helpers/p5Mock.js';
import { GameManager } from '../src/game_manager.js';
import { RayCaster, RAY_COUNT } from '../src/ray_caster.js';
import { RayProjector } from '../src/ray_projector.js';
import { CollisionIntercept } from '../src/ray.js';
import { theme } from '../src/theme.js';

beforeEach(() => {
  (GameManager as any)._instance = new GameManager();
  GameManager.instance.rayCaster = new RayCaster();
  GameManager.instance.rayCaster.update();
});

describe('RayProjector.render', () => {
  it('should not throw', () => {
    const projector = new RayProjector();
    expect(() => projector.render(p5Mock)).not.toThrow();
  });

  it('should call rect once per ray', () => {
    const projector = new RayProjector();
    const rectSpy = vi.spyOn(p5Mock, 'rect');
    const imageSpy = vi.spyOn(p5Mock, 'image');

    projector.render(p5Mock);

    expect(rectSpy).toHaveBeenCalledTimes(RAY_COUNT - imageSpy.mock.calls.length);
    rectSpy.mockRestore();
  });

  it('should call noStroke once per ray', () => {
    const projector = new RayProjector();
    const noStrokeSpy = vi.spyOn(p5Mock, 'noStroke');

    projector.render(p5Mock);

    expect(noStrokeSpy).toHaveBeenCalledTimes(RAY_COUNT);
    noStrokeSpy.mockRestore();
  });

  describe('baseColor', () => {
    it('should be 255 for a vertical intercept hit', () => {
      const rays = GameManager.instance.rayCaster.rays;
      rays.forEach((r) => (r.interceptHit = CollisionIntercept.Vertical));

      const projector = new RayProjector();
      const fillSpy = vi.spyOn(p5Mock, 'fill');

      theme.gradientShading = false;
      projector.render(p5Mock);
      theme.gradientShading = false;

      fillSpy.mock.calls.forEach((args) => {
        expect(args[0]).toBe(255);
      });

      fillSpy.mockRestore();
    });

    it('should be 180 for a horizontal intercept hit', () => {
      const rays = GameManager.instance.rayCaster.rays;
      rays.forEach((r) => (r.interceptHit = CollisionIntercept.Horizontal));

      const projector = new RayProjector();
      const fillSpy = vi.spyOn(p5Mock, 'fill');

      theme.gradientShading = false;
      projector.render(p5Mock);
      theme.gradientShading = false;

      fillSpy.mock.calls.forEach((args) => {
        expect(args[0]).toBe(180);
      });

      fillSpy.mockRestore();
    });
  });

  describe('when gradient shading is disabled', () => {
    afterEach(() => {
      theme.gradientShading = false;
    });

    it('should call fill with four arguments including alpha 255', () => {
      theme.gradientShading = false;
      const projector = new RayProjector();
      const fillSpy = vi.spyOn(p5Mock, 'fill');

      projector.render(p5Mock);

      expect(fillSpy).toHaveBeenCalled();
      fillSpy.mock.calls.forEach((args) => {
        const a = args as unknown as number[];
        expect(a).toHaveLength(4);
        expect(a[3]).toBe(255);
      });

      fillSpy.mockRestore();
    });
  });

  describe('when gradient shading is enabled', () => {
    afterEach(() => {
      theme.gradientShading = false;
    });

    it('should call fill with four arguments including alpha 255', () => {
      theme.gradientShading = true;
      const projector = new RayProjector();
      const fillSpy = vi.spyOn(p5Mock, 'fill');

      projector.render(p5Mock);

      expect(fillSpy).toHaveBeenCalled();
      fillSpy.mock.calls.forEach((args) => {
        const a = args as unknown as number[];
        expect(a).toHaveLength(4);
        expect(a[3]).toBe(255);
      });

      fillSpy.mockRestore();
    });

    it('should pass equal R, G, B values (gray brightness)', () => {
      theme.gradientShading = true;
      const projector = new RayProjector();
      const fillSpy = vi.spyOn(p5Mock, 'fill');

      projector.render(p5Mock);

      const [r, g, b] = fillSpy.mock.calls[0] as unknown as [number, number, number];
      expect(r).toBe(g);
      expect(g).toBe(b);

      fillSpy.mockRestore();
    });

    it('should have brightness greater than zero', () => {
      theme.gradientShading = true;
      const projector = new RayProjector();
      const fillSpy = vi.spyOn(p5Mock, 'fill');

      projector.render(p5Mock);

      fillSpy.mock.calls.forEach((args) => {
        expect(args[0]).toBeGreaterThan(0);
      });

      fillSpy.mockRestore();
    });

    it('should have brightness at most the flat baseColor', () => {
      theme.gradientShading = true;
      const rays = GameManager.instance.rayCaster.rays;
      rays.forEach((r) => (r.interceptHit = CollisionIntercept.Vertical));

      const projector = new RayProjector();
      const fillSpy = vi.spyOn(p5Mock, 'fill');

      projector.render(p5Mock);

      fillSpy.mock.calls.forEach((args) => {
        expect(args[0]).toBeLessThanOrEqual(255);
      });

      fillSpy.mockRestore();
    });
  });
});
