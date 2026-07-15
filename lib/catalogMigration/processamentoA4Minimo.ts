/**
 * Protocolo A4-mínimo — Processamento de Artigos e Produtos de Saúde (Onda nota-10).
 * Spaulding, áreas CME, autoclave, validade e indicadores.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_PROCESSAMENTO.md
 * @see lib/guidelines/cme.ts
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

export const PROCESSAMENTO_A4_MINIMO_AGENT = 'agent:processamento-a4-minimo-v1';
export const PROCESSAMENTO_SUBTOPICO = 'Processamento de Artigos e Produtos de Saúde';

export type ProcessamentoReviewAxis =
  | 'spaulding'
  | 'areas'
  | 'autoclave'
  | 'validade'
  | 'indicadores'
  | 'preparo'
  | 'pegadinha';

export type ProcessamentoWhitelistClaim = A4MinimoWhitelistClaim & { axis: ProcessamentoReviewAxis };
export type ProcessamentoA4MinimoAudit = A4MinimoAudit;

export function isProcessamentoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'processamento de artigos e produtos de saúde' ||
    n === 'processamento de artigos e produtos de saude' ||
    n.includes('processamento de artigos')
  );
}

export const PROCESSAMENTO_CLAIM_WHITELIST: readonly ProcessamentoWhitelistClaim[] = [
  {
    id: 'spaulding-critico',
    axis: 'spaulding',
    match: /artigo\s+cr[ií]tico|cr[ií]tico.{0,40}(?:esteril|vascular|tecido\s+est[eé]ril)/i,
    canonical: 'Artigo crítico — penetra tecido estéril / vascular — esterilização',
    guidelineEntryId: 'cme-area-estéril',
    groundsNumeric: false,
  },
  {
    id: 'spaulding-semicritico',
    axis: 'spaulding',
    match: /semi[\s-]?cr[ií]tico|mucosa|pele\s+n[aã]o\s+[ií]ntegra/i,
    canonical: 'Semicrítico — mucosa ou pele não íntegra — desinfecção alto nível',
    guidelineEntryId: 'cme-limpeza',
    groundsNumeric: false,
  },
  {
    id: 'spaulding-nao-critico',
    axis: 'spaulding',
    match: /n[aã]o[\s-]?cr[ií]tico|pele\s+[ií]ntegra/i,
    canonical: 'Não crítico — pele íntegra — limpeza de baixo nível',
    guidelineEntryId: 'cme-limpeza',
    groundsNumeric: false,
  },
  {
    id: 'areas-fluxo',
    axis: 'areas',
    match: /[áa]rea\s+(?:suja|limp|est[eé]ril)|fluxo\s+unidirecional|suja\s*→\s*limp/i,
    canonical: 'Fluxo CME: área suja → limpa → estéril (unidirecional)',
    guidelineEntryId: 'cme-fluxo',
    groundsNumeric: false,
  },
  {
    id: 'autoclave-121-15',
    axis: 'autoclave',
    match: /121\s*°?\s*c.{0,20}15\s*min|vapor\s+saturado.{0,30}121/i,
    canonical: 'Autoclave — 121 °C por 15 min (vapor saturado)',
    guidelineEntryId: 'cme-esterilizacao-vapor',
    groundsNumeric: true,
  },
  {
    id: 'validade-30-dias',
    axis: 'validade',
    match: /30\s*dias|validade.{0,30}(?:30|embalagem\s+n[aã]o\s+tecido)/i,
    canonical: 'Embalagem não tecido — validade usual 30 dias',
    guidelineEntryId: 'cme-validade-nao-tecido',
    groundsNumeric: true,
  },
  {
    id: 'indicador-biologico',
    axis: 'indicadores',
    match: /indicador\s+biol[oó]gico|efic[aá]cia\s+microbicida/i,
    canonical: 'Indicador biológico confirma eficácia microbicida do ciclo',
    guidelineEntryId: 'cme-indicador-biologico',
    groundsNumeric: false,
  },
  {
    id: 'indicador-quimico-interno',
    axis: 'indicadores',
    match: /indicador\s+qu[ií]mico\s+interno|classe\s+[1-6]/i,
    canonical: 'Indicador químico interno — exposição ao processo no ciclo',
    guidelineEntryId: 'cme-indicador-quimico',
    groundsNumeric: false,
  },
  {
    id: 'preparo-limpeza-primeira',
    axis: 'preparo',
    match: /pr[eé][\s-]?limpeza|limpeza\s+manual|ultrass[oô]nic|secagem|embalagem/i,
    canonical: 'Preparo — limpeza remove matéria orgânica antes da esterilização',
    guidelineEntryId: 'cme-limpeza',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-validade-eterna',
    axis: 'pegadinha',
    match: /validade\s+etern|indefinid|embalagem\s+[ií]ntegra.{0,30}sem\s+prazo/i,
    canonical: 'Embalagem íntegra não significa validade eterna',
    guidelineEntryId: 'cme-validade',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-indicador-quimico-substitui-bio',
    axis: 'pegadinha',
    match: /indicador\s+qu[ií]mico.{0,40}substitu[ií].{0,20}biol[oó]gico|qu[ií]mico\s+interno.{0,30}suficiente/i,
    canonical: 'Indicador químico não substitui biológico quando exigido',
    guidelineEntryId: 'cme-indicador-quimico',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-retorno-fluxo',
    axis: 'pegadinha',
    match: /retorno.{0,30}(?:[áa]rea|fluxo)|material\s+est[eé]ril.{0,30}[áa]rea\s+suja/i,
    canonical: 'Proibido retorno de material ao fluxo anterior',
    guidelineEntryId: 'cme-fluxo',
    groundsNumeric: false,
  },
];

const PROCESSAMENTO_SENSITIVE_RE =
  /\b121\s*°?\s*c\b|\b15\s*min\b|\b30\s*dias\b|spaulding|cr[ií]tico|semi[\s-]?cr[ií]tico|n[aã]o[\s-]?cr[ií]tico|[áa]rea\s+(?:suja|limp|est[eé]ril)|autoclave|indicador\s+(?:qu[ií]mico|biol[oó]gico)|validade|fluxo\s+unidirecional|pr[eé][\s-]?limpeza/i;

export const PROCESSAMENTO_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'processamento',
  label: 'Processamento',
  agentId: PROCESSAMENTO_A4_MINIMO_AGENT,
  isApplicable: isProcessamentoSubtopico,
  whitelist: PROCESSAMENTO_CLAIM_WHITELIST,
  sensitiveClaimHintRe: PROCESSAMENTO_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|n[aã]o\s+confund|fluxo|spaulding|cr[ií]tico/i,
};

export function auditProcessamentoA4Minimo(payload: QuestaoLike): ProcessamentoA4MinimoAudit {
  return auditA4Minimo(PROCESSAMENTO_A4_MINIMO_CONFIG, payload);
}

export function applyProcessamentoA4MinimoMitigation(
  risk: RiskResult,
  audit: ProcessamentoA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(PROCESSAMENTO_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithProcessamentoA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: ProcessamentoA4MinimoAudit } {
  return scoreWithA4Minimo(PROCESSAMENTO_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildProcessamentoA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: ProcessamentoA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(PROCESSAMENTO_A4_MINIMO_CONFIG, risk, audit, options);
}
