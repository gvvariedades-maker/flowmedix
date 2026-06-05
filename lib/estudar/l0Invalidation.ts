/**
 * Constantes compartilhadas para invalidação L0 (IndexedDB + Service Worker).
 */

/** Chave localStorage — fingerprint do catálogo vindo de `/api/estudar/l0-meta`. */
export const ESTUDAR_L0_GEN_STORAGE_KEY = 'avant-estudar-l0-generation';

/** Mensagem postMessage → Service Worker (`public/sw.js`). */
export const ESTUDAR_L0_SW_CLEAR_MESSAGE = 'AVANT_CLEAR_ESTUDAR_L0';

export type EstudarL0Meta = {
  generation: string;
};
