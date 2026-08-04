'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  QuestaoNavigationContext,
  type EstudarQuestaoPayload,
  type QuestaoNavigationContextValue,
} from '@/components/lesson/questao-navigation-context';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { logger } from '@/lib/logger';
import {
  buildEstudarCacheKey,
  buildEstudarCacheKeyFromSlugComQuery,
  applySoftEstudarHistoryUrl,
  buildEstudarHref,
  buildEstudarQuestaoApiUrl,
  buildEstudarVitrineHref,
  canDismissEstudarViaHistoryBack,
  clearEstudarVitrineReturnEligible,
  markEstudarVitrineReturnEligible,
  isEstudarVitrinePathname,
  parseEstudarSlugFromPathname,
  shouldSkipEstudarRoutePayloadSync,
  type EstudarRouteSnapshot,
  type EstudarVitrineReturnContext,
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
import { fetchAndSyncEstudarL0Meta } from '@/lib/estudar/questaoL0Client';
import {
  deleteQuestaoFromIdb,
  getQuestaoFromIdb,
  hydrateQuestaoLruFromIdb,
  setQuestaoInIdb,
} from '@/lib/estudar/questaoIdbCache';
import {
  buildPayloadCacheKey,
  payloadMatchesCacheKey,
} from '@/lib/estudar/payloadRouteMatch';
import { runEstudarViewTransition } from '@/lib/estudar/viewTransition';
import { useEstudarStaleRecovery } from '@/components/lesson/useEstudarStaleRecovery';
import { useToast } from '@/lib/toast-context';

const CACHE_MAX_ENTRIES = 20;
const TOAST_SEM_ACESSO = 'Sem acesso';
const TOAST_CARREGAR_QUESTAO = 'Não foi possível carregar esta questão. Tente novamente.';
/** Fallback se `router.replace` não alcançar `/estudar` após dismiss interno. */
const DISMISS_VITRINE_FALLBACK_MS = 2_500;

function buildVitrineReturnContextFromLocationSearch(): EstudarVitrineReturnContext {
  if (typeof window === 'undefined') return {};
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const cadernoId = params.get('caderno_id');
  if (params.get('from') === 'caderno' && cadernoId) {
    return { fromCaderno: cadernoId };
  }
  return search ? { vitrineQuerySuffix: search } : {};
}

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

  delete(key: string): void {
    this.map.delete(key);
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
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const cacheRef = useRef(new LruCache<EstudarQuestaoPayload>(CACHE_MAX_ENTRIES));
  const forbiddenKeysRef = useRef(new Set<string>());
  const prefetchedRouteRef = useRef(new Set<string>());
  const inFlightRef = useRef(new Map<string, Promise<FetchPayloadResult>>());
  const navegandoRef = useRef(false);
  const routePayloadSyncKeyRef = useRef<string | null>(null);
  /** Bloqueia re-hidratação do payload enquanto `replace` volta à vitrine. */
  const dismissingToVitrineRef = useRef(false);
  const dismissFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDismissingToVitrine, setIsDismissingToVitrine] = useState(false);
  const [displayPayload, setDisplayPayload] = useState<EstudarQuestaoPayload | null>(null);
  const [estudarRoute, setEstudarRoute] = useState<EstudarRouteSnapshot | null>(null);

  const notifySemAcesso = useCallback(() => {
    addToast(TOAST_SEM_ACESSO, 'danger');
  }, [addToast]);

  const notifyFalhaCarregar = useCallback(() => {
    addToast(TOAST_CARREGAR_QUESTAO, 'danger');
  }, [addToast]);

  useEffect(() => {
    attachEstudarNavTelemetryToWindow();
  }, []);

  /** Quando o App Router alcança a URL do soft-nav, volta a usar pathname/search do Next. */
  useEffect(() => {
    if (!estudarRoute) return;
    const softSearch = estudarRoute.search.replace(/^\?/, '');
    const routerSearch = searchParams.toString();
    if (pathname === estudarRoute.pathname && routerSearch === softSearch) {
      setEstudarRoute(null);
    }
  }, [pathname, searchParams, estudarRoute]);

  const invalidateCacheKey = useCallback((key: string) => {
    cacheRef.current.delete(key);
    void deleteQuestaoFromIdb(key);
  }, []);

  const cachePayload = useCallback(
    (key: string, payload: EstudarQuestaoPayload) => {
      const coherentKey = payloadMatchesCacheKey(payload, key)
        ? key
        : buildPayloadCacheKey(payload);
      if (!coherentKey || !payloadMatchesCacheKey(payload, coherentKey)) {
        invalidateCacheKey(key);
        return;
      }
      if (coherentKey !== key) {
        invalidateCacheKey(key);
      }
      cacheRef.current.set(coherentKey, payload);
      void setQuestaoInIdb(coherentKey, payload);
    },
    [invalidateCacheKey],
  );

  const peekValidCachedPayload = useCallback(
    (key: string): EstudarQuestaoPayload | null => {
      const cached = cacheRef.current.peek(key);
      if (!cached) return null;
      if (!payloadMatchesCacheKey(cached, key)) {
        invalidateCacheKey(key);
        return null;
      }
      return cached;
    },
    [invalidateCacheKey],
  );

  const getCachedPayload = useCallback(
    (key: string) => {
      const cached = cacheRef.current.get(key);
      if (!cached) return undefined;
      if (!payloadMatchesCacheKey(cached, key)) {
        invalidateCacheKey(key);
        return undefined;
      }
      return cached;
    },
    [invalidateCacheKey],
  );

  useEffect(() => {
    void (async () => {
      await fetchAndSyncEstudarL0Meta();
      const count = await hydrateQuestaoLruFromIdb((key, payload) => {
        if (!payloadMatchesCacheKey(payload, key)) {
          void deleteQuestaoFromIdb(key);
          return;
        }
        cacheRef.current.set(key, payload);
      });
      if (count > 0) recordIdbHydrate(count);
    })();
  }, []);

  const readPayloadFromIdb = useCallback(
    async (cacheKey: string) => {
      const fromIdb = await getQuestaoFromIdb(cacheKey);
      if (fromIdb) {
        if (!payloadMatchesCacheKey(fromIdb, cacheKey)) {
          invalidateCacheKey(cacheKey);
          recordIdbMiss(cacheKey);
          return null;
        }
        cacheRef.current.set(cacheKey, fromIdb);
        recordIdbHit(cacheKey);
        return fromIdb;
      }
      recordIdbMiss(cacheKey);
      return null;
    },
    [invalidateCacheKey],
  );

  const fetchPayloadIntoCache = useCallback(
    (
      slugComQuery: string,
      options?: { layers?: 'core' | 'full'; skipCache?: boolean },
    ): Promise<FetchPayloadResult> => {
      const layers = options?.layers ?? 'core';
      const skipCache = options?.skipCache ?? false;
      const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
      if (forbiddenKeysRef.current.has(cacheKey)) {
        recordPrefetchSkipped(cacheKey, 'forbidden');
        return Promise.resolve({ kind: 'forbidden' });
      }

      if (!skipCache) {
        const cached = peekValidCachedPayload(cacheKey);
        if (cached) {
          recordPrefetchSkipped(cacheKey, 'cached');
          return Promise.resolve({ kind: 'ok', payload: cached });
        }
      }

      const inFlightKey = skipCache ? `skip:${cacheKey}` : cacheKey;
      const existing = inFlightRef.current.get(inFlightKey);
      if (existing) {
        recordPrefetchSkipped(cacheKey, 'deduped');
        return existing;
      }

      markPrefetchInFlight(cacheKey);
      recordPrefetchStart(cacheKey, slugComQuery);
      const startedAt =
        typeof performance !== 'undefined' ? performance.now() : Date.now();

      const promise = (async (): Promise<FetchPayloadResult> => {
        if (!skipCache) {
          const fromIdb = await readPayloadFromIdb(cacheKey);
          if (fromIdb) {
            const durationMs = Math.round(
              (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt,
            );
            recordPrefetchEnd(cacheKey, { ok: true, durationMs, status: 200 });
            return { kind: 'ok', payload: fromIdb };
          }
        }

        try {
          const res = await fetchWithAuth(
            buildEstudarQuestaoApiUrl(slugComQuery, { layers }),
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
          if (!payloadMatchesCacheKey(payload, cacheKey)) {
            logger.warn('Payload da API divergiu da chave de cache (ignorado)', {
              cacheKey,
              moduloSlug: payload.moduloSlug,
              vitrineQuerySuffix: payload.vitrineQuerySuffix ?? '',
            });
            invalidateCacheKey(cacheKey);
            recordPrefetchEnd(cacheKey, {
              ok: false,
              durationMs,
              reason: 'payload_cache_key_mismatch',
            });
            return { kind: 'error' };
          }
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
          inFlightRef.current.delete(inFlightKey);
          clearPrefetchInFlight(cacheKey);
        }
      })();

      inFlightRef.current.set(inFlightKey, promise);
      return promise;
    },
    [readPayloadFromIdb, peekValidCachedPayload, invalidateCacheKey],
  );

  const clearDismissFallbackTimer = useCallback(() => {
    if (dismissFallbackTimerRef.current) {
      clearTimeout(dismissFallbackTimerRef.current);
      dismissFallbackTimerRef.current = null;
    }
  }, []);

  const resetDismissToVitrineState = useCallback(() => {
    dismissingToVitrineRef.current = false;
    setIsDismissingToVitrine(false);
    clearDismissFallbackTimer();
    clearEstudarVitrineReturnEligible();
  }, [clearDismissFallbackTimer]);

  const scheduleDismissVitrineFallback = useCallback(
    (href: string) => {
      clearDismissFallbackTimer();
      dismissFallbackTimerRef.current = setTimeout(() => {
        dismissFallbackTimerRef.current = null;
        if (!dismissingToVitrineRef.current) return;

        logger.warn('dismissToVitrine: fallback após timeout — reforçando vitrine', {
          nextPathname: pathname,
          browserPathname:
            typeof window !== 'undefined' ? window.location.pathname : undefined,
        });

        setDisplayPayload(null);
        setEstudarRoute(null);
        routePayloadSyncKeyRef.current = null;

        if (typeof window !== 'undefined') {
          applySoftEstudarHistoryUrl(href);
        }
        scheduleRouterNavigate(router, href, 'replace');
      }, DISMISS_VITRINE_FALLBACK_MS);
    },
    [router, pathname, clearDismissFallbackTimer],
  );

  const dismissToVitrine = useCallback(
    (ctx: EstudarVitrineReturnContext = {}) => {
      const href = buildEstudarVitrineHref(ctx);

      dismissingToVitrineRef.current = true;
      setIsDismissingToVitrine(true);
      routePayloadSyncKeyRef.current = null;
      setEstudarRoute(null);
      setDisplayPayload(null);

      if (canDismissEstudarViaHistoryBack(ctx)) {
        window.history.back();
        scheduleDismissVitrineFallback(href);
        return;
      }

      if (typeof window !== 'undefined') {
        applySoftEstudarHistoryUrl(href);
      }

      scheduleRouterNavigate(router, href, 'replace');
      scheduleDismissVitrineFallback(href);
    },
    [router, scheduleDismissVitrineFallback],
  );

  const reconcileDisplayPayloadFromBrowserUrl = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (dismissingToVitrineRef.current) return;

    const browserPathname = window.location.pathname;
    const slug = parseEstudarSlugFromPathname(browserPathname);
    if (slug === null) {
      routePayloadSyncKeyRef.current = null;
      setDisplayPayload(null);
      return;
    }

    const cacheKey = buildEstudarCacheKey(
      browserPathname,
      new URLSearchParams(window.location.search),
    );
    if (routePayloadSyncKeyRef.current === cacheKey) return;

    const cached = peekValidCachedPayload(cacheKey);
    if (cached) {
      routePayloadSyncKeyRef.current = cacheKey;
      setDisplayPayload(cached);
      return;
    }

    const slugComQuery = `${slug}${window.location.search}`;

    void (async () => {
      const result = await fetchPayloadIntoCache(slugComQuery, { layers: 'core' });
      if (result.kind === 'ok') {
        routePayloadSyncKeyRef.current = cacheKey;
        setDisplayPayload(result.payload);
        return;
      }
      if (result.kind === 'forbidden') {
        notifySemAcesso();
        dismissToVitrine(buildVitrineReturnContextFromLocationSearch());
        return;
      }
      logger.warn('Reconciliação de payload após popstate falhou', {
        slugComQuery: slug,
        kind: result.kind,
      });
      notifyFalhaCarregar();
      router.refresh();
    })();
  }, [
    fetchPayloadIntoCache,
    notifySemAcesso,
    notifyFalhaCarregar,
    dismissToVitrine,
    router,
    peekValidCachedPayload,
  ]);

  useEffect(() => {
    const onPopState = () => {
      setEstudarRoute(null);
      routePayloadSyncKeyRef.current = null;

      if (
        typeof window !== 'undefined' &&
        isEstudarVitrinePathname(window.location.pathname)
      ) {
        resetDismissToVitrineState();
        setDisplayPayload(null);
        return;
      }

      reconcileDisplayPayloadFromBrowserUrl();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [reconcileDisplayPayloadFromBrowserUrl, resetDismissToVitrineState]);

  /** Limpa soft-nav e player antes do paint ao voltar à vitrine (evita vitrine inerte). */
  useLayoutEffect(() => {
    navegandoRef.current = false;
    if (!isEstudarVitrinePathname(pathname)) return;

    resetDismissToVitrineState();
    routePayloadSyncKeyRef.current = null;
    setEstudarRoute(null);
    setDisplayPayload(null);
  }, [pathname, resetDismissToVitrineState]);

  useEffect(() => () => clearDismissFallbackTimer(), [clearDismissFallbackTimer]);

  /**
   * Soft navigation (intercept @modal) atualiza a URL mas pode deixar a vitrine no slot
   * `children` sem montar o Hydrator. Sincroniza payload pelo cache/API quando a rota
   * já é `/estudar/[slug]`; `router.refresh()` só se a API falhar.
   */
  useEffect(() => {
    const slug = parseEstudarSlugFromPathname(pathname);
    if (slug === null) return;
    if (dismissingToVitrineRef.current) return;
    if (typeof window === 'undefined') return;

    if (shouldSkipEstudarRoutePayloadSync(slug)) {
      return;
    }

    const cacheKey = buildEstudarCacheKey(
      pathname,
      new URLSearchParams(window.location.search),
    );
    if (routePayloadSyncKeyRef.current === cacheKey) return;

    const cached = peekValidCachedPayload(cacheKey);
    if (cached) {
      routePayloadSyncKeyRef.current = cacheKey;
      setDisplayPayload(cached);
      return;
    }

    const slugComQuery = `${slug}${window.location.search}`;
    let cancelled = false;

    void (async () => {
      const result = await fetchPayloadIntoCache(slugComQuery, { layers: 'core' });
      if (cancelled) return;

      if (result.kind === 'ok') {
        routePayloadSyncKeyRef.current = cacheKey;
        setDisplayPayload(result.payload);
        return;
      }
      if (result.kind === 'forbidden') {
        notifySemAcesso();
        dismissToVitrine(buildVitrineReturnContextFromLocationSearch());
        return;
      }
      logger.warn('Sincronização de payload da questão falhou na troca de rota', {
        slugComQuery: slug,
        kind: result.kind,
      });
      notifyFalhaCarregar();
      router.refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [
    pathname,
    router,
    fetchPayloadIntoCache,
    notifySemAcesso,
    notifyFalhaCarregar,
    dismissToVitrine,
    peekValidCachedPayload,
  ]);

  const prefetchPayload = useCallback(
    (slugComQuery: string) => {
      void fetchPayloadIntoCache(slugComQuery);
    },
    [fetchPayloadIntoCache],
  );

  const refetchRoutePayload = useCallback(
    async (
      slugComQuery: string,
      options?: { skipCache?: boolean },
    ): Promise<'ok' | 'forbidden' | 'error'> => {
      const result = await fetchPayloadIntoCache(slugComQuery, {
        layers: 'full',
        skipCache: options?.skipCache,
      });
      if (result.kind === 'ok') {
        const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
        routePayloadSyncKeyRef.current = cacheKey;
        setDisplayPayload(result.payload);
        return 'ok';
      }
      return result.kind;
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
    (slugComQuery: string): Promise<boolean> => {
      if (navegandoRef.current) return Promise.resolve(false);
      navegandoRef.current = true;

      const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
      const href = buildEstudarHref(slugComQuery);
      markNavigateStart(cacheKey, slugComQuery);

      return (async (): Promise<boolean> => {
        try {
          if (forbiddenKeysRef.current.has(cacheKey)) {
            notifySemAcesso();
            return false;
          }

          let payload = peekValidCachedPayload(cacheKey);
          if (!payload) {
            recordNavigateCacheResult(cacheKey, false);
            const result = await fetchPayloadIntoCache(slugComQuery, { layers: 'core' });
            if (result.kind === 'forbidden') {
              notifySemAcesso();
              return false;
            }
            if (result.kind === 'error') {
              notifyFalhaCarregar();
              return false;
            }
            if (result.kind === 'ok') {
              payload = result.payload;
            }
          } else {
            recordNavigateCacheResult(cacheKey, true);
          }

          if (!payload) {
            notifyFalhaCarregar();
            return false;
          }

          routePayloadSyncKeyRef.current = cacheKey;
          setDisplayPayload(payload);

          const alreadyOnQuestao = parseEstudarSlugFromPathname(pathname) !== null;
          if (alreadyOnQuestao) {
            const route = applySoftEstudarHistoryUrl(href);
            setEstudarRoute(route);
          } else {
            markEstudarVitrineReturnEligible();
            setEstudarRoute(null);
            scheduleRouterNavigate(router, href, 'push');
          }

          if (payload.proximaSlug) {
            void warmForwardChain(payload.proximaSlug, PREFETCH_FORWARD_DEPTH, {
              fetchPayloadIntoCache: async (slug) => {
                const result = await fetchPayloadIntoCache(slug);
                return result.kind === 'ok' ? result.payload : null;
              },
              prefetchRoute,
              buildHref: buildEstudarHref,
            });
          }
          return true;
        } catch (err) {
          logger.error('Falha na navegação client-side entre questões', err, { slugComQuery });
          notifyFalhaCarregar();
          return false;
        } finally {
          navegandoRef.current = false;
        }
      })();
    },
    [router, pathname, fetchPayloadIntoCache, prefetchRoute, notifySemAcesso, notifyFalhaCarregar, peekValidCachedPayload],
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
      refetchRoutePayload,
      dismissToVitrine,
      isDismissingToVitrine,
      estudarRoute,
    }),
    [
      displayPayload,
      cachePayload,
      getCachedPayload,
      navigateEstudar,
      prefetchEstudar,
      prefetchPayload,
      refetchRoutePayload,
      dismissToVitrine,
      isDismissingToVitrine,
      estudarRoute,
    ],
  );

  return (
    <QuestaoNavigationContext.Provider value={value}>
      <EstudarStaleRecoveryRunner />
      {children}
    </QuestaoNavigationContext.Provider>
  );
}

function EstudarStaleRecoveryRunner() {
  useEstudarStaleRecovery();
  return null;
}

export type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';
