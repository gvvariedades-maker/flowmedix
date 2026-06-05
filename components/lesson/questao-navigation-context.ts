'use client';

import { createContext, useContext } from 'react';
import type { EstudarRouteSnapshot, EstudarVitrineReturnContext } from '@/lib/estudar/navigation';
import type { AvantLessonPlayerProps } from '@/types/lesson';

export type EstudarQuestaoPayload = AvantLessonPlayerProps;

export type QuestaoNavigationContextValue = {
  displayPayload: EstudarQuestaoPayload | null;
  setDisplayPayload: (payload: EstudarQuestaoPayload | null) => void;
  cachePayload: (key: string, payload: EstudarQuestaoPayload) => void;
  getCachedPayload: (key: string) => EstudarQuestaoPayload | undefined;
  /** `true` quando o payload foi aplicado; `false` em forbidden/erro/cancelado ou navegação em andamento. */
  navigateEstudar: (slugComQuery: string) => Promise<boolean>;
  prefetchEstudar: (slugComQuery: string) => void;
  prefetchPayload: (slugComQuery: string) => void;
  /** Fecha questão e volta à vitrine (replace — evita reabrir pelo sync de URL). */
  dismissToVitrine: (ctx?: EstudarVitrineReturnContext) => void;
  /** True entre dismiss e a URL voltar para `/estudar` (evita skeleton e re-hidratação). */
  isDismissingToVitrine: boolean;
  /** Rota efetiva do player (soft nav); quando null, use `usePathname` / `useSearchParams`. */
  estudarRoute: EstudarRouteSnapshot | null;
};

export const QuestaoNavigationContext =
  createContext<QuestaoNavigationContextValue | null>(null);

export function useQuestaoNavigation(): QuestaoNavigationContextValue {
  const ctx = useContext(QuestaoNavigationContext);
  if (!ctx) {
    throw new Error('useQuestaoNavigation must be used within QuestaoNavigationProvider');
  }
  return ctx;
}

export function useQuestaoNavigationOptional(): QuestaoNavigationContextValue | null {
  return useContext(QuestaoNavigationContext);
}
