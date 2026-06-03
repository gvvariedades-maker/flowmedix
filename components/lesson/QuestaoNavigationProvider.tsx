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
  buildEstudarCacheKey,
  buildEstudarCacheKeyFromSlugComQuery,
  buildEstudarHref,
  buildEstudarQuestaoApiUrl,
  parseEstudarSlugFromPathname,
} from '@/lib/estudar/navigation';
import { PREFETCH_FORWARD_DEPTH, warmForwardChain } from '@/lib/estudar/prefetchChain';
import {
  attachEstudarNavTelemetryToWindow,
  clearPrefetchInFlight,
  markNavigateStart,
  markPrefetchInFlight,
  recordIdbHit,
  recordIdbHydrate,
  recordIdbMiss,
  recordNavigateCacheResult,
  recordPrefetchEnd,
  recordPrefetchSkipped,
  recordPrefetchStart,
} from '@/lib/estudar/navigationTelemetry';
import {
  getQuestaoFromIdb,
  hydrateQuestaoLruFromIdb,
  setQuestaoInIdb,
} from '@/lib/estudar/questaoIdbCache';
import { runEstudarViewTransition } from '@/lib/estudar/viewTransition';
import { useToast } from '@/lib/toast-context';

const CACHE_MAX_ENTRIES = 20;
const TOAST_SEM_ACESSO = 'Sem acesso';

type FetchPayloadResult =
  | { kind: 'ok'; payload: EstudarQuestaoPayload }
  | { kind: 'forbidden' }
  | { kind: 'error' };

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

function scheduleRouterNavigate(
  router: ReturnType<typeof useRouter>,
  href: string,
  method: 'push' | 'replace',
): void {
  const navigate = () => (method === 'replace' ? router.replace(href) : router.push(href));
  runEstudarViewTransition(() => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(navigate);
    } else {
      navigate();
    }
  });
}

export function QuestaoNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { addToast } = useToast();
  const cacheRef = useRef(new LruCache<EstudarQuestaoPayload>(CACHE_MAX_ENTRIES));
  const forbiddenKeysRef = useRef(new Set<string>());
  const prefetchedRouteRef = useRef(new Set<string>());
  const inFlightRef = useRef(new Map<string, Promise<FetchPayloadResult>>());
  const navegandoRef = useRef(false);
  const routePayloadSyncKeyRef = useRef<string | null>(null);
  const [displayPayload, setDisplayPayload] = useState<EstudarQuestaoPayload | null>(null);

  const notifySemAcesso = useCallback(() => {
    addToast(TOAST_SEM_ACESSO, 'danger');
  }, [addToast]);

  useEffect(() => {
    attachEstudarNavTelemetryToWindow();
  }, []);

  const cachePayload = useCallback((key: string, payload: EstudarQuestaoPayload) => {
    cacheRef.current.set(key, payload);
    void setQuestaoInIdb(key, payload);
  }, []);

  const getCachedPayload = useCallback((key: string) => {
    return cacheRef.current.get(key);
  }, []);

  useEffect(() => {
    void hydrateQuestaoLruFromIdb((key, payload) => {
      cacheRef.current.set(key, payload);
    }).then((count) => {
      if (count > 0) recordIdbHydrate(count);
    });
  }, []);

  const readPayloadFromIdb = useCallback(async (cacheKey: string) => {
    const fromIdb = await getQuestaoFromIdb(cacheKey);
    if (fromIdb) {
      cacheRef.current.set(cacheKey, fromIdb);
      recordIdbHit(cacheKey);
      return fromIdb;
    }
    recordIdbMiss(cacheKey);
    return null;
  }, []);

  const fetchPayloadIntoCache = useCallback(
    (slugComQuery: string): Promise<FetchPayloadResult> => {
      const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
      if (forbiddenKeysRef.current.has(cacheKey)) {
        recordPrefetchSkipped(cacheKey, 'forbidden');
        return Promise.resolve({ kind: 'forbidden' });
      }

      const cached = cacheRef.current.peek(cacheKey);
      if (cached) {
        recordPrefetchSkipped(cacheKey, 'cached');
        return Promise.resolve({ kind: 'ok', payload: cached });
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

      const promise = (async (): Promise<FetchPayloadResult> => {
        const fromIdb = await readPayloadFromIdb(cacheKey);
        if (fromIdb) {
          const durationMs = Math.round(
            (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt,
          );
          recordPrefetchEnd(cacheKey, { ok: true, durationMs, status: 200 });
          return { kind: 'ok', payload: fromIdb };
        }

        try {
          const res = await fetchWithAuth(
            buildEstudarQuestaoApiUrl(slugComQuery, { layers: 'core' }),
          );
          const durationMs = Math.round(
            (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt,
          );
          if (res.status === 403) {
            forbiddenKeysRef.current.add(cacheKey);
            recordPrefetchEnd(cacheKey, {
              ok: false,
              durationMs,
              reason: 'http_403',
            });
            return { kind: 'forbidden' };
          }
          if (!res.ok) {
            recordPrefetchEnd(cacheKey, {
              ok: false,
              durationMs,
              reason: `http_${res.status}`,
            });
            return { kind: 'error' };
          }
          const payload = (await res.json()) as EstudarQuestaoPayload;
          cacheRef.current.set(cacheKey, payload);
          void setQuestaoInIdb(cacheKey, payload);
          recordPrefetchEnd(cacheKey, { ok: true, durationMs, status: res.status });
          return { kind: 'ok', payload };
        } catch (err) {
          const durationMs = Math.round(
            (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt,
          );
          recordPrefetchEnd(cacheKey, {
            ok: false,
            durationMs,
            reason: err instanceof Error ? err.message : 'network_error',
          });
          return { kind: 'error' };
        } finally {
          inFlightRef.current.delete(cacheKey);
          clearPrefetchInFlight(cacheKey);
        }
      })();

      inFlightRef.current.set(cacheKey, promise);
      return promise;
    },
    [readPayloadFromIdb],
  );

  /**
   * Soft navigation (intercept @modal) atualiza a URL mas pode deixar a vitrine no slot
   * `children` sem montar o Hydrator. Sincroniza payload pelo cache/API quando a rota
   * já é `/estudar/[slug]`; `router.refresh()` só se a API falhar.
   */
  useEffect(() => {
    navegandoRef.current = false;
    const slug = parseEstudarSlugFromPathname(pathname);
    if (slug === null) {
      routePayloadSyncKeyRef.current = null;
      setDisplayPayload(null);
      return;
    }
    if (typeof window === 'undefined') return;

    const cacheKey = buildEstudarCacheKey(
      pathname,
      new URLSearchParams(window.location.search),
    );
    if (routePayloadSyncKeyRef.current === cacheKey) return;

    const cached = cacheRef.current.peek(cacheKey);
    if (cached) {
      routePayloadSyncKeyRef.current = cacheKey;
      setDisplayPayload(cached);
      return;
    }

    const slugComQuery = `${slug}${window.location.search}`;
    let cancelled = false;

    void (async () => {
      const result = await fetchPayloadIntoCache(slugComQuery);
      if (cancelled) return;
      routePayloadSyncKeyRef.current = cacheKey;

      if (result.kind === 'ok') {
        setDisplayPayload(result.payload);
        return;
      }
      if (result.kind === 'forbidden') {
        notifySemAcesso();
        return;
      }
      router.refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, fetchPayloadIntoCache, router, notifySemAcesso]);

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
        fetchPayloadIntoCache: async (slug) => {
          const result = await fetchPayloadIntoCache(slug);
          return result.kind === 'ok' ? result.payload : null;
        },
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
          if (forbiddenKeysRef.current.has(cacheKey)) {
            notifySemAcesso();
            return;
          }

          let payload = cacheRef.current.peek(cacheKey) ?? null;
          if (!payload) {
            recordNavigateCacheResult(cacheKey, false);
            const result = await fetchPayloadIntoCache(slugComQuery);
            if (result.kind === 'forbidden') {
              notifySemAcesso();
              return;
            }
            if (result.kind === 'ok') {
              payload = result.payload;
            }
          } else {
            recordNavigateCacheResult(cacheKey, true);
          }

          if (payload) {
            setDisplayPayload(payload);
          }

          const alreadyOnQuestao = parseEstudarSlugFromPathname(pathname) !== null;
          scheduleRouterNavigate(router, href, alreadyOnQuestao ? 'replace' : 'push');

          if (payload?.proximaSlug) {
            void warmForwardChain(payload.proximaSlug, PREFETCH_FORWARD_DEPTH, {
              fetchPayloadIntoCache: async (slug) => {
                const result = await fetchPayloadIntoCache(slug);
                return result.kind === 'ok' ? result.payload : null;
              },
              prefetchRoute,
              buildHref: buildEstudarHref,
            });
          }
        } catch {
          const alreadyOnQuestao = parseEstudarSlugFromPathname(pathname) !== null;
          scheduleRouterNavigate(router, href, alreadyOnQuestao ? 'replace' : 'push');
        } finally {
          navegandoRef.current = false;
        }
      })();
    },
    [router, pathname, fetchPayloadIntoCache, prefetchRoute, notifySemAcesso],
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
