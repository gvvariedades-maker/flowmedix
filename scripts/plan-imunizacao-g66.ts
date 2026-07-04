#!/usr/bin/env tsx
/**
 * Seleciona slugs para imunizacao-g66 (P1 pós-calendário) a partir do cluster report.
 * Pool P0 calendário esgotado em g42 — g66 usa cadeia de frio, EXCETO, V/F intervalos e genérico.
 *
 *   npm run plan:imunizacao-g66
 *   npm run catalog:export-lote -- --lote=imunizacao-g66 --from-manifest=data/catalog-migration/imunizacao-g66/manifest.json
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

const CADEIA_FRIO = 'Cadeia de frio / conservação / SI-PNI';
const EXCETO = 'INCORRETA / EXCETO';
const VF_INTERVALOS = 'V/F — intervalos PNI (I/II/III/IV)';
const GENERICO_CLUSTERS = new Set([
  'Default — sem âncora temática',
  'Certo ou errado',
  'Técnica de aplicação / sala de vacinação',
  'Conceito — tipos de vacina / imunobiológicos',
  'Contraindicações / eventos adversos',
]);

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed?: string;
};

type HandcraftMeta = {
  handcraft_ready_lotes?: Record<string, { status?: string }>;
};

function loadCompletoSlugs(): Set<string> {
  const completoManifest = resolve(
    process.cwd(),
    'data/catalog-migration/imunizacao-completo/manifest.json',
  );
  if (!existsSync(completoManifest)) return new Set();
  const m = JSON.parse(readFileSync(completoManifest, 'utf8')) as {
    slugs?: string[];
    questoes?: string[];
  };
  return new Set(m.slugs ?? m.questoes ?? []);
}

/** Exclui manifests de lotes existentes + applied artifacts — NÃO usar handcraft-meta nem exclude-done (bloqueia pool tail). */
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

function isCatalogImunizacaoSlug(slug: string, completoSlugs: Set<string>): boolean {
  if (!completoSlugs.has(slug)) return false;
  return (
    /-(enfermagem-imunizacao|geral-imunizacao)-/.test(slug) ||
    /-imunizacao-/.test(slug) ||
    /-processo-de-enfermagem-/.test(slug)
  );
}

function take(pool: string[], picked: string[], n: number): void {
  let i = 0;
  while (picked.length < n && i < pool.length) {
    const s = pool[i++]!;
    if (!picked.includes(s)) picked.push(s);
  }
}

function main(): void {
  const lote = parseArg('lote') ?? 'imunizacao-g66';
  const batchSize = Number(parseArg('size') ?? '8');
  const reportPath = resolve(process.cwd(), 'artifacts/imunizacao-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:imunizacao antes de planejar o lote.');
  }

  const completoSlugs = loadCompletoSlugs();
  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs(lote);

  const cadeiaFrio: string[] = [];
  const exceto: string[] = [];
  const vfIntervalos: string[] = [];
  const generico: string[] = [];

  for (const row of report.rows) {
    if (CALENDARIO_CLUSTERS.has(row.pedagogical_cluster)) continue;
    if (!isCatalogImunizacaoSlug(row.modulo_slug, completoSlugs)) continue;
    if (exclude.has(row.modulo_slug)) continue;

    switch (row.pedagogical_cluster) {
      case CADEIA_FRIO:
        cadeiaFrio.push(row.modulo_slug);
        break;
      case EXCETO:
        exceto.push(row.modulo_slug);
        break;
      case VF_INTERVALOS:
        vfIntervalos.push(row.modulo_slug);
        break;
      default:
        if (GENERICO_CLUSTERS.has(row.pedagogical_cluster)) {
          generico.push(row.modulo_slug);
        }
        break;
    }
  }

  const picked: string[] = [];
  const targetCadeia = Math.min(4, batchSize);
  const targetExceto = Math.min(2, Math.max(0, batchSize - targetCadeia));
  const targetVf = Math.min(1, Math.max(0, batchSize - targetCadeia - targetExceto));
  const targetGenerico = batchSize - targetCadeia - targetExceto - targetVf;

  take(cadeiaFrio, picked, targetCadeia);
  take(exceto, picked, targetCadeia + targetExceto);
  take(vfIntervalos, picked, targetCadeia + targetExceto + targetVf);
  take(generico, picked, batchSize);

  if (picked.length < batchSize) {
    const overflow: string[] = [];
    for (const pool of [cadeiaFrio, exceto, vfIntervalos, generico]) {
      for (const s of pool) {
        if (picked.length + overflow.length >= batchSize) break;
        if (!picked.includes(s) && !overflow.includes(s)) overflow.push(s);
      }
    }
    picked.push(...overflow.slice(0, batchSize - picked.length));
  }

  if (picked.length < batchSize) {
    throw new Error(
      `Só ${picked.length} slugs P1/P2 disponíveis (cadeia=${cadeiaFrio.length} exceto=${exceto.length} vf=${vfIntervalos.length} gen=${generico.length}; excluídos ${exclude.size}).`,
    );
  }

  const clusterBySlug = new Map<string, string>();
  for (const row of report.rows) {
    clusterBySlug.set(row.modulo_slug, row.pedagogical_cluster);
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const slugsFile = resolve(loteDir, 'g66-slugs.json');
  writeFileSync(slugsFile, JSON.stringify(picked, null, 2), 'utf8');

  const manifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      exclude_calendario: true,
      calendario_pool_exhausted_at: 'imunizacao-g42',
      clusters: [CADEIA_FRIO, EXCETO, VF_INTERVALOS, ...GENERICO_CLUSTERS],
      exclude_count: exclude.size,
      mix: '4 cadeia frio + 2 EXCETO + 1 V/F intervalos + 1 genérico',
    },
    slugs: picked,
    slug_clusters: Object.fromEntries(
      picked.map((s) => [s, clusterBySlug.get(s) ?? 'unknown']),
    ),
  };
  writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote,
    subtopico: 'Imunização',
    status: 'planned',
    priority: 'P1 — pós-calendário (cadeia frio + EXCETO + V/F + genérico)',
    slug_count: picked.length,
    pedagogical_branch_target:
      'mixed — imunizacao_cadeia_frio · imunizacao_exceto · imunizacao_vf_intervalos · imunizacao_generico',
    anchors: [
      'examples/questao-premium-avancasp-imunizacao-rede-frio-temperatura.json',
      'examples/questao-premium-ameosc-imunizacao-vf-cadeia-frio.json',
      'examples/questao-premium-agirh-imunizacao-incorreta-antibiotico.json',
      'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json',
      'examples/questao-premium-decorp-imunizacao-triplice-viral-via.json',
    ],
    anchor_slug: picked[0],
    handcraft_grammar: 'data/catalog-migration/imunizacao-pedagogy-errors.json',
    notes:
      'Planejado 2026-07-03 — pool P0 calendário esgotado (g42). g43/g44 superseded. g66 exclusivamente P1/P2 pós g65. Evitar palavra “termo” isolada (false trigger drift).',
    workflow: [
      'npm run plan:imunizacao-g66',
      'npm run catalog:export-lote -- --lote=imunizacao-g66 --from-manifest=data/catalog-migration/imunizacao-g66/manifest.json',
      'Handcraft por slug — gramática imunizacao-pedagogy-errors.json',
      'npm run audit:questao-readiness -- --lote=imunizacao-g66 --strict-v2-pedagogy',
      'npm run audit:slug-alignment -- --lote=imunizacao-g66 --strict',
      'npm run audit:numeric-factcheck -- --lote=imunizacao-g66',
      'npm run validate:goldens -- --strict --lote=imunizacao-g66',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:imunizacao-g66] lote=${lote} slugs=${picked.length}`);
  console.log(
    `[plan:imunizacao-g66] pools: cadeia=${cadeiaFrio.length} exceto=${exceto.length} vf=${vfIntervalos.length} gen=${generico.length}`,
  );
  console.log(`[plan:imunizacao-g66] slugs_file=${slugsFile}`);
  for (const s of picked) {
    console.log(`  · ${s} [${clusterBySlug.get(s) ?? '?'}]`);
  }
  console.log(
    `[plan:imunizacao-g66] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
