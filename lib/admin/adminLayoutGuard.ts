import type { User } from '@supabase/supabase-js';
import type { AdminMfaAssuranceState } from './adminAssurance';

export interface ResolveAdminLayoutRedirectOptions {
  user: User | null;
  isAdmin: boolean;
  assuranceState: AdminMfaAssuranceState;
  currentPath?: string | null;
  bypassEnabled?: boolean;
}

/**
 * Determina o destino de redirecionamento para o layout administrativo do AVANT.
 *
 * Garante que:
 * - Usuários sem sessão vão para `/login`.
 * - Usuários autenticados que não estão na allowlist admin vão para `/`.
 * - Admins sem fator TOTP (`NO_MFA_FACTOR`) vão para `/admin/mfa-setup` (sem loop se já estiverem nela).
 * - Admins com fator pendente de verificação (`MFA_CHALLENGE_REQUIRED`) vão para `/admin/mfa-challenge` (sem loop).
 * - Admins com AAL2 verificado (`AAL2_VERIFIED`) têm acesso total ao painel.
 * - Estados desconhecidos ou erros (`FAIL_CLOSED`) falham fechados redirecionando para `/login`.
 */
export function resolveAdminLayoutRedirect({
  user,
  isAdmin,
  assuranceState,
  currentPath,
  bypassEnabled = false,
}: ResolveAdminLayoutRedirectOptions): string | null {
  if (bypassEnabled) {
    return null;
  }

  if (!user?.email) {
    return '/login';
  }

  if (!isAdmin) {
    return '/';
  }

  const normalizedPath = (currentPath || '').split('?')[0].replace(/\/+$/, '') || '/admin';

  if (assuranceState === 'NO_MFA_FACTOR') {
    if (normalizedPath === '/admin/mfa-setup') {
      return null;
    }
    return '/admin/mfa-setup';
  }

  if (assuranceState === 'MFA_CHALLENGE_REQUIRED') {
    if (normalizedPath === '/admin/mfa-challenge') {
      return null;
    }
    return '/admin/mfa-challenge';
  }

  if (assuranceState === 'AAL2_VERIFIED') {
    if (normalizedPath === '/admin/mfa-setup' || normalizedPath === '/admin/mfa-challenge') {
      return '/admin';
    }
    return null;
  }

  // FAIL_CLOSED
  return '/login';
}
