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

export function QuestaoNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const cacheRef = useRef(new LruCache<EstudarQuestaoPayload>(CACHE_MAX_ENTRIES));
  const prefetchedRef = useRef(new Set<string>());
  const prefetchedPayloadRef = useRef(new Set<string>());
  const navegandoRef = useRef(false);
  const [displayPayload, setDisplayPayload] = useState<EstudarQuestaoPayload | null>(null);

  useEffect(() => {
    navegandoRef.current = false;
  }, [pathname]);

  const cachePayload = useCallback((key: string, payload: EstudarQuestaoPayload) => {
    cacheRef.current.set(key, payload);
  }, []);

  const getCachedPayload = useCallback((key: string) => {
    return cacheRef.current.get(key);
  }, []);

  const prefetchPayload = useCallback(
    (slugComQuery: string) => {
      const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
      if (prefetchedPayloadRef.current.has(cacheKey)) return;
      if (cacheRef.current.get(cacheKey)) {
        prefetchedPayloadRef.current.add(cacheKey);
        return;
      }

      prefetchedPayloadRef.current.add(cacheKey);

      void (async () => {
        try {
          const res = await fetchWithAuth(buildEstudarQuestaoApiUrl(slugComQuery));
          if (!res.ok) return;
          const payload = (await res.json()) as EstudarQuestaoPayload;
          cacheRef.current.set(cacheKey, payload);
        } catch {
          // prefetch best-effort; RSC confirma depois
        }
      })();
    },
    [],
  );

  const prefetchEstudar = useCallback(
    (slugComQuery: string) => {
      const href = buildEstudarHref(slugComQuery);
      if (!prefetchedRef.current.has(href)) {
        prefetchedRef.current.add(href);
        router.prefetch(href);
      }
      prefetchPayload(slugComQuery);
    },
    [router, prefetchPayload],
  );

  const navigateEstudar = useCallback(
    (slugComQuery: string) => {
      if (navegandoRef.current) return;
      navegandoRef.current = true;

      const cacheKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setDisplayPayload(cached);
      }

      router.push(buildEstudarHref(slugComQuery));
    },
    [router],
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
