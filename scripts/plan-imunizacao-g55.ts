#!/usr/bin/env tsx
/**
 * Seleciona slugs para imunizacao-g55 (calendário P0) a partir do cluster report.
 *
 *   npm run plan:imunizacao-g55
 *   npm run catalog:export-lote -- --lote=imunizacao-g55 --from-manifest=data/catalog-migration/imunizacao-g55/manifest.json
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

/** P0-adjacent quando calendário explícito esgotado (g49+). */
const FALLBACK_P0_CLUSTERS = new Set([
  'Técnica de aplicação / sala de vacinação',
  'Conceito — tipos de vacina / imunobiológicos',
  'Default — sem âncora temática',
]);

/** P1 quando P0 residual esgotado (g55+). */
const FALLBACK_P1_CLUSTERS = new Set([
  'V/F — intervalos PNI (I/II/III/IV)',
  'Cadeia de frio / conservação / SI-PNI',
]);

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
  const lote = parseArg('lote') ?? 'imunizacao-g55';
  const batchSize = Number(parseArg('size') ?? '8');
  const reportPath = resolve(process.cwd(), 'artifacts/imunizacao-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:imunizacao antes de planejar o lote.');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs(lote);

  const infantil: string[] = [];
  const adulto: string[] = [];
  const fallback: string[] = [];
  const fallbackP1: string[] = [];

  for (const row of report.rows) {
    if (!isImunizacaoSlug(row.modulo_slug)) continue;
    if (exclude.has(row.modulo_slug)) continue;
    if (CALENDARIO_CLUSTERS.has(row.pedagogical_cluster)) {
      if (row.pedagogical_cluster === 'Calendário vacinal — infantil') {
        infantil.push(row.modulo_slug);
      } else {
        adulto.push(row.modulo_slug);
      }
    } else if (FALLBACK_P0_CLUSTERS.has(row.pedagogical_cluster)) {
      fallback.push(row.modulo_slug);
    } else if (FALLBACK_P1_CLUSTERS.has(row.pedagogical_cluster)) {
      fallbackP1.push(row.modulo_slug);
    }
  }

  const picked: string[] = [];
  let i = 0;
  let j = 0;
  let k = 0;
  let m = 0;
  while (picked.length < batchSize && (i < infantil.length || j < adulto.length)) {
    if (i < infantil.length) picked.push(infantil[i++]!);
    if (picked.length >= batchSize) break;
    if (j < adulto.length) picked.push(adulto[j++]!);
  }
  while (picked.length < batchSize && k < fallback.length) {
    picked.push(fallback[k++]!);
  }
  while (picked.length < batchSize && m < fallbackP1.length) {
    picked.push(fallbackP1[m++]!);
  }

  if (picked.length < batchSize) {
    throw new Error(
      `Só ${picked.length} slugs disponíveis (cal=${infantil.length + adulto.length}, p0=${fallback.length}, p1=${fallbackP1.length}, excluídos ${exclude.size}).`,
    );
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const slugsFile = resolve(loteDir, 'g55-slugs.json');
  writeFileSync(slugsFile, JSON.stringify(picked, null, 2), 'utf8');

  const manifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      clusters: [...CALENDARIO_CLUSTERS],
      fallback_clusters: [...FALLBACK_P0_CLUSTERS],
      fallback_p1_clusters: [...FALLBACK_P1_CLUSTERS],
      exclude_count: exclude.size,
      mix: 'P0-adjacent residual + P1 V/F ou cadeia de frio',
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

  const calCount = picked.filter((s) => infantil.includes(s) || adulto.includes(s)).length;
  const fbCount = picked.filter((s) => fallback.includes(s)).length;
  const p1Count = picked.length - calCount - fbCount;

  const loteMeta = {
    lote,
    subtopico: 'Imunização',
    status: 'planned',
    priority: 'P0 residual + P1 (tail calendário)',
    slug_count: picked.length,
    pedagogical_branch_target: 'imunizacao_calendario',
    anchors: [
      'examples/questao-premium-fundatec-meningococica-3meses.json',
      'examples/questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json',
    ],
    anchor_slug: picked[0],
    handcraft_grammar: 'data/catalog-migration/imunizacao-pedagogy-errors.json',
    notes: `Planejado 2026-07-03 — P0-adjacent (${fbCount}) + P1 V/F/cadeia (${p1Count})${calCount ? ` + calendário (${calCount})` : ''}. Sem overlap g01–g54. Handcraft golden-v1.`,
    workflow: [
      'npm run plan:imunizacao-g55',
      'npm run catalog:export-lote -- --lote=imunizacao-g55 --from-manifest=data/catalog-migration/imunizacao-g55/manifest.json',
      'Handcraft por slug — gramática imunizacao-pedagogy-errors.json',
      'npm run audit:questao-readiness -- --lote=imunizacao-g55 --strict-v2-pedagogy',
      'npm run audit:slug-alignment -- --lote=imunizacao-g55 --strict',
      'npm run audit:numeric-factcheck -- --lote=imunizacao-g55',
      'npm run validate:goldens -- --strict --lote=imunizacao-g55',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:imunizacao-g55] lote=${lote} slugs=${picked.length}`);
  console.log(`[plan:imunizacao-g55] slugs_file=${slugsFile}`);
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:imunizacao-g55] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
