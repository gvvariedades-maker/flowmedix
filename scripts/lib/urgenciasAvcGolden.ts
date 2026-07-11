/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_avc_iam.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_avc_iam';
export const REVIEWED = '2026-07-08';

export const MS_AVC_SOURCE = {
  id: 'urgencias-avc-fast-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/SAMU — suspeita de AVC (FAST)',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    'Face assimetria sorriso',
    'Arms fraqueza queda braco',
    'Speech fala alterada',
    'Escala Cincinnati pre-hospitalar',
    'acionar 192',
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
  reviewer = 'handcraft-urgencias-avc',
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
    sources: [MS_AVC_SOURCE],
  };
}

export function cincinnatiRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Face', value: 'Sorriso — assimetria ou queda labial', badge: 'ok' },
    { label: 'Braços', value: 'MMSS elevados — queda ou fraqueza unilateral', badge: 'ok' },
    { label: 'Fala', value: 'Frase simples — fala anormal ou incompreensível', badge: 'ok' },
    { label: 'Positivo', value: 'Qualquer item alterado → suspeita de AVC', badge: 'warn' },
    { label: 'Conduta', value: 'Acionar 192 / SAMU — tempo é cérebro', badge: 'hot' },
  ];
  return extra ? [...base, ...extra] : base;
}

export function iamSinaisRows() {
  return [
    { label: 'Dor', value: 'Precordial opressiva — irradiação para MS ou mandíbula', badge: 'hot' },
    { label: 'Autonômicos', value: 'Sudorese fria · náusea · vômito · palidez', badge: 'warn' },
    { label: 'Sinal Levine', value: 'Punho sobre o peito — localiza dor torácica', badge: 'ok' },
    { label: 'Duração', value: 'Angina < intervalo breve · IAM persiste', badge: 'info' },
    { label: 'Conduta APH', value: 'Repouso · oxigênio se indicado · aspirina se não alérgico', badge: 'hot' },
  ];
}

function sanitizeDetail(text: string): string {
  return text
    .replace(/\d+\s*horas?/gi, 'intervalo seriado')
    .replace(/\d+\s*min(?:utos?)?/gi, 'intervalo breve')
    .replace(/\d+\s*dias?/gi, 'período recente')
    .replace(/\d+\s*mg\b/gi, 'dose específica')
    .replace(/\d+\s*%/gi, 'alvo de saturação')
    .replace(/\d+\s*mmhg/gi, 'meta pressórica')
    .replace(/\d+\s*°/gi, 'angulação');
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
        label: `Alt. ${o.id} — ${sanitizeDetail(o.text).slice(0, 40).trim()}${o.text.length > 40 ? '…' : ''}`,
        detail: sanitizeDetail(o.text),
        correct: correctByLetter[o.id] ?? `Gabarito ${correctId} — reconhecimento AVC/IAM desta prova.`,
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
