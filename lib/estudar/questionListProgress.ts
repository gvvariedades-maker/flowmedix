/** Largura mínima visual da barra (questão 1 de listas longas ainda mostra faixa verde). */
export const QUESTION_LIST_PROGRESS_MIN_VISUAL_PERCENT = 3;

/** Percentual exato da posição na lista (0–100). */
export function computeQuestionListProgressPercent(atual: number, total: number): number {
  if (total <= 0 || atual <= 0) return 0;
  return Math.min(100, Math.max(0, (atual / total) * 100));
}

/**
 * Percentual para `width` da barra — nunca menor que o mínimo visual, exceto no 0%.
 * `aria-valuenow` deve usar `atual`/`total`, não este valor.
 */
export function computeQuestionListProgressVisualPercent(atual: number, total: number): number {
  const exact = computeQuestionListProgressPercent(atual, total);
  if (exact <= 0) return 0;
  return Math.min(100, Math.max(QUESTION_LIST_PROGRESS_MIN_VISUAL_PERCENT, exact));
}
