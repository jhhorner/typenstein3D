import type p5 from 'p5';
import { theme } from '../config/theme.js';
import { distance, Vector } from '../core/math.js';
import { GameManager } from '../game_manager.js';
import { TileAttribute } from '../world/game_map.js';
import { MAP_TILE_SIZE } from '../core/constants.js';

type Intercept = {
  x: number;
  y: number;
  xStep: number;
  yStep: number;
};

/** Identifies which type of grid-line crossing produced a collision. */
export enum CollisionIntercept {
  None,
  Vertical,
  Horizontal,
}

/**
 * A single ray cast from the player's position at a given angle.
 */
export class Ray {
  private _angle = 0;
  private _tanAngle: number = 0;
  private readonly _hIntercept: Intercept = { x: 0, y: 0, xStep: 0, yStep: 0 };
  private readonly _vIntercept: Intercept = { x: 0, y: 0, xStep: 0, yStep: 0 };

  isFacingUp = false;
  isFacingDown = true;
  isFacingLeft = false;
  isFacingRight = false;

  distance: number = 0;
  interceptHit = CollisionIntercept.None;
  collisionPoint: Vector = { x: 0, y: 0 };

  /**
   * Sets the ray to a new angle.
   * @param newAngle - New angle in radians.
   */
  set angle(newAngle: number) {
    this._angle = Ray.normalize(newAngle);
    this._tanAngle = Math.tan(this._angle);

    this.isFacingDown = this._angle > 0 && this._angle < Math.PI;
    this.isFacingUp = !this.isFacingDown;
    this.isFacingLeft = !(this._angle < 0.5 * Math.PI || this._angle > 1.5 * Math.PI);
    this.isFacingRight = !this.isFacingLeft;
  }

  get angle(): number {
    return this._angle;
  }

  get collidesWithY(): boolean {
    return this.interceptHit === CollisionIntercept.Vertical;
  }

  get collidesWithX(): boolean {
    return this.interceptHit === CollisionIntercept.Horizontal;
  }

  /**
   * @param angle - Angle in radians. Normalized to `[0, 2π)`.
   */
  constructor(angle: number = 0) {
    this.angle = angle;
  }

  /**
   * Normalizes an angle to the range `[0, 2π)`.
   * @param angle - Angle in radians (may be negative or exceed `2π`).
   * @returns Equivalent angle in `[0, 2π)`.
   */
  private static normalize(angle: number): number {
    angle %= 2 * Math.PI;
    if (angle < 0) {
      angle = 2 * Math.PI + angle;
    }

    return angle;
  }

  /** Returns `value` with its sign forced: negative if `shouldBeNegative`, positive otherwise. */
  private static alignSign(value: number, shouldBeNegative: boolean): number {
    return shouldBeNegative ? -Math.abs(value) : Math.abs(value);
  }

  /**
   * Draws a red line from the player to the ray's collision point.
   * @param p - p5 instance.
   */
  render(p: p5) {
    p.stroke(`${theme.map.rays}50`);
    p.line(
      GameManager.instance.player.position.x,
      GameManager.instance.player.position.y,
      this.collisionPoint.x,
      this.collisionPoint.y,
    );
  }

  /**
   * Implements the DDA (Digital Differential Analysis) algorithm: independently walks along
   * horizontal & vertical grid-line intersections, to find whichever collision is closer to the player.
   *
   * Sets {@link collisionPoint} to the nearest wall collision.
   */
  cast() {
    const playerPosition = GameManager.instance.player.position;
    const yIntercept = this.findCollidingHorizontalIntercept(playerPosition);
    const xIntercept = this.findCollidingVerticalIntercept(playerPosition);

    const yCollisionDistance = distance(playerPosition, yIntercept);
    const xCollisionDistance = distance(playerPosition, xIntercept);
    const useHorizontal = yCollisionDistance < xCollisionDistance;

    this.interceptHit = useHorizontal ? CollisionIntercept.Horizontal : CollisionIntercept.Vertical;
    this.distance = useHorizontal ? yCollisionDistance : xCollisionDistance;
    this.collisionPoint.x = useHorizontal ? yIntercept.x : xIntercept.x;
    this.collisionPoint.y = useHorizontal ? yIntercept.y : xIntercept.y;
  }

  /**
   * Walks the ray along horizontal grid lines until it hits a wall or leaves the map.
   * @returns The first wall collision point, or `null` if the ray exits the map without hitting a wall.
   */
  private findCollidingHorizontalIntercept(playerPosition: Vector): Vector {
    this._hIntercept.y = Math.floor(playerPosition.y / MAP_TILE_SIZE) * MAP_TILE_SIZE;
    this._hIntercept.y += this.isFacingDown ? MAP_TILE_SIZE : 0;
    this._hIntercept.x = playerPosition.x + (this._hIntercept.y - playerPosition.y) / this._tanAngle;

    this._hIntercept.yStep = MAP_TILE_SIZE;
    this._hIntercept.yStep *= this.isFacingUp ? -1 : 1;
    this._hIntercept.xStep = Ray.alignSign(MAP_TILE_SIZE / this._tanAngle, this.isFacingLeft);

    return this.getCollisionIntercept(this._hIntercept, { x: 0, y: this.isFacingUp ? -1 : 0 });
  }

  /**
   * Walks the ray along vertical grid lines until it hits a wall or leaves the map.
   * @returns The first wall collision point, or `null` if the ray exits the map
   *   without hitting a wall.
   */
  private findCollidingVerticalIntercept(playerPosition: Vector): Vector {
    this._vIntercept.x = Math.floor(playerPosition.x / MAP_TILE_SIZE) * MAP_TILE_SIZE;
    this._vIntercept.x += this.isFacingRight ? MAP_TILE_SIZE : 0;
    this._vIntercept.y = playerPosition.y + (this._vIntercept.x - playerPosition.x) * this._tanAngle;

    this._vIntercept.xStep = MAP_TILE_SIZE;
    this._vIntercept.xStep *= this.isFacingLeft ? -1 : 1;
    this._vIntercept.yStep = Ray.alignSign(MAP_TILE_SIZE * this._tanAngle, this.isFacingUp);

    return this.getCollisionIntercept(this._vIntercept, { x: this.isFacingLeft ? -1 : 0, y: 0 });
  }

  /**
   * Steps an intercept along its grid axis until it hits a wall or leaves the map.
   * @param intercept - The starting intercept point with pre-computed step deltas
   * @param lookupOffset - Optional offset applied only to the tile lookup coordinates.
   *   Used to peek into the adjacent tile when the intercept lands exactly on a
   *   grid line.
   * @returns The collision point if a wall is found, or the out-of-bounds point if the ray exits the map
   */
  private getCollisionIntercept(intercept: Intercept, lookupOffset: Vector = { x: 0, y: 0 }): Vector {
    const map = GameManager.instance.map;

    while (map.isWithinBounds(intercept)) {
      const peekPosition = { x: intercept.x + lookupOffset.x, y: intercept.y + lookupOffset.y };
      if (map.hasAttributeAt(peekPosition, TileAttribute.Wall)) {
        return intercept;
      }

      intercept.y += intercept.yStep;
      intercept.x += intercept.xStep;
    }

    return intercept;
  }
}
