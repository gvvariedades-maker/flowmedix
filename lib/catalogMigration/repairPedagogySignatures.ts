/**
 * F3 — repair determinístico das assinaturas pedagógicas (sem LLM, sem handcraft).
 *
 * Quatro transformações puras, cada uma idempotente e conservadora: quando o texto sai
 * do padrão validado, o repair **pula** e registra o motivo, em vez de adivinhar. O
 * resíduo é justamente a fila de handcraft.
 *
 * 1. `letter_truncation` — corta a cláusula final após `—` que julga alternativa por letra.
 * 2. `logic_padding`     — funde `Confirmar:` + `Marcar` preservando o passo `Fixação:`.
 * 3. `vf_label`          — remove veredito V/F inicial e o prefixo `Afirmativa N — `.
 * 4. `gabarito_item`     — remove card/sufixo `Gabarito` / `Núcleo da letra X` do pré-resposta.
 *
 * Nada de ensino se perde: a proposição removida do slide 1 continua no `logic_flow`,
 * no `golden_rule` e no `danger_zone`.
 *
 * @see lib/catalogMigration/unifiedPedagogyDetector.ts (F2 — as 8 assinaturas)
 */

import { PRE_ANSWER_SLIDES, type SlideLike } from './unifiedPedagogyDetector';

export const PEDAGOGY_REPAIR_KINDS = [
  'letter_truncation',
  'logic_padding',
  'vf_label',
  'gabarito_item',
] as const;

export type PedagogyRepairKind = (typeof PEDAGOGY_REPAIR_KINDS)[number];

export type PedagogyRepairEdit = {
  kind: PedagogyRepairKind;
  action: 'rewrite' | 'remove';
  /** Caminho JSON legível (ex.: `concept_map.items[2].detail`). */
  path: string;
  slide: string;
  key: string;
  before: string;
  /** Texto resultante — vazio quando `action === 'remove'`. */
  after: string;
};

/** Ocorrência detectada e **não** reparada: fica para handcraft, com motivo revisável. */
export type PedagogyRepairSkip = {
  kind: PedagogyRepairKind;
  path: string;
  slide: string;
  key: string;
  text: string;
  reason:
    | 'kept_too_short'
    | 'kept_still_spoils'
    | 'remainder_too_short'
    | 'remainder_still_spoils'
    | 'label_has_no_concept'
    | 'would_lose_gabarito'
    | 'steps_too_short'
    | 'would_empty_pre_answer';
};

export type PedagogyRepairResult = {
  changed: boolean;
  edits: PedagogyRepairEdit[];
  skipped: PedagogyRepairSkip[];
};

/* ────────────────────────────────────────────────────────────────────────────
 * Padrões
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Cláusula que julga alternativa por letra (`C erra ao dizer…`, `E é conduta correta`).
 * Sem `\b` final: `é` não é caractere de palavra em JS e a borda nunca casaria.
 */
const LETTER_CLAUSE_RE = /\b[A-E]\b\s*(é|erra|erram|está|estão|são)/;
const LETTER_NAMED_RE = /letra\s+[A-E]\b/i;

/** Travessão com espaços — separador de cláusula usado nos goldens. */
const DASH_SEPARATOR_RE = /\s+[—–]\s+/g;

/** Fronteira de frase — a truncagem corta só a partir da frase que julga a letra. */
const SENTENCE_SPLIT_RE = /(?<=[.!?…])\s+/;

/** Veredito inicial mais a pontuação/travessão que o separa do ensino. */
const VF_VERDICT_PREFIX_RE = /^(FALSA|VERDADEIRA|FALSO|VERDADEIRO)\b[\s.:,;)\]—–-]*/i;
const AFIRMATIVA_PREFIX_RE = /^afirmativa\s+[IVXLC]+\s*[—–-]\s*/i;

const PADDING_CONFIRMAR_RE = /^Confirmar:/i;
const PADDING_MARCAR_RE = /^Marcar/i;
const FIXACAO_STEP_RE = /^Fixa[çc][aã]o:/i;
const LOGIC_GABARITO_RE = /marcar|gabarito|letra\s+[A-E]/i;

/** Card pré-resposta que anuncia o gabarito (bucket ~39 do leitor cego). */
const GABARITO_CARD_LABEL_RE = /^gabarito(?:\s*[|:—–-].*)?$/i;
const LETRA_CARD_LABEL_RE = /^letra\s+[A-E]\b/i;

/** Sufixos que entregam a letra sem ser a cláusula `— A é…` da truncagem. */
const NUCLEO_LETRA_SUFFIX_RE = /\s*N[uú]cleo da letra\s+[A-E]\.?\s*$/i;
const GABARITO_LETRA_SUFFIX_RE =
  /\s*(?:Gabarito\s*(?:letra\s+)?[A-E]\b|Gabarito\s*[|:—–-]\s*Letra\s+[A-E]\b)[^.]*\.?\s*$/i;
const ARROW_LETRA_SUFFIX_RE = /\s*→\s*letra\s+[A-E]\b\.?\s*$/i;
const NA_LETRA_DASH_TAIL_RE = /\s+[—–]\s+[^.]*\bletra\s+[A-E]\b[^.]*\.?\s*$/i;

/** Piso de texto restante — abaixo disso a truncagem viraria frase sem ensino. */
const MIN_KEPT_CHARS = 20;
const MIN_KEPT_WORDS = 3;
const MIN_STEPS_AFTER = 3;
const MIN_PRE_ANSWER_ITEMS = 2;

const ITEM_KEYS = ['label', 'detail', 'correct'] as const;
const ROW_KEYS = ['label', 'value', 'exam_hint', 'fixation'] as const;
const SLIDE_KEYS = ['content', 'footer_rule', 'slide_title'] as const;

function spoilsByLetter(text: string): boolean {
  return LETTER_CLAUSE_RE.test(text) || LETTER_NAMED_RE.test(text);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Fecha a frase com ponto quando a truncagem deixou pontuação pendente. */
function closeSentence(text: string): string {
  const trimmed = text.trim().replace(/[\s,;:·|/–—-]+$/, '');
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function upperFirst(text: string): string {
  return text.length === 0 ? text : `${text[0].toUpperCase()}${text.slice(1)}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Travessia mutável — mesmas superfícies do detector, agora com setter
 * ──────────────────────────────────────────────────────────────────────────── */

type MutableSurface = {
  slide: string;
  path: string;
  key: string;
  text: string;
  set(next: string): void;
};

function mutableSurfaces(slide: SlideLike): MutableSurface[] {
  const type = String(slide.type ?? 'unknown');
  const out: MutableSurface[] = [];

  const push = (
    holder: Record<string, unknown>,
    path: string,
    key: string,
  ) => {
    const raw = holder[key];
    const text = typeof raw === 'string' ? raw.trim() : '';
    if (!text) return;
    out.push({
      slide: type,
      path,
      key,
      text,
      set: (next: string) => {
        holder[key] = next;
      },
    });
  };

  for (const key of SLIDE_KEYS) {
    push(slide as Record<string, unknown>, `${type}.${key}`, key);
  }

  if (Array.isArray(slide.items)) {
    slide.items.forEach((raw, idx) => {
      if (!raw || typeof raw !== 'object') return;
      const item = raw as Record<string, unknown>;
      for (const key of ITEM_KEYS) push(item, `${type}.items[${idx}].${key}`, key);
    });
  }

  if (Array.isArray(slide.rows)) {
    slide.rows.forEach((raw, idx) => {
      if (!raw || typeof raw !== 'object') return;
      const row = raw as Record<string, unknown>;
      for (const key of ROW_KEYS) push(row, `${type}.rows[${idx}].${key}`, key);
    });
  }

  return out;
}

type RepairPayload = {
  reverse_study_slides?: unknown[];
  study_slides?: unknown[];
};

function slidesOfPayload(payload: RepairPayload): SlideLike[] {
  const raw = payload.reverse_study_slides ?? payload.study_slides;
  return Array.isArray(raw) ? (raw as SlideLike[]) : [];
}

/** Superfícies dos slides que precedem o raciocínio — onde spoiler entrega a resposta. */
function preAnswerSurfaces(payload: RepairPayload): MutableSurface[] {
  return slidesOfPayload(payload)
    .filter((slide) => PRE_ANSWER_SLIDES.has(String(slide.type ?? '')))
    .flatMap((slide) => mutableSurfaces(slide));
}

/* ────────────────────────────────────────────────────────────────────────────
 * #1 — truncagem da cláusula final que julga a alternativa
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Corta a última cláusula após `—` quando ela julga alternativa por letra.
 *
 * `"Pressão divergente = afastamento entre sistólica e diastólica — C erra ao dizer
 *  que máxima e mínima se aproximam."` → `"Pressão divergente = afastamento entre
 *  sistólica e diastólica."`
 */
export function repairLetterTruncationInPayload(payload: RepairPayload): PedagogyRepairResult {
  const edits: PedagogyRepairEdit[] = [];
  const skipped: PedagogyRepairSkip[] = [];

  for (const surface of preAnswerSurfaces(payload)) {
    const cut = splitTrailingClause(surface.text);
    if (!cut) continue;

    const { kept } = cut;
    const base = {
      kind: 'letter_truncation' as const,
      path: surface.path,
      slide: surface.slide,
      key: surface.key,
      text: surface.text,
    };

    if (kept.length < MIN_KEPT_CHARS || wordCount(kept) < MIN_KEPT_WORDS) {
      skipped.push({ ...base, reason: 'kept_too_short' });
      continue;
    }
    if (spoilsByLetter(kept)) {
      skipped.push({ ...base, reason: 'kept_still_spoils' });
      continue;
    }

    const next = closeSentence(kept);
    if (next === surface.text) continue;

    surface.set(next);
    edits.push({
      kind: 'letter_truncation',
      action: 'rewrite',
      path: surface.path,
      slide: surface.slide,
      key: surface.key,
      before: surface.text,
      after: next,
    });
  }

  return { changed: edits.length > 0, edits, skipped };
}

/**
 * Corta no último travessão quando a cauda julga alternativa por letra, mas só a partir
 * da frase que julga: `"… por sítio — não doses grandes. D erra ao falar em doses grandes."`
 * mantém `"… por sítio — não doses grandes."`.
 */
function splitTrailingClause(text: string): { kept: string } | null {
  const separators: { index: number; length: number }[] = [];
  DASH_SEPARATOR_RE.lastIndex = 0;
  let match = DASH_SEPARATOR_RE.exec(text);
  while (match) {
    separators.push({ index: match.index, length: match[0].length });
    match = DASH_SEPARATOR_RE.exec(text);
  }
  if (separators.length === 0) return null;

  const last = separators[separators.length - 1];
  const before = text.slice(0, last.index).trim();
  const dash = text.slice(last.index, last.index + last.length).trim();
  const tail = text.slice(last.index + last.length).trim();

  const sentences = tail.split(SENTENCE_SPLIT_RE);
  const judgingAt = sentences.findIndex((s) => LETTER_CLAUSE_RE.test(s));
  if (judgingAt < 0) return null;

  const keptTail = sentences.slice(0, judgingAt).join(' ').trim();
  return { kept: keptTail ? `${before} ${dash} ${keptTail}` : before };
}

/* ────────────────────────────────────────────────────────────────────────────
 * #2 — padding do logic_flow
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Remove o passo `Confirmar:` adjacente a `Marcar`, que só repete o gabarito.
 *
 * O passo `Marcar` fica (é o único lugar onde a resposta pode aparecer) e o passo
 * `Fixação:` nunca é tocado — é a parte que generaliza para a próxima prova.
 */
export function repairLogicPaddingInPayload(payload: RepairPayload): PedagogyRepairResult {
  const edits: PedagogyRepairEdit[] = [];
  const skipped: PedagogyRepairSkip[] = [];

  const logic = slidesOfPayload(payload).find((s) => s.type === 'logic_flow');
  if (!logic || !Array.isArray(logic.steps)) return { changed: false, edits, skipped };

  const steps = (logic.steps as unknown[]).map((s) => String(s));
  const dropIdx = new Set<number>();

  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i].trim();
    if (FIXACAO_STEP_RE.test(step) || !PADDING_CONFIRMAR_RE.test(step)) continue;

    const prev = i > 0 ? steps[i - 1].trim() : '';
    const next = i + 1 < steps.length ? steps[i + 1].trim() : '';
    const pairedWithMarcar =
      (next && PADDING_MARCAR_RE.test(next) && !dropIdx.has(i + 1)) ||
      (prev && PADDING_MARCAR_RE.test(prev) && !dropIdx.has(i - 1));
    if (!pairedWithMarcar) continue;

    const base = {
      kind: 'logic_padding' as const,
      path: `logic_flow.steps[${i}]`,
      slide: 'logic_flow',
      key: 'step',
      text: step,
    };

    const kept = steps.filter((_, idx) => idx !== i && !dropIdx.has(idx));
    if (kept.length < MIN_STEPS_AFTER) {
      skipped.push({ ...base, reason: 'steps_too_short' });
      continue;
    }
    if (!kept.some((s) => LOGIC_GABARITO_RE.test(s))) {
      skipped.push({ ...base, reason: 'would_lose_gabarito' });
      continue;
    }

    dropIdx.add(i);
    edits.push({
      kind: 'logic_padding',
      action: 'remove',
      path: base.path,
      slide: 'logic_flow',
      key: 'step',
      before: step,
      after: '',
    });
  }

  if (dropIdx.size > 0) {
    logic.steps = (logic.steps as unknown[]).filter((_, idx) => !dropIdx.has(idx));
  }

  return { changed: dropIdx.size > 0, edits, skipped };
}

/* ────────────────────────────────────────────────────────────────────────────
 * #3 — rótulos V/F
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Remove o veredito V/F inicial de qualquer superfície pré-resposta e o prefixo
 * `Afirmativa N — ` dos labels, que rotulam a questão em vez de nomear o conceito.
 *
 * Faixa não puramente aditiva: exige amostragem humana no diff antes de propagar.
 */
export function repairVfLabelsInPayload(payload: RepairPayload): PedagogyRepairResult {
  const edits: PedagogyRepairEdit[] = [];
  const skipped: PedagogyRepairSkip[] = [];

  for (const surface of preAnswerSurfaces(payload)) {
    const base = {
      kind: 'vf_label' as const,
      path: surface.path,
      slide: surface.slide,
      key: surface.key,
      text: surface.text,
    };

    if (VF_VERDICT_PREFIX_RE.test(surface.text)) {
      const remainder = surface.text.replace(VF_VERDICT_PREFIX_RE, '').trim();
      if (remainder.length < MIN_KEPT_CHARS || wordCount(remainder) < MIN_KEPT_WORDS) {
        skipped.push({ ...base, reason: 'remainder_too_short' });
        continue;
      }
      if (spoilsByLetter(remainder)) {
        skipped.push({ ...base, reason: 'remainder_still_spoils' });
        continue;
      }
      const next = upperFirst(remainder);
      surface.set(next);
      edits.push({
        kind: 'vf_label',
        action: 'rewrite',
        path: surface.path,
        slide: surface.slide,
        key: surface.key,
        before: surface.text,
        after: next,
      });
      continue;
    }

    if (surface.key === 'label' && AFIRMATIVA_PREFIX_RE.test(surface.text)) {
      const remainder = surface.text.replace(AFIRMATIVA_PREFIX_RE, '').trim();
      if (wordCount(remainder) < 1) {
        skipped.push({ ...base, reason: 'label_has_no_concept' });
        continue;
      }
      if (spoilsByLetter(remainder)) {
        skipped.push({ ...base, reason: 'remainder_still_spoils' });
        continue;
      }
      const next = upperFirst(remainder);
      surface.set(next);
      edits.push({
        kind: 'vf_label',
        action: 'rewrite',
        path: surface.path,
        slide: surface.slide,
        key: surface.key,
        before: surface.text,
        after: next,
      });
    }
  }

  return { changed: edits.length > 0, edits, skipped };
}

/* ────────────────────────────────────────────────────────────────────────────
 * #4 — card/sufixo Gabarito no pré-resposta
 * ──────────────────────────────────────────────────────────────────────────── */

function isGabaritoCard(label: string, detail: string): boolean {
  const L = label.trim();
  if (GABARITO_CARD_LABEL_RE.test(L)) return true;
  if (LETRA_CARD_LABEL_RE.test(L) && (/gabarito/i.test(detail) || LETTER_NAMED_RE.test(detail))) {
    return true;
  }
  return false;
}

function stripGabaritoSuffix(text: string): string | null {
  let next = text;
  let changed = false;

  // Parentéticos em qualquer posição — evita deixar "(" pendente.
  const parenRe =
    /\s*\(\s*(?:gabarito(?:\s*letra)?\s*[A-E]|EXCETO\s+letra\s+[A-E]|letra\s+[A-E])\s*\)/gi;
  if (parenRe.test(next)) {
    next = next.replace(parenRe, '').trim();
    changed = true;
  }

  const endPatterns = [
    NUCLEO_LETRA_SUFFIX_RE,
    GABARITO_LETRA_SUFFIX_RE,
    ARROW_LETRA_SUFFIX_RE,
    NA_LETRA_DASH_TAIL_RE,
  ];
  for (const re of endPatterns) {
    if (!re.test(next)) continue;
    next = next.replace(re, '').trim();
    changed = true;
  }

  next = next.replace(/\(\s*$/, '').trim().replace(/\s{2,}/g, ' ');
  return changed ? next : null;
}

/**
 * Remove cards `Gabarito` / `Letra X` do concept_map e golden_rule, e corta sufixos
 * (`Núcleo da letra A.`, `→ letra C.`, `— … na letra A.`) que o leitor cego ainda lê.
 *
 * O julgamento permanece no `logic_flow` / `danger_zone`.
 */
export function repairGabaritoItemInPayload(payload: RepairPayload): PedagogyRepairResult {
  const edits: PedagogyRepairEdit[] = [];
  const skipped: PedagogyRepairSkip[] = [];

  for (const slide of slidesOfPayload(payload)) {
    const type = String(slide.type ?? '');
    if (!PRE_ANSWER_SLIDES.has(type)) continue;

    // Remoção de cards — de trás pra frente, para o índice do path bater com o array original.
    if (Array.isArray(slide.items)) {
      const dropIdx = new Set<number>();
      for (let i = slide.items.length - 1; i >= 0; i -= 1) {
        const raw = slide.items[i];
        if (!raw || typeof raw !== 'object') continue;
        const item = raw as Record<string, unknown>;
        const label = typeof item.label === 'string' ? item.label : '';
        const detail = typeof item.detail === 'string' ? item.detail : '';
        if (!isGabaritoCard(label, detail)) continue;

        const keptCount = slide.items.length - dropIdx.size - 1;
        const base = {
          kind: 'gabarito_item' as const,
          path: `${type}.items[${i}]`,
          slide: type,
          key: 'item',
          text: `${label} | ${detail}`.trim(),
        };
        if (keptCount < MIN_PRE_ANSWER_ITEMS) {
          skipped.push({ ...base, reason: 'would_empty_pre_answer' });
          continue;
        }

        dropIdx.add(i);
        edits.push({
          kind: 'gabarito_item',
          action: 'remove',
          path: base.path,
          slide: type,
          key: 'item',
          before: base.text,
          after: '',
        });
      }
      if (dropIdx.size > 0) {
        slide.items = slide.items.filter((_, idx) => !dropIdx.has(idx));
      }
    }

    if (Array.isArray(slide.rows)) {
      const dropIdx = new Set<number>();
      for (let i = slide.rows.length - 1; i >= 0; i -= 1) {
        const raw = slide.rows[i];
        if (!raw || typeof raw !== 'object') continue;
        const row = raw as Record<string, unknown>;
        const label = typeof row.label === 'string' ? row.label : '';
        const value = typeof row.value === 'string' ? row.value : '';
        if (!isGabaritoCard(label, value)) continue;

        const keptCount = slide.rows.length - dropIdx.size - 1;
        const base = {
          kind: 'gabarito_item' as const,
          path: `${type}.rows[${i}]`,
          slide: type,
          key: 'row',
          text: `${label} | ${value}`.trim(),
        };
        if (keptCount < 1) {
          skipped.push({ ...base, reason: 'would_empty_pre_answer' });
          continue;
        }

        dropIdx.add(i);
        edits.push({
          kind: 'gabarito_item',
          action: 'remove',
          path: base.path,
          slide: type,
          key: 'row',
          before: base.text,
          after: '',
        });
      }
      if (dropIdx.size > 0) {
        slide.rows = slide.rows.filter((_, idx) => !dropIdx.has(idx));
      }
    }
  }

  for (const surface of preAnswerSurfaces(payload)) {
    const stripped = stripGabaritoSuffix(surface.text);
    if (stripped === null) continue;

    const base = {
      kind: 'gabarito_item' as const,
      path: surface.path,
      slide: surface.slide,
      key: surface.key,
      text: surface.text,
    };

    const minWords = surface.key === 'label' ? 1 : MIN_KEPT_WORDS;
    const minChars = surface.key === 'label' ? 3 : MIN_KEPT_CHARS;
    if (stripped.length < minChars || wordCount(stripped) < minWords) {
      skipped.push({ ...base, reason: 'remainder_too_short' });
      continue;
    }
    // Se ainda sobrar spoiler de letra (`— A erra…`), a truncagem (#1) limpa o resto.
    // Aplicar o sufixo mesmo assim — progresso parcial é melhor que pular.

    const next = closeSentence(stripped);
    if (next === surface.text) continue;

    surface.set(next);
    edits.push({
      kind: 'gabarito_item',
      action: 'rewrite',
      path: surface.path,
      slide: surface.slide,
      key: surface.key,
      before: surface.text,
      after: next,
    });
  }

  return { changed: edits.length > 0, edits, skipped };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Dispatch
 * ──────────────────────────────────────────────────────────────────────────── */

const REPAIRS: Record<PedagogyRepairKind, (payload: RepairPayload) => PedagogyRepairResult> = {
  letter_truncation: repairLetterTruncationInPayload,
  logic_padding: repairLogicPaddingInPayload,
  vf_label: repairVfLabelsInPayload,
  gabarito_item: repairGabaritoItemInPayload,
};

export function repairPedagogySignature(
  kind: PedagogyRepairKind,
  payload: RepairPayload,
): PedagogyRepairResult {
  return REPAIRS[kind](payload);
}

/** Rótulos das assinaturas que cada repair endereça — usado no relatório. */
export const REPAIR_TARGET_SIGNATURES: Record<PedagogyRepairKind, string[]> = {
  letter_truncation: ['pedagogy_letter_spoiler'],
  logic_padding: ['pedagogy_logic_padding'],
  vf_label: ['pedagogy_vf_verdict_spoiler', 'pedagogy_question_bound_label'],
  gabarito_item: ['pedagogy_letter_spoiler'],
};
