/**
 * Protocolo A4-mínimo — Feridas e Queimaduras (onda paridade Adolescente).
 *
 * @see docs/PROTOCOLO_A4_MINIMO_FERIDAS.md
 * @see lib/guidelines/feridasQueimaduras.ts
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

export const FERIDAS_A4_MINIMO_AGENT = 'agent:feridas-a4-minimo-v1';
export const FERIDAS_SUBTOPICO = 'Feridas e Queimaduras';

export type FeridasReviewAxis =
  | 'grau'
  | 'scq'
  | 'atendimento'
  | 'classificacao'
  | 'cicatrizacao'
  | 'pegadinha';

export type FeridasWhitelistClaim = A4MinimoWhitelistClaim & { axis: FeridasReviewAxis };
export type FeridasA4MinimoAudit = A4MinimoAudit;

export function isFeridasQueimadurasSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'feridas e queimaduras' || n === 'feridas' || n === 'queimaduras';
}

export const FERIDAS_CLAIM_WHITELIST: readonly FeridasWhitelistClaim[] = [
  {
    id: 'queimadura-3grau-escara',
    axis: 'grau',
    match: /3[oº°]\s+grau|espessura\s+total|escara|indolor|sem\s+bolhas/i,
    canonical: '3º grau — escara seca, espessura total, dor reduzida',
    guidelineEntryId: 'queimadura-3grau',
    groundsNumeric: false,
  },
  {
    id: 'queimadura-2grau-bolha',
    axis: 'grau',
    match: /2[oº°]\s+grau|bolhas?|leito\s+[uú]mido/i,
    canonical: '2º grau — bolhas e dor intensa',
    guidelineEntryId: 'queimadura-2superficial',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-dor-3grau',
    axis: 'pegadinha',
    match: /3[oº°]\s+grau.{0,40}(?:indolor|sem\s+dor)|indolor.{0,40}3[oº°]/i,
    canonical: '3º grau pode ser indolor — lesão nervosa',
    guidelineEntryId: 'pegadinha-dor-3grau',
    groundsNumeric: false,
  },
  {
    id: 'scq-regra-9-tronco',
    axis: 'scq',
    match: /tronco\s+anterior.{0,20}18\s*%|regra\s+dos\s*9/i,
    canonical: 'Regra dos 9 — tronco anterior adulto 18%',
    guidelineEntryId: 'regra-9',
    groundsNumeric: true,
  },
  {
    id: 'scq-mmi-msd-45',
    axis: 'scq',
    match: /45\s*%|dois\s+membros\s+inferiores|mmii.{0,30}msd/i,
    canonical: 'SCQ — dois MMII (36%) + MSD (9%) = 45%',
    guidelineEntryId: 'scq-mmi-msd-caso',
    groundsNumeric: true,
  },
  {
    id: 'atendimento-agua-corrente',
    axis: 'atendimento',
    match: /[áa]gua\s+corrente|resfriamento|proibi[cç][aã]o\s+de\s+gelo|n[aã]o\s+usar\s+gelo/i,
    canonical: 'Atendimento inicial — água corrente; não gelo',
    guidelineEntryId: 'bolha-integra',
    groundsNumeric: false,
  },
  {
    id: 'ferida-contaminada-6h',
    axis: 'classificacao',
    match: /contaminad|>\s*6\s+horas|6\s+horas/i,
    canonical: 'Ferida contaminada — > 6 h com contaminantes sem infecção',
    guidelineEntryId: 'ferida-contaminada-tempo',
    groundsNumeric: false,
  },
  {
    id: 'cicatrizacao-fases',
    axis: 'cicatrizacao',
    match: /inflamat[oó]ria|proliferativa|matura[cç][aã]o|granula[cç][aã]o/i,
    canonical: 'Cicatrização — inflamatória → proliferativa → maturação',
    guidelineEntryId: 'cicatrizacao-fases',
    groundsNumeric: false,
  },
];

const FERIDAS_SENSITIVE_RE =
  /\bscq\b|regra\s+dos\s*9|\b\d+\s*%|grau\b|queimadura|ferida\s+contaminad|cicatriza[cç][aã]o/i;

export const FERIDAS_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'feridas-e-queimaduras',
  label: 'Feridas e Queimaduras',
  agentId: FERIDAS_A4_MINIMO_AGENT,
  isApplicable: isFeridasQueimadurasSubtopico,
  whitelist: FERIDAS_CLAIM_WHITELIST,
  sensitiveClaimHintRe: FERIDAS_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /fixa[cç][aã]o|transfer|port[aá]til|em\s+outra|similares|grau|scq|contaminad|cicatriza/i,
};

export function auditFeridasA4Minimo(payload: QuestaoLike): FeridasA4MinimoAudit {
  return auditA4Minimo(FERIDAS_A4_MINIMO_CONFIG, payload);
}

export function applyFeridasA4MinimoMitigation(
  risk: RiskResult,
  audit: FeridasA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(FERIDAS_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithFeridasA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: FeridasA4MinimoAudit } {
  return scoreWithA4Minimo(FERIDAS_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildFeridasA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: FeridasA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(FERIDAS_A4_MINIMO_CONFIG, risk, audit, options);
}
