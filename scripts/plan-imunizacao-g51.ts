#!/usr/bin/env tsx
/**
 * Seleciona slugs para imunizacao-g51 (cadeia de frio P1) a partir do cluster report.
 * Calendário P0 esgotado em g48 — g51+ usa cluster cadeia de frio.
 *
 *   npm run plan:imunizacao-g51
 *   npm run catalog:export-lote -- --lote=imunizacao-g51 --from-manifest=data/catalog-migration/imunizacao-g51/manifest.json
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const CADEIA_CLUSTER = 'Cadeia de frio / conservação / SI-PNI';

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed?: string;
};

function loadExcludeSlugs(skipLote?: string): Set<string> {
  const exclude = new Set<string>();
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');

  const handcraftLoteRe =
    /^imunizacao-(g\d{2}|g\d{2}-ref|exceto-[\w-]+|[\w-]+-repair)$/;

  for (const name of readdirSync(migrationRoot)) {
    if (!handcraftLoteRe.test(name)) continue;
    if (skipLote && name === skipLote) continue;
    const manifest = resolve(migrationRoot, name, 'manifest.json');
    if (!existsSync(manifest)) continue;
    try {
      const m = JSON.parse(readFileSync(manifest, 'utf8')) as { slugs?: string[] };
      for (const s of m.slugs ?? []) exclude.add(s);
    } catch {
      // ignore
    }
  }

  const completoManifest = resolve(migrationRoot, 'imunizacao-completo/manifest.json');
  if (existsSync(completoManifest)) {
    const m = JSON.parse(readFileSync(completoManifest, 'utf8')) as {
      slugs_handcraft_applied?: string[];
    };
    for (const s of m.slugs_handcraft_applied ?? []) exclude.add(s);
  }

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  if (existsSync(artifactsDir)) {
    for (const name of readdirSync(artifactsDir)) {
      if (!/^catalog-migration-imunizacao-g\d{2}-applied\.json$/.test(name)) continue;
      try {
        const applied = JSON.parse(readFileSync(resolve(artifactsDir, name), 'utf8')) as {
          applied_slugs?: string[];
        };
        for (const s of applied.applied_slugs ?? []) exclude.add(s);
      } catch {
        // ignore
      }
    }
  }

  return exclude;
}

function isImunizacaoSlug(slug: string): boolean {
  return /-enfermagem-imunizacao-/.test(slug);
}

function main(): void {
  const lote = parseArg('lote') ?? 'imunizacao-g51';
  const batchSize = Number(parseArg('size') ?? '8');
  const reportPath = resolve(process.cwd(), 'artifacts/imunizacao-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:imunizacao antes de planejar o lote.');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs(lote);

  const picked: string[] = [];
  for (const row of report.rows) {
    if (row.pedagogical_cluster !== CADEIA_CLUSTER) continue;
    if (!isImunizacaoSlug(row.modulo_slug)) continue;
    if (exclude.has(row.modulo_slug)) continue;
    picked.push(row.modulo_slug);
    if (picked.length >= batchSize) break;
  }

  if (picked.length < batchSize) {
    throw new Error(
      `Só ${picked.length} slugs cadeia de frio disponíveis (excluídos ${exclude.size}).`,
    );
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const slugsFile = resolve(loteDir, 'g51-slugs.json');
  writeFileSync(slugsFile, JSON.stringify(picked, null, 2), 'utf8');

  const manifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      clusters: [CADEIA_CLUSTER],
      exclude_count: exclude.size,
      mix: 'cadeia de frio P1 — calendário P0 esgotado em g48',
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote,
    subtopico: 'Imunização',
    status: 'planned',
    priority: 'P1 — cadeia de frio (~12% volume)',
    slug_count: picked.length,
    pedagogical_branch_target: 'imunizacao_cadeia_frio',
    anchors: [
      'examples/questao-premium-ameosc-imunizacao-vf-cadeia-frio.json',
      'examples/questao-premium-avancasp-imunizacao-rede-frio-temperatura.json',
    ],
    anchor_slug: picked[0],
    handcraft_grammar: 'data/catalog-migration/imunizacao-pedagogy-errors.json',
    notes:
      'Planejado 2026-07-03 — calendário P0 esgotado em g48; g51 inicia lote dedicado cadeia de frio. Handcraft golden-v1. Erro reproduzível no concept_map + mirror danger_zone.',
    workflow: [
      'npm run plan:imunizacao-g51',
      'npm run catalog:export-lote -- --lote=imunizacao-g51 --from-manifest=data/catalog-migration/imunizacao-g51/manifest.json',
      'Handcraft por slug — gramática imunizacao-pedagogy-errors.json',
      'npm run audit:questao-readiness -- --lote=imunizacao-g51 --strict-v2-pedagogy',
      'npm run audit:slug-alignment -- --lote=imunizacao-g51 --strict',
      'npm run audit:numeric-factcheck -- --lote=imunizacao-g51',
      'npm run validate:goldens -- --strict --lote=imunizacao-g51',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:imunizacao-g51] lote=${lote} slugs=${picked.length}`);
  console.log(`[plan:imunizacao-g51] slugs_file=${slugsFile}`);
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:imunizacao-g51] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
