import type p5 from 'p5';
import { DefaultGameObject } from './game_object.js';
import { GameManager } from './game_manager.js';
import { RAY_COUNT, WALL_PROJECTION_WIDTH } from './ray_caster.js';
import { CollisionIntercept } from './ray.js';
import { theme } from './theme.js';
import { FOV_ANGLE, MAP_TILE_SIZE, WINDOW_WIDTH } from './constants.js';
import { DefaultImageLoader, ImageName } from './image_loader.js';

const HALF_FOV_TANGENT = Math.tan(FOV_ANGLE / 2);
const HALF_WINDOW_WIDTH = WINDOW_WIDTH / 2;

/**
 * Projects ray casted wall distances into a pseudo-3D first-person view.
 */
export class RayProjector extends DefaultGameObject {
  /**
   * Draws one vertical wall column per ray across the full screen width.
   * @param p - p5 instance.
   */
  render(p: p5): void {
    const distanceProjectionPlane = HALF_WINDOW_WIDTH / HALF_FOV_TANGENT;
    const playerRotationAngle = GameManager.instance.player.rotationAngle;
    const testWallTexture = DefaultImageLoader.instance.get(ImageName.WallBrick);
    const textureWidth = testWallTexture?.width;

    for (let i = 0; i < RAY_COUNT; i++) {
      const ray = GameManager.instance.rayCaster.rays[i];
      const correctedDistance = ray.distance * Math.cos(ray.angle - playerRotationAngle);
      const projectedWallHeight = (MAP_TILE_SIZE / correctedDistance) * distanceProjectionPlane;
      const baseColor = ray.interceptHit === CollisionIntercept.Vertical ? 255 : 180;
      const tileX = ray.interceptHit === CollisionIntercept.Vertical && ray.isFacingLeft ? -1 : 0;
      const tileY = ray.interceptHit === CollisionIntercept.Horizontal && ray.isFacingUp ? -1 : 0;
      const tileValue = GameManager.instance.map.getAttributeAt({
        x: ray.collisionPoint.x + tileX,
        y: ray.collisionPoint.y + tileY,
      });

      if (theme.gradientShading) {
        const gradient = Math.exp(-correctedDistance * theme.gradientScale);
        const brightness = baseColor * gradient;
        p.fill(brightness, brightness, brightness, 255);
      } else {
        p.fill(baseColor, baseColor, baseColor, 255);
      }

      p.noStroke();

      // TODO: Refactor after testing wall texturing
      if (tileValue === 2) {
        let offset: number;
        if (ray.collidesWithY) {
          offset = ray.collisionPoint.y % MAP_TILE_SIZE;
        } else {
          offset = ray.collisionPoint.x % MAP_TILE_SIZE;
        }
        const texelX = Math.floor((offset / MAP_TILE_SIZE) * textureWidth!);

        p.image(
          testWallTexture!,
          i * WALL_PROJECTION_WIDTH,
          HALF_WINDOW_WIDTH - projectedWallHeight / 2,
          WALL_PROJECTION_WIDTH,
          projectedWallHeight,
          texelX,
          0,
          1,
          MAP_TILE_SIZE,
        );
      } else {
        p.rect(
          i * WALL_PROJECTION_WIDTH,
          HALF_WINDOW_WIDTH - projectedWallHeight / 2,
          WALL_PROJECTION_WIDTH,
          projectedWallHeight,
        );
      }
    }
  }
}
