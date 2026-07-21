import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildSubtopicoInventoryReport,
  DEFAULT_CATCH_ALL_BUCKETS,
  extractInventoryRow,
  type CatalogRowForInventory,
  type SubtopicoInventoryReport,
} from '@/lib/catalogMigration/subtopicoInventory';
import {
  findPacoteBySubtopico,
  loadHandcraftRegistry,
  type CatchAllMode,
  type HandcraftRegistry,
  type PacoteTaxonomy,
  type TaxonomyStatus,
} from '@/lib/catalogMigration/handcraftRegistry';

export type { CatchAllMode, PacoteTaxonomy, TaxonomyStatus };
export type TaxonomyGate = 'pass' | 'warn' | 'block';

export type ManifestTaxonomySummary = {
  manifest_slugs: number;
  found_in_catalog: number;
  missing_slugs: string[];
  still_in_catch_all: number;
  mismatch_count: number;
  non_canonical_titulo: number;
  reclassified: boolean;
  destinations: Array<{ titulo_aula: string; count: number }>;
};

export type TaxonomyClosedArtifact = {
  subtopico: string;
  pacote_prefix: string;
  status: TaxonomyStatus;
  catch_all_mode?: CatchAllMode | null;
  closed_at: string;
  inventory_snapshot: string;
  mismatch_count: number;
  total_scanned: number;
  manifest_slugs?: number;
  reclassified?: boolean;
  signed_by: 'human' | 'agent' | 'audit:taxonomy-gate';
  notes?: string | null;
};

export type TaxonomyGateReport = {
  subtopico: string;
  pacote_prefix: string;
  gate: TaxonomyGate;
  is_catch_all_bucket: boolean;
  catch_all_mode: CatchAllMode | null;
  registry_taxonomy_status: TaxonomyStatus;
  inventory: {
    total_scanned: number;
    mismatch_count: number;
    non_canonical_titulo_aula: number;
    non_canonical_meta_subtopico: number;
    missing_titulo_aula: number;
    missing_meta_subtopico: number;
  };
  manifest: ManifestTaxonomySummary | null;
  reasons: string[];
  handcraft_allowed: boolean;
  promote_requires_infer: boolean;
  vitrine_groups_by_canonical_titulo: boolean;
  generated_at: string;
  artifact: string;
  closed_artifact: string | null;
  registry_closed_artifact: string | null;
};

export function subtopicoToArtifactSlug(subtopico: string): string {
  return subtopico
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function filterRowsForSubtopico(
  rows: CatalogRowForInventory[],
  subtopico: string,
): CatalogRowForInventory[] {
  const exact = subtopico.trim();
  return rows.filter((row) => {
    const inv = extractInventoryRow(row);
    return inv.titulo_aula === exact || inv.meta_subtopico === exact;
  });
}

export function buildScopedSubtopicoInventoryReport(
  rows: CatalogRowForInventory[],
  subtopico: string,
  catchAllBuckets: readonly string[] = DEFAULT_CATCH_ALL_BUCKETS,
): SubtopicoInventoryReport {
  return buildSubtopicoInventoryReport(filterRowsForSubtopico(rows, subtopico), {
    catchAllBuckets,
  });
}

export function isCatchAllBucket(
  subtopico: string,
  catchAllBuckets: readonly string[] = DEFAULT_CATCH_ALL_BUCKETS,
): boolean {
  return catchAllBuckets.includes(subtopico.trim());
}

export function loadManifestSlugsForPacote(
  pacotePrefix: string,
  primaryManifest?: string | null,
  cwd = process.cwd(),
): string[] {
  const slugs = new Set<string>();
  const root = resolve(cwd, 'data/catalog-migration');

  if (primaryManifest) {
    const path = resolve(cwd, primaryManifest);
    if (existsSync(path)) {
      const raw = JSON.parse(readFileSync(path, 'utf8')) as { slugs?: string[] };
      for (const slug of raw.slugs ?? []) {
        if (slug) slugs.add(slug);
      }
    }
  }

  if (existsSync(root)) {
    const lotePrefix = `${pacotePrefix}-g`;
    for (const name of readdirSync(root)) {
      if (!name.startsWith(lotePrefix) || name.includes('completo')) continue;
      const manifestPath = resolve(root, name, 'manifest.json');
      if (!existsSync(manifestPath)) continue;
      const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as { slugs?: string[] };
      for (const slug of raw.slugs ?? []) {
        if (slug) slugs.add(slug);
      }
    }
  }

  return [...slugs].sort();
}

export function buildManifestTaxonomySummary(
  manifestSlugs: string[],
  allRows: CatalogRowForInventory[],
  catchAllSubtopico: string,
  catchAllBuckets: readonly string[] = DEFAULT_CATCH_ALL_BUCKETS,
): ManifestTaxonomySummary {
  const rowBySlug = new Map(allRows.map((r) => [r.modulo_slug, r]));
  const missingSlugs: string[] = [];
  let stillInCatchAll = 0;
  let mismatchCount = 0;
  let nonCanonicalTitulo = 0;
  const destCounts = new Map<string, number>();

  for (const slug of manifestSlugs) {
    const catalogRow = rowBySlug.get(slug);
    if (!catalogRow) {
      missingSlugs.push(slug);
      continue;
    }

    const inv = extractInventoryRow(catalogRow, catchAllBuckets);
    if (inv.mismatch) mismatchCount += 1;
    if (!inv.titulo_canonical) nonCanonicalTitulo += 1;

    const titulo = inv.titulo_aula ?? '';
    const meta = inv.meta_subtopico ?? '';
    if (titulo === catchAllSubtopico || meta === catchAllSubtopico) {
      stillInCatchAll += 1;
    }

    if (titulo && titulo !== catchAllSubtopico) {
      destCounts.set(titulo, (destCounts.get(titulo) ?? 0) + 1);
    }
  }

  const reclassified =
    manifestSlugs.length > 0 &&
    missingSlugs.length === 0 &&
    mismatchCount === 0 &&
    nonCanonicalTitulo === 0 &&
    stillInCatchAll === 0;

  return {
    manifest_slugs: manifestSlugs.length,
    found_in_catalog: manifestSlugs.length - missingSlugs.length,
    missing_slugs: missingSlugs,
    still_in_catch_all: stillInCatchAll,
    mismatch_count: mismatchCount,
    non_canonical_titulo: nonCanonicalTitulo,
    reclassified,
    destinations: [...destCounts.entries()]
      .map(([titulo_aula, count]) => ({ titulo_aula, count }))
      .sort((a, b) => b.count - a.count || a.titulo_aula.localeCompare(b.titulo_aula)),
  };
}

export function readPacoteTaxonomy(
  registry: HandcraftRegistry,
  subtopico: string,
): PacoteTaxonomy | null {
  const hit = findPacoteBySubtopico(registry, subtopico);
  if (!hit) return null;
  return hit.pacote.taxonomy ?? null;
}

export function taxonomyGateArtifactPath(pacotePrefix: string): string {
  return `artifacts/taxonomy-gate-${pacotePrefix}.json`;
}

export function taxonomyClosedArtifactPath(pacotePrefix: string): string {
  return `artifacts/taxonomy-closed-${pacotePrefix}.json`;
}

export function readTaxonomyClosedArtifact(
  pacotePrefix: string,
  cwd = process.cwd(),
): TaxonomyClosedArtifact | null {
  const path = resolve(cwd, taxonomyClosedArtifactPath(pacotePrefix));
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as TaxonomyClosedArtifact;
}

export type EvaluateTaxonomyGateInput = {
  subtopico: string;
  inventory: SubtopicoInventoryReport;
  catchAllBuckets?: readonly string[];
  registryTaxonomy?: PacoteTaxonomy | null;
  pacotePrefix?: string | null;
  manifest?: ManifestTaxonomySummary | null;
};

export function evaluateTaxonomyGate(input: EvaluateTaxonomyGateInput): TaxonomyGateReport {
  const subtopico = input.subtopico.trim();
  const catchAllBuckets = input.catchAllBuckets ?? DEFAULT_CATCH_ALL_BUCKETS;
  const isCatchAll = isCatchAllBucket(subtopico, catchAllBuckets);
  const registryTaxonomy = input.registryTaxonomy ?? null;
  const registryStatus: TaxonomyStatus = registryTaxonomy?.status ?? 'open';
  const catchAllMode = registryTaxonomy?.catch_all_mode ?? null;
  const pacotePrefix = input.pacotePrefix ?? subtopicoToArtifactSlug(subtopico);
  const manifest = input.manifest ?? null;
  const s = input.inventory.summary;
  const reasons: string[] = [];

  let gate: TaxonomyGate = 'pass';
  let handcraftAllowed = true;
  let promoteRequiresInfer = false;
  const vitrineGroupsByCanonical = Boolean(manifest?.reclassified);

  if (manifest && manifest.manifest_slugs > 0 && manifest.missing_slugs.length > 0) {
    gate = 'block';
    handcraftAllowed = false;
    reasons.push(
      `Manifest: ${manifest.missing_slugs.length}/${manifest.manifest_slugs} slugs ausentes no catálogo.`,
    );
    reasons.push('Verificar apply-lote ou export — pacote não encontrado no Supabase.');
  } else if (manifest && manifest.mismatch_count > 0) {
    gate = 'block';
    handcraftAllowed = false;
    reasons.push(`Manifest: mismatch em ${manifest.mismatch_count} slug(s) do pacote.`);
    reasons.push('Rodar Classify: ou catalog:reclassify-subtopico antes do handcraft.');
  } else if (manifest && manifest.non_canonical_titulo > 0) {
    gate = 'block';
    handcraftAllowed = false;
    reasons.push(`Manifest: ${manifest.non_canonical_titulo} slug(s) com titulo_aula não canônico.`);
  } else if (manifest?.reclassified && s.mismatch_count === 0) {
    gate = 'pass';
    handcraftAllowed = true;
    promoteRequiresInfer = false;
    reasons.push(
      `Bucket catch-all vazio — ${manifest.manifest_slugs}/${manifest.manifest_slugs} slugs reclassificados para subtópicos canônicos.`,
    );
    reasons.push('Modo A concluído (Classify/infer). Handcraft local do pacote permanece válido.');
    reasons.push(
      'Vitrine agrupa por titulo_aula canônico — cards aparecem em Virais, ISTs, Parasitárias etc., não no catch-all.',
    );
    if (manifest.destinations.length > 0) {
      const top = manifest.destinations
        .slice(0, 4)
        .map((d) => `${d.count}→${d.titulo_aula}`)
        .join('; ');
      reasons.push(`Destinos: ${top}.`);
    }
    if (registryStatus !== 'closed' || catchAllMode !== 'A') {
      reasons.push('Atualizar handcraft-registry taxonomy → status=closed, catch_all_mode=A.');
    }
  } else {
    const inventoryBlockers: string[] = [];
    if (s.mismatch_count > 0) inventoryBlockers.push(`mismatch_count=${s.mismatch_count}`);
    if (s.non_canonical_titulo_aula > 0) {
      inventoryBlockers.push(`non_canonical_titulo_aula=${s.non_canonical_titulo_aula}`);
    }
    if (s.non_canonical_meta_subtopico > 0) {
      inventoryBlockers.push(`non_canonical_meta_subtopico=${s.non_canonical_meta_subtopico}`);
    }
    if (s.missing_titulo_aula > 0) inventoryBlockers.push(`missing_titulo_aula=${s.missing_titulo_aula}`);
    if (s.missing_meta_subtopico > 0) {
      inventoryBlockers.push(`missing_meta_subtopico=${s.missing_meta_subtopico}`);
    }

    if (inventoryBlockers.length > 0) {
      gate = 'block';
      handcraftAllowed = false;
      reasons.push(`Inventário do subtópico falhou: ${inventoryBlockers.join(', ')}.`);
      reasons.push('Rodar Classify: antes do 1º lote — docs/TAXONOMIA_CONVERSA.md.');
    } else if (isCatchAll) {
      if (manifest && manifest.still_in_catch_all > 0) {
        if (registryStatus === 'catch_all_provisional' || catchAllMode === 'B') {
          gate = 'warn';
          promoteRequiresInfer = true;
          reasons.push(
            `Modo B — ${manifest.still_in_catch_all} slug(s) ainda no catch-all; handcraft provisório permitido.`,
          );
          reasons.push('Antes de --promote: rodar infer-subtopico / Classify para destinos canônicos.');
        } else {
          gate = 'block';
          handcraftAllowed = false;
          reasons.push(`${manifest.still_in_catch_all} slug(s) do manifest ainda no catch-all.`);
          reasons.push('Fechar com Classify (modo A) ou declarar modo B no registry.');
        }
      } else if (registryStatus === 'catch_all_provisional' || catchAllMode === 'B') {
        gate = 'warn';
        promoteRequiresInfer = true;
        reasons.push('Modo B — handcraft provisório no catch-all permitido.');
        reasons.push('Antes de --promote: rodar infer-subtopico / Classify para destinos canônicos.');
        if (s.total_scanned === 0 && (!manifest || manifest.manifest_slugs === 0)) {
          reasons.push('Bucket vazio e sem manifest — não distingue pacote inexistente de reclassificação.');
        }
        if (registryTaxonomy?.notes) reasons.push(registryTaxonomy.notes);
      } else if (registryStatus === 'closed' && (catchAllMode === 'A' || !catchAllMode)) {
        gate = 'pass';
        reasons.push('Modo A — taxonomia fechada no catch-all (Classify concluído).');
        if (registryTaxonomy?.notes) reasons.push(registryTaxonomy.notes);
      } else if (s.total_scanned === 0 && manifest && manifest.manifest_slugs === 0) {
        gate = 'block';
        handcraftAllowed = false;
        reasons.push('Bucket catch-all vazio e pacote sem slugs no manifest.');
      } else {
        gate = 'block';
        handcraftAllowed = false;
        reasons.push('Bucket catch-all sem declaração de taxonomia no registry.');
        reasons.push(
          'Declarar taxonomy.status=catch_all_provisional + catch_all_mode=B (handcraft provisório) ou fechar com modo A após Classify.',
        );
      }
    } else if (registryStatus === 'closed') {
      gate = 'pass';
      reasons.push('Taxonomia fechada no handcraft-registry.');
      if (registryTaxonomy?.notes) reasons.push(registryTaxonomy.notes);
    } else {
      gate = 'warn';
      reasons.push('Inventário ok, mas taxonomy.status ainda não é closed no registry.');
      reasons.push('Handcraft permitido; fechar com npm run audit:taxonomy-gate -- --write-closed após validar.');
    }
  }

  return {
    subtopico,
    pacote_prefix: pacotePrefix,
    gate,
    is_catch_all_bucket: isCatchAll,
    catch_all_mode: manifest?.reclassified ? 'A' : catchAllMode,
    registry_taxonomy_status: registryStatus,
    inventory: {
      total_scanned: input.inventory.total_scanned,
      mismatch_count: s.mismatch_count,
      non_canonical_titulo_aula: s.non_canonical_titulo_aula,
      non_canonical_meta_subtopico: s.non_canonical_meta_subtopico,
      missing_titulo_aula: s.missing_titulo_aula,
      missing_meta_subtopico: s.missing_meta_subtopico,
    },
    manifest,
    reasons,
    handcraft_allowed: handcraftAllowed,
    promote_requires_infer: promoteRequiresInfer,
    vitrine_groups_by_canonical_titulo: vitrineGroupsByCanonical,
    generated_at: new Date().toISOString(),
    artifact: taxonomyGateArtifactPath(pacotePrefix),
    closed_artifact: registryTaxonomy?.closed_artifact ?? null,
    registry_closed_artifact: registryTaxonomy?.closed_artifact ?? null,
  };
}

export function buildTaxonomyClosedArtifact(
  report: TaxonomyGateReport,
  signedBy: TaxonomyClosedArtifact['signed_by'] = 'audit:taxonomy-gate',
): TaxonomyClosedArtifact {
  const reclassified = report.manifest?.reclassified ?? false;
  return {
    subtopico: report.subtopico,
    pacote_prefix: report.pacote_prefix,
    status: reclassified || !report.is_catch_all_bucket ? 'closed' : 'catch_all_provisional',
    catch_all_mode: reclassified ? 'A' : report.catch_all_mode,
    closed_at: new Date().toISOString().slice(0, 10),
    inventory_snapshot: 'artifacts/subtopico-inventory-audit.json',
    mismatch_count: report.inventory.mismatch_count,
    total_scanned: report.manifest?.manifest_slugs ?? report.inventory.total_scanned,
    manifest_slugs: report.manifest?.manifest_slugs,
    reclassified,
    signed_by: signedBy,
    notes: report.reasons.join(' '),
  };
}

export function evaluateTaxonomyGateForSubtopico(
  subtopico: string,
  rows: CatalogRowForInventory[],
  options: {
    catchAllBuckets?: readonly string[];
    registry?: HandcraftRegistry;
    primaryManifest?: string | null;
  } = {},
): TaxonomyGateReport {
  const registry = options.registry ?? loadHandcraftRegistry();
  const pacoteHit = findPacoteBySubtopico(registry, subtopico);
  const pacotePrefix = pacoteHit?.pacote.pacote_prefix ?? null;
  const manifestSlugs = pacotePrefix
    ? loadManifestSlugsForPacote(pacotePrefix, options.primaryManifest ?? pacoteHit?.pacote.manifest)
    : [];
  const manifest =
    manifestSlugs.length > 0
      ? buildManifestTaxonomySummary(
          manifestSlugs,
          rows,
          subtopico,
          options.catchAllBuckets ?? DEFAULT_CATCH_ALL_BUCKETS,
        )
      : null;
  const inventory = buildScopedSubtopicoInventoryReport(
    rows,
    subtopico,
    options.catchAllBuckets ?? DEFAULT_CATCH_ALL_BUCKETS,
  );
  return evaluateTaxonomyGate({
    subtopico,
    inventory,
    catchAllBuckets: options.catchAllBuckets,
    registryTaxonomy: readPacoteTaxonomy(registry, subtopico),
    pacotePrefix,
    manifest,
  });
}

export function printTaxonomyGateSummary(report: TaxonomyGateReport): void {
  console.log(`[audit:taxonomy-gate] subtopico=${report.subtopico}`);
  console.log(`[audit:taxonomy-gate] pacote_prefix=${report.pacote_prefix}`);
  console.log(`[audit:taxonomy-gate] gate=${report.gate}`);
  console.log(`[audit:taxonomy-gate] handcraft_allowed=${report.handcraft_allowed}`);
  console.log(`[audit:taxonomy-gate] promote_requires_infer=${report.promote_requires_infer}`);
  console.log(`[audit:taxonomy-gate] mismatch=${report.inventory.mismatch_count}`);
  console.log(`[audit:taxonomy-gate] total_scanned=${report.inventory.total_scanned}`);
  if (report.manifest) {
    console.log(
      `[audit:taxonomy-gate] manifest_slugs=${report.manifest.manifest_slugs} reclassified=${report.manifest.reclassified}`,
    );
    if (report.manifest.destinations.length > 0) {
      console.log('[audit:taxonomy-gate] manifest_destinations:');
      for (const dest of report.manifest.destinations.slice(0, 6)) {
        console.log(`  ${dest.count}\t${dest.titulo_aula}`);
      }
    }
  }
  if (report.is_catch_all_bucket) {
    console.log(`[audit:taxonomy-gate] catch_all_mode=${report.catch_all_mode ?? '(não declarado)'}`);
  }
  if (report.vitrine_groups_by_canonical_titulo) {
    console.log('[audit:taxonomy-gate] vitrine_groups_by_canonical_titulo=true');
  }
  for (const reason of report.reasons) {
    console.log(`[audit:taxonomy-gate] → ${reason}`);
  }
}
