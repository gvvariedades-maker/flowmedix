/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_convulsao.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_convulsao';
export const REVIEWED = '2026-07-08';

export const MS_CONVULSAO_SOURCE = {
  id: 'urgencias-convulsao-ms-sbv',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/SAMU — convulsão e crise epiléptica',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    'nao introduzir objetos na boca',
    'nao segurar lingua',
    'proteger cabeca afastar objetos',
    'posicao lateral seguranca apos crise',
    'cronometrar duracao convulsao',
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
  reviewer = 'handcraft-urgencias-convulsao',
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
    sources: [MS_CONVULSAO_SOURCE],
  };
}

/** Rows normativos — protocolo crise epiléptica (SBV). */
export function convulsaoProtocolRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Fazer', value: 'Proteger cabeça · afastar objetos · cronometrar', badge: 'ok' },
    { label: 'Não fazer', value: 'Objeto na boca · segurar língua · imobilizar à forza', badge: 'hot' },
    { label: 'Após cessar', value: 'Posição lateral de segurança se rebaixamento', badge: 'warn' },
    { label: 'Acionar 192', value: 'Crise prolongada · recorrente · primeira crise · gestante', badge: 'warn' },
    { label: 'Mito', value: '“Engolir língua” — não introduza pano nem dedo', badge: 'warn' },
  ];
  return extra ? [...base, ...extra] : base;
}

function sanitizeDetail(text: string): string {
  return text
    .replace(/\d+\s*(a|–|-)\s*\d+\s*compress[oõ]es/gi, 'compressões no ritmo protocolar')
    .replace(/\d+\s*(a|–|-)\s*\d+\s*mg\/dl/gi, 'glicemia baixa conforme enunciado')
    .replace(/\b\d+\s*cm\b/gi, 'profundidade protocolar')
    .replace(/\b\d+\s*º\b/gi, 'ângulo elevado incorreto')
    .replace(/\bheimlich\b/gi, 'manobra abdominal')
    .replace(/obstru[cç][aã]o[^.]{0,40}via a[eé]rea/gi, 'corpo estranho')
    .replace(/\bengasgo\b/gi, 'sufocamento')
    .replace(/\bavc\b/gi, 'déficit neurológico focal');
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
          `Combinação incorreta — gabarito letra ${correctId} nesta questão.`,
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
