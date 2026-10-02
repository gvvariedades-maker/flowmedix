#!/usr/bin/env tsx
/**
 * Harness autenticado EWU-SCALE-1K-READINESS-001 — validação e plano por padrão.
 * --execute: envelope + allowlist canônicos versionados; escopo de load test vinculado; worktree limpo.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildHarnessExecutionPlan } from '@/lib/scale/authenticatedHarness/buildPlan';
import {
  assertExecuteUsesCanonicalArtifactPaths,
  loadCanonicalArtifactBinding,
} from '@/lib/scale/authenticatedHarness/canonicalArtifacts';
import {
  createAuthorizedExecutionContext,
  runHarnessMeasuredWindowAuthorized,
} from '@/lib/scale/authenticatedHarness/execute';
import {
  getGitStatusPorcelain,
  resolveRuntimeGitShaStrict,
} from '@/lib/scale/authenticatedHarness/gitExecutionBinding';
import { assertPlanHasNoRawSecrets, redactSecretsDeep } from '@/lib/scale/authenticatedHarness/redact';
import { resolveApprovedStagingForCli } from '@/lib/scale/authenticatedHarness/targetBinding';
import { loadSyntheticUserPool } from '@/lib/scale/authenticatedHarness/syntheticUserPool';
import { validateEnvelopeIntegrity } from '@/lib/scale/authenticatedHarness/validateEnvelope';
import type { ConcurrencyTierId } from '@/lib/scale/workloadEnvelope';

function readHarnessExecutionGate(cliExecute: boolean) {
  return {
    cliExecuteFlag: cliExecute,
    harnessExecuteEnv: process.env.SCALE_HARNESS_EXECUTE,
    loadTestAuthorizedEnv: process.env.SCALE_HARNESS_LOAD_TEST_AUTHORIZED,
  };
}

function parseArgs(argv: string[]) {
  let tier: ConcurrencyTierId = 'conservative';
  let validate = false;
  let plan = false;
  let execute = false;
  let poolFile: string | undefined;
  let outFile: string | undefined;
  let envelopePath: string | undefined;
  let allowlistPath: string | undefined;

  for (const arg of argv) {
    if (arg === '--validate') validate = true;
    else if (arg === '--plan') plan = true;
    else if (arg === '--execute') execute = true;
    else if (arg.startsWith('--tier=')) {
      tier = arg.slice('--tier='.length) as ConcurrencyTierId;
    } else if (arg.startsWith('--pool=')) poolFile = arg.slice('--pool='.length);
    else if (arg.startsWith('--out=')) outFile = arg.slice('--out='.length);
    else if (arg.startsWith('--envelope=')) envelopePath = arg.slice('--envelope='.length);
    else if (arg.startsWith('--staging-allowlist=')) {
      allowlistPath = arg.slice('--staging-allowlist='.length);
    }
  }

  if (!validate && !plan && !execute) validate = true;

  return { tier, validate, plan, execute, poolFile, outFile, envelopePath, allowlistPath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  assertExecuteUsesCanonicalArtifactPaths({
    execute: args.execute,
    envelopePath: args.envelopePath,
    allowlistPath: args.allowlistPath,
  });

  const approvedStaging = args.execute
    ? resolveApprovedStagingForCli({})
    : resolveApprovedStagingForCli({ allowlistPath: args.allowlistPath });

  const envelopePathForPlan = args.execute ? undefined : args.envelopePath;

  if (args.validate) {
    const report = validateEnvelopeIntegrity(envelopePathForPlan);
    const payload = {
      harness: 'scale-authenticated',
      mode: 'validate',
      staging_allowlist_app_hosts: approvedStaging.app_hosts,
      ...report,
    };
    console.log(JSON.stringify(payload, null, 2));
    if (!report.ok) process.exit(1);
  }

  if (args.plan || args.execute) {
    if (!args.poolFile) {
      console.error('Erro: --pool=<arquivo.json> obrigatório para --plan ou --execute');
      process.exit(1);
    }
    const pool = loadSyntheticUserPool(args.poolFile, approvedStaging);
    const executionPlan = buildHarnessExecutionPlan({
      tier: args.tier,
      pool,
      envelopePath: envelopePathForPlan,
    });

    const publicPlan = redactSecretsDeep(executionPlan);
    const serialized = JSON.stringify(publicPlan);
    assertPlanHasNoRawSecrets(serialized);

    if (args.outFile) {
      const abs = resolve(process.cwd(), args.outFile);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, JSON.stringify(publicPlan, null, 2), 'utf8');
    }

    if (args.plan) {
      console.log(
        JSON.stringify(
          {
            harness: 'scale-authenticated',
            mode: 'plan',
            staging_binding: {
              app_hosts: approvedStaging.app_hosts,
              supabase_hosts: approvedStaging.supabase_hosts,
            },
            plan: publicPlan,
          },
          null,
          2,
        ),
      );
    }

    if (args.execute) {
      const durationMs = Number(process.env.SCALE_HARNESS_AUTHORIZED_DURATION_MS ?? '0');
      const canonical = loadCanonicalArtifactBinding(args.tier);
      const runtimeGitSha = resolveRuntimeGitShaStrict();
      const gitWorktreePorcelain = getGitStatusPorcelain();
      const auth = createAuthorizedExecutionContext({
        gate: readHarnessExecutionGate(true),
        env: process.env,
        runtimeGitSha,
        cliTier: args.tier,
        durationMs,
        plan: executionPlan,
        pool,
        approved: approvedStaging,
        canonical,
        gitWorktreePorcelain,
      });
      const result = await runHarnessMeasuredWindowAuthorized(auth, executionPlan, pool, {
        durationMs,
        persistPoolSessionFile: args.poolFile,
      });
      const resultForLog = redactSecretsDeep(result);
      if (resultForLog.metrics?.operations) {
        resultForLog.metrics.operations = resultForLog.metrics.operations.map((op) => {
          const { latency_ms_samples: _samples, ...rest } = op;
          return rest;
        });
      }
      console.log(
        JSON.stringify({ harness: 'scale-authenticated', mode: 'execute', result: resultForLog }, null, 2),
      );
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
