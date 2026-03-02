/**
 * Sistema de Logging Estruturado para Produção
 * Remove console.log e implementa logging profissional
 * Funciona tanto no servidor quanto no cliente
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    // Verifica se está no cliente ou servidor
    if (typeof window !== 'undefined') {
      this.isDevelopment = process.env.NODE_ENV === 'development';
    } else {
      this.isDevelopment = process.env.NODE_ENV === 'development';
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
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
    // Em produção, enviar para serviço de logging (Sentry, LogRocket, etc)
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
    // Em produção, enviar para serviço de logging
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    console.error(this.formatMessage('error', message, errorContext));
    // Em produção, enviar para Sentry ou serviço de error tracking
  }
}

export const logger = new Logger();
