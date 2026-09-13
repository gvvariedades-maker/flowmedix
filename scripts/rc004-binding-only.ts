#!/usr/bin/env tsx
/**
 * RC-004 binding-only writer — default DRY-RUN.
 *
 * Uso:
 *   npm run rc004:binding-only -- --manifest=path --reviewer=GV --approved-at=2026-09-12
 *   npm run rc004:binding-only -- --manifest=path --reviewer=GV --approved-at=2026-09-12 --fixture-dir=...
 *
 * --apply exige --confirm-production-binding e arquitetura CAS aprovada (bloqueado por padrão).
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import {
  assertExpectedSupabaseTargetHash,
  discoverBindingOnlyCasPrimitive,
  hashSupabaseTarget,
  isBindingOnlyApplyOperationallyAllowed,
  parseBindingOnlyManifest,
  resolveBindingOnlyBatchCliSuccess,
  resolveWriterApplyModeReport,
  runRc004BindingOnlyBatch,
} from '@/lib/catalogMigration/rc004BindingOnly';
import {
  createBindingOnlyFixtureDataSource,
  createBindingOnlySupabaseApplySink,
  createBindingOnlySupabaseDataSource,
} from '@/lib/catalogMigration/rc004BindingOnlySupabase';
import { createServerSupabase } from '@/lib/supabase/server';

async function main(): Promise<void> {
  const manifestPath = requireArg('manifest');
  const reviewer = requireArg('reviewer');
  const approvedAt = requireArg('approved-at');
  const fixtureDir = parseArg('fixture-dir');
  const apply = hasFlag('apply');
  const confirmProductionBinding = hasFlag('confirm-production-binding');
  const dryRun = !apply || hasFlag('dry-run');

  if (apply && !confirmProductionBinding) {
    console.error('PRODUCTION_BINDING_REQUIRES_EXPLICIT_CONFIRMATION');
    process.exit(1);
  }

  const cas = discoverBindingOnlyCasPrimitive();
  const allowApplyArchitecture = isBindingOnlyApplyOperationallyAllowed();

  if (apply && !allowApplyArchitecture) {
    console.error('RC004_BINDING_ONLY_APPLY_BLOCKED_CAS_UNAVAILABLE');
    process.exit(1);
  }

  const rawManifest = JSON.parse(readFileSync(resolve(manifestPath), 'utf8'));
  const parsed = parseBindingOnlyManifest(rawManifest);
  if (!parsed.ok) {
    console.error('MANIFEST_INVALID', parsed.errors);
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const targetHash = hashSupabaseTarget(supabaseUrl);
  const expectedTargetHash = parseArg('expected-supabase-target-hash');

  if (apply && !fixtureDir) {
    const targetErr = assertExpectedSupabaseTargetHash(expectedTargetHash, targetHash);
    if (targetErr) {
      console.error(targetErr);
      process.exit(1);
    }
  }

  let dataSource;
  let applySink;
  if (fixtureDir) {
    dataSource = createBindingOnlyFixtureDataSource(
      fixtureDir,
      (p) => readFileSync(p, 'utf8'),
      resolve,
    );
  } else {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      throw new Error(
        'BLOCKED_ENVIRONMENT: defina SUPABASE_SERVICE_ROLE_KEY ou use --fixture-dir=...',
      );
    }
    const supabase = await createServerSupabase();
    dataSource = createBindingOnlySupabaseDataSource(supabase);
    if (apply && allowApplyArchitecture) {
      applySink = createBindingOnlySupabaseApplySink(supabase);
    }
  }

  const batch = await runRc004BindingOnlyBatch(
    parsed.manifest,
    dataSource,
    {
      reviewer,
      approvedAt,
      dryRun,
      apply: apply && !dryRun,
      confirmProductionBinding,
      allowApplyArchitecture,
      failFast: hasFlag('fail-fast'),
    },
    applySink,
  );

  const stampTrue = batch.results.filter((r) => r.stampSimulated === true).length;
  const fpInvariant = batch.results.filter((r) => r.pedagogicalFpInvariant === true).length;
  const diffPass = batch.results.filter((r) => r.diffAllowlistPass === true).length;
  const directPass = batch.results.filter((r) => r.directApprovalPass === true).length;
  const fpMatch = batch.results.filter(
    (r) => r.contentFingerprint && parsed.manifest.items.some((i) => i.slug === r.slug),
  ).length;

  const report = {
    generated_at: new Date().toISOString(),
    mode: dryRun ? 'DRY_RUN' : 'APPLY',
    manifest_path: manifestPath,
    manifest_item_count: parsed.manifest.items.length,
    reviewer_masked: reviewer.length <= 2 ? '**' : `${reviewer.slice(0, 1)}***`,
    approved_at: approvedAt,
    data_source: fixtureDir ? 'FIXTURE_DIR' : 'LIVE_SUPABASE',
    cas_discovery: cas,
    totals: batch.totals,
    metrics: {
      EXPECTED_FP_MATCH: fpMatch,
      STAMP_SIMULATION_TRUE: stampTrue,
      PEDAGOGICAL_FP_INVARIANT: fpInvariant,
      DIFF_ALLOWLIST_PASS: diffPass,
      DIRECT_APPROVAL_PASS: directPass,
    },
    PRODUCTION_WRITES: batch.productionWrites,
    BATCH_ATOMICITY: batch.report.batchAtomicity,
    APPLY_FAIL_FAST: batch.report.applyFailFast,
    ATTEMPTED_ITEMS: batch.report.attemptedItems,
    SUCCESSFUL_WRITES: batch.report.successfulWrites,
    FAILED_ITEMS: batch.report.failedItems,
    PARTIAL_WRITES_COUNT: batch.report.partialWritesCount,
    ABORTED_AFTER_FAILURE: batch.report.abortedAfterFailure,
    FAILED_SLUG: batch.report.failedSlug ?? null,
    FAILED_CODE: batch.report.failedCode ?? null,
    supabase_target_hash: targetHash,
    expected_supabase_target_hash: expectedTargetHash ?? null,
    WRITER_APPLY_MODE: resolveWriterApplyModeReport({ allowApplyArchitecture }),
    results: batch.results,
  };

  const outDir = process.env.RC004_BINDING_ONLY_REPORT_DIR?.trim();
  if (outDir) {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      resolve(outDir, 'rc004-binding-only-report.json'),
      JSON.stringify(report, null, 2),
      'utf8',
    );
  }

  console.log(JSON.stringify({ ...report, results: batch.results.slice(0, 3) }, null, 2));

  const cliSuccess = resolveBindingOnlyBatchCliSuccess(
    dryRun ? 'DRY_RUN' : 'APPLY',
    parsed.manifest.items.length,
    batch,
  );

  process.exit(cliSuccess ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
