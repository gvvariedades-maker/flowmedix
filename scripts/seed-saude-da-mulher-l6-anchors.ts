#!/usr/bin/env tsx
/**
 * Backfill anchor_slug + anchor_second_review para lotes saude-da-mulher-g*.
 * Depois: npm run audit:anchor-review -- --lote=<lote> --record-pass --skip-capture --reviewer=agent
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadLoteMeta, saveLoteMeta } from '@/lib/catalogMigration/anchorReview';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const PREFIX = 'saude-da-mulher';

function firstSlug(lote: string): string | null {
  const manifestPath = loteManifestPath(lote);
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { slugs?: string[] };
    if (manifest.slugs?.[0]) return manifest.slugs[0];
  }
  const qDir = loteQuestionsDir(lote);
  if (existsSync(qDir)) {
    const files = readdirSync(qDir).filter((f) => f.endsWith('.json')).sort();
    if (files[0]) return files[0].replace(/\.json$/, '');
  }
  return null;
}

function main(): void {
  const root = resolve(process.cwd(), 'data/catalog-migration');
  const lotes = readdirSync(root)
    .filter((n) => n.startsWith(`${PREFIX}-g`))
    .sort((a, b) => {
      const na = Number(a.match(/g(\d+)$/)?.[1] ?? 0);
      const nb = Number(b.match(/g(\d+)$/)?.[1] ?? 0);
      return na - nb;
    });

  let updated = 0;
  for (const lote of lotes) {
    const slug = firstSlug(lote);
    if (!slug) {
      console.warn(`[seed:sm-l6] SKIP ${lote} — sem slug`);
      continue;
    }
    const meta = loadLoteMeta(lote) ?? { lote, subtopico: 'Saúde da Mulher' };
    const before = meta.anchor_slug;
    meta.anchor_slug = slug;
    if (!meta.anchor_second_review || meta.anchor_second_review.status !== 'pass') {
      meta.anchor_second_review = {
        reviewed_at: null,
        reviewer: null,
        method: null,
        status: 'pending',
        artifact: `artifacts/anchor-review/${lote}.json`,
      };
    }
    saveLoteMeta(lote, meta);
    updated++;
    console.log(`[seed:sm-l6] ${lote} anchor_slug=${slug}${before && before !== slug ? ` (was ${before})` : ''}`);
  }
  console.log(`[seed:sm-l6] total=${updated}`);
}

main();
