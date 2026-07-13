#!/usr/bin/env tsx
/**
 * Fechamento CAM — cuidados-na-administracao-de-medicamentos-g14 (6 slugs restantes).
 *
 *   npm run plan:cuidados-na-administracao-de-medicamentos-g14
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const COMPLETO_MANIFEST =
  'data/catalog-migration/cuidados-na-administracao-de-medicamentos-completo/manifest.json';

const CLUSTER_REPORT = 'artifacts/cuidados-na-administracao-de-medicamentos-topic-cluster-report.json';

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed: string;
};

function loadExcludeSlugs(skipLote?: string): Set<string> {
  const exclude = new Set<string>();
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

function loadClusterBySlug(): Map<string, ClusterRow> {
  const path = resolve(process.cwd(), CLUSTER_REPORT);
  const report = JSON.parse(readFileSync(path, 'utf8')) as { rows?: ClusterRow[] };
  return new Map((report.rows ?? []).map((r) => [r.modulo_slug, r]));
}

function main(): void {
  const lote = parseArg('lote') ?? 'cuidados-na-administracao-de-medicamentos-g14';
  const completoPath = resolve(process.cwd(), COMPLETO_MANIFEST);
  const completo = JSON.parse(readFileSync(completoPath, 'utf8')) as { slugs?: string[] };
  const exclude = loadExcludeSlugs(lote);
  const clusterBySlug = loadClusterBySlug();

  const picked = (completo.slugs ?? []).filter((slug) => !exclude.has(slug));
  if (picked.length === 0) {
    throw new Error('Nenhum slug restante no catálogo completo.');
  }

  const slugDetails = picked.map((slug) => {
    const row = clusterBySlug.get(slug);
    return {
      slug,
      cluster: row?.pedagogical_cluster ?? 'Default',
      micro_branch: row?.pedagogical_branch_proposed ?? 'cam_generico',
      playbook_branch: row?.pedagogical_branch_proposed ?? 'cam_generico',
    };
  });

  const branches: Record<string, number> = {};
  for (const row of slugDetails) {
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
        source: 'completo-manifest-minus-lotes',
        filters: { exclude_count: exclude.size },
        slugs: picked,
        slug_details: slugDetails,
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
        priority: 'P0 — fechamento catálogo (lote 5/5)',
        slug_count: picked.length,
        pedagogical_branch_target: 'mixed',
        branches,
        anchors: [
          'examples/questao-premium-fepese-cuidados-insulina-alto-risco.json',
          'examples/questao-premium-facet-cuidados-vigilancia-reacao-adversa.json',
          'examples/questao-premium-avancasp-cuidados-documentacao-vf.json',
          'examples/questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json',
        ],
        anchor_slug: 'facet-enfermagem-cuidados-na-administracao-de-medicamentos-1778969710154-5',
        handcraft_grammar:
          'data/catalog-migration/cuidados-na-administracao-de-medicamentos-pedagogy-errors.json',
        notes:
          'Âncoras + excluídos do pool g10–g13: alto risco, documentação, exceto, vigilância, nove certos',
        workflow: [
          'npm run plan:cuidados-na-administracao-de-medicamentos-g14',
          `npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
          'Handcraft golden-v1 por ramo forte',
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

  console.log(`[plan:cuidados-g14] lote=${lote} slugs=${picked.length} (fechamento)`);
  for (const row of slugDetails) console.log(`  · ${row.slug} (${row.cluster})`);
}

main();
