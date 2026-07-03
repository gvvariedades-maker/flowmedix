#!/usr/bin/env tsx
/**
 * Captura PNGs do fluxo questão → feedback → 4 slides (L4).
 *
 * Uso:
 *   npm run capture:questao-review -- --slug=idecan-...
 *   npm run capture:questao-review -- --slug=... --source=supabase
 *   npm run capture:questao-review -- --lote=imunizacao-g07
 *   npm run capture:questao-review -- --anchor-key=calendario_infantil
 *   npm run capture:questao-review -- --lote=imunizacao-g07 --viewport=mobile-375
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  resolveAnchorKeyReviewSlug,
  resolveLoteReviewSlug,
} from '@/lib/catalogMigration/captureLoteReview';
import { parseArg } from '@/lib/catalogMigration/cliArgs';

function resolveSlug(): { slug: string; source: string; reason: string } {
  const explicitSlug = parseArg('slug');
  if (explicitSlug) {
    return {
      slug: explicitSlug,
      source: parseArg('source') ?? 'local',
      reason: 'cli --slug',
    };
  }

  const lote = parseArg('lote');
  const anchorKey = parseArg('anchor-key');
  const anchorsRegistry =
    parseArg('anchors-registry') ?? 'data/catalog-migration/imunizacao-golden-anchors.json';

  if (anchorKey) {
    const target = resolveAnchorKeyReviewSlug(anchorsRegistry, anchorKey);
    return { slug: target.slug, source: target.source, reason: target.reason };
  }

  if (lote) {
    const target = resolveLoteReviewSlug(lote);
    return { slug: target.slug, source: target.source, reason: target.reason };
  }

  throw new Error('Informe --slug, --lote ou --anchor-key');
}

function main(): void {
  const { slug, source, reason } = resolveSlug();
  const viewport = parseArg('viewport') ?? 'desktop';
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
    CAPTURE_QUESTAO_VIEWPORT: viewport,
  };

  console.log(`[capture:questao-review] slug=${slug} source=${source} (${reason})`);
  console.log(`[capture:questao-review] viewport=${viewport}`);
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
