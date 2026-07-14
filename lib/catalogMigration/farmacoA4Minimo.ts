/**
 * Protocolo A4-mínimo — Farmacodinâmica e Farmacocinética (Onda nota-10).
 * ADME, meia-vida, metabólitos ativos, infusão EV e interações.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_FARMACODINAMICA.md
 * @see lib/guidelines/farmacodinamica.ts
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

export const FARMACO_A4_MINIMO_AGENT = 'agent:farmaco-a4-minimo-v1';
export const FARMACO_SUBTOPICO = 'Farmacodinâmica e Farmacocinética';

export type FarmacoReviewAxis =
  | 'adme'
  | 'meia_vida'
  | 'metabolismo'
  | 'farmacodinamica'
  | 'infusao'
  | 'interacao'
  | 'pegadinha';

export type FarmacoWhitelistClaim = A4MinimoWhitelistClaim & { axis: FarmacoReviewAxis };
export type FarmacoA4MinimoAudit = A4MinimoAudit;

export function isFarmacoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'farmacodinâmica e farmacocinética' ||
    n === 'farmacodinamica e farmacocinetica' ||
    n === 'farmacodinâmica' ||
    n === 'farmacodinamica'
  );
}

export const FARMACO_CLAIM_WHITELIST: readonly FarmacoWhitelistClaim[] = [
  {
    id: 'adme-absorcao',
    axis: 'adme',
    match: /absor[cç][aã]o.{0,40}(?:sangue|plasma|ADME)|ADME.{0,30}absor/i,
    canonical: 'Absorção — passagem do fármaco à circulação',
    guidelineEntryId: 'adme-absorcao',
    groundsNumeric: false,
  },
  {
    id: 'adme-metabolismo-hepatico',
    axis: 'metabolismo',
    match:
      /metabolismo\s+hep[aá]tic|biotransforma[cç][aã]o\s+hep[aá]tic|f[ií]gado.{0,40}metabol|primeira\s+passagem/i,
    canonical: 'Metabolismo hepático / primeira passagem',
    guidelineEntryId: 'adme-metabolismo',
    groundsNumeric: false,
  },
  {
    id: 'biodisponibilidade-ev',
    axis: 'adme',
    match: /biodisponibilidade.{0,30}(?:100|ev|endoven)|via\s+ev.{0,30}(?:100|imediata)/i,
    canonical: 'EV — biodisponibilidade 100%',
    guidelineEntryId: 'biodisponibilidade-ev',
    groundsNumeric: true,
  },
  {
    id: 'meia-vida-def',
    axis: 'meia_vida',
    match: /meia[\s-]?vida|t\s*½|tempo\s+para\s+reduzir\s+concentra[cç][aã]o/i,
    canonical: 'Meia-vida — tempo para reduzir concentração pela metade',
    guidelineEntryId: 'meia-vida',
    groundsNumeric: false,
  },
  {
    id: 'metabolitos-ativos-bzd',
    axis: 'metabolismo',
    match:
      /metab[oó]litos?\s+ativos?.{0,50}(?:midazolam|diazepam|benzodiazep|ac[uú]mul)|(?:midazolam|diazepam).{0,50}metab[oó]litos?\s+ativos?/i,
    canonical: 'BZD — metabólitos ativos e acúmulo em uso prolongado',
    guidelineEntryId: 'sindrome-abstinencia',
    groundsNumeric: false,
  },
  {
    id: 'acumulo-infusao-prolongada',
    axis: 'infusao',
    match:
      /infus[aã]o\s+prolongad|infus[aã]o\s+cont[ií]nua.{0,40}(?:ac[uú]mul|dias)|ac[uú]mul.{0,40}infus/i,
    canonical: 'Infusão prolongada — risco de acúmulo de fármaco/metabólitos',
    guidelineEntryId: 'tolerancia',
    groundsNumeric: false,
  },
  {
    id: 'interacao-opioide-bzd',
    axis: 'interacao',
    match:
      /(?:opioide|morfina|fentanil).{0,50}(?:benzodiazep|midazolam|diazepam)|(?:benzodiazep|midazolam|diazepam).{0,50}opioide/i,
    canonical: 'BZD + opioide — sinergismo depressor do SNC',
    guidelineEntryId: 'antagonista',
    groundsNumeric: false,
  },
  {
    id: 'agonista-antagonista',
    axis: 'farmacodinamica',
    match: /agonista\s+(?:total|parcial)|antagonista\s+(?:competitivo|neutro)|receptor.{0,30}(?:chave|fechadura)/i,
    canonical: 'Agonismo/antagonismo em receptor',
    guidelineEntryId: 'agonista',
    groundsNumeric: false,
  },
  {
    id: 'indice-terapeutico-estreito',
    axis: 'pegadinha',
    match: /[ií]ndice\s+terap[eê]utico\s+estreit|faixa\s+terap[eê]utica\s+estreit|digoxina|varfarina|fenito[ií]na|l[ií]tio/i,
    canonical: 'Índice terapêutico estreito — monitorar níveis',
    guidelineEntryId: 'faixa-terapeutica-estreita',
    groundsNumeric: true,
  },
  {
    id: 'pegadinha-tolerancia-dependencia',
    axis: 'pegadinha',
    match: /toler[aâ]ncia.{0,40}depend[eê]ncia|depend[eê]ncia.{0,40}toler[aâ]ncia/i,
    canonical: 'Tolerância ≠ dependência — mecanismos distintos',
    guidelineEntryId: 'pegadinha-tolerancia-dependencia',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-potencia-eficacia',
    axis: 'pegadinha',
    match: /pot[eê]ncia.{0,30}efic[aá]cia|mais\s+potente.{0,30}mais\s+eficaz/i,
    canonical: 'Potência ≠ eficácia máxima',
    guidelineEntryId: 'potencia-eficacia',
    groundsNumeric: false,
  },
  {
    id: 'despertar-tardio-sedacao',
    axis: 'infusao',
    match:
      /despertar\s+tardio|seda[cç][aã]o\s+residual|rebaixamento.{0,40}consci[eê]ncia.{0,40}(?:suspens|ap[oó]s)/i,
    canonical: 'Sedação residual pós-infusão — acúmulo farmacocinético',
    guidelineEntryId: 'meia-vida-clinica',
    groundsNumeric: false,
  },
  {
    id: 'ibp-ev-monitorizacao-ph',
    axis: 'infusao',
    match:
      /pH\s+g[aá]stric|omeprazol|IBP|inibidor.{0,25}bomba|infus[aã]o\s+cont[ií]nua.{0,40}(?:pH|dose)|dilui[cç][aã]o.{0,30}omeprazol/i,
    canonical: 'IBP EV — infusão monitorada com ajuste conforme pH/resposta',
    guidelineEntryId: 'biodisponibilidade-ev',
    groundsNumeric: false,
  },
  {
    id: 'insulina-perfil-acao',
    axis: 'farmacodinamica',
    match:
      /insulina\s+asparte|insulina\s+regular|ultrarr[aá]pida.{0,30}(?:r[aá]pida|lenta)|perfil\s+de\s+a[cç][aã]o.{0,30}insulina/i,
    canonical: 'Insulina asparte = ultrarrápida; regular = ação rápida',
    guidelineEntryId: 'farmacodinamica-def',
    groundsNumeric: false,
  },
  {
    id: 'farmacovigilancia-notificacao',
    axis: 'pegadinha',
    match:
      /farmacovigil[aâ]ncia|notifica[cç][aã]o.{0,40}(?:RAM|rea[cç][aã]o\s+adversa)|vigil[aâ]ncia\s+sanit[aá]ria/i,
    canonical: 'Farmacovigilância — notificação de reações adversas (Anvisa)',
    guidelineEntryId: 'pegadinha-generico-similar',
    groundsNumeric: false,
  },
  {
    id: 'anestesico-local-canal-sodio',
    axis: 'farmacodinamica',
    match:
      /anest[eé]sico\s+local|lidoca[ií]na|bupivaca[ií]na|bloqueio.{0,25}canal\s+de\s+s[oó]dio|anest[eé]sico\s+geral/i,
    canonical: 'Anestésico local bloqueia canal de sódio — diferente do geral',
    guidelineEntryId: 'agonista',
    groundsNumeric: false,
  },
];

const FARMACO_SENSITIVE_RE =
  /\b\d+([.,]\d+)?\s*(mg|ml|h\b|hora|horas|min|dia|dias|%|UI)\b|meia[\s-]?vida|ADME|biodisponibil|primeira\s+passagem|metab[oó]litos?\s+ativos?|midazolam|diazepam|omeprazol|insulina|farmacovigil|infus[aã]o|ac[uú]mul|CYP|agonista|antagonista|toler[aâ]ncia|depend[eê]ncia|[ií]ndice\s+terap[eê]utico|pH\s+g[aá]stric|anest[eé]sico/i;

export const FARMACO_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'farmaco',
  label: 'Farmacodinâmica',
  agentId: FARMACO_A4_MINIMO_AGENT,
  isApplicable: isFarmacoSubtopico,
  whitelist: FARMACO_CLAIM_WHITELIST,
  sensitiveClaimHintRe: FARMACO_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|ac[uú]mul|metab[oó]litos?|n[aã]o\s+confund|meia[\s-]?vida/i,
};

export function auditFarmacoA4Minimo(payload: QuestaoLike): FarmacoA4MinimoAudit {
  return auditA4Minimo(FARMACO_A4_MINIMO_CONFIG, payload);
}

export function applyFarmacoA4MinimoMitigation(
  risk: RiskResult,
  audit: FarmacoA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(FARMACO_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithFarmacoA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: FarmacoA4MinimoAudit } {
  return scoreWithA4Minimo(FARMACO_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildFarmacoA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: FarmacoA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(FARMACO_A4_MINIMO_CONFIG, risk, audit, options);
}
