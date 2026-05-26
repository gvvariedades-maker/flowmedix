'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  QuestaoNavigationContext,
  type EstudarQuestaoPayload,
  type QuestaoNavigationContextValue,
} from '@/components/lesson/questao-navigation-context';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import {
  buildEstudarCacheKeyFromSlugComQuery,
  buildEstudarHref,
  buildEstudarQuestaoApiUrl,
} from '@/lib/estudar/navigation';
import { PREFETCH_FORWARD_DEPTH, warmForwardChain } from '@/lib/estudar/prefetchChain';
import {
  attachEstudarNavTelemetryToWindow,
  clearPrefetchInFlight,
  markNavigateStart,
  markPrefetchInFlight,
  recordNavigateCacheResult,
  recordPrefetchEnd,
  recordPrefetchSkipped,
  recordPrefetchStart,
} from '@/lib/estudar/navigationTelemetry';

const CACHE_MAX_ENTRIES = 20;

class LruCache<T> {
  private map = new Map<string, T>();

  constructor(private maxSize: number) {}

  get(key: string): T | undefined {
    const value = this.map.get(key);
    if (value === undefined) return undefined;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  peek(key: string): T | undefined {
    return this.map.get(key);
  }

  set(key: string, value: T): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      const firstKey = this.map.keys().next().value;
      if (firstKey !== undefined) this.map.delete(firstKey);
    }
    this.map.set(key, value);
  }
}

function scheduleRouterPush(router: ReturnType<typeof useRouter>, href: string): void {
  const push = () => router.push(href);
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(push);
  } else {
    push();
  }
}

export function QuestaoNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const cacheRef = useRef(new LruCache<EstudarQuestaoPayload>(CACHE_MAX_ENTRIES));
  const prefetchedRouteRef = useRef(new Set<string>());
  const inFlightRef = useRef(new Map<string, Promise<EstudarQuestaoPayload | null>>());
  const navegandoRef = useRef(false);
  const [displayPayload, setDisplayPayload] = useState<EstudarQuestaoPayload | null>(null);

  useEffect(() => {
    navegandoRef.current = false;
  }, [pathname]);

  useEffect(() => {
    attachEstudarNavTelemetryToWindow();
  }, []);

  const cachePayload = useCallback((key: string, payload: EstudarQuestaoPayload) => {
    cacheRef.current.set(key, payload);
  }, []);

  const getCachedPayload = useCallback((key: string) => {
    return cacheRef.current.get(key);
  }, []);

  const fetchPayloadIntoCache = useCallback(
    (slugComQuery: string): Promise<EstudarQuestaoPayload | null> => {
      const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
      const cached = cacheRef.current.peek(cacheKey);
      if (cached) {
        recordPrefetchSkipped(cacheKey, 'cached');
        return Promise.resolve(cached);
      }

      const existing = inFlightRef.current.get(cacheKey);
      if (existing) {
        recordPrefetchSkipped(cacheKey, 'deduped');
        return existing;
      }

      markPrefetchInFlight(cacheKey);
      recordPrefetchStart(cacheKey, slugComQuery);
      const startedAt =
        typeof performance !== 'undefined' ? performance.now() : Date.now();

      const promise = (async (): Promise<EstudarQuestaoPayload | null> => {
        try {
          const res = await fetchWithAuth(buildEstudarQuestaoApiUrl(slugComQuery));
          const durationMs = Math.round(
            (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt,
          );
          if (!res.ok) {
            recordPrefetchEnd(cacheKey, {
              ok: false,
              durationMs,
              reason: `http_${res.status}`,
            });
            return null;
          }
          const payload = (await res.json()) as EstudarQuestaoPayload;
          cacheRef.current.set(cacheKey, payload);
          recordPrefetchEnd(cacheKey, { ok: true, durationMs, status: res.status });
          return payload;
        } catch (err) {
          const durationMs = Math.round(
            (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt,
          );
          recordPrefetchEnd(cacheKey, {
            ok: false,
            durationMs,
            reason: err instanceof Error ? err.message : 'network_error',
          });
          return null;
        } finally {
          inFlightRef.current.delete(cacheKey);
          clearPrefetchInFlight(cacheKey);
        }
      })();

      inFlightRef.current.set(cacheKey, promise);
      return promise;
    },
    [],
  );

  const prefetchPayload = useCallback(
    (slugComQuery: string) => {
      void fetchPayloadIntoCache(slugComQuery);
    },
    [fetchPayloadIntoCache],
  );

  const prefetchRoute = useCallback(
    (href: string) => {
      if (prefetchedRouteRef.current.has(href)) return;
      prefetchedRouteRef.current.add(href);
      router.prefetch(href);
    },
    [router],
  );

  const prefetchEstudar = useCallback(
    (slugComQuery: string) => {
      prefetchRoute(buildEstudarHref(slugComQuery));
      void warmForwardChain(slugComQuery, PREFETCH_FORWARD_DEPTH, {
        fetchPayloadIntoCache,
        prefetchRoute,
        buildHref: buildEstudarHref,
      });
    },
    [fetchPayloadIntoCache, prefetchRoute],
  );

  const navigateEstudar = useCallback(
    (slugComQuery: string) => {
      if (navegandoRef.current) return;
      navegandoRef.current = true;

      const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
      const href = buildEstudarHref(slugComQuery);
      markNavigateStart(cacheKey, slugComQuery);

      void (async () => {
        try {
          let payload = cacheRef.current.peek(cacheKey) ?? null;
          if (!payload) {
            recordNavigateCacheResult(cacheKey, false);
            payload = await fetchPayloadIntoCache(slugComQuery);
          } else {
            recordNavigateCacheResult(cacheKey, true);
          }

          if (payload) {
            setDisplayPayload(payload);
            scheduleRouterPush(router, href);
            if (payload.proximaSlug) {
              void warmForwardChain(payload.proximaSlug, PREFETCH_FORWARD_DEPTH, {
                fetchPayloadIntoCache,
                prefetchRoute,
                buildHref: buildEstudarHref,
              });
            }
            return;
          }

          scheduleRouterPush(router, href);
        } catch {
          scheduleRouterPush(router, href);
        }
      })();
    },
    [router, fetchPayloadIntoCache, prefetchRoute],
  );

  const value = useMemo<QuestaoNavigationContextValue>(
    () => ({
      displayPayload,
      setDisplayPayload,
      cachePayload,
      getCachedPayload,
      navigateEstudar,
      prefetchEstudar,
      prefetchPayload,
    }),
    [
      displayPayload,
      cachePayload,
      getCachedPayload,
      navigateEstudar,
      prefetchEstudar,
      prefetchPayload,
    ],
  );

  return (
    <QuestaoNavigationContext.Provider value={value}>{children}</QuestaoNavigationContext.Provider>
  );
}

export type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';
