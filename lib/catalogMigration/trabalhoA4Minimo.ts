/**
 * Protocolo A4-mínimo — Enfermagem do Trabalho (onda paridade Adolescente).
 *
 * @see docs/PROTOCOLO_A4_MINIMO_TRABALHO.md
 * @see lib/guidelines/enfermagemTrabalho.ts
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

export const TRABALHO_A4_MINIMO_AGENT = 'agent:trabalho-a4-minimo-v1';
export const TRABALHO_SUBTOPICO = 'Enfermagem do Trabalho';

export type TrabalhoReviewAxis =
  | 'nr32'
  | 'pep'
  | 'ergonomia'
  | 'nr15'
  | 'pcmso'
  | 'pegadinha';

export type TrabalhoWhitelistClaim = A4MinimoWhitelistClaim & { axis: TrabalhoReviewAxis };
export type TrabalhoA4MinimoAudit = A4MinimoAudit;

export function isTrabalhoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'enfermagem do trabalho' || n === 'saude do trabalhador';
}

export const TRABALHO_CLAIM_WHITELIST: readonly TrabalhoWhitelistClaim[] = [
  {
    id: 'pep-hepatite-b-prazo',
    axis: 'pep',
    match: /48\s*[-–aà]\s*72\s*h|primeiras?\s*48|profilaxia.{0,30}hepatite\s*b/i,
    canonical: 'PEP hepatite B — ideal nas primeiras 48–72 h',
    guidelineEntryId: 'pep-hepatite-b-prazo',
    groundsNumeric: true,
  },
  {
    id: 'perfurocortante-notificar',
    axis: 'pep',
    match: /perfurocortante.{0,40}(?:notificar|avaliar|protocolo)|notificar.{0,30}acidente/i,
    canonical: 'Acidente perfurocortante — notificar e seguir protocolo institucional',
    guidelineEntryId: 'perfurocortante',
    groundsNumeric: false,
  },
  {
    id: 'nr32-epi-empregador',
    axis: 'nr32',
    match: /epi.{0,40}empregador|fornecid[oa].{0,20}empregador|empregador.{0,30}epi/i,
    canonical: 'EPI fornecido pelo empregador conforme risco',
    guidelineEntryId: 'epi-empregador',
    groundsNumeric: false,
  },
  {
    id: 'ergonomia-25kg',
    axis: 'ergonomia',
    match: /25\s*kg|levantamento\s+manual.{0,30}25/i,
    canonical: 'Ergonomia — evitar levantamento manual acima de 25 kg (NR-17 referência)',
    guidelineEntryId: 'ergonomia-limite-levantamento',
    groundsNumeric: true,
  },
  {
    id: 'vacina-hepatite-b-3-doses',
    axis: 'nr32',
    match: /3\s+doses|0,\s*1\s+e\s*6\s+meses|esquema.{0,20}hepatite\s*b/i,
    canonical: 'Vacina hepatite B — 3 doses (0, 1 e 6 meses)',
    guidelineEntryId: 'vacina-hepatite-b-3-doses',
    groundsNumeric: true,
  },
  {
    id: 'pegadinha-reencapar-agulha',
    axis: 'pegadinha',
    match: /reencapar|recolocar\s+tampa|tampa\s+da\s+agulha/i,
    canonical: 'Nunca reencapar agulhas — descarte em coletor rígido',
    guidelineEntryId: 'descarte-residuos',
    groundsNumeric: false,
  },
  {
    id: 'burnout-ocupacional',
    axis: 'ergonomia',
    match: /burnout|esgotamento\s+profissional|exaust[aã]o\s+emocional/i,
    canonical: 'Burnout — risco ocupacional; prevenção institucional',
    guidelineEntryId: 'burnout-trabalhador-saude',
    groundsNumeric: false,
  },
  {
    id: 'nr15-exposicao-calor',
    axis: 'nr15',
    match: /exposi[cç][aã]o\s+di[aá]ria\s+permiss[ií]vel|ibutg|nr[\s-]?15/i,
    canonical: 'NR-15 — limites de exposição a calor (IBUTG)',
    guidelineEntryId: 'nr32-anexos',
    groundsNumeric: true,
  },
  {
    id: 'ergonomia-postura-forca',
    axis: 'ergonomia',
    match: /excesso\s+de\s+for[cç]a|postura\s+est[aá]tica|mobili[aá]rio\s+ergon[oô]mic|interven[cç][aã]o.{0,20}projeto/i,
    canonical: 'Ergonomia — postura, força e mobiliário no projeto do posto',
    guidelineEntryId: 'nr32-ergonomia',
    groundsNumeric: false,
  },
  {
    id: 'ler-dort-repeticao',
    axis: 'ergonomia',
    match: /ler\b|dort|esfor[cç]os?\s+repetitivos|trabalhos?\s+com\s+repeti[cç]/i,
    canonical: 'LER/DORT — esforços repetitivos e sobrecarga',
    guidelineEntryId: 'nr32-ergonomia',
    groundsNumeric: false,
  },
  {
    id: 'radiacao-ocupacional',
    axis: 'nr15',
    match: /radia[cç][aã]o|hemodin[aâ]mica|exposi[cç][aã]o\s+radiol[oó]gica|emissores?\s+de\s+radia[cç]/i,
    canonical: 'Radiação — limites e monitorização ocupacional',
    guidelineEntryId: 'nr32-risco-quimico',
    groundsNumeric: false,
  },
  {
    id: 'ace-risco-ocupacional',
    axis: 'nr32',
    match: /agente\s+de\s+combate\s+a\s+endemias|\bace\b/i,
    canonical: 'ACE — riscos ocupacionais específicos de campo',
    guidelineEntryId: 'nr32-escopo',
    groundsNumeric: false,
  },
  {
    id: 'nr9-exposicao-ocupacional',
    axis: 'nr15',
    match: /nr[\s-]?9|limite\s+de\s+toler[aâ]ncia|pcmso|pgpap/i,
    canonical: 'NR-9 — avaliação de exposições ocupacionais',
    guidelineEntryId: 'pcmso-aso',
    groundsNumeric: true,
  },
];

const TRABALHO_SENSITIVE_RE =
  /\bnr[\s-]?(?:9|15|32)\b|ibutg|pep\b|perfurocortante|48\s*[-–aà]\s*72|25\s*kg|3\s+doses|\b\d+\s*%/i;

export const TRABALHO_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'trabalho',
  label: 'Enfermagem do Trabalho',
  agentId: TRABALHO_A4_MINIMO_AGENT,
  isApplicable: isTrabalhoSubtopico,
  whitelist: TRABALHO_CLAIM_WHITELIST,
  sensitiveClaimHintRe: TRABALHO_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|nr[\s-]?32|pep|perfuro|ergonomia|25\s*kg/i,
};

export function auditTrabalhoA4Minimo(payload: QuestaoLike): TrabalhoA4MinimoAudit {
  return auditA4Minimo(TRABALHO_A4_MINIMO_CONFIG, payload);
}

export function applyTrabalhoA4MinimoMitigation(
  risk: RiskResult,
  audit: TrabalhoA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(TRABALHO_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithTrabalhoA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: TrabalhoA4MinimoAudit } {
  return scoreWithA4Minimo(TRABALHO_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildTrabalhoA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: TrabalhoA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(TRABALHO_A4_MINIMO_CONFIG, risk, audit, options);
}
