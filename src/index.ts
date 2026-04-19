import type p5 from 'p5';
import { GameManager } from './game_manager.js';
import { debugOptions } from './config/debug_options.js';
import { MAP_SCALE, WINDOW_WIDTH, WINDOW_HEIGHT, SECOND_IN_MILLISECONDS } from './core/constants.js';
import { DefaultImageLoader } from './resources/image_loader.js';

/**
 * Entry point. Uses p5 in "instance mode" and wires it to the game loop:
 */
// @ts-expect-error — p5 instance-mode constructor is not typed in @types/p5
new p5((p: p5) => {
  const manager = GameManager.instance;

  function update(deltaTime: number) {
    manager.mapObjects.forEach((o) => o.update(deltaTime));
    manager.sceneObjects.forEach((o) => o.update(deltaTime));
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
    p.frameRate(60);
  };

  p.draw = () => {
    update(p.deltaTime / SECOND_IN_MILLISECONDS);

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
