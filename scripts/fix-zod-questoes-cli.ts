#!/usr/bin/env tsx
/**
 * Corrige questões com falha Zod (slides danger_zone legados).
 */

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import { generateContentHash } from '@/lib/contentHash';
import { normalizeQuestaoCatalogPayload } from '@/lib/questaoCatalogNormalize';

const ZOD_FIX_SLUGS = [
  'fau-unicentro-enfermagem-nocoes-de-fisiologia-1775448586547-5',
  'fgv-enfermagem-nocoes-de-anatomia-1775448529213-0',
  'fundatec-enfermagem-nocoes-de-fisiologia-1775448529213-5',
  'ibade-enfermagem-nocoes-de-fisiologia-1775448615466-6',
  'ibade-enfermagem-nocoes-de-fisiologia-1775448628970-2',
  'ibade-enfermagem-nocoes-de-fisiologia-1775448628970-4',
  'ms-sarmento-enfermagem-nocoes-de-fisiologia-1775448599930-7',
];

async function main() {
  const supabase = await createServerSupabase();
  let ok = 0;
  let fail = 0;

  for (const slug of ZOD_FIX_SLUGS) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, conteudo_json')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error || !data) {
      console.error(`[fix:zod] SKIP ${slug}:`, error?.message ?? 'não encontrado');
      fail += 1;
      continue;
    }

    const result = normalizeQuestaoCatalogPayload(data.conteudo_json);
    if (!result.zodValid) {
      console.error(`[fix:zod] FAIL ${slug}:`, result.zodMessage);
      fail += 1;
      continue;
    }

    const instruction = (result.payload as { question_data: { instruction: string } }).question_data
      .instruction;
    const hash = await generateContentHash(instruction);

    let { error: updateError } = await supabase
      .from('modulos_estudo')
      .update({ conteudo_json: result.payload, content_hash: hash })
      .eq('id', data.id);

    if (updateError?.message?.includes('uniq_modulos_estudo_content_hash')) {
      const retry = await supabase
        .from('modulos_estudo')
        .update({ conteudo_json: result.payload })
        .eq('id', data.id);
      updateError = retry.error;
    }

    if (updateError) {
      console.error(`[fix:zod] UPDATE FAIL ${slug}:`, updateError.message);
      fail += 1;
      continue;
    }

    console.log(`[fix:zod] OK ${slug}`, result.changes.join(', '));
    ok += 1;
  }

  console.log(`[fix:zod] concluído: ${ok} ok, ${fail} falhas`);
  process.exitCode = fail > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
