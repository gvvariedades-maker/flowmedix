/**
 * Gate puro da UI de convicção — Evidence Engine Fase 1 (Lote 8).
 * Spec §1.5, §1.13: convicção só seria visível na coorte técnica/interna.
 *
 * Produto (2026-08): UI desligada para todos. O EE continua registrando
 * `conviction: 'unknown'` no confirm. A assinatura do gate permanece para
 * a rota `evidence-cohort` e testes de contrato.
 */

export type ShouldShowConvictionUiInput = {
  /** E-mail do usuário autenticado — nunca do body do cliente. */
  email?: string | null;
  instrumentationEnabled: boolean;
  /** Allowlist normalizada (lowercase) — spec §1.13 coorte interna/teste. */
  internalEmails: readonly string[];
};

/**
 * Sempre `false` — seletor Chutei / Entre duas / Tenho certeza retirado do player.
 * Fail closed; parâmetros mantidos só para compatibilidade da rota.
 */
export function shouldShowConvictionUi(_input: ShouldShowConvictionUiInput): boolean {
  return false;
}
