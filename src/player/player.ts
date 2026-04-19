import type p5 from 'p5';
import { TileAttribute } from '../world/game_map.js';
import { DefaultGameObject } from '../core/game_object.js';
import { degreesToRadians, Vector } from '../core/math.js';
import { GameManager } from '../game_manager.js';
import { debugOptions } from '../config/debug_options.js';
import { theme } from '../config/theme.js';
import { HALF_WINDOW_WIDTH, HALF_WINDOW_HEIGHT } from '../core/constants.js';

/**
 * Represents a player character. Tracks position, facing angle, and movement intent.
 */
export class Player extends DefaultGameObject {
  /** Used to avoid per-frame allocations. */
  private readonly _nextPosition: Vector = { x: 0, y: 0 };

  /** Radius of the dot on the map representing the player. */
  radius: number;

  /** Current world-space position in pixels. */
  position: Vector;

  /**
   * Rotation direction set by keyboard input.
   * `-1` = turning left, `0` = not turning, `1` = turning right.
   */
  turnDirection: number;

  /**
   * Walk direction set by keyboard input.
   * `1` = moving forward, `0` = standing still, `-1` = moving backward.
   */
  walkDirection: number;

  /** Distance moved per frame along the facing direction (pixels/frame). */
  movementSpeed: number;

  /** Forward angle in radians. */
  rotationAngle: number;

  /** Radians rotated per frame. */
  rotationSpeed: number;

  constructor() {
    super();
    this.radius = 3;
    this.position = { x: HALF_WINDOW_WIDTH, y: HALF_WINDOW_HEIGHT };
    this.turnDirection = 0;
    this.walkDirection = 0;
    this.movementSpeed = 120;
    this.rotationAngle = Math.PI / 2;
    this.rotationSpeed = degreesToRadians(120);
  }

  /**
   * Updates player state per-frame.
   */
  update(deltaTime: number) {
    const directionX = Math.cos(this.rotationAngle);
    const directionY = Math.sin(this.rotationAngle);
    const moveDirection = this.walkDirection * this.movementSpeed * deltaTime;

    this.rotationAngle += this.turnDirection * this.rotationSpeed * deltaTime;
    this._nextPosition.x = this.position.x + moveDirection * directionX;
    this._nextPosition.y = this.position.y + moveDirection * directionY;

    if (!GameManager.instance.map.hasAttributeAt(this._nextPosition, TileAttribute.Wall)) {
      this.position.x += moveDirection * directionX;
      this.position.y += moveDirection * directionY;
    }
  }

  /**
   * Draws the player as a red dot on the map.
   * @param p - p5 instance.
   */
  render(p: p5): void {
    p.noStroke();
    p.fill(theme.map.player);
    p.circle(this.position.x, this.position.y, this.radius);

    if (debugOptions.render.rotationAngle) {
      p.stroke(theme.map.rotationAngle);
      p.line(
        this.position.x,
        this.position.y,
        this.position.x + Math.cos(this.rotationAngle) * 20,
        this.position.y + Math.sin(this.rotationAngle) * 20,
      );
    }
  }

  /**
   * Sets movement/rotation intent when a key is pressed.
   * Arrow keys control walking (up/down) and turning (left/right).
   * @param p - p5 instance.
   */
  handleKeyPressed(p: p5) {
    switch (p.keyCode) {
      case p.UP_ARROW:
        this.walkDirection = 1;
        break;
      case p.DOWN_ARROW:
        this.walkDirection = -1;
        break;
      case p.LEFT_ARROW:
        this.turnDirection = -1;
        break;
      case p.RIGHT_ARROW:
        this.turnDirection = 1;
        break;
    }
  }

  /**
   * Clears movement/rotation direction when a key is released.
   * @param p - p5 instance
   */
  handleKeyReleased(p: p5): void {
    this.walkDirection = p.keyIsDown(p.UP_ARROW) ? 1 : p.keyIsDown(p.DOWN_ARROW) ? -1 : 0;
    this.turnDirection = p.keyIsDown(p.LEFT_ARROW) ? -1 : p.keyIsDown(p.RIGHT_ARROW) ? 1 : 0;
  }
}
