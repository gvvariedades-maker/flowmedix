'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import {
  buildEstudarCacheKey,
  parseEstudarSlugFromPathname,
} from '@/lib/estudar/navigation';

export function useEstudarQuestaoShellState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { displayPayload } = useQuestaoNavigation();

  const slugFromPath = parseEstudarSlugFromPathname(pathname);
  const isQuestaoRoute = slugFromPath !== null;

  const routeCacheKey = isQuestaoRoute
    ? buildEstudarCacheKey(pathname, searchParams)
    : '';

  const payloadCacheKey =
    displayPayload?.moduloSlug != null
      ? buildEstudarCacheKey(
          `/estudar/${displayPayload.moduloSlug}`,
          (displayPayload.vitrineQuerySuffix ?? '').replace(/^\?/, ''),
        )
      : '';

  const payloadMatchesRoute =
    Boolean(displayPayload) && routeCacheKey === payloadCacheKey;

  /** Mantém o player montado entre slugs quando há payload em memória (passo 4.3). */
  const showPlayer = isQuestaoRoute && Boolean(displayPayload);
  const showSkeleton = isQuestaoRoute && !displayPayload;
  const isPayloadStale = showPlayer && !payloadMatchesRoute;

  return {
    isQuestaoRoute,
    showPlayer,
    showSkeleton,
    isPayloadStale,
    displayPayload: showPlayer ? displayPayload : null,
  };
}
