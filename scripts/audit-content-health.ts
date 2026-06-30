#!/usr/bin/env tsx
/**
 * L5 — audit de saúde de conteúdo (reportes + sessões).
 *
 * Uso:
 *   npm run audit:content-health -- --subtopico="Enfermagem em Central de Material e Esterilização (CME)"
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import {
  evaluateContentHealth,
  fetchOpenReportsBySubtopico,
  fetchSessions30dBySubtopico,
} from '@/lib/catalogMigration/contentHealth';
import {
  findPacoteBySubtopico,
  loadHandcraftRegistry,
} from '@/lib/catalogMigration/handcraftRegistry';
import { createServerSupabase } from '@/lib/supabase/server';

async function main(): Promise<void> {
  const subtopico = requireArg('subtopico');
  const registry = loadHandcraftRegistry();
  const found = findPacoteBySubtopico(registry, subtopico);
  const slo = found?.pacote.quality?.slo;

  const supabase = await createServerSupabase();
  const [sessions30d, open] = await Promise.all([
    fetchSessions30dBySubtopico(supabase, subtopico),
    fetchOpenReportsBySubtopico(supabase, subtopico),
  ]);

  const health = evaluateContentHealth(subtopico, sessions30d, open, slo);

  const outDir = resolve(process.cwd(), 'artifacts/content-health');
  mkdirSync(outDir, { recursive: true });
  const safeName = subtopico.replace(/[^\w-]+/g, '_').slice(0, 80);
  const outPath = resolve(outDir, `${safeName}.json`);
  writeFileSync(outPath, JSON.stringify(health, null, 2), 'utf8');

  console.log(`[audit:content-health] subtopico="${subtopico}"`);
  console.log(
    `[audit:content-health] sessions_30d=${health.sessions_30d} open=${health.open_reports.total} rate=${health.report_rate_pct}%`,
  );
  console.log(`[audit:content-health] pass=${health.pass}`);
  for (const b of health.blockers) {
    console.log(`  blocker: ${b}`);
  }
  console.log(`[audit:content-health] report=${outPath}`);

  process.exitCode = health.pass ? 0 : 1;
}

main().catch((err) => {
  console.error('[audit:content-health]', err);
  process.exitCode = 1;
});
