/**
 * Enriquecimento guideline — Segurança do Paciente.
 */
import type { ContentSource } from '@/lib/goldenContentStandard';
import { SEGURANCA_PACIENTE_PNSP } from '@/lib/guidelines/segurancaPaciente';

type QuestaoLike = {
  meta?: {
    subtopico?: string;
    content_standard?: string;
    sources?: ContentSource[];
    content_review?: Record<string, unknown>;
  };
};

export type EnrichSegurancaPacienteGuidelineMetaResult = {
  payload: Record<string, unknown>;
  changed: boolean;
  reasons: string[];
};

function hasTierACovers(sources: ContentSource[]): boolean {
  return sources.some(
    (s) =>
      s.tier === 'A' &&
      Array.isArray(s.covers) &&
      s.covers.some((c) => typeof c === 'string' && c.trim().length > 0),
  );
}

export function needsSegurancaPacienteGuidelineMeta(payload: QuestaoLike): boolean {
  const sub = String(payload.meta?.subtopico ?? '').trim().toLowerCase();
  if (sub !== 'segurança do paciente' && sub !== 'seguranca do paciente') return false;
  return payload.meta?.content_standard === 'golden-v1';
}

export function enrichSegurancaPacienteGuidelineMeta(
  payload: Record<string, unknown>,
): EnrichSegurancaPacienteGuidelineMetaResult {
  if (!needsSegurancaPacienteGuidelineMeta(payload as QuestaoLike)) {
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
    const pnspSource: ContentSource = {
      id: SEGURANCA_PACIENTE_PNSP.id,
      tier: 'A',
      issuer: SEGURANCA_PACIENTE_PNSP.issuer,
      title: SEGURANCA_PACIENTE_PNSP.title,
      year: SEGURANCA_PACIENTE_PNSP.year,
      url: SEGURANCA_PACIENTE_PNSP.url,
      covers: [
        'identificação segura',
        'prevenção de quedas',
        'eventos adversos',
        'PNSP',
        'metas OMS',
      ],
    };
    if (!existingSources.some((s) => s.id === pnspSource.id)) {
      existingSources.unshift(pnspSource);
      reasons.push(`added_${pnspSource.id}`);
    }
  }

  meta.sources = existingSources;

  const review =
    meta.content_review && typeof meta.content_review === 'object'
      ? { ...(meta.content_review as Record<string, unknown>) }
      : {};
  if (!review.guideline_snapshot || String(review.guideline_snapshot).length < 20) {
    review.guideline_snapshot = SEGURANCA_PACIENTE_PNSP.snapshot;
    reasons.push('guideline_snapshot');
  }
  if (!review.reviewed_at) {
    review.reviewed_at = new Date().toISOString().slice(0, 10);
    reasons.push('reviewed_at');
  }
  if (!review.exam_vs_current) {
    review.exam_vs_current = 'none';
    reasons.push('exam_vs_current');
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
