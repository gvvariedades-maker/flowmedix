#!/usr/bin/env tsx
/**
 * Orquestra unidades do pipeline com Cursor SDK (1 Agent.prompt por unidade).
 *
 * @see docs/PIPELINE_ORCHESTRATOR.md · docs/PIPELINE_SDK_SETUP.md
 */
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { orchestratePipeline } from '@/lib/catalogMigration/pipelineOrchestrator';
import {
  parseForceUnit,
  type PipelineRunState,
} from '@/lib/catalogMigration/pipelineRunState';

async function main(): Promise<void> {
  const subtopico = parseArg('subtopico')?.trim();
  if (!subtopico) {
    console.error('[pipeline:orchestrate] Informe --subtopico="..."');
    process.exitCode = 1;
    return;
  }

  const modeRaw = parseArg('mode')?.trim() as PipelineRunState['mode'] | undefined;
  const mode =
    modeRaw === 'handcraft' ||
    modeRaw === 'l3_bespoke' ||
    modeRaw === 'ship' ||
    modeRaw === 'full'
      ? modeRaw
      : 'full';

  let forceUnit = null;
  try {
    forceUnit = parseForceUnit(parseArg('unit'));
  } catch (err) {
    console.error(`[pipeline:orchestrate] ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
    return;
  }

  const maxUnitsRaw = parseArg('max-units');
  const maxUnits = maxUnitsRaw ? Number.parseInt(maxUnitsRaw, 10) : undefined;
  if (maxUnitsRaw && (!Number.isFinite(maxUnits) || (maxUnits ?? 0) < 1)) {
    console.error('[pipeline:orchestrate] --max-units deve ser inteiro >= 1');
    process.exitCode = 1;
    return;
  }

  const dryRun = hasFlag('dry-run') || (!hasFlag('sdk') && !hasFlag('run-sdk'));
  const runSdk = hasFlag('sdk') || hasFlag('run-sdk');

  try {
    const result = await orchestratePipeline({
      subtopico,
      mode,
      dryRun,
      runSdk: runSdk && !dryRun,
      maxUnits,
      autoApply: hasFlag('auto-apply'),
      verifyGates: hasFlag('verify'),
      forceUnit,
      model: parseArg('model')?.trim(),
      apiKey: parseArg('api-key')?.trim(),
      advanceOnSuccess: !hasFlag('no-advance'),
    });

    console.log('\n[pipeline:orchestrate] resumo');
    console.log(`  stopped: ${result.stoppedReason}`);
    console.log(`  units: ${result.results.length}`);
    console.log(
      `  next: ${result.finalState.next_unit?.type ?? '—'}:${result.finalState.next_unit?.id ?? '—'}`,
    );
    console.log(
      `  run-state: artifacts/pipeline-run-state-${result.finalState.pacote_prefix}.json`,
    );

    if (result.stoppedReason === 'fail' || result.stoppedReason === 'blocked') {
      process.exitCode = result.stoppedReason === 'blocked' ? 2 : 1;
    }
  } catch (err) {
    console.error(`[pipeline:orchestrate] ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  }
}

void main();
