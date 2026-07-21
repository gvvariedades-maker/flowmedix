#!/usr/bin/env tsx
/**
 * Calcula e persiste a próxima unidade do pipeline (anti-estouro / handoff).
 *
 * @see docs/PIPELINE_ORCHESTRATOR.md · docs/PIPELINE_SDK_SETUP.md
 */
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { buildWorkerPrompt } from '@/lib/catalogMigration/pipelineWorkerPrompt';
import {
  loadRunState,
  parseForceUnit,
  refreshRunState,
  saveRunState,
  type PipelineRunState,
} from '@/lib/catalogMigration/pipelineRunState';

function main(): void {
  const subtopico = parseArg('subtopico')?.trim();
  if (!subtopico) {
    console.error('[pipeline:next-unit] Informe --subtopico="..."');
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
      : undefined;

  let forceUnit = null;
  try {
    forceUnit = parseForceUnit(parseArg('unit'));
  } catch (err) {
    console.error(`[pipeline:next-unit] ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
    return;
  }

  const previousPrefixGuess = (() => {
    // Best-effort: refresh once to learn prefix, then load previous file.
    const boot = refreshRunState({ subtopico, mode, forceUnit });
    return loadRunState(boot.pacote_prefix);
  })();

  const state = refreshRunState({
    subtopico,
    mode,
    forceUnit,
    previous: previousPrefixGuess,
  });
  const { jsonPath, mdPath } = saveRunState(state);

  const unit = state.next_unit;
  console.log(`[pipeline:next-unit] ${state.subtopico}`);
  console.log(`  pacote_prefix: ${state.pacote_prefix}`);
  console.log(`  applied: ${state.handcraft_applied}/${state.total_slugs}`);
  console.log(`  production_status: ${state.production_status ?? '—'}`);
  console.log(`  next: ${unit?.type ?? '—'}:${unit?.id ?? '—'}`);
  if (unit?.detail) console.log(`  detail: ${unit.detail}`);
  console.log(`  json: ${jsonPath}`);
  console.log(`  md:   ${mdPath}`);

  if (hasFlag('print-prompt') && unit) {
    console.log('\n--- worker prompt ---\n');
    console.log(
      buildWorkerPrompt(state, unit, {
        autoApply: hasFlag('auto-apply'),
      }),
    );
  }

  if (unit?.type === 'blocked') process.exitCode = 2;
  if (unit?.type === 'done') process.exitCode = 0;
}

main();
