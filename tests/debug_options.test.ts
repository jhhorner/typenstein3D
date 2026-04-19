import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('debugOptions defaults', () => {
  it('should have expected render defaults', async () => {
    const { debugOptions } = await import('../src/config/debug_options.js');

    expect(debugOptions.render.map).toBe(true);
    expect(debugOptions.render.mapScale).toBe(0.2);
    expect(debugOptions.render.singleRay).toBe(false);
    expect(debugOptions.render.rotationAngle).toBe(false);
    expect(debugOptions.render.wallProjection).toBe(true);
  });
});

describe('window.debugOptions module-level assignment', () => {
  beforeEach(() => {
    vi.resetModules();
    (globalThis as any).window = {};
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('should assign debugOptions to window when window is defined at module load', async () => {
    const { debugOptions } = await import('../src/config/debug_options.js');

    expect((globalThis as any).window.debugOptions).toBe(debugOptions);
  });

  it('should reflect mutations via window.debugOptions in the imported debugOptions', async () => {
    const { debugOptions } = await import('../src/config/debug_options.js');
    const original = debugOptions.render.map;

    (globalThis as any).window.debugOptions.render.map = false;

    expect(debugOptions.render.map).toBe(false);
    debugOptions.render.map = original;
  });
});
