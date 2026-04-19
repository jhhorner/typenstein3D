import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ConsoleLogger } from '../src/logging/console_logger.js';
import { LogContext, Logger } from '../src/logging/logger.js';

beforeEach(() => {
  ConsoleLogger._resetInstance();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ConsoleLogger.instance', () => {
  it('should return a Logger singleton', () => {
    const a = ConsoleLogger.instance;
    const b = ConsoleLogger.instance;
    expect(a).toBe(b);
  });
});

describe('ConsoleLogger log methods', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = ConsoleLogger.instance;
  });

  it('should call console.debug with level and message', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('test debug');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toMatch(/DEBUG.*test debug/);
  });

  it('should call console.info with level and message', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test info');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toMatch(/INFO.*test info/);
  });

  it('should call console.warn with level and message', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('test warn');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toMatch(/WARN.*test warn/);
  });

  it('should call console.error with level and message', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('test error');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toMatch(/ERROR.*test error/);
  });

  it('should include context in output when context is not None', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('loading', LogContext.Resource);
    expect(spy.mock.calls[0][0]).toContain('Resource');
  });

  it('should omit context from output when context is None (default)', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('no context');
    expect(spy.mock.calls[0][0]).not.toContain('None');
  });

  it('should include a formatted date in output', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('dated');
    expect(spy.mock.calls[0][0]).toMatch(/^\[.+\]/);
  });
});
