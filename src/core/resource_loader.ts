import type p5 from 'p5';

/**
 * Generic contract for loading and caching p5 resources by name.
 * `T` is the resource type (e.g. `p5.Image`).
 * `N` is the name/key type (e.g. `ImageName`), defaults to `string`.
 */
export interface ResourceLoader<T, N = string> {
  /** Called during the p5 `preload` phase to queue assets before `setup` runs. */
  preload(p: p5): void;
  /** Returns the cached resource, loading upon first access. */
  load(p: p5, name: N): T;
  /** Marks a cached entry as stale so the next `load` fetches it again. */
  unload(name: N): void;
  /** Returns the cached resource or null if it doesn't exist. */
  get(name: N): T | undefined;
  /** Drops the entire cache. */
  clear(): void;
}
