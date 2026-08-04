#!/usr/bin/env tsx
/**
 * F6 — condição de retorno das fases estacionadas do NeuroCanvas.
 *
 *   npm run audit:neurocanvas-phase-gate            # report
 *   npm run audit:neurocanvas-phase-gate -- --strict  # exit 1 se a Fase 0B não pode retomar
 *
 * Lê só artefatos (F5 + leitor cego): não precisa de catálogo local, Supabase nem LLM.
 * Para o quadro completo com unresolved/S3/live, rodar `write:neurocanvas-g02-reconciliation`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  loadPhaseResumptionGate,
  renderPhaseResumptionMarkdown,
} from '@/lib/neurocanvas/phaseResumptionGate';

function main() {
  const gate = loadPhaseResumptionGate({
    provenance: parseArg('provenance'),
    content: parseArg('content'),
  });

  const dir = resolve(process.cwd(), 'artifacts');
  mkdirSync(dir, { recursive: true });

  const outJson = resolve(dir, 'neurocanvas-phase-gate.json');
  const outMd = resolve(dir, 'neurocanvas-phase-gate.md');
  writeFileSync(
    outJson,
    JSON.stringify({ generated_at: new Date().toISOString(), ...gate }, null, 2),
    'utf8',
  );
  writeFileSync(outMd, renderPhaseResumptionMarkdown(gate), 'utf8');

  console.log(`[phase-gate] Fase 0B retomável: ${gate.phase_0b.resumable ? 'sim' : 'não'}`);
  for (const blocker of gate.phase_0b.blockers) console.log(`[phase-gate]   0B · ${blocker}`);
  console.log(`[phase-gate] Fase 2 retomável: ${gate.phase_2.resumable ? 'sim' : 'não'}`);
  for (const blocker of gate.phase_2.blockers) console.log(`[phase-gate]   2  · ${blocker}`);
  console.log('[phase-gate] json=', outJson);
  console.log('[phase-gate] md=', outMd);

  if (hasFlag('strict') && !gate.phase_0b.resumable) {
    console.error('[phase-gate] --strict: Fase 0B ainda estacionada (F6).');
    process.exitCode = 1;
  }
}

main();
