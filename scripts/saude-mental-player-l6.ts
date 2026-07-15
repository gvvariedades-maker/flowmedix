#!/usr/bin/env tsx
/**
 * L6 player — captures /estudar para slugs A4 handcraft-qc (Saúde Mental).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTES = [
  'saude-mental-micro-01-goldens',
  'saude-mental-micro-02-goldens',
  'saude-mental-micro-03-goldens',
  'saude-mental-micro-04-goldens',
  'saude-mental-micro-05-goldens',
  'saude-mental-micro-06-goldens',
  'saude-mental-micro-07-goldens',
  'saude-mental-completo',
];

function captureSlug(slug: string): boolean {
  const r = spawnSync('npx', ['tsx', 'scripts/capture-questao-review.ts', `--slug=${slug}`], {
    cwd: process.cwd(),
    shell: true,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  return r.status === 0;
}

function humanSlugs(): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const lote of LOTES) {
    const dir = loteQuestionsDir(lote);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      const slug = file.replace(/\.json$/, '');
      if (seen.has(slug)) continue;
      const raw = JSON.parse(readFileSync(join(dir, file), 'utf8')) as {
        meta?: { efficacy_contract?: { a4_reviewer?: string } };
      };
      if (raw.meta?.efficacy_contract?.a4_reviewer === 'handcraft-qc') {
        seen.add(slug);
        slugs.push(slug);
      }
    }
  }
  return slugs.sort();
}

function main(): void {
  const human = humanSlugs();
  console.log(`[saude-mental-player-l6] handcraft-qc slugs=${human.length}`);

  let captured = 0;
  for (const slug of human) {
    if (captureSlug(slug)) captured++;
  }
  console.log(`[saude-mental-player-l6] captures_ok=${captured}/${human.length}`);
  if (captured !== human.length) process.exitCode = 1;
}

main();
