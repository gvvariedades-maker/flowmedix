/**
 * Sistema de Logging Estruturado para Produção
 * Integração consciente com Sentry e console estruturado.
 * Funciona no servidor, cliente e edge.
 */

import { sanitizeObject } from './monitoring/sentrySanitizer';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  skipSentry?: boolean;
  sentryTags?: Record<string, string>;
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const safeContext = context ? sanitizeObject(context) : undefined;
    const contextStr = safeContext ? ` ${JSON.stringify(safeContext)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    };

    console.error(this.formatMessage('error', message, errorContext));

    if (!context?.skipSentry) {
      this.dispatchToSentry(message, error, context);
    }
  }

  /**
   * Encaminha o erro para o Sentry com controle de deduplicação e contexto higienizado.
   */
  private dispatchToSentry(
    message: string,
    error?: Error | unknown,
    context?: LogContext,
  ): void {
    try {
      // Import dinâmico seguro para evitar problemas em ambientes onde o Sentry não está carregado
      const Sentry = require('@sentry/nextjs');
      if (!Sentry || typeof Sentry.captureException !== 'function') return;

      const safeContext = context ? sanitizeObject(context) : {};
      const customTags = safeContext.sentryTags || (safeContext.tags && typeof safeContext.tags === 'object' && !Array.isArray(safeContext.tags) ? safeContext.tags : {});
      const tags = {
        origin: 'logger',
        ...customTags,
      };
      const customFingerprint = Array.isArray(safeContext.fingerprint) ? safeContext.fingerprint : undefined;
      delete safeContext.sentryTags;
      delete safeContext.skipSentry;
      delete safeContext.tags;
      delete safeContext.fingerprint;

      if (error instanceof Error) {
        // Previne captura duplicada do mesmo objeto de erro
        if ((error as any).__avant_sentry_reported__) {
          return;
        }
        try {
          Object.defineProperty(error, '__avant_sentry_reported__', {
            value: true,
            writable: true,
            enumerable: false,
            configurable: true,
          });
        } catch {
          (error as any).__avant_sentry_reported__ = true;
        }

        Sentry.captureException(error, {
          tags,
          fingerprint: customFingerprint,
          extra: {
            logMessage: message,
            ...safeContext,
          },
        });
      } else if (error) {
        Sentry.captureMessage(`${message}: ${typeof error === 'object' ? JSON.stringify(sanitizeObject(error)) : String(error)}`, {
          level: 'error',
          tags,
          fingerprint: customFingerprint,
          extra: safeContext,
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          tags,
          fingerprint: customFingerprint,
          extra: safeContext,
        });
      }
    } catch {
      // Falhas no transporte de logging para Sentry são ignoradas silenciosamente
      // para nunca quebrar o fluxo principal da aplicação.
    }
  }
}

export const logger = new Logger();
