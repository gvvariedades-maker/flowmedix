'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useQuestaoNavigationOptional } from '@/components/lesson/questao-navigation-context';
import { shouldSkipEstudarPrefetch } from '@/lib/estudar/prefetchPolicy';

/** Atributo em cards da vitrine observados pelo IntersectionObserver. */
export const VITRINE_PREFETCH_DATA_ATTR = 'data-vitrine-slug-com-query';

const DEBOUNCE_MS = 150;
const MAX_VISIBLE_PREFETCH = 5;
const ROOT_MARGIN = '120px 0px';
const INTERSECTION_THRESHOLD = 0.1;

type UseVitrineVisiblePrefetchOptions = {
  /** Quando false, não observa (ex.: lista vazia ou Save-Data). */
  enabled?: boolean;
  /** Bump quando a página de grupos muda para re-observar nós novos. */
  observeKey?: string | number;
};

function sortElementsByViewportTop(elements: HTMLElement[]): HTMLElement[] {
  return [...elements].sort((a, b) => {
    const topA = a.getBoundingClientRect().top;
    const topB = b.getBoundingClientRect().top;
    return topA - topB;
  });
}

/**
 * Prefetch das primeiras questões de assuntos visíveis na vitrine (scroll).
 * Usa `firstSlug` + `estudarQuery` em `[data-vitrine-slug-com-query]` nos cards.
 * Debounce 150 ms; no máximo 5 prefetches por flush.
 */
export function useVitrineVisiblePrefetch(
  listRootRef: RefObject<Element | null>,
  options: UseVitrineVisiblePrefetchOptions = {},
): void {
  const nav = useQuestaoNavigationOptional();
  const prefetchedRef = useRef(new Set<string>());
  const { enabled = true, observeKey = 0 } = options;

  useEffect(() => {
    prefetchedRef.current.clear();
  }, [observeKey]);

  useEffect(() => {
    if (!enabled || !nav || shouldSkipEstudarPrefetch()) return;

    const root = listRootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const visibleElements = new Set<HTMLElement>();

    const flush = () => {
      debounceTimer = undefined;
      const ordered = sortElementsByViewportTop([...visibleElements]);
      let count = 0;

      for (const el of ordered) {
        if (count >= MAX_VISIBLE_PREFETCH) break;
        const key = el.dataset.vitrineSlugComQuery?.trim();
        if (!key || prefetchedRef.current.has(key)) continue;
        prefetchedRef.current.add(key);
        nav.prefetchEstudar(key);
        count += 1;
      }
    };

    const scheduleFlush = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(flush, DEBOUNCE_MS);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            visibleElements.add(el);
          } else {
            visibleElements.delete(el);
          }
        }
        scheduleFlush();
      },
      { root: null, rootMargin: ROOT_MARGIN, threshold: INTERSECTION_THRESHOLD },
    );

    const observeNodes = () => {
      root
        .querySelectorAll(`[${VITRINE_PREFETCH_DATA_ATTR}]`)
        .forEach((node) => observer.observe(node));
    };

    observeNodes();

    const mutationObserver = new MutationObserver(() => {
      observer.disconnect();
      visibleElements.clear();
      observeNodes();
    });
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
      mutationObserver.disconnect();
      visibleElements.clear();
    };
  }, [enabled, nav, listRootRef, observeKey]);
}
