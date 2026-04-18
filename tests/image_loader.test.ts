import type p5 from 'p5';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeP5Mock } from './helpers/p5Mock.js';
import { DefaultImageLoader, ImageName } from '../src/image_loader.js';

function assetPath(name: ImageName): string {
  const parts = name.split('_');
  const directory = parts.length > 1 ? `/${parts[0]}` : '';
  const fileName = directory ? parts[1] : parts[0];
  return `src/assets/images${directory}/${fileName}`;
}

beforeEach(() => {
  (DefaultImageLoader as any)._instance = undefined;
});

describe('DefaultImageLoader.instance', () => {
  it('should return the same instance on repeated calls', () => {
    const a = DefaultImageLoader.instance;
    const b = DefaultImageLoader.instance;

    expect(a).toBe(b);
  });

  it('should start with an empty cache', () => {
    expect((DefaultImageLoader.instance as DefaultImageLoader).cache).toEqual({});
  });
});

describe('DefaultImageLoader.preload', () => {
  it('should preload the default images', () => {
    const p = makeP5Mock();
    const loader = DefaultImageLoader.instance;
    const loadSpy = vi.spyOn(loader, 'load');

    loader.preload(p);

    expect(loadSpy).toHaveBeenCalledWith(p, ImageName.Fail);
    expect(loadSpy).toHaveBeenCalledWith(p, ImageName.WallBrick);
  });
});

describe('DefaultImageLoader.load', () => {
  it.each([ImageName.WallBrick, ImageName.Fail])('resolves the correct asset path for %s', (name) => {
    const p = makeP5Mock();
    const loader = DefaultImageLoader.instance;

    loader.load(p, name as ImageName);

    expect(p.loadImage).toHaveBeenCalledWith(assetPath(name as ImageName), expect.any(Function), expect.any(Function));
  });

  it('should return the loaded image', () => {
    const image = { width: 64, height: 64 } as p5.Image;
    const p = makeP5Mock(image);
    const loader = DefaultImageLoader.instance;

    const result = loader.load(p, ImageName.WallBrick);

    expect(result).toBe(image);
  });

  it('should cache the image after the first load', () => {
    const p = makeP5Mock();
    const loader = DefaultImageLoader.instance;

    loader.load(p, ImageName.WallBrick);
    loader.load(p, ImageName.WallBrick);

    expect(p.loadImage).toHaveBeenCalledTimes(1);
  });

  it('should fall back to the Fail image when the requested image fails to load', () => {
    const failImage = {} as p5.Image;
    const p = makeP5Mock(null);
    const loader = DefaultImageLoader.instance as DefaultImageLoader;
    loader.cache[ImageName.Fail] = failImage;

    const result = loader.load(p, ImageName.WallBrick);

    expect(result).toBe(failImage);
  });
});

describe('DefaultImageLoader.unload', () => {
  it('should set the cache entry to undefined', () => {
    const p = makeP5Mock();
    const loader = DefaultImageLoader.instance;
    loader.load(p, ImageName.WallBrick);

    loader.unload(ImageName.WallBrick);

    expect((loader as DefaultImageLoader).cache[ImageName.WallBrick]).not.toBeDefined();
  });

  it('should trigger a fresh load after unload', () => {
    const p = makeP5Mock();
    const loader = DefaultImageLoader.instance;
    loader.load(p, ImageName.WallBrick);
    loader.unload(ImageName.WallBrick);

    loader.load(p, ImageName.WallBrick);

    expect(p.loadImage).toHaveBeenCalledTimes(2);
  });
});

describe('DefaultImageLoader.clear', () => {
  it('should remove all cached images', () => {
    const p = makeP5Mock();
    const loader = DefaultImageLoader.instance;
    loader.load(p, ImageName.WallBrick);

    loader.clear();

    expect((loader as DefaultImageLoader).cache).toEqual({});
  });

  it('should trigger a fresh load after clear', () => {
    const p = makeP5Mock();
    const loader = DefaultImageLoader.instance;
    loader.load(p, ImageName.WallBrick);
    loader.clear();

    loader.load(p, ImageName.WallBrick);

    expect(p.loadImage).toHaveBeenCalledTimes(2);
  });
});
