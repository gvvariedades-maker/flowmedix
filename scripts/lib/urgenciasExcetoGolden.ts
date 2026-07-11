/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_exceto_conduta.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_exceto_conduta';
export const REVIEWED = '2026-07-08';

export const MS_SBV_SOURCE = {
  id: 'urgencias-sbv-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/SAMU — trauma e urgências',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: ['trauma', 'imobilização', 'via aérea', 'hemorragia', 'objeto perfurante'],
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
  reviewer = 'handcraft-urgencias-exceto',
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
    sources: [MS_SBV_SOURCE],
  };
}

function sanitizeDangerDetail(text: string): string {
  return text
    .replace(/\d+\s*(a|–|-)\s*\d+\s*minutos?/gi, 'poucos minutos')
    .replace(/\d+\s*minutos?/gi, 'tempo de espera incorreto')
    .replace(/\d+\s*min\b/gi, 'tempo incorreto')
    .replace(/\d+\s*litros?\/min/gi, 'fluxo titulado conforme saturação')
    .replace(/antes de \d+\s*horas?/gi, 'no período protocolar')
    .replace(/\d+\s*horas?/gi, 'período definido pelo protocolo');
}

function ensureDistractorCorrect(text: string): string {
  if (/afirmativa correta|conduta correta|verdadeir|orienta[cç][aã]o correta|eliminar|n[aã]o [ée] o (exceto|gabarito)|sinal v[aá]lido|n[aã]o [ée] o incorret|imobiliz/i.test(text)) {
    return text;
  }
  return `Conduta correta — ${text}`;
}

function ensureGabaritoException(text: string): string {
  if (/incorret[oa]|fals[oa]|mito|exce[cç][aã]o|n[aã]o (adiai|suspende|exige|for[cç]ar)|pegadinha|sem\s+for[cç]ar/i.test(text)) {
    return text;
  }
  return `Exceção — ${text}`;
}

/** EXCETO/INCORRETA: todas as letras no compare; distratores = conduta correta; gabarito = exceção/mito. */
export function dangerExceto(
  q: Q,
  content: string,
  distractorCorrect: Record<string, string>,
  gabaritoException: string,
  footer: string,
) {
  return {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content,
    items: q.question_data.options.map((o) => ({
      label: `Letra ${o.id} — ${sanitizeDangerDetail(o.text).slice(0, 40).trim()}${o.text.length > 40 ? '…' : ''}`,
      detail: sanitizeDangerDetail(o.text),
      correct: o.is_correct
        ? ensureGabaritoException(gabaritoException)
        : ensureDistractorCorrect(
            distractorCorrect[o.id] ??
              'Afirmativa correta — conduta adequada no trauma/urgência; não é o EXCETO.',
          ),
    })),
    footer_rule: footer,
  };
}
