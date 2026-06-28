/**
 * Auditoria L3: ramo pedagógico × molde atual × molde ideal.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  getPresentationDesign,
  resolvePedagogicalBranch,
  type PedagogicalBranchId,
} from '@/lib/slides/pedagogicalBranch';
import { detectMoldL3Mismatch } from '@/lib/slides/detectMoldL3Mismatch';
import type { MoldAffinitySlide } from '@/lib/slides/moldAffinity';
import {
  formatMoldPackage,
  resolveClusterIdeal,
  type ClusterIdealSpec,
  type L3MoldGapDecision,
} from '@/lib/slides/l3MoldGapCatalog';
import { CATALOG_MIGRATION_ROOT, loteQuestionsDir } from '@/lib/catalogMigration/paths';
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';

export type L3MoldGapClusterRow = ClusterIdealSpec & {
  subtopico: string;
  cluster_label: string;
  slug_count: number;
  pct: number;
  cluster_decision?: string;
  sample_slugs: string[];
  source: 'cluster_report' | 'handcraft_meta';
  /** Presente quando volume veio de handcraft-meta sem contagem por cluster. */
  volume_note?: string;
};

export type L3MoldGapSlugRow = {
  slug: string;
  lote: string;
  subtopico?: string;
  family?: FamilyId;
  inferred_branch?: PedagogicalBranchId;
  declared_branch?: string;
  mold_package: string;
  mold_mismatch_count: number;
  mold_issues: string[];
};

export type L3MoldGapSummary = {
  cluster_rows: number;
  slug_rows: number;
  by_decision: Record<L3MoldGapDecision, number>;
  inedito_packages_proposed: number;
  ramo_novo_count: number;
  slug_mismatch_total: number;
};

export type L3MoldGapAuditReport = {
  generated_at: string;
  summary: L3MoldGapSummary;
  /** Pacotes de 4 variantes inéditas candidatos (deduplicados por ideal_mold_package). */
  inedito_candidates: {
    subtopico: string;
    cluster_label: string;
    branch_id: string;
    slug_count: number;
    ideal_mold_package: string;
    rationale: string;
  }[];
  clusters: L3MoldGapClusterRow[];
  slugs: L3MoldGapSlugRow[];
};

type ClusterReportFile = {
  subtopico?: string;
  total?: number;
  cluster_decisions?: {
    cluster: string;
    count: number;
    pct?: number;
    decision?: string;
    sample_slugs?: string[];
  }[];
  pedagogical_clusters?: ClusterReportFile['cluster_decisions'];
};

type HandcraftMetaFile = {
  subtopico?: string;
  total_slugs?: number;
  clusters?: string[];
};

type RegistryPacote = {
  manifest?: string;
  handcraft_meta?: string;
  cluster_report?: string | null;
  total_slugs?: number;
  status?: string;
};

function readJson<T>(path: string): T | null {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return null;
  }
}

function moldPackageForBranch(
  subtopico: string | undefined,
  branch?: PedagogicalBranchId,
): string {
  if (!subtopico || !branch) return '—';
  return formatMoldPackage(getPresentationDesign(subtopico, branch));
}

function defaultSubtopicMoldPackage(subtopico: string): string {
  const design = getPresentationDesign(subtopico, undefined);
  return formatMoldPackage(design);
}

function clusterEntries(report: ClusterReportFile): ClusterReportFile['cluster_decisions'] {
  return report.cluster_decisions ?? report.pedagogical_clusters ?? [];
}

export function auditClusterReport(
  reportPath: string,
  subtopico: string,
  totalFallback?: number,
): L3MoldGapClusterRow[] {
  const report = readJson<ClusterReportFile>(reportPath);
  if (!report) return [];

  const total = report.total ?? totalFallback ?? 0;
  const entries = clusterEntries(report);
  const defaultMold = defaultSubtopicMoldPackage(subtopico);

  return entries.map((entry) => {
    const count = entry.count ?? 0;
    const pct = entry.pct ?? (total > 0 ? Math.round((count / total) * 1000) / 10 : 0);
    const ideal = resolveClusterIdeal(subtopico, entry.cluster, count, pct, defaultMold);
    return {
      subtopico,
      cluster_label: entry.cluster,
      slug_count: count,
      pct,
      cluster_decision: entry.decision,
      sample_slugs: entry.sample_slugs ?? [],
      source: 'cluster_report' as const,
      ...ideal,
    };
  });
}

export function auditHandcraftMetaClusters(
  metaPath: string,
  subtopico: string,
  totalSlugs: number,
): L3MoldGapClusterRow[] {
  const meta = readJson<HandcraftMetaFile>(metaPath);
  if (!meta?.clusters?.length) return [];

  const defaultMold = defaultSubtopicMoldPackage(subtopico);
  const perCluster = Math.max(1, Math.floor(totalSlugs / meta.clusters.length));

  return meta.clusters.map((label) => {
    const ideal = resolveClusterIdeal(subtopico, label, perCluster, (perCluster / totalSlugs) * 100, defaultMold);
    return {
      subtopico,
      cluster_label: label,
      slug_count: perCluster,
      pct: totalSlugs > 0 ? Math.round((perCluster / totalSlugs) * 1000) / 10 : 0,
      sample_slugs: [],
      source: 'handcraft_meta' as const,
      volume_note: 'volume estimado (clusters sem contagem no meta)',
      ...ideal,
    };
  });
}

type QuestaoPayload = {
  meta?: {
    subtopico?: string;
    family?: FamilyId;
    pedagogical_branch?: string;
  };
  question_data?: { instruction?: string };
  reverse_study_slides?: unknown;
  study_slides?: unknown;
  modulo_slug?: string;
};

function slidesOf(q: QuestaoPayload): MoldAffinitySlide[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? (s as MoldAffinitySlide[]) : [];
}

export function auditQuestaoPayload(slug: string, lote: string, payload: QuestaoPayload): L3MoldGapSlugRow {
  const subtopico = payload.meta?.subtopico;
  const instruction = String(payload.question_data?.instruction ?? '');
  const slides = slidesOf(payload);
  const familyId = payload.meta?.family;
  const declared = payload.meta?.pedagogical_branch?.trim();
  const inferred = resolvePedagogicalBranch(
    subtopico,
    instruction,
    slides,
    declared,
    familyId,
  );
  const branch = inferred;
  const moldPackage = moldPackageForBranch(subtopico, branch);
  const mismatches = detectMoldL3Mismatch(payload, { slug, familyId, pedagogicalBranch: branch });

  return {
    slug,
    lote,
    subtopico,
    family: familyId,
    inferred_branch: inferred,
    declared_branch: declared,
    mold_package: moldPackage,
    mold_mismatch_count: mismatches.length,
    mold_issues: mismatches.map((m) => m.code),
  };
}

export function scanLoteQuestions(lote: string): L3MoldGapSlugRow[] {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((file) => {
      const payload = readJson<QuestaoPayload>(resolve(dir, file))!;
      const slug = payload.modulo_slug ?? file.replace(/\.json$/, '');
      return auditQuestaoPayload(slug, lote, payload);
    });
}

function listCompletoLotes(): string[] {
  if (!existsSync(CATALOG_MIGRATION_ROOT)) return [];
  return readdirSync(CATALOG_MIGRATION_ROOT).filter((name) => name.endsWith('-completo'));
}

export type BuildL3MoldGapReportOptions = {
  registryPath?: string;
  extraLotes?: string[];
};

export function buildL3MoldGapReport(options: BuildL3MoldGapReportOptions = {}): L3MoldGapAuditReport {
  const root = process.cwd();
  const registryPath =
    options.registryPath ?? resolve(root, 'data/catalog-migration/handcraft-registry.json');
  const registry = readJson<{ pacotes?: Record<string, RegistryPacote> }>(registryPath);

  const clusters: L3MoldGapClusterRow[] = [];
  const slugs: L3MoldGapSlugRow[] = [];
  const seenCluster = new Set<string>();

  if (registry?.pacotes) {
    for (const [name, pacote] of Object.entries(registry.pacotes)) {
      if (pacote.status !== 'applied') continue;
      const subtopico = name;

      if (pacote.cluster_report) {
        const reportPath = resolve(root, pacote.cluster_report);
        for (const row of auditClusterReport(reportPath, subtopico, pacote.total_slugs)) {
          const key = `${row.subtopico}::${row.cluster_label}`;
          if (!seenCluster.has(key)) {
            seenCluster.add(key);
            clusters.push(row);
          }
        }
      }

      if (pacote.handcraft_meta && !pacote.cluster_report) {
        const metaPath = resolve(root, pacote.handcraft_meta);
        for (const row of auditHandcraftMetaClusters(
          metaPath,
          subtopico,
          pacote.total_slugs ?? 0,
        )) {
          const key = `${row.subtopico}::${row.cluster_label}`;
          if (!seenCluster.has(key)) {
            seenCluster.add(key);
            clusters.push(row);
          }
        }
      }
    }
  }

  const lotesToScan = new Set<string>([
    ...listCompletoLotes(),
    ...(options.extraLotes ?? []),
    'saude-adolescente-completo',
    'cme-completo',
    'saude-mental-completo',
    'perioperatoria-completo',
  ]);

  for (const lote of lotesToScan) {
    slugs.push(...scanLoteQuestions(lote));
  }

  const by_decision: Record<L3MoldGapDecision, number> = {
    ok_existente: 0,
    ok_generico: 0,
    ramo_novo: 0,
    molde_inedito: 0,
  };

  for (const row of clusters) {
    by_decision[row.decision] = (by_decision[row.decision] ?? 0) + 1;
  }

  const inedito_candidates = clusters
    .filter((r) => r.decision === 'molde_inedito')
    .map((r) => ({
      subtopico: r.subtopico,
      cluster_label: r.cluster_label,
      branch_id: r.branch_id,
      slug_count: r.slug_count,
      ideal_mold_package: r.ideal_mold_package,
      rationale: r.rationale,
    }));

  const uniqueIneditoPackages = new Set(inedito_candidates.map((c) => c.ideal_mold_package)).size;

  return {
    generated_at: new Date().toISOString(),
    summary: {
      cluster_rows: clusters.length,
      slug_rows: slugs.length,
      by_decision,
      inedito_packages_proposed: uniqueIneditoPackages,
      ramo_novo_count: by_decision.ramo_novo,
      slug_mismatch_total: slugs.reduce((n, s) => n + s.mold_mismatch_count, 0),
    },
    inedito_candidates,
    clusters,
    slugs,
  };
}

export function printL3MoldGapSummary(report: L3MoldGapAuditReport): void {
  const s = report.summary;
  console.log('[audit:l3-mold-gap] clusters=%d slugs=%d', s.cluster_rows, s.slug_rows);
  console.log(
    '[audit:l3-mold-gap] decisões: ok_existente=%d ok_generico=%d ramo_novo=%d molde_inedito=%d',
    s.by_decision.ok_existente,
    s.by_decision.ok_generico,
    s.by_decision.ramo_novo,
    s.by_decision.molde_inedito,
  );
  console.log(
    '[audit:l3-mold-gap] pacotes inéditos candidatos (únicos)=%d slug_mismatches=%d',
    s.inedito_packages_proposed,
    s.slug_mismatch_total,
  );

  if (report.inedito_candidates.length > 0) {
    console.log('\n--- Candidatos a molde inédito (pacote de 4) ---');
    for (const c of report.inedito_candidates) {
      console.log(
        `  • ${c.subtopico} / ${c.cluster_label} (${c.slug_count} slugs) → ${c.branch_id}`,
      );
      console.log(`    ${c.ideal_mold_package}`);
    }
  }
}
