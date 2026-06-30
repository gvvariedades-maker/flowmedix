#!/usr/bin/env tsx
/**
 * Captura PNGs do fluxo questão → feedback → 4 slides (L4).
 *
 * Uso:
 *   npm run capture:questao-review -- --slug=idecan-...
 *   npm run capture:questao-review -- --slug=... --source=supabase
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';

function main(): void {
  const slug = requireArg('slug');
  const source = parseArg('source') ?? 'local';
  const outDir = resolve(process.cwd(), 'artifacts/questao-review', slug);
  mkdirSync(outDir, { recursive: true });

  const specArgs = [
    'playwright',
    'test',
    'e2e/capture-questao-review.spec.ts',
    '--project=chromium',
    `--grep=${slug}`,
  ];

  const env = {
    ...process.env,
    CAPTURE_QUESTAO_SLUG: slug,
    CAPTURE_QUESTAO_SOURCE: source,
    CAPTURE_QUESTAO_OUT_DIR: outDir,
  };

  console.log(`[capture:questao-review] slug=${slug} source=${source}`);
  console.log(`[capture:questao-review] out=${outDir}`);

  const result = spawnSync('npx', specArgs, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
    env,
  });

  if (result.status !== 0) {
    console.error('[capture:questao-review] falhou');
    process.exitCode = 1;
    return;
  }

  if (existsSync(outDir)) {
    console.log(`[capture:questao-review] PNGs em ${outDir}`);
  }
}

main();
