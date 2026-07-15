/**
 * Protocolo A4-mínimo — Saúde da Criança (paridade Adolescente).
 * AME, APGAR, triagem neonatal, desidratação, puericultura.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_SAUDE_CRIANCA.md
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

export const CRIANCA_A4_MINIMO_AGENT = 'agent:crianca-a4-minimo-v1';
export const CRIANCA_SUBTOPICO = 'Saúde da Criança';

export type CriancaReviewAxis =
  | 'aleitamento'
  | 'triagem_neonatal'
  | 'neonatologia'
  | 'desidratacao'
  | 'puericultura'
  | 'desenvolvimento'
  | 'vacina'
  | 'violencia';

export type CriancaWhitelistClaim = A4MinimoWhitelistClaim & {
  axis: CriancaReviewAxis;
};

export function isCriancaSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'saúde da criança' || n === 'saude da crianca' || n === 'pediatria';
}

export const CRIANCA_CLAIM_WHITELIST: readonly CriancaWhitelistClaim[] = [
  {
    id: 'ame-6-meses',
    axis: 'aleitamento',
    match: /aleitamento\s+materno\s+exclusivo|ame\b.{0,40}(?:6\s*meses|at[eé]\s*6)/i,
    canonical: 'AME até 6 meses — MS/OMS',
    guidelineEntryId: 'ame-exclusivo',
    groundsNumeric: true,
  },
  {
    id: 'mel-proibido-1-ano',
    axis: 'aleitamento',
    match: /mel.{0,40}(?:1\s*ano|primeiro\s+ano|botulismo)|(?:n[aã]o\s+oferecer|proibid).{0,30}mel/i,
    canonical: 'Mel contraindicado antes de 1 ano — botulismo infantil',
    guidelineEntryId: 'ame-exclusivo',
    groundsNumeric: false,
  },
  {
    id: 'apgar-faixas',
    axis: 'neonatologia',
    match: /apgar.{0,30}(?:7|10|4|6|0|3)|reanima[cç][aã]o.{0,30}(?:apgar|rn)/i,
    canonical: 'APGAR 7–10 normal; 4–6 moderado; 0–3 grave',
    guidelineEntryId: 'apgar-normal',
    groundsNumeric: true,
  },
  {
    id: 'pezinho-janela',
    axis: 'triagem_neonatal',
    match: /teste\s+do\s+pezinho|triagem\s+neonatal|fenilceton|pk[uú]|tsh/i,
    canonical: 'Teste do pezinho — triagem neonatal MS (3–5º dia ideal)',
    guidelineEntryId: 'pezinho-janela',
    groundsNumeric: true,
  },
  {
    id: 'coracaozinho-spo2',
    axis: 'triagem_neonatal',
    match: /cora[cç][aã]ozinho|oximetria.{0,30}rn|spo2.{0,20}rn|cardiopatia\s+cong[eê]nita/i,
    canonical: 'Teste do coraçãozinho — SpO₂ RN antes da alta',
    guidelineEntryId: 'coracaozinho-spo2',
    groundsNumeric: true,
  },
  {
    id: 'plano-abc-desidratacao',
    axis: 'desidratacao',
    match: /plano\s+[abc]|desidrata[cç][aã]o|soro\s+oral|diarreia\s+aguda/i,
    canonical: 'Plano A/B/C MS — diarréia aguda pediátrica',
    guidelineEntryId: 'desidratacao-sinais',
    groundsNumeric: false,
  },
  {
    id: 'pentavalente-3-doses',
    axis: 'vacina',
    match: /pentavalente|2[\s,-]*4[\s,-]*6\s*meses|3\s*doses/i,
    canonical: 'Pentavalente — 3 doses (2-4-6 meses)',
    guidelineEntryId: 'pentavalente-pni',
    groundsNumeric: true,
  },
  {
    id: 'visita-5-dia',
    axis: 'puericultura',
    match: /visita\s+domiciliar|5[oº]\s+dia|puericultura|consulta.{0,30}rn/i,
    canonical: 'Visita domiciliar / puericultura — 5º dia e calendário MS',
    guidelineEntryId: 'crescimento-curvas-oms',
    groundsNumeric: false,
  },
  {
    id: 'violencia-infantil-rede',
    axis: 'violencia',
    match: /maus-tratos|viol[eê]ncia.{0,30}crian[cç]a|conselho\s+tutelar|notifica[cç][aã]o\s+compuls[oó]ria/i,
    canonical: 'Violência infantil — notificação e rede de proteção',
    guidelineEntryId: 'sinais-alerta-pediatrico',
    groundsNumeric: false,
  },
];

const CRIANCA_SENSITIVE_RE =
  /\b\d+\s*(?:meses?|dias?|doses?|bpm|irpm)|apgar|pezinho|cora[cç][aã]ozinho|ame\b|plano\s+[abc]|pentavalente|mel\b|spo2|fc\s*lactente|fr\s*lactente/i;

export const CRIANCA_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'crianca',
  label: 'Criança',
  agentId: CRIANCA_A4_MINIMO_AGENT,
  isApplicable: isCriancaSubtopico,
  whitelist: CRIANCA_CLAIM_WHITELIST,
  sensitiveClaimHintRe: CRIANCA_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|6\s*meses|pezinho|apgar|plano\s+[abc]|n[aã]o\s+confund/i,
};

export function auditCriancaA4Minimo(payload: QuestaoLike): A4MinimoAudit {
  return auditA4Minimo(CRIANCA_A4_MINIMO_CONFIG, payload);
}

export function applyCriancaA4MinimoMitigation(
  risk: RiskResult,
  audit: A4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(CRIANCA_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithCriancaA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: A4MinimoAudit } {
  return scoreWithA4Minimo(CRIANCA_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildCriancaA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: A4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(CRIANCA_A4_MINIMO_CONFIG, risk, audit, options);
}
