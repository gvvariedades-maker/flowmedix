#!/usr/bin/env tsx
/**
 * Preenche meta.pedagogical_branch (e opcionalmente meta.family) nos JSONs de um lote
 * ou em massa no Supabase (inferência L2.5).
 *
 *   npm run catalog:patch-pedagogical-branch -- --lote=saude-adolescente-completo
 *   npm run catalog:patch-pedagogical-branch -- --lote=saude-adolescente-completo --dry-run
 *   npm run catalog:patch-pedagogical-branch -- --from-supabase --dry-run
 *   npm run catalog:patch-pedagogical-branch -- --from-supabase --apply
 *   npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico=Farmacodin --only-premium --apply
 *   npm run catalog:patch-pedagogical-branch -- --from-supabase --force-branch --subtopico=Adolescente --apply
 *   npm run catalog:patch-pedagogical-branch -- --lote=imunizacao-g07 --reconcile-branch --apply
 */
import { loadEnvConfig } from '@next/env';
import { appendFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import {
  mismatchCodes,
  patchPedagogicalMeta,
  type PatchableQuestaoPayload,
} from '@/lib/catalogMigration/patchPedagogicalMeta';
import { patchLotePedagogicalBranch } from '@/lib/catalogMigration/patchLotePedagogicalBranch';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { createServerSupabase } from '@/lib/supabase/server';

const PAGE_SIZE = 200;
const APPLY_BATCH = 50;

type PatchOptions = {
  dryRun: boolean;
  inferFamily: boolean;
  forceFamily: boolean;
  forceBranch: boolean;
  reconcileBranch?: boolean;
  onlyPremium: boolean;
  onlyGoldenV1: boolean;
};

type SlugReportLine = {
  slug: string;
  subtopico?: string;
  family_before?: string;
  family_after: string;
  branch_before?: string;
  branch_after?: string;
  pre_mismatch: string[];
  post_mismatch: string[];
  skipped_reason?: string;
  applied: boolean;
};

function buildPatchOptions(): PatchOptions & { reconcileBranch?: boolean } {
  return {
    dryRun: hasFlag('dry-run') || !hasFlag('apply'),
    inferFamily: !hasFlag('no-infer-family'),
    forceFamily: hasFlag('force-family'),
    forceBranch: hasFlag('force-branch'),
    reconcileBranch: hasFlag('reconcile-branch'),
    onlyPremium: hasFlag('only-premium'),
    onlyGoldenV1: hasFlag('only-golden-v1'),
  };
}

function patchOne(
  payload: PatchableQuestaoPayload,
  slug: string,
  opts: PatchOptions,
) {
  return patchPedagogicalMeta(payload, {
    slug,
    inferFamily: opts.inferFamily,
    forceFamily: opts.forceFamily,
    forceBranch: opts.forceBranch,
    reconcileBranch: opts.reconcileBranch,
    onlyPremium: opts.onlyPremium,
    onlyGoldenV1: opts.onlyGoldenV1,
  });
}

function writeReports(
  summary: Record<string, unknown>,
  slugLines: SlugReportLine[],
  prefix: string,
) {
  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outJson = resolve(artifactsDir, `${prefix}-supabase.json`);
  writeFileSync(outJson, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  const outJsonl = resolve(artifactsDir, `${prefix}-slugs.jsonl`);
  writeFileSync(outJsonl, '', 'utf8');
  for (const line of slugLines) {
    appendFileSync(outJsonl, `${JSON.stringify(line)}\n`, 'utf8');
  }
  console.log(`[patch-pedagogical-branch] relatório=${outJson}`);
  console.log(`[patch-pedagogical-branch] slugs=${outJsonl}`);
}

function patchLocalLote(lote: string, opts: PatchOptions) {
  const result = patchLotePedagogicalBranch(lote, {
    dryRun: opts.dryRun,
    inferFamily: opts.inferFamily,
    forceFamily: opts.forceFamily,
    forceBranch: opts.forceBranch,
    reconcileBranch: opts.reconcileBranch,
    onlyPremium: opts.onlyPremium,
    onlyGoldenV1: opts.onlyGoldenV1,
  });

  console.log(
    `[patch-pedagogical-branch] lote=${lote} scanned=${result.scanned} ${opts.dryRun ? 'would_patch' : 'patched'}=${result.patched} reconciled=${result.reconciled} skipped=${result.skipped} dryRun=${opts.dryRun}`,
  );
  if (result.still_mismatch.length > 0) {
    console.warn(
      `[patch-pedagogical-branch] still_mismatch=${result.still_mismatch.length}: ${result.still_mismatch.slice(0, 5).join(', ')}`,
    );
  }
}

async function patchSupabase(opts: PatchOptions, subtopicoFilter?: string) {
  const supabase = await createServerSupabase();
  const filter = subtopicoFilter?.trim().toLowerCase();

  let offset = 0;
  let scanned = 0;
  let patched = 0;
  let skipped = 0;
  const slugLines: SlugReportLine[] = [];
  const pending: { id: string; slug: string; payload: PatchableQuestaoPayload }[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, modulo_slug, titulo_aula, conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Falha ao ler modulos_estudo: ${error.message}`);
    const batch = data ?? [];
    if (batch.length === 0) break;

    for (const row of batch) {
      const payload = (row.conteudo_json ?? {}) as PatchableQuestaoPayload;
      const subtopico = payload.meta?.subtopico ?? row.titulo_aula ?? '';
      if (filter && !subtopico.toLowerCase().includes(filter)) continue;

      scanned += 1;
      const result = patchOne(payload, row.modulo_slug, opts);

      const line: SlugReportLine = {
        slug: row.modulo_slug,
        subtopico,
        family_before: result.familyBefore,
        family_after: result.familyAfter,
        branch_before: result.branchBefore,
        branch_after: result.branchAfter,
        pre_mismatch: mismatchCodes(result.preMismatch),
        post_mismatch: mismatchCodes(result.postMismatch),
        skipped_reason: result.skippedReason,
        applied: false,
      };

      if (result.skippedReason && result.skippedReason !== 'unchanged') {
        skipped += 1;
        slugLines.push(line);
        continue;
      }

      if (!result.changed) {
        slugLines.push(line);
        continue;
      }

      pending.push({ id: row.id, slug: row.modulo_slug, payload });
      line.applied = !opts.dryRun;
      slugLines.push(line);
      console.log(
        `[patch-pedagogical-branch] ${opts.dryRun ? 'DRY' : 'PATCH'} ${row.modulo_slug} → ${result.branchAfter}`,
      );
      patched += 1;
    }

    offset += PAGE_SIZE;
    if (batch.length < PAGE_SIZE) break;
  }

  if (!opts.dryRun && pending.length > 0) {
    for (let i = 0; i < pending.length; i += APPLY_BATCH) {
      const chunk = pending.slice(i, i + APPLY_BATCH);
      await Promise.all(
        chunk.map(async ({ id, payload }) => {
          const { error: updateError } = await supabase
            .from('modulos_estudo')
            .update({ conteudo_json: payload })
            .eq('id', id);
          if (updateError) {
            throw new Error(`Falha ao atualizar ${id}: ${updateError.message}`);
          }
        }),
      );
    }
    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
    } catch (cacheErr) {
      console.warn(
        '[patch-pedagogical-branch] cache invalidation skipped (fora do contexto Next):',
        cacheErr instanceof Error ? cacheErr.message : cacheErr,
      );
    }
  }

  writeReports(
    {
      generated_at: new Date().toISOString(),
      mode: opts.dryRun ? 'dry-run' : 'apply',
      scanned,
      patched,
      skipped,
      subtopico_filter: filter ?? null,
      flags: {
        only_premium: opts.onlyPremium,
        only_golden_v1: opts.onlyGoldenV1,
        force_family: opts.forceFamily,
        force_branch: opts.forceBranch,
        reconcile_branch: opts.reconcileBranch,
      },
    },
    slugLines,
    'patch-pedagogical-branch',
  );

  console.log(
    `[patch-pedagogical-branch] supabase scanned=${scanned} patched=${patched} skipped=${skipped} dryRun=${opts.dryRun}`,
  );
}

async function main() {
  const fromSupabase = hasFlag('from-supabase');
  const subtopico = parseArg('subtopico');
  const opts = buildPatchOptions();

  if (fromSupabase) {
    await patchSupabase(opts, subtopico);
    return;
  }

  const lote = requireArg('lote');
  patchLocalLote(lote, opts);
}

main().catch((err) => {
  console.error('[patch-pedagogical-branch]', err);
  process.exitCode = 1;
});
