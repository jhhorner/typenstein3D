import p5 from 'p5';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from './constants.js';
import { DefaultGameObject } from './game_object.js';
import { theme } from './theme.js';

/**
 * Renders the floor background rectangle.
 */
export class FloorRenderer extends DefaultGameObject {
  /**
   * Draws the floor rectangle.
   * @param p - p5 instance.
   */
  render(p: p5): void {
    p.fill(theme.floor);
    p.noStroke();
    p.rect(9, WINDOW_HEIGHT / 1.5, WINDOW_WIDTH, WINDOW_HEIGHT / 1.5);
  }
}
