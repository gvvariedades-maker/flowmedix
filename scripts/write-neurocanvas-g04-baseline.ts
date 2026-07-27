#!/usr/bin/env tsx
/**
 * Escreve artifacts/neurocanvas-g04-baseline.json a partir da constante versionada.
 * Não consulta Supabase; não altera manifests/registry.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { EDITORIAL_QUEUE_BASELINE_G04 } from '@/lib/neurocanvas/editorialQueueBaselineG04';

const artifactsDir = resolve(process.cwd(), 'artifacts');
mkdirSync(artifactsDir, { recursive: true });

const out = {
  ...EDITORIAL_QUEUE_BASELINE_G04,
  written_at: new Date().toISOString(),
  source_module: 'lib/neurocanvas/editorialQueueBaselineG04.ts',
  docs: 'docs/NEUROCANVAS_G04_BASELINE.md',
};

const jsonPath = resolve(artifactsDir, 'neurocanvas-g04-baseline.json');
writeFileSync(jsonPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log('[write:neurocanvas-g04-baseline]', jsonPath);
console.log(
  `  unresolved=${out.unresolved} editorial_readiness=${out.editorial_readiness} phase_0b_ready=${out.phase_0b_ready}`,
);
