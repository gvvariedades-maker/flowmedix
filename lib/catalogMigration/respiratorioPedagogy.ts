/**
 * Enriquecimento guideline — Doenças Respiratórias Crônicas.
 */
import type { ContentSource } from '@/lib/goldenContentStandard';
import { RESPIRATORIO_CRONICO_MS } from '@/lib/guidelines/respiratorioCronico';

type QuestaoLike = {
  meta?: {
    subtopico?: string;
    content_standard?: string;
    sources?: ContentSource[];
    content_review?: Record<string, unknown>;
  };
};

export type EnrichRespiratorioGuidelineMetaResult = {
  payload: Record<string, unknown>;
  changed: boolean;
  reasons: string[];
};

const RESPIRATORIO_SNAPSHOT = RESPIRATORIO_CRONICO_MS.snapshot;

export function isRespiratorioCronicoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n.includes('respirat') &&
    (n.includes('crônic') || n.includes('cronic') || n.includes('asma') || n.includes('dpoc'))
  );
}

export function needsRespiratorioGuidelineMeta(payload: QuestaoLike): boolean {
  const sub = String(payload.meta?.subtopico ?? '').trim();
  if (!isRespiratorioCronicoSubtopico(sub)) return false;
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

export function enrichRespiratorioGuidelineMeta(
  payload: Record<string, unknown>,
): EnrichRespiratorioGuidelineMetaResult {
  if (!needsRespiratorioGuidelineMeta(payload as QuestaoLike)) {
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
    const msSource: ContentSource = {
      id: RESPIRATORIO_CRONICO_MS.id,
      tier: 'A',
      issuer: RESPIRATORIO_CRONICO_MS.issuer,
      title: RESPIRATORIO_CRONICO_MS.title,
      year: RESPIRATORIO_CRONICO_MS.year,
      url: RESPIRATORIO_CRONICO_MS.url,
      covers: ['asma', 'DPOC', 'SpO₂', 'oxigenoterapia', 'PCDT MS'],
    };
    if (!existingSources.some((s) => s.id === msSource.id)) {
      existingSources.unshift(msSource);
      reasons.push(`added_${msSource.id}`);
    }
  }

  meta.sources = existingSources;

  const review =
    meta.content_review && typeof meta.content_review === 'object'
      ? { ...(meta.content_review as Record<string, unknown>) }
      : {};
  if (!review.guideline_snapshot || String(review.guideline_snapshot).length < 20) {
    review.guideline_snapshot = RESPIRATORIO_SNAPSHOT;
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
