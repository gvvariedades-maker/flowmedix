#!/usr/bin/env tsx
/**
 * Backfill anchor_slug em lotes g02+ e rodar L6 anchor-review (agent pass).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const SUBTOPICO = 'Curativos e Manejo de Feridas';
const PREFIX = 'curativos-e-manejo-de-feridas';

for (let g = 2; g <= 12; g++) {
  const lote = `${PREFIX}-g${String(g).padStart(2, '0')}`;
  const metaPath = join('data/catalog-migration', lote, 'lote-meta.json');
  const qDir = join('data/catalog-migration', lote, 'questions');
  const slugs = readdirSync(qDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
  if (slugs.length === 0) {
    console.error(`no questions in ${lote}`);
    continue;
  }

  const existing = JSON.parse(readFileSync(metaPath, 'utf8')) as Record<string, unknown>;
  const anchorSlug = (existing.anchor_slug as string | undefined) ?? slugs[0]!;
  const updated = {
    ...existing,
    lote,
    subtopico: SUBTOPICO,
    anchor_slug: anchorSlug,
    total: slugs.length,
    slugs,
  };
  writeFileSync(metaPath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
  console.log(`[backfill] ${lote} anchor_slug=${anchorSlug}`);

  try {
    execSync(
      `npm run audit:anchor-review -- --lote=${lote} --record-pass --reviewer=agent`,
      { stdio: 'inherit', cwd: process.cwd() },
    );
  } catch {
    console.error(`[backfill] anchor-review FAIL ${lote}`);
    process.exitCode = 1;
  }
}

console.log('[backfill] done g02-g12');
