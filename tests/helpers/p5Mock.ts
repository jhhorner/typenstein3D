import { vi } from 'vitest';
import type p5 from 'p5';

export const p5Mock = {
  stroke: () => {},
  noStroke: () => {},
  fill: () => {},
  rect: () => {},
  circle: () => {},
  line: () => {},
  image: () => {},
} as unknown as p5;

export function makeP5Mock(image: p5.Image | null = {} as p5.Image): p5 {
  return {
    ...p5Mock,
    loadImage: vi.fn((_path: string, onSuccess?: () => void) => {
      if (image && onSuccess) onSuccess();
      return image;
    }),
  } as unknown as p5;
}
