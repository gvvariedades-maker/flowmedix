/**
 * Gate puro da UI de convicção — Evidence Engine Fase 1 (Lote 8).
 * Spec §1.5, §1.13: convicção só é visível na coorte técnica/interna,
 * e só quando a instrumentação está ligada.
 *
 * Sem I/O — o caller (rota `evidence-cohort`) resolve `instrumentationEnabled`
 * via `isEvidenceV1InstrumentationEnabled()` e `internalEmails` via
 * `getEvidenceV1InternalEmails()` (lib/env.ts).
 */

export type ShouldShowConvictionUiInput = {
  /** E-mail do usuário autenticado — nunca do body do cliente. */
  email?: string | null;
  instrumentationEnabled: boolean;
  /** Allowlist normalizada (lowercase) — spec §1.13 coorte interna/teste. */
  internalEmails: readonly string[];
};

/**
 * Verdadeiro somente quando a instrumentação está ligada **e** o e-mail do
 * usuário está na allowlist da coorte interna. Fail closed em qualquer
 * ambiguidade (sem e-mail, flag off, allowlist vazia).
 */
export function shouldShowConvictionUi(input: ShouldShowConvictionUiInput): boolean {
  if (!input.instrumentationEnabled) return false;
  const email = input.email?.trim().toLowerCase();
  if (!email) return false;
  if (input.internalEmails.length === 0) return false;
  return input.internalEmails.some((allowed) => allowed.trim().toLowerCase() === email);
}
