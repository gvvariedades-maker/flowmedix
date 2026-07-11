/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_xabcde_trauma.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_xabcde_trauma';
export const REVIEWED = '2026-07-08';

export const MS_TRAUMA_SOURCE = {
  id: 'urgencias-trauma-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/SAMU — trauma e XABCDE',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: ['XABCDE', 'hemorragia', 'imobilização', 'coluna cervical', 'compressão direta'],
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
  reviewer = 'handcraft-urgencias-trauma',
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
    sources: [MS_TRAUMA_SOURCE],
  };
}

export function xabcdeRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'X', value: 'Hemorragia exsanguinante — controlar primeiro', badge: 'hot' },
    { label: 'A', value: 'Via aérea + coluna cervical', badge: 'ok' },
    { label: 'B', value: 'Ventilação / oxigenação', badge: 'ok' },
    { label: 'C', value: 'Circulação — hemorragia oculta e perfusão', badge: 'warn' },
    { label: 'D', value: 'Disability — Glasgow rápido', badge: 'ok' },
    { label: 'E', value: 'Exposição + prevenção hipotermia', badge: 'info' },
  ];
  return extra ? [...base, ...extra] : base;
}

function sanitizeDetail(text: string): string {
  return text
    .replace(/\d+\s*(a|–|-)\s*\d+\s*l\/min/gi, 'fluxo titulado')
    .replace(/sat[oó]?2\s*[<≤]\s*\d+\s*%/gi, 'saturação alvo')
    .replace(/\d+\s*%/gi, 'alvo de saturação')
    .replace(/\bcateter\s+venoso\s+central\b/gi, 'acesso vascular avançado')
    .replace(/\bintra[oó]sseo\b/gi, 'acesso ósseo')
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
        label: `Alt. ${o.id} — ${o.text.slice(0, 40).trim()}${o.text.length > 40 ? '…' : ''}`,
        detail: sanitizeDetail(o.text),
        correct: correctByLetter[o.id] ?? `Gabarito ${correctId} — trauma/XABCDE desta prova.`,
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
