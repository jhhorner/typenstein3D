import type p5 from 'p5';
import { ResourceLoader } from '../core/resource_loader.js';
import { GameManager } from '../game_manager.js';
import { LogContext } from '../logging/logger.js';
import { Singleton } from '../core/singleton.js';
import { ImageName } from './image_name.js';

/**
 * Singleton `ResourceLoader` for p5 images.
 * Images are cached on first load; failed loads fall back to `ImageName.Fail`.
 */
export class DefaultImageLoader extends Singleton implements ResourceLoader<p5.Image, ImageName> {
  public static get instance(): ResourceLoader<p5.Image, ImageName> {
    return super.instance as ResourceLoader<p5.Image, ImageName>;
  }

  cache: Partial<Record<ImageName, p5.Image | undefined>> = {};

  preload(p: p5): void {
    /** Preload all images for now. Later will need to be dynamic based on loaded map */
    Object.values(ImageName).forEach((n) => this.load(p, n));
  }

  load(p: p5, name: ImageName): p5.Image {
    if (!this.cache[name]) {
      const nameParts = name.split('_');
      const directory = nameParts.length > 1 ? `/${nameParts[0]}` : '';
      const fileName = directory ? `${nameParts[1]}` : nameParts[0];
      const imagePath = `src/assets/images${directory}/${fileName}`;

      const image = p.loadImage(
        imagePath,
        () => {
          GameManager.instance.logger.info(`Loaded image: ${imagePath}`, LogContext.Resource);
        },
        (error) => {
          GameManager.instance.logger.error(`Failed to load: ${imagePath} - ${error}`, LogContext.Resource);
        },
      );

      if (image) {
        this.cache[name] = image;
      }
    }

    // Fall back to the Fail image if the requested image couldn't be loaded.
    return this.cache[name] || this.cache[ImageName.Fail]!;
  }

  get(name: ImageName): p5.Image {
    return this.cache[name] || this.cache[ImageName.Fail]!;
  }

  unload(name: ImageName): void {
    const resource = this.cache[name];
    if (resource) {
      this.cache[name] = undefined;
    }
  }

  clear(): void {
    this.cache = {};
  }
}
