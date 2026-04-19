import type p5 from 'p5';
import { Ray } from './ray.js';
import { GameManager } from '../game_manager.js';
import { DefaultGameObject } from '../core/game_object.js';
import { debugOptions } from '../config/debug_options.js';
import { FOV_ANGLE, WINDOW_WIDTH } from '../core/constants.js';

/** Number of vertical screen columns used for wall projection. */
export const WALL_PROJECTION_WIDTH = 1;

/** Angular step between consecutive rays, distributed evenly across the FOV. */
export const RAY_COUNT = WINDOW_WIDTH / WALL_PROJECTION_WIDTH;

/**
 * Creates the set of rays and casts each frame across the player's FOV.
 */
export class RayCaster extends DefaultGameObject {
  /** The full set of rays cast each frame, one per grid column. */
  readonly rays: Ray[];

  constructor() {
    super();
    this.rays = [];
    for (let i = 0; i < RAY_COUNT; i++) {
      this.rays.push(new Ray());
    }
  }

  /**
   * Renders all casted rays on the map.
   * @param p - p5 instance.
   */
  render(p: p5): void {
    if (debugOptions.render.singleRay) {
      this.rays[0].render(p);
    } else {
      this.rays.forEach((r) => r.render(p));
    }
  }

  /**
   * Resets and casts rays each frame.
   */
  update(_deltaTime: number) {
    const playerAngle = GameManager.instance.player.rotationAngle;
    let rayAngle = playerAngle - FOV_ANGLE / 2;

    for (let i = 0; i < RAY_COUNT; i++) {
      this.rays[i].angle = rayAngle;
      this.rays[i].cast();

      rayAngle += FOV_ANGLE / RAY_COUNT;
    }
  }
}
