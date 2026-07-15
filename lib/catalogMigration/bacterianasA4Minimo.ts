/**
 * Protocolo A4-mínimo — Doenças Bacterianas e Fúngicas (onda paridade Adolescente).
 * Risco clínico médio: TB (BAAR, aerossóis, TDO), tétano, hanseníase, candidíase.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_BACTERIANAS.md
 * @see lib/guidelines/tuberculose.ts
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

export const BACTERIANAS_A4_MINIMO_AGENT = 'agent:bacterianas-a4-minimo-v1';
export const BACTERIANAS_SUBTOPICO =
  'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';

export type BacterianasReviewAxis =
  | 'tb_vigilancia'
  | 'tb_transmissao'
  | 'tb_tratamento'
  | 'tetano'
  | 'hanseniase'
  | 'candidiase'
  | 'pegadinha';

export type BacterianasWhitelistClaim = A4MinimoWhitelistClaim & { axis: BacterianasReviewAxis };
export type BacterianasA4MinimoAudit = A4MinimoAudit;

export function isBacterianasSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n.includes('bacterianas') ||
    n.includes('bacterianas e fungicas') ||
    (n.includes('tubercul') && n.includes('tétano')) ||
    (n.includes('tubercul') && n.includes('tetano'))
  );
}

export const BACTERIANAS_CLAIM_WHITELIST: readonly BacterianasWhitelistClaim[] = [
  {
    id: 'tb-notificacao-compulsoria',
    axis: 'tb_vigilancia',
    match: /notifica[cç][aã]o\s+compuls[oó]ria|investigar\s+contactante|vigil[aâ]ncia\s+epidemiol[oó]gica.{0,40}tb/i,
    canonical: 'TB — notificação compulsória e busca de contactantes',
    guidelineEntryId: 'tb-notificacao',
    groundsNumeric: false,
  },
  {
    id: 'tb-baar-escarro',
    axis: 'tb_vigilancia',
    match: /baar|bacilo\s+[aá]lcool[\s-]?[aá]cido|baciloscopia|escarro.{0,40}diagn[oó]stic/i,
    canonical: 'BAAR no escarro — exame diagnóstico clássico da TB pulmonar',
    guidelineEntryId: 'tb-baar',
    groundsNumeric: false,
  },
  {
    id: 'tb-precaucao-aerossol',
    axis: 'tb_transmissao',
    match: /precau[cç][aã]o.{0,30}aeross[oó]l|bacil[ií]fer|m[aá]scara.{0,30}n95|transmiss[aã]o.{0,30}got[ií]cula/i,
    canonical: 'TB pulmonar bacilífera — precaução para aerossóis',
    guidelineEntryId: 'tb-precaucao-bacilifero',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-tb-contato-pele',
    axis: 'pegadinha',
    match: /contato\s+direto.{0,30}pele|apenas\s+por\s+contato\s+cut[aâ]neo|n[aã]o\s+precisa.{0,30}aeross[oó]l|s[oó]\s+contato\s+pele|n[aã]o\s+contato\s+cut[aâ]neo/i,
    canonical: 'TB não se transmite por contato direto com pele — pegadinha de via',
    guidelineEntryId: 'tb-pegadinha-pele',
    groundsNumeric: false,
  },
  {
    id: 'tb-tdo-dot',
    axis: 'tb_tratamento',
    match: /tdo|dot|tratamento\s+diretamente\s+observad|supervis[aã]o\s+da\s+dose/i,
    canonical: 'TDO/DOT — adesão supervisionada ao esquema anti-TB',
    guidelineEntryId: 'tb-dot-tdo',
    groundsNumeric: false,
  },
  {
    id: 'tb-tratamento-6-meses',
    axis: 'tb_tratamento',
    match: /6\s+meses|seis\s+meses|esquema\s+b[aá]sico.{0,40}rifampicina/i,
    canonical: 'TB sensível — tratamento mínimo 6 meses (esquema básico MS)',
    guidelineEntryId: 'tb-tratamento-6-meses',
    groundsNumeric: true,
  },
  {
    id: 'tb-ppd-induracao',
    axis: 'tb_vigilancia',
    match: /ppd|mantoux|tubercul[ií]nic|indura[cç][aã]o.{0,30}mm|48.{0,10}72\s*h/i,
    canonical: 'PPD/Mantoux — leitura da induração em 48–72 h',
    guidelineEntryId: 'tb-ppd-mantoux',
    groundsNumeric: true,
  },
  {
    id: 'pegadinha-bcg-ppd',
    axis: 'pegadinha',
    match: /bcg.{0,40}ppd|rea[cç][aã]o\s+cruzada.{0,30}vacinal/i,
    canonical: 'BCG pode reagir no PPD — interpretar com histórico vacinal',
    guidelineEntryId: 'tb-pegadinha-vacina-bcg',
    groundsNumeric: false,
  },
  {
    id: 'tetano-profilaxia-ferida',
    axis: 'tetano',
    match: /(?:^|[^a-záéíóúãõç])t[eé]tano[^a-záéíóúãõç]|antitet[aâ]nic|profilaxia\s+p[oó]s[\s-]?exposi[cç][aã]o|esquema\s+vacinal.{0,40}ferida/i,
    canonical: 'Tétano — profilaxia vacinal ± soro conforme ferida e histórico',
    guidelineEntryId: 'tetano-profilaxia',
    groundsNumeric: false,
  },
  {
    id: 'hanseniase-pqt-paucibacilar',
    axis: 'hanseniase',
    match: /hansen[ií]ase|paucibacilar|multibacilar|pqt|dermatoneurol[oó]gic|clofazimina|dapsona/i,
    canonical: 'Hanseníase — classificação operacional e PQT conforme MS',
    guidelineEntryId: 'hanseniase-pqt-pb-6-meses',
    groundsNumeric: false,
  },
  {
    id: 'candidiase-oportunista',
    axis: 'candidiase',
    match: /candida\s+spp|monil[ií]ase|infec[cç][aã]o\s+f[uú]ngic|candid[ií]ase\s+(?:oral|vaginal|cut[aâ]nea)/i,
    canonical: 'Candidíase — infecção fúngica oportunista (não transmissão por aerossol como TB)',
    guidelineEntryId: 'candidiase-oportunista',
    groundsNumeric: false,
  },
  {
    id: 'tb-sintomatico-3-semanas',
    axis: 'tb_vigilancia',
    match: /tosse.{0,30}3\s+semanas|sintom[aá]tico\s+respirat[oó]rio/i,
    canonical: 'Sintomático respiratório — tosse ≥3 semanas investiga TB',
    guidelineEntryId: 'tb-sintomatico-3-semanas',
    groundsNumeric: true,
  },
];

const BACTERIANAS_SENSITIVE_RE =
  /tubercul|baar|aeross[oó]l|bacil[ií]fer|tdo|dot|ppd|mantoux|t[eé]tano|antitet[aâ]nic|hansen[ií]ase|pqt|paucibacilar|candid[ií]ase|notifica[cç][aã]o\s+compuls/i;

export const BACTERIANAS_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'doencas-bacterianas',
  label: 'Doenças Bacterianas e Fúngicas',
  agentId: BACTERIANAS_A4_MINIMO_AGENT,
  isApplicable: isBacterianasSubtopico,
  whitelist: BACTERIANAS_CLAIM_WHITELIST,
  sensitiveClaimHintRe: BACTERIANAS_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|tubercul|baar|aeross[oó]l|t[eé]tano|hansen[ií]ase|n[aã]o\s+confund/i,
};

export function auditBacterianasA4Minimo(payload: QuestaoLike): BacterianasA4MinimoAudit {
  return auditA4Minimo(BACTERIANAS_A4_MINIMO_CONFIG, payload);
}

export function applyBacterianasA4MinimoMitigation(
  risk: RiskResult,
  audit: BacterianasA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(BACTERIANAS_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithBacterianasA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: BacterianasA4MinimoAudit } {
  return scoreWithA4Minimo(BACTERIANAS_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildBacterianasA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: BacterianasA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(BACTERIANAS_A4_MINIMO_CONFIG, risk, audit, options);
}
