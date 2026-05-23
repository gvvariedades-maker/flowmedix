import type { QuestaoDoAssunto } from '@/types/lesson';

/** Raio em torno da questão atual: janela máxima = 2 * radius + 1 (101). */
export const QUESTAO_NAV_WINDOW_RADIUS = 50;

export const QUESTAO_NAV_WINDOW_MAX =
  QUESTAO_NAV_WINDOW_RADIUS * 2 + 1;

export type QuestaoDoAssuntoComIndice = QuestaoDoAssunto & {
  /** Posição 1-based na lista completa do contexto de navegação. */
  indice: number;
};

/**
 * Fatia a lista completa para envio ao client (dots), mantendo ~101 itens
 * centrados no índice atual quando possível.
 */
export function sliceQuestoesNavWindow(
  fullList: QuestaoDoAssunto[],
  currentIndex: number,
  radius: number = QUESTAO_NAV_WINDOW_RADIUS,
): QuestaoDoAssuntoComIndice[] {
  const len = fullList.length;
  if (len === 0) return [];

  const maxWindow = radius * 2 + 1;
  if (len <= maxWindow) {
    return fullList.map((item, i) => ({ ...item, indice: i + 1 }));
  }

  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  let start = Math.max(0, safeIndex - radius);
  let end = Math.min(len, start + maxWindow);
  if (end - start < maxWindow) {
    start = Math.max(0, end - maxWindow);
  }

  return fullList.slice(start, end).map((item, i) => ({
    ...item,
    indice: start + i + 1,
  }));
}
