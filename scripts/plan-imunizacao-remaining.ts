#!/usr/bin/env tsx
/**
 * Planeja lote(s) tail g76+ — slugs do manifest completo ainda fora de qualquer imunizacao-gNN.
 *
 *   npm run plan:imunizacao-remaining -- --lote=imunizacao-g76
 *   npm run plan:imunizacao-remaining -- --from=76 --to=83
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
};

const CLUSTER_PRIORITY = [
  'Cadeia de frio / conservação / SI-PNI',
  'INCORRETA / EXCETO',
  'V/F — intervalos PNI (I/II/III/IV)',
  'Calendário vacinal — infantil',
  'Calendário vacinal — adolescente/adulto/idoso',
  'Gestante / puérpera — vacinação',
  'HPV / campanhas e prevenção',
  'Certo ou errado',
  'Técnica de aplicação / sala de vacinação',
  'Conceito — tipos de vacina / imunobiológicos',
  'Contraindicações / eventos adversos',
  'Default — sem âncora temática',
];

function loadCompletoSlugs(): string[] {
  const path = resolve(process.cwd(), 'data/catalog-migration/imunizacao-completo/manifest.json');
  const m = JSON.parse(readFileSync(path, 'utf8')) as { slugs?: string[] };
  return [...(m.slugs ?? [])].sort();
}

function loadManifestSlugs(): Set<string> {
  const slugs = new Set<string>();
  const root = resolve(process.cwd(), 'data/catalog-migration');
  for (const name of readdirSync(root)) {
    if (!/^imunizacao-g\d+$/.test(name)) continue;
    const mf = resolve(root, name, 'manifest.json');
    if (!existsSync(mf)) continue;
    const m = JSON.parse(readFileSync(mf, 'utf8')) as { slugs?: string[] };
    for (const s of m.slugs ?? []) slugs.add(s);
  }
  return slugs;
}

function isImunizacaoCatalogSlug(slug: string): boolean {
  return (
    /-(enfermagem-imunizacao|geral-imunizacao)-/.test(slug) ||
    /-imunizacao-/.test(slug) ||
    /-processo-de-enfermagem-/.test(slug)
  );
}

function sortRemaining(slugs: string[], clusterBySlug: Map<string, string>): string[] {
  const rank = new Map(CLUSTER_PRIORITY.map((c, i) => [c, i]));
  return [...slugs].sort((a, b) => {
    const ra = rank.get(clusterBySlug.get(a) ?? '') ?? 99;
    const rb = rank.get(clusterBySlug.get(b) ?? '') ?? 99;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

function planOneLote(lote: string, remaining: string[], clusterBySlug: Map<string, string>): string[] {
  const batchSize = Number(parseArg('size') ?? '8');
  const sorted = sortRemaining(remaining, clusterBySlug);
  const picked = sorted.slice(0, batchSize);
  if (picked.length < batchSize) {
    throw new Error(`[plan:remaining] ${lote}: só ${picked.length} slugs restantes (precisa ${batchSize}).`);
  }

  const loteNum = lote.replace('imunizacao-g', '');
  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  writeFileSync(resolve(loteDir, `g${loteNum}-slugs.json`), JSON.stringify(picked, null, 2), 'utf8');

  const manifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'imunizacao-completo-tail',
    filters: {
      tail_after: 'imunizacao-g75',
      remaining_pool: remaining.length,
      batch_size: batchSize,
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
    priority: 'P2 — tail g76+ (slugs fora de g01–g75)',
    slug_count: picked.length,
    pedagogical_branch_target: 'mixed — conforme cluster report',
    anchors: [
      'examples/questao-premium-avancasp-imunizacao-rede-frio-temperatura.json',
      'examples/questao-premium-fundatec-meningococica-3meses.json',
      'examples/questao-premium-agirh-imunizacao-incorreta-antibiotico.json',
      'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json',
    ],
    anchor_slug: picked[0],
    handcraft_grammar: 'data/catalog-migration/imunizacao-pedagogy-errors.json',
    notes: `Tail ${new Date().toISOString().slice(0, 10)} — ${remaining.length} slugs restantes no manifest; lote cobre os próximos ${batchSize}.`,
    workflow: [
      `npm run plan:imunizacao-remaining -- --lote=${lote}`,
      `npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
      'Handcraft golden-v1 por slug',
      `npm run audit:questao-readiness -- --lote=${lote} --strict-v2-pedagogy`,
      `npm run validate:goldens -- --strict --lote=${lote}`,
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:imunizacao-remaining] ${lote} slugs=${picked.length} (pool antes=${remaining.length})`);
  for (const s of picked) console.log(`  · ${s} [${clusterBySlug.get(s) ?? '?'}]`);

  return picked;
}

function main(): void {
  const reportPath = resolve(process.cwd(), 'artifacts/imunizacao-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:imunizacao antes.');
  }
  const clusterBySlug = new Map<string, string>();
  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  for (const row of report.rows) clusterBySlug.set(row.modulo_slug, row.pedagogical_cluster);

  const inManifest = loadManifestSlugs();
  let remaining = loadCompletoSlugs().filter((s) => !inManifest.has(s));

  const from = Number(parseArg('from') ?? '0');
  const to = Number(parseArg('to') ?? '0');
  const singleLote = parseArg('lote');

  const lotes: string[] = [];
  if (singleLote) {
    lotes.push(singleLote);
  } else if (from && to) {
    for (let n = from; n <= to; n++) lotes.push(`imunizacao-g${n}`);
  } else {
    throw new Error('Use --lote=imunizacao-g76 ou --from=76 --to=83');
  }

  console.log(`[plan:imunizacao-remaining] tail pool inicial: ${remaining.length} slugs`);

  for (const lote of lotes) {
    const picked = planOneLote(lote, remaining, clusterBySlug);
    remaining = remaining.filter((s) => !picked.includes(s));
  }

  console.log(`[plan:imunizacao-remaining] restantes após planejar: ${remaining.length}`);
}

main();
