/**
 * Protocolo A4-mínimo — Curativos e Manejo de Feridas (onda paridade Adolescente).
 *
 * @see docs/PROTOCOLO_A4_MINIMO_CURATIVOS.md
 * @see lib/guidelines/curativos.ts
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

export const CURATIVOS_A4_MINIMO_AGENT = 'agent:curativos-a4-minimo-v1';
export const CURATIVOS_SUBTOPICO = 'Curativos e Manejo de Feridas';

export type CurativosReviewAxis =
  | 'lpp_prevencao'
  | 'lpp_estagio'
  | 'braden'
  | 'cobertura'
  | 'exsudato'
  | 'desbridamento'
  | 'leito'
  | 'infeccao'
  | 'tecnica'
  | 'pegadinha';

export type CurativosWhitelistClaim = A4MinimoWhitelistClaim & { axis: CurativosReviewAxis };
export type CurativosA4MinimoAudit = A4MinimoAudit;

export function isCurativosSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'curativos e manejo de feridas' || n === 'curativos';
}

export const CURATIVOS_CLAIM_WHITELIST: readonly CurativosWhitelistClaim[] = [
  {
    id: 'lpp-pele-seca',
    axis: 'lpp_prevencao',
    match: /pele\s+limpa\s+e\s+sec|mant[eê]m.{0,30}seca|n[aã]o\s+[uú]mida|macera[cç][aã]o/i,
    canonical: 'Prevenção LPP — pele limpa e seca, não úmida',
    guidelineEntryId: 'lpp-prevencao-pele',
    groundsNumeric: false,
  },
  {
    id: 'lpp-ph-alcalino',
    axis: 'lpp_prevencao',
    match: /ph\s+alcalino|sabonetes?.{0,30}alcalin|produtos?.{0,30}alcalin/i,
    canonical: 'Evitar sabonetes e produtos com pH alcalino',
    guidelineEntryId: 'lpp-ph',
    groundsNumeric: false,
  },
  {
    id: 'lpp-calcanhar-livre',
    axis: 'lpp_prevencao',
    match: /calcanhar\s+livre|al[ií]vio\s+de\s+press[aã]o|suspens[aã]o\s+do\s+calcanhar|redistribui.{0,20}peso/i,
    canonical: 'Calcanhar livre ou suspensão — alívio de pressão',
    guidelineEntryId: 'lpp-calcanhar',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-massagem-lpp',
    axis: 'pegadinha',
    match: /n[aã]o\s+massagear|massagear.{0,40}proemin[eê]nc|proemin[eê]nc.{0,40}hiperem|massagem.{0,30}lpp/i,
    forbid: /massagear.{0,30}(?:previne|preven[cç][aã]o|recomend)/i,
    canonical: 'Não massagear proeminências ósseas nem áreas hiperemiadas',
    guidelineEntryId: 'pegadinha-massagem-lpp',
    groundsNumeric: false,
  },
  {
    id: 'braden-risco-18',
    axis: 'braden',
    match: /braden.{0,40}(?:≤|<=|at[eé]|menor|abaixo).{0,10}18|≤\s*18\s*pontos|risco\s+de\s+lpp/i,
    canonical: 'Braden ≤18 pontos = risco de LPP',
    guidelineEntryId: 'braden-risco',
    groundsNumeric: true,
  },
  {
    id: 'braden-alto-12',
    axis: 'braden',
    match: /≤\s*12|alto\s+risco.{0,20}lpp|reposicionamento\s+2\s*\/\s*2/i,
    canonical: 'Braden ≤12 — alto risco; reposicionamento 2/2 h',
    guidelineEntryId: 'braden-intervencoes',
    groundsNumeric: true,
  },
  {
    id: 'lpp-estagio-i',
    axis: 'lpp_estagio',
    match: /est[aá]gio\s+i\b|eritema\s+n[aã]o\s+branque[aá]vel|pele\s+[ií]ntegra.{0,30}eritema/i,
    canonical: 'LPP estágio I — eritema não branqueável, pele íntegra',
    guidelineEntryId: 'lpp-estagio-i',
    groundsNumeric: false,
  },
  {
    id: 'lpp-estagio-ii',
    axis: 'lpp_estagio',
    match: /est[aá]gio\s+ii\b|flictena|perda\s+parcial.{0,20}derme|leito\s+r[oó]seo/i,
    canonical: 'LPP estágio II — perda parcial da derme',
    guidelineEntryId: 'lpp-estagio-ii',
    groundsNumeric: false,
  },
  {
    id: 'lpp-estagio-iii',
    axis: 'lpp_estagio',
    match: /est[aá]gio\s+iii\b|perda\s+total.{0,20}espessura|subcut[aâ]neo\s+vis[ií]vel/i,
    canonical: 'LPP estágio III — perda total da espessura cutânea',
    guidelineEntryId: 'lpp-estagio-iii',
    groundsNumeric: false,
  },
  {
    id: 'lpp-estagio-iv',
    axis: 'lpp_estagio',
    match: /est[aá]gio\s+iv\b|exposi[cç][aã]o\s+de\s+osso|tend[aã]o\s+ou\s+m[uú]sculo/i,
    canonical: 'LPP estágio IV — exposição de osso, tendão ou músculo',
    guidelineEntryId: 'lpp-estagio-iv',
    groundsNumeric: false,
  },
  {
    id: 'limpeza-sf09',
    axis: 'tecnica',
    match: /sf\s*0[,.]?9|soro\s*fisiol[oó]gico|salina\s+0[,.]?9/i,
    canonical: 'Limpeza do leito com SF 0,9%',
    guidelineEntryId: 'limpeza-sf',
    groundsNumeric: true,
  },
  {
    id: 'exsudato-alto-alginato',
    axis: 'exsudato',
    match: /exsudato\s+alto|alginato|espuma.{0,30}absor|exsuda[cç][aã]o\s+(?:alta|elevada|intensa)/i,
    canonical: 'Exsudato alto — alginato ou espuma',
    guidelineEntryId: 'cobertura-exsudato-alto',
    groundsNumeric: false,
  },
  {
    id: 'exsudato-baixo-hidrocoloide',
    axis: 'exsudato',
    match: /exsudato\s+baixo|hidrocoloide|filme\s+transparente|exsuda[cç][aã]o\s+baixa/i,
    canonical: 'Exsudato baixo — hidrocoloide ou filme transparente',
    guidelineEntryId: 'cobertura-exsudato-baixo',
    groundsNumeric: false,
  },
  {
    id: 'exsudato-moderado-espuma',
    axis: 'exsudato',
    match: /exsudato\s+moderad|hidrofibra|espuma\s+de\s+poliuretano/i,
    canonical: 'Exsudato moderado — espuma ou hidrofibra',
    guidelineEntryId: 'cobertura-exsudato-moderado',
    groundsNumeric: false,
  },
  {
    id: 'cobertura-hidrogel',
    axis: 'cobertura',
    match: /hidrogel|meio\s+[uú]mido|ambiente\s+[uú]mido/i,
    canonical: 'Hidrogel — ambiente úmido no leito',
    guidelineEntryId: 'curativo-oclusivo',
    groundsNumeric: false,
  },
  {
    id: 'cobertura-hidrocoloide',
    axis: 'cobertura',
    match: /hidrocoloide|oclusiv/i,
    canonical: 'Hidrocoloide — cobertura oclusiva',
    guidelineEntryId: 'cobertura-hidrocoloide',
    groundsNumeric: false,
  },
  {
    id: 'cobertura-alginato',
    axis: 'cobertura',
    match: /alginato|forma\s+gel/i,
    canonical: 'Alginato — absorção de exsudato moderado a alto',
    guidelineEntryId: 'cobertura-alginato',
    groundsNumeric: false,
  },
  {
    id: 'cobertura-espuma',
    axis: 'cobertura',
    match: /espuma\s+de\s+poliuretano|espuma.{0,30}cobertura|hidropol[ií]mero/i,
    canonical: 'Espuma/hidropolímero — absorção e preenchimento',
    guidelineEntryId: 'cobertura-exsudato-moderado',
    groundsNumeric: false,
  },
  {
    id: 'leito-granulacao',
    axis: 'leito',
    match: /granula[cç][aã]o|tecido\s+vermelho\s+vivo|leito\s+vermelho/i,
    canonical: 'Leito de granulação — tecido vermelho vivo e úmido',
    guidelineEntryId: 'leito-granulacao',
    groundsNumeric: false,
  },
  {
    id: 'necrose-desbridamento',
    axis: 'desbridamento',
    match: /necros|esfacelo|escara|desbridamento|desbridar/i,
    canonical: 'Necrose/esfacelo — exige desbridamento',
    guidelineEntryId: 'cobertura-necrose',
    groundsNumeric: false,
  },
  {
    id: 'desbridamento-tipos',
    axis: 'desbridamento',
    match: /autol[ií]tic|enzim[aá]tic|instrumental|cir[uú]rgic|biol[oó]gic/i,
    canonical: 'Desbridamento — autolítico, enzimático, instrumental ou biológico',
    guidelineEntryId: 'desbridamento-tipos',
    groundsNumeric: false,
  },
  {
    id: 'biofilme-leito',
    axis: 'infeccao',
    match: /biofilme|col[oô]nia\s+bacteriana|aderid[ao]\s+ao\s+leito/i,
    canonical: 'Biofilme — colônia aderida que retarda cicatrização',
    guidelineEntryId: 'biofilme-leito',
    groundsNumeric: false,
  },
  {
    id: 'sinais-infeccao-ferida',
    axis: 'infeccao',
    match: /exsudato\s+purulent|odor\s+f[eé]tid|eritema\s+perilesional|infec[cç][aã]o.{0,30}ferida/i,
    canonical: 'Sinais de infecção — purulento, odor, eritema perilesional',
    guidelineEntryId: 'sinais-infeccao-ferida',
    groundsNumeric: false,
  },
  {
    id: 'cobertura-prata',
    axis: 'cobertura',
    match: /prata|antimicrobian|phmb/i,
    canonical: 'Cobertura com prata — adjuvante em colonização/biofilme',
    guidelineEntryId: 'cobertura-prata',
    groundsNumeric: false,
  },
  {
    id: 'tpn-vacuo',
    axis: 'cobertura',
    match: /press[aã]o\s+negativa|terapia\s+por\s+press[aã]o\s+negativa|\btpn\b|v[aá]cuo\s+cont/i,
    canonical: 'TPN — vácuo contínuo estimula granulação',
    guidelineEntryId: 'terapia-pressao-negativa',
    groundsNumeric: false,
  },
  {
    id: 'dau-umidade',
    axis: 'lpp_prevencao',
    match: /dermatite\s+associada|dau\b|incontin[eê]ncia.{0,30}macera/i,
    canonical: 'DAU — maceração por umidade, não é LPP',
    guidelineEntryId: 'dam-umidade',
    groundsNumeric: false,
  },
  {
    id: 'maceracao-perilesional',
    axis: 'exsudato',
    match: /macera[cç][aã]o\s+perilesional|pele\s+saturad|protetor\s+de\s+barreira/i,
    canonical: 'Maceração perilesional — controlar exsudato e barreira',
    guidelineEntryId: 'maceracao-perilesional',
    groundsNumeric: false,
  },
  {
    id: 'ferida-cirurgica-posop',
    axis: 'tecnica',
    match: /ferida\s+(?:operat[oó]ria|cir[uú]rgica)|p[oó]s[\s-]?operat|pontos?|deisc[eê]ncia|sutura/i,
    canonical: 'Ferida cirúrgica — técnica asséptica e avaliação de deiscência',
    guidelineEntryId: 'cobertura-tipos',
    groundsNumeric: false,
  },
  {
    id: 'estomia-periestoma',
    axis: 'tecnica',
    match: /estomia|periestoma|bolsa\s+coletora|ostom/i,
    canonical: 'Estomia — proteção periestoma e vedação adequada',
    guidelineEntryId: 'cobertura-tipos',
    groundsNumeric: false,
  },
  {
    id: 'bandagem-imobilizacao',
    axis: 'tecnica',
    match: /bandagem|gesso|imobiliza[cç][aã]o|enfaixamento/i,
    canonical: 'Bandagem — técnica de imobilização e circulação',
    guidelineEntryId: 'cobertura-tipos',
    groundsNumeric: false,
  },
  {
    id: 'cicatrizacao-fases',
    axis: 'leito',
    match: /inflamat[oó]ria|proliferativa|matura[cç][aã]o|cicatriza[cç][aã]o/i,
    canonical: 'Cicatrização — inflamatória → proliferativa → maturação',
    guidelineEntryId: 'leito-granulacao',
    groundsNumeric: false,
  },
];

const CURATIVOS_SENSITIVE_RE =
  /\blpp\b|braden|exsudato|alginato|hidrocoloide|hidrogel|espuma|desbrid|biofilme|est[aá]gio\s+[iIvV1-4]|\d+\s*%|meio\s+[uú]mido|soro\s*fisiol|sf\s*0[,.]?9|necros|granula[cç][aã]o|prata|press[aã]o\s+negativa|estomia|p[oó]s[\s-]?operat/i;

export const CURATIVOS_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'curativos-e-manejo-de-feridas',
  label: 'Curativos e Manejo de Feridas',
  agentId: CURATIVOS_A4_MINIMO_AGENT,
  isApplicable: isCurativosSubtopico,
  whitelist: CURATIVOS_CLAIM_WHITELIST,
  sensitiveClaimHintRe: CURATIVOS_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /fixa[cç][aã]o|transfer|port[aá]til|em\s+outra|similares|lpp|exsudato|cobertura|desbrid|braden|leito|curativo/i,
};

export function auditCurativosA4Minimo(payload: QuestaoLike): CurativosA4MinimoAudit {
  return auditA4Minimo(CURATIVOS_A4_MINIMO_CONFIG, payload);
}

export function applyCurativosA4MinimoMitigation(
  risk: RiskResult,
  audit: CurativosA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(CURATIVOS_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithCurativosA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: CurativosA4MinimoAudit } {
  return scoreWithA4Minimo(CURATIVOS_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildCurativosA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: CurativosA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(CURATIVOS_A4_MINIMO_CONFIG, risk, audit, options);
}
