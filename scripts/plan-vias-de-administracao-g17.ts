#!/usr/bin/env tsx
/**
 * Seleciona slugs para vias-de-administracao-g17 (P1 via_tecnica_admin) a partir do cluster report.
 *
 *   npx tsx scripts/plan-vias-de-administracao-g17.ts
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const CLUSTER = 'Técnica de punção IM/IV';
const LOTE = 'vias-de-administracao-g17';
const BATCH_SIZE = 8;

const ALWAYS_EXCLUDE = new Set([
  'instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0',
]);

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
};

function loadExcludeSlugs(): Set<string> {
  const exclude = new Set<string>(ALWAYS_EXCLUDE);
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');
  const handcraftLoteRe = /^vias-de-administracao-(g\d{2}|.+repair)$/;

  for (const name of readdirSync(migrationRoot)) {
    if (!handcraftLoteRe.test(name)) continue;
    if (name === LOTE) continue;
    const manifest = resolve(migrationRoot, name, 'manifest.json');
    if (!existsSync(manifest)) continue;
    try {
      const m = JSON.parse(readFileSync(manifest, 'utf8')) as { slugs?: string[] };
      for (const s of m.slugs ?? []) exclude.add(s);
    } catch {
      // ignore
    }
  }

  return exclude;
}

function main(): void {
  const reportPath = resolve(
    process.cwd(),
    'artifacts/vias-de-administracao-topic-cluster-report.json',
  );
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:vias-de-administracao antes de planejar o lote.');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs();

  const pool = report.rows
    .filter(
      (r) =>
        r.pedagogical_cluster === CLUSTER &&
        /-enfermagem-vias-de-administracao-/.test(r.modulo_slug) &&
        !exclude.has(r.modulo_slug),
    )
    .map((r) => r.modulo_slug);

  const picked = pool.slice(0, BATCH_SIZE);
  if (picked.length < BATCH_SIZE) {
    throw new Error(
      `Só ${picked.length} slugs P1 técnica disponíveis (excluídos ${exclude.size}). pool=${pool.length}`,
    );
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', LOTE);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(LOTE), { recursive: true });

  writeFileSync(resolve(loteDir, 'g01-slugs.json'), JSON.stringify(picked, null, 2), 'utf8');

  const manifest = {
    lote: LOTE,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      clusters: [CLUSTER],
      pedagogical_branch_target: 'via_tecnica_admin',
      exclude_count: exclude.size,
      mix: 'P1 técnica punção IM/IV — g17 após g16',
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(LOTE), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote: LOTE,
    subtopico: 'Vias de Administração',
    status: 'planned',
    priority: 'P1 — via_tecnica_admin (punção IM/IV)',
    slug_count: picked.length,
    pedagogical_branch_target: 'via_tecnica_admin',
    anchors: ['examples/questao-premium-cpcon-vias-im-vf.json'],
    anchor_slug: picked[0],
    handcraft_grammar: 'data/catalog-migration/vias-pedagogy-errors.json',
    notes:
      'Planejado 2026-07-03 — P0 esgotado; g17 continua ramo técnica punção IM/IV após g16. plan:vias P0 falhou — manifest manual cluster técnica.',
    workflow: [
      'npm run catalog:export-lote -- --lote=vias-de-administracao-g17 --from-manifest=data/catalog-migration/vias-de-administracao-g17/manifest.json',
      'Handcraft por slug — gramática vias-pedagogy-errors.json',
      'npm run validate:goldens -- --lote=vias-de-administracao-g17 --strict',
      'npm run audit:questao-readiness -- --lote=vias-de-administracao-g17 --strict-v2-pedagogy',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:vias-g17] lote=${LOTE} slugs=${picked.length}`);
  console.log(`[plan:vias-g17] pool=${pool.length} excluded=${exclude.size}`);
  for (const s of picked) console.log(`  · ${s}`);
}

main();
