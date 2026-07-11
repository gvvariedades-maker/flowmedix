/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_anafilaxia.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_anafilaxia';
export const REVIEWED = '2026-07-08';

export const MS_ANAFILAXIA_SOURCE = {
  id: 'urgencias-anafilaxia-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/SAMU — anafilaxia',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    'epinefrina IM anterolateral coxa',
    'anafilaxia crianca adulto',
    'IV reservada PCR hipotensao refrataria',
    'urticaria angioedema dispneia',
    'acionar 192',
  ],
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
  reviewer = 'handcraft-urgencias-anafilaxia',
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
    sources: [MS_ANAFILAXIA_SOURCE],
  };
}

/** Epinefrina/adrenalina IM — permitido no ramo anafilaxia (não sanitizar). */
export function epinefrinaRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Droga', value: 'Epinefrina (adrenalina) — IM imediata', badge: 'hot' },
    { label: 'Local IM', value: 'Face ântero-lateral da coxa', badge: 'ok' },
    { label: 'IV', value: 'PCR ou hipotensão refratária após IM + volume', badge: 'warn' },
    { label: 'Sinais', value: 'Urticária · angioedema · dispneia · hipotensão', badge: 'info' },
    { label: 'Apoio', value: 'Acionar 192 · O₂ · decúbito · elevar MMII se hipotensão', badge: 'ok' },
    { label: 'Pegadinha', value: 'Não postergar epinefrina por anti-H1/corticoide', badge: 'warn' },
  ];
  return extra ? [...base, ...extra] : base;
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
        label: `Letra ${o.id} — ${o.text.slice(0, 40).trim()}${o.text.length > 40 ? '…' : ''}`,
        detail: o.text,
        correct:
          correctByLetter[o.id] ??
          `Combinação incorreta — gabarito letra ${correctId} nesta questão de anafilaxia.`,
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
