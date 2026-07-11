/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_choque.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_choque';
export const REVIEWED = '2026-07-08';

export const MS_CHOQUE_SOURCE = {
  id: 'urgencias-choque-hipovolemico-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV — choque, hipoperfusão e segurança da cena',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: ['choque hipovolemico', 'hipoperfusao', 'choque eletrico', 'seguranca da cena', 'sinais perifericos'],
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
  reviewer = 'handcraft-urgencias-choque',
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
    sources: [MS_CHOQUE_SOURCE],
  };
}

export function choqueTypesRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Hipovolêmico', value: 'Perda de volume — sangue, plasma ou desidratação', badge: 'hot' },
    { label: 'Cardiogênico', value: 'Falha da bomba — infarto, arritmia', badge: 'warn' },
    { label: 'Distributivo', value: 'Vasodilatação — séptico, anafilático, neurogênico', badge: 'info' },
    { label: 'Obstrutivo', value: 'Tamponamento, TEP, pneumotórax hipertensivo', badge: 'info' },
  ];
  return extra ? [...base, ...extra] : base;
}

export function perfusaoRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Pele', value: 'Fria, pálida ou cianótica — hipoperfusão periférica', badge: 'hot' },
    { label: 'Sudorese', value: 'Fria e pegajosa — resposta simpática', badge: 'warn' },
    { label: 'TEC', value: 'Enchimento capilar prolongado — perfusão lenta', badge: 'warn' },
    { label: 'PA / pulso', value: 'Hipotensão e pulso fraco ou filiforme', badge: 'ok' },
  ];
  return extra ? [...base, ...extra] : base;
}

function sanitizeDetail(text: string): string {
  return text
    .replace(/\d+\s*(a|–|-)\s*\d+\s*l\/min/gi, 'fluxo titulado')
    .replace(/sat[oó]?2\s*[<≤]\s*\d+\s*%/gi, 'saturação alvo')
    .replace(/\b30:2\b/gi, 'compressões e ventilações')
    .replace(/\badrenalina\b/gi, 'vasopressor de emergência')
    .replace(/\bepinefrina\b/gi, 'medicação de emergência IM');
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
        correct: correctByLetter[o.id] ?? `Gabarito ${correctId} — choque/hipoperfusão desta prova.`,
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
