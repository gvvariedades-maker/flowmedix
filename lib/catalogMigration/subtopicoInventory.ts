import {
  CANONICAL_SUBTOPICOS,
  DCNT_MESCLADAS_LABEL,
  isCanonicalSubtopico,
} from '@/lib/catalogMigration/canonicalSubtopicos';
import { resolveCanonicalSubtopico } from '@/lib/catalogMigration/legacySubtopicoMap';

export type CatalogRowForInventory = {
  modulo_slug: string;
  titulo_aula: string | null;
  conteudo_json: unknown;
};

export type SubtopicoInventoryRow = {
  slug: string;
  titulo_aula: string | null;
  meta_subtopico: string | null;
  titulo_canonical: boolean;
  meta_canonical: boolean;
  titulo_resolves_to: string | null;
  mismatch: boolean;
  missing_titulo: boolean;
  missing_meta: boolean;
  in_catch_all_bucket: boolean;
};

export type LabelCount = {
  label: string;
  count: number;
  canonical: boolean;
  legacy_resolves_to?: string | null;
};

export type SubtopicoInventoryReport = {
  generated_at: string;
  total_scanned: number;
  filters: {
    subtopico_contains?: string;
    catch_all_only?: boolean;
    mismatches_only?: boolean;
  };
  summary: {
    unique_titulo_aula: number;
    unique_meta_subtopico: number;
    mismatch_count: number;
    missing_titulo_aula: number;
    missing_meta_subtopico: number;
    non_canonical_titulo_aula: number;
    non_canonical_meta_subtopico: number;
    catch_all_bucket_count: number;
    canonical_titulo_rows: number;
    canonical_meta_rows: number;
  };
  by_titulo_aula: LabelCount[];
  by_meta_subtopico: LabelCount[];
  non_canonical_titulo_aula: LabelCount[];
  non_canonical_meta_subtopico: LabelCount[];
  catch_all_buckets: LabelCount[];
  mismatches: Array<{
    slug: string;
    titulo_aula: string | null;
    meta_subtopico: string | null;
  }>;
  /** Amostra para revisão (mismatches + catch-all, até row_limit). */
  review_sample: SubtopicoInventoryRow[];
};

export const DEFAULT_CATCH_ALL_BUCKETS = [
  'Procedimentos Diversos',
  'Questões Mescladas e Outras Doenças Agudas',
  'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
  DCNT_MESCLADAS_LABEL,
  'Processo de Enfermagem',
  'Segurança do Paciente',
] as const;

function metaSubtopicoFromPayload(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const meta = (raw as Record<string, unknown>).meta;
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null;
  const s = (meta as Record<string, unknown>).subtopico;
  return typeof s === 'string' && s.trim() ? s.trim() : null;
}

function bumpLabel(map: Map<string, LabelCount>, label: string, canonical: boolean, legacyTo?: string | null): void {
  const key = label.trim() || '(vazio)';
  const hit = map.get(key);
  if (hit) {
    hit.count += 1;
    return;
  }
  map.set(key, {
    label: key,
    count: 1,
    canonical,
    ...(legacyTo ? { legacy_resolves_to: legacyTo } : {}),
  });
}

function toSortedCounts(map: Map<string, LabelCount>): LabelCount[] {
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function extractInventoryRow(
  row: CatalogRowForInventory,
  catchAllBuckets: readonly string[] = DEFAULT_CATCH_ALL_BUCKETS,
): SubtopicoInventoryRow {
  const titulo = row.titulo_aula?.trim() || null;
  const meta = metaSubtopicoFromPayload(row.conteudo_json);
  const tituloCanonical = titulo ? isCanonicalSubtopico(titulo) : false;
  const metaCanonical = meta ? isCanonicalSubtopico(meta) : false;
  const legacy = titulo ? resolveCanonicalSubtopico(titulo) : null;
  const catchAllSet = new Set(catchAllBuckets);
  const inCatchAll = Boolean(titulo && catchAllSet.has(titulo));

  const mismatch =
    Boolean(titulo && meta && titulo !== meta) &&
    !(legacy?.canonical === meta);

  return {
    slug: row.modulo_slug,
    titulo_aula: titulo,
    meta_subtopico: meta,
    titulo_canonical: tituloCanonical,
    meta_canonical: metaCanonical,
    titulo_resolves_to: legacy?.canonical ?? null,
    mismatch,
    missing_titulo: !titulo,
    missing_meta: !meta,
    in_catch_all_bucket: inCatchAll,
  };
}

export type BuildInventoryOptions = {
  catchAllBuckets?: readonly string[];
  subtopicoContains?: string;
  catchAllOnly?: boolean;
  mismatchesOnly?: boolean;
  reviewSampleLimit?: number;
};

export function buildSubtopicoInventoryReport(
  rows: CatalogRowForInventory[],
  options: BuildInventoryOptions = {},
): SubtopicoInventoryReport {
  const catchAllBuckets = options.catchAllBuckets ?? DEFAULT_CATCH_ALL_BUCKETS;
  const filter = options.subtopicoContains?.trim().toLowerCase();
  const reviewLimit = options.reviewSampleLimit ?? 200;

  const byTitulo = new Map<string, LabelCount>();
  const byMeta = new Map<string, LabelCount>();
  const mismatches: SubtopicoInventoryReport['mismatches'] = [];
  const inventoryRows: SubtopicoInventoryRow[] = [];

  let missingTitulo = 0;
  let missingMeta = 0;
  let mismatchCount = 0;
  let catchAllCount = 0;
  let canonicalTituloRows = 0;
  let canonicalMetaRows = 0;

  for (const row of rows) {
    const inv = extractInventoryRow(row, catchAllBuckets);

    if (filter) {
      const blob = `${inv.titulo_aula ?? ''} ${inv.meta_subtopico ?? ''} ${inv.slug}`.toLowerCase();
      if (!blob.includes(filter)) continue;
    }
    if (options.catchAllOnly && !inv.in_catch_all_bucket) continue;
    if (options.mismatchesOnly && !inv.mismatch) continue;

    inventoryRows.push(inv);

    if (inv.missing_titulo) missingTitulo += 1;
    if (inv.missing_meta) missingMeta += 1;
    if (inv.mismatch) {
      mismatchCount += 1;
      mismatches.push({
        slug: inv.slug,
        titulo_aula: inv.titulo_aula,
        meta_subtopico: inv.meta_subtopico,
      });
    }
    if (inv.in_catch_all_bucket) catchAllCount += 1;
    if (inv.titulo_canonical) canonicalTituloRows += 1;
    if (inv.meta_canonical) canonicalMetaRows += 1;

    bumpLabel(
      byTitulo,
      inv.titulo_aula ?? '(vazio)',
      inv.titulo_canonical,
      inv.titulo_resolves_to,
    );
    bumpLabel(byMeta, inv.meta_subtopico ?? '(vazio)', inv.meta_canonical);
  }

  const nonCanonicalTitulo = toSortedCounts(byTitulo).filter((x) => !x.canonical && x.label !== '(vazio)');
  const nonCanonicalMeta = toSortedCounts(byMeta).filter((x) => !x.canonical && x.label !== '(vazio)');

  const catchAllSet = new Set(catchAllBuckets);
  const catchAllBucketsReport = toSortedCounts(byTitulo).filter((x) => catchAllSet.has(x.label));

  const reviewCandidates = inventoryRows.filter((r) => r.mismatch || r.in_catch_all_bucket);
  const review_sample = reviewCandidates.slice(0, reviewLimit);

  return {
    generated_at: new Date().toISOString(),
    total_scanned: inventoryRows.length,
    filters: {
      ...(filter ? { subtopico_contains: filter } : {}),
      ...(options.catchAllOnly ? { catch_all_only: true } : {}),
      ...(options.mismatchesOnly ? { mismatches_only: true } : {}),
    },
    summary: {
      unique_titulo_aula: byTitulo.size,
      unique_meta_subtopico: byMeta.size,
      mismatch_count: mismatchCount,
      missing_titulo_aula: missingTitulo,
      missing_meta_subtopico: missingMeta,
      non_canonical_titulo_aula: nonCanonicalTitulo.length,
      non_canonical_meta_subtopico: nonCanonicalMeta.length,
      catch_all_bucket_count: catchAllCount,
      canonical_titulo_rows: canonicalTituloRows,
      canonical_meta_rows: canonicalMetaRows,
    },
    by_titulo_aula: toSortedCounts(byTitulo),
    by_meta_subtopico: toSortedCounts(byMeta),
    non_canonical_titulo_aula: nonCanonicalTitulo,
    non_canonical_meta_subtopico: nonCanonicalMeta,
    catch_all_buckets: catchAllBucketsReport,
    mismatches,
    review_sample,
  };
}

export function printSubtopicoInventorySummary(report: SubtopicoInventoryReport): void {
  const s = report.summary;
  console.log('[audit:subtopico-inventory] total_scanned=', report.total_scanned);
  console.log('[audit:subtopico-inventory] mismatch=', s.mismatch_count);
  console.log('[audit:subtopico-inventory] catch_all_bucket_rows=', s.catch_all_bucket_count);
  console.log('[audit:subtopico-inventory] non_canonical titulo_aula labels=', s.non_canonical_titulo_aula);
  console.log('[audit:subtopico-inventory] non_canonical meta.subtopico labels=', s.non_canonical_meta_subtopico);
  console.log('[audit:subtopico-inventory] missing titulo_aula=', s.missing_titulo_aula);
  console.log('[audit:subtopico-inventory] missing meta.subtopico=', s.missing_meta_subtopico);
  console.log('[audit:subtopico-inventory] top titulo_aula:');
  for (const row of report.by_titulo_aula.slice(0, 12)) {
    console.log(`  ${row.count}\t${row.label}${row.canonical ? '' : ' (não canônico)'}`);
  }
  if (report.catch_all_buckets.length > 0) {
    console.log('[audit:subtopico-inventory] catch-all buckets:');
    for (const row of report.catch_all_buckets) {
      console.log(`  ${row.count}\t${row.label}`);
    }
  }
}

export { CANONICAL_SUBTOPICOS, DCNT_MESCLADAS_LABEL };
