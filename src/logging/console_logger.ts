import { LogContext, Logger, LogLevel } from './logger.js';
import { Singleton } from '../core/singleton.js';

/** Singleton logger that writes formatted entries to the browser console. */
export class ConsoleLogger extends Singleton implements Logger {
  public static get instance(): Logger {
    return super.instance as Logger;
  }

  private constructor() {
    super();
  }

  private static readonly _dateFormat = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  debug(message: string, context: LogContext = LogContext.None): void {
    this._log(LogLevel.Debug, message, context);
  }

  info(message: string, context: LogContext = LogContext.None): void {
    this._log(LogLevel.Info, message, context);
  }

  warn(message: string, context: LogContext = LogContext.None): void {
    this._log(LogLevel.Warn, message, context);
  }

  error(message: string, context: LogContext = LogContext.None): void {
    this._log(LogLevel.Error, message, context);
  }

  /**
   * Writes a single log entry to the console.
   * Output format: `[MM/DD/YYYY, HH:MM AM]::LEVEL[::Context] - message`
   * Context is omitted when it equals `LogContext.None`.
   */
  private _log(level: LogLevel, message: string, context: LogContext) {
    const parts = [];

    parts.push(`[${ConsoleLogger._dateFormat.format(new Date())}]`);
    parts.push(level.toUpperCase());
    if (context !== LogContext.None) parts.push(context);

    const prefix = parts.join('::');
    console[level](`${prefix} - ${message}`);
  }
}
