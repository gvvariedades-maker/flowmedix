#!/usr/bin/env tsx
/**
 * Gate G0.2 — Reconciliação operacional vs editorial.
 * Read-only Supabase; gera artifacts; não altera manifests/registry/runtime.
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import {
  buildLiveReconciliationReport,
  renderLiveReconciliationMarkdown,
} from '@/lib/neurocanvas/liveReconciliation';
import {
  buildPhaseReadinessReport,
  renderPhaseReadinessMarkdown,
} from '@/lib/neurocanvas/phaseReadiness';
import {
  buildResolverReconciliationReport,
  renderResolverReconciliationMarkdown,
} from '@/lib/neurocanvas/resolverReconciliation';
import { createServerSupabase } from '@/lib/supabase/server';

const BATCH = 80;

async function fetchLiveRows(slugs: string[]) {
  try {
    const supabase = await createServerSupabase();
    const rows: { modulo_slug: string; conteudo_json: unknown }[] = [];

    for (let i = 0; i < slugs.length; i += BATCH) {
      const batch = slugs.slice(i, i + BATCH);
      const { data, error } = await supabase
        .from('modulos_estudo')
        .select('modulo_slug, conteudo_json')
        .in('modulo_slug', batch);

      if (error) {
        return { error: `Supabase read failed: ${error.message}` };
      }
      for (const row of data ?? []) {
        rows.push({
          modulo_slug: String(row.modulo_slug),
          conteudo_json: row.conteudo_json,
        });
      }
    }

    return rows;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('SUPABASE') || msg.includes('obrigatórias')) {
      return { error: 'Credenciais Supabase não configuradas no ambiente local' };
    }
    return { error: msg };
  }
}

async function main() {
  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  console.log('[G0.2] Resolver reconciliation…');
  const resolverReconciliation = buildResolverReconciliationReport();
  writeFileSync(
    resolve(artifactsDir, 'neurocanvas-resolver-reconciliation.md'),
    renderResolverReconciliationMarkdown(resolverReconciliation),
    'utf8',
  );

  console.log('[G0.2] Live reconciliation (read-only)…');
  const liveReport = await buildLiveReconciliationReport(fetchLiveRows);
  writeFileSync(
    resolve(artifactsDir, 'neurocanvas-live-reconciliation.json'),
    JSON.stringify(liveReport, null, 2),
    'utf8',
  );
  writeFileSync(
    resolve(artifactsDir, 'neurocanvas-live-reconciliation.md'),
    renderLiveReconciliationMarkdown(liveReport),
    'utf8',
  );

  console.log('[G0.2] Phase readiness…');
  const phaseReport = buildPhaseReadinessReport(resolverReconciliation, liveReport);
  writeFileSync(
    resolve(artifactsDir, 'neurocanvas-phase-readiness.md'),
    renderPhaseReadinessMarkdown(phaseReport),
    'utf8',
  );

  console.log('[G0.2] live_access:', liveReport.live_access.available);
  console.log('[G0.2] distribution:', liveReport.distribution);
  console.log('[G0.2] phase_0a:', phaseReport.phases.phase_0a.verdict);
  console.log('[G0.2] phase_0b:', phaseReport.phases.phase_0b.verdict);
  console.log('[G0.2] phase_2:', phaseReport.phases.phase_2.verdict);
  console.log('[G0.2] generic exact (canonical):', resolverReconciliation.delta_fs_first_vs_canonical.generic_count_exact);
}

main().catch((err) => {
  console.error('[G0.2]', err);
  process.exitCode = 1;
});
