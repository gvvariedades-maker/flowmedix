/**
 * Protocolo A4-mínimo — História da Enfermagem (Onda 1).
 * Baixo risco clínico: marcos históricos + COFEN/ética.
 *
 * @see docs/PROTOCOLO_A4_MINIMO_HISTORIA.md
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

export const HISTORIA_A4_MINIMO_AGENT = 'agent:historia-a4-minimo-v1';
export const HISTORIA_SUBTOPICO = 'História da Enfermagem';

export function isHistoriaSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'história da enfermagem' ||
    n === 'historia da enfermagem' ||
    n === 'história enfermagem'
  );
}

export type HistoriaWhitelistClaim = A4MinimoWhitelistClaim;
export type HistoriaA4MinimoAudit = A4MinimoAudit;

export const HISTORIA_CLAIM_WHITELIST: readonly HistoriaWhitelistClaim[] = [
  {
    id: 'nightingale-fundadora',
    axis: 'nightingale',
    match:
      /nightingale|florence.{0,40}(?:fundadora|moderna|crimeia)|dama\s+da\s+l[aâ]mpada/i,
    canonical: 'Florence Nightingale — fundadora da enfermagem moderna',
    guidelineEntryId: 'nightingale',
    groundsNumeric: false,
  },
  {
    id: 'florence-crimeia-mortalidade',
    axis: 'nightingale',
    match:
      /crimeia|mortalidade.{0,30}(?:40|2)\s*%|(?:40|2)\s*%.{0,40}mortal|higiene.{0,30}(?:scutari|crimeia)/i,
    canonical: 'Crimeia: higiene/estatística reduziram mortalidade hospitalar',
    guidelineEntryId: 'florence-crimeia-estatisticas',
    groundsNumeric: true,
  },
  {
    id: 'cofen-etica',
    axis: 'etica',
    match:
      /c[oó]digo\s+de\s+[eé]tica.{0,40}cofen|cofen.{0,40}(?:[eé]tica|normatiza|federal)/i,
    forbid: /c[oó]digo\s+de\s+[eé]tica.{0,30}coren/i,
    canonical: 'Código de Ética é norma do COFEN',
    guidelineEntryId: 'codigo-etica',
    groundsNumeric: false,
  },
  {
    id: 'coren-vs-cofen',
    axis: 'etica',
    match:
      /coren.{0,50}(?:estadual|fiscaliza)|cofen.{0,40}coren|n[aã]o\s+confundir.{0,20}cofen/i,
    canonical: 'COFEN federal × COREN estadual — não confundir',
    guidelineEntryId: 'coren-papel',
    groundsNumeric: false,
  },
  {
    id: 'enfermagem-pre-sus',
    axis: 'brasil',
    match:
      /(?:anterior|antes|pr[eé]).{0,20}sus|n[aã]o\s+surgiu\s+(?:apenas\s+)?ap[oó]s.{0,15}sus|sus.{0,40}(?:n[aã]o\s+criou|reorganiz)/i,
    canonical: 'Enfermagem brasileira é anterior ao SUS (1988)',
    guidelineEntryId: 'pegadinha-sus',
    groundsNumeric: false,
  },
  {
    id: 'ana-neri',
    axis: 'pioneiras',
    match: /ana\s+n[eé]ri|guerra\s+do\s+paraguai.{0,40}enferm/i,
    canonical: 'Ana Néri — símbolo histórico (Paraguai), não a primeira diplomada',
    guidelineEntryId: 'ana-neri',
    groundsNumeric: false,
  },
  {
    id: 'eulalia-escola-anna-nery',
    axis: 'pioneiras',
    match:
      /eul[aá]lia|escola\s+anna\s+nery|primeira\s+escola.{0,30}enferm/i,
    canonical: 'Eulália Paiva / Escola Anna Nery — primeira escola formal (1890)',
    guidelineEntryId: 'escola-anna-nery',
    groundsNumeric: false,
  },
  {
    id: 'lei-7498',
    axis: 'legislacao',
    match: /lei\s*7\.?498|7\.498\/?86|exerc[ií]cio\s+da\s+enfermagem/i,
    canonical: 'Lei 7.498/86 regula o exercício da enfermagem',
    guidelineEntryId: 'lei-7498-86',
    groundsNumeric: false,
  },
  {
    id: 'decreto-94406',
    axis: 'legislacao',
    match: /decreto\s*94\.?406|94\.406\/?87/i,
    canonical: 'Decreto 94.406/87 regulamenta a Lei 7.498/86',
    guidelineEntryId: 'decreto-94406-87',
    groundsNumeric: false,
  },
  {
    id: 'dia-12-maio',
    axis: 'nightingale',
    match: /12\s+de\s+maio|dia\s+internacional\s+da\s+enfermagem/i,
    canonical: '12 de maio — Dia Internacional da Enfermagem',
    guidelineEntryId: 'dia-internacional-enfermagem',
    groundsNumeric: false,
  },
  {
    id: 'peplau-relacao',
    axis: 'teorias',
    match: /peplau|rela[cç][oõ]es\s+interpessoais|hildegard/i,
    canonical: 'Peplau — relações interpessoais enfermeiro–paciente',
    guidelineEntryId: 'teoria-peplau',
    groundsNumeric: false,
  },
  {
    id: 'cepe-codigo-etica',
    axis: 'etica',
    match: /c[oó]digo\s+de\s+[eé]tica|\bcepe\b/i,
    canonical: 'Código de Ética dos Profissionais de Enfermagem (CEPE)',
    guidelineEntryId: 'codigo-etica',
    groundsNumeric: false,
  },
  {
    id: 'cofen-res-564-direitos',
    axis: 'etica',
    match:
      /res\.?\s*cofen|resolu[cç][aã]o\s+cofen|cofen.{0,24}564|comiss[aã]o\s+de\s+[eé]tica|direitos?\s+do\s+profissional/i,
    canonical: 'Resolução COFEN 564/2017 — direitos do profissional',
    guidelineEntryId: 'etica-autonomia-beneficencia',
    groundsNumeric: false,
  },
  {
    id: 'revolta-vacina-1904',
    axis: 'brasil',
    match: /revolta\s+da\s+vacina|1904.{0,40}(?:vacina|imuniza)|resist[eê]ncia.{0,40}vacina\s+obrig/i,
    canonical: 'Revolta da Vacina (1904) — resistência à imunização compulsória',
    guidelineEntryId: 'henrique-dutra-vargas',
    groundsNumeric: true,
  },
  {
    id: 'cf88-sus-universal',
    axis: 'brasil',
    match: /cf\s*\/?\s*88|constitui[cç][aã]o.{0,30}1988|1988.{0,40}\bsus\b|\bsus\b.{0,40}universal/i,
    canonical: 'Constituição de 1988 — SUS universal',
    guidelineEntryId: 'pegadinha-sus',
    groundsNumeric: true,
  },
  {
    id: 'caps-1923-previdencia',
    axis: 'brasil',
    match: /\bcaps?\b|1923.{0,40}(?:previd|aposent)|aposentadoria.{0,30}pens/i,
    canonical: 'CAPs (1923) — previdência, não universalidade',
    guidelineEntryId: 'henrique-dutra-vargas',
    groundsNumeric: true,
  },
  {
    id: 'horta-necessidades',
    axis: 'teorias',
    match: /wanda\s+(?:de\s+aguiar\s+)?horta|horta.{0,40}necessidades|necessidades\s+humanas\s+b[aá]sicas/i,
    canonical: 'Wanda Horta — necessidades humanas básicas',
    guidelineEntryId: 'teorias-enfermagem-classicas',
    groundsNumeric: false,
  },
  {
    id: 'hepatite-b-sinan-stats',
    axis: 'epidemiologia',
    match: /36[.,]8\s*%|21[.,]7\s*%|hepatite\s+b.{0,40}sinan|sinan.{0,40}hepatite/i,
    canonical: 'Hepatite B — estatísticas Sinan/MS (Boletim Epidemiológico)',
    guidelineEntryId: 'hepatite-b-sinan-epidemiologia',
    groundsNumeric: true,
  },
];

/** Marcos/anos/% que pedem whitelist quando aparecem nos slides. */
const HISTORIA_SENSITIVE_RE =
  /\b(18|19|20)\d{2}\b|\b\d+([.,]\d+)?\s*%|lei\s*7\.?498|decreto\s*94|nightingale|florence|cofen|coren|\bsus\b|crimeia|anna?\s*ner|eul[aá]lia|peplau|12\s+de\s+maio/i;

export const HISTORIA_A4_MINIMO_CONFIG: A4MinimoPackageConfig = {
  packageId: 'historia',
  label: 'História',
  agentId: HISTORIA_A4_MINIMO_AGENT,
  isApplicable: isHistoriaSubtopico,
  whitelist: HISTORIA_CLAIM_WHITELIST,
  sensitiveClaimHintRe: HISTORIA_SENSITIVE_RE,
  minDangerItems: 3,
  fixacaoStepRe:
    /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|cronologia|n[aã]o\s+confund|sus\s+reorganiz/i,
};

export function auditHistoriaA4Minimo(payload: QuestaoLike): HistoriaA4MinimoAudit {
  return auditA4Minimo(HISTORIA_A4_MINIMO_CONFIG, payload);
}

export function applyHistoriaA4MinimoMitigation(
  risk: RiskResult,
  audit: HistoriaA4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  return applyA4MinimoMitigation(HISTORIA_A4_MINIMO_CONFIG, risk, audit, options);
}

export function scoreQuestaoRiskWithHistoriaA4Minimo(
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: HistoriaA4MinimoAudit } {
  return scoreWithA4Minimo(HISTORIA_A4_MINIMO_CONFIG, scoreFn, payload, context);
}

export function buildHistoriaA4MinimoEfficacyContract(
  risk: RiskResult,
  audit: HistoriaA4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  return buildA4MinimoEfficacyContract(HISTORIA_A4_MINIMO_CONFIG, risk, audit, options);
}
