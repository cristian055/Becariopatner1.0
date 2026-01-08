import type { LogLevel, LogEntry } from '../types/store.types'

/**
 * Vite ImportMeta type declarations for environment variables
 * Declared here to satisfy TypeScript in environments where global types are not present
 */
declare global {
  interface ImportMetaEnv {
    readonly MODE: 'development' | 'production' | string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

/**
 * Simple logger utility for application-wide logging
 * Supports different log levels and optional context
 */

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development'
  private isProduction = import.meta.env.MODE === 'production'

  /**
   * Format log entry with timestamp and level
   */
  private formatLogEntry(
    level: LogLevel[keyof LogLevel],
    message: string,
    context?: string
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  /**
   * Output log to console in development mode
   */
  private output(log: LogEntry): void {
    if (!this.isDevelopment && log.level !== 'ERROR') return;

    const timestamp = new Date(log.timestamp).toLocaleTimeString();
    const prefix = (context: string) => `[${log.level}] [${timestamp}] ${context ? `[${context}]` : ''}`;
    const message = prefix(log.context || '');

    switch (log.level) {
      case 'DEBUG':
        console.debug(message, log.message);
        break;
      case 'INFO':
        console.info(message, log.message);
        break;
      case 'WARN':
        console.warn(message, log.message);
        break;
      case 'ERROR':
        console.error(message, log.message);
        if (log.error) {
          console.error('Error details:', log.error);
        }
        break;
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: string): void {
    const log = this.formatLogEntry('DEBUG', message, context);
    this.output(log);
  }

  /**
   * Log info message
   */
  info(message: string, context?: string): void {
    const log = this.formatLogEntry('INFO', message, context);
    this.output(log);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string, p0?: string): void {
    const log = this.formatLogEntry('WARN', message, context);
    this.output(log);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: string): void {
    const log = this.formatLogEntry('ERROR', message, context);
    log.error = error;
    this.output(log);
  }

  /**
   * Log service error with code
   */
  serviceError(code: string, message: string, error?: unknown, context?: string): void {
    const errorMessage = `[${code}] ${message}`;
    this.error(errorMessage, error as Error, context);
  }

  /**
   * Log API call
   */
  apiCall(endpoint: string, method: string, context?: string): void {
    this.debug(`${method} ${endpoint}`, context || 'API');
  }

  /**
   * Log API response
   */
  apiResponse(
    endpoint: string,
    status: number,
    duration: number,
    context?: string
  ): void {
    this.debug(`${endpoint} - ${status} (${duration}ms)`, context || 'API');
  }

  /**
   * Log API error
   */
  apiError(
    endpoint: string,
    status?: number,
    error?: unknown,
    context?: string
  ): void {
    const message = `${endpoint} - ${status || 'Network Error'}`;
    this.error(message, error as Error, context || 'API');
  }

  /**
   * Log performance metric
   */
  performance(metric: string, value: number, unit: string = 'ms', context?: string): void {
    this.debug(`${metric}: ${value}${unit}`, context || 'PERFORMANCE');
  }

  /**
   * Log action
   */
  action(action: string, details?: Record<string, unknown>, context?: string): void {
    const message = details
      ? `${action} - ${JSON.stringify(details)}`
      : action;
    this.info(message, context || 'ACTION');
  }

  /**
   * Log state change
   */
  stateChange(key: string, from: unknown, to: unknown, context?: string): void {
    const message = `${key}: ${JSON.stringify(from)} -> ${JSON.stringify(to)}`;
    this.debug(message, context || 'STATE');
  }

  /**
   * Create a child logger with specific context
   */
  child(context: string): ChildLogger {
    return new ChildLogger(this, context);
  }
}

/**
 * Child logger with pre-set context
 */
class ChildLogger {
  constructor(private parent: Logger, private context: string) {}

  debug(message: string): void {
    this.parent.debug(message, this.context);
  }

  info(message: string): void {
    this.parent.info(message, this.context);
  }

  warn(message: string): void {
    this.parent.warn(message, this.context);
  }

  error(message: string, error?: Error): void {
    this.parent.error(message, error, this.context);
  }

  serviceError(code: string, message: string, error?: unknown): void {
    this.parent.serviceError(code, message, error, this.context);
  }

  apiCall(endpoint: string, method: string): void {
    this.parent.apiCall(endpoint, method, this.context);
  }

  apiResponse(endpoint: string, status: number, duration: number): void {
    this.parent.apiResponse(endpoint, status, duration, this.context);
  }

  apiError(endpoint: string, status?: number, error?: unknown): void {
    this.parent.apiError(endpoint, status, error, this.context);
  }

  performance(metric: string, value: number, unit?: string): void {
    this.parent.performance(metric, value, unit, this.context);
  }

  action(action: string, details?: Record<string, unknown>): void {
    this.parent.action(action, details, this.context);
  }

  stateChange(key: string, from: unknown, to: unknown): void {
    this.parent.stateChange(key, from, to, this.context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types
export type { ChildLogger };
