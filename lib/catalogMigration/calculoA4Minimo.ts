/**
 * Protocolo A4-mínimo — Cálculo de Administração de Medicamentos e Infusões.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_CALCULO.md
 * @see lib/guidelines/calculoMedicamentos.ts
 */

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  buildA4MinimoEfficacyContract,
  scoreWithA4Minimo,
  type A4MinimoAudit,
  type A4MinimoPackageConfig,
  type A4MinimoWhitelistClaim,
  type QuestaoLike,
} from '@/lib/catalogMigration/a4MinimoCore';
import type { EfficacyContract, RiskResult, RiskScoringContext } from '@/lib/catalogMigration/riskScoring';

export const CALCULO_A4_MINIMO_AGENT = 'agent:calculo-a4-minimo-v1';
export const CALCULO_SUBTOPICO = 'Cálculo de Administração de Medicamentos e Infusões';

export type CalculoReviewAxis =
  | 'equivalencia'
  | 'insulina'
  | 'infusao'
  | 'regra_tres'
  | 'diluicao'
  | 'pegadinha';

export type CalculoWhitelistClaim = A4MinimoWhitelistClaim & { axis: CalculoReviewAxis };
export type CalculoA4MinimoAudit = A4MinimoAudit;

export function isCalculoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'cálculo de administração de medicamentos e infusões' ||
    n === 'calculo de administracao de medicamentos e infusoes' ||
    n.includes('cálculo de administração') ||
    n.includes('calculo de administracao')
  );
}

export const CALCULO_CLAIM_WHITELIST: readonly CalculoWhitelistClaim[] = [
  {
    id: 'equiv-20-gotas',
    axis: 'equivalencia',
    match: /20\s*gotas|1\s*ml\s*=\s*20|macrogota/i,
    canonical: '1 mL = 20 gotas (macrogotas)',
    guidelineEntryId: 'equiv-ml-gotas',
    groundsNumeric: true,
  },
  {
    id: 'equiv-60-micro',
    axis: 'equivalencia',
    match: /60\s*microgotas|microgotas.*1\s*ml/i,
    canonical: '1 mL = 60 microgotas',
    guidelineEntryId: 'equiv-ml-microgotas',
    groundsNumeric: true,
  },
  {
    id: 'equiv-3-micro-gota',
    axis: 'equivalencia',
    match: /1\s*gota\s*=\s*3\s*micro|3\s*microgotas/i,
    canonical: '1 gota = 3 microgotas',
    guidelineEntryId: 'equiv-gota-micro',
    groundsNumeric: true,
  },
  {
    id: 'insulina-u100',
    axis: 'insulina',
    match: /u-?100|100\s*ui.*1\s*ml|100\s*unidades.*1\s*ml/i,
    forbid: /10\s*ui.*1\s*ml/i,
    canonical: 'Insulina U-100: 100 UI em 1 mL',
    guidelineEntryId: 'insulina-u100',
    groundsNumeric: true,
  },
  {
    id: 'fator-20-gtsmin',
    axis: 'infusao',
    match: /fator\s*20|gts\/min.*20|\×\s*20\)/i,
    canonical: 'gts/min = (volume × 20) ÷ tempo (min) — macrogotas',
    guidelineEntryId: 'fator-macrogotas',
    groundsNumeric: true,
  },
  {
    id: 'fator-60-gtsmin',
    axis: 'infusao',
    match: /fator\s*60|microgotas.*60/i,
    canonical: 'gts/min = (volume × 60) ÷ tempo (min) — microgotas',
    guidelineEntryId: 'fator-microgotas',
    groundsNumeric: true,
  },
  {
    id: 'regra-tres-dose',
    axis: 'regra_tres',
    match: /regra de tr[eê]s|dose prescrita|propor[cç][aã]o/i,
    canonical: 'Regra de três — conferir unidade mg/mL',
    guidelineEntryId: 'regra-tres-dose',
    groundsNumeric: true,
  },
  {
    id: 'pegadinha-30-90',
    axis: 'pegadinha',
    match: /30\s*gotas|90\s*micro/i,
    canonical: 'Pegadinha: banca troca 20→30 e 60→90',
    guidelineEntryId: 'pegadinha-30-gotas',
    groundsNumeric: false,
  },
];

const CALCULO_SENSITIVE_RE =
  /\b\d+([.,]\d+)?\s*(mg|ml|mcg|g\b|gts?\/min|gotas?|UI|%|kg)\b|20\s*gotas|60\s*micro|u-?100|regra de tr[eê]s|gts\/min|fator\s*20|fator\s*60|dilui[cç][aã]o|mg\/kg|mg\/ml|concentra[cç][aã]o/i;

export const CALCULO_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'calculo',
  label: 'Cálculo',
  agentId: CALCULO_A4_MINIMO_AGENT,
  isApplicable: isCalculoSubtopico,
  whitelist: CALCULO_CLAIM_WHITELIST,
  sensitiveClaimHintRe: CALCULO_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|mg\/kg|gts\/min|regra de tr[eê]s|n[aã]o\s+confund|dilui/i,
};

export function auditCalculoA4Minimo(payload: QuestaoLike): CalculoA4MinimoAudit {
  return auditA4Minimo(CALCULO_A4_MINIMO_CONFIG, payload);
}

export function applyCalculoA4MinimoMitigation(
  risk: RiskResult,
  audit: CalculoA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(CALCULO_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreCalculoWithA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: CalculoA4MinimoAudit } {
  return scoreWithA4Minimo(CALCULO_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildCalculoA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: CalculoA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(CALCULO_A4_MINIMO_CONFIG, risk, audit, options);
}
