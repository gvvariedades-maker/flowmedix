/**
 * F2b — Portão do leitor cego.
 *
 * Um leitor recebe **só o `concept_map`** (items + `footer_rule`), em contexto limpo:
 * sem enunciado, sem alternativas, sem gabarito, sem os outros três slides. A pergunta
 * é "qual é a alternativa correta". A leitura do resultado é invertida em relação ao
 * intuitivo:
 *
 * - acertou a letra → **reprova** (o slide 1 entrega a resposta antes do raciocínio);
 * - `indeterminavel` → passa (é o comportamento desejado);
 * - errou a letra → passa, com log.
 *
 * A citação literal é o antídoto ao falso positivo: se o leitor acerta a letra mas não
 * consegue copiar um trecho do material que sustente a resposta, o acerto provavelmente
 * vem do conhecimento clínico dele, não de vazamento — vira `warn_unsupported_hit`,
 * revisável à mão, e não bloqueia.
 *
 * Pega o que regex não pega: spoiler parafraseado que nunca escreve "letra C".
 * Complementa (não substitui) `detectUnifiedPedagogy` de F2a.
 *
 * F2c: calibrar em ~20 âncoras (`data/catalog-migration/blind-reader-calibration-judgments.json`)
 * antes de `--strict` ou de vincular a `production_ready` (F4).
 *
 * @see lib/catalogMigration/unifiedPedagogyDetector.ts
 * @see lib/neurocanvas/pedagogicalNote.ts — nota pedagógica (fora de `gradeSlideReadiness`)
 * @see scripts/audit-blind-reader-gate.ts
 */

import { generateStructuredJson } from '@/lib/ai/geminiClient';

export type SlideLike = Record<string, unknown>;

export type BlindReaderQuestionPayload = {
  meta?: { subtopico?: string; family?: string };
  question_data?: {
    instruction?: string;
    options?: { id?: string; text?: string; is_correct?: boolean }[];
  };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
};

export const BLIND_READER_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;
export type BlindReaderLetter = (typeof BLIND_READER_LETTERS)[number];
/** Resposta do leitor: letra citada ou ausência de base para responder. */
export type BlindReaderGuess = BlindReaderLetter | 'indeterminavel';

/** Superfície do `concept_map` exposta ao leitor — o que o aluno lê na primeira tela. */
export type BlindReaderSurface = {
  path: string;
  text: string;
};

/** Recorte redigido: só o que o slide 1 mostra, nada da questão. */
export type BlindReaderView = {
  slug: string;
  surfaces: BlindReaderSurface[];
  /** Texto único entregue ao leitor — também é o corpus da checagem de literalidade. */
  redacted_text: string;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Recorte do concept_map
 * ──────────────────────────────────────────────────────────────────────────── */

function slidesOf(payload: BlindReaderQuestionPayload): SlideLike[] {
  const s = payload.reverse_study_slides ?? payload.study_slides;
  return Array.isArray(s) ? s : [];
}

/**
 * Recorta o `concept_map` em superfícies de texto.
 *
 * Deliberadamente restrito a `items[].label`, `items[].detail` e `footer_rule`:
 * é a superfície que precede o raciocínio no player. `question_data` nunca entra —
 * é justamente a variável que o portão isola.
 */
export function buildBlindReaderView(
  payload: BlindReaderQuestionPayload,
  slug: string,
): BlindReaderView | null {
  const concept = slidesOf(payload).find((s) => s.type === 'concept_map');
  if (!concept) return null;

  const surfaces: BlindReaderSurface[] = [];
  const push = (path: string, value: unknown) => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (text) surfaces.push({ path, text });
  };

  if (Array.isArray(concept.items)) {
    concept.items.forEach((raw, idx) => {
      if (!raw || typeof raw !== 'object') return;
      const item = raw as Record<string, unknown>;
      push(`concept_map.items[${idx}].label`, item.label);
      push(`concept_map.items[${idx}].detail`, item.detail);
    });
  }
  push('concept_map.footer_rule', concept.footer_rule);

  if (surfaces.length === 0) return null;

  return {
    slug,
    surfaces,
    redacted_text: surfaces.map((s) => s.text).join('\n'),
  };
}

/** Letra do gabarito a partir das alternativas — usada só para julgar, nunca no prompt. */
export function correctLetterOf(payload: BlindReaderQuestionPayload): BlindReaderLetter | null {
  const options = payload.question_data?.options ?? [];
  const hit = options.find((o) => o?.is_correct === true);
  const id = String(hit?.id ?? '')
    .trim()
    .toUpperCase();
  return (BLIND_READER_LETTERS as readonly string[]).includes(id)
    ? (id as BlindReaderLetter)
    : null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Prompt
 * ──────────────────────────────────────────────────────────────────────────── */

export const BLIND_READER_SYSTEM_PROMPT = [
  'Você é um leitor cego avaliando material de estudo de concurso.',
  'Você NÃO tem acesso ao enunciado da questão, às alternativas nem ao gabarito.',
  'Você vê apenas uma tela de estudo (mapa de conceitos).',
  '',
  'Tarefa: dizer qual letra de alternativa (A–E) é o gabarito da questão original,',
  'usando exclusivamente o texto fornecido.',
  '',
  'Regras:',
  '1. Só responda uma letra se o próprio texto permitir concluir a letra correta.',
  '2. Se o texto ensina o conteúdo sem revelar qual alternativa é a certa,',
  '   responda "indeterminavel". Essa é a resposta esperada em material bem feito.',
  '3. Não deduza a letra por conhecimento clínico próprio: a pergunta é o que ESTE texto entrega.',
  '4. "evidencia" deve ser um trecho copiado do texto, caractere por caractere,',
  '   sem reescrever nem resumir. Sem trecho literal disponível, responda "indeterminavel"',
  '   com "evidencia": "".',
  '',
  'Responda apenas JSON: {"gabarito": "A"|"B"|"C"|"D"|"E"|"indeterminavel", "evidencia": "..."}',
].join('\n');

export function buildBlindReaderUserPrompt(view: BlindReaderView): string {
  return ['TELA DE ESTUDO:', '', view.redacted_text].join('\n');
}

/* ────────────────────────────────────────────────────────────────────────────
 * Parsing e literalidade
 * ──────────────────────────────────────────────────────────────────────────── */

export type BlindReaderAnswer = {
  gabarito: BlindReaderGuess;
  evidencia: string;
};

const LETTER_IN_TEXT_RE = /\b([A-E])\b/;

function coerceGuess(raw: unknown): BlindReaderGuess {
  const text = String(raw ?? '')
    .trim()
    .toUpperCase();
  if (!text) return 'indeterminavel';
  if ((BLIND_READER_LETTERS as readonly string[]).includes(text)) return text as BlindReaderLetter;
  if (/INDETERMIN/.test(text)) return 'indeterminavel';
  const hit = text.match(LETTER_IN_TEXT_RE);
  return hit ? (hit[1] as BlindReaderLetter) : 'indeterminavel';
}

/** Tolerante de propósito: resposta ilegível é tratada como `indeterminavel` (passa). */
export function parseBlindReaderAnswer(json: unknown): BlindReaderAnswer {
  if (!json || typeof json !== 'object') return { gabarito: 'indeterminavel', evidencia: '' };
  const row = json as Record<string, unknown>;
  return {
    gabarito: coerceGuess(row.gabarito),
    evidencia: typeof row.evidencia === 'string' ? row.evidencia.trim() : '',
  };
}

function normalizeForLiteralMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”"'`´]/g, '')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Trecho curto casa por acidente; abaixo disso não conta como evidência. */
export const BLIND_READER_MIN_EVIDENCE_CHARS = 12;

/** A citação existe no material entregue, ignorando acento, aspas e espaçamento. */
export function evidenceIsLiteral(evidencia: string, view: BlindReaderView): boolean {
  const needle = normalizeForLiteralMatch(evidencia);
  if (needle.length < BLIND_READER_MIN_EVIDENCE_CHARS) return false;
  return normalizeForLiteralMatch(view.redacted_text).includes(needle);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Veredito
 * ──────────────────────────────────────────────────────────────────────────── */

export const BLIND_READER_VERDICTS = [
  /** Acertou a letra com citação literal — o slide 1 entrega o gabarito. Bloqueia. */
  'fail_leak',
  /** Acertou a letra sem citação literal — provável conhecimento próprio. Revisar à mão. */
  'warn_unsupported_hit',
  /** Não conseguiu responder: comportamento desejado. */
  'pass_indeterminate',
  /** Errou a letra: o material não vaza. */
  'pass_wrong_letter',
  /** Sem gabarito nas alternativas — nada a comparar. */
  'skip_no_gabarito',
  /** Sem `concept_map` — fora do escopo do portão. */
  'skip_no_concept_map',
] as const;

export type BlindReaderVerdict = (typeof BLIND_READER_VERDICTS)[number];

export type BlindReaderResult = {
  slug: string;
  verdict: BlindReaderVerdict;
  /** Verdadeiro só em `fail_leak` — o único veredito que barra lote. */
  blocking: boolean;
  gabarito: BlindReaderGuess;
  correct_letter: BlindReaderLetter | null;
  evidencia: string;
  evidence_literal: boolean;
  surfaces_count: number;
  model?: string;
};

export function judgeBlindReader(input: {
  view: BlindReaderView;
  answer: BlindReaderAnswer;
  correctLetter: BlindReaderLetter | null;
  model?: string;
}): BlindReaderResult {
  const { view, answer, correctLetter, model } = input;
  const evidenceLiteral = evidenceIsLiteral(answer.evidencia, view);

  let verdict: BlindReaderVerdict;
  if (answer.gabarito === 'indeterminavel') {
    verdict = 'pass_indeterminate';
  } else if (!correctLetter) {
    verdict = 'skip_no_gabarito';
  } else if (answer.gabarito !== correctLetter) {
    verdict = 'pass_wrong_letter';
  } else {
    verdict = evidenceLiteral ? 'fail_leak' : 'warn_unsupported_hit';
  }

  return {
    slug: view.slug,
    verdict,
    blocking: verdict === 'fail_leak',
    gabarito: answer.gabarito,
    correct_letter: correctLetter,
    evidencia: answer.evidencia,
    evidence_literal: evidenceLiteral,
    surfaces_count: view.surfaces.length,
    model,
  };
}

export function skippedResult(slug: string): BlindReaderResult {
  return {
    slug,
    verdict: 'skip_no_concept_map',
    blocking: false,
    gabarito: 'indeterminavel',
    correct_letter: null,
    evidencia: '',
    evidence_literal: false,
    surfaces_count: 0,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Execução
 * ──────────────────────────────────────────────────────────────────────────── */

/** Injetável: os testes passam um leitor determinístico; a CLI passa o Gemini. */
export type BlindReaderModelCall = (req: {
  system: string;
  user: string;
}) => Promise<{ json: unknown; model?: string }>;

export const geminiBlindReaderCall: BlindReaderModelCall = async ({ system, user }) => {
  const res = await generateStructuredJson({ system, user, temperature: 0 });
  return { json: res.json, model: res.model };
};

export async function runBlindReaderOnQuestion(
  payload: BlindReaderQuestionPayload,
  options: { slug: string; call: BlindReaderModelCall },
): Promise<BlindReaderResult> {
  const view = buildBlindReaderView(payload, options.slug);
  if (!view) return skippedResult(options.slug);

  const res = await options.call({
    system: BLIND_READER_SYSTEM_PROMPT,
    user: buildBlindReaderUserPrompt(view),
  });

  return judgeBlindReader({
    view,
    answer: parseBlindReaderAnswer(res.json),
    correctLetter: correctLetterOf(payload),
    model: res.model,
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Agregação
 * ──────────────────────────────────────────────────────────────────────────── */

export type BlindReaderVerdictCounts = Record<BlindReaderVerdict, number>;

export function emptyVerdictCounts(): BlindReaderVerdictCounts {
  return Object.fromEntries(BLIND_READER_VERDICTS.map((v) => [v, 0])) as BlindReaderVerdictCounts;
}

export type BlindReaderRunSummary = {
  corpus: string;
  generated_at: string;
  total: number;
  judged: number;
  blocking: number;
  verdicts: BlindReaderVerdictCounts;
  results: BlindReaderResult[];
};

export function summarizeBlindReaderResults(
  results: BlindReaderResult[],
  corpus: string,
): BlindReaderRunSummary {
  const verdicts = emptyVerdictCounts();
  for (const r of results) verdicts[r.verdict] += 1;

  const skipped = verdicts.skip_no_concept_map + verdicts.skip_no_gabarito;

  return {
    corpus,
    generated_at: new Date().toISOString(),
    total: results.length,
    judged: results.length - skipped,
    blocking: results.filter((r) => r.blocking).length,
    verdicts,
    results,
  };
}

export function renderBlindReaderMarkdown(summary: BlindReaderRunSummary): string {
  const lines: string[] = [
    '# Portão do leitor cego (F2b)',
    '',
    `Corpus: \`${summary.corpus}\` · gerado em ${summary.generated_at}`,
    '',
    `- Questões percorridas: **${summary.total}**`,
    `- Julgadas (com concept_map e gabarito): **${summary.judged}**`,
    `- Bloqueando (\`fail_leak\`): **${summary.blocking}**`,
    '',
    '| veredito | n |',
    '|---|---|',
  ];

  for (const verdict of BLIND_READER_VERDICTS) {
    lines.push(`| \`${verdict}\` | ${summary.verdicts[verdict]} |`);
  }

  const flagged = summary.results.filter(
    (r) => r.verdict === 'fail_leak' || r.verdict === 'warn_unsupported_hit',
  );

  if (flagged.length > 0) {
    lines.push('', '## Acertos do leitor cego', '', '| slug | veredito | letra | evidência |', '|---|---|---|---|');
    for (const r of flagged) {
      const evidence = r.evidencia.replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 160);
      lines.push(`| \`${r.slug}\` | \`${r.verdict}\` | ${r.gabarito} | ${evidence} |`);
    }
  }

  lines.push(
    '',
    '> Leitura invertida: acerto do leitor cego **reprova** o slide.',
    '> `warn_unsupported_hit` = acertou sem citar trecho literal — calibrar à mão antes de barrar lote.',
    '',
  );

  return lines.join('\n');
}
