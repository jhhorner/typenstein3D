import { describe, it, expect, beforeEach, vi } from 'vitest';
import type p5 from 'p5';
import { SkyRenderer } from '../src/rendering/sky_renderer.js';
import { theme } from '../src/config/theme.js';
import { makeP5Mock } from './helpers/p5Mock.js';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from '../src/core/constants.js';

let p5Mock: p5;

beforeEach(() => {
  p5Mock = makeP5Mock();
});

describe('SkyRenderer.render', () => {
  it('should not throw', () => {
    const renderer = new SkyRenderer();
    expect(() => renderer.render(p5Mock)).not.toThrow();
  });

  it('should fill with the theme sky color', () => {
    const renderer = new SkyRenderer();
    const fillSpy = vi.spyOn(p5Mock, 'fill');

    renderer.render(p5Mock);

    expect(fillSpy).toHaveBeenCalledWith(theme.sky);
    fillSpy.mockRestore();
  });

  it('should call noStroke', () => {
    const renderer = new SkyRenderer();
    const noStrokeSpy = vi.spyOn(p5Mock, 'noStroke');

    renderer.render(p5Mock);

    expect(noStrokeSpy).toHaveBeenCalledOnce();
    noStrokeSpy.mockRestore();
  });

  it('should draw a rect covering the top portion of the window', () => {
    const renderer = new SkyRenderer();
    const rectSpy = vi.spyOn(p5Mock, 'rect');

    renderer.render(p5Mock);

    expect(rectSpy).toHaveBeenCalledWith(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT / 1.5);
    rectSpy.mockRestore();
  });

  it('should reflect theme.sky changes at render time', () => {
    const original = theme.sky;
    theme.sky = '#abcdef';

    const renderer = new SkyRenderer();
    const fillSpy = vi.spyOn(p5Mock, 'fill');

    renderer.render(p5Mock);

    expect(fillSpy).toHaveBeenCalledWith('#abcdef');

    theme.sky = original;
    fillSpy.mockRestore();
  });
});
