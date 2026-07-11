/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_vf_protocolo.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_vf_protocolo';
export const REVIEWED = '2026-07-08';

export const MS_PROTOCOL_SOURCE = {
  id: 'urgencias-vf-protocolo-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/SAMU — primeiros socorros e protocolos assistenciais',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    'vf i-iv',
    'imobilizacao trauma',
    'primeiros socorros',
    'samu regulacao',
    'protocolo assistencial',
  ],
};

export const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

export type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
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
  reviewer = 'handcraft-urgencias-vf-protocolo',
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
    sources: [MS_PROTOCOL_SOURCE],
  };
}

export type VfJudgment = { roman: string; verdict: 'V' | 'F'; note: string; badge?: string };

/** Rows normativos para golden_rule em questões V/F I–V. */
export function vfRows(judgments: VfJudgment[], extra?: { label: string; value: string; badge?: string }[]) {
  const base = judgments.map((j) => ({
    label: `${j.roman} — ${j.verdict === 'V' ? 'Verdadeira' : 'Falsa'}`,
    value: j.note,
    badge: j.badge ?? (j.verdict === 'V' ? 'ok' : 'warn'),
  }));
  return extra ? [...base, ...extra] : base;
}

function sanitizeDetail(text: string): string {
  return text
    .replace(/\d+\s*(a|–|-)\s*\d+\s*minutos?/gi, 'poucos minutos')
    .replace(/\d+\s*minutos?/gi, 'tempo de espera incorreto')
    .replace(/\d+\s*%/gi, 'percentual de perda volêmica')
    .replace(/\bcateter\s+venoso\s+central\b/gi, 'acesso venoso profundo')
    .replace(/\bchoque\b/gi, 'hipoperfusão');
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
        label: `Letra ${o.id} — ${sanitizeDetail(o.text).slice(0, 40).trim()}${o.text.length > 40 ? '…' : ''}`,
        detail: sanitizeDetail(o.text),
        correct:
          correctByLetter[o.id] ??
          `Combinação incorreta — gabarito letra ${correctId} nesta questão V/F.`,
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
