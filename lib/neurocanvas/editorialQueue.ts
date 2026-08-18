import { createHash } from 'node:crypto';

import {
  buildBlockerAnalysisReport,
  type BlockerAnalysisReport,
  type BlockerDetail,
  type BlockerSeverity,
} from '@/lib/neurocanvas/blockerAnalysis';
import {
  analyzeCatalogFile,
  readQuestionJsonFile,
  normalizeQuestionForComparison,
} from '@/lib/neurocanvas/canonicalCatalog';
import { DEDUPE_SCHEMA_VERSION } from '@/lib/neurocanvas/dedupeSchema';
import type { LiveReconciliationReport, OperationalStatus } from '@/lib/neurocanvas/liveReconciliation';
import { toPortableRepoPath, normalizePortableSeparators } from '@/lib/neurocanvas/portablePath';
import { EDITORIAL_QUEUE_BASELINE_G04 } from '@/lib/neurocanvas/editorialQueueBaselineG04';
import {
  buildSlugAuthorityIndex,
  getDocumentedPathsForSlug,
  type SlugAuthorityIndex,
} from '@/lib/neurocanvas/slugAuthority';

export const EDITORIAL_QUEUE_SCHEMA_VERSION = 1;
export { EDITORIAL_QUEUE_BASELINE_G04 } from '@/lib/neurocanvas/editorialQueueBaselineG04';

export type EditorialPermittedAction =
  | 'choose_existing_candidate'
  | 'official_source_review'
  | 'reject_all_candidates'
  | 'defer';

export type EditorialSeverity = 'S1' | 'S2' | 'S3';

export type ReviewLane = 'official' | 'manifest_conflict' | 'pedagogical' | 'metadata';

export type EditorialCase = {
  case_id: string;
  slug: string;
  cluster_id: string;
  severity: EditorialSeverity;
  candidate_paths: string[];
  candidate_hashes: string[];
  differing_fields: string[];
  live_status: OperationalStatus;
  operational_candidate_path?: string;
  official_review_required: boolean;
  manifest_conflict: boolean;
  editorial_status: 'pending';
  permitted_actions: EditorialPermittedAction[];
};

export type PedagogicalFieldDiff = {
  field: string;
  kind: 'items' | 'steps' | 'rows' | 'content' | 'other';
  summaries_by_path: Record<string, string>;
};

export type ReviewPackCandidate = {
  path: string;
  byte_sha256: string | null;
  semantic_sha256: string | null;
  matches_live_operational: boolean;
  documented: boolean;
};

export type ReviewPackCase = {
  case_id: string;
  slug: string;
  cluster_id: string;
  cluster_size: number;
  severity: EditorialSeverity;
  lanes: ReviewLane[];
  differing_fields: string[];
  candidates: ReviewPackCandidate[];
  pedagogical_diffs: PedagogicalFieldDiff[];
  live_status: OperationalStatus;
  operational_candidate_path?: string;
  official_review_required: boolean;
  manifest_conflict: boolean;
  official_source_alert: string | null;
  cluster_summary: string;
  editorial_status: 'pending';
  permitted_actions: EditorialPermittedAction[];
  /** Evidência operacional — não implica decisão editorial. */
  live_evidence_note: string;
};

export type LanePartition = {
  lane: ReviewLane;
  case_ids: string[];
  count: number;
  description: string;
};

export type EditorialQueueReport = {
  schema_version: number;
  dedupe_schema_version: number;
  gate: 'G0.3A';
  source: {
    blocker_count: number;
    cluster_count: number;
    live_artifact_consumed: boolean;
    live_access_available: boolean | null;
  };
  reconciliation: {
    total_cases: number;
    unique_slugs: number;
    cluster_count: number;
    all_pending: boolean;
    official_lane_count: number;
    manifest_conflict_lane_count: number;
    pedagogical_lane_count: number;
    metadata_lane_count: number;
  };
  lanes: LanePartition[];
  lane_overlap_note: string;
  cases: EditorialCase[];
  clusters: BlockerAnalysisReport['clusters'];
  review_pack: {
    cluster_summaries: { cluster_id: string; count: number; severity_max: BlockerSeverity; summary: string }[];
    cases: ReviewPackCase[];
    stratified_sample_case_ids: string[];
  };
  authority_note: string;
};

const PERMITTED_ACTIONS: EditorialPermittedAction[] = [
  'choose_existing_candidate',
  'official_source_review',
  'reject_all_candidates',
  'defer',
];

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** ID estável entre execuções — sem timestamp. */
export function stableCaseId(slug: string): string {
  return `nc-g03-${sha256Hex(slug).slice(0, 16)}`;
}

/** Mesma chave de cluster que `buildBlockerAnalysisReport`. */
export function stableClusterId(blocker: BlockerDetail): string {
  const ev = blocker.documented_paths_count === 0 ? 'none' : 'conflict';
  return `${blocker.path_signature}|${blocker.severity}|ev=${ev}`;
}

function toEditorialSeverity(severity: BlockerSeverity): EditorialSeverity {
  if (severity === 'S1') return 'S1';
  if (severity === 'S3' || severity === 'S4') return 'S3';
  return 'S2';
}

export function toPortableCatalogPath(path: string, repoRoot: string): string {
  const norm = normalizePortableSeparators(path);
  const catalogIdx = norm.indexOf('data/catalog-migration/');
  if (catalogIdx >= 0) {
    return norm.slice(catalogIdx);
  }
  try {
    return toPortableRepoPath(path, repoRoot);
  } catch {
    return norm;
  }
}

function isSlideField(field: string): boolean {
  return field.startsWith('reverse_study_slides');
}

function classifyPedagogicalKind(field: string): PedagogicalFieldDiff['kind'] {
  if (field.includes('.items')) return 'items';
  if (field.includes('.steps')) return 'steps';
  if (field.includes('.rows')) return 'rows';
  if (field.includes('.content')) return 'content';
  return 'other';
}

function summarizeFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '(ausente)';
  if (typeof value === 'string') return value.length > 120 ? `${value.slice(0, 117)}…` : value;
  if (Array.isArray(value)) return `[${value.length} itens]`;
  if (typeof value === 'object') return `{${Object.keys(value as object).length} chaves}`;
  return String(value);
}

function getAtPath(obj: unknown, fieldPath: string): unknown {
  const tokens = fieldPath.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur: unknown = obj;
  for (const token of tokens) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[token];
  }
  return cur;
}

export function buildPedagogicalDiffs(
  paths: string[],
  differingFields: string[],
  repoRoot: string,
): PedagogicalFieldDiff[] {
  const slideFields = differingFields.filter(isSlideField);
  const diffs: PedagogicalFieldDiff[] = [];

  for (const field of slideFields) {
    const summaries: Record<string, string> = {};
    for (const p of paths) {
      try {
        const raw = readQuestionJsonFile(p);
        const norm = normalizeQuestionForComparison(raw);
        const value = getAtPath(norm, field);
        summaries[toPortableCatalogPath(p, repoRoot)] = summarizeFieldValue(value);
      } catch {
        summaries[toPortableCatalogPath(p, repoRoot)] = '(erro ao ler)';
      }
    }
    diffs.push({
      field,
      kind: classifyPedagogicalKind(field),
      summaries_by_path: summaries,
    });
  }

  return diffs;
}

export function detectManifestConflict(
  blocker: BlockerDetail,
  index: SlugAuthorityIndex,
  semanticHashByPath: Map<string, string>,
): boolean {
  if (blocker.documented_paths_count <= 1) return false;

  const documented = getDocumentedPathsForSlug(blocker.slug, blocker.paths, index);
  if (documented.length > 1) {
    const EVIDENCE_RANK: Record<string, number> = {
      registry_completo_manifest: 0,
      handcraft_gnn_parent_manifest: 1,
      lote_meta_parent_only: 2,
    };

    const bestRank = Math.min(...documented.map((d) => EVIDENCE_RANK[d.evidence] ?? 99));
    const topTier = documented.filter((d) => (EVIDENCE_RANK[d.evidence] ?? 99) === bestRank);
    const hashes = new Set(
      topTier.map((d) => semanticHashByPath.get(d.path)).filter((h): h is string => Boolean(h)),
    );
    if (topTier.length > 1 && hashes.size > 1) return true;
  }

  return (
    blocker.documented_paths_count > 1 &&
    Boolean(blocker.resolution_reason?.includes('mesmo tier')) &&
    blocker.semantic_hashes.length > 1
  );
}

export function requiresOfficialReview(blocker: BlockerDetail): boolean {
  return blocker.severity === 'S3' || blocker.has_answer_divergence;
}

function assignLanes(blocker: BlockerDetail, manifestConflict: boolean): ReviewLane[] {
  const lanes: ReviewLane[] = [];
  if (requiresOfficialReview(blocker)) lanes.push('official');
  if (manifestConflict) lanes.push('manifest_conflict');
  if (blocker.severity === 'S2' && blocker.differing_fields.some(isSlideField)) {
    lanes.push('pedagogical');
  }
  if (blocker.severity === 'S1') lanes.push('metadata');
  return [...new Set(lanes)];
}

function liveEvidenceNote(liveStatus: OperationalStatus, operationalPath?: string): string {
  if (liveStatus === 'matched' && operationalPath) {
    return `Produção (live) coincide operacionalmente com ${operationalPath}. Isso é evidência operacional — não altera editorial_status nem escolhe candidato canônico.`;
  }
  if (liveStatus === 'ambiguous') {
    return 'Produção ambígua ou com múltiplos registros — não usar como critério de decisão editorial.';
  }
  if (liveStatus === 'missing') {
    return 'Slug ausente ou sem match em produção — revisar origem operacional separadamente do manifest.';
  }
  return 'Live indisponível ou incomparável — decisão editorial depende de manifest/registry e fonte oficial quando aplicável.';
}

function officialSourceAlert(blocker: BlockerDetail): string | null {
  if (!requiresOfficialReview(blocker)) return null;
  if (blocker.has_answer_divergence) {
    return 'Divergência de gabarito entre candidatos — exige fonte oficial (prova/guideline). Nenhum candidato deve ser promovido automaticamente.';
  }
  if (blocker.severity === 'S3') {
    return 'Severidade S3 (enunciado/alternativas) — revisão com fonte oficial obrigatória antes de qualquer apply.';
  }
  return 'Revisão oficial necessária.';
}

export function selectStratifiedEditorialSamples(
  cases: ReviewPackCase[],
  clusters: BlockerAnalysisReport['clusters'],
  limit = 20,
): string[] {
  const picked: string[] = [];
  const used = new Set<string>();

  const pick = (pred: (c: ReviewPackCase) => boolean) => {
    const hit = cases.find((c) => !used.has(c.case_id) && pred(c));
    if (hit) {
      used.add(hit.case_id);
      picked.push(hit.case_id);
    }
  };

  for (const sev of ['S1', 'S2', 'S3'] as EditorialSeverity[]) {
    pick((c) => c.severity === sev);
  }

  for (const status of ['matched', 'ambiguous', 'missing', 'incomparable'] as OperationalStatus[]) {
    pick((c) => c.live_status === status);
  }

  pick((c) => c.manifest_conflict);
  pick((c) => c.official_review_required && c.lanes.includes('official'));
  pick((c) => c.pedagogical_diffs.length > 0);

  const largeCluster = clusters.find((c) => c.count >= 10);
  if (largeCluster) {
    const slug = largeCluster.slugs_sample[0];
    const hit = cases.find((c) => c.slug === slug && !used.has(c.case_id));
    if (hit) {
      used.add(hit.case_id);
      picked.push(hit.case_id);
    }
  }

  const smallCluster = [...clusters].reverse().find((c) => c.count === 1);
  if (smallCluster) {
    const slug = smallCluster.slugs_sample[0];
    const hit = cases.find((c) => c.slug === slug && !used.has(c.case_id));
    if (hit) {
      used.add(hit.case_id);
      picked.push(hit.case_id);
    }
  }

  for (const c of cases) {
    if (picked.length >= limit) break;
    if (!used.has(c.case_id)) {
      used.add(c.case_id);
      picked.push(c.case_id);
    }
  }

  return picked.slice(0, limit);
}

export type BuildEditorialQueueOptions = {
  repoRoot?: string;
  blockerReport?: BlockerAnalysisReport;
  liveReport?: LiveReconciliationReport | null;
  includePedagogicalDiffs?: boolean;
};

export function buildEditorialQueue(options: BuildEditorialQueueOptions = {}): EditorialQueueReport {
  const repoRoot = options.repoRoot ?? process.cwd();
  const blockerReport = options.blockerReport ?? buildBlockerAnalysisReport();
  const liveReport = options.liveReport ?? null;
  const includePedDiffs = options.includePedagogicalDiffs ?? true;

  const authorityIndex = buildSlugAuthorityIndex();
  const liveBySlug = new Map((liveReport?.slugs ?? []).map((s) => [s.slug, s]));

  const cases: EditorialCase[] = [];
  const reviewCases: ReviewPackCase[] = [];
  const clusterSizeById = new Map(
    blockerReport.clusters.map((c) => [c.cluster_id, c.count]),
  );

  for (const blocker of blockerReport.blockers) {
    const clusterId = stableClusterId(blocker);
    const caseId = stableCaseId(blocker.slug);
    const semanticHashByPath = new Map<string, string>();

    const portableCandidates: string[] = [];
    const candidateHashes: string[] = [];
    const reviewCandidates: ReviewPackCandidate[] = [];

    for (const p of blocker.paths) {
      const entry = analyzeCatalogFile(p);
      const portable = toPortableCatalogPath(p, repoRoot);
      portableCandidates.push(portable);
      if (entry.semantic_sha256) {
        semanticHashByPath.set(p, entry.semantic_sha256);
        candidateHashes.push(entry.semantic_sha256);
      }
      const documented = getDocumentedPathsForSlug(blocker.slug, [p], authorityIndex);
      reviewCandidates.push({
        path: portable,
        byte_sha256: entry.byte_sha256,
        semantic_sha256: entry.semantic_sha256,
        matches_live_operational: false,
        documented: documented.length > 0,
      });
    }

    const manifestConflict = detectManifestConflict(blocker, authorityIndex, semanticHashByPath);
    const officialReview = requiresOfficialReview(blocker);
    const live = liveBySlug.get(blocker.slug);
    const liveStatus: OperationalStatus = live?.operational_status ?? 'incomparable';

    let operationalPath: string | undefined;
    if (live?.matched_candidate_paths?.length === 1) {
      operationalPath = toPortableCatalogPath(live.matched_candidate_paths[0]!, repoRoot);
      for (const rc of reviewCandidates) {
        rc.matches_live_operational = rc.path === operationalPath;
      }
    } else if (live?.matched_candidate_paths && live.matched_candidate_paths.length > 1) {
      const matchedPortable = new Set(live.matched_candidate_paths.map((p) => toPortableCatalogPath(p, repoRoot)));
      for (const rc of reviewCandidates) {
        rc.matches_live_operational = matchedPortable.has(rc.path);
      }
    }

    const editorialCase: EditorialCase = {
      case_id: caseId,
      slug: blocker.slug,
      cluster_id: clusterId,
      severity: toEditorialSeverity(blocker.severity),
      candidate_paths: [...new Set(portableCandidates)].sort(),
      candidate_hashes: [...new Set(candidateHashes)].sort(),
      differing_fields: blocker.differing_fields,
      live_status: liveStatus,
      operational_candidate_path: operationalPath,
      official_review_required: officialReview,
      manifest_conflict: manifestConflict,
      editorial_status: 'pending',
      permitted_actions: [...PERMITTED_ACTIONS],
    };

    cases.push(editorialCase);

    const lanes = assignLanes(blocker, manifestConflict);
    const pedagogicalDiffs =
      includePedDiffs && lanes.includes('pedagogical')
        ? buildPedagogicalDiffs(blocker.paths, blocker.differing_fields, repoRoot)
        : [];

    const cluster = blockerReport.clusters.find((c) => c.cluster_id === clusterId);
    reviewCases.push({
      case_id: caseId,
      slug: blocker.slug,
      cluster_id: clusterId,
      cluster_size: clusterSizeById.get(clusterId) ?? 1,
      severity: editorialCase.severity,
      lanes,
      differing_fields: blocker.differing_fields,
      candidates: reviewCandidates.sort((a, b) => a.path.localeCompare(b.path)),
      pedagogical_diffs: pedagogicalDiffs,
      live_status: liveStatus,
      operational_candidate_path: operationalPath,
      official_review_required: officialReview,
      manifest_conflict: manifestConflict,
      official_source_alert: officialSourceAlert(blocker),
      cluster_summary: cluster
        ? `${cluster.count} slug(s); ${cluster.evidence_pattern}; severidade máx ${cluster.severity_max}`
        : 'cluster desconhecido',
      editorial_status: 'pending',
      permitted_actions: [...PERMITTED_ACTIONS],
      live_evidence_note: liveEvidenceNote(liveStatus, operationalPath),
    });
  }

  cases.sort((a, b) => a.slug.localeCompare(b.slug));

  const officialIds = cases.filter((c) => c.official_review_required).map((c) => c.case_id);
  const manifestIds = cases.filter((c) => c.manifest_conflict).map((c) => c.case_id);
  const pedagogicalIds = reviewCases.filter((c) => c.lanes.includes('pedagogical')).map((c) => c.case_id);
  const metadataIds = reviewCases.filter((c) => c.lanes.includes('metadata')).map((c) => c.case_id);

  const stratified = selectStratifiedEditorialSamples(reviewCases, blockerReport.clusters, 20);

  return {
    schema_version: EDITORIAL_QUEUE_SCHEMA_VERSION,
    dedupe_schema_version: DEDUPE_SCHEMA_VERSION,
    gate: 'G0.3A',
    source: {
      blocker_count: blockerReport.blockers.length,
      cluster_count: blockerReport.clusters.length,
      live_artifact_consumed: liveReport !== null,
      live_access_available: liveReport?.live_access.available ?? null,
    },
    reconciliation: {
      total_cases: cases.length,
      unique_slugs: new Set(cases.map((c) => c.slug)).size,
      cluster_count: blockerReport.clusters.length,
      all_pending: cases.every((c) => c.editorial_status === 'pending'),
      official_lane_count: officialIds.length,
      manifest_conflict_lane_count: manifestIds.length,
      pedagogical_lane_count: pedagogicalIds.length,
      metadata_lane_count: metadataIds.length,
    },
    lanes: [
      {
        lane: 'official',
        case_ids: officialIds.sort(),
        count: officialIds.length,
        description:
          'S3 e/ou divergência de gabarito — exige fonte oficial; nenhuma recomendação automática de vencedor.',
      },
      {
        lane: 'manifest_conflict',
        case_ids: manifestIds.sort(),
        count: manifestIds.length,
        description:
          'Múltiplos manifests documentados no mesmo tier com conteúdo divergente — decisão humana obrigatória.',
      },
      {
        lane: 'pedagogical',
        case_ids: [...new Set(pedagogicalIds)].sort(),
        count: new Set(pedagogicalIds).size,
        description: 'S2 (NeuroSlides) — diff de items, steps, rows e content entre candidatos.',
      },
      {
        lane: 'metadata',
        case_ids: [...new Set(metadataIds)].sort(),
        count: new Set(metadataIds).size,
        description:
          'S1 — metadados pedagógicos; live match pode ser exibido como evidência operacional apenas.',
      },
    ],
    lane_overlap_note: `Lanes são trilhos de revisão sobrepostos: um caso pode aparecer em official + pedagogical + metadata. A fila completa (${EDITORIAL_QUEUE_BASELINE_G04.total_cases}, baseline ${EDITORIAL_QUEUE_BASELINE_G04.baseline_id}) é a união; lanes são filtros para lotes humanos.`,
    cases,
    clusters: blockerReport.clusters,
    review_pack: {
      cluster_summaries: blockerReport.clusters.map((c) => ({
        cluster_id: c.cluster_id,
        count: c.count,
        severity_max: c.severity_max,
        summary: `${c.evidence_pattern} · ${c.path_signature} · decisão: ${c.human_decision}`,
      })),
      cases: reviewCases.sort((a, b) => a.slug.localeCompare(b.slug)),
      stratified_sample_case_ids: stratified,
    },
    authority_note:
      'Fila editorial = evidência + workflow. Autoridade canônica permanece em manifest.slugs[] + handcraft-registry.json. Decisões humanas futuras materializam via apply-lote/registry — não via silent overwrite do Supabase live.',
  };
}

export function validateEditorialQueueReport(report: EditorialQueueReport): string[] {
  const errors: string[] = [];
  const baseline = EDITORIAL_QUEUE_BASELINE_G04;

  if (report.reconciliation.total_cases !== baseline.total_cases) {
    errors.push(
      `total_cases=${report.reconciliation.total_cases}, esperado ${baseline.total_cases} (baseline ${baseline.baseline_id})`,
    );
  }
  if (report.reconciliation.unique_slugs !== report.reconciliation.total_cases) {
    errors.push('slugs duplicados na fila');
  }
  if (report.reconciliation.cluster_count !== baseline.cluster_count) {
    errors.push(
      `cluster_count=${report.reconciliation.cluster_count}, esperado ${baseline.cluster_count} (baseline ${baseline.baseline_id})`,
    );
  }
  if (!report.reconciliation.all_pending) {
    errors.push('nem todos os casos estão pending');
  }
  if (report.reconciliation.official_lane_count !== baseline.official_lane_count) {
    errors.push(
      `official_lane_count=${report.reconciliation.official_lane_count}, esperado ${baseline.official_lane_count} (baseline ${baseline.baseline_id})`,
    );
  }
  if (report.reconciliation.manifest_conflict_lane_count !== baseline.manifest_conflict_lane_count) {
    errors.push(
      `manifest_conflict_lane_count=${report.reconciliation.manifest_conflict_lane_count}, esperado ${baseline.manifest_conflict_lane_count} (baseline ${baseline.baseline_id})`,
    );
  }

  for (const c of report.cases) {
    if (c.editorial_status !== 'pending') {
      errors.push(`${c.slug}: editorial_status não é pending`);
    }
    if (c.candidate_paths.some((p) => /^[A-Za-z]:[\\/]/.test(p))) {
      errors.push(`${c.slug}: path absoluto Windows detectado`);
    }
    if (c.candidate_paths.some((p) => p.startsWith('/home/') || p.startsWith('/Users/'))) {
      errors.push(`${c.slug}: path absoluto Unix detectado`);
    }
  }

  return errors;
}
