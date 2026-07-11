/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_rcp_pediatrico.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_rcp_pediatrico';
export const REVIEWED = '2026-07-08';

export const MS_RCP_PED_SOURCE = {
  id: 'urgencias-rcp-ped-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/RCP — pediatria',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    '15:2 pediatrico dois socorristas',
    'profundidade terco diametro toracico',
    '100-120 compressoes min',
    'insuficiencia respiratoria pediatrica',
    'PCR lactente crianca',
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
  family: 'vf' | 'protocolo' | 'conceito';
  guideline: string;
  roi_error: string;
  cluster: string;
  danger_footer?: string;
  branch?: string;
  exam_vs_current?: string;
  sources?: typeof MS_RCP_PED_SOURCE[];
  slides: unknown[];
};

export function metaBase(
  q: Q,
  family: string,
  guideline: string,
  slug: string,
  roiError: string,
  cluster: string,
  reviewer = 'handcraft-urgencias-rcp-ped',
  branch = BRANCH,
  examVsCurrent = 'none',
  packSources?: typeof MS_RCP_PED_SOURCE[],
) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: branch,
    content_standard: 'golden-v1',
    family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer,
      guideline_snapshot: guideline,
      exam_vs_current: examVsCurrent,
      catalog_slug: slug,
      cluster,
      roi_error: roiError,
    },
    sources: packSources ?? [MS_RCP_PED_SOURCE],
  };
}

export const MS_ANAFILAXIA_SOURCE = {
  id: 'urgencias-anafilaxia-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/SAMU — anafilaxia',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    'epinefrina IM anterolateral coxa',
    'anafilaxia crianca',
    'IV reservada PCR hipotensao refrataria',
    'urticaria angioedema dispneia',
  ],
};

export function pedRcpRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Proporção (2 socorristas)', value: '15:2 — lactente/criança', badge: 'hot' },
    { label: 'Proporção (1 socorrista)', value: '30:2 — quando só um treinado', badge: 'info' },
    { label: 'Profundidade', value: 'Cerca de um terço do diâmetro AP do tórax', badge: 'warn' },
    { label: 'Frequência', value: '100–120 compressões/min', badge: 'ok' },
    { label: 'Causas', value: 'Insuficiência respiratória ou choque — não causa cardíaca primária', badge: 'info' },
  ];
  return extra ? [...base, ...extra] : base;
}

function sanitizeDetail(text: string): string {
  return text
    .replace(/\badrenalina\b/gi, 'medicação de emergência')
    .replace(/\bepinefrina\b/gi, 'medicação IM');
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
        label: `Alt. ${o.id} — ${o.text.slice(0, 42).trim()}${o.text.length > 42 ? '…' : ''}`,
        detail: sanitizeDetail(o.text),
        correct: correctByLetter[o.id] ?? `Gabarito ${correctId} — RCP pediátrica desta prova.`,
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
