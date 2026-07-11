#!/usr/bin/env tsx
/**
 * Remove slugs DRIFT do export completo de Cuidados na Administração de Medicamentos.
 * Usa o relatório de cluster (pedagogical_cluster.startsWith('DRIFT')).
 *
 *   npm run curate:cuidados-na-administracao-de-medicamentos
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = process.cwd();
const COMPLETO_DIR = join(
  ROOT,
  'data/catalog-migration/cuidados-na-administracao-de-medicamentos-completo',
);
const CLUSTER_REPORT = join(
  ROOT,
  'artifacts/cuidados-na-administracao-de-medicamentos-topic-cluster-report.json',
);
const EXCLUDE_OUT = join(
  ROOT,
  'data/catalog-migration/cuidados-na-administracao-de-medicamentos-exclude-drift.json',
);

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
};

type CatalogEntry = {
  modulo_slug: string;
  titulo_aula: string;
  modulo_nome: string;
  banca: string;
  avant_codigo: number;
};

function main(): void {
  const report = JSON.parse(readFileSync(CLUSTER_REPORT, 'utf8')) as {
    rows: ClusterRow[];
  };

  const driftSlugs = report.rows
    .filter((r) => r.pedagogical_cluster.startsWith('DRIFT'))
    .map((r) => r.modulo_slug);

  const driftSet = new Set(driftSlugs);
  const manifestPath = join(COMPLETO_DIR, 'manifest.json');
  const catalogPath = join(COMPLETO_DIR, 'catalog.json');

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    lote: string;
    exported_at: string;
    source: string;
    filters: Record<string, unknown>;
    slugs: string[];
  };

  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8')) as {
    exported_at: string;
    lote: string;
    total: number;
    entries: CatalogEntry[];
  };

  const before = manifest.slugs.length;
  const keptSlugs = manifest.slugs.filter((s) => !driftSet.has(s));
  const keptEntries = catalog.entries.filter((e) => !driftSet.has(e.modulo_slug));

  if (keptSlugs.length + driftSet.size < before) {
    console.warn(
      `[curate:cuidados] aviso: ${before - keptSlugs.length - driftSlugs.length} slugs não classificados no cluster report`,
    );
  }

  const now = new Date().toISOString();
  manifest.slugs = keptSlugs;
  manifest.exported_at = now;
  manifest.filters = {
    ...manifest.filters,
    curated_at: now,
    exclude_drift: true,
    drift_excluded_count: driftSlugs.length,
  };

  catalog.entries = keptEntries;
  catalog.total = keptEntries.length;
  catalog.exported_at = now;

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

  const excludeDoc = {
    generated_at: now,
    subtopico: 'Cuidados na Administração de Medicamentos',
    source_report: 'artifacts/cuidados-na-administracao-de-medicamentos-topic-cluster-report.json',
    drift_total: driftSlugs.length,
    slugs_before: before,
    slugs_after: keptSlugs.length,
    slugs: driftSlugs.sort(),
  };
  writeFileSync(EXCLUDE_OUT, `${JSON.stringify(excludeDoc, null, 2)}\n`, 'utf8');

  const questionsDir = join(COMPLETO_DIR, 'questions');
  let removedQuestions = 0;
  if (existsSync(questionsDir)) {
    for (const file of readdirSync(questionsDir).filter((f) => f.endsWith('.json'))) {
      const slug = file.replace(/\.json$/, '');
      if (driftSet.has(slug)) {
        unlinkSync(join(questionsDir, file));
        removedQuestions += 1;
      }
    }
  }

  console.log(
    `[curate:cuidados-na-administracao-de-medicamentos] before=${before} drift=${driftSlugs.length} after=${keptSlugs.length} questions_removed=${removedQuestions}`,
  );
  console.log(`[curate:cuidados-na-administracao-de-medicamentos] exclude=${EXCLUDE_OUT}`);
}

main();
