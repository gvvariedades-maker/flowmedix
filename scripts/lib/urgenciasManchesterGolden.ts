/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_manchester_triagem.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_manchester_triagem';
export const REVIEWED = '2026-07-08';

export const MS_MANCHESTER_SOURCE = {
  id: 'urgencias-manchester-cores',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo Manchester / triagem de risco — cores e classificação',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    'vermelho imediato emergencia',
    'amarelo urgente monitoramento',
    'verde pouco urgente',
    'azul nao urgente',
    'preto obito expectante',
    'triagem vitimas multiplas etiquetas',
    'classificacao de risco manchester',
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
  reviewer = 'handcraft-urgencias-manchester',
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
    sources: [MS_MANCHESTER_SOURCE],
  };
}

/** Rows normativos — espectro Manchester / etiquetas (sem tempos numéricos inventados). */
export function manchesterColorRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Vermelho', value: 'Emergência imediata — risco de morte', badge: 'hot' },
    { label: 'Amarelo', value: 'Urgente — monitorar sinais e reavaliar', badge: 'warn' },
    { label: 'Verde', value: 'Pouco urgente — atendimento prioritário, não emergencial', badge: 'ok' },
    { label: 'Azul', value: 'Não urgente — menor gravidade no Manchester', badge: 'info' },
    { label: 'Preto', value: 'Óbito ou expectante — triagem de massa', badge: 'info' },
    { label: 'Princípio', value: 'Priorizar gravidade e chance de sobrevivência', badge: 'ok' },
  ];
  return extra ? [...base, ...extra] : base;
}

function sanitizeDetail(text: string): string {
  return text
    .replace(/\d+\s*(a|–|-)\s*\d+\s*min/gi, 'tempo conforme protocolo')
    .replace(/\b\d+\s*minutos?\b/gi, 'tempo conforme protocolo')
    .replace(/\b\d+\s*horas?\b/gi, 'tempo conforme protocolo');
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

export function finalizeSlides(
  slug: string,
  q: Q,
  pack: Pack,
  dangerOverrides: Record<string, Record<string, string>>,
): unknown[] {
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
