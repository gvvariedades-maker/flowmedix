/**
 * Protocolo A4-mínimo — Saúde Mental (Onda paridade Adolescente).
 * Risco clínico médio: RAPS/CAPS, risco suicida, crise, dependência, contenção.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_SAUDE_MENTAL.md
 * @see lib/guidelines/saudeMental.ts
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

export const SAUDE_MENTAL_A4_MINIMO_AGENT = 'agent:saude-mental-a4-minimo-v1';
export const SAUDE_MENTAL_SUBTOPICO = 'Saúde Mental';

export type SaudeMentalReviewAxis =
  | 'raps'
  | 'caps'
  | 'suicidio'
  | 'crise'
  | 'dependencia'
  | 'acolhimento'
  | 'pegadinha';

export type SaudeMentalWhitelistClaim = A4MinimoWhitelistClaim & { axis: SaudeMentalReviewAxis };
export type SaudeMentalA4MinimoAudit = A4MinimoAudit;

export function isSaudeMentalSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'saúde mental' || n === 'saude mental';
}

export const SAUDE_MENTAL_CLAIM_WHITELIST: readonly SaudeMentalWhitelistClaim[] = [
  {
    id: 'caps-tm-graves',
    axis: 'caps',
    match: /caps|centro\s+de\s+aten[cç][aã]o\s+psicossocial|transtornos?\s+mentais?\s+graves/i,
    canonical: 'TM graves — articulação APS com CAPS (RAPS)',
    guidelineEntryId: 'sm-caps',
    groundsNumeric: false,
  },
  {
    id: 'raps-reforma',
    axis: 'raps',
    match: /raps|rede\s+de\s+aten[cç][aã]o\s+psicossocial|reforma\s+psiqu[ií]atrica|desinstitucionaliza/i,
    canonical: 'RAPS — cuidado comunitário pós-Reforma Psiquiátrica',
    guidelineEntryId: 'sm-caps',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-hospital-rotina',
    axis: 'pegadinha',
    match: /hospital\s+psiqu[ií]atrico|manic[oô]mio|interna[cç][aã]o\s+como\s+(?:rotina|padr[aã]o|primeira)/i,
    canonical: 'Hospital psiquiátrico como rotina é pegadinha pós-Reforma',
    guidelineEntryId: 'sm-rede-apoio',
    groundsNumeric: false,
  },
  {
    id: 'risco-suicida-avaliar',
    axis: 'suicidio',
    match: /risco\s+su[ií]cid|idea[cç][aã]o\s+su[ií]cid|idear\s+su[ií]cid|perguntar.{0,40}su[ií]cid|cvv\s*188/i,
    canonical: 'Ideação suicida — acolher, avaliar plano/meio/intenção, encaminhar',
    guidelineEntryId: 'sm-ideacao-suicida',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-perguntar-induz',
    axis: 'pegadinha',
    match: /perguntar.{0,40}(?:induz|aumenta\s+o\s+risco)|n[aã]o\s+perguntar.{0,30}su[ií]cid/i,
    canonical: 'Perguntar sobre suicídio não induz — pegadinha de conduta',
    guidelineEntryId: 'sm-ideacao-suicida',
    groundsNumeric: false,
  },
  {
    id: 'crise-de-escalada',
    axis: 'crise',
    match: /de[\s-]?escalad|conten[cç][aã]o\s+verbal|agita[cç][aã]o\s+psiqu[ií]atrica|crise\s+aguda/i,
    canonical: 'Crise aguda — acolher, de-escalar, avaliar risco antes de contenção física',
    guidelineEntryId: 'sm-crise-aguda',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-restricao-primeira-linha',
    axis: 'pegadinha',
    match: /conten[cç][aã]o\s+f[ií]sica.{0,40}(?:primeira|inicial|rotina)|restri[cç][aã]o\s+f[ií]sica.{0,40}ansiedade\s+leve/i,
    canonical: 'Contenção física não é primeira linha na UBS/ansiedade leve',
    guidelineEntryId: 'sm-restricao',
    groundsNumeric: false,
  },
  {
    id: 'dependencia-caps-ad',
    axis: 'dependencia',
    match: /caps\s+ad|depend[eê]ncia\s+qu[ií]mica|tabagismo|pnct|redu[cç][aã]o\s+de\s+danos|entrevista\s+motivacional/i,
    canonical: 'Dependência — CAPS AD, redução de danos e rede especializada',
    guidelineEntryId: 'sm-caps-ad',
    groundsNumeric: false,
  },
  {
    id: 'acolhimento-biopsicossocial',
    axis: 'acolhimento',
    match: /acolhimento|biopsicossocial|escuta\s+qualificada|v[ií]nculo\s+terap[eê]utico|primeira\s+resposta/i,
    canonical: 'Acolhimento humanizado na APS — base do cuidado em saúde mental',
    guidelineEntryId: 'sm-acolhimento',
    groundsNumeric: false,
  },
  {
    id: 'depressao-sinais-phq',
    axis: 'acolhimento',
    match: /depress[aã]o|anedonia|phq[\s-]?9|humor\s+deprimido|≥\s*2\s*semanas/i,
    canonical: 'Depressão — sinais nucleares, duração e encaminhamento se moderado/grave',
    guidelineEntryId: 'sm-depressao-sinais',
    groundsNumeric: false,
  },
  {
    id: 'internacao-involuntaria-72h',
    axis: 'raps',
    match: /interna[cç][aã]o\s+involunt[aá]ria|lei\s*10\.?216|72\s*h|72\s*horas/i,
    canonical: 'Internação involuntária — Lei 10.216/2001, avaliação MP em até 72h',
    guidelineEntryId: 'sm-internacao-involuntaria',
    groundsNumeric: true,
  },
  {
    id: 'psicofarmacos-extrapiramidais',
    axis: 'crise',
    match: /psicof[aá]rmaco|antipsic[oó]tico|esquizofrenia|extrapiramidal|discinesia|parkinsonismo/i,
    canonical: 'Psicofármacos — vigilância de efeitos adversos e adesão',
    guidelineEntryId: 'sm-medicacao-leve',
    groundsNumeric: false,
  },
  {
    id: 'sinais-alerta-sm-vf',
    axis: 'acolhimento',
    match: /sinais?\s+(?:e\s*\/)?\s*sintomas?|mudan[cç]a\s+repentina|rotina|isolamento|altera[cç][aã]o\s+de\s+comportamento|sinais?\s+de\s+alerta/i,
    canonical: 'Sinais/sintomas de alerta em saúde mental — acolhimento e encaminhamento na APS',
    guidelineEntryId: 'sm-transtornos-comuns',
    groundsNumeric: false,
  },
];

const SAUDE_MENTAL_SENSITIVE_RE =
  /caps|raps|su[ií]cid|cvv\s*188|conten[cç][aã]o|de[\s-]?escalad|interna[cç][aã]o|10\.?216|72\s*h|pnct|tabagismo|phq[\s-]?9|depress[aã]o|psicof[aá]rmaco|esquizofrenia/i;

export const SAUDE_MENTAL_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'saude-mental',
  label: 'Saúde Mental',
  agentId: SAUDE_MENTAL_A4_MINIMO_AGENT,
  isApplicable: isSaudeMentalSubtopico,
  whitelist: SAUDE_MENTAL_CLAIM_WHITELIST,
  sensitiveClaimHintRe: SAUDE_MENTAL_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|caps|raps|su[ií]cid|reforma|n[aã]o\s+confund|acolh/i,
};

export function auditSaudeMentalA4Minimo(payload: QuestaoLike): SaudeMentalA4MinimoAudit {
  return auditA4Minimo(SAUDE_MENTAL_A4_MINIMO_CONFIG, payload);
}

export function applySaudeMentalA4MinimoMitigation(
  risk: RiskResult,
  audit: SaudeMentalA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(SAUDE_MENTAL_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithSaudeMentalA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: SaudeMentalA4MinimoAudit } {
  return scoreWithA4Minimo(SAUDE_MENTAL_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildSaudeMentalA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: SaudeMentalA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(SAUDE_MENTAL_A4_MINIMO_CONFIG, risk, audit, options);
}
