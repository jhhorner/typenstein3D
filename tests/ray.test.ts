import { describe, it, expect, beforeEach, vi } from 'vitest';
import type p5 from 'p5';
import { GameManager } from '../src/game_manager.js';
import { Ray, CollisionIntercept } from '../src/rendering/ray.js';
import { MAP_TILE_SIZE } from '../src/core/constants.js';
import { theme } from '../src/config/theme.js';
import { makeP5Mock } from './helpers/p5Mock.js';

let p5Mock: p5;

beforeEach(() => {
  p5Mock = makeP5Mock();
  GameManager._resetInstance();
});

describe('Ray direction flags', () => {
  it('should set isFacingDown and isFacingRight for π/4 (down-right)', () => {
    const ray = new Ray(Math.PI / 4);

    expect(ray.isFacingDown).toBe(true);
    expect(ray.isFacingRight).toBe(true);
    expect(ray.isFacingUp).toBe(false);
    expect(ray.isFacingLeft).toBe(false);
  });

  it('should set isFacingDown and isFacingLeft for 3π/4 (down-left)', () => {
    const ray = new Ray((3 * Math.PI) / 4);

    expect(ray.isFacingDown).toBe(true);
    expect(ray.isFacingLeft).toBe(true);
  });

  it('should set isFacingUp and isFacingLeft for 5π/4 (up-left)', () => {
    const ray = new Ray((5 * Math.PI) / 4);

    expect(ray.isFacingUp).toBe(true);
    expect(ray.isFacingLeft).toBe(true);
  });

  it('should set isFacingUp and isFacingRight for 7π/4 (up-right)', () => {
    const ray = new Ray((7 * Math.PI) / 4);

    expect(ray.isFacingUp).toBe(true);
    expect(ray.isFacingRight).toBe(true);
  });
});

describe('Ray.angle', () => {
  it('should update direction flags after reset', () => {
    const ray = new Ray(Math.PI / 4); // down-right

    ray.angle = (5 * Math.PI) / 4; // now up-left

    expect(ray.isFacingUp).toBe(true);
    expect(ray.isFacingLeft).toBe(true);
  });

  it('should normalize negative angles to [0, 2π)', () => {
    const ray = new Ray(0);

    ray.angle = -Math.PI / 2; // equivalent to 3π/2 → up, horizontal boundary is Left

    expect(ray.isFacingUp).toBe(true);
    expect(ray.isFacingLeft).toBe(true);
  });

  it('should normalize angles beyond 2π', () => {
    const ray = new Ray(0);

    ray.angle = 3 * Math.PI; // equivalent to π → up (π is not strictly < π), Left

    expect(ray.isFacingUp).toBe(true);
    expect(ray.isFacingLeft).toBe(true);
  });
});

describe('Ray.collidesWithX', () => {
  it('should return true when interceptHit is Horizontal', () => {
    const ray = new Ray(0);
    ray.interceptHit = CollisionIntercept.Horizontal;

    expect(ray.collidesWithX).toBe(true);
  });

  it('should return false when interceptHit is Vertical', () => {
    const ray = new Ray(0);
    ray.interceptHit = CollisionIntercept.Vertical;

    expect(ray.collidesWithX).toBe(false);
  });

  it('should return false when interceptHit is None', () => {
    const ray = new Ray(0);
    ray.interceptHit = CollisionIntercept.None;

    expect(ray.collidesWithX).toBe(false);
  });
});

describe('Ray.cast (step sign correction branches)', () => {
  // angle 3π/4 (down-left): tan is negative → triggers isFacingDown && yStep < 0 on line 188
  it('should cast correctly at 3π/4 (down-left)', () => {
    const ray = new Ray((3 * Math.PI) / 4);

    ray.cast();

    expect(ray.collisionPoint.x).toBeGreaterThanOrEqual(0);
    expect(ray.collisionPoint.y).toBeGreaterThanOrEqual(0);
  });

  // angle 7π/4 (up-right): tan is negative → triggers isFacingRight && xStep < 0 on line 155
  it('should cast correctly at 7π/4 (up-right)', () => {
    const ray = new Ray((7 * Math.PI) / 4);

    ray.cast();

    expect(ray.collisionPoint.x).toBeGreaterThanOrEqual(0);
    expect(ray.collisionPoint.y).toBeGreaterThanOrEqual(0);
  });
});

describe('Ray.cast', () => {
  it('should set collisionPoint to a non-origin wall for a ray cast into the map', () => {
    // Player starts at MAP center; cast a ray facing right (angle = 0)
    // It should hit the right wall of the map
    const player = GameManager.instance.player;
    player.rotationAngle = 0; // facing right

    const ray = new Ray(0);
    ray.cast();

    expect(ray.collisionPoint.x).toBeGreaterThan(0);
    // collisionPoint should be on a tile boundary (multiple of MAP_TILE_SIZE)
    expect(ray.collisionPoint.x % MAP_TILE_SIZE).toBeCloseTo(0, 0);
  });

  it('should set collisionPoint to a non-origin wall when facing up', () => {
    const ray = new Ray(2 * Math.PI); // facing up

    ray.cast();

    expect(ray.collisionPoint.y).toBeGreaterThanOrEqual(0);
    expect(ray.distance).toBeGreaterThan(0);
  });

  it('should mutate collisionPoint in-place (same object reference)', () => {
    const ray = new Ray(0);
    const originalRef = ray.collisionPoint;

    ray.cast();

    expect(ray.collisionPoint).toBe(originalRef);
  });
});

describe('Ray.render', () => {
  it('should render without throwing', () => {
    const ray = new Ray(0);

    ray.cast();

    expect(() => ray.render(p5Mock)).not.toThrow();
  });

  it('should use theme.map.rays color (with alpha) for stroke', () => {
    const strokeSpy = vi.spyOn(p5Mock, 'stroke');
    const ray = new Ray(0);

    ray.cast();
    ray.render(p5Mock);

    expect(strokeSpy).toHaveBeenCalledWith(`${theme.map.rays}50`);
    strokeSpy.mockRestore();
  });
});
