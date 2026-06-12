'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  CATALOG_STATS_COUNT_UP_MS,
  hasVitrineCatalogStatsSeen,
  interpolateCatalogCount,
  markVitrineCatalogStatsSeen,
} from '@/lib/vitrine/catalogStatsAnimation';

type CatalogStatsValues = {
  totalQuestions: number;
  totalSlides: number;
};

export type UseCatalogStatsCountUpResult = CatalogStatsValues & {
  /** Animação concluída ou pulada (visitante recorrente). */
  ready: boolean;
  /** `true` quando a animação count-up está ativa nesta sessão. */
  animating: boolean;
};

/**
 * Count-up 600 ms na 1ª visita (`avant.vitrine.statsSeen`); depois exibe valores finais.
 */
export function useCatalogStatsCountUp(
  targetQuestions: number,
  targetSlides: number,
): UseCatalogStatsCountUpResult {
  const targetsRef = useRef({ q: targetQuestions, s: targetSlides });
  targetsRef.current = { q: targetQuestions, s: targetSlides };

  const [values, setValues] = useState<CatalogStatsValues>(() => ({
    totalQuestions: targetQuestions,
    totalSlides: targetSlides,
  }));
  const [ready, setReady] = useState(false);
  const [animating, setAnimating] = useState(false);

  useLayoutEffect(() => {
    if (hasVitrineCatalogStatsSeen()) {
      setValues({ totalQuestions: targetQuestions, totalSlides: targetSlides });
      setReady(true);
      setAnimating(false);
      return;
    }

    setValues({ totalQuestions: 0, totalSlides: 0 });
    setAnimating(true);
    setReady(false);
  }, [targetQuestions, targetSlides]);

  useEffect(() => {
    if (hasVitrineCatalogStatsSeen()) return;

    let start: number | null = null;
    let raf = 0;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = (timestamp - start) / CATALOG_STATS_COUNT_UP_MS;
      const { q, s } = targetsRef.current;

      setValues({
        totalQuestions: interpolateCatalogCount(q, progress),
        totalSlides: interpolateCatalogCount(s, progress),
      });

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      setValues({ totalQuestions: q, totalSlides: s });
      markVitrineCatalogStatsSeen();
      setAnimating(false);
      setReady(true);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetQuestions, targetSlides]);

  return {
    totalQuestions: values.totalQuestions,
    totalSlides: values.totalSlides,
    ready,
    animating,
  };
}
