#!/usr/bin/env tsx
/**
 * Seleciona slugs para vias-de-administracao-g01 (P0 via_vf_absorcao) a partir do cluster report.
 *
 *   npm run plan:vias-de-administracao-g01
 *   npm run catalog:export-lote -- --lote=vias-de-administracao-g01 --from-manifest=data/catalog-migration/vias-de-administracao-g01/manifest.json
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

/** P0 — ramo via_vf_absorcao (~91% volume). */
const P0_ABSORCAO_CLUSTERS = new Set([
  'V/F — absorção e perfil de vias',
  'Absorção / farmacocinética (CORRETA)',
  'Indicação da via (velocidade SC/IM/IV)',
]);

const CLUSTER_CORRETA = 'Absorção / farmacocinética (CORRETA)';
const CLUSTER_VF = 'V/F — absorção e perfil de vias';
const CLUSTER_INDICACAO = 'Indicação da via (velocidade SC/IM/IV)';

/** Slug já handcraft no repair piloto — não repetir no g01. */
const ALWAYS_EXCLUDE = new Set([
  'instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0',
]);

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed?: string;
};

function loadExcludeSlugs(skipLote?: string): Set<string> {
  const exclude = new Set<string>(ALWAYS_EXCLUDE);
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');

  const handcraftLoteRe = /^vias-de-administracao-(g\d{2}|.+repair)$/;

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

  const completoManifest = resolve(
    migrationRoot,
    'vias-de-administracao-completo/manifest.json',
  );
  if (existsSync(completoManifest)) {
    const m = JSON.parse(readFileSync(completoManifest, 'utf8')) as {
      slugs_handcraft_applied?: string[];
    };
    for (const s of m.slugs_handcraft_applied ?? []) exclude.add(s);
  }

  const handcraftMeta = resolve(
    migrationRoot,
    'vias-de-administracao-completo/handcraft-meta.json',
  );
  if (existsSync(handcraftMeta)) {
    try {
      const meta = JSON.parse(readFileSync(handcraftMeta, 'utf8')) as {
        first_handcraft?: { slug?: string };
      };
      if (meta.first_handcraft?.slug) exclude.add(meta.first_handcraft.slug);
    } catch {
      // ignore
    }
  }

  return exclude;
}

function isViasDeAdministracaoSlug(slug: string): boolean {
  return /-enfermagem-vias-de-administracao-/.test(slug);
}

function main(): void {
  const lote = parseArg('lote') ?? 'vias-de-administracao-g01';
  const batchSize = Number(parseArg('size') ?? '8');
  const reportPath = resolve(
    process.cwd(),
    'artifacts/vias-de-administracao-topic-cluster-report.json',
  );
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:vias-de-administracao antes de planejar o lote.');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs(lote);

  const correta: string[] = [];
  const vf: string[] = [];
  const indicacao: string[] = [];

  for (const row of report.rows) {
    if (!P0_ABSORCAO_CLUSTERS.has(row.pedagogical_cluster)) continue;
    if (!isViasDeAdministracaoSlug(row.modulo_slug)) continue;
    if (exclude.has(row.modulo_slug)) continue;

    if (row.pedagogical_cluster === CLUSTER_CORRETA) {
      correta.push(row.modulo_slug);
    } else if (row.pedagogical_cluster === CLUSTER_VF) {
      vf.push(row.modulo_slug);
    } else if (row.pedagogical_cluster === CLUSTER_INDICACAO) {
      indicacao.push(row.modulo_slug);
    }
  }

  const picked: string[] = [];
  let i = 0;
  let j = 0;
  let k = 0;
  while (
    picked.length < batchSize &&
    (i < correta.length || j < vf.length || k < indicacao.length)
  ) {
    if (i < correta.length) picked.push(correta[i++]!);
    if (picked.length >= batchSize) break;
    if (j < vf.length) picked.push(vf[j++]!);
    if (picked.length >= batchSize) break;
    if (k < indicacao.length) picked.push(indicacao[k++]!);
  }

  if (picked.length < batchSize) {
    throw new Error(
      `Só ${picked.length} slugs P0 absorção disponíveis (excluídos ${exclude.size}). ` +
        `correta=${correta.length} vf=${vf.length} indicacao=${indicacao.length}`,
    );
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const slugsFile = resolve(loteDir, 'g01-slugs.json');
  writeFileSync(slugsFile, JSON.stringify(picked, null, 2), 'utf8');

  const manifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      clusters: [...P0_ABSORCAO_CLUSTERS],
      pedagogical_branch_target: 'via_vf_absorcao',
      exclude_count: exclude.size,
      mix: 'CORRETA + V/F absorção + indicação SC/IM/IV alternado',
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote,
    subtopico: 'Vias de Administração',
    status: 'planned',
    priority: 'P0 — via_vf_absorcao (~91% volume)',
    slug_count: picked.length,
    pedagogical_branch_target: 'via_vf_absorcao',
    anchors: [
      'examples/questao-premium-consulpam-vias-absorcao-oral.json',
      'examples/questao-premium-vunesp-via-subcutanea.json',
      'examples/questao-premium-cpcon-vias-im-vf.json',
    ],
    anchor_slug: picked[0],
    handcraft_grammar: 'data/catalog-migration/vias-pedagogy-errors.json',
    notes:
      'Planejado 2026-07-03 — P0 absorção/V/F/indicação; exclui Consulpam repair. Handcraft golden-v1 — erro ROI no concept_map + mirror danger_zone.',
    workflow: [
      'npm run plan:vias-de-administracao-g01',
      'npm run catalog:export-lote -- --lote=vias-de-administracao-g01 --from-manifest=data/catalog-migration/vias-de-administracao-g01/manifest.json',
      'Handcraft por slug — gramática vias-pedagogy-errors.json',
      'npm run enrich:vias-guideline-meta -- --lote=vias-de-administracao-g01 --write',
      'npm run validate:goldens -- --lote=vias-de-administracao-g01 --strict',
      'npm run audit:questao-readiness -- --lote=vias-de-administracao-g01 --strict-v2-pedagogy',
      'npm run audit:slug-alignment -- --lote=vias-de-administracao-g01 --strict',
      'npm run audit:numeric-factcheck -- --lote=vias-de-administracao-g01',
      'npm run catalog:patch-pedagogical-branch -- --lote=vias-de-administracao-g01 --reconcile-branch --apply',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:vias-de-administracao-g01] lote=${lote} slugs=${picked.length}`);
  console.log(`[plan:vias-de-administracao-g01] slugs_file=${slugsFile}`);
  console.log(
    `[plan:vias-de-administracao-g01] pool correta=${correta.length} vf=${vf.length} indicacao=${indicacao.length} excluded=${exclude.size}`,
  );
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:vias-de-administracao-g01] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
