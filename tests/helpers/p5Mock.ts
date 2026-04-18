import { vi } from 'vitest';
import type p5 from 'p5';

/** Fixed delta time (1/60 s) for deterministic per-frame tests. */
export const mockDeltaTime = 1 / 60;

export function makeP5Mock(image: p5.Image | null = {} as p5.Image): p5 {
  return {
    stroke: () => {},
    noStroke: () => {},
    fill: () => {},
    rect: () => {},
    circle: () => {},
    line: () => {},
    image: () => {},
    loadImage: vi.fn((_path: string, onSuccess?: () => void, onError?: (err: Event) => void) => {
      if (image && onSuccess) onSuccess();
      if (!image && onError) onError(new Event('error'));
      return image;
    }),
  } as unknown as p5;
}
