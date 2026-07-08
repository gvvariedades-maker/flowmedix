/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_rcp_sbv.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_rcp_sbv';
export const REVIEWED = '2026-07-08';

export const MS_RCP_SOURCE = {
  id: 'urgencias-rcp-sbv-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/RCP — adulto',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    '30:2 adulto dois socorristas',
    '100-120 compressões/min',
    '5-6 cm profundidade',
    'DEA ligar imediatamente',
    'pulso a cada 2 minutos',
    'cadeia de sobrevivência',
  ],
};

export const AHA_SOURCE = {
  id: 'aha-ilcor-rcp-2020-adulto',
  tier: 'B' as const,
  issuer: 'American Heart Association / ILCOR',
  title: 'Diretrizes RCP adulto — SBV',
  year: 2020,
  covers: ['30:2', '100-120/min', '5-6 cm', 'cadeia de sobrevivência', 'via aérea avançada'],
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
  family: 'vf' | 'protocolo' | 'conceito';
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
      reviewer: 'handcraft-urgencias-g01',
      guideline_snapshot: guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      cluster,
      roi_error: roiError,
    },
    sources: [MS_RCP_SOURCE, AHA_SOURCE],
  };
}

export function rcpParamRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Proporção (2 socorristas)', value: '30 compressões : 2 ventilações', badge: 'hot' },
    { label: 'Frequência', value: '100–120 compressões/min', badge: 'ok' },
    { label: 'Profundidade', value: '5–6 cm (adulto)', badge: 'ok' },
    { label: 'Pulso', value: 'Reavaliar ~a cada 2 min — não a cada ciclo 30:2', badge: 'warn' },
    { label: 'DEA', value: 'Ligar e aplicar assim que disponível', badge: 'ok' },
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
        label: `Letra ${o.id} — ${o.text.slice(0, 42).trim()}${o.text.length > 42 ? '…' : ''}`,
        detail: o.text,
        correct: correctByLetter[o.id] ?? `Gabarito ${correctId} — conduta/protocolo desta prova.`,
      })),
    footer_rule: footer,
  };
}
