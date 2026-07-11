/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_engasgo.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_engasgo';
export const REVIEWED = '2026-07-08';

export const MS_ENGASGO_SOURCE = {
  id: 'urgencias-rcp-sbv-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Suporte Básico de Vida — engasgo e OVACE',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: ['sinal universal de engasgo', 'heimlich', 'obstrucao via aerea', 'ovace', 'golpes nas costas'],
};

export const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

export type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

export type Pack = {
  family: 'protocolo' | 'conceito' | 'vf';
  guideline: string;
  roi_error: string;
  cluster: string;
  danger_footer?: string;
  slides: unknown[];
};

export function metaBase(
  q: Q,
  family: string,
  guideline: string,
  slug: string,
  roiError: string,
  cluster: string,
  reviewer = 'handcraft-urgencias-engasgo',
) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer,
      guideline_snapshot: guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      cluster,
      roi_error: roiError,
    },
    sources: [MS_ENGASGO_SOURCE],
  };
}

export function ovaceRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Sinal universal', value: 'Mãos ao pescoço — vítima consciente', badge: 'hot' },
    { label: 'Adulto consciente', value: 'Manobra de Heimlich (compressões abdominais)', badge: 'ok' },
    { label: 'Criança grave', value: '5 golpes nas costas + 5 compressões abdominais', badge: 'warn' },
    { label: 'Inconsciente', value: 'Iniciar suporte básico de vida — checar boca antes de ventilar', badge: 'info' },
  ];
  return extra ? [...base, ...extra] : base;
}

function sanitizeDetail(text: string): string {
  return text
    .replace(/\b30:2\b/gi, 'compressões e ventilações')
    .replace(/\b15:2\b/gi, 'proporção pediátrica')
    .replace(/\b5\s*[-–]\s*6\s*cm\b/gi, 'profundidade de compressão');
}

export function dangerFromOptions(
  q: Q,
  content: string,
  correctByLetter: Record<string, string>,
  footer: string,
) {
  const correctId = q.question_data.options.find((o) => o.is_correct)?.id ?? '?';
  return {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content,
    items: q.question_data.options
      .filter((o) => !o.is_correct)
      .map((o) => ({
        label: `Alt. ${o.id} — ${o.text.slice(0, 40).trim()}${o.text.length > 40 ? '…' : ''}`,
        detail: sanitizeDetail(o.text),
        correct: correctByLetter[o.id] ?? `Gabarito ${correctId} — engasgo/OVACE desta prova.`,
      })),
    footer_rule: footer,
  };
}

export function finalizeSlides(slug: string, q: Q, pack: Pack, dangerOverrides: Record<string, string>): unknown[] {
  return pack.slides.map((slide) => {
    if (slide !== null) return slide;
    const overrides = dangerOverrides[slug];
    if (!overrides) throw new Error(`danger_zone missing for ${slug}`);
    return dangerFromOptions(
      q,
      `PEGADINHAS — ${pack.roi_error.replace(/_/g, ' ')}`,
      overrides,
      pack.danger_footer ?? `Gabarito ${q.question_data.options.find((o) => o.is_correct)?.id}`,
    );
  });
}
