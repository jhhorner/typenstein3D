/**
 * Defines the color scheme for the game's map overlay and 3D scene.
 * Exposed on `window.theme` at runtime for live editing in the browser console.
 */
export type Theme = {
  /** Colors used when rendering the top-down 2D map overlay. */
  map: {
    /** Color of the grid lines drawn between tiles. */
    tileBorder: string;
    /** Fill color for open floor tiles. */
    floor: string;
    /** Fill color for wall tiles. */
    wall: string;
    /** Color of the player dot. */
    player: string;
    /** Color of the cast rays drawn on the map. */
    rays: string;
    /** Color of the player's forward angle line (visible when `debugOptions.render.rotationAngle` is `true`). */
    rotationAngle: string;
  };
  /** When `true`, wall brightness decreases with distance. */
  gradientShading: boolean;
  /** Controls how quickly brightness falls off with distance when `gradientShading` is `true`. */
  gradientScale: number;
  /** Fill color of the sky rectangle rendered above the horizon. */
  sky: string;
  /** Fill color of the floor rectangle rendered below the horizon. */
  floor: string;
};

/** Active theme instance. Mutate properties at runtime to change colors immediately. */
export const theme: Theme = {
  map: {
    tileBorder: '#000',
    floor: '#fff',
    wall: '#000',
    player: '#ff0000',
    rays: '#ff0000',
    rotationAngle: '#0000ff',
  },
  gradientShading: false,
  gradientScale: 0.001,
  sky: '#333333',
  floor: '#2b2b2b',
};

declare global {
  interface Window {
    theme: Theme;
  }
}

if (typeof window !== 'undefined') {
  window.theme = theme;
}
