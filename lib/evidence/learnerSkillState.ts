/**
 * Estados de competência do aluno — Fase 4 (docs/DECISAO_EVIDENCE_ENGINE.md §12, §13).
 *
 * `learner_skill_state` é uma projeção derivada, **não ativada no produto**
 * (ADR §3, nota do diagrama). Este módulo só fornece funções puras de
 * transição para uso em laboratório/testes — nenhum wiring em
 * recommendations.ts, cache, ou qualquer rota.
 *
 * Nomenclatura dos 5 estados (pt-BR) usada nesta fundação, com mapeamento
 * conceitual para os 8 estados auditáveis do ADR §12 (a nomenclatura final /
 * granularidade fica na spec operacional — este comentário documenta a
 * correspondência assumida aqui):
 *
 *   desconhecido     ~ UNKNOWN | DIAGNOSED (misconception identificada, sem aquisição)
 *   adquirido        ~ TRANSFERRED (aquisição via T1, ainda não consolidada)
 *   em_consolidacao  ~ FRAGILE | RECOVERING | CONSOLIDATING
 *   dominado         ~ MASTERED
 *   em_risco         ~ AT_RISK
 */

export const LEARNER_SKILL_STATES = [
  'desconhecido',
  'adquirido',
  'em_consolidacao',
  'dominado',
  'em_risco',
] as const;
export type LearnerSkillState = (typeof LEARNER_SKILL_STATES)[number];

/**
 * Eventos pedagógicos que podem alterar o estado (ADR §12 tabela de
 * transições + §13 separação aquisição × retenção × transferência).
 */
export const LEARNER_SKILL_EVENT_TYPES = [
  'acertou_com_chute',
  'errou_com_certeza',
  'concluiu_neuroslides',
  'acertou_transferencia_imediata',
  'errou_transferencia_imediata',
  'acertou_revisao_inedita',
  'medicao_holdout',
  'nova_evidencia_segura_separada_no_tempo',
  'erro_apos_dominio_ou_consolidacao',
] as const;
export type LearnerSkillEventType = (typeof LEARNER_SKILL_EVENT_TYPES)[number];

export type LearnerSkillEvent = { type: LearnerSkillEventType };

/**
 * Eventos que **nunca** alteram o estado, por invariante do ADR:
 * - `concluiu_neuroslides`: consumo de slide atualiza só `content_consumed` (§13).
 * - `medicao_holdout`: outcome experimental neutro; não atualiza domínio (§13, §15, §18).
 */
const NO_OP_EVENTS: ReadonlySet<LearnerSkillEventType> = new Set([
  'concluiu_neuroslides',
  'medicao_holdout',
]);

/**
 * Próximo estado por tipo de evento (ADR §12, tabela "Transições principais").
 * A tabela do ADR é orientada a evento (não depende do estado corrente) —
 * mantemos essa semântica aqui; o caller só dispara
 * `erro_apos_dominio_ou_consolidacao` quando o contexto real corresponde
 * (função pura não valida pré-condição de negócio).
 */
const EVENT_TO_NEXT_STATE: Record<
  Exclude<LearnerSkillEventType, 'concluiu_neuroslides' | 'medicao_holdout'>,
  LearnerSkillState
> = {
  acertou_com_chute: 'em_consolidacao',
  errou_com_certeza: 'desconhecido',
  acertou_transferencia_imediata: 'adquirido',
  errou_transferencia_imediata: 'em_consolidacao',
  acertou_revisao_inedita: 'em_consolidacao',
  nova_evidencia_segura_separada_no_tempo: 'dominado',
  erro_apos_dominio_ou_consolidacao: 'em_risco',
};

/**
 * Transição pura de estado. Determinístico: mesmo `(current, event)` sempre
 * produz o mesmo próximo estado.
 */
export function transitionLearnerSkillState(
  current: LearnerSkillState,
  event: LearnerSkillEvent,
): LearnerSkillState {
  if (NO_OP_EVENTS.has(event.type)) {
    return current;
  }
  return EVENT_TO_NEXT_STATE[
    event.type as Exclude<LearnerSkillEventType, 'concluiu_neuroslides' | 'medicao_holdout'>
  ];
}

/**
 * Aplica uma sequência de eventos em ordem, retornando o estado final.
 * Útil em testes e em replays de laboratório (nunca em produto ao vivo).
 */
export function replayLearnerSkillEvents(
  initial: LearnerSkillState,
  events: readonly LearnerSkillEvent[],
): LearnerSkillState {
  return events.reduce(
    (state, event) => transitionLearnerSkillState(state, event),
    initial,
  );
}

/**
 * Invariante ADR §12: uma única transferência (T1) nunca deve, por si só,
 * produzir `dominado`. Verificação auxiliar para testes/laboratório — detecta
 * violação quando uma sequência contém exatamente um evento de T1 correto e
 * nenhuma outra evidência, mas o estado final é `dominado`.
 */
export function violatesSingleT1MasteryInvariant(
  events: readonly LearnerSkillEvent[],
  finalState: LearnerSkillState,
): boolean {
  const t1CorrectCount = events.filter(
    (e) => e.type === 'acertou_transferencia_imediata',
  ).length;
  const otherAcquisitionEvidenceCount = events.filter(
    (e) =>
      e.type === 'acertou_revisao_inedita' ||
      e.type === 'nova_evidencia_segura_separada_no_tempo',
  ).length;
  return (
    t1CorrectCount === 1 &&
    otherAcquisitionEvidenceCount === 0 &&
    finalState === 'dominado'
  );
}
