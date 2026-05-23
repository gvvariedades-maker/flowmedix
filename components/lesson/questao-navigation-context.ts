'use client';

import { createContext, useContext } from 'react';
import type { AvantLessonPlayerProps } from '@/types/lesson';

export type EstudarQuestaoPayload = AvantLessonPlayerProps;

export type QuestaoNavigationContextValue = {
  cachePayload: (key: string, payload: EstudarQuestaoPayload) => void;
  getCachedPayload: (key: string) => EstudarQuestaoPayload | undefined;
  navigateEstudar: (slugComQuery: string) => void;
  confirmServerArrival: (key: string) => void;
  pendingTargetKey: string | null;
  isOverlayActive: boolean;
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
