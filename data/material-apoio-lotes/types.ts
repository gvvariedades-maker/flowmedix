/**
 * Especificação de um “microtópico” de slide do Material de Apoio
 * (conteúdo clínico/legislativo a ser preenchido no formato NeuroSlide).
 */
export type MaterialApoioLoteItem = {
  /** Número global 1..52, estável (use para rastreio/PRs) */
  id: number;
  /** Lote 1..7 (cada lote: 8 itens, exceto o 7 = 4 itens) */
  lote: number;
  /** Ordem dentro do lote (1..8 ou 1..4) */
  ordemNoLote: number;
  categoria: string;
  /** Título/ângulo de estudo (prova) */
  titulo: string;
};

export const LOTE_1_SIZE = 8;
export const LOTE_2_SIZE = 8;
export const LOTE_3_SIZE = 8;
export const LOTE_4_SIZE = 8;
export const LOTE_5_SIZE = 8;
export const LOTE_6_SIZE = 8;
export const LOTE_7_SIZE = 4;
export const TOTAL_LOTES = 7;
export const TOTAL_ITENS = 52;
