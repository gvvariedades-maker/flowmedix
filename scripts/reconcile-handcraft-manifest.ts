#!/usr/bin/env tsx
/**
 * Reconcilia manifest completo a partir dos lotes g* do pacote.
 *
 * Uso:
 *   npm run reconcile:handcraft-manifest -- --subtopico="Enfermagem em Central de Material e Esterilização (CME)"
 *   npm run reconcile:handcraft-manifest -- --pacote-prefix=cme
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath } from '@/lib/catalogMigration/paths';
import {
  findPacoteBySubtopico,
  loadHandcraftRegistry,
} from '@/lib/catalogMigration/handcraftRegistry';

type ManifestFile = { slugs?: string[]; updated_at?: string };

function loadManifestSlugs(path: string): string[] {
  const full = resolve(process.cwd(), path);
  if (!existsSync(full)) return [];
  const data = JSON.parse(readFileSync(full, 'utf8')) as ManifestFile;
  return [...(data.slugs ?? [])].sort();
}

function discoverLoteManifests(pacotePrefix: string): { lote: string; slugs: string[] }[] {
  const root = resolve(process.cwd(), 'data/catalog-migration');
  const results: { lote: string; slugs: string[] }[] = [];

  for (const name of readdirSync(root).sort()) {
    if (!name.startsWith(`${pacotePrefix}-g`)) continue;
    const manifest = loteManifestPath(name);
    if (!existsSync(manifest)) continue;
    const slugs = loadManifestSlugs(`data/catalog-migration/${name}/manifest.json`);
    if (slugs.length > 0) {
      results.push({ lote: name, slugs });
    }
  }
  return results;
}

function main(): void {
  const subtopico = parseArg('subtopico');
  const prefixArg = parseArg('pacote-prefix');
  const dryRun = hasFlag('dry-run');

  const registry = loadHandcraftRegistry();
  let pacotePrefix = prefixArg;
  let manifestPath: string | undefined;
  let totalSlugs: number | undefined;

  if (subtopico) {
    const found = findPacoteBySubtopico(registry, subtopico);
    if (!found) throw new Error(`Subtópico não encontrado no registry: ${subtopico}`);
    pacotePrefix = found.pacote.pacote_prefix;
    manifestPath = found.pacote.manifest;
    totalSlugs = found.pacote.total_slugs;
  }

  if (!pacotePrefix) {
    throw new Error('Informe --subtopico= ou --pacote-prefix=');
  }

  const lotes = discoverLoteManifests(pacotePrefix);
  const union = [...new Set(lotes.flatMap((l) => l.slugs))].sort();

  const report = {
    generated_at: new Date().toISOString(),
    pacote_prefix: pacotePrefix,
    lotes: lotes.map((l) => ({ lote: l.lote, count: l.slugs.length })),
    union_count: union.length,
    registry_total_slugs: totalSlugs ?? null,
    match: totalSlugs == null || union.length === totalSlugs,
    slugs: union,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const reportPath = resolve(artifactsDir, `reconcile-manifest-${pacotePrefix}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[reconcile:handcraft-manifest] prefix=${pacotePrefix} lotes=${lotes.length}`);
  console.log(`[reconcile:handcraft-manifest] union=${union.length} registry=${totalSlugs ?? '—'}`);
  if (totalSlugs != null && union.length !== totalSlugs) {
    console.warn(
      `[reconcile:handcraft-manifest] ALERTA: union (${union.length}) ≠ registry.total_slugs (${totalSlugs})`,
    );
  }

  if (manifestPath && !dryRun) {
    const full = resolve(process.cwd(), manifestPath);
    const existing = existsSync(full)
      ? (JSON.parse(readFileSync(full, 'utf8')) as Record<string, unknown>)
      : {};
    const merged: ManifestFile & Record<string, unknown> = {
      ...existing,
      slugs: union,
      updated_at: new Date().toISOString().slice(0, 10),
      reconciled_from: lotes.map((l) => l.lote),
    };
    mkdirSync(resolve(full, '..'), { recursive: true });
    writeFileSync(full, JSON.stringify(merged, null, 2) + '\n', 'utf8');
    console.log(`[reconcile:handcraft-manifest] manifest atualizado: ${manifestPath}`);
  } else if (dryRun) {
    console.log('[reconcile:handcraft-manifest] dry-run — manifest não alterado');
  }

  console.log(`[reconcile:handcraft-manifest] report=${reportPath}`);
  process.exitCode = report.match ? 0 : 1;
}

main();
