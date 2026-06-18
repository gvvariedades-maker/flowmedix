'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import type { OnboardingPreferencesStatus } from '@/lib/onboarding/preferences';

export function useOnboardingOnAccess({
  enabled,
  initialCompleted,
}: {
  enabled: boolean;
  initialCompleted: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [completed, setCompleted] = useState(initialCompleted);

  useEffect(() => {
    setCompleted(initialCompleted);
  }, [initialCompleted]);

  useEffect(() => {
    if (!enabled || completed) return;
    const id = window.setTimeout(() => setIsOpen(true), 400);
    return () => window.clearTimeout(id);
  }, [completed, enabled]);

  const markCompleted = useCallback(() => {
    setCompleted(true);
    setIsOpen(false);
  }, []);

  const closeWithoutCompleting = useCallback(() => {
    setIsOpen(false);
  }, []);

  return useMemo(
    () => ({
      isOpen: enabled && isOpen && !completed,
      completed,
      markCompleted,
      closeWithoutCompleting,
    }),
    [closeWithoutCompleting, completed, enabled, isOpen, markCompleted],
  );
}

export async function fetchOnboardingPreferencesStatus(): Promise<OnboardingPreferencesStatus> {
  const res = await fetchWithAuth('/api/aluno/preferences');
  if (!res.ok) {
    throw new Error('Falha ao carregar preferências');
  }
  return res.json() as Promise<OnboardingPreferencesStatus>;
}

export async function saveOnboardingPreferences(payload: {
  topicos_afinidade: string[];
  topicos_dificuldade: string[];
  bancas_foco: string[];
  carga_horaria_semanal?: number | null;
}) {
  const res = await fetchWithAuth('/api/aluno/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Falha ao salvar preferências');
  }

  return res.json();
}
