/** A point or direction in 2D space. */
export interface Vector {
  x: number;
  y: number;
}

/**
 * Converts an angle from degrees to radians.
 * @param degrees - Angle in degrees.
 * @returns Equivalent angle in radians.
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts an angle from radians to degrees.
 * @param radians - Angle in radians.
 * @returns Equivalent angle in degrees.
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Computes the Euclidean distance between two points.
 * @param vectorA - Starting point.
 * @param vectorB - Ending point.
 * @returns Straight-line distance between `vectorA` and `vectorB`.
 */
export function distance(vectorA: Vector, vectorB: Vector): number {
  return Math.sqrt((vectorB.x - vectorA.x) ** 2 + (vectorB.y - vectorA.y) ** 2);
}
