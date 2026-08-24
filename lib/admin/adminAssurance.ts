import type { SupabaseClient } from '@supabase/supabase-js';

export type AdminMfaAssuranceState =
  | 'NO_MFA_FACTOR'
  | 'MFA_CHALLENGE_REQUIRED'
  | 'AAL2_VERIFIED'
  | 'FAIL_CLOSED';

export interface AdminMfaAssuranceResult {
  state: AdminMfaAssuranceState;
  currentLevel: 'aal1' | 'aal2' | null;
  nextLevel: 'aal1' | 'aal2' | null;
  error?: string;
}

/**
 * Mapeia os níveis de assurance do Supabase Auth para os estados canônicos do AVANT.
 *
 * Mapeamento canônico:
 * - currentLevel === 'aal2' -> 'AAL2_VERIFIED'
 * - currentLevel === 'aal1' && nextLevel === 'aal2' -> 'MFA_CHALLENGE_REQUIRED'
 * - currentLevel === 'aal1' && (nextLevel === 'aal1' || !nextLevel) -> 'NO_MFA_FACTOR'
 * - qualquer outro estado / erro / null -> 'FAIL_CLOSED'
 */
export function mapAssuranceLevelToState(
  currentLevel: string | null | undefined,
  nextLevel: string | null | undefined,
): AdminMfaAssuranceState {
  if (currentLevel === 'aal2') {
    return 'AAL2_VERIFIED';
  }
  if (currentLevel === 'aal1') {
    if (nextLevel === 'aal2') {
      return 'MFA_CHALLENGE_REQUIRED';
    }
    if (nextLevel === 'aal1' || !nextLevel) {
      return 'NO_MFA_FACTOR';
    }
  }
  return 'FAIL_CLOSED';
}

/**
 * Consulta a API oficial do Supabase Auth para determinar o estado de MFA da sessão.
 * Trata erros de rede ou retorno inesperado em modo estrito FAIL-CLOSED.
 */
export async function getAdminAssuranceLevel(
  supabase: SupabaseClient,
): Promise<AdminMfaAssuranceResult> {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || !data) {
      return {
        state: 'FAIL_CLOSED',
        currentLevel: null,
        nextLevel: null,
        error: error?.message ?? 'Dados de assurance ausentes',
      };
    }

    const state = mapAssuranceLevelToState(data.currentLevel, data.nextLevel);
    return {
      state,
      currentLevel: (data.currentLevel as 'aal1' | 'aal2') || null,
      nextLevel: (data.nextLevel as 'aal1' | 'aal2') || null,
    };
  } catch (err: unknown) {
    return {
      state: 'FAIL_CLOSED',
      currentLevel: null,
      nextLevel: null,
      error: err instanceof Error ? err.message : 'Erro ao obter nível de assurance',
    };
  }
}
