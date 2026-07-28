import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  MANIFEST_CONFLICT_L1_AUTHORIZED_RELATIVE_PATHS,
} from '@/scripts/neurocanvas-g04-manifest-conflict-l1-decisions';
import {
  bancaHintFromSlug,
  classifyUnresolvedBucket,
  buildUnresolvedPartition,
} from '@/scripts/neurocanvas-g04-unresolved-partition';
import { EDITORIAL_QUEUE_BASELINE_G04 } from '@/lib/neurocanvas/editorialQueueBaselineG04';

const CATALOG_MARKER = join(
  process.cwd(),
  MANIFEST_CONFLICT_L1_AUTHORIZED_RELATIVE_PATHS[0] ?? '',
);
const hasFullCatalog = existsSync(CATALOG_MARKER);
const itCatalog = hasFullCatalog ? it : it.skip;

describe('neurocanvas g04 unresolved partition', () => {
  it('extrai banca de slug enfermagem ou geral', () => {
    expect(bancaHintFromSlug('vunesp-enfermagem-promocao-123')).toBe('vunesp');
    expect(bancaHintFromSlug('vunesp-geral-outras-doencas-123')).toBe('vunesp');
  });

  it('classifica buckets mutuamente exclusivos', () => {
    expect(classifyUnresolvedBucket(true, false, 'S3', ['official'])).toBe('official_lane');
    expect(classifyUnresolvedBucket(false, true, 'S2', ['manifest_conflict'])).toBe(
      'manifest_conflict',
    );
    expect(classifyUnresolvedBucket(false, false, 'S1', ['metadata'])).toBe('metadata_s1');
    expect(
      classifyUnresolvedBucket(false, false, 'S2', ['pedagogical']),
    ).toBe('pedagogical_s2_slide');
    expect(classifyUnresolvedBucket(false, false, 'S2', [])).toBe('s2_non_slide_residual');
  });

  itCatalog('partição exaustiva soma 339 e alinha baseline (catálogo local)', () => {
    const p = buildUnresolvedPartition();
    expect(p.partition_complete).toBe(true);
    expect(p.total_unresolved).toBe(339);
    expect(p.bucket_counts).toEqual({
      official_lane: 11,
      manifest_conflict: 0,
      pedagogical_s2_slide: 84,
      s2_non_slide_residual: 170,
      metadata_s1: 74,
    });
    expect(p.bucket_counts.official_lane).toBe(
      EDITORIAL_QUEUE_BASELINE_G04.official_lane_count,
    );
    expect(p.bucket_counts.manifest_conflict).toBe(
      EDITORIAL_QUEUE_BASELINE_G04.manifest_conflict_lane_count,
    );
  });
});
