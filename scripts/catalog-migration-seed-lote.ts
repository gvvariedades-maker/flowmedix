#!/usr/bin/env tsx
/**
 * Copia goldens de examples/ para data/catalog-migration/{lote}/questions/
 * (fluxo local-first sem ler o Supabase).
 *
 * Uso:
 *   npm run catalog:seed-lote -- --lote=pilot-goldens --from-manifest=data/premium-pilot-manifest.json
 */

import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import {
  loteCatalogPath,
  loteManifestPath,
  loteQuestionsDir,
  questionFilePath,
} from '@/lib/catalogMigration/paths';
import { validateAndNormalizeQuestao } from '@/lib/catalogMigration/validatePayload';

type SeedItem = {
  id?: string;
  modulo_slug: string;
  golden_file: string;
  mode?: string;
};

function loadSeedItems(manifestPath: string): SeedItem[] {
  const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    items?: SeedItem[];
  };
  if (!Array.isArray(raw.items)) {
    throw new Error(`Manifest sem items[]: ${manifestPath}`);
  }
  return raw.items.filter((i) => i.golden_file && i.mode !== 'skip');
}

async function main() {
  const lote = requireArg('lote');
  const fromManifest = parseArg('from-manifest') ?? 'data/premium-pilot-manifest.json';
  const dryRun = hasFlag('dry-run');
  const items = loadSeedItems(fromManifest);

  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const slugs: string[] = [];
  let ok = 0;
  let fail = 0;

  for (const item of items) {
    const goldenPath = resolve(process.cwd(), 'examples', item.golden_file);
    if (!existsSync(goldenPath)) {
      console.warn(`[catalog:seed-lote] SKIP ${item.modulo_slug}: golden ausente ${item.golden_file}`);
      fail += 1;
      continue;
    }

    const raw = JSON.parse(readFileSync(goldenPath, 'utf8'));
    const validated = validateAndNormalizeQuestao(item.modulo_slug, raw);
    if (!validated.ok) {
      console.warn(`[catalog:seed-lote] FAIL ${item.modulo_slug}:`, validated.reason);
      fail += 1;
      continue;
    }

    if (!dryRun) {
      writeFileSync(
        questionFilePath(lote, item.modulo_slug),
        JSON.stringify(validated.data, null, 2),
        'utf8',
      );
    }

    slugs.push(item.modulo_slug);
    ok += 1;
    console.log(`[catalog:seed-lote] OK ${item.modulo_slug} ← ${item.golden_file}`);
  }

  if (!dryRun) {
    writeFileSync(
      loteManifestPath(lote),
      JSON.stringify(
        {
          lote,
          seeded_at: new Date().toISOString(),
          source: 'examples',
          from_manifest: fromManifest,
          slugs,
        },
        null,
        2,
      ),
      'utf8',
    );
    writeFileSync(
      loteCatalogPath(lote),
      JSON.stringify(
        {
          seeded_at: new Date().toISOString(),
          lote,
          total: slugs.length,
          entries: slugs.map((slug) => ({ modulo_slug: slug })),
        },
        null,
        2,
      ),
      'utf8',
    );
  }

  console.log(`[catalog:seed-lote] lote=${lote} ok=${ok} fail=${fail} dryRun=${dryRun}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
