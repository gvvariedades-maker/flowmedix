/**
 * Protocolo A4-mínimo — Doenças Respiratórias Crônicas (Asma, DPOC).
 * Risco clínico médio: SpO₂ alvo, O₂ titulado, dispositivos, crise asmática.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_RESPIRATORIO.md
 * @see lib/guidelines/respiratorioCronico.ts
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

export const RESPIRATORIO_A4_MINIMO_AGENT = 'agent:respiratorio-a4-minimo-v1';
export const RESPIRATORIO_SUBTOPICO = 'Doenças Respiratórias Crônicas (Asma, DPOC)';

export type RespiratorioReviewAxis =
  | 'spo2'
  | 'oxigenio'
  | 'asma'
  | 'dpoc'
  | 'crise'
  | 'inalador'
  | 'pegadinha';

export type RespiratorioWhitelistClaim = A4MinimoWhitelistClaim & { axis: RespiratorioReviewAxis };
export type RespiratorioA4MinimoAudit = A4MinimoAudit;

export function isRespiratorioCronicoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n.includes('respirat') &&
    (n.includes('crônic') || n.includes('cronic') || n.includes('asma') || n.includes('dpoc'))
  );
}

export const RESPIRATORIO_CLAIM_WHITELIST: readonly RespiratorioWhitelistClaim[] = [
  {
    id: 'spo2-alvo-dpoc-88-92',
    axis: 'spo2',
    match: /88\s*[-–aà]\s*92|entre\s*88\s*e\s*92|alvo.{0,30}88.{0,10}92/i,
    canonical: 'SpO₂ alvo DPOC retentor — 88 a 92%',
    guidelineEntryId: 'dpoc-spo2-alvo',
    groundsNumeric: true,
  },
  {
    id: 'spo2-meta-90-93',
    axis: 'spo2',
    match: /90\s*[-–aà]\s*93|manter.{0,25}spo2.{0,15}90/i,
    canonical: 'Prescrição SpO₂ 90–93% em DPOC (titulação individualizada)',
    guidelineEntryId: 'dpoc-spo2-alvo',
    groundsNumeric: true,
  },
  {
    id: 'pegadinha-spo2-98-100',
    axis: 'pegadinha',
    match: /98\s*[-–aà]\s*100|sempre.{0,40}(?:98|100)\s*%|meta.{0,30}98.{0,10}100/i,
    canonical: 'SpO₂ 98–100% não é meta universal no DPOC retentor',
    guidelineEntryId: 'pegadinha-spo2-98',
    groundsNumeric: true,
  },
  {
    id: 'o2-titulado-dpoc',
    axis: 'oxigenio',
    match: /oxig[eê]nio\s+titulad|o2\s+titulad|baixo\s+fluxo.{0,40}dpoc|fi[oó]2\s+controlad/i,
    canonical: 'O₂ titulado na DPOC — evitar hiperóxia sem monitorização',
    guidelineEntryId: 'dpoc-o2-titulado',
    groundsNumeric: false,
  },
  {
    id: 'venturi-fiO2-controlada',
    axis: 'oxigenio',
    match: /venturi|m[aá]scara.{0,30}venturi|fi[oó]2\s+precis|v[aá]lvulas?\s+coloridas/i,
    canonical: 'Máscara de Venturi — FiO₂ precisa no DPOC',
    guidelineEntryId: 'dpoc-o2-titulado',
    groundsNumeric: false,
  },
  {
    id: 'asma-reversivel',
    axis: 'asma',
    match: /asma.{0,40}revers|obstru[cç][aã]o\s+revers|broncodilatador.{0,30}melhora/i,
    canonical: 'Asma — obstrução reversível das vias aéreas',
    guidelineEntryId: 'asma-reversibilidade',
    groundsNumeric: false,
  },
  {
    id: 'dpoc-persistente',
    axis: 'dpoc',
    match: /dpoc|doen[cç]a\s+pulmonar\s+obstrutiva|obstru[cç][aã]o\s+persistente|enfisema/i,
    canonical: 'DPOC — obstrução persistente e progressiva',
    guidelineEntryId: 'dpoc-persistente',
    groundsNumeric: false,
  },
  {
    id: 'hipercapnia-retencao-co2',
    axis: 'dpoc',
    match: /hipercapnia|reten[cç][aã]o\s+de\s+co2|retentor|hip[oó]xia\s+induzida/i,
    canonical: 'DPOC retentor — risco de retenção de CO₂ com hiperóxia',
    guidelineEntryId: 'dpoc-persistente',
    groundsNumeric: false,
  },
  {
    id: 'broncodilatador-crise',
    axis: 'crise',
    match: /broncodilatador.{0,30}(?:curta|resgate|crise)|beta[\s-]?2|salbutamol|crise\s+asm/i,
    canonical: 'Crise asmática — broncodilatador de curta ação é primeira linha',
    guidelineEntryId: 'asma-crise',
    groundsNumeric: false,
  },
  {
    id: 'corticoide-inalatorio',
    axis: 'inalador',
    match: /corticoide\s+inalat|controlador\s+da\s+asma|manuten[cç][aã]o.{0,30}asma/i,
    canonical: 'Corticoide inalatório — controlador de manutenção da asma',
    guidelineEntryId: 'corticoide-inalatorio',
    groundsNumeric: false,
  },
  {
    id: 'espacador-mdi',
    axis: 'inalador',
    match: /espa[cç]ador|valvulad|spray\s+dosead|mdi\b/i,
    canonical: 'Espaçador valvulado — melhora deposição do broncodilatador inalatório',
    guidelineEntryId: 'espacador',
    groundsNumeric: false,
  },
  {
    id: 'peak-flow-zonas',
    axis: 'asma',
    match: /peak\s*flow|pfe\b|zona.{0,20}(?:verde|amarela|vermelha)/i,
    canonical: 'Peak flow — zonas verde/amarela/vermelha na asma',
    guidelineEntryId: 'peak-flow',
    groundsNumeric: false,
  },
  {
    id: 'vef1-cvf-espirometria',
    axis: 'dpoc',
    match: /vef1|cvf|espirometria|rela[cç][aã]o\s+vef1\s*\/\s*cvf/i,
    canonical: 'Espirometria — VEF1/CVF na DPOC',
    guidelineEntryId: 'dpoc-tempo-expiratorio',
    groundsNumeric: false,
  },
];

/** SpO₂, FiO₂, L/min e percentuais nos slides. */
const RESPIRATORIO_SENSITIVE_RE =
  /\bspo2\b|satura[cç][aã]o|oximetria|\bfio2\b|\b\d+\s*[-–aà]\s*\d+\s*%|\b\d+\s*%|litros?\s*\/\s*min|\bl\s*\/\s*min\b|venturi|dpoc|asma/i;

export const RESPIRATORIO_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'respiratorio',
  label: 'Respiratório crônico',
  agentId: RESPIRATORIO_A4_MINIMO_AGENT,
  isApplicable: isRespiratorioCronicoSubtopico,
  whitelist: RESPIRATORIO_CLAIM_WHITELIST,
  sensitiveClaimHintRe: RESPIRATORIO_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|88|92|spo2|dpoc|asma|titulad|retentor/i,
};

export function auditRespiratorioA4Minimo(payload: QuestaoLike): RespiratorioA4MinimoAudit {
  return auditA4Minimo(RESPIRATORIO_A4_MINIMO_CONFIG, payload);
}

export function applyRespiratorioA4MinimoMitigation(
  risk: RiskResult,
  audit: RespiratorioA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(RESPIRATORIO_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithRespiratorioA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: RespiratorioA4MinimoAudit } {
  return scoreWithA4Minimo(RESPIRATORIO_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildRespiratorioA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: RespiratorioA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(RESPIRATORIO_A4_MINIMO_CONFIG, risk, audit, options);
}
