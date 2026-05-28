'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useSimuladoSession } from '@/hooks/useSimuladoSession';
import { useSimuladoQuestionCache } from '@/hooks/useSimuladoQuestionCache';
import { getSimuladoPrefetchSlugs } from '@/lib/simulado/questionNavigation';
import type { SimuladoQuestionSlim } from '@/hooks/useSimuladoQuestionCache';
import type { SimuladoAnswerResponse, SimuladoSessionDetailResponse } from '@/lib/simulado/types';

type SimuladoSessionContextValue = {
  sessionId: string;
  sessionData: SimuladoSessionDetailResponse | null;
  loadingSession: boolean;
  sessionError: string | null;
  loadSession: () => Promise<SimuladoSessionDetailResponse | null>;
  applyAnswerPatchToSession: (answer: SimuladoAnswerResponse) => void;
  getCachedQuestion: (slug: string) => SimuladoQuestionSlim | undefined;
  loadQuestion: (slug: string) => Promise<SimuladoQuestionSlim>;
};

const SimuladoSessionContext = createContext<SimuladoSessionContextValue | null>(null);

export type SimuladoSessionProviderProps = {
  sessionId: string;
  initialSession?: SimuladoSessionDetailResponse | null;
  activeSlug: string | null;
  children: ReactNode;
};

export function SimuladoSessionProvider({
  sessionId,
  initialSession = null,
  activeSlug,
  children,
}: SimuladoSessionProviderProps) {
  const {
    sessionData,
    loadingSession,
    sessionError,
    loadSession,
    applyAnswerPatchToSession,
  } = useSimuladoSession({
    sessionId,
    initialSession,
    skipInitialLoad: Boolean(initialSession),
  });

  const prefetchTargets = useMemo(
    () => (sessionData ? getSimuladoPrefetchSlugs(sessionData.questoes, activeSlug ?? '', 2) : []),
    [sessionData, activeSlug],
  );

  const { getCached, loadQuestion } = useSimuladoQuestionCache({
    activeSlug,
    prefetchTargets,
  });

  const value = useMemo<SimuladoSessionContextValue>(
    () => ({
      sessionId,
      sessionData,
      loadingSession,
      sessionError,
      loadSession,
      applyAnswerPatchToSession,
      getCachedQuestion: getCached,
      loadQuestion,
    }),
    [
      sessionId,
      sessionData,
      loadingSession,
      sessionError,
      loadSession,
      applyAnswerPatchToSession,
      getCached,
      loadQuestion,
    ],
  );

  return (
    <SimuladoSessionContext.Provider value={value}>{children}</SimuladoSessionContext.Provider>
  );
}

export function useSimuladoSessionContext(): SimuladoSessionContextValue {
  const ctx = useContext(SimuladoSessionContext);
  if (!ctx) {
    throw new Error('useSimuladoSessionContext deve ser usado dentro de SimuladoSessionProvider');
  }
  return ctx;
}
