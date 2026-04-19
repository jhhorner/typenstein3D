import p5 from 'p5';
import { theme } from '../config/theme.js';
import { DefaultGameObject } from '../core/game_object.js';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from '../core/constants.js';

/**
 * Renders the sky background rectangle in the 3D scene.
 */
export class SkyRenderer extends DefaultGameObject {
  /**
   * Draws the sky rectangle.
   * @param p - p5 instance.
   */
  render(p: p5): void {
    p.fill(theme.sky);
    p.noStroke();
    p.rect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT / 1.5);
  }
}
