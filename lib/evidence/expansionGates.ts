/**
 * Gates booleanos de expansão — Fase 6 (docs/DECISAO_EVIDENCE_ENGINE.md §24–§27, §29).
 *
 * Expansão (mais skills/disciplinas, calibração, personalização, bandit) só
 * é permitida com evidência positiva das fases anteriores (§25: "Só com
 * evidência positiva em 4 e 5"). Alguns gates são hard-coded `false` porque o
 * ADR proíbe a capacidade incondicionalmente na V1 (ex.: LLM decidindo a
 * próxima questão em runtime — §9, §24).
 *
 * Pure module: funções booleanas puras, sem I/O.
 */

export type ExpansionGateInput = {
  rct1UpliftConfirmed: boolean;
  rct1SampleSizeMet: boolean;
  /** `null` = RCT-2 ainda não rodou. */
  rct2UpliftConfirmed: boolean | null;
  contaminationUnderControl: boolean;
  transferInventorySufficient: boolean;
};

/**
 * Expandir anotação para mais skills/disciplinas (§25 Fase 6) exige uplift
 * do pacote confirmado (RCT-1), amostra satisfeita e contaminação sob
 * controle — não depende do RCT-2 (FSRS é incremento posterior).
 */
export function canExpandSkills(input: ExpansionGateInput): boolean {
  return (
    input.rct1UpliftConfirmed === true &&
    input.rct1SampleSizeMet === true &&
    input.contaminationUnderControl === true
  );
}

/**
 * Calibração (Brier etc., ADR §21, §29) exige ao menos o uplift do RCT-1 e
 * inventário de transferência suficiente para gerar sinal confiável.
 */
export function canEnableCalibration(input: ExpansionGateInput): boolean {
  return (
    input.rct1UpliftConfirmed === true && input.transferInventorySufficient === true
  );
}

/**
 * Personalização de agendamento (FSRS "padrão") só depois do RCT-2 confirmar
 * uplift incremental — nunca a partir só do RCT-1 (ADR §12: "não promoção
 * automática após uplift do pacote"; §25 go/no-go RCT-2).
 */
export function canEnableFsrsAsDefaultScheduler(input: ExpansionGateInput): boolean {
  return input.rct1UpliftConfirmed === true && input.rct2UpliftConfirmed === true;
}

/**
 * Contextual bandit / RL educacional (§24 "não entra na V1") — exige
 * evidência positiva de **ambos** RCT-1 e RCT-2, nunca antes ("eventual").
 * Mesmo satisfeito, é responsabilidade humana decidir o próximo passo — este
 * gate só reflete o mínimo do ADR, não autoriza implementação automática.
 */
export function canEnableBandit(input: ExpansionGateInput): boolean {
  return (
    input.rct1UpliftConfirmed === true &&
    input.rct2UpliftConfirmed === true &&
    input.contaminationUnderControl === true
  );
}

/**
 * LLM decidindo a próxima questão em runtime é proibido pelo ADR
 * incondicionalmente na V1 (§9, §24) — hard-coded `false` independente de
 * qualquer resultado experimental. IA só pode auxiliar anotação offline com
 * revisão humana (§10, §24).
 */
export function canEnableLlmRuntimeSelection(): false {
  return false;
}

/**
 * Anotação assistida por IA offline é sempre permitida (não é um "gate" de
 * evidência experimental) — mas publicação automática sem revisão humana é
 * proibida (§10, §24). Este helper documenta a distinção; não decide nada.
 */
export function isOfflineAnnotationWithHumanReviewAllowed(): true {
  return true;
}
