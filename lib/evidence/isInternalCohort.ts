/**
 * Derivação server-side de `is_internal` (spec §1.9, §1.13).
 * Nunca confiar em flag do body do cliente.
 */

import { isEvidenceV1InternalEmail } from '@/lib/env';

export type ResolveIsInternalInput = {
  user_email?: string | null;
  /**
   * Rota E2E com bypass ativo (Lote 5) — eventos excluídos de experimentos.
   * Caller passa após detectar bypass server-side; não ler do body.
   */
  e2e_instrumentation?: boolean;
  /**
   * Override somente em testes unitários — rotas usam env via isEvidenceV1InternalEmail.
   */
  internal_emails_override?: readonly string[];
};

/**
 * Coorte interna: allowlist `EE_V1_INTERNAL_EMAILS` ou marcação E2E explícita.
 * Fail closed: default `false`.
 */
export function resolveIsInternalForAttempt(input: ResolveIsInternalInput): boolean {
  if (input.e2e_instrumentation === true) {
    return true;
  }
  if (input.internal_emails_override) {
    if (!input.user_email?.trim()) return false;
    return input.internal_emails_override.includes(input.user_email.trim().toLowerCase());
  }
  return isEvidenceV1InternalEmail(input.user_email);
}
