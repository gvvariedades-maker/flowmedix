'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NotebookActivationStatus } from '@/lib/cadernos/activation';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import type { ProSource } from '@/lib/freemium/constants';

export const CADERNO_BANNER_SNOOZE_KEY = 'avant.caderno.bannerSnoozeUntil';
export const CADERNO_BANNER_SNOOZE_MS = 24 * 60 * 60 * 1000;

export type CadernoBannerEdital = {
  banca: string | null;
};

export type ResolveCadernoBannerVisibleInput = {
  enabled: boolean;
  hydrated: boolean;
  isSnoozed: boolean;
  activation: NotebookActivationStatus;
  isAdmin: boolean;
  isPro: boolean;
  proSource: ProSource;
  welcomeOpen: boolean;
  questaoModalOpen: boolean;
  estudarQuestaoImmersive: boolean;
};

export function isCadernoBannerSnoozed(
  now: number,
  snoozeUntilRaw: string | null | undefined,
): boolean {
  if (!snoozeUntilRaw) return false;
  const until = Number(snoozeUntilRaw);
  if (!Number.isFinite(until)) return false;
  return now < until;
}

export function resolveCadernoBannerVisible(input: ResolveCadernoBannerVisibleInput): boolean {
  if (!input.enabled || !input.hydrated) return false;
  if (input.isSnoozed) return false;
  if (input.activation.hasNotebookWithItems) return false;
  if (input.isAdmin) return false;
  if (input.isPro && input.proSource === 'stripe') return false;
  if (input.welcomeOpen) return false;
  if (input.questaoModalOpen) return false;
  if (input.estudarQuestaoImmersive) return false;
  return true;
}

export function resolveCadernoBannerCta(activation: NotebookActivationStatus): {
  href: string;
  label: string;
} {
  if (activation.notebookCount === 0) {
    return { href: '/cadernos/novo?wizard=1', label: 'Criar caderno' };
  }
  return { href: '/cadernos', label: 'Adicionar questões' };
}

export type UseCadernoOnboardingInput = {
  enabled: boolean;
  initialActivation: NotebookActivationStatus;
  isAdmin: boolean;
  isPro: boolean;
  proSource: ProSource;
  welcomeOpen: boolean;
  questaoModalOpen: boolean;
  estudarQuestaoImmersive: boolean;
};

function readSnoozeState(now = Date.now()): boolean {
  try {
    return isCadernoBannerSnoozed(now, window.localStorage.getItem(CADERNO_BANNER_SNOOZE_KEY));
  } catch {
    return false;
  }
}

function persistSnooze(now = Date.now()) {
  try {
    window.localStorage.setItem(
      CADERNO_BANNER_SNOOZE_KEY,
      String(now + CADERNO_BANNER_SNOOZE_MS),
    );
  } catch {
    // Storage indisponível — snooze vale só na sessão via state.
  }
}

export function useCadernoOnboarding({
  enabled,
  initialActivation,
  isAdmin,
  isPro,
  proSource,
  welcomeOpen,
  questaoModalOpen,
  estudarQuestaoImmersive,
}: UseCadernoOnboardingInput) {
  const [hydrated, setHydrated] = useState(false);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [activation, setActivation] = useState(initialActivation);

  useEffect(() => {
    setActivation(initialActivation);
  }, [initialActivation]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setIsSnoozed(readSnoozeState());
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const snooze = useCallback(() => {
    persistSnooze();
    setIsSnoozed(true);
  }, []);

  const refreshActivation = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/notebooks/activation');
      if (!res.ok) return;
      const data = (await res.json()) as NotebookActivationStatus;
      setActivation(data);
    } catch {
      // Falha silenciosa — layout/cache atualizam no próximo refresh.
    }
  }, []);

  const isVisible = useMemo(
    () =>
      resolveCadernoBannerVisible({
        enabled,
        hydrated,
        isSnoozed,
        activation,
        isAdmin,
        isPro,
        proSource,
        welcomeOpen,
        questaoModalOpen,
        estudarQuestaoImmersive,
      }),
    [
      activation,
      enabled,
      estudarQuestaoImmersive,
      hydrated,
      isAdmin,
      isPro,
      isSnoozed,
      proSource,
      questaoModalOpen,
      welcomeOpen,
    ],
  );

  const cta = useMemo(() => resolveCadernoBannerCta(activation), [activation]);

  return useMemo(
    () => ({
      isVisible,
      activation,
      cta,
      snooze,
      refreshActivation,
    }),
    [activation, cta, isVisible, refreshActivation, snooze],
  );
}
