#!/usr/bin/env tsx
/** Lista slugs *verificacao-de-sinais-vitais* no Supabase excluindo manifests já migrados. */
import { loadEnvConfig } from '@next/env';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import { parseArg, parseCsvArg, parseLimitArg } from '@/lib/catalogMigration/cliArgs';

function loadSlugsFromManifest(manifestPath: string): string[] {
  const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    slugs?: string[];
    applied_slugs?: string[];
    questoes?: string[];
  };
  if (Array.isArray(raw.applied_slugs)) return raw.applied_slugs;
  if (Array.isArray(raw.slugs)) return raw.slugs;
  if (Array.isArray(raw.questoes)) return raw.questoes;
  return [];
}

async function main() {
  const excluded = new Set<string>();
  for (const manifestPath of parseCsvArg('exclude-manifest') ?? []) {
    for (const slug of loadSlugsFromManifest(resolve(process.cwd(), manifestPath))) {
      excluded.add(slug);
    }
  }

  const limit = parseLimitArg(10_000);
  const supabase = await createServerSupabase();
  const slugs: string[] = [];
  let offset = 0;
  const pageSize = 500;

  while (slugs.length < limit) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug')
      .ilike('modulo_slug', '%verificacao-de-sinais-vitais%')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error(error.message);
    const batch = data ?? [];
    if (batch.length === 0) break;

    for (const row of batch) {
      const slug = row.modulo_slug as string;
      if (!excluded.has(slug)) slugs.push(slug);
      if (slugs.length >= limit) break;
    }
    offset += pageSize;
    if (batch.length < pageSize) break;
  }

  const outPath = resolve(
    process.cwd(),
    parseArg('out') ?? 'data/catalog-migration/sinais-remaining-slugs.json',
  );
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        description: 'Sinais Vitais — slugs restantes (modo=slug)',
        mode: 'slug',
        exported_at: new Date().toISOString(),
        exclude_count: excluded.size,
        slugs,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  console.log(`[list-remaining-sinais] total=${slugs.length} exclude=${excluded.size}`);
  console.log(`[list-remaining-sinais] manifest=${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
