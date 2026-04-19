import { describe, it, expect } from 'vitest';
import { degreesToRadians, radiansToDegrees, distance } from '../src/core/math.js';

describe('degreesToRadians', () => {
  it('should convert 0° to 0', () => {
    expect(degreesToRadians(0)).toBe(0);
  });

  it('should convert 90° to π/2', () => {
    expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
  });

  it('should convert 180° to π', () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
  });

  it('should convert 360° to 2π', () => {
    expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
  });

  it('should convert negative angles', () => {
    expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2);
  });
});

describe('radiansToDegrees', () => {
  it('should convert 0 to 0°', () => {
    expect(radiansToDegrees(0)).toBe(0);
  });

  it('should convert π/2 to 90°', () => {
    expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
  });

  it('should convert π to 180°', () => {
    expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
  });

  it('should convert 2π to 360°', () => {
    expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360);
  });

  it('should round-trip with degreesToRadians', () => {
    expect(radiansToDegrees(degreesToRadians(45))).toBeCloseTo(45);
  });
});

describe('distance', () => {
  it('should return 0 for the same point', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('should compute a 3-4-5 right triangle', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5);
  });

  it('should be symmetric', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 4, y: 6 };

    expect(distance(a, b)).toBeCloseTo(distance(b, a));
  });

  it('should work along a single axis', () => {
    expect(distance({ x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(10);
    expect(distance({ x: 0, y: 0 }, { x: 0, y: 7 })).toBeCloseTo(7);
  });
});
