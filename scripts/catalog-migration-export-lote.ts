#!/usr/bin/env tsx
/**
 * Exporta lote de questões do Supabase para data/catalog-migration/{lote}/.
 *
 * Uso:
 *   npm run catalog:export-lote -- --lote=imunizacao --subtopico=Imunização
 *   npm run catalog:export-lote -- --lote=cg-01 --slugs=slug-a,slug-b
 *   npm run catalog:export-lote -- --lote=pilot --from-manifest=data/premium-pilot-manifest.json
 *   npm run catalog:export-lote -- --lote=curativos-lote-04 --subtopico=Curativos --limit=50 \
 *     --exclude-manifest=artifacts/catalog-migration-curativos-lote-02-applied.json
 */

import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import {
  hasFlag,
  parseArg,
  parseCsvArg,
  parseLimitArg,
  requireArg,
} from '@/lib/catalogMigration/cliArgs';
import {
  loteCatalogPath,
  loteDir,
  loteManifestPath,
  loteQuestionsDir,
  questionFilePath,
} from '@/lib/catalogMigration/paths';
import { validateAndNormalizeQuestao } from '@/lib/catalogMigration/validatePayload';

const PAGE_SIZE = 200;

type CatalogRow = {
  modulo_slug: string;
  titulo_aula: string | null;
  modulo_nome: string | null;
  banca: string | null;
  avant_codigo: number | null;
};

type LoteManifest = {
  lote: string;
  exported_at: string;
  source: string;
  filters: Record<string, unknown>;
  slugs: string[];
};

function loadSlugsFromManifest(manifestPath: string): string[] {
  const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    slugs?: string[];
    applied_slugs?: string[];
    items?: { modulo_slug: string; mode?: string }[];
    questoes?: string[];
  };
  if (Array.isArray(raw.applied_slugs)) return raw.applied_slugs;
  if (Array.isArray(raw.slugs)) return raw.slugs;
  if (Array.isArray(raw.questoes)) return raw.questoes;
  if (Array.isArray(raw.items)) {
    return raw.items
      .filter((i) => i.mode !== 'skip')
      .map((i) => i.modulo_slug)
      .filter(Boolean);
  }
  throw new Error(
    `Manifest sem slugs[], applied_slugs[], items[] ou questoes[]: ${manifestPath}`,
  );
}

function loadExcludedSlugs(): Set<string> {
  const excluded = new Set<string>();
  for (const slug of parseCsvArg('exclude-slugs') ?? []) {
    excluded.add(slug);
  }
  for (const manifestPath of parseCsvArg('exclude-manifest') ?? []) {
    for (const slug of loadSlugsFromManifest(manifestPath)) {
      excluded.add(slug);
    }
  }
  return excluded;
}

async function resolveSlugs(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
): Promise<{ slugs: string[]; filters: Record<string, unknown> }> {
  const slugsArg = parseCsvArg('slugs');
  const fromManifest = parseArg('from-manifest');
  const subtopico = parseArg('subtopico');
  const banca = parseArg('banca');
  const topico = parseArg('topico');
  const limit = parseLimitArg(500);

  if (slugsArg?.length) {
    return { slugs: slugsArg, filters: { slugs: slugsArg } };
  }

  if (fromManifest) {
    const slugs = loadSlugsFromManifest(fromManifest);
    return { slugs, filters: { from_manifest: fromManifest } };
  }

  const excluded = loadExcludedSlugs();
  const filters: Record<string, unknown> = {
    subtopico,
    banca,
    topico,
    limit,
    exclude_count: excluded.size,
  };
  const slugs: string[] = [];
  let offset = 0;

  while (slugs.length < limit) {
    let query = supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, modulo_nome, banca, avant_codigo')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (subtopico) query = query.eq('titulo_aula', subtopico);
    if (banca) query = query.ilike('banca', `%${banca}%`);
    if (topico) query = query.eq('modulo_nome', topico);

    const { data, error } = await query;
    if (error) throw new Error(`Falha ao listar catálogo: ${error.message}`);

    const batch = (data ?? []) as CatalogRow[];
    if (batch.length === 0) break;

    for (const row of batch) {
      if (excluded.has(row.modulo_slug)) continue;
      slugs.push(row.modulo_slug);
      if (slugs.length >= limit) break;
    }

    offset += PAGE_SIZE;
    if (batch.length < PAGE_SIZE) break;
  }

  if (slugs.length === 0) {
    throw new Error(
      'Nenhum slug encontrado. Use --slugs=, --from-manifest= ou filtros --subtopico/--banca.',
    );
  }

  return { slugs, filters };
}

async function main() {
  const lote = requireArg('lote');
  const dryRun = hasFlag('dry-run');
  const supabase = await createServerSupabase();
  const { slugs, filters } = await resolveSlugs(supabase);

  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const catalogEntries: CatalogRow[] = [];
  let ok = 0;
  let fail = 0;

  for (const slug of slugs) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, modulo_nome, banca, avant_codigo, conteudo_json')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error || !data?.conteudo_json) {
      console.warn(`[catalog:export-lote] SKIP ${slug}:`, error?.message ?? 'não encontrado');
      fail += 1;
      continue;
    }

    const validated = validateAndNormalizeQuestao(slug, data.conteudo_json);
    if (!validated.ok) {
      console.warn(`[catalog:export-lote] FAIL ${slug}:`, validated.reason);
      fail += 1;
      continue;
    }

    catalogEntries.push({
      modulo_slug: data.modulo_slug,
      titulo_aula: data.titulo_aula,
      modulo_nome: data.modulo_nome,
      banca: data.banca,
      avant_codigo: data.avant_codigo,
    });

    if (!dryRun) {
      writeFileSync(
        questionFilePath(lote, slug),
        JSON.stringify(validated.data, null, 2),
        'utf8',
      );
    }

    ok += 1;
    console.log(`[catalog:export-lote] OK ${slug}`);
  }

  const manifest: LoteManifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'supabase',
    filters,
    slugs: catalogEntries.map((e) => e.modulo_slug),
  };

  if (!dryRun) {
    writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');
    writeFileSync(
      loteCatalogPath(lote),
      JSON.stringify(
        {
          exported_at: manifest.exported_at,
          lote,
          total: catalogEntries.length,
          entries: catalogEntries,
        },
        null,
        2,
      ),
      'utf8',
    );
  }

  console.log(`[catalog:export-lote] lote=${lote} dir=${loteDir(lote)}`);
  console.log(`[catalog:export-lote] ok=${ok} fail=${fail} dryRun=${dryRun}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
