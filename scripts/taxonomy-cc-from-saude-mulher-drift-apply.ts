#!/usr/bin/env tsx
/**
 * Aplica reclassificação drift — Saúde da Mulher (decisions em taxonomy-cc-from-saude-mulher-drift-decisions.json).
 *
 *   npx tsx scripts/taxonomy-cc-from-saude-mulher-drift-apply.ts --dry-run
 *   npx tsx scripts/taxonomy-cc-from-saude-mulher-drift-apply.ts --apply
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import type { PatchableQuestaoPayload } from '@/lib/catalogMigration/patchPedagogicalMeta';
import { applySubtopicoLabelToPayload } from '@/lib/catalogMigration/reclassifySubtopico';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { hasSubtopicBranchDesign } from '@/lib/slides/pedagogicalBranch';
import { createServerSupabase } from '@/lib/supabase/server';

const DECISIONS_PATH = resolve('artifacts/taxonomy-cc-from-saude-mulher-drift-decisions.json');
const SM_COMPLETO_MANIFEST = resolve(
  'data/catalog-migration/saude-da-mulher-completo/manifest.json',
);

type Decision = {
  modulo_slug: string;
  from: string;
  to: string;
  rationale: string;
};

type ApplyLine = {
  slug: string;
  from: string;
  to: string;
  applied: boolean;
  skip_reason?: string;
};

function removeSlugFromManifest(manifestPath: string, slugs: Set<string>): boolean {
  if (!existsSync(manifestPath)) return false;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { slugs?: string[] };
  if (!Array.isArray(manifest.slugs)) return false;
  const before = manifest.slugs.length;
  manifest.slugs = manifest.slugs.filter((s) => !slugs.has(s));
  if (manifest.slugs.length === before) return false;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return true;
}

async function main() {
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');

  if (!existsSync(DECISIONS_PATH)) {
    throw new Error('Rode npm run classify:saude-da-mulher-drift antes.');
  }

  const { decisions } = JSON.parse(readFileSync(DECISIONS_PATH, 'utf8')) as {
    decisions: Decision[];
  };

  const supabase = await createServerSupabase();
  const lines: ApplyLine[] = [];
  const appliedSlugs = new Set<string>();

  console.log(
    `[taxonomy:cc-from-saude-mulher-drift] mode=${dryRun ? 'dry-run' : 'apply'} decisions=${decisions.length}`,
  );

  for (const d of decisions) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, titulo_aula, conteudo_json')
      .eq('modulo_slug', d.modulo_slug)
      .maybeSingle();

    if (error) {
      throw new Error(`${d.modulo_slug}: ${error.message}`);
    }

    if (!data) {
      lines.push({
        slug: d.modulo_slug,
        from: d.from,
        to: d.to,
        applied: false,
        skip_reason: 'not_found',
      });
      continue;
    }

    const tituloBefore = data.titulo_aula?.trim() ?? '';
    const result = applySubtopicoLabelToPayload(data.conteudo_json, d.to, tituloBefore || d.from);

    if (!result.changed) {
      lines.push({
        slug: d.modulo_slug,
        from: tituloBefore || d.from,
        to: d.to,
        applied: false,
        skip_reason: result.skipReason ?? 'unchanged',
      });
      continue;
    }

    const payload = result.payload as PatchableQuestaoPayload;
    if (!hasSubtopicBranchDesign(d.to) && payload.meta?.pedagogical_branch) {
      delete payload.meta.pedagogical_branch;
    }

    if (!result.zodValid) {
      lines.push({
        slug: d.modulo_slug,
        from: tituloBefore || d.from,
        to: d.to,
        applied: false,
        skip_reason: result.zodMessage ?? 'zod_invalid',
      });
      continue;
    }

    if (dryRun) {
      lines.push({
        slug: d.modulo_slug,
        from: tituloBefore || d.from,
        to: d.to,
        applied: false,
        skip_reason: 'dry-run',
      });
      continue;
    }

    const { error: updateError } = await supabase
      .from('modulos_estudo')
      .update({ titulo_aula: d.to, conteudo_json: payload })
      .eq('id', data.id);

    if (updateError) {
      throw new Error(`${d.modulo_slug}: ${updateError.message}`);
    }

    appliedSlugs.add(d.modulo_slug);
    lines.push({ slug: d.modulo_slug, from: tituloBefore || d.from, to: d.to, applied: true });
  }

  if (!dryRun && appliedSlugs.size > 0) {
    if (removeSlugFromManifest(SM_COMPLETO_MANIFEST, appliedSlugs)) {
      console.log('[taxonomy:cc-from-saude-mulher-drift] removido de saude-da-mulher-completo/manifest.json');
    }

    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
    } catch {
      console.warn('[taxonomy:cc-from-saude-mulher-drift] Cache não invalidado (CLI fora do Next).');
    }
  }

  const outPath = resolve('artifacts/taxonomy-cc-from-saude-mulher-drift-applied.json');
  mkdirSync(resolve('artifacts'), { recursive: true });
  writeFileSync(
    outPath,
    `${JSON.stringify(
      {
        applied_at: new Date().toISOString(),
        dry_run: dryRun,
        applied_count: appliedSlugs.size,
        lines,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[taxonomy:cc-from-saude-mulher-drift] applied=${appliedSlugs.size} report=${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
