/**
 * Guideline golden-v1 — Punção Venosa e Cuidados com Cateteres.
 * @see lib/guidelines/puncaoVenosa.ts
 * @see docs/GOLDEN_CONTENT_STANDARD.md
 */
import type { ContentSource, GoldenContentLintIssue } from '@/lib/goldenContentStandard';
import { POTTER_PERRY_FUNDAMENTOS_11ED, PUNCAO_CATETER_ANVISA, SAE_COFEN_358 } from '@/lib/guidelines';

export const PUNCAO_SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';

export function isPuncaoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'punção venosa e cuidados com cateteres' ||
    n === 'punção venosa' ||
    n === 'cateteres'
  );
}

/** Claims técnicos que exigem snapshot Anvisa/COFEN explícito. */
export const PUNCAO_NUMERIC_TECHNICAL_RE =
  /\d+\s*(horas?|h\b|minutos?|segundos?|dias?)|\b\d{1,2}\s*g\b|\bgauge\b|french|charri[eè]re|\bch\b|\d+\s*°|\bangulo|ângulo|72\s*h|96\s*h|0[,.]5\s*%|clorexidina/i;

const LEGACY_GENERIC_SOURCE_IDS = new Set([
  'cofen-puncao-complicacoes',
  'cofen-res-358-2009',
  'manual-tecnico-enfermagem-avp',
]);

const PUNCAO_MANUAL_TEC = {
  id: 'manual-tecnico-enfermagem-avp',
  tier: 'B' as const,
  issuer: 'Literatura técnica de enfermagem',
  title: 'Manual do técnico de enfermagem — acesso venoso e complicações',
  year: 2021,
  covers: ['venoclise', 'nomenclatura popular', 'infiltração coloquial'],
};

type SlideLike = Record<string, unknown>;

function slidesOf(payload: {
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): SlideLike[] {
  return payload.reverse_study_slides ?? payload.study_slides ?? [];
}

function collectCorpus(payload: {
  question_data?: { instruction?: string; options?: { text?: string }[] };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): string {
  const options = payload.question_data?.options?.map((o) => o.text).join(' ') ?? '';
  const slides = slidesOf(payload);
  const slideText = slides.map((s) => JSON.stringify(s)).join(' ');
  return `${payload.question_data?.instruction ?? ''} ${options} ${slideText}`;
}

export function inferPuncaoSourceCovers(corpus: string): string[] {
  const c = corpus.toLowerCase();
  const covers = new Set<string>();

  if (/flebite|flebitis|endoflebite|tromboflebite/.test(c)) covers.add('flebite');
  if (/infiltra|extravasa/.test(c)) covers.add('infiltração');
  if (/hematoma|equimose/.test(c)) covers.add('hematoma');
  if (/êmbolo|embolo|coágulo|coagulo/.test(c)) covers.add('êmbolo');
  if (/esclerose/.test(c)) covers.add('esclerose');
  if (/bundle|ipcs|corrente sanguínea|cvc|cateter venoso central|barreira estéril máxima|barreira esteril maxima/.test(c)) {
    covers.add('bundle CVC');
    covers.add('prevenção IPCS');
  }
  if (/clorexidina|antissepsia|assepsia|pvpi|povidona|álcool 70|alcool 70/.test(c)) {
    covers.add('antissepsia da pele');
  }
  if (/jelco|scalp|escalpe|gauge|calibre|\b\d{1,2}\s*g\b|french|charri[eè]re/.test(c)) {
    covers.add('dispositivo venoso');
    covers.add('calibre');
  }
  if (/\d+\s*(horas?|h\b|minutos?|dias?)|permanência|permanencia|troca.*equipo|intervalo|72\s*h/.test(c)) {
    covers.add('tempo de permanência');
    covers.add('troca de equipos');
  }
  if (/prontuário|prontuario|registro|documenta|comunica|anotação|anotacao|sae/.test(c)) {
    covers.add('documentação');
    covers.add('registro de enfermagem');
  }
  if (/venóclise|venoclise|macro gota|micro gota/.test(c)) {
    covers.add('venoclise');
  }
  if (/pun[cç][ãa]o|acesso venoso|cateter|avp/.test(c)) {
    covers.add('acesso venoso periférico');
  }
  if (/nome popular|coloquial|popular/.test(c)) {
    covers.add('nomenclatura popular');
  }

  if (covers.size === 0) {
    covers.add('punção venosa');
    covers.add('cuidados com cateter');
  }

  return [...covers].slice(0, 10);
}

export function buildPuncaoAnvisaSource(corpus: string): ContentSource {
  return {
    id: PUNCAO_CATETER_ANVISA.id,
    tier: 'A',
    issuer: PUNCAO_CATETER_ANVISA.issuer,
    title: PUNCAO_CATETER_ANVISA.title,
    year: PUNCAO_CATETER_ANVISA.year,
    url: PUNCAO_CATETER_ANVISA.url,
    covers: inferPuncaoSourceCovers(corpus),
  };
}

export function buildPuncaoSae358Source(corpus: string): ContentSource {
  const covers = inferPuncaoSourceCovers(corpus).filter((x) =>
    /documentação|registro|prontuário|comunicação|avp/i.test(x),
  );
  return {
    id: SAE_COFEN_358.id,
    tier: 'A',
    issuer: SAE_COFEN_358.issuer,
    title: SAE_COFEN_358.title,
    year: SAE_COFEN_358.year,
    url: SAE_COFEN_358.url,
    covers: covers.length > 0 ? covers : ['documentação', 'registro de enfermagem'],
  };
}

export function buildPuncaoManualTecSource(corpus: string): ContentSource {
  return {
    ...PUNCAO_MANUAL_TEC,
    covers: inferPuncaoSourceCovers(corpus).filter((x) =>
      /popular|venoclise|coloquial/i.test(x),
    ).length
      ? inferPuncaoSourceCovers(corpus).filter((x) => /popular|venoclise/i.test(x))
      : ['nomenclatura popular', 'venoclise'],
  };
}

export function buildPuncaoPotterSource(corpus: string): ContentSource {
  const covers = inferPuncaoSourceCovers(corpus).filter((x) =>
    /flebite|infiltra|hematoma|êmbolo|embolo|acesso venoso|cateter|antissepsia|punção|puncao|dispositivo|calibre|manutenção|manutencao/i.test(
      x,
    ),
  );
  return {
    id: POTTER_PERRY_FUNDAMENTOS_11ED.id,
    tier: 'B',
    issuer: POTTER_PERRY_FUNDAMENTOS_11ED.issuer,
    title: `${POTTER_PERRY_FUNDAMENTOS_11ED.title} — Acesso venoso e complicações`,
    year: POTTER_PERRY_FUNDAMENTOS_11ED.year,
    covers:
      covers.length > 0
        ? covers
        : ['acesso venoso periférico', 'complicações locais', 'técnica de punção'],
  };
}

function needsSae358Source(corpus: string): boolean {
  return /prontuário|prontuario|registro|documenta|comunica|anotação|anotacao|falha de comunicação|sae\b|avp/i.test(
    corpus,
  );
}

function needsManualTecSource(corpus: string): boolean {
  return /venóclise|venoclise|nome popular|coloquial|flebite.*popular|popular.*flebite/i.test(corpus);
}

function trimGuidelineSnapshot(text: string, max = 200): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function buildPuncaoGuidelineSnapshot(corpus: string, existing?: string): string {
  const c = corpus.toLowerCase();
  const base = `${PUNCAO_CATETER_ANVISA.issuer} — ${PUNCAO_CATETER_ANVISA.snapshot}`;
  const themes: string[] = [];

  if (/flebite|infiltra|extravasa|hematoma|êmbolo|embolo/.test(c)) {
    themes.push('complicações locais AVP');
  }
  if (/bundle|ipcs|cvc|corrente sanguínea/.test(c)) themes.push('bundle CVC / IPCS');
  if (/clorexidina|antissepsia|pun[cç][ãa]o periférica/.test(c)) themes.push('antissepsia e técnica');
  if (/\d+\s*h|troca|permanência|intervalo/.test(c)) themes.push('tempo e troca de equipos');
  if (/jelco|scalp|gauge|calibre/.test(c)) themes.push('dispositivo e calibre');
  if (needsSae358Source(corpus)) themes.push('documentação COFEN 358/2009');
  if (needsManualTecSource(corpus)) themes.push('nomenclatura popular × norma técnica');
  themes.push('Potter & Perry 11ª ed. (AVP)');

  const themeSuffix = themes.length > 0 ? ` (${[...new Set(themes)].join('; ')})` : '';
  const canonical = `${base}${themeSuffix}`;

  const trimmed = existing?.trim();
  if (!trimmed) return trimGuidelineSnapshot(canonical);
  if (/anvisa\s*\/\s*cofen|cofen.*358\/2009|puncao-cateter-anvisa|potter|perry/i.test(trimmed)) {
    return trimGuidelineSnapshot(trimmed);
  }
  const merged = `${canonical} · ${trimmed}`;
  if (merged.length > 200) return trimGuidelineSnapshot(canonical);
  return merged;
}

export function buildPuncaoSourcesForSlug(corpus: string): ContentSource[] {
  const sources: ContentSource[] = [
    buildPuncaoAnvisaSource(corpus),
    buildPuncaoPotterSource(corpus),
  ];
  if (needsSae358Source(corpus)) {
    sources.push(buildPuncaoSae358Source(corpus));
  }
  if (needsManualTecSource(corpus)) {
    sources.push(buildPuncaoManualTecSource(corpus));
  }
  return sources;
}

export function needsPuncaoGuidelineMeta(payload: {
  meta?: { subtopico?: string; content_standard?: string; sources?: ContentSource[] };
  question_data?: { instruction?: string; options?: { text?: string }[] };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): boolean {
  const sub = payload.meta?.subtopico?.trim() ?? '';
  if (!isPuncaoSubtopico(sub)) return false;
  if (payload.meta?.content_standard !== 'golden-v1') return false;

  const sources = payload.meta?.sources ?? [];
  const hasAnvisa = sources.some((s) => s.id === PUNCAO_CATETER_ANVISA.id);
  const hasPotter = sources.some((s) => s.id === POTTER_PERRY_FUNDAMENTOS_11ED.id);
  const hasLegacyOnly =
    sources.length > 0 &&
    sources.every((s) => LEGACY_GENERIC_SOURCE_IDS.has(s.id) || !s.url?.trim());
  const snapshot = (
    payload.meta as { content_review?: { guideline_snapshot?: string } } | undefined
  )?.content_review?.guideline_snapshot;
  const snapshotCanonical =
    snapshot &&
    /anvisa|cofen.*358|puncao-cateter-anvisa|potter|perry/i.test(snapshot);

  return !hasAnvisa || !hasPotter || hasLegacyOnly || !snapshotCanonical;
}

export type EnrichPuncaoGuidelineMetaResult = {
  payload: Record<string, unknown>;
  changed: boolean;
  reasons: string[];
};

/** Garante meta.sources canônicas (Anvisa + COFEN 358 quando cabível) e guideline_snapshot. */
export function enrichPuncaoGuidelineMeta(
  payload: Record<string, unknown>,
  options: { forceSnapshot?: boolean } = {},
): EnrichPuncaoGuidelineMetaResult {
  if (!needsPuncaoGuidelineMeta(payload as never)) {
    return { payload, changed: false, reasons: [] };
  }

  const reasons: string[] = [];
  const rawMeta = payload.meta;
  const meta: Record<string, unknown> =
    rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta)
      ? { ...(rawMeta as Record<string, unknown>) }
      : {};

  const corpus = collectCorpus(payload as never);
  let existingSources = Array.isArray(meta.sources)
    ? ([...(meta.sources as ContentSource[])] as ContentSource[])
    : [];

  existingSources = existingSources.filter((s) => !LEGACY_GENERIC_SOURCE_IDS.has(s.id));

  const canonical = buildPuncaoSourcesForSlug(corpus);
  for (const src of canonical) {
    const idx = existingSources.findIndex((s) => s.id === src.id);
    if (idx < 0) {
      existingSources.unshift(src);
      reasons.push(`added_${src.id}`);
    } else {
      const merged = new Set([...(existingSources[idx].covers ?? []), ...(src.covers ?? [])]);
      existingSources[idx] = {
        ...existingSources[idx],
        ...src,
        covers: [...merged].slice(0, 10),
      };
      reasons.push(`merged_${src.id}`);
    }
  }

  meta.sources = existingSources;

  const review =
    meta.content_review && typeof meta.content_review === 'object'
      ? { ...(meta.content_review as Record<string, unknown>) }
      : {};

  const existingSnapshot =
    typeof review.guideline_snapshot === 'string' ? review.guideline_snapshot : undefined;

  const hadLegacySource = Array.isArray(meta.sources)
    ? (meta.sources as ContentSource[]).some((s) => LEGACY_GENERIC_SOURCE_IDS.has(s.id))
    : false;

  if (
    hadLegacySource ||
    !existingSnapshot?.trim() ||
    options.forceSnapshot ||
    !/anvisa|cofen.*358|puncao-cateter-anvisa|potter|perry/i.test(existingSnapshot ?? '')
  ) {
    review.guideline_snapshot = buildPuncaoGuidelineSnapshot(corpus, existingSnapshot);
    if (!review.reviewed_at) {
      review.reviewed_at = new Date().toISOString().slice(0, 10);
    }
    if (!review.exam_vs_current) {
      review.exam_vs_current = 'none';
    }
    reasons.push('updated_guideline_snapshot');
  }

  meta.content_review = review;

  if (reasons.length === 0) {
    return { payload, changed: false, reasons: ['already_enriched'] };
  }

  return { payload: { ...payload, meta }, changed: true, reasons };
}

export function puncaoPedagogyHasErrors(issues: GoldenContentLintIssue[]): boolean {
  return issues.length > 0;
}
