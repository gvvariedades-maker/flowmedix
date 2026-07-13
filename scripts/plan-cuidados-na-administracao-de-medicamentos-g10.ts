#!/usr/bin/env tsx
/**
 * Seleciona slugs para cuidados-na-administracao-de-medicamentos-g10 (cauda cam_generico).
 *
 *   npm run plan:cuidados-na-administracao-de-medicamentos-g10
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const TARGET_BRANCH = 'cam_generico';

/** Âncoras golden em examples/ — não repetir no lote salvo referência de estilo. */
const ALWAYS_EXCLUDE = new Set([
  'fepese-enfermagem-cuidados-na-administracao-de-medicamentos-1778969248953-2',
  'avancasp-enfermagem-cuidados-na-administracao-de-medicamentos-1778969685650-2',
  'avancasp-enfermagem-cuidados-na-administracao-de-medicamentos-1778969248953-4',
  'facet-enfermagem-cuidados-na-administracao-de-medicamentos-1778969710154-5',
]);

type RemainingSlug = {
  slug: string;
  cluster: string;
  micro_branch: string;
  playbook_branch: string;
};

function loadExcludeSlugs(skipLote?: string): Set<string> {
  const exclude = new Set<string>(ALWAYS_EXCLUDE);
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');
  const handcraftLoteRe = /^cuidados-na-administracao-de-medicamentos-(g\d{2}|.+repair)$/;

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

  return exclude;
}

function loadRemainingPool(): RemainingSlug[] {
  const auditPath = resolve(process.cwd(), 'artifacts/cam-branch-audit-report.json');
  if (existsSync(auditPath)) {
    const audit = JSON.parse(readFileSync(auditPath, 'utf8')) as {
      remaining_slugs?: RemainingSlug[];
    };
    if (audit.remaining_slugs?.length) return audit.remaining_slugs;
  }

  const completoPath = resolve(
    process.cwd(),
    'data/catalog-migration/cuidados-na-administracao-de-medicamentos-completo/manifest.json',
  );
  const completo = JSON.parse(readFileSync(completoPath, 'utf8')) as { slugs?: string[] };
  const exclude = loadExcludeSlugs();
  return (completo.slugs ?? [])
    .filter((slug) => !exclude.has(slug))
    .map((slug) => ({
      slug,
      cluster: 'unknown',
      micro_branch: 'cam_generico',
      playbook_branch: TARGET_BRANCH,
    }));
}

function main(): void {
  const lote = parseArg('lote') ?? 'cuidados-na-administracao-de-medicamentos-g10';
  const batchSize = Number(parseArg('size') ?? '8');
  const branchFilter = parseArg('branch') ?? TARGET_BRANCH;

  const exclude = loadExcludeSlugs(lote);
  const pool = loadRemainingPool().filter(
    (row) => row.playbook_branch === branchFilter && !exclude.has(row.slug),
  );

  const picked = pool.slice(0, batchSize);
  if (picked.length === 0) {
    throw new Error(`Nenhum slug ${branchFilter} disponível. pool=${pool.length}`);
  }

  const branches: Record<string, number> = {};
  for (const row of picked) {
    branches[row.playbook_branch] = (branches[row.playbook_branch] ?? 0) + 1;
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  writeFileSync(
    loteManifestPath(lote),
    JSON.stringify(
      {
        lote,
        exported_at: new Date().toISOString(),
        source: 'cam-branch-audit-report',
        filters: {
          playbook_branch: branchFilter,
          exclude_count: exclude.size,
          batch_size: batchSize,
        },
        slugs: picked.map((r) => r.slug),
        slug_details: picked,
      },
      null,
      2,
    ),
    'utf8',
  );

  writeFileSync(
    resolve(loteDir, 'lote-meta.json'),
    JSON.stringify(
      {
        lote,
        subtopico: 'Cuidados na Administração de Medicamentos',
        status: 'planned',
        priority: 'P1 — cam_generico (cauda — lote 1/5)',
        slug_count: picked.length,
        pedagogical_branch_target: TARGET_BRANCH,
        branches,
        anchors: [
          'examples/questao-premium-facet-cuidados-vigilancia-reacao-adversa.json',
          'examples/questao-premium-ameosc-cuidados-protocolo-ms-vf.json',
        ],
        anchor_slug: 'facet-enfermagem-cuidados-na-administracao-de-medicamentos-1778969710154-5',
        handcraft_grammar:
          'data/catalog-migration/cuidados-na-administracao-de-medicamentos-pedagogy-errors.json',
        notes:
          'Cauda pós-clusters fortes — vigilância, protocolo MS, preparo, aprazamento, prescrição dúvida',
        workflow: [
          'npm run plan:cuidados-na-administracao-de-medicamentos-g10',
          `npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
          'Handcraft golden-v1 — bridge/center/cards/compare semântico',
          `npm run validate:goldens -- --lote=${lote} --strict`,
          `npm run audit:questao-readiness -- --lote=${lote} --strict-v3-pedagogy`,
          `npm run audit:slug-alignment -- --lote=${lote} --strict`,
          `npm run audit:anchor-review -- --lote=${lote} --record-pass --reviewer=agent --skip-capture`,
          `npm run catalog:apply-lote -- --lote=${lote} --apply`,
        ],
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`[plan:cuidados-g10] lote=${lote} slugs=${picked.length} pool_remaining=${pool.length}`);
  for (const row of picked) console.log(`  · ${row.slug} (${row.cluster})`);
  console.log(
    `[plan:cuidados-g10] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
