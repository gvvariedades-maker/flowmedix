/**
 * Protocolo A4-mínimo — Vias de Administração (Onda 2).
 * Absorção, 1ª passagem hepática, técnica IM/SC/IV/ID.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_VIAS.md
 * @see docs/PROTOCOLO_A4_MINIMO.md
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

export const VIAS_A4_MINIMO_AGENT = 'agent:vias-a4-minimo-v1';
export const VIAS_SUBTOPICO = 'Vias de Administração';

export type ViasReviewAxis =
  | 'absorcao'
  | 'primeira_passagem'
  | 'vo'
  | 'parenteral'
  | 'tecnica_im'
  | 'sitio_im'
  | 'volume_angulo'
  | 'outras_vias';

export type ViasWhitelistClaim = A4MinimoWhitelistClaim & { axis: ViasReviewAxis };
export type ViasA4MinimoAudit = A4MinimoAudit;

export function isViasSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'vias de administração' ||
    n === 'vias de administracao' ||
    n === 'vias administracao'
  );
}

export const VIAS_CLAIM_WHITELIST: readonly ViasWhitelistClaim[] = [
  {
    id: 'absorcao-trilho-im-sc',
    axis: 'absorcao',
    match:
      /(?:iv|intravenos).{0,40}(?:imediata|100%|biodispon)|im.{0,50}(?:r[aá]pid|frente|>|mais\s+r[aá]pid).{0,50}sc|sc.{0,40}(?:lent|cont[ií]nu)|trilho.{0,40}(?:im|absor)/i,
    canonical: 'Trilho de absorção: IV imediata → IM rápida → SC lenta',
    guidelineEntryId: 'im-absorcao',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-im-lenta-falsa',
    axis: 'absorcao',
    match:
      /im.{0,50}mais\s+lent.{0,50}(?:fals|falso|errad|incorret|→\s*f|invert)|(?:fals|falso|errad).{0,40}im.{0,40}mais\s+lent/i,
    canonical: 'IM mais lenta que SC é pegadinha — item falso',
    guidelineEntryId: 'pegadinha-im-sc',
    groundsNumeric: false,
  },
  {
    id: 'vo-delgado-absorcao',
    axis: 'vo',
    match:
      /intestino\s+delgado.{0,50}(?:absor|principal|maior)|oral.{0,50}delgado|delgado.{0,40}(?:absor|principal)/i,
    canonical: 'Via oral: absorção principal no intestino delgado',
    guidelineEntryId: 'vo-com-alimento',
    groundsNumeric: false,
  },
  {
    id: 'vo-desvantagens-vf',
    axis: 'vo',
    match:
      /desvantagen.{0,50}via\s+oral|paladar.{0,40}medicamento|absor[cç][aã]o\s+n[aã]o\s+imediata|fracionamento.{0,40}(c[aá]psula|dr[aá]gea|comprimido)/i,
    canonical: 'Desvantagens VO: paladar, absorção não imediata, fracionamento difícil',
    guidelineEntryId: 'vo-com-alimento',
    groundsNumeric: false,
  },
  {
    id: 'vo-vantagens-sublingual',
    axis: 'vo',
    match:
      /vantagen.{0,50}via\s+oral|conforto.{0,40}(?:oral|sublingual)|gases?\s+anest[eé]sicos?.{0,40}inalat|inalat[oó]ri.{0,30}n[aã]o\s+oral/i,
    canonical: 'Vantagens VO/sublingual; gases anestésicos = via inalatória (não oral)',
    guidelineEntryId: 'via-inalatoria',
    groundsNumeric: false,
  },
  {
    id: 'sublingual-bypass-irritante',
    axis: 'primeira_passagem',
    match:
      /sublingual.{0,60}(?:1[aª]\s*passagem|passagem\s*hep[aá]tica|irritant|mucosa\s+oral)/i,
    canonical: 'Sublingual: evita 1ª passagem hepática; contraindicada para irritantes',
    guidelineEntryId: 'sublingual-bypass',
    groundsNumeric: false,
  },
  {
    id: 'via-retal-bypass',
    axis: 'primeira_passagem',
    match:
      /retal.{0,60}(?:bypass|1[aª]\s*passagem|sist[eê]mica|irregular|reto\s+inferior|f[ií]gado)/i,
    canonical: 'Via retal: absorção irregular; reto inferior pode atingir circulação sistêmica',
    guidelineEntryId: 'via-retal',
    groundsNumeric: false,
  },
  {
    id: 'parenteral-classica',
    axis: 'parenteral',
    match:
      /parenteral.{0,50}(?:cl[aá]ssic|iv|im|sc|id)|(?:iv|im|sc|id).{0,30}parenteral|endotraqueal.{0,50}(?:n[aã]o|emerg[eê]ncia|especial|fora)/i,
    canonical: 'Parenteral clássica de prova: IV, IM, SC, ID',
    guidelineEntryId: 'ev-absorcao',
    groundsNumeric: false,
  },
  {
    id: 'ventrogluteo-seguro',
    axis: 'sitio_im',
    match:
      /ventrogl[uú]teo.{0,60}(?:segur|recomend|gl[uú]teo\s+m[eé]dio|afasta.{0,30}ci[aá]tic|preferencial)/i,
    canonical: 'Ventroglúteo (glúteo médio) — sítio IM seguro e recomendado',
    guidelineEntryId: 'im-ventrogluteo',
    groundsNumeric: false,
  },
  {
    id: 'pegadinha-ventrogluteo-inseguro',
    axis: 'sitio_im',
    match:
      /ventrogl[uú]teo.{0,50}(?:fals|falso|errad|invert|menos\s+recomend)|(?:fals|falso|errad).{0,40}ventrogl[uú]teo/i,
    canonical: 'Ventroglúteo como inseguro é pegadinha — item falso',
    guidelineEntryId: 'im-ventrogluteo',
    groundsNumeric: false,
  },
  {
    id: 'im-tecnica-palpar',
    axis: 'tecnica_im',
    match:
      /palpar.{0,50}(?:m[uú]sculo|marcos)|marcos\s+[óo]sseos|minimizar.{0,30}dor|tens[aã]o\s+muscular|distra[cç][aã]o/i,
    canonical: 'Técnica IM: palpar músculo, marcos ósseos e cuidados de conforto',
    guidelineEntryId: 'im-tecnica',
    groundsNumeric: false,
  },
  {
    id: 'im-angulo-90',
    axis: 'volume_angulo',
    match: /im.{0,40}90\s*°|ângulo.{0,30}90.{0,30}(?:im|m[uú]sculo)|perpendicular.{0,30}m[uú]sculo/i,
    canonical: 'Punção IM: ângulo 90° (perpendicular ao músculo)',
    guidelineEntryId: 'im-angulo',
    groundsNumeric: true,
  },
  {
    id: 'sc-angulo-volume',
    axis: 'volume_angulo',
    match:
      /sc.{0,40}(?:45|90)\s*°|subcut.{0,40}ângulo|sc.{0,40}(?:1[,.]5|1,5|2)\s*m[lL]|volume.{0,30}(?:m[aá]xim|sc)/i,
    canonical: 'SC: ângulo 45°/90° conforme tecido; volume máximo ~1,5–2 mL por sítio',
    guidelineEntryId: 'sc-angulo',
    groundsNumeric: true,
  },
  {
    id: 'im-deltoide-2ml',
    axis: 'volume_angulo',
    match: /deltoide.{0,40}(?:2\s*m[lL]|at[eé]\s+2\s*m[lL])|at[eé]\s*~?2\s*m[lL].{0,30}deltoide/i,
    canonical: 'Deltoide IM: volume limitado (até 2 mL em adulto)',
    guidelineEntryId: 'im-deltoide',
    groundsNumeric: true,
  },
  {
    id: 'im-glutea-5ml',
    axis: 'volume_angulo',
    match:
      /(?:gl[uú]te|dorsogl[uú]te|ventrogl[uú]te).{0,40}(?:5\s*m[lL]|at[eé]\s+5)|(?:5\s*m[lL]).{0,40}(?:gl[uú]te|dorsogl[uú]te)/i,
    canonical: 'Glútea/dorsoglútea IM: até 5 mL por aplicação',
    guidelineEntryId: 'im-glutea-5ml',
    groundsNumeric: true,
  },
  {
    id: 'im-volume-par-5-2',
    axis: 'volume_angulo',
    match:
      /5\s*m[lL].{0,40}2\s*m[lL]|dorsogl[uú]te.{0,40}deltoide.{0,40}(?:5|2)\s*m[lL]/i,
    canonical: 'Par clássico: dorsoglútea 5 mL + deltoide 2 mL',
    guidelineEntryId: 'im-glutea-5ml',
    groundsNumeric: true,
  },
  {
    id: 'im-ventrogluteo-2ml-agulha',
    axis: 'volume_angulo',
    match:
      /ventrogl[uú]teo.{0,50}(?:2\s*m[lL]|30\s*[x×]0[,.]6)|(?:2\s*m[lL]).{0,40}ventrogl[uú]teo|30\s*[x×]0[,.]6/i,
    canonical: 'Ventroglúteo adulto: 2 mL; agulha 30×0,6–0,7 mm',
    guidelineEntryId: 'im-ventrogluteo-2ml',
    groundsNumeric: true,
  },
  {
    id: 'im-vastolateral-pediatria',
    axis: 'sitio_im',
    match: /vasto\s+lateral.{0,50}(?:lactent|crian[cç]a|neonat|segur)/i,
    canonical: 'Vasto lateral — sítio IM seguro em lactentes e crianças',
    guidelineEntryId: 'im-vastolateral',
    groundsNumeric: false,
  },
  {
    id: 'intradermica-teste',
    axis: 'outras_vias',
    match: /intrad[eé]rmic|ppd|tuberculina|(?:10|15)\s*°.{0,30}(?:id|intrad)|p[aá]pulo/i,
    canonical: 'Intradérmica: bevel para cima, 10–15°, bolsa pápulo visível',
    guidelineEntryId: 'intradermica-teste',
    groundsNumeric: true,
  },
  {
    id: 'ev-bolus-lenta',
    axis: 'parenteral',
    match: /ev.{0,40}(?:lenta|bolus).{0,40}(?:3|5)\s*min|administrar\s+lentamente/i,
    canonical: 'EV direta lenta: bolus em 3 a 5 minutos (ou conforme bula)',
    guidelineEntryId: 'ev-direta-lenta',
    groundsNumeric: true,
  },
  {
    id: 'via-inalatoria',
    axis: 'outras_vias',
    match: /inalat[oó]ri|broncodilat|dispositivo\s+inhal|mucosa\s+pulmonar/i,
    canonical: 'Via inalatória: ação rápida na mucosa pulmonar',
    guidelineEntryId: 'via-inalatoria',
    groundsNumeric: false,
  },
  {
    id: 'via-topica',
    axis: 'outras_vias',
    match: /t[oó]pic|pomada|creme|col[ií]rio|s[ií]tio\s+de\s+aplica/i,
    canonical: 'Via tópica: ação local no sítio de aplicação',
    guidelineEntryId: 'via-topica',
    groundsNumeric: false,
  },
  {
    id: 'vo-jejum',
    axis: 'vo',
    match: /jejum.{0,40}(?:30\s*min|2\s*h)|vo.{0,40}jejum|levotiroxina/i,
    canonical: 'VO em jejum: 30 min antes ou 2 h após refeição (quando indicado)',
    guidelineEntryId: 'vo-jejum',
    groundsNumeric: true,
  },
  {
    id: 'noradrenalina-glicose-central',
    axis: 'parenteral',
    match:
      /noradrenalina.{0,60}(?:glicos|glicose\s*5|5\s*%|central)|glicosado\s*5\s*%.{0,40}(?:noradrenalina|vasopressor|central)/i,
    canonical: 'Noradrenalina: glicose 5% + acesso venoso central preferencial',
    guidelineEntryId: 'noradrenalina-glicose-5',
    groundsNumeric: true,
  },
];

const VIAS_SENSITIVE_RE =
  /\b\d+([.,]\d+)?\s*m[lL]\b|\d+\s*°|ângulo|angulo|absor[cç][aã]o|biodispon|1[aª]\s*passagem|sublingual|intramuscular|subcut|intraven|ventrogl[uú]teo|deltoide|vasto\s+lateral|endotraqueal|intratecal|intrad[eé]rmic|retal|jejum|inalat[oó]ri|parenteral|IM\s*>\s*SC|iv\s+imediata|intestino\s+delgado/i;

function hasAffirmedWrongImSlowTeaching(corpus: string): boolean {
  const withoutLogic = corpus.replace(/\{"type":"logic_flow"[\s\S]*?\}(?=\s*\{|$)/g, ' ');
  const wrongValue = /"value":"[^"]*\bIM\b[^"]*mais\s+lent[aã][^"]*\bSC\b/i.test(withoutLogic);
  const wrongDetail = /"detail":"[^"]*\bIM\b[^"]*mais\s+lent[aã][^"]*\bSC\b/i.test(withoutLogic);
  const negated =
    /"(?:value|detail)":"[^"]*(?:fals|errad|invert|pegadinha)/i.test(withoutLogic);
  return (wrongValue || wrongDetail) && !negated;
}

export const VIAS_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'vias',
  label: 'Vias',
  agentId: VIAS_A4_MINIMO_AGENT,
  isApplicable: isViasSubtopico,
  whitelist: VIAS_CLAIM_WHITELIST,
  sensitiveClaimHintRe: VIAS_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|trilho|delgado|IM\s*>\s*SC|parenteral|1[aª]\s*passagem|monte mentalmente|via\s*→/i,
  extraUnmatchedSensitive: (corpus, matchedIds) => {
    const snippets: string[] = [];
    const withoutLogic = corpus.replace(/\{"type":"logic_flow"[\s\S]*?\}(?=\s*\{|$)/g, ' ');
    const wrongScMax =
      /sc.{0,30}(?:at[eé]|m[aá]xim).{0,20}3\s*m[lL]|3\s*m[lL].{0,30}(?:sc|subcut)/i.test(withoutLogic) &&
      !matchedIds.has('sc-angulo-volume');
    if (wrongScMax) snippets.push('sc_volume_3ml_nao_grounded');
    if (hasAffirmedWrongImSlowTeaching(corpus)) {
      snippets.push('im_mais_lenta_teaching_affirmed');
    }
    return snippets;
  },
};

export function auditViasA4Minimo(payload: QuestaoLike): ViasA4MinimoAudit {
  return auditA4Minimo(VIAS_A4_MINIMO_CONFIG, payload);
}

export function applyViasA4MinimoMitigation(
  risk: RiskResult,
  audit: ViasA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(VIAS_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithViasA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: ViasA4MinimoAudit } {
  return scoreWithA4Minimo(VIAS_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildViasA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: ViasA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(VIAS_A4_MINIMO_CONFIG, risk, audit, options);
}
