#!/usr/bin/env tsx
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const excludePath = 'data/catalog-migration/imunizacao-exclude-done.json';
const base = JSON.parse(readFileSync(excludePath, 'utf8')) as {
  description?: string;
  questoes?: string[];
};

const set = new Set(base.questoes ?? []);
const manifests = [
  'artifacts/catalog-migration-imunizacao-builder-piloto-01-applied.json',
  'artifacts/catalog-migration-imunizacao-builder-lote-01-applied.json',
  'artifacts/catalog-migration-imunizacao-builder-lote-02-applied.json',
  'artifacts/catalog-migration-cpcon-intervalos-golden-applied.json',
];

for (const manifestPath of manifests) {
  if (!existsSync(manifestPath)) continue;
  const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    applied_slugs?: string[];
    slugs?: string[];
    questoes?: string[];
  };
  const slugs = raw.applied_slugs ?? raw.slugs ?? raw.questoes ?? [];
  for (const slug of slugs) set.add(slug);
}

const before = base.questoes?.length ?? 0;
base.questoes = [...set].sort();
base.description =
  'Imunização: lotes híbridos legados + builder piloto/lote-01 + cpcon intervalos';

writeFileSync(excludePath, `${JSON.stringify(base, null, 2)}\n`);
console.log(`exclude-done: ${before} -> ${base.questoes.length} (+${base.questoes.length - before})`);
