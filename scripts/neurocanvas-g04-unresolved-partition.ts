#!/usr/bin/env tsx
/**
 * Partição exaustiva e mutuamente exclusiva dos unresolved G0.4.
 * Não altera catálogo, baseline, Supabase nem production_ready.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildEditorialQueue } from '@/lib/neurocanvas/editorialQueue';
import { EDITORIAL_QUEUE_BASELINE_G04 } from '@/lib/neurocanvas/editorialQueueBaselineG04';

export type UnresolvedPartitionBucket =
  | 'official_lane'
  | 'manifest_conflict'
  | 'pedagogical_s2_slide'
  | 's2_non_slide_residual'
  | 'metadata_s1';

export type UnresolvedPartitionEntry = {
  case_id: string;
  slug: string;
  severity: 'S1' | 'S2' | 'S3';
  bucket: UnresolvedPartitionBucket;
  lanes: string[];
  banca_hint: string | null;
  cluster_id: string;
};

export function bancaHintFromSlug(slug: string): string {
  const match = slug.match(/^(.+?)-(?:enfermagem|geral)-/);
  return match?.[1] ?? slug.split('-')[0] ?? 'unknown';
}

export function classifyUnresolvedBucket(
  officialReview: boolean,
  manifestConflict: boolean,
  severity: 'S1' | 'S2' | 'S3',
  lanes: string[],
): UnresolvedPartitionBucket {
  if (officialReview) return 'official_lane';
  if (manifestConflict) return 'manifest_conflict';
  if (severity === 'S1') return 'metadata_s1';
  if (lanes.includes('pedagogical')) return 'pedagogical_s2_slide';
  return 's2_non_slide_residual';
}

export function buildUnresolvedPartition() {
  const report = buildEditorialQueue();
  const cases = report.review_pack.cases;

  const entries: UnresolvedPartitionEntry[] = cases.map((c) => ({
    case_id: c.case_id,
    slug: c.slug,
    severity: c.severity,
    bucket: classifyUnresolvedBucket(
      c.official_review_required,
      c.manifest_conflict,
      c.severity,
      c.lanes,
    ),
    lanes: [...c.lanes],
    banca_hint: bancaHintFromSlug(c.slug),
    cluster_id: c.cluster_id,
  }));

  const bucket_counts = {
    official_lane: 0,
    manifest_conflict: 0,
    pedagogical_s2_slide: 0,
    s2_non_slide_residual: 0,
    metadata_s1: 0,
  } satisfies Record<UnresolvedPartitionBucket, number>;

  for (const e of entries) bucket_counts[e.bucket]++;

  const official_by_banca: Record<string, string[]> = {};
  for (const e of entries.filter((x) => x.bucket === 'official_lane')) {
    const banca = e.banca_hint ?? 'unknown';
    if (!official_by_banca[banca]) official_by_banca[banca] = [];
    official_by_banca[banca].push(e.case_id);
  }
  for (const k of Object.keys(official_by_banca)) {
    official_by_banca[k].sort();
  }

  const sum = Object.values(bucket_counts).reduce((a, b) => a + b, 0);

  return {
    schema_version: 1,
    gate: 'G0.4',
    measured_at: EDITORIAL_QUEUE_BASELINE_G04.measured_at,
    baseline_id: EDITORIAL_QUEUE_BASELINE_G04.baseline_id,
    total_unresolved: entries.length,
    bucket_counts,
    bucket_sum: sum,
    partition_complete: sum === entries.length,
    lane_overlap_note:
      'Lanes de revisão (official/pedagogical/metadata) são sobrepostas; bucket_counts são mutuamente exclusivos.',
    reconciliation_lanes: report.reconciliation,
    official_by_banca,
    entries: entries.sort((a, b) => a.slug.localeCompare(b.slug)),
  };
}

function main() {
  const partition = buildUnresolvedPartition();
  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  const jsonPath = resolve(artifactsDir, 'neurocanvas-unresolved-partition.json');
  writeFileSync(jsonPath, `${JSON.stringify(partition, null, 2)}\n`, 'utf8');

  console.log('[neurocanvas:g04-unresolved-partition]', jsonPath);
  console.log('  total_unresolved=', partition.total_unresolved);
  console.log('  bucket_counts=', partition.bucket_counts);
  console.log('  partition_complete=', partition.partition_complete);
  console.log('  official_by_banca=', partition.official_by_banca);

  if (!partition.partition_complete) {
    process.exit(1);
  }
  if (partition.total_unresolved !== EDITORIAL_QUEUE_BASELINE_G04.unresolved) {
    console.error(
      `total_unresolved=${partition.total_unresolved} ≠ baseline ${EDITORIAL_QUEUE_BASELINE_G04.unresolved}`,
    );
    process.exit(1);
  }
}

const isCli =
  typeof process !== 'undefined' &&
  process.argv[1] != null &&
  process.argv[1].replace(/\\/g, '/').endsWith('neurocanvas-g04-unresolved-partition.ts');

if (isCli) {
  main();
}
