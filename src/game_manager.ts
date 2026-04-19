import { GameMap } from './world/game_map.js';
import { GameObject } from './core/game_object.js';
import { Player } from './player/player.js';
import { RayCaster } from './rendering/ray_caster.js';
import { RayProjector } from './rendering/ray_projector.js';
import { SkyRenderer } from './rendering/sky_renderer.js';
import { FloorRenderer } from './rendering/floor_renderer.js';
import { ConsoleLogger } from './logging/console_logger.js';
import { Logger } from './logging/logger.js';
import { Singleton } from './core/singleton.js';

/**
 * Singleton coordinator for all game objects.
 *
 * Owns the authoritative list of {@link GameObject}s that the main loop iterates
 * each frame to update and render.
 */
export class GameManager extends Singleton {
  public static get instance(): GameManager {
    return super.instance as GameManager;
  }

  /** Tile-based map defining walls, floors, and other objects. */
  map: GameMap;

  /** The player character reference containing position, rotation, and movement state. */
  player: Player;

  /** Responsible for creating and casts rays from the player's FOV each frame. */
  rayCaster: RayCaster;

  /** Responsible for projecting casted rays in pseudo 3D space. */
  rayProjector: RayProjector;

  /** Responsible for rendering the sky background rectangle above the horizon. */
  skyRenderer: SkyRenderer;

  /** Responsible for rendering the floor background rectangle below the horizon. */
  floorRenderer: FloorRenderer;

  /** Responsible for logging messages throughout the game */
  logger: Logger;

  readonly mapObjects: GameObject[];
  readonly sceneObjects: GameObject[];

  constructor() {
    super();
    this.map = new GameMap();
    this.player = new Player();
    this.rayCaster = new RayCaster();
    this.rayProjector = new RayProjector();
    this.skyRenderer = new SkyRenderer();
    this.floorRenderer = new FloorRenderer();
    this.logger = ConsoleLogger.instance;

    this.mapObjects = [this.map, this.rayCaster, this.player];
    this.sceneObjects = [this.skyRenderer, this.floorRenderer, this.rayProjector];
  }
}
