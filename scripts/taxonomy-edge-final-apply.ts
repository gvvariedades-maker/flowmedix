#!/usr/bin/env tsx
/**
 * Aplica decisões manuais de revisão edge (taxonomy-edge-final-decisions.json).
 */
import { loadEnvConfig } from '@next/env';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import { applySubtopicoLabelToPayload } from '@/lib/catalogMigration/reclassifySubtopico';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { hasFlag } from '@/lib/catalogMigration/cliArgs';

type Decision = {
  modulo_slug: string;
  from: string;
  to: string;
  rationale: string;
};

async function main() {
  const dryRun = hasFlag('dry-run');
  const path = resolve(process.cwd(), 'artifacts/taxonomy-edge-final-decisions.json');
  const { decisions } = JSON.parse(readFileSync(path, 'utf8')) as { decisions: Decision[] };

  if (dryRun) {
    console.log(JSON.stringify(decisions, null, 2));
    return;
  }

  const supabase = await createServerSupabase();
  let applied = 0;
  const errors: Array<{ slug: string; reason: string }> = [];

  for (const d of decisions) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, titulo_aula, conteudo_json')
      .eq('modulo_slug', d.modulo_slug)
      .single();

    if (error || !data) {
      errors.push({ slug: d.modulo_slug, reason: error?.message ?? 'not found' });
      continue;
    }

    const result = applySubtopicoLabelToPayload(data.conteudo_json, d.to, data.titulo_aula);
    if (!result.changed || !result.zodValid) {
      errors.push({ slug: d.modulo_slug, reason: result.zodMessage ?? result.skipReason ?? 'apply_failed' });
      continue;
    }

    const { error: upErr } = await supabase
      .from('modulos_estudo')
      .update({ titulo_aula: d.to, conteudo_json: result.payload })
      .eq('id', data.id);

    if (upErr) {
      errors.push({ slug: d.modulo_slug, reason: upErr.message });
      continue;
    }

    applied += 1;
    console.log(`  OK ${d.modulo_slug} — ${d.from} → ${d.to}`);
  }

  try {
    await invalidateModulosCache();
    await invalidateQuestoesCache();
  } catch {
    console.warn('[taxonomy-edge-final-apply] Cache não invalidado.');
  }

  const out = { applied, failed: errors.length, errors };
  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
  writeFileSync(resolve(process.cwd(), 'artifacts/taxonomy-edge-final-applied.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error('[taxonomy-edge-final-apply]', err);
  process.exitCode = 1;
});
