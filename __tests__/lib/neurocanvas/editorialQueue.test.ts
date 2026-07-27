import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { BlockerAnalysisReport } from '@/lib/neurocanvas/blockerAnalysis';
import {
  buildEditorialQueue,
  detectManifestConflict,
  requiresOfficialReview,
  stableCaseId,
  stableClusterId,
} from '@/lib/neurocanvas/editorialQueue';
import type { LiveReconciliationReport } from '@/lib/neurocanvas/liveReconciliation';
import { buildSlugAuthorityIndex } from '@/lib/neurocanvas/slugAuthority';

const FIXTURE_DIR = resolve(__dirname, 'fixtures');

function loadFixture<T>(name: string): T {
  return JSON.parse(readFileSync(resolve(FIXTURE_DIR, name), 'utf8')) as T;
}

describe('neurocanvas editorialQueue (hermético)', () => {
  const blockerReport = loadFixture<BlockerAnalysisReport>('editorial-queue-blocker-report.json');
  const liveReport = loadFixture<LiveReconciliationReport>('editorial-queue-live-report.json');
  const repoRoot = resolve(FIXTURE_DIR, '../..');

  it('IDs estáveis entre execuções', () => {
    const a = buildEditorialQueue({ repoRoot, blockerReport, liveReport, includePedagogicalDiffs: false });
    const b = buildEditorialQueue({ repoRoot, blockerReport, liveReport, includePedagogicalDiffs: false });
    expect(a.cases.map((c) => c.case_id)).toEqual(b.cases.map((c) => c.case_id));
    expect(stableCaseId('fixture-s1-meta')).toBe(a.cases.find((c) => c.slug === 'fixture-s1-meta')!.case_id);
  });

  it('partição exata sem slug duplicado', () => {
    const report = buildEditorialQueue({ repoRoot, blockerReport, liveReport, includePedagogicalDiffs: false });
    expect(report.cases).toHaveLength(4);
    expect(new Set(report.cases.map((c) => c.slug)).size).toBe(4);
    expect(report.clusters).toHaveLength(4);
  });

  it('paths portáveis sem drive letter', () => {
    const report = buildEditorialQueue({ repoRoot, blockerReport, liveReport, includePedagogicalDiffs: false });
    for (const c of report.cases) {
      for (const p of c.candidate_paths) {
        expect(p).toMatch(/^data\/catalog-migration\//);
        expect(p).not.toMatch(/^[A-Za-z]:/);
      }
    }
  });

  it('official_review_required preservado para S3/gabarito', () => {
    const s3 = blockerReport.blockers.find((b) => b.slug === 'fixture-s3-gabarito')!;
    expect(requiresOfficialReview(s3)).toBe(true);
    const report = buildEditorialQueue({ repoRoot, blockerReport, liveReport, includePedagogicalDiffs: false });
    const caseRow = report.cases.find((c) => c.slug === 'fixture-s3-gabarito')!;
    expect(caseRow.official_review_required).toBe(true);
    expect(caseRow.permitted_actions).toContain('official_source_review');
  });

  it('live nunca altera editorial_status — todos pending', () => {
    const report = buildEditorialQueue({ repoRoot, blockerReport, liveReport, includePedagogicalDiffs: false });
    expect(report.cases.every((c) => c.editorial_status === 'pending')).toBe(true);
    const matched = report.cases.find((c) => c.slug === 'fixture-s1-meta')!;
    expect(matched.live_status).toBe('matched');
    expect(matched.editorial_status).toBe('pending');
  });

  it('manifest conflict detectado no fixture', () => {
    const blocker = blockerReport.blockers.find((b) => b.slug === 'fixture-manifest-conflict')!;
    const index = buildSlugAuthorityIndex();
    const semantic = new Map([
      [blocker.paths[0]!, 'mca'],
      [blocker.paths[1]!, 'mcb'],
    ]);
    expect(detectManifestConflict(blocker, index, semantic)).toBe(true);
    const report = buildEditorialQueue({ repoRoot, blockerReport, liveReport, includePedagogicalDiffs: false });
    const caseRow = report.cases.find((c) => c.slug === 'fixture-manifest-conflict')!;
    expect(caseRow.manifest_conflict).toBe(true);
    const reviewRow = report.review_pack.cases.find((c) => c.slug === 'fixture-manifest-conflict')!;
    expect(reviewRow.lanes).toContain('manifest_conflict');
  });

  it('lanes cobrem severidades e live statuses no review pack', () => {
    const report = buildEditorialQueue({ repoRoot, blockerReport, liveReport, includePedagogicalDiffs: false });
    const sample = report.review_pack.cases;
    expect(sample.some((c) => c.severity === 'S1')).toBe(true);
    expect(sample.some((c) => c.severity === 'S2')).toBe(true);
    expect(sample.some((c) => c.severity === 'S3')).toBe(true);
    expect(sample.some((c) => c.live_status === 'matched')).toBe(true);
    expect(sample.some((c) => c.live_status === 'missing')).toBe(true);
    expect(sample.some((c) => c.live_status === 'ambiguous')).toBe(true);
  });

  it('cluster_id alinhado com blockerAnalysis', () => {
    const blocker = blockerReport.blockers[0]!;
    expect(stableClusterId(blocker)).toBe('fixture-lote-a↔fixture-lote-b|S1|ev=none');
  });

  it('não lê catálogo real quando blockerReport é injetado', () => {
    const report = buildEditorialQueue({ repoRoot, blockerReport, liveReport, includePedagogicalDiffs: false });
    expect(report.source.blocker_count).toBe(4);
    expect(report.reconciliation.total_cases).toBe(4);
  });
});
