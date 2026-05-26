/**
 * Telemetria de navegação otimista em /estudar (dev e opt-in).
 * Ativar em produção: NEXT_PUBLIC_ESTUDAR_NAV_TELEMETRY=1
 * ou localStorage.setItem('avant:estudar-nav-telemetry', '1')
 */

import { logger } from '@/lib/logger';

const LOG_PREFIX = 'estudar-nav';
const LS_KEY = 'avant:estudar-nav-telemetry';

type SessionCounters = {
  prefetchOk: number;
  prefetchFail: number;
  prefetchSkipped: number;
  navigateHit: number;
  navigateMiss: number;
  navigateMissInflight: number;
  hydratorSync: number;
};

const session: SessionCounters = {
  prefetchOk: 0,
  prefetchFail: 0,
  prefetchSkipped: 0,
  navigateHit: 0,
  navigateMiss: 0,
  navigateMissInflight: 0,
  hydratorSync: 0,
};

/** cacheKey → timestamp (performance.now) do clique em navegar */
const navigateStartedAt = new Map<string, number>();

/** cacheKey → timestamp do início do fetch de prefetch */
const prefetchInFlight = new Map<string, number>();

export function isEstudarNavTelemetryEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ESTUDAR_NAV_TELEMETRY === '1') return true;
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage.getItem(LS_KEY) === '1') return true;
    } catch {
      // ignore (SSR / privacy mode)
    }
  }
  return process.env.NODE_ENV === 'development';
}

export function logEstudarNav(event: string, context?: Record<string, unknown>): void {
  if (!isEstudarNavTelemetryEnabled()) return;
  logger.debug(`[${LOG_PREFIX}] ${event}`, context);
}

export function getEstudarNavSessionSnapshot() {
  const totalNavigate = session.navigateHit + session.navigateMiss;
  return {
    ...session,
    navigateHitRatePct:
      totalNavigate > 0 ? Math.round((session.navigateHit / totalNavigate) * 1000) / 10 : null,
    prefetchInFlightCount: prefetchInFlight.size,
    pendingNavigateKeys: [...navigateStartedAt.keys()],
  };
}

export function resetEstudarNavSession(): void {
  session.prefetchOk = 0;
  session.prefetchFail = 0;
  session.prefetchSkipped = 0;
  session.navigateHit = 0;
  session.navigateMiss = 0;
  session.navigateMissInflight = 0;
  session.hydratorSync = 0;
  navigateStartedAt.clear();
  prefetchInFlight.clear();
}

export function markPrefetchInFlight(cacheKey: string): boolean {
  if (prefetchInFlight.has(cacheKey)) return false;
  prefetchInFlight.set(cacheKey, nowMs());
  return true;
}

export function clearPrefetchInFlight(cacheKey: string): number | undefined {
  const started = prefetchInFlight.get(cacheKey);
  prefetchInFlight.delete(cacheKey);
  if (started == null) return undefined;
  return Math.round(nowMs() - started);
}

export function getPrefetchInFlightAgeMs(cacheKey: string): number | undefined {
  const started = prefetchInFlight.get(cacheKey);
  if (started == null) return undefined;
  return Math.round(nowMs() - started);
}

export function recordPrefetchSkipped(cacheKey: string, reason: 'cached' | 'deduped'): void {
  session.prefetchSkipped++;
  logEstudarNav('prefetch_skip', { cacheKey, reason });
}

export function recordPrefetchStart(cacheKey: string, slugComQuery: string): void {
  logEstudarNav('prefetch_start', { cacheKey, slugComQuery });
}

export function recordPrefetchEnd(
  cacheKey: string,
  outcome: { ok: true; durationMs: number; status: number } | { ok: false; durationMs: number; reason: string },
): void {
  if (outcome.ok) {
    session.prefetchOk++;
    logEstudarNav('prefetch_ok', {
      cacheKey,
      durationMs: outcome.durationMs,
      status: outcome.status,
    });
  } else {
    session.prefetchFail++;
    logEstudarNav('prefetch_fail', {
      cacheKey,
      durationMs: outcome.durationMs,
      reason: outcome.reason,
    });
  }
}

export function markNavigateStart(cacheKey: string, slugComQuery: string): void {
  navigateStartedAt.set(cacheKey, nowMs());
  logEstudarNav('navigate_start', { cacheKey, slugComQuery });
}

export function recordNavigateCacheResult(
  cacheKey: string,
  hit: boolean,
): void {
  if (hit) {
    session.navigateHit++;
    logEstudarNav('navigate_hit', { cacheKey });
    return;
  }

  const inflightMs = getPrefetchInFlightAgeMs(cacheKey);
  if (inflightMs != null) {
    session.navigateMissInflight++;
    session.navigateMiss++;
    logEstudarNav('navigate_miss_inflight', { cacheKey, prefetchInFlightMs: inflightMs });
    return;
  }

  session.navigateMiss++;
  logEstudarNav('navigate_miss', { cacheKey });
}

export function recordHydratorSync(cacheKey: string, moduloSlug?: string): void {
  session.hydratorSync++;
  const started = navigateStartedAt.get(cacheKey);
  const rscConfirmMs = started != null ? Math.round(nowMs() - started) : undefined;
  if (started != null) navigateStartedAt.delete(cacheKey);

  logEstudarNav('hydrator_sync', {
    cacheKey,
    moduloSlug,
    rscConfirmMs,
  });
}

/** Tempo de build no servidor (API / RSC). */
export function logEstudarNavApiBuild(context: {
  slug: string;
  durationMs: number;
  status: string;
}): void {
  if (!isEstudarNavTelemetryEnabled()) return;
  logger.debug(`[${LOG_PREFIX}] api_build`, context);
}

export function attachEstudarNavTelemetryToWindow(): void {
  if (typeof window === 'undefined' || !isEstudarNavTelemetryEnabled()) return;

  const api = {
    snapshot: getEstudarNavSessionSnapshot,
    reset: resetEstudarNavSession,
    enable: () => {
      try {
        window.localStorage.setItem(LS_KEY, '1');
      } catch {
        // ignore
      }
    },
    disable: () => {
      try {
        window.localStorage.removeItem(LS_KEY);
      } catch {
        // ignore
      }
    },
  };

  Object.defineProperty(window, '__avantEstudarNavTelemetry', {
    value: api,
    configurable: true,
    writable: true,
  });

  logEstudarNav('telemetry_ready', {
    hint: 'window.__avantEstudarNavTelemetry.snapshot()',
  });
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}
