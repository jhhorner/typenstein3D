import type p5 from 'p5';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameManager } from '../src/game_manager.js';
import { Player } from '../src/player/player.js';
import { debugOptions } from '../src/config/debug_options.js';
import { theme } from '../src/config/theme.js';
import { makeP5Mock, mockDeltaTime } from './helpers/p5Mock.js';
import { WINDOW_HEIGHT, HALF_WINDOW_WIDTH, HALF_WINDOW_HEIGHT } from '../src/core/constants.js';

let p5Mock: p5;
let player: Player;

// Minimal p5 keyCode stub used for key event tests
function keyStub(keyCode: number) {
  return {
    keyCode,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    keyIsDown: () => false,
  } as any;
}

beforeEach(() => {
  p5Mock = makeP5Mock();
  GameManager._resetInstance();
  player = GameManager.instance.player;
});

describe('Player initial state', () => {
  it('should start at the center of the map', () => {
    expect(player.position.x).toBeCloseTo(HALF_WINDOW_WIDTH);
    expect(player.position.y).toBeCloseTo(HALF_WINDOW_HEIGHT);
  });

  it('should start with zero walk and turn direction', () => {
    expect(player.walkDirection).toBe(0);
    expect(player.turnDirection).toBe(0);
  });
});

describe('Player.handleKeyPressed', () => {
  it('should set walkDirection to 1 on up arrow press', () => {
    player.handleKeyPressed(keyStub(38));

    expect(player.walkDirection).toBe(1);
  });

  it('should set walkDirection to -1 on down arrow press', () => {
    player.handleKeyPressed(keyStub(40));

    expect(player.walkDirection).toBe(-1);
  });

  it('should set turnDirection to -1 on left arrow press', () => {
    player.handleKeyPressed(keyStub(37));

    expect(player.turnDirection).toBe(-1);
  });

  it('should set turnDirection to 1 on right arrow press', () => {
    player.handleKeyPressed(keyStub(39));

    expect(player.turnDirection).toBe(1);
  });

  it('should ignore unknown keys', () => {
    player.handleKeyPressed(keyStub(65));

    expect(player.walkDirection + player.turnDirection).toBe(0);
  });
});

describe('Player.handleKeyReleased', () => {
  it('should reset walkDirection on up arrow release', () => {
    player.handleKeyPressed(keyStub(38));
    player.handleKeyReleased(keyStub(38));

    expect(player.walkDirection).toBe(0);
  });

  it('should reset walkDirection on down arrow release', () => {
    player.handleKeyPressed(keyStub(40));
    player.handleKeyReleased(keyStub(40));

    expect(player.walkDirection).toBe(0);
  });

  it('should reset turnDirection on left arrow release', () => {
    player.handleKeyPressed(keyStub(37));
    player.handleKeyReleased(keyStub(37));

    expect(player.turnDirection).toBe(0);
  });

  it('should reset turnDirection on right arrow release', () => {
    player.handleKeyPressed(keyStub(39));
    player.handleKeyReleased(keyStub(39));

    expect(player.turnDirection).toBe(0);
  });

  it('should keep walkDirection 1 when UP_ARROW is still held after DOWN_ARROW release', () => {
    const p = {
      UP_ARROW: 38,
      DOWN_ARROW: 40,
      LEFT_ARROW: 37,
      RIGHT_ARROW: 39,
      keyCode: 40,
      keyIsDown: (code: number) => code === 38,
    } as any;

    player.handleKeyReleased(p);

    expect(player.walkDirection).toBe(1);
  });

  it('should keep walkDirection -1 when DOWN_ARROW is still held after UP_ARROW release', () => {
    const p = {
      UP_ARROW: 38,
      DOWN_ARROW: 40,
      LEFT_ARROW: 37,
      RIGHT_ARROW: 39,
      keyCode: 38,
      keyIsDown: (code: number) => code === 40,
    } as any;

    player.handleKeyReleased(p);

    expect(player.walkDirection).toBe(-1);
  });

  it('should keep turnDirection -1 when LEFT_ARROW is still held after RIGHT_ARROW release', () => {
    const p = {
      UP_ARROW: 38,
      DOWN_ARROW: 40,
      LEFT_ARROW: 37,
      RIGHT_ARROW: 39,
      keyCode: 39,
      keyIsDown: (code: number) => code === 37,
    } as any;

    player.handleKeyReleased(p);

    expect(player.turnDirection).toBe(-1);
  });

  it('should keep turnDirection 1 when RIGHT_ARROW is still held after LEFT_ARROW release', () => {
    const p = {
      UP_ARROW: 38,
      DOWN_ARROW: 40,
      LEFT_ARROW: 37,
      RIGHT_ARROW: 39,
      keyCode: 37,
      keyIsDown: (code: number) => code === 39,
    } as any;

    player.handleKeyReleased(p);

    expect(player.turnDirection).toBe(1);
  });
});

describe('Player.update', () => {
  it('should not move when walkDirection is 0', () => {
    const startX = player.position.x;
    const startY = player.position.y;

    player.update(mockDeltaTime);

    expect(player.position.x).toBeCloseTo(startX);
    expect(player.position.y).toBeCloseTo(startY);
  });

  it('should advance position when walk direction is 1', () => {
    player.rotationAngle = 0;
    player.walkDirection = 1;
    const startX = player.position.x;

    player.update(mockDeltaTime);

    expect(player.position.x).toBeGreaterThan(startX);
  });

  it('should not move into a wall', () => {
    // Place the player just inside the left wall and face left into it
    player.position.x = 4;
    player.position.y = WINDOW_HEIGHT / 2;
    player.rotationAngle = Math.PI;
    player.walkDirection = 1;
    const startX = player.position.x;

    player.update(mockDeltaTime);

    expect(player.position.x).toBeCloseTo(startX);
  });

  it('should advance rotationAngle when turning', () => {
    const startAngle = player.rotationAngle;
    player.turnDirection = 1;

    player.update(mockDeltaTime);

    expect(player.rotationAngle).toBeGreaterThan(startAngle);
  });
});

describe('Player.render', () => {
  afterEach(() => {
    debugOptions.render.rotationAngle = false;
  });

  it('should render without throwing', () => {
    expect(() => player.render(p5Mock)).not.toThrow();
  });

  it('should not draw rotation line when rotationAngle is false', () => {
    const lineSpy = vi.spyOn(p5Mock, 'line');

    debugOptions.render.rotationAngle = false;
    player.render(p5Mock);

    expect(lineSpy).not.toHaveBeenCalled();
    lineSpy.mockRestore();
  });

  it('should draw rotation line when rotationAngle is true', () => {
    const lineSpy = vi.spyOn(p5Mock, 'line');

    debugOptions.render.rotationAngle = true;
    player.render(p5Mock);

    expect(lineSpy).toHaveBeenCalledOnce();
    lineSpy.mockRestore();
  });

  it('should use theme.map.player color for fill', () => {
    const fillSpy = vi.spyOn(p5Mock, 'fill');

    player.render(p5Mock);

    expect(fillSpy).toHaveBeenCalledWith(theme.map.player);
    fillSpy.mockRestore();
  });

  it('should use theme.map.rotationAngle color for stroke when rotationAngle debug is enabled', () => {
    const strokeSpy = vi.spyOn(p5Mock, 'stroke');

    debugOptions.render.rotationAngle = true;
    player.render(p5Mock);

    expect(strokeSpy).toHaveBeenCalledWith(theme.map.rotationAngle);
    strokeSpy.mockRestore();
  });
});
