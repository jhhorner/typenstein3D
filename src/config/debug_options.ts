/**
 * Runtime debug flags that control what is rendered each frame.
 * Exposed on `window.debugOptions` for live toggling in the browser console.
 */
export type DebugOptions = {
  render: {
    /** Render the map. */
    map: boolean;
    /** Cast and render only a single ray instead of the full FOV. */
    singleRay: boolean;
    /** Scale factor applied to the map overlay. */
    mapScale: number;
    /** Render the player's forward angle line on the minimap. */
    rotationAngle: boolean;
    /** Render the pseudo-3D wall projection. */
    wallProjection: boolean;
  };
};

/** Default debug options. Toggle properties at runtime without reloading. */
export const debugOptions: DebugOptions = {
  render: {
    map: true,
    mapScale: 0.2,
    singleRay: false,
    rotationAngle: false,
    wallProjection: true,
  },
};

declare global {
  interface Window {
    debugOptions: DebugOptions;
  }
}

if (typeof window !== 'undefined') {
  window.debugOptions = debugOptions;
}
