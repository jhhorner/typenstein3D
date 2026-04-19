import { describe, it, expect, vi, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import { theme } from '../src/config/theme.js';

describe('theme defaults', () => {
  it('should have expected tileBorder color', () => {
    expect(theme.map.tileBorder).toBe('#000');
  });

  it('should have expected floor color', () => {
    expect(theme.map.floor).toBe('#fff');
  });

  it('should have expected wall color', () => {
    expect(theme.map.wall).toBe('#000');
  });

  it('should have expected player color', () => {
    expect(theme.map.player).toBe('#ff0000');
  });

  it('should have expected rays color', () => {
    expect(theme.map.rays).toBe('#ff0000');
  });

  it('should have expected rotationAngle color', () => {
    expect(theme.map.rotationAngle).toBe('#0000ff');
  });
});

describe('window.theme', () => {
  beforeAll(() => {
    (globalThis as any).window = {};
  });

  afterAll(() => {
    delete (globalThis as any).window;
  });

  it('should be assigned to window when window is defined', () => {
    (globalThis as any).window.theme = theme;
    expect((globalThis as any).window.theme).toBe(theme);
  });

  it('should reflect mutations via window.theme in the imported theme', () => {
    (globalThis as any).window = { theme };
    const original = theme.map.player;
    (globalThis as any).window.theme.map.player = '#00ff00';
    expect(theme.map.player).toBe('#00ff00');
    theme.map.player = original;
  });
});

describe('window.theme module-level assignment', () => {
  beforeEach(() => {
    vi.resetModules();
    (globalThis as any).window = {};
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('should assign theme to window when window is defined at module load', async () => {
    const { theme: freshTheme } = await import('../src/config/theme.js');

    expect((globalThis as any).window.theme).toBe(freshTheme);
  });
});
