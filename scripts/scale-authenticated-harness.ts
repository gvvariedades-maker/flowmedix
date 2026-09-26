#!/usr/bin/env tsx
/**
 * Harness autenticado EWU-SCALE-1K-READINESS-001 — validação e plano apenas por padrão.
 * Não executa carga sem SCALE_HARNESS_EXECUTE=1 + SCALE_HARNESS_LOAD_TEST_AUTHORIZED=1 + --execute.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildHarnessExecutionPlan } from '@/lib/scale/authenticatedHarness/buildPlan';
import {
  assertHarnessExecutionAllowed,
  runHarnessMeasuredWindow,
} from '@/lib/scale/authenticatedHarness/execute';
import { loadSyntheticUserPool } from '@/lib/scale/authenticatedHarness/syntheticUserPool';
import { validateEnvelopeIntegrity } from '@/lib/scale/authenticatedHarness/validateEnvelope';
import type { ConcurrencyTierId } from '@/lib/scale/workloadEnvelope';

function parseArgs(argv: string[]) {
  let tier: ConcurrencyTierId = 'conservative';
  let validate = false;
  let plan = false;
  let execute = false;
  let poolFile: string | undefined;
  let outFile: string | undefined;
  let envelopePath: string | undefined;

  for (const arg of argv) {
    if (arg === '--validate') validate = true;
    else if (arg === '--plan') plan = true;
    else if (arg === '--execute') execute = true;
    else if (arg.startsWith('--tier=')) {
      const v = arg.slice('--tier='.length) as ConcurrencyTierId;
      tier = v;
    } else if (arg.startsWith('--pool=')) poolFile = arg.slice('--pool='.length);
    else if (arg.startsWith('--out=')) outFile = arg.slice('--out='.length);
    else if (arg.startsWith('--envelope=')) envelopePath = arg.slice('--envelope='.length);
  }

  if (!validate && !plan && !execute) validate = true;

  return { tier, validate, plan, execute, poolFile, outFile, envelopePath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.validate) {
    const report = validateEnvelopeIntegrity(args.envelopePath);
    const payload = { harness: 'scale-authenticated', mode: 'validate', ...report };
    console.log(JSON.stringify(payload, null, 2));
    if (!report.ok) process.exit(1);
  }

  if (args.plan || args.execute) {
    if (!args.poolFile) {
      console.error('Erro: --pool=<arquivo.json> obrigatório para --plan ou --execute');
      process.exit(1);
    }
    const pool = loadSyntheticUserPool(args.poolFile);
    const executionPlan = buildHarnessExecutionPlan({
      tier: args.tier,
      pool,
      envelopePath: args.envelopePath,
    });

    if (args.outFile) {
      const abs = resolve(process.cwd(), args.outFile);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, JSON.stringify(executionPlan, null, 2), 'utf8');
    }

    if (args.plan) {
      console.log(JSON.stringify({ harness: 'scale-authenticated', mode: 'plan', plan: executionPlan }, null, 2));
    }

    if (args.execute) {
      assertHarnessExecutionAllowed({ executeFlag: true });
      const result = await runHarnessMeasuredWindow(executionPlan, pool);
      console.log(JSON.stringify({ harness: 'scale-authenticated', mode: 'execute', result }, null, 2));
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
