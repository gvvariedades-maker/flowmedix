#!/usr/bin/env tsx
/**
 * Aplica reclassificação manual CC ← Urgências (decisões em taxonomy-cc-from-urgencias-decisions.json).
 *
 *   npx tsx scripts/taxonomy-cc-from-urgencias-apply.ts --dry-run
 *   npx tsx scripts/taxonomy-cc-from-urgencias-apply.ts --apply
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

const DECISIONS_PATH = resolve('artifacts/taxonomy-cc-from-urgencias-decisions.json');
const URGENCIAS_G33_MANIFEST = resolve('data/catalog-migration/urgencias-g33/manifest.json');
const URGENCIAS_COMPLETO_MANIFEST = resolve(
  'data/catalog-migration/urgencias-e-emergencias-completo/manifest.json',
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

  const { decisions } = JSON.parse(readFileSync(DECISIONS_PATH, 'utf8')) as {
    decisions: Decision[];
  };

  const supabase = await createServerSupabase();
  const lines: ApplyLine[] = [];
  const appliedSlugs = new Set<string>();

  console.log(
    `[taxonomy:cc-from-urgencias] mode=${dryRun ? 'dry-run' : 'apply'} decisions=${decisions.length}`,
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
      console.warn(`[taxonomy:cc-from-urgencias] SKIP ${d.modulo_slug}: não encontrado`);
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
    const result = applySubtopicoLabelToPayload(
      data.conteudo_json,
      d.to,
      tituloBefore || d.from,
    );

    if (!result.changed) {
      console.log(
        `[taxonomy:cc-from-urgencias] OK (já correto) ${d.modulo_slug} → ${d.to} (${result.skipReason})`,
      );
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

    console.log(
      `[taxonomy:cc-from-urgencias] ${dryRun ? 'DRY' : 'APPLY'} ${d.modulo_slug}\n` +
        `  ${tituloBefore || d.from} → ${d.to} (zod=${result.zodValid})`,
    );

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

    if (!dryRun) {
      const { error: upErr } = await supabase
        .from('modulos_estudo')
        .update({ titulo_aula: d.to, conteudo_json: payload })
        .eq('id', data.id);
      if (upErr) throw new Error(`${d.modulo_slug}: ${upErr.message}`);
      appliedSlugs.add(d.modulo_slug);
    }

    lines.push({
      slug: d.modulo_slug,
      from: tituloBefore || d.from,
      to: d.to,
      applied: !dryRun,
    });
  }

  if (!dryRun && appliedSlugs.size > 0) {
    if (removeSlugFromManifest(URGENCIAS_G33_MANIFEST, appliedSlugs)) {
      console.log(`[taxonomy:cc-from-urgencias] removido de urgencias-g33/manifest.json`);
    }
    if (removeSlugFromManifest(URGENCIAS_COMPLETO_MANIFEST, appliedSlugs)) {
      console.log(`[taxonomy:cc-from-urgencias] removido de urgencias-e-emergencias-completo/manifest.json`);
    }

    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
    } catch {
      console.warn('[taxonomy:cc-from-urgencias] Cache não invalidado (CLI fora do Next).');
    }
  }

  const out = resolve('artifacts/taxonomy-cc-from-urgencias-applied.json');
  mkdirSync(resolve('artifacts'), { recursive: true });
  writeFileSync(
    out,
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        mode: dryRun ? 'dry-run' : 'apply',
        applied: lines.filter((l) => l.applied).length,
        lines,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[taxonomy:cc-from-urgencias] report=${out}`);
}

main().catch((err) => {
  console.error('[taxonomy:cc-from-urgencias]', err);
  process.exitCode = 1;
});
