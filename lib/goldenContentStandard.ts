/**
 * GOLDEN Content Standard v1 — gramática de slots, política de fontes e lint.
 * Metadados em meta.* são internos (não renderizados no player).
 * @see docs/GOLDEN_CONTENT_STANDARD.md
 */

import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';

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

  const correctId = correctOptionId(q);
  const wrongIds = optionIds(q).filter((id) => id !== correctId);
  if (family === 'vf' || family === 'conceito' || family === 'legis') {
    if (wrongIds.length > 0) {
      const mentionsWrong = wrongIds.some((id) => new RegExp(`\\b${id}\\b`, 'i').test(fullText));
      if (!mentionsWrong && wrongIds.length >= 2) {
        issues.push({
          code: 'danger_distractors',
          message: 'logic_flow ou danger_zone devem citar ao menos um distrator (letra errada)',
        });
      }
    }
  }

  if (family === 'vf') {
    const hasRoman =
      /julgar\s+I\b|afirmativa\s+I\b|\bI\s*[-–]/i.test(fullText) || /II|III|IV/.test(fullText);
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
  ];
}

export function isGoldenContentCompliant(payload: unknown): boolean {
  return lintGoldenContent(payload).length === 0;
}
