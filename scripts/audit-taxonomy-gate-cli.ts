#!/usr/bin/env tsx
/**
 * Gate de taxonomia — pass | warn | block antes do 1º lote handcraft.
 *
 * Uso:
 *   npm run audit:taxonomy-gate -- --subtopico="Farmacodinâmica e Farmacocinética"
 *   npm run audit:taxonomy-gate -- --subtopico="Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis"
 *   npm run audit:taxonomy-gate -- --subtopico="..." --from-inventory=artifacts/subtopico-inventory-audit.json
 *   npm run audit:taxonomy-gate -- --subtopico="..." --write-closed
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  findPacoteBySubtopico,
  loadHandcraftRegistry,
} from '@/lib/catalogMigration/handcraftRegistry';
import type { CatalogRowForInventory, SubtopicoInventoryReport } from '@/lib/catalogMigration/subtopicoInventory';
import {
  buildManifestTaxonomySummary,
  buildScopedSubtopicoInventoryReport,
  buildTaxonomyClosedArtifact,
  evaluateTaxonomyGate,
  loadManifestSlugsForPacote,
  printTaxonomyGateSummary,
  readPacoteTaxonomy,
  taxonomyClosedArtifactPath,
} from '@/lib/catalogMigration/taxonomyGate';
import { createServerSupabase } from '@/lib/supabase/server';

const PAGE_SIZE = 500;

async function fetchAllRows(maxRows: number): Promise<CatalogRowForInventory[]> {
  const supabase = await createServerSupabase();
  const rows: CatalogRowForInventory[] = [];
  let offset = 0;

  while (true) {
    if (maxRows > 0 && rows.length >= maxRows) break;

    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Falha ao ler modulos_estudo: ${error.message}`);

    const batch = (data ?? []) as CatalogRowForInventory[];
    if (batch.length === 0) break;

    for (const row of batch) {
      rows.push(row);
      if (maxRows > 0 && rows.length >= maxRows) break;
    }

    offset += PAGE_SIZE;
    if (batch.length < PAGE_SIZE) break;
  }

  return rows;
}

function loadCatchAllBuckets(): string[] {
  const path = resolve(process.cwd(), 'data/catalog-migration/taxonomy-registry.json');
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, 'utf8')) as { catch_all_buckets?: string[] };
  return raw.catch_all_buckets ?? [];
}

function loadRowsFromInventorySnapshot(
  snapshotPath: string,
  subtopico: string,
): CatalogRowForInventory[] {
  const full = resolve(process.cwd(), snapshotPath);
  if (!existsSync(full)) {
    throw new Error(`Inventário não encontrado: ${full}`);
  }
  const report = JSON.parse(readFileSync(full, 'utf8')) as SubtopicoInventoryReport & {
    rows?: CatalogRowForInventory[];
  };
  if (Array.isArray(report.rows) && report.rows.length > 0) {
    return report.rows;
  }
  const mismatches = report.mismatches ?? [];
  const review = report.review_sample ?? [];
  const fromSamples = [...mismatches, ...review].map((row) => ({
    modulo_slug: row.slug,
    titulo_aula: row.titulo_aula,
    conteudo_json: { meta: { subtopico: row.meta_subtopico } },
  }));
  if (fromSamples.length > 0) {
    console.warn(
      '[audit:taxonomy-gate] from-inventory sem rows completos — usando amostra do relatório (pode subestimar total_scanned).',
    );
    return fromSamples.filter(
      (row) => row.titulo_aula === subtopico || row.conteudo_json?.meta?.subtopico === subtopico,
    );
  }
  throw new Error(
    'Snapshot de inventário não contém rows utilizáveis — rode npm run audit:subtopico-inventory sem --from-inventory.',
  );
}

async function main() {
  const subtopico = parseArg('subtopico');
  if (!subtopico?.trim()) {
    throw new Error('Informe --subtopico="<Nome canônico exato>"');
  }

  const fromInventory = parseArg('from-inventory');
  const maxRowsRaw = parseArg('max-rows');
  const maxRows = maxRowsRaw ? Number(maxRowsRaw) : 0;
  const writeClosed = hasFlag('write-closed');

  const catchAllBuckets = loadCatchAllBuckets();
  const catalogRows = fromInventory
    ? loadRowsFromInventorySnapshot(fromInventory, subtopico.trim())
    : await fetchAllRows(maxRows);

  const registry = loadHandcraftRegistry();
  const pacoteHit = findPacoteBySubtopico(registry, subtopico.trim());
  const pacotePrefix = pacoteHit?.pacote.pacote_prefix ?? null;
  const manifestSlugs = pacotePrefix
    ? loadManifestSlugsForPacote(pacotePrefix, pacoteHit?.pacote.manifest)
    : [];
  const manifest =
    manifestSlugs.length > 0
      ? buildManifestTaxonomySummary(
          manifestSlugs,
          catalogRows,
          subtopico.trim(),
          catchAllBuckets.length > 0 ? catchAllBuckets : undefined,
        )
      : null;

  const inventory = buildScopedSubtopicoInventoryReport(
    catalogRows,
    subtopico.trim(),
    catchAllBuckets.length > 0 ? catchAllBuckets : undefined,
  );

  const report = evaluateTaxonomyGate({
    subtopico: subtopico.trim(),
    inventory,
    catchAllBuckets: catchAllBuckets.length > 0 ? catchAllBuckets : undefined,
    registryTaxonomy: readPacoteTaxonomy(registry, subtopico.trim()),
    pacotePrefix,
    manifest,
  });

  printTaxonomyGateSummary(report);

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const gatePath = resolve(process.cwd(), report.artifact);
  writeFileSync(gatePath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[audit:taxonomy-gate] relatório=${gatePath}`);

  if (writeClosed) {
    if (!report.handcraft_allowed) {
      throw new Error('Não é possível --write-closed com gate=block.');
    }
    const closed = buildTaxonomyClosedArtifact(report);
    const closedPath = resolve(process.cwd(), taxonomyClosedArtifactPath(report.pacote_prefix));
    writeFileSync(closedPath, JSON.stringify(closed, null, 2), 'utf8');
    console.log(`[audit:taxonomy-gate] closed_artifact=${closedPath}`);
  }

  if (report.gate === 'block') {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[audit:taxonomy-gate]', err);
  process.exitCode = 1;
});
