/**
 * Injeta metadados golden-v1 a partir das guidelines oficiais (sem depender da IA).
 */
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { getGuidelineTablesForSubtopico } from '@/lib/guidelines';
import type { GuidelineTable } from '@/lib/guidelines/types';
import {
  GOLDEN_CONTENT_STANDARD_VERSION,
  type ContentReview,
  type ContentSource,
} from '@/lib/goldenContentStandard';

export type EnrichGoldenMetaOptions = {
  subtopico: string;
  family: FamilyId;
  /** Tabela mesclada usada no prompt (fallback de snapshot). */
  guideline?: GuidelineTable | null;
};

function guidelineTableToSource(table: GuidelineTable): ContentSource {
  const covers = table.entries
    .map((e) => e.label.trim())
    .filter(Boolean)
    .slice(0, 12);

  return {
    id: table.id,
    tier: 'A',
    issuer: table.issuer,
    title: table.title,
    year: table.year,
    url: table.url,
    ...(covers.length > 0 ? { covers } : {}),
  };
}

function hasSources(meta: Record<string, unknown>): boolean {
  return Array.isArray(meta.sources) && meta.sources.length > 0;
}

function hasContentReview(meta: Record<string, unknown>): boolean {
  const review = meta.content_review;
  if (!review || typeof review !== 'object') return false;
  const r = review as ContentReview;
  return Boolean(r.reviewed_at && r.guideline_snapshot);
}

function buildGuidelineSnapshot(subtopico: string, tables: GuidelineTable[]): string {
  if (tables.length > 0) {
    return tables.map((t) => t.snapshot).join(' · ');
  }
  return subtopico;
}

/** Preenche meta golden-v1 sem sobrescrever revisão humana existente. */
export function enrichQuestaoGoldenMeta(
  payload: Record<string, unknown>,
  options: EnrichGoldenMetaOptions,
): Record<string, unknown> {
  const rawMeta = payload.meta;
  const meta: Record<string, unknown> =
    rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta)
      ? { ...(rawMeta as Record<string, unknown>) }
      : {};

  const tables = getGuidelineTablesForSubtopico(options.subtopico);

  if (!meta.content_standard) {
    meta.content_standard = GOLDEN_CONTENT_STANDARD_VERSION;
  }
  if (!meta.family) {
    meta.family = options.family;
  }
  if (!hasSources(meta) && tables.length > 0) {
    meta.sources = tables.map(guidelineTableToSource);
  }
  if (!hasContentReview(meta)) {
    meta.content_review = {
      reviewed_at: new Date().toISOString().slice(0, 10),
      reviewer: 'avant-agent',
      guideline_snapshot: buildGuidelineSnapshot(options.subtopico, tables),
      exam_vs_current: 'none',
    } satisfies ContentReview;
  }

  return { ...payload, meta };
}
