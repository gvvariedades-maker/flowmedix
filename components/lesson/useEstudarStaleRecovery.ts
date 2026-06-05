'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import { useEstudarPayloadStale } from '@/components/lesson/useEstudarPayloadStale';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';

/** Tempo com payload divergente da URL antes de tentar re-fetch (fase 1.2). */
export const ESTUDAR_STALE_RECOVERY_MS = 3_000;

type RecoveryPhase = 'idle' | 'waiting' | 'refetched';

/**
 * Recupera quando `payloadStale` persiste: após 3s re-busca pela URL do browser;
 * se ainda divergir (ou a API falhar), `router.refresh()` para re-hidratar via RSC.
 */
export function useEstudarStaleRecovery(): void {
  const router = useRouter();
  const payloadStale = useEstudarPayloadStale();
  const { refetchRoutePayload, isDismissingToVitrine } = useQuestaoNavigation();
  const phaseRef = useRef<RecoveryPhase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!payloadStale) {
      phaseRef.current = 'idle';
      return;
    }

    if (isDismissingToVitrine || typeof window === 'undefined') return;

    const slug = parseEstudarSlugFromPathname(window.location.pathname);
    if (!slug) return;

    if (phaseRef.current === 'refetched') {
      phaseRef.current = 'idle';
      router.refresh();
      return;
    }

    if (phaseRef.current === 'waiting') return;

    phaseRef.current = 'waiting';
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const slugComQuery = `${slug}${window.location.search}`;

      void (async () => {
        const result = await refetchRoutePayload(slugComQuery, { skipCache: true });
        phaseRef.current = 'refetched';

        if (result !== 'ok') {
          phaseRef.current = 'idle';
          router.refresh();
        }
      })();
    }, ESTUDAR_STALE_RECOVERY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [payloadStale, isDismissingToVitrine, refetchRoutePayload, router]);
}
