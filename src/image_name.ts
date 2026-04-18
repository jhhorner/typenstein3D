/**
 * Enum values double as file names and encode the asset sub-directory via a
 * `<directory>_<file>` naming convention (e.g. `wall_brick.png` lives under
 * `src/assets/images/wall/`). Names without an underscore are placed directly
 * under `src/assets/images/`.
 */
export enum ImageName {
  Fail = 'goofed.png',
  WallBrick = 'wall_brick.png',
  SlateStone = 'wall_slate.png',
  SlateStone2 = 'wall_slate2.png',
  SlateStone3 = 'wall_slate3.png',
  SlateStoneSign = 'wall_slatesign.png',
  BlueStone = 'wall_bluestone.png',
  Purple = 'wall_purple.png',
}
