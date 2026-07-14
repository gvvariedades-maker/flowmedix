/**
 * Enriquecimento guideline — História da Enfermagem.
 */
import type { ContentSource } from '@/lib/goldenContentStandard';
import { HISTORIA_ENFERMAGEM_COFEN } from '@/lib/guidelines/historiaEnfermagem';

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

export type EnrichHistoriaGuidelineMetaResult = {
  payload: Record<string, unknown>;
  changed: boolean;
  reasons: string[];
};

const HISTORIA_SNAPSHOT = HISTORIA_ENFERMAGEM_COFEN.snapshot;

export function needsHistoriaGuidelineMeta(payload: QuestaoLike): boolean {
  const sub = String(payload.meta?.subtopico ?? '').trim().toLowerCase();
  if (sub !== 'história da enfermagem' && sub !== 'historia da enfermagem') return false;
  return payload.meta?.content_standard === 'golden-v1';
}

function hasTierACovers(sources: ContentSource[]): boolean {
  return sources.some(
    (s) =>
      s.tier === 'A' &&
      Array.isArray(s.covers) &&
      s.covers.some((c) => typeof c === 'string' && c.trim().length > 0),
  );
}

export function enrichHistoriaGuidelineMeta(
  payload: Record<string, unknown>,
): EnrichHistoriaGuidelineMetaResult {
  if (!needsHistoriaGuidelineMeta(payload as QuestaoLike)) {
    return { payload, changed: false, reasons: [] };
  }

  const reasons: string[] = [];
  const rawMeta = payload.meta;
  const meta: Record<string, unknown> =
    rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta)
      ? { ...(rawMeta as Record<string, unknown>) }
      : {};

  const existingSources = Array.isArray(meta.sources) ? [...(meta.sources as ContentSource[])] : [];

  if (!hasTierACovers(existingSources)) {
    const cofenSource: ContentSource = {
      id: HISTORIA_ENFERMAGEM_COFEN.id,
      tier: 'A',
      issuer: HISTORIA_ENFERMAGEM_COFEN.issuer,
      title: HISTORIA_ENFERMAGEM_COFEN.title,
      year: HISTORIA_ENFERMAGEM_COFEN.year,
      url: HISTORIA_ENFERMAGEM_COFEN.url,
      covers: ['história da enfermagem', 'COFEN', 'ética profissional', 'marcos históricos'],
    };
    if (!existingSources.some((s) => s.id === cofenSource.id)) {
      existingSources.unshift(cofenSource);
      reasons.push(`added_${cofenSource.id}`);
    }
  }

  meta.sources = existingSources;

  const review =
    meta.content_review && typeof meta.content_review === 'object'
      ? { ...(meta.content_review as Record<string, unknown>) }
      : {};
  if (!review.guideline_snapshot || String(review.guideline_snapshot).length < 20) {
    review.guideline_snapshot = HISTORIA_SNAPSHOT;
    reasons.push('guideline_snapshot');
  }
  if (!review.reviewed_at) {
    review.reviewed_at = new Date().toISOString().slice(0, 10);
    reasons.push('reviewed_at');
  }
  meta.content_review = review;

  if (reasons.length === 0) {
    return { payload, changed: false, reasons: [] };
  }

  return {
    payload: { ...payload, meta },
    changed: true,
    reasons,
  };
}
