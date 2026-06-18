import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export type UserPreferencesOnboardingRow = {
  user_id: string;
  topicos_afinidade: string[];
  topicos_dificuldade: string[];
  carga_horaria_semanal: number | null;
  bancas_foco: string[];
  created_at: string;
  updated_at: string;
};

export type OnboardingPreferencesStatus = {
  completed: boolean;
  preferences: UserPreferencesOnboardingRow | null;
};

export function getEmptyOnboardingPreferencesStatus(): OnboardingPreferencesStatus {
  return { completed: false, preferences: null };
}

export async function getUserPreferencesOnboarding(
  userId: string,
): Promise<OnboardingPreferencesStatus> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from('user_preferences_onboarding')
    .select(
      'user_id, topicos_afinidade, topicos_dificuldade, carga_horaria_semanal, bancas_foco, created_at, updated_at',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao buscar preferências de onboarding', error, { userId });
    throw error;
  }

  return {
    completed: data != null,
    preferences: data,
  };
}
