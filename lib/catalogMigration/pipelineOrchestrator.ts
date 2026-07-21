/**
 * Orquestrador: next-unit + verificação de gates + invocação Cursor SDK (1 run = 1 unidade).
 * @see docs/PIPELINE_ORCHESTRATOR.md
 */
import { spawnSync } from 'node:child_process';

import {
  buildWorkerPrompt,
  type WorkerPromptOptions,
} from '@/lib/catalogMigration/pipelineWorkerPrompt';
import {
  defaultMaxUnitsForSlugCount,
  loadRunState,
  refreshRunState,
  saveRunState,
  type PipelineRunState,
  type PipelineUnit,
} from '@/lib/catalogMigration/pipelineRunState';

export type OrchestrateOptions = {
  subtopico: string;
  mode?: PipelineRunState['mode'];
  /** Imprime prompt e sai (sem SDK). */
  dryRun?: boolean;
  /** Dispara Agent.prompt do @cursor/sdk. */
  runSdk?: boolean;
  maxUnits?: number;
  autoApply?: boolean;
  /** Roda gates npm após handcraft (quando --verify). */
  verifyGates?: boolean;
  forceUnit?: PipelineUnit | null;
  model?: string;
  apiKey?: string;
  cwd?: string;
  /** Se true, após SDK success marca unidade completed e recalcula next. */
  advanceOnSuccess?: boolean;
};

export type OrchestrateUnitResult = {
  unit: PipelineUnit;
  prompt: string;
  state: PipelineRunState;
  sdk?: {
    agentId?: string;
    runId?: string;
    status?: string;
    resultText?: string;
  };
  gateExit?: number | null;
  exitCode: number;
};

export type OrchestrateResult = {
  results: OrchestrateUnitResult[];
  finalState: PipelineRunState;
  stoppedReason: 'done' | 'blocked' | 'max_units' | 'fail' | 'dry_run';
};

function runNpmScript(args: string[], cwd: string): number {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const res = spawnSync(npm, ['run', ...args], {
    cwd,
    encoding: 'utf8',
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  return res.status ?? 1;
}

export function verifyHandcraftLoteGates(lote: string, cwd: string): number {
  const steps: string[][] = [
    ['audit:questao-readiness', `--lote=${lote}`, '--strict-v2-pedagogy'],
    ['validate:goldens', `--lote=${lote}`, '--strict'],
    ['catalog:preflight', `--lote=${lote}`, '--strict-v2-pedagogy'],
  ];
  for (const step of steps) {
    console.log(`\n[orchestrator:verify] npm run ${step.join(' ')}`);
    // npm run X -- args → pass as: run, script, --, ...args
    const [script, ...rest] = step;
    const code = runNpmScript([script!, '--', ...rest], cwd);
    if (code !== 0) return code;
  }
  return 0;
}

async function invokeCursorSdk(params: {
  prompt: string;
  apiKey: string;
  model: string;
  cwd: string;
}): Promise<{ agentId?: string; runId?: string; status: string; resultText?: string }> {
  // Dynamic import — package is optional until `npm i @cursor/sdk`.
  let Agent: typeof import('@cursor/sdk').Agent;
  let CursorAgentError: typeof import('@cursor/sdk').CursorAgentError;
  try {
    const mod = await import('@cursor/sdk');
    Agent = mod.Agent;
    CursorAgentError = mod.CursorAgentError;
  } catch {
    throw new Error(
      'Pacote @cursor/sdk não instalado. Rode: npm install @cursor/sdk --save-optional',
    );
  }

  try {
    const result = await Agent.prompt(params.prompt, {
      apiKey: params.apiKey,
      model: { id: params.model },
      local: { cwd: params.cwd, settingSources: [] },
    });

    const status = String(result.status ?? 'unknown');
    const agentId =
      (result as { agentId?: string }).agentId ??
      (result as { agent_id?: string }).agent_id;
    const runId = (result as { id?: string }).id ?? (result as { runId?: string }).runId;

    console.log(`[orchestrator:sdk] status=${status} agentId=${agentId ?? '—'} runId=${runId ?? '—'}`);

    return {
      agentId,
      runId,
      status,
      resultText: typeof result.result === 'string' ? result.result : undefined,
    };
  } catch (err) {
    if (err instanceof CursorAgentError) {
      const retryable = (err as { isRetryable?: boolean }).isRetryable;
      throw new Error(
        `Cursor SDK startup failed: ${err.message} (retryable=${String(retryable)})`,
      );
    }
    throw err;
  }
}

export async function orchestratePipeline(options: OrchestrateOptions): Promise<OrchestrateResult> {
  const cwd = options.cwd ?? process.cwd();
  const previous = (() => {
    // Prefer existing run-state if pacote_prefix known from previous refresh
    const bootstrap = refreshRunState({
      subtopico: options.subtopico,
      mode: options.mode,
      forceUnit: options.forceUnit,
    });
    return loadRunState(bootstrap.pacote_prefix) ?? bootstrap;
  })();

  let state = refreshRunState({
    subtopico: options.subtopico,
    mode: options.mode ?? previous.mode,
    forceUnit: options.forceUnit,
    previous,
  });
  saveRunState(state);

  const maxUnits =
    options.maxUnits ?? defaultMaxUnitsForSlugCount(state.total_slugs || 200);
  const workerOpts: WorkerPromptOptions = {
    autoApply: options.autoApply === true,
    includeVisualMolds: true,
  };

  const results: OrchestrateUnitResult[] = [];
  let stoppedReason: OrchestrateResult['stoppedReason'] = 'max_units';

  for (let i = 0; i < maxUnits; i++) {
    const unit = state.next_unit;
    if (!unit) {
      stoppedReason = 'done';
      break;
    }
    if (unit.type === 'done') {
      results.push({
        unit,
        prompt: buildWorkerPrompt(state, unit, workerOpts),
        state,
        exitCode: 0,
      });
      stoppedReason = 'done';
      break;
    }
    if (unit.type === 'blocked') {
      results.push({
        unit,
        prompt: buildWorkerPrompt(state, unit, workerOpts),
        state,
        exitCode: 1,
      });
      stoppedReason = 'blocked';
      break;
    }

    const prompt = buildWorkerPrompt(state, unit, workerOpts);
    console.log(`\n════════ UNIT ${i + 1}/${maxUnits}: ${unit.type}:${unit.id} ════════\n`);
    console.log(prompt);
    console.log('\n════════════════════════════════════════════════════\n');

    if (options.dryRun || !options.runSdk) {
      results.push({ unit, prompt, state, exitCode: 0 });
      stoppedReason = options.dryRun ? 'dry_run' : 'max_units';
      // Sem SDK: uma unidade por invocação (imprimir e sair).
      break;
    }

    const apiKey = (options.apiKey ?? process.env.CURSOR_API_KEY ?? '').trim();
    if (!apiKey) {
      throw new Error('CURSOR_API_KEY ausente. Defina no ambiente ou --api-key=');
    }
    const model = options.model ?? process.env.CURSOR_ORCHESTRATOR_MODEL ?? 'composer-2.5';

    let sdkMeta: OrchestrateUnitResult['sdk'];
    let exitCode = 0;
    try {
      sdkMeta = await invokeCursorSdk({ prompt, apiKey, model, cwd });
      if (sdkMeta.status !== 'finished' && sdkMeta.status !== 'success') {
        // SDK may use "finished" | "error" | others — treat non-finished as fail.
        if (sdkMeta.status === 'error' || sdkMeta.status === 'cancelled') {
          exitCode = 2;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      state = refreshRunState({
        subtopico: options.subtopico,
        mode: state.mode,
        previous: state,
        blockers: [...state.blockers, msg],
        lastExit: 1,
        lastError: msg,
      });
      saveRunState(state);
      results.push({ unit, prompt, state, exitCode: 1 });
      stoppedReason = 'fail';
      break;
    }

    let gateExit: number | null = null;
    if (options.verifyGates && unit.type === 'handcraft_lote' && unit.lote && exitCode === 0) {
      gateExit = verifyHandcraftLoteGates(unit.lote, cwd);
      if (gateExit !== 0) exitCode = gateExit;
    }

    if (exitCode !== 0) {
      state = refreshRunState({
        subtopico: options.subtopico,
        mode: state.mode,
        previous: state,
        blockers: [
          ...state.blockers,
          `unit ${unit.type}:${unit.id} failed (exit=${exitCode}, sdk=${sdkMeta?.status})`,
        ],
        lastExit: exitCode,
        lastError: `sdk status=${sdkMeta?.status}`,
        lastAgentId: sdkMeta?.agentId ?? null,
        lastRunId: sdkMeta?.runId ?? null,
      });
      saveRunState(state);
      results.push({ unit, prompt, state, sdk: sdkMeta, gateExit, exitCode });
      stoppedReason = 'fail';
      break;
    }

    if (options.advanceOnSuccess !== false) {
      const completedKey = `${unit.type}:${unit.id}`;
      state = refreshRunState({
        subtopico: options.subtopico,
        mode: state.mode,
        previous: state,
        markCompleted: completedKey,
        lastExit: 0,
        lastError: null,
        lastAgentId: sdkMeta?.agentId ?? null,
        lastRunId: sdkMeta?.runId ?? null,
        blockers: [],
      });
      saveRunState(state);
    }

    results.push({ unit, prompt, state, sdk: sdkMeta, gateExit, exitCode: 0 });
  }

  if (results.length >= maxUnits && stoppedReason === 'max_units') {
    // keep
  }

  return { results, finalState: state, stoppedReason };
}
