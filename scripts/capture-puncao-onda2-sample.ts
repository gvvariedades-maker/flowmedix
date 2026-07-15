#!/usr/bin/env tsx
/** Batch capture — amostra 20% onda 2 Punção (slugs sem PNG). */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const coverage = JSON.parse(
  readFileSync(resolve('artifacts/puncao-onda2-capture-coverage.json'), 'utf8'),
) as {
  missing_must_capture: Array<{ slug: string; sampled: boolean }>;
};

const slugs = coverage.missing_must_capture.filter((r) => r.sampled).map((r) => r.slug);
const results: Array<{ slug: string; ok: boolean; code: number | null }> = [];

for (const slug of slugs) {
  const cap = resolve('artifacts/questao-review', slug);
  if (existsSync(cap) && readdirSync(cap).some((n) => n.endsWith('.png'))) {
    results.push({ slug, ok: true, code: 0 });
    continue;
  }
  console.log(`[capture-batch] ${slug}`);
  const r = spawnSync(
    'npx',
    ['tsx', 'scripts/capture-questao-review.ts', `--slug=${slug}`, '--source=local'],
    {
      cwd: resolve('.'),
      env: { ...process.env, PLAYWRIGHT_SKIP_WEBSERVER: 'true' },
      stdio: 'inherit',
      shell: true,
      timeout: 180_000,
    },
  );
  results.push({ slug, ok: r.status === 0, code: r.status });
}

const ok = results.filter((r) => r.ok).length;
console.log(`[capture-batch] done ok=${ok}/${results.length}`);
process.exit(ok === results.length ? 0 : 1);
