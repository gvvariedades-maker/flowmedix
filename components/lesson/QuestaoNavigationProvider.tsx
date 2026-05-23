'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import {
  QuestaoNavigationContext,
  type EstudarQuestaoPayload,
  type QuestaoNavigationContextValue,
} from '@/components/lesson/questao-navigation-context';
import {
  buildEstudarCacheKeyFromSlugComQuery,
  buildEstudarHref,
} from '@/lib/estudar/navigation';
import { LessonPlayerSkeleton } from '@/components/lesson/LessonPlayerSkeleton';

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
  const cacheRef = useRef(new LruCache<EstudarQuestaoPayload>(CACHE_MAX_ENTRIES));

  const [optimisticPayload, setOptimisticPayload] = useState<EstudarQuestaoPayload | null>(
    null,
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingTargetKey, setPendingTargetKey] = useState<string | null>(null);

  const cachePayload = useCallback((key: string, payload: EstudarQuestaoPayload) => {
    cacheRef.current.set(key, payload);
  }, []);

  const getCachedPayload = useCallback((key: string) => {
    return cacheRef.current.get(key);
  }, []);

  const clearOptimistic = useCallback(() => {
    setOptimisticPayload(null);
    setIsNavigating(false);
    setPendingTargetKey(null);
  }, []);

  const confirmServerArrival = useCallback(
    (key: string) => {
      if (pendingTargetKey === key) {
        clearOptimistic();
      }
    },
    [pendingTargetKey, clearOptimistic],
  );

  useEffect(() => {
    if (!pendingTargetKey) return;
    const onPopState = () => clearOptimistic();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [pendingTargetKey, clearOptimistic]);

  const navigateEstudar = useCallback(
    (slugComQuery: string) => {
      const href = buildEstudarHref(slugComQuery);
      const targetKey = buildEstudarCacheKeyFromSlugComQuery(slugComQuery);
      const cached = cacheRef.current.get(targetKey);

      setPendingTargetKey(targetKey);
      if (cached) {
        setOptimisticPayload(cached);
        setIsNavigating(false);
      } else {
        setOptimisticPayload(null);
        setIsNavigating(true);
      }

      router.push(href);
    },
    [router],
  );

  const isOverlayActive = optimisticPayload !== null || isNavigating;

  const value = useMemo<QuestaoNavigationContextValue>(
    () => ({
      cachePayload,
      getCachedPayload,
      navigateEstudar,
      confirmServerArrival,
      pendingTargetKey,
      isOverlayActive,
    }),
    [
      cachePayload,
      getCachedPayload,
      navigateEstudar,
      confirmServerArrival,
      pendingTargetKey,
      isOverlayActive,
    ],
  );

  return (
    <QuestaoNavigationContext.Provider value={value}>
      <div className="flex flex-1 flex-col min-h-0 w-full relative">
        <div
          className={
            isOverlayActive
              ? 'invisible pointer-events-none absolute inset-0 overflow-hidden'
              : 'flex flex-1 flex-col min-h-0 w-full'
          }
          aria-hidden={isOverlayActive}
        >
          {children}
        </div>

        {isOverlayActive && (
          <div className="flex flex-1 flex-col min-h-0 w-full absolute inset-0 z-10 bg-[#010409] px-3 py-3 sm:px-4 md:px-6 md:py-6 pb-safe font-sans">
            <div className="flex flex-1 flex-col min-h-0 w-full max-w-6xl mx-auto">
              {optimisticPayload ? (
                <AvantLessonPlayer {...optimisticPayload} />
              ) : (
                <LessonPlayerSkeleton />
              )}
            </div>
          </div>
        )}
      </div>
    </QuestaoNavigationContext.Provider>
  );
}

export type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';
