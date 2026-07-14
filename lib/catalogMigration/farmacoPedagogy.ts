/**
 * Enriquecimento guideline — Farmacodinâmica e Farmacocinética.
 */
import type { ContentSource } from '@/lib/goldenContentStandard';
import { FARMACO_ADME_BR } from '@/lib/guidelines/farmacodinamica';

type QuestaoLike = {
  meta?: {
    subtopico?: string;
    content_standard?: string;
    sources?: ContentSource[];
    content_review?: Record<string, unknown>;
  };
  reverse_study_slides?: unknown[];
  study_slides?: unknown[];
};

export type EnrichFarmacoGuidelineMetaResult = {
  payload: Record<string, unknown>;
  changed: boolean;
  reasons: string[];
};

const FARMACO_SNAPSHOT = FARMACO_ADME_BR.snapshot;

function collectCorpus(payload: QuestaoLike): string {
  const parts: string[] = [];
  const inst = (payload as { question_data?: { instruction?: string } }).question_data?.instruction;
  if (inst) parts.push(inst);
  const slides = payload.reverse_study_slides ?? payload.study_slides ?? [];
  for (const s of slides) {
    if (!s || typeof s !== 'object') continue;
    const slide = s as Record<string, unknown>;
    if (typeof slide.content === 'string') parts.push(slide.content);
    if (Array.isArray(slide.steps)) parts.push(slide.steps.join(' '));
    if (Array.isArray(slide.items)) {
      for (const it of slide.items) {
        if (it && typeof it === 'object') {
          const item = it as { label?: string; detail?: string; correct?: string; value?: string };
          parts.push([item.label, item.detail, item.correct, item.value].filter(Boolean).join(' '));
        }
      }
    }
    if (Array.isArray(slide.rows)) {
      for (const row of slide.rows) {
        if (row && typeof row === 'object') {
          const r = row as { label?: string; value?: string };
          parts.push([r.label, r.value].filter(Boolean).join(' '));
        }
      }
    }
  }
  return parts.join('\n');
}

export function needsFarmacoGuidelineMeta(payload: QuestaoLike): boolean {
  const sub = String(payload.meta?.subtopico ?? '');
  if (!/farmacodin[aâ]mica/i.test(sub)) return false;
  return payload.meta?.content_standard === 'golden-v1';
}

export function enrichFarmacoGuidelineMeta(
  payload: Record<string, unknown>,
): EnrichFarmacoGuidelineMetaResult {
  if (!needsFarmacoGuidelineMeta(payload as QuestaoLike)) {
    return { payload, changed: false, reasons: [] };
  }

  const reasons: string[] = [];
  const rawMeta = payload.meta;
  const meta: Record<string, unknown> =
    rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta)
      ? { ...(rawMeta as Record<string, unknown>) }
      : {};

  const existingSources = Array.isArray(meta.sources) ? [...(meta.sources as ContentSource[])] : [];
  const farmacoSource: ContentSource = {
    id: FARMACO_ADME_BR.id,
    tier: 'A',
    issuer: FARMACO_ADME_BR.issuer,
    title: FARMACO_ADME_BR.title,
    year: FARMACO_ADME_BR.year,
    covers: ['ADME', 'meia-vida', 'farmacodinâmica', 'metabólitos ativos'],
  };

  const idx = existingSources.findIndex((s) => s.id === farmacoSource.id);
  if (idx < 0) {
    existingSources.unshift(farmacoSource);
    reasons.push(`added_${farmacoSource.id}`);
  }

  meta.sources = existingSources;

  const review =
    meta.content_review && typeof meta.content_review === 'object'
      ? { ...(meta.content_review as Record<string, unknown>) }
      : {};
  if (!review.guideline_snapshot || String(review.guideline_snapshot).length < 20) {
    review.guideline_snapshot = FARMACO_SNAPSHOT;
    reasons.push('guideline_snapshot');
  }
  if (!review.reviewed_at) {
    review.reviewed_at = new Date().toISOString().slice(0, 10);
    reasons.push('reviewed_at');
  }
  meta.content_review = review;

  return {
    payload: { ...payload, meta },
    changed: reasons.length > 0,
    reasons,
  };
}
