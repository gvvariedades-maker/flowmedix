#!/usr/bin/env tsx
/**
 * Preenche meta.subtopico vazio em 2 slugs de Noções de Anatomia (bloqueia taxonomy-gate).
 *
 *   npx tsx scripts/catalog-repair-anatomia-missing-meta.ts --dry-run
 *   npx tsx scripts/catalog-repair-anatomia-missing-meta.ts --apply
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { createServerSupabase } from '@/lib/supabase/server';

const SUB = 'Noções de Anatomia';
const SLUGS = [
  'inaz-do-para-enfermagem-nocoes-de-anatomia-1775448275334-4',
  'instituto-consulplan-enfermagem-nocoes-de-anatomia-1775448440742-3',
] as const;

async function main() {
  const apply = hasFlag('apply');
  const supabase = await createServerSupabase();
  const results: Array<Record<string, unknown>> = [];

  for (const slug of SLUGS) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, modulo_slug, titulo_aula, conteudo_json')
      .eq('modulo_slug', slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      results.push({ slug, status: 'not_found' });
      continue;
    }
    const payload = (data.conteudo_json ?? {}) as Record<string, unknown>;
    const meta = { ...((payload.meta as Record<string, unknown>) ?? {}) };
    const before = meta.subtopico ?? null;
    meta.subtopico = SUB;
    if (!meta.topico) meta.topico = 'Enfermagem';
    const next = { ...payload, meta };

    if (apply) {
      const { error: upErr } = await supabase
        .from('modulos_estudo')
        .update({ conteudo_json: next })
        .eq('id', data.id);
      if (upErr) throw upErr;
    }
    results.push({
      slug,
      status: apply ? 'patched' : 'would_patch',
      titulo_aula: data.titulo_aula,
      before,
      after: SUB,
    });
  }

  if (apply) {
    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
    } catch (err) {
      console.warn(
        '[repair-anatomia-missing-meta] cache invalidate skipped:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
  const reportPath = resolve(
    process.cwd(),
    `artifacts/catalog-repair-anatomia-missing-meta-${apply ? 'applied' : 'dry-run'}.json`,
  );
  writeFileSync(
    reportPath,
    `${JSON.stringify({ generated_at: new Date().toISOString(), apply, results }, null, 2)}\n`,
    'utf8',
  );
  console.log(`[repair-anatomia-missing-meta] apply=${apply} n=${results.length}`);
  for (const r of results) console.log(`  ${r.status} ${r.slug} ${r.before ?? '(vazio)'} → ${r.after}`);
  console.log(`[repair-anatomia-missing-meta] report=${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
