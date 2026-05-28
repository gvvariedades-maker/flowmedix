import { logger } from '@/lib/logger';

const LOG_PREFIX = 'simulado-prefetch';
const LS_KEY = 'avant:simulado-prefetch-telemetry';

export function isSimuladoPrefetchTelemetryEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_SIMULADO_PREFETCH_TELEMETRY === '1') return true;
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage.getItem(LS_KEY) === '1') return true;
    } catch {
      // ignore
    }
  }
  return process.env.NODE_ENV === 'development';
}

function logSimuladoPrefetch(event: string, context?: Record<string, unknown>): void {
  if (!isSimuladoPrefetchTelemetryEnabled()) return;
  logger.debug(`[${LOG_PREFIX}] ${event}`, context);
}

export function recordSimuladoPrefetchStart(slug: string): void {
  logSimuladoPrefetch('simulado_prefetch_start', { slug });
}

export function recordSimuladoPrefetchSkipped(slug: string, reason: 'cached' | 'deduped'): void {
  logSimuladoPrefetch('simulado_prefetch_skip', { slug, reason });
}

export function recordSimuladoPrefetchEnd(
  slug: string,
  outcome: { ok: true; durationMs: number } | { ok: false; durationMs: number; reason: string },
): void {
  logSimuladoPrefetch(outcome.ok ? 'simulado_prefetch_ok' : 'simulado_prefetch_fail', {
    slug,
    durationMs: outcome.durationMs,
    ...(outcome.ok ? {} : { reason: outcome.reason }),
  });
}
