#!/usr/bin/env tsx
/**
 * Cobertura handcraft Imunização — slugs únicos vs lotes g01+ e disco questions/.
 *
 * Uso:
 *   npm run audit:imunizacao-coverage
 *
 * Gera: artifacts/imunizacao-handcraft-coverage-audit.json
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = process.cwd();
const MIG = resolve(ROOT, 'data/catalog-migration');
const META_PATH = resolve(MIG, 'imunizacao-completo/handcraft-meta.json');
const MANIFEST_PATH = resolve(MIG, 'imunizacao-completo/manifest.json');
const ARTIFACTS = resolve(ROOT, 'artifacts');
const OUT = resolve(ARTIFACTS, 'imunizacao-handcraft-coverage-audit.json');

type LoteStatus = 'applied' | 'handcraft_ready' | 'exported' | 'superseded' | 'unknown';

type LoteMetaEntry = {
  slug_count?: number;
  status?: LoteStatus;
  superseded_by?: string;
  readiness?: string;
};

type HandcraftMeta = {
  handcraft_applied?: number;
  handcraft_ready_lotes?: Record<string, LoteMetaEntry>;
};

type AppliedArtifact = {
  lote?: string;
  applied_slugs?: string[];
};

type SlugAssignment = {
  slug: string;
  lotes: string[];
  lote_statuses: Record<string, LoteStatus>;
  canonical_lote: string | null;
  canonical_status: LoteStatus | 'not_planned';
  has_disk_json: boolean;
  disk_lotes: string[];
};

const STATUS_RANK: Record<LoteStatus | 'not_planned', number> = {
  applied: 5,
  handcraft_ready: 4,
  exported: 3,
  superseded: 2,
  unknown: 1,
  not_planned: 0,
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function listImunizacaoLotes(): string[] {
  return readdirSync(MIG)
    .filter((d) => /^imunizacao-g\d+$/.test(d))
    .sort((a, b) => {
      const na = Number(a.replace('imunizacao-g', ''));
      const nb = Number(b.replace('imunizacao-g', ''));
      return na - nb;
    });
}

function loadAppliedSlugs(): {
  all: Set<string>;
  goldenG: Set<string>;
  repairs: Set<string>;
  legacy: Set<string>;
  byArtifact: Record<string, string[]>;
} {
  const all = new Set<string>();
  const goldenG = new Set<string>();
  const repairs = new Set<string>();
  const legacy = new Set<string>();
  const byArtifact: Record<string, string[]> = {};
  if (!existsSync(ARTIFACTS)) return { all, goldenG, repairs, legacy, byArtifact };

  const goldenPattern = /^catalog-migration-imunizacao-g\d+-applied\.json$/;
  const repairPattern =
    /repair-applied\.json$|decorp-triplice|admtec-adolescente|ameosc-cadeia-frio|avancasp-rede-frio/;

  for (const file of readdirSync(ARTIFACTS)) {
    if (!file.startsWith('catalog-migration-imunizacao-') || !file.endsWith('-applied.json')) {
      continue;
    }
    const data = readJson<AppliedArtifact>(join(ARTIFACTS, file));
    const list = data.applied_slugs ?? [];
    if (list.length === 0) continue;
    byArtifact[file] = list;
    for (const s of list) {
      all.add(s);
      if (goldenPattern.test(file)) goldenG.add(s);
      else if (repairPattern.test(file)) repairs.add(s);
      else legacy.add(s);
    }
  }
  return { all, goldenG, repairs, legacy, byArtifact };
}

function countQuestions(lote: string): number {
  const dir = join(MIG, lote, 'questions');
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => f.endsWith('.json')).length;
}

function findDiskLotes(slug: string, lotes: string[]): string[] {
  const hits: string[] = [];
  for (const lote of lotes) {
    const fp = join(MIG, lote, 'questions', `${slug}.json`);
    if (existsSync(fp)) hits.push(lote);
  }
  return hits;
}

function pickCanonical(
  assignments: Record<string, LoteStatus>,
  meta: HandcraftMeta,
): { lote: string | null; status: LoteStatus | 'not_planned' } {
  const entries = Object.entries(assignments);
  if (entries.length === 0) return { lote: null, status: 'not_planned' };

  const ranked = entries
    .map(([lote, status]) => {
      let effective = status;
      if (status === 'superseded') {
        const sup = meta.handcraft_ready_lotes?.[lote]?.superseded_by;
        if (sup && meta.handcraft_ready_lotes?.[sup]) {
          effective = meta.handcraft_ready_lotes[sup].status ?? 'superseded';
        }
      }
      return { lote, status, effective, rank: STATUS_RANK[effective] ?? 0 };
    })
    .sort((a, b) => b.rank - a.rank || a.lote.localeCompare(b.lote));

  const best = ranked[0];
  return { lote: best.lote, status: best.effective };
}

function main() {
  const meta = readJson<HandcraftMeta>(META_PATH);
  const manifest = readJson<{ slugs: string[] }>(MANIFEST_PATH);
  const allSlugs = [...(manifest.slugs ?? [])].sort();
  const lotes = listImunizacaoLotes();
  const { all: appliedSlugs, goldenG, repairs, legacy, byArtifact } = loadAppliedSlugs();
  const goldenApplied = new Set([...goldenG, ...repairs]);

  const loteManifestSlugs: Record<string, string[]> = {};
  const loteSummary: Array<{
    lote: string;
    status: LoteStatus;
    slug_count: number;
    questions_on_disk: number;
    readiness: string | null;
    superseded_by: string | null;
  }> = [];

  for (const lote of lotes) {
    const mf = join(MIG, lote, 'manifest.json');
    if (!existsSync(mf)) continue;
    const sl = readJson<{ slugs?: string[] }>(mf).slugs ?? [];
    loteManifestSlugs[lote] = sl;
    const entry = meta.handcraft_ready_lotes?.[lote];
    loteSummary.push({
      lote,
      status: entry?.status ?? 'unknown',
      slug_count: sl.length,
      questions_on_disk: countQuestions(lote),
      readiness: entry?.readiness ?? null,
      superseded_by: entry?.superseded_by ?? null,
    });
  }

  const slugToLotes = new Map<string, Record<string, LoteStatus>>();
  for (const [lote, slugs] of Object.entries(loteManifestSlugs)) {
    const status = meta.handcraft_ready_lotes?.[lote]?.status ?? 'unknown';
    for (const slug of slugs) {
      const cur = slugToLotes.get(slug) ?? {};
      cur[lote] = status;
      slugToLotes.set(slug, cur);
    }
  }

  const assignments: SlugAssignment[] = [];
  const notInAnyLote: string[] = [];
  const exportedPending: Array<{ slug: string; lote: string; has_disk: boolean }> = [];
  const metaReadyNoDisk: Array<{ slug: string; lote: string }> = [];
  const readyWithDisk: Array<{ slug: string; lote: string }> = [];
  const diskButExportedMeta: Array<{ slug: string; lote: string }> = [];
  const appliedNotInMeta: string[] = [];
  const duplicateAssignments: Array<{ slug: string; lotes: string[] }> = [];

  for (const slug of allSlugs) {
    const loteMap = slugToLotes.get(slug) ?? {};
    const lotesForSlug = Object.keys(loteMap);
    const diskLotes = findDiskLotes(slug, lotes);
    const { lote: canonicalLote, status: canonicalStatus } = pickCanonical(loteMap, meta);
    const hasDisk = diskLotes.length > 0;

    if (lotesForSlug.length === 0) notInAnyLote.push(slug);
    if (lotesForSlug.length > 1) duplicateAssignments.push({ slug, lotes: lotesForSlug.sort() });

    if (canonicalStatus === 'exported' && canonicalLote) {
      exportedPending.push({ slug, lote: canonicalLote, has_disk: hasDisk });
      if (hasDisk) diskButExportedMeta.push({ slug, lote: canonicalLote });
    }
    if (canonicalStatus === 'handcraft_ready' && canonicalLote) {
      if (hasDisk) readyWithDisk.push({ slug, lote: canonicalLote });
      else metaReadyNoDisk.push({ slug, lote: canonicalLote });
    }

    assignments.push({
      slug,
      lotes: lotesForSlug,
      lote_statuses: loteMap,
      canonical_lote: canonicalLote,
      canonical_status: canonicalStatus,
      has_disk_json: hasDisk,
      disk_lotes: diskLotes,
    });
  }

  for (const s of appliedSlugs) {
    if (!allSlugs.includes(s)) appliedNotInMeta.push(s);
  }

  const inAnyLote = allSlugs.length - notInAnyLote.length;

  const uniquePlannedNonSuperseded = new Set<string>();
  for (const a of assignments) {
    if (a.canonical_status !== 'not_planned' && a.canonical_status !== 'superseded') {
      uniquePlannedNonSuperseded.add(a.slug);
    }
    if (a.canonical_status === 'superseded' && a.canonical_lote) {
      const sup = meta.handcraft_ready_lotes?.[a.canonical_lote]?.superseded_by;
      if (sup) uniquePlannedNonSuperseded.add(a.slug);
    }
  }

  const appliedInCatalog = allSlugs.filter((s) => appliedSlugs.has(s));
  const goldenAppliedInCatalog = allSlugs.filter((s) => goldenApplied.has(s));
  const appliedCount = appliedInCatalog.length;
  const uniqueDiskInCatalog = assignments.filter((a) => a.has_disk_json).length;
  const exportedNoDisk = exportedPending.filter((e) => !e.has_disk);
  const exportedWithDisk = exportedPending.filter((e) => e.has_disk);

  const needsHandcraftUnique =
    notInAnyLote.length +
    exportedNoDisk.length +
    metaReadyNoDisk.length +
    allSlugs.filter(
      (s) =>
        !goldenApplied.has(s) &&
        !assignments.find((a) => a.slug === s)?.has_disk_json &&
        !assignments.find((a) => a.slug === s)?.lotes.length,
    ).length;

  const pendingGoldenApply = assignments.filter(
    (a) =>
      a.has_disk_json &&
      !goldenApplied.has(a.slug) &&
      (a.canonical_status === 'handcraft_ready' || a.canonical_status === 'exported'),
  ).length;

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: 'Imunização',
    manifest_total: allSlugs.length,
    registry_handcraft_applied: meta.handcraft_applied ?? null,
    applied_all_artifacts: appliedSlugs.size,
    applied_in_catalog_manifest: appliedCount,
    golden_handcraft_applied_in_catalog: goldenAppliedInCatalog.length,
    legacy_builder_applied_in_catalog: allSlugs.filter((s) => legacy.has(s)).length,
    summary: {
      in_any_lote_manifest: inAnyLote,
      not_in_any_lote: notInAnyLote.length,
      unique_planned_non_superseded: uniquePlannedNonSuperseded.size,
      unique_disk_json_in_catalog: uniqueDiskInCatalog,
      golden_applied_registry_track: goldenAppliedInCatalog.length,
      handcraft_ready_with_disk: readyWithDisk.length,
      handcraft_ready_meta_only_no_disk: metaReadyNoDisk.length,
      exported_canonical_total: exportedPending.length,
      exported_without_disk: exportedNoDisk.length,
      exported_with_disk_meta_stale: exportedWithDisk.length,
      pending_golden_apply_estimate: pendingGoldenApply,
      still_needs_handcraft_or_g76_planning: needsHandcraftUnique,
      slugs_with_duplicate_lote_manifests: duplicateAssignments.length,
      total_questions_json_on_disk: lotes.reduce((n, l) => n + countQuestions(l), 0),
    },
    lote_summary: loteSummary,
    lote_status_counts: loteSummary.reduce(
      (acc, l) => {
        acc[l.status] = (acc[l.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    exported_lotes_pending: loteSummary
      .filter((l) => l.status === 'exported')
      .map((l) => l.lote),
    handcraft_ready_lotes_meta_no_disk: loteSummary
      .filter((l) => l.status === 'handcraft_ready' && l.questions_on_disk === 0)
      .map((l) => ({ lote: l.lote, slug_count: l.slug_count })),
    applied_artifacts: Object.keys(byArtifact).sort(),
    slugs_not_in_any_lote: notInAnyLote,
    slugs_exported_pending: exportedPending.sort((a, b) => a.slug.localeCompare(b.slug)),
    slugs_exported_with_disk_meta_stale: diskButExportedMeta.sort((a, b) =>
      a.slug.localeCompare(b.slug),
    ),
    slugs_exported_without_disk: exportedNoDisk.sort((a, b) => a.slug.localeCompare(b.slug)),
    slugs_meta_ready_no_disk: metaReadyNoDisk.sort((a, b) => a.slug.localeCompare(b.slug)),
    slugs_ready_with_disk: readyWithDisk.sort((a, b) => a.slug.localeCompare(b.slug)),
    slugs_applied: appliedInCatalog.sort(),
    applied_not_in_manifest: appliedNotInMeta.sort(),
    duplicate_lote_assignments_sample: duplicateAssignments.slice(0, 30),
    duplicate_lote_assignments_total: duplicateAssignments.length,
  };

  mkdirSync(ARTIFACTS, { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('Imunização — auditoria de cobertura handcraft');
  console.log('─'.repeat(50));
  console.log(`Manifest total:                    ${report.manifest_total}`);
  console.log(`Golden aplicado (trilho g+repair): ${report.golden_handcraft_applied_in_catalog}`);
  console.log(`Registry handcraft_applied:        ${report.registry_handcraft_applied}`);
  console.log(`Legacy builder (no catálogo):      ${report.legacy_builder_applied_in_catalog}`);
  console.log(`JSON únicos no catálogo (disco):   ${report.summary.unique_disk_json_in_catalog}`);
  console.log(`Pendente apply golden (disco):     ${report.summary.pending_golden_apply_estimate}`);
  console.log(`Em algum lote g01–g75:             ${report.summary.in_any_lote_manifest}`);
  console.log(`Fora de qualquer lote (g76+):      ${report.summary.not_in_any_lote}`);
  console.log(`Exported canonical s/ disco:       ${report.summary.exported_without_disk}`);
  console.log(`Exported c/ disco (meta stale):    ${report.summary.exported_with_disk_meta_stale}`);
  console.log(`Ainda precisa handcraft/plano:     ${report.summary.still_needs_handcraft_or_g76_planning}`);
  console.log(`JSON questions/ total disco:       ${report.summary.total_questions_json_on_disk}`);
  console.log(`Lotes exported (meta):             ${report.exported_lotes_pending.join(', ')}`);
  console.log(`\nArtefato: ${OUT}`);
}

main();
