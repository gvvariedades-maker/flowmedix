#!/usr/bin/env tsx
/** Lista slugs *puncao-venosa* no Supabase excluindo manifests já migrados. */
import { loadEnvConfig } from '@next/env';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import { parseArg, parseCsvArg } from '@/lib/catalogMigration/cliArgs';

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

  const mode = parseArg('mode') ?? 'slug';
  const subtopico =
    parseArg('subtopico') ?? 'Punção Venosa e Cuidados com Cateteres';

  const supabase = await createServerSupabase();
  const slugs: string[] = [];
  let offset = 0;
  const pageSize = 500;

  while (true) {
    let query = supabase.from('modulos_estudo').select('modulo_slug').order('modulo_slug', {
      ascending: true,
    });

    if (mode === 'titulo') {
      query = query.eq('titulo_aula', subtopico);
    } else {
      query = query.ilike('modulo_slug', '%puncao-venosa%');
    }

    const { data, error } = await query.range(offset, offset + pageSize - 1);

    if (error) throw new Error(error.message);
    const batch = data ?? [];
    if (batch.length === 0) break;

    for (const row of batch) {
      const slug = row.modulo_slug as string;
      if (!excluded.has(slug)) slugs.push(slug);
    }
    offset += pageSize;
    if (batch.length < pageSize) break;
  }

  const outPath = resolve(process.cwd(), 'data/catalog-migration/puncao-remaining-slugs.json');
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        description: `Punção — slugs restantes (modo=${mode})`,
        mode,
        subtopico: mode === 'titulo' ? subtopico : undefined,
        exported_at: new Date().toISOString(),
        exclude_count: excluded.size,
        slugs,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  console.log(`[list-remaining-puncao] mode=${mode} total=${slugs.length} exclude=${excluded.size}`);
  console.log(`[list-remaining-puncao] manifest=${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
