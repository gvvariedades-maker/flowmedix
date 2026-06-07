#!/usr/bin/env tsx
/**
 * Exporta pool IDECAN para simulados públicos (JSON estático em data/).
 *
 * Uso:
 *   npm run export:simulado-pool              # catálogo leve (metadata)
 *   npm run export:simulado-pool -- --slugs=a,b,c
 *   npm run export:simulado-pool -- --manifest=cg-01
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  QuestaoCompletaSchema,
  payloadContainsTecconcursosReference,
} from '@/lib/validations';
import { normalizeQuestaoSlideArrays } from '@/lib/reverseStudySlidesNormalize';

loadEnvConfig(process.cwd());

const ROOT = resolve(process.cwd(), 'data/simulados/idecan');
const CATALOG_PATH = resolve(ROOT, 'catalog.json');
const QUESTIONS_DIR = resolve(ROOT, 'questions');
const MANIFESTS_DIR = resolve(process.cwd(), 'data/simulados/manifests');

type CatalogEntry = {
  modulo_slug: string;
  titulo_aula: string | null;
  modulo_nome: string | null;
  banca: string | null;
  avant_codigo: number | null;
};

function parseSlugsArg(): string[] | null {
  const hit = process.argv.find((a) => a.startsWith('--slugs='));
  if (!hit) return null;
  return hit
    .slice('--slugs='.length)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseManifestArg(): string | null {
  const hit = process.argv.find((a) => a.startsWith('--manifest='));
  if (!hit) return null;
  return hit.slice('--manifest='.length).trim() || null;
}

function loadManifestSlugs(manifestId: string): string[] {
  const path = resolve(MANIFESTS_DIR, `${manifestId}.json`);
  if (!existsSync(path)) {
    throw new Error(`Manifest não encontrado: ${path}`);
  }
  const raw = JSON.parse(readFileSync(path, 'utf8')) as { questoes?: string[] };
  if (!Array.isArray(raw.questoes) || raw.questoes.length === 0) {
    throw new Error(`Manifest ${manifestId} sem campo questoes[]`);
  }
  return raw.questoes;
}

function validatePayload(slug: string, conteudoJson: unknown): unknown {
  if (payloadContainsTecconcursosReference(conteudoJson)) {
    throw new Error(`${slug}: referência TecConcursos`);
  }
  const normalized = normalizeQuestaoSlideArrays(
    typeof conteudoJson === 'object' && conteudoJson !== null
      ? { ...(conteudoJson as object) }
      : conteudoJson,
  );
  const parsed = QuestaoCompletaSchema.safeParse(normalized);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`${slug}: Zod inválido — ${msg}`);
  }
  return { ...parsed.data, modulo_slug: slug };
}

async function exportCatalog(supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const entries: CatalogEntry[] = [];
  let offset = 0;
  const pageSize = 500;

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, modulo_nome, banca, avant_codigo')
      .ilike('banca', 'IDECAN')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;
    const batch = (data ?? []) as CatalogEntry[];
    if (batch.length === 0) break;
    entries.push(...batch);
    offset += pageSize;
    if (batch.length < pageSize) break;
  }

  mkdirSync(dirname(CATALOG_PATH), { recursive: true });
  writeFileSync(
    CATALOG_PATH,
    JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        banca: 'IDECAN',
        total: entries.length,
        entries,
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`[export] Catálogo: ${entries.length} questões → ${CATALOG_PATH}`);
  return entries;
}

async function exportQuestions(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  slugs: string[],
) {
  mkdirSync(QUESTIONS_DIR, { recursive: true });
  let ok = 0;

  for (const slug of slugs) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, conteudo_json')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (!data?.conteudo_json) {
      console.warn(`[export] SKIP — slug não encontrado: ${slug}`);
      continue;
    }

    const payload = validatePayload(slug, data.conteudo_json);
    const outPath = resolve(QUESTIONS_DIR, `${slug}.json`);
    writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
    ok += 1;
    console.log(`[export] OK ${slug}`);
  }

  console.log(`[export] ${ok}/${slugs.length} questões em ${QUESTIONS_DIR}`);
}

async function main() {
  const supabase = await createServerSupabase();
  const manifestId = parseManifestArg();
  const slugsArg = parseSlugsArg();
  const slugsToExport = manifestId
    ? loadManifestSlugs(manifestId)
    : slugsArg;

  await exportCatalog(supabase);

  if (slugsToExport?.length) {
    await exportQuestions(supabase, slugsToExport);
  } else {
    console.log('[export] Nenhum --slugs ou --manifest — só catálogo exportado.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
