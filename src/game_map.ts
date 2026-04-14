import type p5 from 'p5';
import { DefaultGameObject } from './game_object.js';
import { Vector } from './math.js';
import { theme } from './theme.js';
import { MAP_TILE_SIZE, MAP_ROW_COUNT, MAP_COLUMN_COUNT, WINDOW_WIDTH, WINDOW_HEIGHT } from './constants.js';
import { furnishedMaps, MapName } from './maps.js';

/**
 * Attributes that a map tile can have. Values correspond to the integer stored in the grid array.
 */
export const enum TileAttribute {
  Floor,
  Wall,
}

/**
 * Represents the tile-based game map. Stores the grid layout and exposes spatial queries.
 */
export class GameMap extends DefaultGameObject {
  private grid: number[][];

  constructor() {
    super();
    this.grid = furnishedMaps[MapName.Pillars];
  }

  /**
   * Renders the map grid.
   * @param p - p5 instance.
   */
  render(p: p5): void {
    for (let i = 0; i < MAP_ROW_COUNT; i++) {
      for (let j = 0; j < MAP_COLUMN_COUNT; j++) {
        const tileValue = this.grid[i][j];
        const tileXPos: number = j * MAP_TILE_SIZE;
        const tileYPos: number = i * MAP_TILE_SIZE;
        const tileColor: string = tileValue === 1 ? theme.map.wall : theme.map.floor;

        p.stroke(theme.map.tileBorder);
        p.fill(tileColor);
        p.rect(tileXPos, tileYPos, MAP_TILE_SIZE, MAP_TILE_SIZE);
      }
    }
  }

  /**
   * Returns whether the tile at the given position has the specified attribute.
   * @param position - World-space point in pixels.
   * @param attribute - The {@link TileAttribute} to test for.
   * @returns `true` if the tile at `position` matches `attribute`, `false` otherwise.
   */
  hasAttributeAt(position: Vector, attribute: TileAttribute): boolean {
    const xTilePosition = Math.floor(position.x / MAP_TILE_SIZE);
    const yTilePosition = Math.floor(position.y / MAP_TILE_SIZE);

    return this.grid[yTilePosition][xTilePosition] === attribute;
  }

  /**
   * Returns whether the given position lies within the map boundary.
   * @param position - World-space position.
   * @returns `true` if `position` is inside the map bounds, `false` otherwise.
   */
  isWithinBounds(position: Vector): boolean {
    return position.x >= 0 && position.x <= WINDOW_WIDTH && position.y >= 0 && position.y <= WINDOW_HEIGHT;
  }
}
