/**
 * Projeção de 2 telas (F7) — função **pura** sobre o mesmo JSON de questão.
 *
 * Não muda schema, não escreve nada: reagrupa os 4 NeuroSlides já handcraftados em
 * duas telas com papéis distintos.
 *
 * - **Aula** — enquadramento (`concept_map`) + referência (`golden_rule`).
 * - **Prova** — portão de predição (compromisso antes de ver qualquer eliminação),
 *   eliminação (`logic_flow`), um card por distrator (`danger_zone`, com a polaridade
 *   de F1) e fixação (o que generaliza para a próxima prova).
 *
 * O ganho vem do **momento de compromisso** e da **ausência de redundância**, não do
 * número de telas: proposição que a tela Prova já ensina sai da tela Aula e fica
 * registrada em `dropped_redundant`.
 *
 * O portão de predição nunca carrega `is_correct` — a resposta só existe depois da
 * eliminação, como no contrato dos slides (gabarito só no `logic_flow`).
 *
 * @see lib/lesson/lessonProjectionConfig.ts — flag e piloto (Farmacodinâmica)
 * @see components/slides/core/dangerZonePolarity.ts — polaridade por item (F1)
 */

import {
  extractOptionLetter,
  isNegativeCommandQuestion,
  resolveDangerZoneItemPolarities,
  type DangerZoneItemLike,
  type DangerZoneItemPolarity,
  type DangerZoneOptionLike,
} from '@/components/slides/core/dangerZonePolarity';
import { significantWords } from '@/lib/catalogMigration/unifiedPedagogyDetector';

export const LESSON_PROJECTION_SCHEMA_VERSION = 'lesson-projection-v0' as const;

export type LessonProjectionSchemaVersion = typeof LESSON_PROJECTION_SCHEMA_VERSION;

/** Entrada tolerante: aceita `ReverseStudySlide` e o JSON cru do lote. */
export type LessonProjectionSlideInput = {
  type?: string;
  slide_title?: string;
  content?: string;
  footer_rule?: string;
  steps?: unknown;
  items?: unknown;
  rows?: unknown;
};

export type LessonProjectionInput = {
  slug?: string;
  meta?: { subtopico?: string; family?: string };
  question_data?: {
    instruction?: string;
    options?: DangerZoneOptionLike[];
  };
  reverse_study_slides?: LessonProjectionSlideInput[];
  study_slides?: LessonProjectionSlideInput[];
};

export type AulaFrame = { label: string; detail?: string };

export type AulaReferenceRow = { label: string; value: string };

/** Tela 1 — enquadra e dá a referência. Nenhum julgamento de alternativa. */
export type AulaScreen = {
  title?: string;
  enquadramento: AulaFrame[];
  referencia: AulaReferenceRow[];
  /** Regra de ouro do pacote (`golden_rule.footer_rule`, senão `concept_map.footer_rule`). */
  regra?: string;
};

/**
 * Portão de predição — o aluno se compromete com uma letra antes de ver a eliminação.
 * `reveals_answer` é sempre `false`: o tipo documenta a invariante que o teste cobre.
 */
export type PredictionGate = {
  prompt: string;
  options: { id: string; text: string }[];
  reveals_answer: false;
};

/** `elimination` cobre também o julgamento V/F de afirmativa romana, não só o descarte de letra. */
export type EliminationStepKind = 'setup' | 'elimination' | 'gabarito';

export type EliminationStep = {
  text: string;
  kind: EliminationStepKind;
};

export type DistractorCard = {
  /** Letra citada no rótulo (`Letra C — …`), quando existe. */
  letter: string | null;
  label: string;
  /** Por que a alternativa atrai (`items[].detail`). */
  trap?: string;
  /** O que é correto no lugar (`items[].correct`). */
  correct?: string;
  polarity: DangerZoneItemPolarity;
};

/** O que generaliza para a próxima prova — passo `Fixação:` e regras de transferência. */
export type FixationBlock = {
  rule?: string;
  transfer: string[];
  /** Quantos itens de `transfer` vieram de um passo `Fixação:` explícito no `logic_flow`. */
  explicit_count: number;
};

/** Tela 2 — compromisso, eliminação, cards por distrator, fixação. */
export type ProvaScreen = {
  prediction_gate: PredictionGate;
  elimination: EliminationStep[];
  distractor_cards: DistractorCard[];
  fixacao: FixationBlock;
};

export type DroppedRedundant = {
  text: string;
  from: 'concept_map' | 'golden_rule' | 'logic_flow';
  /** Texto da tela Prova que já ensina a mesma proposição. */
  duplicate_of: string;
};

export type LessonProjection = {
  schema_version: LessonProjectionSchemaVersion;
  slug?: string;
  subtopico?: string;
  /** Comando negativo (EXCETO / INCORRETA) — muda o chrome dos cards. */
  negative_command: boolean;
  aula: AulaScreen;
  prova: ProvaScreen;
  dropped_redundant: DroppedRedundant[];
  /** Lacunas do JSON de origem — insumo de fila, não bloqueio. */
  diagnostics: string[];
};

/* ────────────────────────────────────────────────────────────────────────────
 * Primitivas
 * ──────────────────────────────────────────────────────────────────────────── */

const FIXACAO_STEP_RE = /^fixa[cç][aã]o\s*:\s*/i;

/**
 * Julgamento por alternativa/afirmativa. `eliminar` no meio da frase não conta —
 * "meia-vida = eliminar 100%" é conteúdo, não descarte de distrator.
 */
const JUDGMENT_OPENING_RE = /^\s*(?:letra\s+)?(?:[a-e]|[ivx]{1,4})\s*[:)\-–—.]/i;
const JUDGMENT_ARROW_RE = /→\s*(?:elimina|fals[ao]|verdadeir[ao])/i;
const TRAILING_ELIMINAR_RE = /\belimina(?:r|do|da)\b[\s.;]*$/i;

const GABARITO_STEP_RE = /\bmarcar\b|\bgabarito\b|letra\s+[a-e]\b|combina[cç][aã]o\s*→/i;
const PADDING_CONFIRMAR_RE = /^confirmar\s*:/i;
const PADDING_MARCAR_RE = /^marcar\b/i;

/**
 * Redundância por contenção, não por Jaccard: os textos têm tamanhos muito
 * diferentes (item de 4 palavras × passo de 15) e Jaccard nunca dispararia.
 */
const REDUNDANCY_CONTAINMENT = 0.6;

function slidesOf(input: LessonProjectionInput): LessonProjectionSlideInput[] {
  const slides = input.reverse_study_slides ?? input.study_slides;
  return Array.isArray(slides) ? slides : [];
}

function findSlide(
  slides: LessonProjectionSlideInput[],
  type: string,
): LessonProjectionSlideInput | undefined {
  return slides.find((s) => s.type === type);
}

function asStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v ?? '').trim()).filter(Boolean);
}

function asRecords(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is Record<string, unknown> => Boolean(v) && typeof v === 'object');
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Fração das palavras significativas do texto curto presentes no texto longo. */
function containment(shorter: string, longer: string): number {
  const a = new Set(significantWords(shorter));
  if (a.size === 0) return 0;
  const b = new Set(significantWords(longer));
  let hits = 0;
  for (const word of a) if (b.has(word)) hits += 1;
  return hits / a.size;
}

function isRedundant(candidate: string, provaTexts: string[]): string | null {
  for (const target of provaTexts) {
    if (containment(candidate, target) >= REDUNDANCY_CONTAINMENT) return target;
  }
  return null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Tela Prova
 * ──────────────────────────────────────────────────────────────────────────── */

/** Comando final da questão — última linha do enunciado quando ele é multilinha. */
export function derivePredictionPrompt(instruction?: string): string {
  const raw = (instruction ?? '').trim();
  if (!raw) return '';
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= 1) return raw;
  return lines[lines.length - 1];
}

function buildPredictionGate(input: LessonProjectionInput): PredictionGate {
  const options = Array.isArray(input.question_data?.options) ? input.question_data.options : [];
  return {
    prompt: derivePredictionPrompt(input.question_data?.instruction),
    // `is_correct` fica de fora de propósito: o portão é compromisso, não conferência.
    options: options.map((option, index) => ({
      id: text(option?.id) || String.fromCharCode(65 + index),
      text: text(option?.text),
    })),
    reveals_answer: false,
  };
}

/** Eliminação antes de gabarito: "Letra A — … → eliminar" cita letra sem ser o fechamento. */
function classifyStep(step: string): EliminationStepKind {
  if (JUDGMENT_OPENING_RE.test(step) || JUDGMENT_ARROW_RE.test(step) || TRAILING_ELIMINAR_RE.test(step)) {
    return 'elimination';
  }
  if (GABARITO_STEP_RE.test(step)) return 'gabarito';
  return 'setup';
}

type EliminationSplit = {
  steps: EliminationStep[];
  fixacao: string[];
  dropped: DroppedRedundant[];
};

/** Separa `Fixação:` da eliminação e funde o padding `Confirmar:` + `Marcar`. */
function splitEliminationSteps(rawSteps: string[]): EliminationSplit {
  const fixacao: string[] = [];
  const dropped: DroppedRedundant[] = [];
  const kept: string[] = [];

  for (const step of rawSteps) {
    if (FIXACAO_STEP_RE.test(step)) {
      fixacao.push(step.replace(FIXACAO_STEP_RE, '').trim());
      continue;
    }
    const previous = kept[kept.length - 1];
    if (previous && PADDING_CONFIRMAR_RE.test(previous) && PADDING_MARCAR_RE.test(step)) {
      kept.pop();
      dropped.push({ text: previous, from: 'logic_flow', duplicate_of: step });
    }
    kept.push(step);
  }

  return {
    steps: kept.map((step) => ({ text: step, kind: classifyStep(step) })),
    fixacao,
    dropped,
  };
}

function buildDistractorCards(
  danger: LessonProjectionSlideInput | undefined,
  input: LessonProjectionInput,
): DistractorCard[] {
  const items = asRecords(danger?.items);
  const polarities = resolveDangerZoneItemPolarities(items as DangerZoneItemLike[], {
    instruction: input.question_data?.instruction,
    options: input.question_data?.options,
  });

  return items.map((item, index) => {
    const label = text(item.label) || text(item.title);
    return {
      letter: extractOptionLetter(label),
      label,
      trap: text(item.detail) || undefined,
      correct: text(item.correct) || undefined,
      polarity: polarities[index] ?? 'trap',
    };
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Projeção
 * ──────────────────────────────────────────────────────────────────────────── */

export function buildLessonProjection(input: LessonProjectionInput): LessonProjection {
  const slides = slidesOf(input);
  const conceptMap = findSlide(slides, 'concept_map');
  const goldenRule = findSlide(slides, 'golden_rule');
  const logicFlow = findSlide(slides, 'logic_flow');
  const dangerZone = findSlide(slides, 'danger_zone');

  const split = splitEliminationSteps(asStrings(logicFlow?.steps));
  const distractorCards = buildDistractorCards(dangerZone, input);

  const transfer = [...split.fixacao];
  const dangerFooter = text(dangerZone?.footer_rule);
  if (dangerFooter) transfer.push(dangerFooter);
  for (const row of asRecords(goldenRule?.rows)) {
    const fixation = text(row.fixation);
    if (fixation) transfer.push(fixation);
  }

  const provaTexts = [
    ...split.steps.map((s) => s.text),
    ...distractorCards.flatMap((c) => [c.label, c.trap ?? '', c.correct ?? '']),
    ...transfer,
  ].filter(Boolean);

  const dropped: DroppedRedundant[] = [...split.dropped];

  const conceptItems = asRecords(conceptMap?.items);
  const enquadramento: AulaFrame[] = [];
  conceptItems.forEach((item) => {
    const label = text(item.label) || text(item.title);
    const detail = text(item.detail) || text(item.description);
    const duplicateOf = isRedundant(`${label} ${detail}`.trim(), provaTexts);
    // Nunca esvaziar a tela Aula: o último item sobrevive mesmo redundante.
    if (duplicateOf && enquadramento.length > 0) {
      dropped.push({ text: `${label} — ${detail}`.trim(), from: 'concept_map', duplicate_of: duplicateOf });
      return;
    }
    if (label || detail) enquadramento.push({ label, detail: detail || undefined });
  });

  const referencia: AulaReferenceRow[] = [];
  asRecords(goldenRule?.rows).forEach((row) => {
    const label = text(row.label);
    const value = text(row.value);
    const duplicateOf = isRedundant(`${label} ${value}`.trim(), provaTexts);
    if (duplicateOf && referencia.length > 0) {
      dropped.push({ text: `${label} — ${value}`.trim(), from: 'golden_rule', duplicate_of: duplicateOf });
      return;
    }
    if (label || value) referencia.push({ label, value });
  });

  const diagnostics: string[] = [];
  if (!conceptMap) diagnostics.push('sem concept_map — tela Aula fica só com a referência.');
  if (!goldenRule) diagnostics.push('sem golden_rule — tela Aula fica sem referência.');
  if (!logicFlow) diagnostics.push('sem logic_flow — tela Prova fica sem eliminação.');
  if (!dangerZone) diagnostics.push('sem danger_zone — tela Prova fica sem card por distrator.');
  if (split.steps.length > 0 && !split.steps.some((s) => s.kind === 'gabarito')) {
    diagnostics.push('logic_flow não chega ao gabarito — o portão de predição fica sem fechamento.');
  }
  if (distractorCards.length > 0 && distractorCards.every((c) => c.letter === null)) {
    diagnostics.push('danger_zone sem letra nos rótulos — cards não mapeiam os distratores.');
  }
  if (transfer.length === 0) {
    diagnostics.push('sem fixação nem transferência — nada generaliza para a próxima prova.');
  }

  return {
    schema_version: LESSON_PROJECTION_SCHEMA_VERSION,
    slug: input.slug,
    subtopico: input.meta?.subtopico,
    negative_command: isNegativeCommandQuestion(input.question_data?.instruction),
    aula: {
      title: text(conceptMap?.slide_title) || text(goldenRule?.slide_title) || undefined,
      enquadramento,
      referencia,
      regra: text(goldenRule?.footer_rule) || text(conceptMap?.footer_rule) || undefined,
    },
    prova: {
      prediction_gate: buildPredictionGate(input),
      elimination: split.steps,
      distractor_cards: distractorCards,
      fixacao: {
        rule: text(logicFlow?.footer_rule) || undefined,
        transfer,
        explicit_count: split.fixacao.length,
      },
    },
    dropped_redundant: dropped,
    diagnostics,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Cobertura de fixação — fila da expansão pedagógica
 * ──────────────────────────────────────────────────────────────────────────── */

export type FixationGrade = 'strong' | 'thin' | 'missing';

export type FixationCoverage = {
  slug?: string;
  grade: FixationGrade;
  transfer_count: number;
  /** Passo `Fixação:` explícito no `logic_flow` — o que mais generaliza. */
  has_explicit_fixation: boolean;
  /** Cards cujo `correct` ensina a conduta certa, não só nega o distrator. */
  transferable_cards: number;
  reasons: string[];
};

const STRONG_TRANSFER_MIN = 2;
const STRONG_TRANSFERABLE_CARDS_MIN = 2;

/**
 * Fixação e itens de transferência são as únicas partes que servem à **próxima**
 * prova. Esta nota ordena a fila de expansão pedagógica (handcraft) por subtópico.
 */
export function gradeFixationCoverage(projection: LessonProjection): FixationCoverage {
  const transfer = projection.prova.fixacao.transfer;
  const hasExplicit = projection.prova.fixacao.explicit_count > 0;
  const transferableCards = projection.prova.distractor_cards.filter((c) => Boolean(c.correct)).length;

  const reasons: string[] = [];
  if (transfer.length === 0) reasons.push('nenhum item de transferência — só eliminação da questão do dia.');
  else if (transfer.length < STRONG_TRANSFER_MIN) reasons.push(`só ${transfer.length} item de transferência.`);
  if (!hasExplicit) reasons.push('sem passo "Fixação:" no logic_flow — o que generaliza fica implícito.');
  if (transferableCards < STRONG_TRANSFERABLE_CARDS_MIN) {
    reasons.push(`${transferableCards} card(s) com conduta correta — o resto só nega o distrator.`);
  }

  const grade: FixationGrade =
    transfer.length === 0
      ? 'missing'
      : transfer.length >= STRONG_TRANSFER_MIN && transferableCards >= STRONG_TRANSFERABLE_CARDS_MIN
        ? 'strong'
        : 'thin';

  return {
    slug: projection.slug,
    grade,
    transfer_count: transfer.length,
    has_explicit_fixation: hasExplicit,
    transferable_cards: transferableCards,
    reasons,
  };
}

export type FixationCoverageSummary = {
  total: number;
  strong: number;
  thin: number;
  missing: number;
  avg_transfer: number;
};

export function summarizeFixationCoverage(rows: FixationCoverage[]): FixationCoverageSummary {
  const total = rows.length;
  const sum = rows.reduce((acc, r) => acc + r.transfer_count, 0);
  return {
    total,
    strong: rows.filter((r) => r.grade === 'strong').length,
    thin: rows.filter((r) => r.grade === 'thin').length,
    missing: rows.filter((r) => r.grade === 'missing').length,
    avg_transfer: total === 0 ? 0 : Math.round((sum / total) * 10) / 10,
  };
}
