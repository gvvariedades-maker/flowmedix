/**
 * Helpers compartilhados — handcraft golden-v1 ramo urgencias_generico.
 */
export const SUBTOPICO = 'Urgências e Emergências';
export const BRANCH = 'urgencias_generico';
export const REVIEWED = '2026-07-08';

export const MS_URGENCIAS_SOURCE = {
  id: 'urgencias-generico-ms-sbv',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo SBV/SAMU — atendimento inicial de urgência',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_suporte_basico_vida.pdf',
  covers: [
    'priorizar vida e segurança',
    'avaliação sistematizada',
    'primeiros socorros',
    'SAMU 192 regulacao medica',
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
  family: 'protocolo' | 'conceito' | 'certo_errado' | 'vf';
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
  reviewer = 'handcraft-urgencias-generico',
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
    sources: [MS_URGENCIAS_SOURCE],
  };
}

/** Priorização e princípios gerais de urgência (sem Manchester explícito). */
export function urgenciaPrioridadeRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Prioridade', value: 'Gravidade e risco imediato à vida — não ordem de chegada', badge: 'hot' },
    { label: 'Avaliação', value: 'Rápida, sistematizada e segura', badge: 'ok' },
    { label: 'Objetivo', value: 'Preservar vida e evitar agravamento', badge: 'ok' },
    { label: 'Equipe', value: 'Técnico integra cuidados iniciais com articulação multiprofissional', badge: 'info' },
    { label: 'Pegadinha', value: 'Burocracia ou eletivo nunca vence instabilidade', badge: 'warn' },
  ];
  return extra ? [...base, ...extra] : base;
}

/** Síndrome colinérgica qualitativa — organofosforados (sem doses inventadas). */
export function colinergicaRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Mecanismo', value: 'Inibe acetilcolinesterase → acúmulo de ACh', badge: 'hot' },
    { label: 'Muscarínico', value: 'Miose · sialorreia · broncorreia · lacrimejamento · bradicardia', badge: 'ok' },
    { label: 'Nicotínico', value: 'Fasciculações · fraqueza muscular · sudorese', badge: 'info' },
    { label: '× Anticolinérgico', value: 'Midríase · boca seca · pele seca · retenção urinária', badge: 'warn' },
    { label: 'Monitorar', value: 'Via aérea · secreções · ventilação · perfusão', badge: 'warn' },
  ];
  return extra ? [...base, ...extra] : base;
}

/** SAMU — papéis na regulação (sem drift de RCP). */
export function samuPapeisRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Regulação médica', value: 'Médico regulador define conduta e destino hospitalar', badge: 'hot' },
    { label: 'Equipe móvel', value: 'Executa cuidados no local e transporte orientado', badge: 'ok' },
    { label: 'Condutor', value: 'Condução segura do veículo — não decide destino', badge: 'info' },
    { label: 'Recepção', value: 'Administrativo hospitalar — sem autoridade técnica pré-hospitalar', badge: 'warn' },
  ];
  return extra ? [...base, ...extra] : base;
}

/** Escala de Glasgow — três domínios de resposta (sem spoiler de gabarito). */
export function glasgowDomainsRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Ocular', value: 'Abertura ocular — espontânea a dor (1–4)', badge: 'ok' },
    { label: 'Verbal', value: 'Resposta verbal — orientada a ausente (1–5)', badge: 'ok' },
    { label: 'Motora', value: 'Resposta motora — obedece a extensão (1–6)', badge: 'hot' },
    { label: 'Pegadinha', value: 'Trocar motora por olfativa/diafragmática/atípica', badge: 'warn' },
    { label: 'Uso', value: 'TCE e rebaixamento — D no XABCDE', badge: 'info' },
  ];
  return extra ? [...base, ...extra] : base;
}

/** Hipoglicemia — sinais adrenérgicos × neuroglicopênicos. */
export function hipoglicemiaRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Adrenérgico', value: 'Sudorese · tremor · taquicardia · fome', badge: 'hot' },
    { label: 'Neuroglicopênico', value: 'Tontura · confusão · sonolência · convulsão', badge: 'warn' },
    { label: 'Limiar', value: 'Glicemia capilar < 70 mg/dL', badge: 'ok' },
    { label: '× Hiperglicemia', value: 'Sede · poliúria · visão turva — perfil oposto', badge: 'warn' },
    { label: 'Conduta', value: 'Oferecer carboidrato se consciente; acionar se rebaixado', badge: 'info' },
  ];
  return extra ? [...base, ...extra] : base;
}

/** Eliminações — constipação × obstrução × retenção urinária. */
export function constipacaoEliminacaoRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Constipação', value: 'Evacuação < 3×/semana ou esforço + fezes endurecidas', badge: 'hot' },
    { label: 'Alerta', value: 'Ausência > 72 h + distensão abdominal', badge: 'warn' },
    { label: '× Obstrução', value: 'Dor intensa contínua · vômitos biliosos · não elimina gases', badge: 'info' },
    { label: '× Retenção urinária', value: 'Globo vesical · anúria — trato urinário, não intestinal', badge: 'warn' },
    { label: 'Escala Bristol', value: 'Tipos 1–2 sugerem constipação', badge: 'ok' },
  ];
  return extra ? [...base, ...extra] : base;
}

/** Classificação cirúrgica — potencial de contaminação (COFEN/ATB). */
export function cirurgiaContaminacaoRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Limpa', value: 'Trato estéril sem abertura — ex.: hérnia sem infecção', badge: 'ok' },
    { label: 'Potencialmente contaminada', value: 'Abre trato colonizado sem pus — ex.: colecistite', badge: 'hot' },
    { label: 'Contaminada', value: 'Víscera aberta com derramamento — trauma recente', badge: 'warn' },
    { label: 'Infectada', value: 'Pus ou infecção estabelecida no ato', badge: 'warn' },
    { label: 'Pegadinha', value: 'Confundir potencialmente contaminada com limpa ou infectada', badge: 'info' },
  ];
  return extra ? [...base, ...extra] : base;
}

/** Semiologia — angioedema × urticária × rinite (conceito). */
export function angioedemaRows(extra?: { label: string; value: string; badge?: string }[]) {
  const base = [
    { label: 'Angioedema', value: 'Edema agudo profundo — face, lábios, laringe, extremidades', badge: 'hot' },
    { label: 'Caráter', value: 'Indolor, subcutâneo/submucoso, sem prurido dominante', badge: 'ok' },
    { label: '× Urticária', value: 'Pápulas pruriginosas superficiais — margens eritematosas', badge: 'warn' },
    { label: '× Rinite alérgica', value: 'Rinorreia aquosa com prurido nasal — não edema profundo', badge: 'info' },
    { label: 'Risco urgência', value: 'Edema de laringe → via aérea comprometida', badge: 'warn' },
  ];
  return extra ? [...base, ...extra] : base;
}

function sanitizeDetail(text: string): string {
  return text
    .replace(/\d+\s*(a|–|-)\s*\d+\s*mg\b/gi, 'dose protocolar')
    .replace(/\batropina\b/gi, 'antídoto colinérgico')
    .replace(/\b\d+\s*cm\b/gi, 'profundidade protocolar')
    .replace(/\bbundle\b/gi, 'pacote de medidas')
    .replace(/\bcvc\b/gi, 'acesso venoso central')
    .replace(/\bipc\b/gi, 'precaução de infecção');
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
        label: `Letra ${o.id} — ${sanitizeDetail(o.text).slice(0, 42).trim()}${o.text.length > 42 ? '…' : ''}`,
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
