/**
 * GOLDEN Content Standard v1 — gramática de slots, política de fontes e lint.
 * Metadados em meta.* são internos (não renderizados no player).
 * @see docs/GOLDEN_CONTENT_STANDARD.md
 */

import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { lintVitalsGoldenContent } from '@/lib/slides/vitalsGoldenLint';

export const GOLDEN_CONTENT_STANDARD_VERSION = 'golden-v1' as const;

export type GoldenContentStandardVersion = typeof GOLDEN_CONTENT_STANDARD_VERSION;

export type SourceTier = 'A' | 'B';

export type GoldenFamilyId = FamilyId;

export type ContentSource = {
  id: string;
  tier: SourceTier;
  issuer: string;
  title: string;
  year: number;
  url?: string;
  covers?: string[];
};

export type ContentReview = {
  reviewed_at: string;
  reviewer?: string;
  guideline_snapshot: string;
  exam_vs_current?: 'none' | string;
};

export type GoldenMetaExtensions = {
  content_standard?: GoldenContentStandardVersion;
  family?: GoldenFamilyId;
  content_review?: ContentReview;
  sources?: ContentSource[];
};

export type GoldenContentLintIssue = {
  code: string;
  message: string;
  path?: string;
};

/** Frases proibidas em goldens (genérico / stub / template vazio). */
export const GOLDEN_BANNED_PHRASES = [
  'relacione o tema',
  'conceito central',
  'regra essencial genérica',
  'ponto 1',
  'ponto 2',
  'erros comuns na prova',
  'elimine alternativas',
  'passo genérico',
  '[ia]',
  'preencher artigo',
  'segundo especialistas',
  'de acordo com especialistas',
] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type SlideLike = Record<string, unknown>;
type QuestaoLike = {
  meta?: GoldenMetaExtensions & Record<string, unknown>;
  question_data?: {
    instruction?: string;
    options?: { id: string; text: string; is_correct: boolean }[];
  };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
};

function slidesOf(q: QuestaoLike): SlideLike[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? s : [];
}

function slideText(slides: SlideLike[]): string {
  return JSON.stringify(slides).toLowerCase();
}

function findSlide(slides: SlideLike[], type: string): SlideLike | undefined {
  return slides.find((s) => s.type === type);
}

function optionIds(q: QuestaoLike): string[] {
  return (q.question_data?.options ?? []).map((o) => o.id.toUpperCase());
}

function correctOptionId(q: QuestaoLike): string | undefined {
  return q.question_data?.options?.find((o) => o.is_correct)?.id.toUpperCase();
}

/** Detecta menção a letra de alternativa ou gabarito no texto. */
export function hasQuestionSpecificity(text: string, q: QuestaoLike): boolean {
  const lower = text.toLowerCase();
  const ids = optionIds(q);
  if (ids.some((id) => new RegExp(`\\bletra\\s+${id.toLowerCase()}\\b`).test(lower))) return true;
  if (ids.some((id) => new RegExp(`\\b${id}\\b`).test(lower))) return true;
  if (/gabarito|marcar\s+[a-e]|alternativa\s+[a-e]/i.test(lower)) return true;
  if (/I\s*[-–]|II\s*[-–]|julgar\s+I/i.test(lower)) return true;
  const inst = q.question_data?.instruction ?? '';
  const tokens = inst
    .replace(/[^\wÀ-ú×°%/]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .slice(0, 8);
  return tokens.some((t) => lower.includes(t.toLowerCase()));
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Concatena apenas os VALORES string dos slides (ignora chaves do JSON). */
function collectSlideStrings(node: unknown): string {
  if (typeof node === 'string') return node + ' ';
  if (Array.isArray(node)) return node.map(collectSlideStrings).join('');
  if (node && typeof node === 'object') {
    return Object.values(node as Record<string, unknown>).map(collectSlideStrings).join('');
  }
  return '';
}

// Palavras vazias + ruído de comando de prova — não contam como "termo do enunciado".
const PT_STOPWORDS = new Set([
  'para', 'pela', 'pelo', 'pelas', 'pelos', 'como', 'sobre', 'entre', 'quando', 'onde',
  'qual', 'quais', 'esta', 'este', 'esses', 'essas', 'aquele', 'aquela', 'isso',
  'seu', 'sua', 'seus', 'suas', 'que', 'com', 'sem', 'dos', 'das', 'aos', 'nas', 'nos',
  'uma', 'uns', 'umas', 'são', 'sao', 'ser', 'tem', 'têm', 'ter', 'foi', 'pode', 'deve',
  'assinale', 'alternativa', 'alternativas', 'correta', 'correto', 'incorreta', 'incorreto',
  'seguir', 'seguinte', 'seguintes', 'afirmativa', 'afirmativas', 'afirmacoes',
  'considerando', 'respeito', 'analise', 'questao', 'questoes', 'abaixo', 'acima',
  'apenas', 'todas', 'todos', 'cada', 'item', 'itens', 'opcao', 'opcoes', 'marque',
  'relacao', 'seguranca', 'profissional', 'enfermagem', 'tecnico', 'paciente', 'usuario',
]);

/** Termos de conteúdo do enunciado (≥5 letras, sem stopword/numero), normalizados e únicos. */
export function extractInstructionTerms(instruction: string): string[] {
  const seen = new Set<string>();
  for (const raw of normalizeText(instruction).split(/[^a-z0-9]+/)) {
    if (raw.length < 5) continue;
    if (/^\d+$/.test(raw)) continue;
    if (PT_STOPWORDS.has(raw)) continue;
    seen.add(raw);
  }
  return [...seen];
}

// Claim numérico/normativo: dose, intervalo, percentual, tempo, escore.
// `%` não é word-char — `\b` após `%` falhava em "70% após".
export const NUMERIC_CLAIM_RE =
  /\b\d+([.,]\d+)?\s*%|\b\d+([.,]\d+)?\s*(mg|ml|mcg|µg|ug|ui|g\b|kg|h\b|hora|horas|dia|dias|semana|semanas|mes|meses|min|minuto|minutos|°c|graus|mmhg|bpm|gota|gotas|ampola|comprimido|ponto|pontos|escore)\b/i;

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Maior sequência contígua de palavras compartilhada entre dois textos (longest common substring em palavras). */
function longestContiguousWordRun(a: string, b: string): number {
  const wa = normalizeWords(a);
  const wb = normalizeWords(b);
  if (wa.length === 0 || wb.length === 0) return 0;
  let best = 0;
  let prev = new Array<number>(wb.length + 1).fill(0);
  for (let i = 1; i <= wa.length; i++) {
    const curr = new Array<number>(wb.length + 1).fill(0);
    for (let j = 1; j <= wb.length; j++) {
      if (wa[i - 1] === wb[j - 1]) {
        curr[j] = prev[j - 1] + 1;
        if (curr[j] > best) best = curr[j];
      }
    }
    prev = curr;
  }
  return best;
}

const RECYCLE_SHINGLE = 8;

/**
 * logic_flow não pode ser uma lista das alternativas: detecta steps que copiam
 * trecho longo (≥8 palavras contíguas) do texto de uma option. Falha quando a
 * maioria dos steps é cópia — o vício "alternativa reembrulhada como passo".
 */
export function lintLogicFlowRecycling(slides: SlideLike[], q: QuestaoLike): GoldenContentLintIssue[] {
  const logic = findSlide(slides, 'logic_flow');
  const steps = Array.isArray(logic?.steps) ? (logic!.steps as unknown[]) : [];
  const options = q.question_data?.options ?? [];
  if (steps.length === 0 || options.length === 0) return [];

  let recycled = 0;
  for (const step of steps) {
    if (typeof step !== 'string') continue;
    const maxRun = Math.max(0, ...options.map((o) => longestContiguousWordRun(step, o.text)));
    if (maxRun >= RECYCLE_SHINGLE) recycled++;
  }

  const ratio = recycled / steps.length;
  if (recycled >= 2 && ratio >= 0.5) {
    return [
      {
        code: 'logic_flow_recycled',
        message: `logic_flow recicla o texto das alternativas (${recycled}/${steps.length} steps copiam ≥${RECYCLE_SHINGLE} palavras de uma option). Steps devem ensinar a estratégia de julgamento, não repetir a alternativa.`,
        path: 'reverse_study_slides.logic_flow.steps',
      },
    ];
  }
  return [];
}

const LAYER_REDUNDANCY_SHINGLE = 7;
const LAYER_REDUNDANCY_MIN_BLOCKS = 2;
const LAYER_REDUNDANCY_MIN_RATIO = 0.5;
/** Blocos curtos (rótulos de uma palavra) geram falso positivo. */
const LAYER_REDUNDANCY_MIN_CHARS = 18;

function slideTextBlocks(parts: Array<string | undefined | null>): string[] {
  return parts
    .map((p) => String(p ?? '').replace(/\s+/g, ' ').trim())
    .filter((t) => t.length >= LAYER_REDUNDANCY_MIN_CHARS);
}

function goldenRuleRowTexts(slide: SlideLike | undefined): string[] {
  if (!slide) return [];
  const rows = slide.rows;
  if (Array.isArray(rows) && rows.length > 0) {
    return slideTextBlocks(
      (rows as Record<string, unknown>[]).map((r) => `${r.label ?? ''} ${r.value ?? ''}`),
    );
  }
  return slideTextBlocks([typeof slide.content === 'string' ? slide.content : '']);
}

function conceptMapItemTexts(slide: SlideLike | undefined): string[] {
  if (!slide || !Array.isArray(slide.items)) return [];
  return slideTextBlocks(
    (slide.items as Record<string, unknown>[]).map((it) => `${it.label ?? ''} ${it.detail ?? ''}`),
  );
}

function logicFlowStepTexts(slide: SlideLike | undefined): string[] {
  if (!slide || !Array.isArray(slide.steps)) return [];
  return slideTextBlocks(
    (slide.steps as unknown[]).filter((s): s is string => typeof s === 'string'),
  );
}

function countRedundantBlocks(source: string[], target: string[], shingle: number): number {
  if (source.length === 0 || target.length === 0) return 0;
  let matched = 0;
  for (const block of source) {
    const maxRun = Math.max(0, ...target.map((t) => longestContiguousWordRun(block, t)));
    if (maxRun >= shingle) matched++;
  }
  return matched;
}

function layerRedundancyIssue(
  code: string,
  path: string,
  pairLabel: string,
  matched: number,
  total: number,
): GoldenContentLintIssue {
  return {
    code,
    message: `${pairLabel}: ${matched}/${total} blocos compartilham ≥${LAYER_REDUNDANCY_SHINGLE} palavras contíguas com o outro slide — cada tipo deve ensinar uma camada distinta (playbook §2.1).`,
    path,
  };
}

/**
 * Detecta reciclagem entre camadas de slides (v2): golden_rule não deve copiar
 * logic_flow; concept_map não deve espelhar golden_rule como tabela duplicada.
 */
export function lintSlideLayerRedundancy(slides: SlideLike[]): GoldenContentLintIssue[] {
  const issues: GoldenContentLintIssue[] = [];
  const golden = findSlide(slides, 'golden_rule');
  const logic = findSlide(slides, 'logic_flow');
  const concept = findSlide(slides, 'concept_map');

  const goldenRows = goldenRuleRowTexts(golden);
  const logicSteps = logicFlowStepTexts(logic);
  const conceptItems = conceptMapItemTexts(concept);

  if (goldenRows.length >= LAYER_REDUNDANCY_MIN_BLOCKS && logicSteps.length > 0) {
    const matched = countRedundantBlocks(goldenRows, logicSteps, LAYER_REDUNDANCY_SHINGLE);
    const ratio = matched / goldenRows.length;
    if (matched >= LAYER_REDUNDANCY_MIN_BLOCKS && ratio >= LAYER_REDUNDANCY_MIN_RATIO) {
      issues.push(
        layerRedundancyIssue(
          'slide_layer_redundancy_golden_logic',
          'reverse_study_slides.golden_rule',
          'golden_rule × logic_flow',
          matched,
          goldenRows.length,
        ),
      );
    }
  }

  if (goldenRows.length >= LAYER_REDUNDANCY_MIN_BLOCKS && conceptItems.length >= LAYER_REDUNDANCY_MIN_BLOCKS) {
    const matched = countRedundantBlocks(goldenRows, conceptItems, LAYER_REDUNDANCY_SHINGLE);
    const ratio = matched / goldenRows.length;
    if (matched >= LAYER_REDUNDANCY_MIN_BLOCKS && ratio >= LAYER_REDUNDANCY_MIN_RATIO) {
      issues.push(
        layerRedundancyIssue(
          'slide_layer_redundancy_concept_golden',
          'reverse_study_slides.concept_map',
          'concept_map × golden_rule',
          matched,
          goldenRows.length,
        ),
      );
    }
  }

  return issues;
}

/** golden_rule v2: row de gabarito/spoiler antecipa logic_flow. */
export function lintGoldenRuleGabaritoSpoiler(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  if (!golden || !Array.isArray(golden.rows)) return [];
  const rows = golden.rows as Record<string, unknown>[];
  const spoiler = rows.some((r) => GABARITO_LABEL_RE.test(String(r.label ?? '')));
  if (!spoiler) return [];
  return [
    {
      code: 'golden_rule_gabarito_spoiler',
      message:
        'golden_rule contém row de gabarito/combinação — em v2 o gabarito fica só no logic_flow (playbook §2.1).',
      path: 'reverse_study_slides.golden_rule.rows',
    },
  ];
}

/** Extrai letra (A–E) de um texto: "letra X", ou letra isolada. */
function letterFromValue(text: string): string | null {
  const byLetra = text.match(/\bletra\s+([a-e])\b/i);
  if (byLetra) return byLetra[1].toUpperCase();
  const lone = text.match(/^\s*([a-e])\s*$/i);
  return lone ? lone[1].toUpperCase() : null;
}

const GABARITO_LABEL_RE = /gabarito|combina[çc]/i;

/**
 * Letras de gabarito declaradas nos slides — lê apenas CAMPOS ESTRUTURADOS de
 * declaração de resposta (danger_zone.correct "Gabarito letra X"; golden_rule.rows
 * e concept_map.items com label de gabarito/combinação). Não varre JSON concatenado,
 * evitando que "…gabarito." de um item case com o "Letra X" do distrator seguinte.
 */
function extractStatedGabaritoLetters(slides: SlideLike[]): Set<string> {
  const found = new Set<string>();
  for (const slide of slides) {
    const type = slide.type;

    if (type === 'danger_zone' && Array.isArray(slide.items)) {
      for (const it of slide.items as Record<string, unknown>[]) {
        const correct = String(it?.correct ?? '');
        const m = correct.match(/\bgabarito\s+(?:letra\s+)?([a-e])\b/i);
        if (m) found.add(m[1].toUpperCase());
      }
    }

    if (type === 'golden_rule' && Array.isArray(slide.rows)) {
      for (const row of slide.rows as Record<string, unknown>[]) {
        if (GABARITO_LABEL_RE.test(String(row?.label ?? ''))) {
          const letter = letterFromValue(String(row?.value ?? ''));
          if (letter) found.add(letter);
        }
      }
    }

    if (type === 'concept_map' && Array.isArray(slide.items)) {
      for (const it of slide.items as Record<string, unknown>[]) {
        if (GABARITO_LABEL_RE.test(String(it?.label ?? ''))) {
          const letter = letterFromValue(String(it?.detail ?? ''));
          if (letter) found.add(letter);
        }
      }
    }
  }
  return found;
}

/**
 * Consistência de gabarito: a letra do gabarito citada nos slides deve ser a
 * mesma marcada como is_correct. Evita o pior defeito — ensinar gabarito errado.
 */
export function lintGabaritoConsistency(slides: SlideLike[], q: QuestaoLike): GoldenContentLintIssue[] {
  const correctId = correctOptionId(q);
  if (!correctId) return [];
  const stated = extractStatedGabaritoLetters(slides);
  if (stated.size === 0) return [];

  const wrong = [...stated].filter((l) => l !== correctId);
  if (wrong.length > 0) {
    return [
      {
        code: 'gabarito_mismatch',
        message: `Slides citam gabarito letra ${wrong.join('/')} mas a alternativa correta (is_correct) é a letra ${correctId}.`,
        path: 'reverse_study_slides',
      },
    ];
  }
  return [];
}

/**
 * Claim↔source: se os slides afirmam número normativo (dose, intervalo, %, escore),
 * deve existir ao menos uma source substantiva (com `covers`) — evita número
 * "autoritativo" apoiado em fonte-placeholder. Não verifica veracidade (humano + tier A/B).
 */
export function lintClaimSourceBinding(
  slides: SlideLike[],
  meta: GoldenMetaExtensions | undefined,
): GoldenContentLintIssue[] {
  const text = collectSlideStrings(slides);
  if (!NUMERIC_CLAIM_RE.test(text)) return [];

  const sources = meta?.sources ?? [];
  const hasSubstantive = sources.some(
    (s) => Array.isArray(s.covers) && s.covers.some((c) => c && c.trim().length > 0),
  );
  if (!hasSubstantive) {
    return [
      {
        code: 'numeric_claim_unsourced',
        message:
          'Slides afirmam número normativo (dose/intervalo/%/escore) sem source substantiva (sources[].covers). Vincule o claim a uma fonte oficial.',
        path: 'meta.sources',
      },
    ];
  }
  return [];
}

export function lintBannedPhrases(slides: SlideLike[]): GoldenContentLintIssue[] {
  const text = slideText(slides);
  const issues: GoldenContentLintIssue[] = [];
  for (const phrase of GOLDEN_BANNED_PHRASES) {
    if (text.includes(phrase)) {
      issues.push({
        code: 'banned_phrase',
        message: `Slide contém frase proibida: "${phrase}"`,
      });
    }
  }
  return issues;
}

export function lintGoldenMeta(meta: GoldenMetaExtensions | undefined): GoldenContentLintIssue[] {
  const issues: GoldenContentLintIssue[] = [];
  if (!meta || meta.content_standard !== GOLDEN_CONTENT_STANDARD_VERSION) {
    return issues;
  }

  if (!meta.family) {
    issues.push({ code: 'meta_family', message: 'meta.family é obrigatório quando content_standard=golden-v1', path: 'meta.family' });
  }

  const review = meta.content_review;
  if (!review) {
    issues.push({
      code: 'meta_content_review',
      message: 'meta.content_review é obrigatório quando content_standard=golden-v1',
      path: 'meta.content_review',
    });
  } else {
    if (!review.reviewed_at || !ISO_DATE.test(review.reviewed_at)) {
      issues.push({
        code: 'meta_reviewed_at',
        message: 'content_review.reviewed_at deve ser AAAA-MM-DD',
        path: 'meta.content_review.reviewed_at',
      });
    }
    if (!review.guideline_snapshot?.trim()) {
      issues.push({
        code: 'meta_guideline_snapshot',
        message: 'content_review.guideline_snapshot é obrigatório',
        path: 'meta.content_review.guideline_snapshot',
      });
    }
  }

  const sources = meta.sources;
  if (!sources || sources.length === 0) {
    issues.push({
      code: 'meta_sources',
      message: 'meta.sources deve ter ao menos 1 fonte oficial (tier A ou B)',
      path: 'meta.sources',
    });
  } else {
    sources.forEach((src, i) => {
      if (!src.id?.trim()) {
        issues.push({ code: 'source_id', message: `sources[${i}].id obrigatório`, path: `meta.sources[${i}].id` });
      }
      if (src.tier !== 'A' && src.tier !== 'B') {
        issues.push({ code: 'source_tier', message: `sources[${i}].tier deve ser A ou B`, path: `meta.sources[${i}].tier` });
      }
      if (!src.issuer?.trim() || !src.title?.trim()) {
        issues.push({ code: 'source_issuer', message: `sources[${i}] issuer/title obrigatórios`, path: `meta.sources[${i}]` });
      }
      if (!Number.isFinite(src.year) || src.year < 1990 || src.year > 2100) {
        issues.push({ code: 'source_year', message: `sources[${i}].year inválido`, path: `meta.sources[${i}].year` });
      }
    });
  }

  return issues;
}

function lintSlidePackage(slides: SlideLike[], q: QuestaoLike, family?: GoldenFamilyId): GoldenContentLintIssue[] {
  const issues: GoldenContentLintIssue[] = [];
  const types = ['concept_map', 'golden_rule', 'logic_flow', 'danger_zone'] as const;

  for (const type of types) {
    if (!findSlide(slides, type)) {
      issues.push({ code: 'slide_missing', message: `Falta slide obrigatório: ${type}`, path: `reverse_study_slides.${type}` });
    }
  }

  const concept = findSlide(slides, 'concept_map');
  const items = concept?.items;
  if (!Array.isArray(items) || items.length < 3) {
    issues.push({
      code: 'concept_map_items',
      message: 'concept_map deve ter ao menos 3 items',
      path: 'reverse_study_slides.concept_map.items',
    });
  }

  const golden = findSlide(slides, 'golden_rule');
  const hasGoldenContent =
    (typeof golden?.content === 'string' && golden.content.trim().length > 0) ||
    (Array.isArray(golden?.rows) && golden.rows.length > 0);
  if (!hasGoldenContent) {
    issues.push({
      code: 'golden_rule_content',
      message: 'golden_rule precisa de content ou rows',
      path: 'reverse_study_slides.golden_rule',
    });
  }

  const logic = findSlide(slides, 'logic_flow');
  const steps = logic?.steps;
  if (!Array.isArray(steps) || steps.length < 3) {
    issues.push({
      code: 'logic_flow_steps',
      message: 'logic_flow deve ter ao menos 3 steps',
      path: 'reverse_study_slides.logic_flow.steps',
    });
  } else if (logic?.reveal_mode !== 'tap') {
    issues.push({
      code: 'logic_flow_tap',
      message: 'logic_flow deve usar reveal_mode: "tap" em conteúdo golden-v1',
      path: 'reverse_study_slides.logic_flow.reveal_mode',
    });
  }

  const danger = findSlide(slides, 'danger_zone');
  const dangerItems = danger?.items;
  if (!Array.isArray(dangerItems) || dangerItems.length < 2) {
    issues.push({
      code: 'danger_zone_items',
      message: 'danger_zone deve ter ao menos 2 items com correct',
      path: 'reverse_study_slides.danger_zone.items',
    });
  } else {
    const missingCorrect = dangerItems.filter(
      (it) => typeof it === 'object' && it !== null && !String((it as { correct?: string }).correct ?? '').trim(),
    );
    if (missingCorrect.length > 0) {
      issues.push({
        code: 'danger_zone_correct',
        message: 'Todo item de danger_zone deve ter correct',
        path: 'reverse_study_slides.danger_zone.items',
      });
    }
  }

  const fullText = slideText(slides);
  if (!hasQuestionSpecificity(fullText, q)) {
    issues.push({
      code: 'specificity',
      message: 'Slides devem citar elemento desta questão (letra, romano I–IV ou termo do enunciado)',
    });
  }

  // Especificidade SEMÂNTICA: ≥N termos de conteúdo da questão devem aparecer nos
  // slides — não basta ecoar 1 palavra. Pool = enunciado + alternativa correta
  // (em questões de enunciado curto, o vocabulário discriminante está na resposta).
  const instruction = q.question_data?.instruction ?? '';
  const correctText = q.question_data?.options?.find((o) => o.is_correct)?.text ?? '';
  const terms = [...new Set([...extractInstructionTerms(instruction), ...extractInstructionTerms(correctText)])];
  if (terms.length > 0) {
    const slidesPlain = normalizeText(collectSlideStrings(slides));
    const present = terms.filter((t) => slidesPlain.includes(t)).length;
    const required = Math.min(3, terms.length);
    if (present < required) {
      issues.push({
        code: 'specificity_semantic',
        message: `Slides citam ${present}/${terms.length} termos da questão (mínimo ${required}). Engaje o vocabulário específico desta questão, não genérico.`,
      });
    }
  }

  const correctId = correctOptionId(q);
  const wrongIds = optionIds(q).filter((id) => id !== correctId);
  if (family === 'vf' || family === 'conceito' || family === 'legis') {
    if (wrongIds.length >= 2) {
      const covered = wrongIds.filter((id) => new RegExp(`\\b${id}\\b`, 'i').test(fullText)).length;
      if (covered === 0) {
        issues.push({
          code: 'danger_distractors',
          message: 'logic_flow ou danger_zone devem citar ao menos um distrator (letra errada)',
        });
      } else if (family === 'conceito' || family === 'legis') {
        // Cobertura por letra só vale onde cada distrator é independente (conceito/legis).
        // Em vf as letras são combinações de I–IV (ensinadas por afirmativa, não por letra).
        const minCovered = Math.ceil(wrongIds.length / 2);
        if (covered < minCovered) {
          issues.push({
            code: 'danger_distractors_coverage',
            message: `Apenas ${covered}/${wrongIds.length} distratores (letras erradas) são ensinados — cubra ao menos ${minCovered}.`,
          });
        }
      }
    }
  }

  if (family === 'vf') {
    const hasRoman =
      /julgar\s+i\b|afirmativa\s+i\b|\bi\s*[-–:]/.test(fullText) ||
      /\bii\b|\biii\b|\biv\b/.test(fullText);
    if (!hasRoman) {
      issues.push({
        code: 'vf_roman',
        message: 'Família vf: slides devem referenciar afirmativas I–IV',
      });
    }
  }

  return issues;
}

/**
 * Lint pedagógico v2 (warn no readiness): redundância entre camadas e gabarito no golden_rule.
 * Separado de lintGoldenContent para não quebrar goldens legados até repair em massa.
 */
export function lintGoldenV2Pedagogy(slides: SlideLike[]): GoldenContentLintIssue[] {
  return [...lintSlideLayerRedundancy(slides), ...lintGoldenRuleGabaritoSpoiler(slides)];
}

/**
 * Lint completo para questões que declaram meta.content_standard = golden-v1.
 * Questões sem content_standard não são validadas (retrocompatível).
 */
export function lintGoldenContent(payload: unknown): GoldenContentLintIssue[] {
  const q = payload as QuestaoLike;
  const meta = q.meta as GoldenMetaExtensions | undefined;
  if (meta?.content_standard !== GOLDEN_CONTENT_STANDARD_VERSION) {
    return [];
  }

  const slides = slidesOf(q);
  return [
    ...lintGoldenMeta(meta),
    ...lintBannedPhrases(slides),
    ...lintSlidePackage(slides, q, meta.family),
    ...lintGabaritoConsistency(slides, q),
    ...lintLogicFlowRecycling(slides, q),
    ...lintClaimSourceBinding(slides, meta),
    ...lintVitalsGoldenContent(payload),
  ];
}

export function isGoldenContentCompliant(payload: unknown): boolean {
  return lintGoldenContent(payload).length === 0;
}
