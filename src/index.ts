import type p5 from 'p5';
import { GameManager } from './game_manager.js';
import { debugOptions } from './debug_options.js';
import { MAP_SCALE, WINDOW_WIDTH, WINDOW_HEIGHT } from './constants.js';
import { DefaultImageLoader } from './image_loader.js';

/**
 * Entry point. Uses p5 in "instance mode" and wires it to the game loop:
 */
// @ts-expect-error — p5 instance-mode constructor is not typed in @types/p5
new p5((p: p5) => {
  const manager = GameManager.instance;

  function update() {
    manager.mapObjects.forEach((o) => o.update());
    manager.sceneObjects.forEach((o) => o.update());
  }

  function drawMap(): void {
    if (debugOptions.render.map) {
      p.push();
      p.scale(debugOptions.render.mapScale ?? MAP_SCALE);
      manager.mapObjects.forEach((o) => o.render(p));
      p.pop();
    }
  }

  function drawScene(): void {
    manager.sceneObjects.forEach((o) => o.render(p));
  }

  p.preload = () => {
    DefaultImageLoader.instance.preload(p);
  };

  p.setup = () => {
    p.createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  };

  p.draw = () => {
    update();

    p.clear();
    drawScene();
    drawMap();
  };

  p.keyPressed = () => {
    manager.player.handleKeyPressed(p);
  };

  p.keyReleased = () => {
    manager.player.handleKeyReleased(p);
  };
});
