import { degreesToRadians } from './math.js';

/** Pixel size of each map tile. */
export const MAP_TILE_SIZE = 64;

/** Number of tile rows in the map grid. */
export const MAP_ROW_COUNT = 11;

/** Number of tile columns in the map grid. */
export const MAP_COLUMN_COUNT = 15;

/** Default scale factor applied to the minimap overlay. */
export const MAP_SCALE = 0.2;

/** Player's horizontal field of view in radians. */
export const FOV_ANGLE = degreesToRadians(60);

export const HALF_FOV_TANGENT = Math.tan(FOV_ANGLE / 2);

/** Canvas width in pixels. */
export const WINDOW_WIDTH = MAP_COLUMN_COUNT * MAP_TILE_SIZE;

export const HALF_WINDOW_WIDTH = WINDOW_WIDTH / 2;

/** Canvas height in pixels. */
export const WINDOW_HEIGHT = MAP_ROW_COUNT * MAP_TILE_SIZE;

export const HALF_WINDOW_HEIGHT = WINDOW_HEIGHT / 2;

/** Number of milliseconds in a minute */
export const SECOND_IN_MILLISECONDS = 1000;
