#!/usr/bin/env tsx
/**
 * Seleciona slugs para imunizacao-g44 (calendário P0) a partir do cluster report.
 *
 *   npm run plan:imunizacao-g44
 *   npm run catalog:export-lote -- --lote=imunizacao-g44 --from-manifest=data/catalog-migration/imunizacao-g44/manifest.json
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const CALENDARIO_CLUSTERS = new Set([
  'Calendário vacinal — infantil',
  'Calendário vacinal — adolescente/adulto/idoso',
  'Gestante / puérpera — vacinação',
  'HPV / campanhas e prevenção',
]);

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed?: string;
};

type HandcraftMeta = {
  handcraft_ready_lotes?: Record<string, { status?: string }>;
};

/** Exclui applied g01–g13 + handcraft_ready (handcraft-meta) + manifests planned fora de ordem (g41). */
function loadExcludeSlugs(skipLote?: string | string[]): Set<string> {
  const skip = new Set(Array.isArray(skipLote) ? skipLote : skipLote ? [skipLote] : []);
  const exclude = new Set<string>();
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');

  const handcraftMetaPath = resolve(migrationRoot, 'imunizacao-completo/handcraft-meta.json');
  if (existsSync(handcraftMetaPath)) {
    const handcraft = JSON.parse(readFileSync(handcraftMetaPath, 'utf8')) as HandcraftMeta;
    for (const [loteName, info] of Object.entries(handcraft.handcraft_ready_lotes ?? {})) {
      if (info.status !== 'applied' && info.status !== 'handcraft_ready') continue;
      const manifest = resolve(migrationRoot, loteName, 'manifest.json');
      if (!existsSync(manifest)) continue;
      try {
        const m = JSON.parse(readFileSync(manifest, 'utf8')) as { slugs?: string[] };
        for (const s of m.slugs ?? []) exclude.add(s);
      } catch {
        // ignore
      }
    }
  }

  // g41 planejado (não handcraft_ready) — evita overlap
  const g41Manifest = resolve(migrationRoot, 'imunizacao-g41/manifest.json');
  if (existsSync(g41Manifest)) {
    try {
      const m = JSON.parse(readFileSync(g41Manifest, 'utf8')) as { slugs?: string[] };
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

  // Manifests skipped (g42/g43 fora de ordem — slugs reatribuídos ao g44)
  for (const skipName of skip) {
    const manifest = resolve(migrationRoot, skipName, 'manifest.json');
    if (!existsSync(manifest)) continue;
    try {
      const m = JSON.parse(readFileSync(manifest, 'utf8')) as { slugs?: string[] };
      for (const s of m.slugs ?? []) exclude.delete(s);
    } catch {
      // ignore
    }
  }

  return exclude;
}

function isImunizacaoSlug(slug: string): boolean {
  return /-enfermagem-imunizacao-/.test(slug);
}

function main(): void {
  const lote = parseArg('lote') ?? 'imunizacao-g44';
  const batchSize = Number(parseArg('size') ?? '8');
  const reportPath = resolve(process.cwd(), 'artifacts/imunizacao-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:imunizacao antes de planejar o lote.');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs(
    lote === 'imunizacao-g44' ? [lote, 'imunizacao-g42', 'imunizacao-g43'] : lote,
  );

  const infantil: string[] = [];
  const adulto: string[] = [];

  for (const row of report.rows) {
    if (!CALENDARIO_CLUSTERS.has(row.pedagogical_cluster)) continue;
    if (!isImunizacaoSlug(row.modulo_slug)) continue;
    if (exclude.has(row.modulo_slug)) continue;
    if (row.pedagogical_cluster === 'Calendário vacinal — infantil') {
      infantil.push(row.modulo_slug);
    } else {
      adulto.push(row.modulo_slug);
    }
  }

  const picked: string[] = [];
  let i = 0;
  let j = 0;
  while (picked.length < batchSize && (i < infantil.length || j < adulto.length)) {
    if (i < infantil.length) picked.push(infantil[i++]!);
    if (picked.length >= batchSize) break;
    if (j < adulto.length) picked.push(adulto[j++]!);
  }

  if (picked.length < batchSize) {
    throw new Error(`Só ${picked.length} slugs calendário disponíveis (excluídos ${exclude.size}).`);
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const slugsFile = resolve(loteDir, 'g44-slugs.json');
  writeFileSync(slugsFile, JSON.stringify(picked, null, 2), 'utf8');

  const manifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      clusters: [...CALENDARIO_CLUSTERS],
      exclude_count: exclude.size,
      mix: 'infantil+adulto/gestante/HPV alternado',
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote,
    subtopico: 'Imunização',
    status: 'planned',
    priority: 'P0 — calendário (~62% volume)',
    slug_count: picked.length,
    pedagogical_branch_target: 'imunizacao_calendario',
    anchors: [
      'examples/questao-premium-fundatec-meningococica-3meses.json',
      'examples/questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json',
    ],
    anchor_slug: picked[0],
    handcraft_grammar: 'data/catalog-migration/imunizacao-pedagogy-errors.json',
    notes:
      'Planejado 2026-07-03 — 2 infantil Fundatec + 6 adulto Vunesp. g42/g43 fora de ordem — slugs reatribuídos ao g44. Handcraft golden-v1 calendário.',
    workflow: [
      'npm run plan:imunizacao-g44',
      'npm run catalog:export-lote -- --lote=imunizacao-g44 --from-manifest=data/catalog-migration/imunizacao-g44/manifest.json',
      'Handcraft por slug — gramática imunizacao-pedagogy-errors.json',
      'npm run audit:questao-readiness -- --lote=imunizacao-g44 --strict-v2-pedagogy',
      'npm run audit:slug-alignment -- --lote=imunizacao-g44 --strict',
      'npm run audit:numeric-factcheck -- --lote=imunizacao-g44',
      'npm run validate:goldens -- --strict --lote=imunizacao-g44',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:imunizacao-g44] lote=${lote} slugs=${picked.length}`);
  console.log(`[plan:imunizacao-g44] slugs_file=${slugsFile}`);
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:imunizacao-g44] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
