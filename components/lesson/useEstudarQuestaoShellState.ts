'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import { estudarPayloadMatchesRoute } from '@/lib/estudar/payloadRouteMatch';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';

type UseEstudarQuestaoShellStateOptions = {
  /** Quando true, o player fica no slot @modal (fase 11.2). */
  modalActive?: boolean;
};

export function useEstudarQuestaoShellState(options: UseEstudarQuestaoShellStateOptions = {}) {
  const { modalActive = false } = options;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { displayPayload, isDismissingToVitrine, estudarRoute } = useQuestaoNavigation();

  /** URL real da vitrine prevalece sobre soft-nav pendente (volta /estudar → ?). */
  const isVitrineListing = parseEstudarSlugFromPathname(pathname) === null;
  const effectivePathname = isVitrineListing
    ? pathname
    : (estudarRoute?.pathname ?? pathname);
  const effectiveSearchParams = isVitrineListing
    ? searchParams
    : estudarRoute
      ? new URLSearchParams(estudarRoute.search.replace(/^\?/, ''))
      : searchParams;

  const slugFromPath = parseEstudarSlugFromPathname(effectivePathname);
  const isQuestaoRoute = slugFromPath !== null;

  const payloadMatchesRoute =
    isQuestaoRoute &&
    estudarPayloadMatchesRoute(displayPayload, effectivePathname, effectiveSearchParams);

  /** Mantém o player montado entre slugs quando há payload em memória (passo 4.3). */
  const showPlayer = isQuestaoRoute && Boolean(displayPayload) && !modalActive;
  const showSkeleton =
    isQuestaoRoute && !displayPayload && !modalActive && !isDismissingToVitrine;
  /** Modal @modal: overlay com skeleton enquanto hidrata (evita vitrine inerte). */
  const showModalLoading =
    modalActive && isQuestaoRoute && !displayPayload && !isDismissingToVitrine;
  const isPayloadStale = showPlayer && !payloadMatchesRoute;

  return {
    isQuestaoRoute,
    showPlayer,
    showSkeleton,
    showModalLoading,
    isPayloadStale,
    isDismissingToVitrine,
    displayPayload: showPlayer ? displayPayload : null,
  };
}
