/**
 * Orçamento de clique — protocolos sequenciais (XABCDE, RCP, ADME/farmaco).
 * Onda 4 · docs/NEUROSLIDES_VISUAL_STRATEGY.md Camada 4.
 *
 * Funil / eliminação sequencial → tap com ≤3 steps úteis.
 * Conteúdo com 4+ steps é condensado: cabeça + síntese do restante.
 */

export const PROTOCOL_TAP_BUDGET = 3;

/**
 * Reduz steps de logic_flow ao orçamento de protocolo.
 * Não inventa texto clínico — só concatena o restante com " · ".
 */
export function applyProtocolTapBudget(
  steps: string[],
  budget: number = PROTOCOL_TAP_BUDGET,
): string[] {
  if (budget < 1) return steps;
  if (steps.length <= budget) return steps;
  if (budget === 1) {
    return [steps.join(' · ')];
  }
  const head = steps.slice(0, budget - 1);
  const rest = steps.slice(budget - 1);
  return [...head, rest.join(' · ')];
}
