'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import {
  estudarPayloadMatchesRoute,
} from '@/lib/estudar/payloadRouteMatch';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';

/**
 * `true` enquanto a URL efetiva diverge do payload em memória (soft nav / fetch pendente).
 * Usado para desabilitar dots e Próxima/Anterior no player.
 */
export function useEstudarPayloadStale(): boolean {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { displayPayload, estudarRoute } = useQuestaoNavigation();

  if (!displayPayload) return false;

  const isVitrineListing = parseEstudarSlugFromPathname(pathname) === null;
  const effectivePathname = isVitrineListing
    ? pathname
    : (estudarRoute?.pathname ?? pathname);
  const effectiveSearchParams = isVitrineListing
    ? searchParams
    : estudarRoute
      ? new URLSearchParams(estudarRoute.search.replace(/^\?/, ''))
      : searchParams;

  return !estudarPayloadMatchesRoute(
    displayPayload,
    effectivePathname,
    effectiveSearchParams,
  );
}
