#!/usr/bin/env tsx
/**
 * Aplica JSON local de data/catalog-migration/{lote}/questions/ → modulos_estudo.
 *
 * Uso:
 *   npm run catalog:apply-lote -- --lote=pilot-goldens --dry-run
 *   npm run catalog:apply-lote -- --lote=pilot-goldens --apply
 *   npm run catalog:apply-lote -- --lote=pilot-goldens --apply --allow-insert
 *   npm run catalog:apply-lote -- --lote=imunizacao-lote-02 --apply --only-slugs-file=data/catalog-migration/imunizacao-lote-02/sub01-slugs.json
 *   npm run catalog:apply-lote -- --lote=imunizacao-g07 --apply --skip-patch-branch
 *   npm run catalog:apply-lote -- --lote=vias-de-administracao-completo --apply --skip-risk-approval
 */

import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import { applyLoteToSupabase } from '@/lib/catalogMigration/applyLote';
import { hasFlag, parseArg, parseCsvArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  validateAndNormalizeQuestao,
  type ValidatedQuestao,
} from '@/lib/catalogMigration/validatePayload';
import { runLotePreflight } from '@/lib/catalogMigration/preflightLote';
import { patchLotePedagogicalBranch } from '@/lib/catalogMigration/patchLotePedagogicalBranch';
import { requireAnchorReviewPass } from '@/lib/catalogMigration/anchorReview';
import { loadHandcraftRegistry } from '@/lib/catalogMigration/handcraftRegistry';
import {
  assertG04SlugMayEnterProduction,
  isG04SlugProductionBlocked,
} from '@/lib/neurocanvas/g04ProductionApprovals';

function resolveRiskContextFromLote(lote: string): {
  riskApprovalGate: boolean;
  riskContext: {
    productionReady: boolean;
    autoApprovalEnabled: boolean;
  };
} {
  const registry = loadHandcraftRegistry();
  const pacote = Object.values(registry.pacotes).find(
    (p) => lote === p.pacote_prefix || lote.startsWith(`${p.pacote_prefix}-`),
  );
  const auto = pacote?.auto_approval;
  const productionReady = pacote?.production_status === 'production_ready';
  const autoEnabled = auto?.enabled === true;
  const skipRiskApproval = hasFlag('skip-risk-approval');
  return {
    riskApprovalGate: !skipRiskApproval && (autoEnabled || hasFlag('risk-approval-gate')),
    riskContext: {
      productionReady,
      autoApprovalEnabled: autoEnabled || hasFlag('risk-approval-gate'),
    },
  };
}

async function main() {
  const lote = requireArg('lote');
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');
  const mode = apply && !hasFlag('dry-run') ? 'apply' : 'dry-run';
  const strictGabarito = !hasFlag('no-strict-gabarito');
  const allowInsert = hasFlag('allow-insert');
  const premiumGate = !hasFlag('allow-generic');
  const skipPreflight = hasFlag('skip-preflight');
  const skipAnchorReview = hasFlag('skip-anchor-review');

  const skipPatchBranch = hasFlag('skip-patch-branch');

  if (apply && !hasFlag('dry-run') && !skipPatchBranch) {
    const patchResult = patchLotePedagogicalBranch(lote, {
      dryRun: false,
      reconcileBranch: !hasFlag('no-reconcile-branch'),
      inferFamily: true,
    });
    console.log(
      `[catalog:apply-lote] patch-branch: patched=${patchResult.patched} reconciled=${patchResult.reconciled} still_mismatch=${patchResult.still_mismatch.length}`,
    );
  }

  if (apply && !hasFlag('dry-run') && !skipPreflight) {
    const preflight = runLotePreflight(lote, { strict: true });
    console.log(
      `[catalog:apply-lote] preflight: passed=${preflight.passed}/${preflight.total} failed=${preflight.failed}`,
    );
    if (preflight.failed > 0) {
      for (const s of preflight.slugs.filter((x) => !x.ok).slice(0, 10)) {
        console.error(`  PREFLIGHT FAIL ${s.slug}: ${s.issues[0] ?? 'erro'}`);
      }
      throw new Error(
        `Preflight falhou (${preflight.failed} slug(s)). Rode npm run catalog:preflight -- --lote=${lote} ou use --skip-preflight em emergência.`,
      );
    }

    const anchorGate = requireAnchorReviewPass(lote, { skip: skipAnchorReview });
    if (!anchorGate.skipped && anchorGate.anchor_slug) {
      console.log(
        `[catalog:apply-lote] L6 anchor_second_review=pass (${anchorGate.anchor_slug})`,
      );
    }
  }

  const questionsDir = loteQuestionsDir(lote);
  if (!existsSync(questionsDir)) {
    throw new Error(`Lote não encontrado: ${questionsDir}`);
  }

  let files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));

  const onlySlugsFile = parseArg('only-slugs-file');
  const onlySlugsCsv = parseCsvArg('only-slugs');
  let onlySlugs: Set<string> | null = null;
  if (onlySlugsFile) {
    const list = JSON.parse(readFileSync(resolve(process.cwd(), onlySlugsFile), 'utf8')) as string[];
    onlySlugs = new Set(list);
  } else if (onlySlugsCsv?.length) {
    onlySlugs = new Set(onlySlugsCsv);
  }
  if (onlySlugs) {
    files = files.filter((f) => onlySlugs!.has(f.replace(/\.json$/, '')));
  }

  if (files.length === 0) {
    throw new Error(`Nenhum JSON em ${questionsDir}`);
  }

  const items: { modulo_slug: string; payload: ValidatedQuestao }[] = [];
  const loadFailures: { file: string; reason: string }[] = [];

  for (const file of files.sort()) {
    const slug = file.replace(/\.json$/, '');
    const raw = JSON.parse(readFileSync(resolve(questionsDir, file), 'utf8'));
    const validated = validateAndNormalizeQuestao(slug, raw);
    if (!validated.ok) {
      loadFailures.push({ file, reason: validated.reason });
      continue;
    }
    items.push({ modulo_slug: slug, payload: validated.data });
  }

  // Gate G0.4 A4: slugs bloqueados (ex.: EDUCA defeituoso) não podem ir ao Supabase.
  const blockedInLote = items.filter((it) => isG04SlugProductionBlocked(it.modulo_slug));
  if (blockedInLote.length > 0) {
    for (const it of blockedInLote) {
      console.error(`[catalog:apply-lote] BLOCKED ${it.modulo_slug} — g04 production gate`);
    }
    if (apply && !hasFlag('dry-run')) {
      for (const it of blockedInLote) {
        assertG04SlugMayEnterProduction(it.modulo_slug);
      }
    }
  }

  const supabase = await createServerSupabase();
  const { riskApprovalGate, riskContext } = resolveRiskContextFromLote(lote);
  if (riskApprovalGate) {
    console.log(
      `[catalog:apply-lote] riskApprovalGate=on productionReady=${riskContext.productionReady} autoApproval=${riskContext.autoApprovalEnabled}`,
    );
  }
  const { results, appliedSlugs } = await applyLoteToSupabase(supabase, items, {
    dryRun,
    strictGabarito,
    premiumGate,
    allowInsert,
    riskApprovalGate,
    riskContext,
  });

  const allResults = [
    ...loadFailures.map((f) => ({
      modulo_slug: f.file,
      status: 'failed' as const,
      mode: 'load' as const,
      detail: f.reason,
    })),
    ...results,
  ];

  const summary = {
    generated_at: new Date().toISOString(),
    lote,
    mode,
    total_files: files.length,
    ok: allResults.filter((r) => r.status === 'ok').length,
    skipped: allResults.filter((r) => r.status === 'skipped').length,
    failed: allResults.filter((r) => r.status === 'failed').length,
    applied_slugs: appliedSlugs,
    results: allResults,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const reportPath = resolve(
    artifactsDir,
    mode === 'apply' ? `catalog-migration-${lote}-applied.json` : `catalog-migration-${lote}-dry-run.json`,
  );
  writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log(`[catalog:apply-lote] lote=${lote} mode=${mode}`);
  console.log(
    `[catalog:apply-lote] ok=${summary.ok} skipped=${summary.skipped} failed=${summary.failed}`,
  );
  for (const r of allResults) {
    console.log(`  ${r.status.toUpperCase()} ${r.modulo_slug} — ${r.detail ?? ''}`);
  }
  console.log(`[catalog:apply-lote] report=${reportPath}`);

  if (dryRun && !hasFlag('apply')) {
    console.log('[catalog:apply-lote] Dry-run concluído. Rode com --apply para gravar.');
  }

  process.exitCode = summary.failed > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
