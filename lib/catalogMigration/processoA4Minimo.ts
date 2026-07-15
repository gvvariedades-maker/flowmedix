/**
 * Protocolo A4-mínimo — Processo de Enfermagem / SAE (paridade Adolescente).
 *
 * @see docs/PROTOCOLO_A4_MINIMO_PROCESSO_DE_ENFERMAGEM.md
 * @see lib/guidelines/saeCofen.ts
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

export const PROCESSO_A4_MINIMO_AGENT = 'agent:processo-de-enfermagem-a4-minimo-v1';
export const PROCESSO_SUBTOPICO = 'Processo de Enfermagem';

export type ProcessoReviewAxis =
  | 'documentacao'
  | 'etapas'
  | 'privativa'
  | 'nanda'
  | 'pegadinha';

export type ProcessoWhitelistClaim = A4MinimoWhitelistClaim & { axis: ProcessoReviewAxis };

export function isProcessoEnfermagemSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'processo de enfermagem' || n === 'sae';
}

export const PROCESSO_CLAIM_WHITELIST: readonly ProcessoWhitelistClaim[] = [
  {
    id: 'sae-cinco-etapas',
    axis: 'etapas',
    match: /cinco etapas|5 etapas|coleta de dados|diagn[oó]stico de enfermagem|planejamento|implementa[cç][aã]o|avalia[cç][aã]o/i,
    canonical: 'SAE — 5 etapas integradas (COFEN 358/2009)',
    guidelineEntryId: 'sae-cinco-etapas',
    groundsNumeric: false,
  },
  {
    id: 'sae-anotacao-privativa',
    axis: 'documentacao',
    match: /anota[cç][aã]o de enfermagem|registro de enfermagem|prontu[aá]rio/i,
    canonical: 'Anotação de enfermagem — registro legal do cuidado',
    guidelineEntryId: 'sae-anotacao',
    groundsNumeric: false,
  },
  {
    id: 'sae-diagnostico-privativo',
    axis: 'privativa',
    match: /diagn[oó]stico de enfermagem|prescri[cç][aã]o de enfermagem|nanda/i,
    canonical: 'Diagnóstico e prescrição — atividades privativas do enfermeiro',
    guidelineEntryId: 'sae-privativa-diagnostico',
    groundsNumeric: false,
  },
  {
    id: 'sae-tecnico-implementa',
    axis: 'etapas',
    match: /t[eé]cnico.{0,40}implementa|auxiliar.{0,40}implementa|art\.?\s*5/i,
    canonical: 'Técnico/auxiliar implementam sob supervisão — não prescrevem diagnóstico',
    guidelineEntryId: 'sae-tecnico-registro',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-avaliacao-privativa',
    axis: 'pegadinha',
    match: /t[eé]cnico.{0,40}avalia[cç][aã]o|auxiliar.{0,40}avalia[cç][aã]o/i,
    canonical: 'Avaliação de enfermagem — privativa do enfermeiro (pegadinha INCORRETA)',
    guidelineEntryId: 'sae-pegadinha-diagnostico-medico',
    groundsNumeric: false,
  },
  {
    id: 'sae-nic-noc',
    axis: 'nanda',
    match: /\bnic\b|\bnoc\b|taxonomia/i,
    canonical: 'NANDA-NIC-NOC — linguagem padronizada do SAE',
    guidelineEntryId: 'sae-nanda-taxonomia',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-diagnostico-medico',
    axis: 'pegadinha',
    match: /diagn[oó]stico m[eé]dico|cid\b|hip[oó]tese m[eé]dica/i,
    canonical: 'Diagnóstico médico ≠ diagnóstico de enfermagem',
    guidelineEntryId: 'sae-pegadinha-diagnostico-medico',
    groundsNumeric: false,
  },
];

const PROCESSO_SENSITIVE_RE =
  /nanda|nic\b|noc\b|diagn[oó]stico de enfermagem|anota[cç][aã]o|prescri[cç][aã]o|cofen\s*358|privativ|implementa[cç][aã]o|avalia[cç][aã]o de enfermagem/i;

export const PROCESSO_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'processo-de-enfermagem',
  label: 'Processo de Enfermagem',
  agentId: PROCESSO_A4_MINIMO_AGENT,
  isApplicable: isProcessoEnfermagemSubtopico,
  whitelist: PROCESSO_CLAIM_WHITELIST,
  sensitiveClaimHintRe: PROCESSO_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|nanda|nic|noc|privativ|anota[cç][aã]o|n[aã]o confund/i,
};

export function auditProcessoA4Minimo(payload: QuestaoLike): A4MinimoAudit {
  return auditA4Minimo(PROCESSO_A4_MINIMO_CONFIG, payload);
}

export function applyProcessoA4MinimoMitigation(
  risk: RiskResult,
  audit: A4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(PROCESSO_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithProcessoA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: A4MinimoAudit } {
  return scoreWithA4Minimo(PROCESSO_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildProcessoA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: A4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(PROCESSO_A4_MINIMO_CONFIG, risk, audit, options);
}
