'use client';

import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { getSimuladoQuestionPayload, SimuladoApiError } from '@/lib/simulado/client';
import type { SimuladoQuestaoPayloadResponse } from '@/lib/simulado/types';
import {
  recordSimuladoPrefetchEnd,
  recordSimuladoPrefetchSkipped,
  recordSimuladoPrefetchStart,
} from '@/lib/simulado/prefetchTelemetry';

export type SimuladoQuestionSlim = SimuladoQuestaoPayloadResponse['dados'];

const PREFETCH_DEPTH = 2;

function abortAllPendingFetches(
  abortBySlugRef: RefObject<Map<string, AbortController>>,
  abortSlugFetch: (slug: string) => void,
) {
  for (const slug of [...abortBySlugRef.current.keys()]) {
    abortSlugFetch(slug);
  }
}

type UseSimuladoQuestionCacheOptions = {
  activeSlug: string | null;
  prefetchTargets: string[];
};

export function useSimuladoQuestionCache({
  activeSlug,
  prefetchTargets,
}: UseSimuladoQuestionCacheOptions) {
  const cacheRef = useRef(new Map<string, SimuladoQuestionSlim>());
  const inflightRef = useRef(new Map<string, Promise<SimuladoQuestionSlim>>());
  const abortBySlugRef = useRef(new Map<string, AbortController>());
  const activeSlugRef = useRef(activeSlug);

  useEffect(() => {
    activeSlugRef.current = activeSlug;
  }, [activeSlug]);

  const abortSlugFetch = useCallback((slug: string) => {
    abortBySlugRef.current.get(slug)?.abort();
    abortBySlugRef.current.delete(slug);
    inflightRef.current.delete(slug);
  }, []);

  const abortStaleExcept = useCallback((keepSlug: string | null) => {
    for (const slug of [...abortBySlugRef.current.keys()]) {
      if (slug !== keepSlug) abortSlugFetch(slug);
    }
  }, [abortSlugFetch]);

  const fetchIntoCache = useCallback(
    async (slug: string, opts?: { signal?: AbortSignal; isPrefetch?: boolean }): Promise<SimuladoQuestionSlim> => {
      const cached = cacheRef.current.get(slug);
      if (cached) {
        if (opts?.isPrefetch) recordSimuladoPrefetchSkipped(slug, 'cached');
        return cached;
      }

      const inflight = inflightRef.current.get(slug);
      if (inflight) {
        if (opts?.isPrefetch) recordSimuladoPrefetchSkipped(slug, 'deduped');
        return inflight;
      }

      const controller = new AbortController();
      if (opts?.signal) {
        opts.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
      abortBySlugRef.current.set(slug, controller);

      const startedAt = performance.now();
      if (opts?.isPrefetch) recordSimuladoPrefetchStart(slug);

      const promise = (async () => {
        try {
          const json = await getSimuladoQuestionPayload(slug, { signal: controller.signal });
          const dados = json.dados;
          cacheRef.current.set(slug, dados);
          if (opts?.isPrefetch) {
            recordSimuladoPrefetchEnd(slug, { ok: true, durationMs: Math.round(performance.now() - startedAt) });
          }
          return dados;
        } catch (err) {
          if (opts?.isPrefetch && !(err instanceof DOMException && err.name === 'AbortError')) {
            recordSimuladoPrefetchEnd(slug, {
              ok: false,
              durationMs: Math.round(performance.now() - startedAt),
              reason: err instanceof SimuladoApiError ? err.message : 'network',
            });
          }
          throw err;
        } finally {
          inflightRef.current.delete(slug);
          if (abortBySlugRef.current.get(slug) === controller) {
            abortBySlugRef.current.delete(slug);
          }
        }
      })();

      inflightRef.current.set(slug, promise);
      return promise;
    },
    [],
  );

  const getCached = useCallback((slug: string): SimuladoQuestionSlim | undefined => {
    return cacheRef.current.get(slug);
  }, []);

  const loadQuestion = useCallback(
    async (slug: string): Promise<SimuladoQuestionSlim> => {
      abortStaleExcept(slug);
      return fetchIntoCache(slug);
    },
    [abortStaleExcept, fetchIntoCache],
  );

  const prefetchSlugsInBackground = useCallback(
    (slugs: string[]) => {
      for (const slug of slugs.slice(0, PREFETCH_DEPTH)) {
        if (!slug || slug === activeSlugRef.current) continue;
        void fetchIntoCache(slug, { isPrefetch: true }).catch(() => {
          // prefetch silencioso
        });
      }
    },
    [fetchIntoCache],
  );

  useEffect(() => {
    if (!activeSlug || prefetchTargets.length === 0) return;
    prefetchSlugsInBackground(prefetchTargets);
  }, [activeSlug, prefetchTargets, prefetchSlugsInBackground]);

  useEffect(() => {
    return () => abortAllPendingFetches(abortBySlugRef, abortSlugFetch);
  }, [abortSlugFetch]);

  return {
    getCached,
    loadQuestion,
    prefetchSlugsInBackground,
    clearCache: useCallback(() => {
      cacheRef.current.clear();
    }, []),
  };
}
