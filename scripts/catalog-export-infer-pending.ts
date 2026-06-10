#!/usr/bin/env tsx
/**
 * Exporta questões de um bucket para classificação agente (lotes de N).
 *
 *   npx tsx scripts/catalog-export-infer-pending.ts --subtopico="Processo de Enfermagem"
 *   npx tsx scripts/catalog-export-infer-pending.ts --subtopico="Processo de Enfermagem" --batch-size=10 --out=artifacts/catalog-pe-pending
 */

import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import { parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import { buildInferSubtopicoPrompt } from '@/lib/catalogMigration/inferSubtopicoFromEnunciado';

const PAGE_SIZE = 200;

type ModuloRow = {
  modulo_slug: string;
  titulo_aula: string | null;
  conteudo_json: unknown;
};

export type ExportItem = {
  modulo_slug: string;
  from: string;
  instruction: string;
  textFragment: string;
  optionsPreview: string;
  prompt: string;
};

function extractQuestionFields(conteudo_json: unknown, titulo_aula: string | null) {
  const rec =
    conteudo_json && typeof conteudo_json === 'object' && !Array.isArray(conteudo_json)
      ? (conteudo_json as Record<string, unknown>)
      : {};
  const qd = (rec.question_data ?? {}) as Record<string, unknown>;
  const instruction = String(qd.instruction ?? '').trim();
  const textFragment = String(qd.text_fragment ?? '').trim();
  const options = Array.isArray(qd.options)
    ? (qd.options as { id: string; text: string }[])
        .slice(0, 5)
        .map((o) => `${o.id}) ${o.text}`)
        .join(' | ')
    : '';
  const current =
    String((rec.meta as Record<string, unknown> | undefined)?.subtopico ?? '').trim() ||
    titulo_aula?.trim() ||
    '';
  return { instruction, textFragment, optionsPreview: options, currentSubtopico: current };
}

async function fetchBucketRows(subtopico: string) {
  const supabase = await createServerSupabase();
  const rows: ModuloRow[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, conteudo_json')
      .eq('titulo_aula', subtopico)
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Falha ao ler modulos_estudo: ${error.message}`);
    const batch = (data ?? []) as ModuloRow[];
    if (batch.length === 0) break;
    rows.push(...batch);
    offset += PAGE_SIZE;
    if (batch.length < PAGE_SIZE) break;
  }

  return rows;
}

async function main() {
  const subtopico = requireArg('subtopico');
  const batchSize = Number(parseArg('batch-size') ?? '10');
  const outBase = parseArg('out') ?? `artifacts/catalog-infer-pending-${subtopico
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;

  if (!Number.isFinite(batchSize) || batchSize < 1) {
    throw new Error('--batch-size deve ser positivo');
  }

  const rows = await fetchBucketRows(subtopico);
  const items: ExportItem[] = [];

  for (const row of rows) {
    const fields = extractQuestionFields(row.conteudo_json, row.titulo_aula);
    const from = fields.currentSubtopico || subtopico;
    if (!fields.instruction) continue;

    items.push({
      modulo_slug: row.modulo_slug,
      from,
      instruction: fields.instruction,
      textFragment: fields.textFragment,
      optionsPreview: fields.optionsPreview,
      prompt: buildInferSubtopicoPrompt({
        instruction: fields.instruction,
        textFragment: fields.textFragment || undefined,
        currentSubtopico: from,
        optionsPreview: fields.optionsPreview || undefined,
      }),
    });
  }

  mkdirSync(resolve(process.cwd(), outBase), { recursive: true });

  const manifest = {
    generated_at: new Date().toISOString(),
    bucket: subtopico,
    batch_size: batchSize,
    total: items.length,
    batch_files: [] as string[],
  };

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchNum = String(Math.floor(i / batchSize) + 1).padStart(2, '0');
    const rel = `${outBase}/batch-${batchNum}.json`;
    writeFileSync(
      resolve(process.cwd(), rel),
      JSON.stringify({ batch: batchNum, bucket: subtopico, items: batch }, null, 2) + '\n',
    );
    manifest.batch_files.push(rel);
  }

  writeFileSync(
    resolve(process.cwd(), `${outBase}/manifest.json`),
    JSON.stringify(manifest, null, 2) + '\n',
  );

  console.log(JSON.stringify({ bucket: subtopico, total: items.length, batches: manifest.batch_files.length, out: outBase }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
