import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

type LogLevel = 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown>;

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  stack?: string;
  url?: string;
  method?: string;
  route_id?: string;
  user_id?: string;
  error_type?: string;
  timestamp: string;
  environment: string;
}

interface ErrorLog {
  level: LogLevel;
  created_at: string;
  error_type?: string;
}

interface ServerEvent {
  url: URL;
  request: Request;
  route: { id: string | null };
  context?: LogContext;
}

class Logger {
  private static supabase: SupabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  private static retryCount = 0;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000;

  private static async retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | unknown;
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (i < this.MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * (i + 1)));
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Unknown error occurred');
  }

  private static async saveToSupabase(entry: LogEntry): Promise<void> {
    try {
      const { error } = await this.retry(async () => {
        const result = await this.supabase.from('error_logs').insert([entry]);
        return result;
      });

      if (error) {
        console.error('Failed to save log to Supabase:', error);
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  }

  private static formatError(error: Error): string {
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }

  private static enrichContext(context?: LogContext): LogContext {
    return {
      ...context,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE,
      nodeVersion: process.version,
      platform: process.platform
    };
  }

  private static async createAndSaveLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    const enrichedContext = this.enrichContext(context);
    const entry: LogEntry = {
      level,
      message,
      context: enrichedContext,
      stack: error?.stack,
      error_type: error?.constructor.name,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE
    };

    if (import.meta.env.DEV) {
      console[level](JSON.stringify(entry, null, 2));
    }

    await this.retry(() => this.saveToSupabase(entry));
  }

  static async info(message: string, context?: LogContext): Promise<void> {
    await this.createAndSaveLogEntry('info', message, context);
  }

  static async warn(message: string, context?: LogContext, error?: Error): Promise<void> {
    await this.createAndSaveLogEntry('warn', message, context, error);
  }

  static async error(message: string, context?: LogContext, error?: Error): Promise<void> {
    await this.createAndSaveLogEntry('error', message, context, error);
  }

  static async logServerError(error: Error, event: ServerEvent): Promise<void> {
    const context: LogContext = {
      url: event.url.toString(),
      method: event.request.method,
      routeId: event.route.id || 'unknown',
      headers: Object.fromEntries(event.request.headers),
      errorType: error.constructor.name,
      ...(event.context || {})
    };

    await this.error('Server-side error occurred', context, error);
  }

  static async logClientError(error: Error, location?: Location): Promise<void> {
    const context: LogContext = {
      ...(location ? {
        url: location.href,
        pathname: location.pathname,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      } : {}),
      errorType: error.constructor.name,
      timestamp: new Date().toISOString()
    };

    await this.error('Client-side error occurred', context, error);
  }

  static async getErrorStats(days: number = 7): Promise<Record<string, Record<LogLevel, number>> | null> {
    try {
      const result = await this.retry(async () => {
        const response = await this.supabase
          .from('error_logs')
          .select('level, created_at')
          .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
        return response;
      });

      if (result.error || !result.data) {
        console.error('Error fetching error stats:', result.error);
        return null;
      }

      return result.data.reduce((acc: Record<string, Record<LogLevel, number>>, log: ErrorLog) => {
        const date = new Date(log.created_at).toLocaleDateString();
        acc[date] = acc[date] || { info: 0, warn: 0, error: 0 };
        acc[date][log.level]++;
        return acc;
      }, {});
    } catch (error) {
      console.error('Failed to fetch error stats:', error);
      return null;
    }
  }

  static async getErrorTrends(days: number = 7): Promise<Record<string, { count: number; levels: Record<LogLevel, number> }> | null> {
    try {
      const result = await this.retry(async () => {
        const response = await this.supabase
          .from('error_logs')
          .select('error_type, level, created_at')
          .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
        return response;
      });

      if (result.error || !result.data) {
        console.error('Error fetching error trends:', result.error);
        return null;
      }

      return result.data.reduce((acc: Record<string, { count: number; levels: Record<LogLevel, number> }>, log: ErrorLog) => {
        const errorType = log.error_type || 'unknown';
        acc[errorType] = acc[errorType] || { count: 0, levels: { info: 0, warn: 0, error: 0 } };
        acc[errorType].count++;
        acc[errorType].levels[log.level]++;
        return acc;
      }, {});
    } catch (error) {
      console.error('Failed to fetch error trends:', error);
      return null;
    }
  }
}

export default Logger;