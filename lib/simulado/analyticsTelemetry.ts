import { logger } from '@/lib/logger';

const LOG_PREFIX = 'simulado-analytics';
const LS_KEY = 'avant:simulado-analytics-telemetry';

function isEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_SIMULADO_ANALYTICS_TELEMETRY === '1') return true;
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage.getItem(LS_KEY) === '1') return true;
    } catch {
      // ignore
    }
  }
  return process.env.NODE_ENV === 'development';
}

export function trackSimuladoAnalyticsEvent(
  event: string,
  context?: Record<string, unknown>,
): void {
  if (!isEnabled()) return;
  logger.debug(`[${LOG_PREFIX}] ${event}`, context);
}

export function createRequestTimer() {
  const startedAt = nowMs();
  return {
    done() {
      return Math.round(nowMs() - startedAt);
    },
  };
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}
