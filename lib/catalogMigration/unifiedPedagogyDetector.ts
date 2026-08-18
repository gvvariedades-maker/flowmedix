/**
 * Detector pedagógico unificado — 1 módulo para as 8 assinaturas de defeito golden-v1.
 *
 * Substitui a duplicação das gramáticas por subtópico (`*Pedagogy.ts`), que testavam
 * apenas `label` e ficavam cegas ao `detail`, `footer_rule` e `exam_hint`.
 *
 * Modo report: `detectUnifiedPedagogy` não bloqueia gate nenhum — é insumo de contagem
 * (`catalog:preflight --report-pedagogy`, `audit:pedagogy-signatures`).
 *
 * @see docs/QUALITY_LAYERS_MODEL.md
 */

export type SlideLike = Record<string, unknown>;

/* ────────────────────────────────────────────────────────────────────────────
 * Primitivas compartilhadas (antes duplicadas nos 6 arquivos de pedagogia)
 * ──────────────────────────────────────────────────────────────────────────── */

/** Item de concept_map/danger_zone cujo label anuncia o gabarito. */
export const GABARITO_CONCEPT_LABEL_RE = /combina[cç][aã]o\s+correta|gabarito\s+letra|^gabarito$/i;

/** Veredito V/F em row de golden_rule (exige pontuação — ver VF_VERDICT_ANY_PUNCT_RE). */
export const GOLDEN_VF_VERDICT_RE =
  /\b(falsa|verdadeira|falso|verdadeiro)\s*:|:\s*(v|f)\b|\b(v|f)\s*—|→\s*letra\s+[a-e]/i;

/** Row de golden_rule que antecipa gabarito. */
export const GOLDEN_GABARITO_ROW_RE = /gabarito|combina[cç][aã]o\s+correta/i;

/** Passo de logic_flow que elimina distrator por letra. */
export const ELIMINATION_STEP_RE =
  /\beliminar\b|\btestar\s+[a-e]\b|\bjulgar\s+[a-e]\b|\bletra\s+[a-e]\b.*→|^\s*[a-e]\s*[-–—].*\beliminar\b/i;

/** Passo de logic_flow que julga afirmativa romana (base; alguns pacotes estendem). */
export const ROMAN_JUDGMENT_STEP_RE = /\bjulgar\s+(i|ii|iii|iv)\b|\b(i|ii|iii|iv)\s*[-–—].*→\s*(v|f)\b/i;

/** Comando negativo (EXCETO / INCORRETA) no enunciado. */
export const EXCETO_COMMAND_RE =
  /\bexceto\b|incorret[oa]\s+afirmar|é\s+incorret[oa]|n[aã]o\s+corresponde\s+(a\s+)?(verdade|realidade)/i;

export function slidesOf(payload: {
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): SlideLike[] {
  const s = payload.reverse_study_slides ?? payload.study_slides;
  return Array.isArray(s) ? s : [];
}

export function findSlide(slides: SlideLike[], type: string): SlideLike | undefined {
  return slides.find((s) => s.type === type);
}

export function itemTexts(items: unknown): { label: string; detail: string }[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i) => i && typeof i === 'object')
    .map((i) => {
      const row = i as Record<string, unknown>;
      return {
        label: String(row.label ?? ''),
        detail: String(row.detail ?? ''),
      };
    });
}

export function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 5);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Travessia de superfícies de texto — label + detail + footer_rule + exam_hint
 * ──────────────────────────────────────────────────────────────────────────── */

export type TextSurface = {
  /** Tipo do slide onde o texto vive. */
  slide: string;
  /** Caminho JSON legível (ex.: `concept_map.items[2].detail`). */
  path: string;
  /** Chave da superfície (`label`, `detail`, `correct`, `footer_rule`, `exam_hint`…). */
  key: string;
  text: string;
};

const ITEM_KEYS = ['label', 'detail', 'correct'] as const;
const ROW_KEYS = ['label', 'value', 'exam_hint', 'fixation'] as const;

/** Todas as superfícies textuais de um slide, incluindo as antes ignoradas. */
export function slideTextSurfaces(slide: SlideLike): TextSurface[] {
  const type = String(slide.type ?? 'unknown');
  const out: TextSurface[] = [];

  const push = (path: string, key: string, value: unknown) => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (text) out.push({ slide: type, path, key, text });
  };

  push(`${type}.content`, 'content', slide.content);
  push(`${type}.footer_rule`, 'footer_rule', slide.footer_rule);
  push(`${type}.slide_title`, 'slide_title', slide.slide_title);

  if (Array.isArray(slide.items)) {
    slide.items.forEach((raw, idx) => {
      if (!raw || typeof raw !== 'object') return;
      const item = raw as Record<string, unknown>;
      for (const key of ITEM_KEYS) {
        push(`${type}.items[${idx}].${key}`, key, item[key]);
      }
    });
  }

  if (Array.isArray(slide.rows)) {
    slide.rows.forEach((raw, idx) => {
      if (!raw || typeof raw !== 'object') return;
      const row = raw as Record<string, unknown>;
      for (const key of ROW_KEYS) {
        push(`${type}.rows[${idx}].${key}`, key, row[key]);
      }
    });
  }

  if (Array.isArray(slide.steps)) {
    slide.steps.forEach((step, idx) => {
      push(`${type}.steps[${idx}]`, 'step', step);
    });
  }

  return out;
}

export function allTextSurfaces(slides: SlideLike[]): TextSurface[] {
  return slides.flatMap((s) => slideTextSurfaces(s));
}

export function collectCorpus(payload: {
  question_data?: {
    instruction?: string;
    options?: { text?: string; id?: string; is_correct?: boolean }[];
  };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): string {
  const slides = slidesOf(payload);
  const slideText = slides.map((s) => JSON.stringify(s)).join(' ');
  const optionsText = (payload.question_data?.options ?? []).map((o) => o.text ?? '').join(' ');
  return `${payload.question_data?.instruction ?? ''} ${optionsText} ${slideText}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * As 8 assinaturas
 * ──────────────────────────────────────────────────────────────────────────── */

export const PEDAGOGY_SIGNATURE_CODES = [
  'pedagogy_letter_spoiler',
  'pedagogy_vf_verdict_spoiler',
  'pedagogy_question_bound_label',
  'pedagogy_logic_padding',
  'pedagogy_polarity_risk',
  'pedagogy_danger_orphan',
  'pedagogy_logic_missing_gabarito',
  'pedagogy_density',
] as const;

export type PedagogySignatureCode = (typeof PEDAGOGY_SIGNATURE_CODES)[number];

export type UnifiedPedagogyFinding = {
  code: PedagogySignatureCode;
  message: string;
  /** Caminho JSON da superfície que disparou (vazio quando é ausência de algo). */
  path: string;
  /** Slide onde o achado vive — separa spoiler de concept_map de exam_hint de golden_rule. */
  slide: string;
  /** Superfície textual (`detail`, `footer_rule`, `exam_hint`…). */
  key?: string;
  /** Trecho literal — evidência revisável, exigida antes de qualquer repair. */
  evidence?: string;
};

/**
 * Letra da alternativa citada fora do logic_flow. Sem flag `i`: letra maiúscula.
 * Exige espaço após a letra — `\s*` casava `Déficit` (D + é; `\b` ASCII).
 * Lookbehind evita FP `°C está`.
 */
const LETTER_VERDICT_RE = /(?<![°º])\b[A-E]\b\s+(é|erra|está|são)/;
const LETTER_NAMED_RE = /letra\s+[A-E]\b/i;

/** Veredito V/F no início do texto, com qualquer pontuação (ou nenhuma). */
const VF_VERDICT_ANY_PUNCT_RE = /^(FALSA|VERDADEIRA|FALSO|VERDADEIRO)\b/i;

/** Rótulo amarrado à questão em vez de ensinar o conceito. */
const QUESTION_BOUND_LABEL_RE = /afirmativa\s+[IVX]+\s*[—-]/i;

const PADDING_CONFIRMAR_RE = /^Confirmar:/i;
const PADDING_MARCAR_RE = /^Marcar/i;

const POLARITY_INSTRUCTION_RE = /exceto|incorret/i;
const POLARITY_CORRECT_RE = /^(afirmativa correta|conduta correta)/i;

const LOGIC_GABARITO_RE = /marcar|gabarito|letra\s+[A-E]/i;

/** Slides que precedem o raciocínio — spoiler aqui entrega a resposta. */
export const PRE_ANSWER_SLIDES = new Set(['concept_map', 'golden_rule']);

const DENSITY_MAX = 6;

function truncate(text: string, max = 160): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

type DetectPayload = {
  meta?: { family?: string };
  question_data?: {
    instruction?: string;
    options?: { id?: string; text?: string; is_correct?: boolean }[];
  };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
};

/** #1 + #2 + #3 — spoiler e rótulo amarrado nos slides que vêm antes do raciocínio. */
function detectPreAnswerSpoilers(slides: SlideLike[]): UnifiedPedagogyFinding[] {
  const out: UnifiedPedagogyFinding[] = [];

  for (const surface of allTextSurfaces(slides)) {
    if (!PRE_ANSWER_SLIDES.has(surface.slide)) continue;

    if (LETTER_VERDICT_RE.test(surface.text) || LETTER_NAMED_RE.test(surface.text)) {
      out.push({
        code: 'pedagogy_letter_spoiler',
        message: `${surface.path} cita a letra da alternativa — gabarito só no logic_flow.`,
        path: surface.path,
        slide: surface.slide,
        key: surface.key,
        evidence: truncate(surface.text),
      });
    }

    if (VF_VERDICT_ANY_PUNCT_RE.test(surface.text)) {
      out.push({
        code: 'pedagogy_vf_verdict_spoiler',
        message: `${surface.path} abre com veredito V/F — julgamento pertence ao logic_flow.`,
        path: surface.path,
        slide: surface.slide,
        key: surface.key,
        evidence: truncate(surface.text),
      });
    }

    if (QUESTION_BOUND_LABEL_RE.test(surface.text)) {
      out.push({
        code: 'pedagogy_question_bound_label',
        message: `${surface.path} rotula "Afirmativa N —" em vez de nomear o conceito.`,
        path: surface.path,
        slide: surface.slide,
        key: surface.key,
        evidence: truncate(surface.text),
      });
    }
  }

  return out;
}

/** #4 — passos consecutivos "Confirmar:" + "Marcar" que não ensinam nada. */
function detectLogicPadding(slides: SlideLike[]): UnifiedPedagogyFinding[] {
  const logic = findSlide(slides, 'logic_flow');
  const steps = Array.isArray(logic?.steps) ? (logic!.steps as unknown[]).map(String) : [];

  const out: UnifiedPedagogyFinding[] = [];
  for (let i = 0; i < steps.length - 1; i += 1) {
    const a = steps[i].trim();
    const b = steps[i + 1].trim();
    const consecutive =
      (PADDING_CONFIRMAR_RE.test(a) && PADDING_MARCAR_RE.test(b)) ||
      (PADDING_MARCAR_RE.test(a) && PADDING_CONFIRMAR_RE.test(b));
    if (consecutive) {
      out.push({
        code: 'pedagogy_logic_padding',
        message: `logic_flow.steps[${i}]+[${i + 1}]: "Confirmar" seguido de "Marcar" é padding — funde em um passo.`,
        path: `logic_flow.steps[${i}]`,
        slide: 'logic_flow',
        key: 'step',
        evidence: truncate(`${a} | ${b}`),
      });
      break;
    }
  }
  return out;
}

/** #5 — comando negativo com card de distrator descrevendo conduta correta. */
function detectPolarityRisk(payload: DetectPayload, slides: SlideLike[]): UnifiedPedagogyFinding[] {
  const instruction = String(payload.question_data?.instruction ?? '');
  if (!POLARITY_INSTRUCTION_RE.test(instruction)) return [];

  const danger = findSlide(slides, 'danger_zone');
  const items = Array.isArray(danger?.items) ? (danger!.items as Record<string, unknown>[]) : [];

  const out: UnifiedPedagogyFinding[] = [];
  items.forEach((item, idx) => {
    const correct = String(item.correct ?? '').trim();
    if (POLARITY_CORRECT_RE.test(correct)) {
      out.push({
        code: 'pedagogy_polarity_risk',
        message: `danger_zone.items[${idx}]: comando negativo + card que descreve conduta correta — molde renderiza "ERRO #N" sobre conteúdo válido.`,
        path: `danger_zone.items[${idx}].correct`,
        slide: 'danger_zone',
        key: 'correct',
        evidence: truncate(correct),
      });
    }
  });
  return out;
}

/** #6 — danger_zone que não amarra nenhum card a uma letra em questão V/F. */
function detectDangerOrphan(payload: DetectPayload, slides: SlideLike[]): UnifiedPedagogyFinding[] {
  const family = payload.meta?.family;
  if (family !== 'vf' && family !== 'certo_errado') return [];

  const danger = findSlide(slides, 'danger_zone');
  const items = Array.isArray(danger?.items) ? (danger!.items as Record<string, unknown>[]) : [];
  if (items.length === 0) return [];

  const bound = items.some((it) => LETTER_NAMED_RE.test(String(it.label ?? '')) || /\b[A-E]\b/.test(String(it.label ?? '')));
  if (bound) return [];

  return [
    {
      code: 'pedagogy_danger_orphan',
      message: `danger_zone (family=${family}): nenhum label referencia letra — cards não mapeiam os distratores.`,
      path: 'danger_zone.items',
      slide: 'danger_zone',
    },
  ];
}

/** #7 — logic_flow que nunca chega ao gabarito. */
function detectLogicMissingGabarito(slides: SlideLike[]): UnifiedPedagogyFinding[] {
  const logic = findSlide(slides, 'logic_flow');
  if (!logic) return [];
  const steps = Array.isArray(logic.steps) ? (logic.steps as unknown[]).map(String) : [];
  if (steps.length === 0) return [];

  if (steps.some((s) => LOGIC_GABARITO_RE.test(s))) return [];

  return [
    {
      code: 'pedagogy_logic_missing_gabarito',
      message: 'logic_flow não localiza o gabarito nos steps — único slide onde a resposta pode aparecer.',
      path: 'logic_flow.steps',
      slide: 'logic_flow',
    },
  ];
}

/** #8 — densidade acima do que o slide sustenta em tela. */
function detectDensity(slides: SlideLike[]): UnifiedPedagogyFinding[] {
  const out: UnifiedPedagogyFinding[] = [];
  for (const slide of slides) {
    const type = String(slide.type ?? 'unknown');
    const rows = Array.isArray(slide.rows) ? slide.rows.length : 0;
    const items = Array.isArray(slide.items) ? slide.items.length : 0;

    if (rows > DENSITY_MAX) {
      out.push({
        code: 'pedagogy_density',
        message: `${type}.rows tem ${rows} linhas (máx. recomendado ${DENSITY_MAX}) — o aluno não lê tudo.`,
        path: `${type}.rows`,
        slide: type,
        key: 'rows',
      });
    }
    if (items > DENSITY_MAX) {
      out.push({
        code: 'pedagogy_density',
        message: `${type}.items tem ${items} itens (máx. recomendado ${DENSITY_MAX}) — o aluno não lê tudo.`,
        path: `${type}.items`,
        slide: type,
        key: 'items',
      });
    }
  }
  return out;
}

/** As 8 assinaturas em um passe. Report-only: não decide severidade. */
export function detectUnifiedPedagogy(payload: DetectPayload): UnifiedPedagogyFinding[] {
  const slides = slidesOf(payload);
  if (slides.length === 0) return [];

  return [
    ...detectPreAnswerSpoilers(slides),
    ...detectLogicPadding(slides),
    ...detectPolarityRisk(payload, slides),
    ...detectDangerOrphan(payload, slides),
    ...detectLogicMissingGabarito(slides),
    ...detectDensity(slides),
  ];
}

export type PedagogySignatureCounts = Record<PedagogySignatureCode, number>;

export function emptySignatureCounts(): PedagogySignatureCounts {
  return Object.fromEntries(
    PEDAGOGY_SIGNATURE_CODES.map((c) => [c, 0]),
  ) as PedagogySignatureCounts;
}

export function tallySignatures(
  findings: UnifiedPedagogyFinding[],
  into: PedagogySignatureCounts = emptySignatureCounts(),
): PedagogySignatureCounts {
  for (const f of findings) into[f.code] += 1;
  return into;
}
