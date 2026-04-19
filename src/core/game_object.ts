import type p5 from 'p5';

/**
 * Contract for every object that participates in the game loop.
 */
export interface GameObject {
  /** Advances the object's state to be rendered in the next frame. */
  update(deltaTime: number): void;

  /**
   * Renders the object on the canvas.
   * @param p - p5 instance.
   */
  render(p: p5): void;
}

/**
 * Base class for game objects that participate in update/render loop.
 */
export abstract class DefaultGameObject implements GameObject {
  abstract render(p: p5): void;
  update(_deltaTime: number) {}
}
