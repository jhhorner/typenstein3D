import type p5 from 'p5';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeP5Mock, mockDeltaTime } from '../helpers/p5Mock.js';
import { GameManager } from '../../src/game_manager.js';
import { RayCaster, RAY_COUNT, WALL_PROJECTION_WIDTH } from '../../src/rendering/ray_caster.js';
import { RayProjector } from '../../src/rendering/ray_projector.js';
import { CollisionIntercept, RayDirection } from '../../src/rendering/ray.js';
import { DefaultImageLoader } from '../../src/resources/image_loader.js';
import { MAP_TILE_SIZE } from '../../src/core/constants.js';
import { ImageName } from '../../src/resources/image_name.js';

let p5Mock: p5;

beforeEach(() => {
  p5Mock = makeP5Mock();
  GameManager._resetInstance();
  GameManager.instance.rayCaster = new RayCaster();
  GameManager.instance.rayCaster.update(mockDeltaTime);
  (DefaultImageLoader as any)._instance = { get: vi.fn(() => ({ width: 64 })) };
});

describe('RayProjector.render', () => {
  it('should not throw', () => {
    const projector = new RayProjector();
    expect(() => projector.render(p5Mock)).not.toThrow();
  });

  it('should call rect or image once per ray', () => {
    const projector = new RayProjector();
    const rectSpy = vi.spyOn(p5Mock, 'rect');
    const imageSpy = vi.spyOn(p5Mock, 'image');

    projector.render(p5Mock);

    expect(rectSpy.mock.calls.length + imageSpy.mock.calls.length).toBe(RAY_COUNT);
    rectSpy.mockRestore();
    imageSpy.mockRestore();
  });

  it('should call noStroke once per ray', () => {
    const projector = new RayProjector();
    const noStrokeSpy = vi.spyOn(p5Mock, 'noStroke');

    projector.render(p5Mock);

    expect(noStrokeSpy).toHaveBeenCalledTimes(RAY_COUNT);
    noStrokeSpy.mockRestore();
  });

  describe('texel offset', () => {
    it('should derive xTexelPosition from collisionPoint.y for a vertical intercept', () => {
      const knownY = 32;
      GameManager.instance.rayCaster.rays.forEach((r) => {
        r.interceptHit = CollisionIntercept.Vertical;
        r.collisionPoint.y = knownY;
      });

      const projector = new RayProjector();
      const imageSpy = vi.spyOn(p5Mock, 'image');

      projector.render(p5Mock);

      // xTexelPosition = Math.floor((32 % 64) / 64 * 64) = 32
      const expectedTexelX = Math.floor(((knownY % MAP_TILE_SIZE) / MAP_TILE_SIZE) * 64);
      imageSpy.mock.calls.forEach((args) => {
        expect(args[5]).toBe(expectedTexelX);
      });

      imageSpy.mockRestore();
    });

    it('should derive xTexelPosition from collisionPoint.x for a horizontal intercept', () => {
      const knownX = 48;
      GameManager.instance.rayCaster.rays.forEach((r) => {
        r.interceptHit = CollisionIntercept.Horizontal;
        r.collisionPoint.x = knownX;
      });

      const projector = new RayProjector();
      const imageSpy = vi.spyOn(p5Mock, 'image');

      projector.render(p5Mock);

      // xTexelPosition = Math.floor((48 % 64) / 64 * 64) = 48
      const expectedTexelX = Math.floor(((knownX % MAP_TILE_SIZE) / MAP_TILE_SIZE) * 64);
      imageSpy.mock.calls.forEach((args) => {
        expect(args[5]).toBe(expectedTexelX);
      });

      imageSpy.mockRestore();
    });
  });

  describe('tile lookup offsets', () => {
    it('should apply tileX of -1 when a vertical intercept is facing left', () => {
      const knownX = 128;
      GameManager.instance.rayCaster.rays.forEach((r) => {
        r.interceptHit = CollisionIntercept.Vertical;
        r.facingDirection = RayDirection.Left;
        r.isFacingLeft = true;
        r.collisionPoint.x = knownX;
        r.collisionPoint.y = 128;
      });
      const getAttributeSpy = vi.spyOn(GameManager.instance.map, 'getAttributeAt');

      const projector = new RayProjector();
      projector.render(p5Mock);

      getAttributeSpy.mock.calls.forEach((args) => {
        expect(args[0].x).toBe(knownX - 1);
      });
      getAttributeSpy.mockRestore();
    });

    it('should apply tileY of -1 when a horizontal intercept is facing up', () => {
      const knownY = 128;
      GameManager.instance.rayCaster.rays.forEach((r) => {
        r.interceptHit = CollisionIntercept.Horizontal;
        r.facingDirection = RayDirection.Up;
        r.collisionPoint.x = 128;
        r.collisionPoint.y = knownY;
      });
      const getAttributeSpy = vi.spyOn(GameManager.instance.map, 'getAttributeAt');

      const projector = new RayProjector();
      projector.render(p5Mock);

      getAttributeSpy.mock.calls.forEach((args) => {
        expect(args[0].y).toBe(knownY - 1);
      });
      getAttributeSpy.mockRestore();
    });

    it('should fall back to ImageName.Fail when the tile value has no mapped texture', () => {
      vi.spyOn(GameManager.instance.map, 'getAttributeAt').mockReturnValue(0);
      const getMock = (DefaultImageLoader as any)._instance.get as ReturnType<typeof vi.fn>;

      const projector = new RayProjector();
      projector.render(p5Mock);

      expect(getMock).toHaveBeenCalledWith(ImageName.Fail);
      vi.restoreAllMocks();
    });
  });

  describe('screen column positions', () => {
    it('should draw each ray at the correct screen x position', () => {
      const projector = new RayProjector();
      const imageSpy = vi.spyOn(p5Mock, 'image');

      projector.render(p5Mock);

      imageSpy.mock.calls.forEach((args, i) => {
        expect(args[1]).toBe(i * WALL_PROJECTION_WIDTH);
      });

      imageSpy.mockRestore();
    });
  });
});
