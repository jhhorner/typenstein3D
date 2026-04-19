import type p5 from 'p5';
import { DefaultGameObject } from '../core/game_object.js';
import { GameManager } from '../game_manager.js';
import { RAY_COUNT, WALL_PROJECTION_WIDTH } from './ray_caster.js';
import { CollisionIntercept } from './ray.js';
import { HALF_FOV_TANGENT, HALF_WINDOW_WIDTH, MAP_TILE_SIZE } from '../core/constants.js';
import { DefaultImageLoader } from '../resources/image_loader.js';
import { ImageName } from '../resources/image_name.js';

export const wallResourceMap: Record<number, ImageName> = {
  1: ImageName.WallBrick,
  2: ImageName.SlateStone,
  3: ImageName.SlateStone2,
  4: ImageName.SlateStone3,
  5: ImageName.SlateStoneSign,
  6: ImageName.BlueStone,
  7: ImageName.Purple,
};

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

    for (let i = 0; i < RAY_COUNT; i++) {
      const ray = GameManager.instance.rayCaster.rays[i];
      const correctedDistance = ray.distance * Math.cos(ray.angle - playerRotationAngle);
      const projectedWallHeight = (MAP_TILE_SIZE / correctedDistance) * distanceProjectionPlane;
      const tileX = ray.interceptHit === CollisionIntercept.Vertical && ray.isFacingLeft ? -1 : 0;
      const tileY = ray.interceptHit === CollisionIntercept.Horizontal && ray.isFacingUp ? -1 : 0;
      const tileValue = GameManager.instance.map.getAttributeAt({
        x: ray.collisionPoint.x + tileX,
        y: ray.collisionPoint.y + tileY,
      });

      p.noStroke();

      const wallTextureName = wallResourceMap[tileValue] || ImageName.Fail;
      const wallTexture = DefaultImageLoader.instance.get(wallTextureName);

      let offset: number;
      if (ray.collidesWithY) {
        offset = ray.collisionPoint.y % MAP_TILE_SIZE;
      } else {
        offset = ray.collisionPoint.x % MAP_TILE_SIZE;
      }
      const xTexelPosition = Math.floor((offset / MAP_TILE_SIZE) * wallTexture!.width);

      p.image(
        wallTexture!,
        i * WALL_PROJECTION_WIDTH,
        HALF_WINDOW_WIDTH - projectedWallHeight / 2,
        WALL_PROJECTION_WIDTH,
        projectedWallHeight,
        xTexelPosition,
        0,
        1,
        MAP_TILE_SIZE,
      );
    }
  }
}
