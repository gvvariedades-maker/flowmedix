/**
 * Versão do contrato de escrita unificado (Supabase + Laboratório + apply-lote gate).
 * Distinto de meta.content_standard ("golden-v1") nos exemplos de referência.
 *
 * @see docs/GOLDEN_CONTENT_STANDARD.md §11
 * @see lib/questaoSpec/validateQuestaoForWrite.ts
 */
export const QUESTAO_WRITE_SPEC_VERSION = 'golden-v2' as const;

export type QuestaoWriteSpecVersion = typeof QUESTAO_WRITE_SPEC_VERSION;
