'use client';

import { createContext, useContext } from 'react';
import type { EstudarVitrineReturnContext } from '@/lib/estudar/navigation';
import type { AvantLessonPlayerProps } from '@/types/lesson';

export type EstudarQuestaoPayload = AvantLessonPlayerProps;

export type QuestaoNavigationContextValue = {
  displayPayload: EstudarQuestaoPayload | null;
  setDisplayPayload: (payload: EstudarQuestaoPayload | null) => void;
  cachePayload: (key: string, payload: EstudarQuestaoPayload) => void;
  getCachedPayload: (key: string) => EstudarQuestaoPayload | undefined;
  navigateEstudar: (slugComQuery: string) => void;
  prefetchEstudar: (slugComQuery: string) => void;
  prefetchPayload: (slugComQuery: string) => void;
  /** Fecha questão e volta à vitrine (replace — evita reabrir pelo sync de URL). */
  dismissToVitrine: (ctx?: EstudarVitrineReturnContext) => void;
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
