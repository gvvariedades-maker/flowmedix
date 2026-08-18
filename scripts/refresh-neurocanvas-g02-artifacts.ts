#!/usr/bin/env tsx
/**
 * Reaplica correções documentais G0.2 nos artifacts sem reconsultar Supabase.
 * Usa blocker-clusters.json + live-reconciliation.json existente.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { BlockerAnalysisReport } from '@/lib/neurocanvas/blockerAnalysis';
import {
  renderLiveReconciliationMarkdown,
  type LiveReconciliationReport,
} from '@/lib/neurocanvas/liveReconciliation';
import {
  buildPhaseReadinessReport,
  renderPhaseReadinessMarkdown,
} from '@/lib/neurocanvas/phaseReadiness';
import {
  buildResolverReconciliationReport,
  renderResolverReconciliationMarkdown,
} from '@/lib/neurocanvas/resolverReconciliation';

function buildAnswerKeyReview(
  blockerReport: BlockerAnalysisReport,
  editorialOfficialReviewRequired: number,
  liveDetected: number,
): LiveReconciliationReport['answer_key_review'] {
  const s3 = new Set(blockerReport.blockers.filter((b) => b.severity === 'S3').map((b) => b.slug));
  const ans = new Set(blockerReport.blockers.filter((b) => b.has_answer_divergence).map((b) => b.slug));
  const overlap = [...s3].filter((s) => ans.has(s)).length;
  const union = new Set([...s3, ...ans]);

  return {
    s3_slugs: s3.size,
    has_answer_divergence_slugs: ans.size,
    overlap_slugs: overlap,
    union_requires_official_source: union.size,
    editorial_official_review_required: editorialOfficialReviewRequired,
    live_detected_answer_divergences: liveDetected,
    reconciliation_note:
      editorialOfficialReviewRequired === union.size
        ? 'editorial_official_review_required alinha com união S3 ∪ has_answer_divergence (blockers locais).'
        : `Ajuste pendente: editorial_official_review_required (${editorialOfficialReviewRequired}) ≠ união (${union.size}).`,
  };
}

function patchLiveReport(
  live: LiveReconciliationReport,
  blockerReport: BlockerAnalysisReport,
): LiveReconciliationReport {
  const union = new Set([
    ...blockerReport.blockers.filter((b) => b.severity === 'S3').map((b) => b.slug),
    ...blockerReport.blockers.filter((b) => b.has_answer_divergence).map((b) => b.slug),
  ]);

  for (const row of live.slugs) {
    if (!union.has(row.slug)) continue;
    row.editorial_status = 'official_review_required';
    row.official_answer_review_required = true;
  }

  const dual = {
    operational_matched: live.slugs.filter((s) => s.operational_status === 'matched').length,
    operational_missing: live.slugs.filter((s) => s.operational_status === 'missing').length,
    operational_ambiguous: live.slugs.filter((s) => s.operational_status === 'ambiguous').length,
    operational_incomparable: live.slugs.filter((s) => s.operational_status === 'incomparable').length,
    editorial_documented: live.slugs.filter((s) => s.documented_editorial_path).length,
    editorial_unresolved: live.slugs.filter((s) => s.editorial_status === 'unresolved').length,
    editorial_official_review_required: live.slugs.filter(
      (s) => s.editorial_status === 'official_review_required',
    ).length,
  };

  const answerSlugs = live.slugs.filter((s) => s.answer_divergences.length > 0).map((s) => s.slug);

  return {
    ...live,
    generated_at: new Date().toISOString(),
    dual_canonical_summary: dual,
    answer_key_review: buildAnswerKeyReview(
      blockerReport,
      dual.editorial_official_review_required,
      answerSlugs.length,
    ),
  };
}

function main() {
  const dir = resolve('artifacts');
  const blockerReport = JSON.parse(
    readFileSync(resolve(dir, 'neurocanvas-blocker-clusters.json'), 'utf8'),
  ) as BlockerAnalysisReport;
  const live = JSON.parse(
    readFileSync(resolve(dir, 'neurocanvas-live-reconciliation.json'), 'utf8'),
  ) as LiveReconciliationReport;

  const patchedLive = patchLiveReport(live, blockerReport);
  writeFileSync(resolve(dir, 'neurocanvas-live-reconciliation.json'), JSON.stringify(patchedLive, null, 2), 'utf8');
  writeFileSync(
    resolve(dir, 'neurocanvas-live-reconciliation.md'),
    renderLiveReconciliationMarkdown(patchedLive),
    'utf8',
  );

  const resolverReconciliation = buildResolverReconciliationReport();
  writeFileSync(
    resolve(dir, 'neurocanvas-resolver-reconciliation.md'),
    renderResolverReconciliationMarkdown(resolverReconciliation),
    'utf8',
  );

  const phaseReport = buildPhaseReadinessReport(resolverReconciliation, patchedLive);
  writeFileSync(
    resolve(dir, 'neurocanvas-phase-readiness.md'),
    renderPhaseReadinessMarkdown(phaseReport),
    'utf8',
  );

  console.log('[refresh-g02] union', patchedLive.answer_key_review.union_requires_official_source);
  console.log('[refresh-g02] editorial_official_review_required', patchedLive.answer_key_review.editorial_official_review_required);
  console.log('[refresh-g02] generic live scope:', phaseReport.cohort.generic_operational_live_scope_note);
}

main();
