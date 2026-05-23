#!/usr/bin/env tsx
/**
 * Health check de escala — catálogo, JSON, histórico e tetos do código.
 *
 * Uso:
 *   npm run scale:health
 *   npm run scale:health -- --json
 *   npm run scale:health -- --probe   (GET em NEXT_PUBLIC_APP_URL/estudar/{slug})
 */

import { loadEnvConfig } from '@next/env';
import { createServerSupabase } from '../lib/supabase/server';
import {
  formatScaleHealthReportTable,
  runScaleHealthCheck,
} from '../lib/scale/healthCheck';

loadEnvConfig(process.cwd());

async function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const probe = args.includes('--probe');

  let supabase;
  try {
    supabase = await createServerSupabase();
  } catch (e) {
    console.error(
      '❌ SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL são obrigatórias.\n',
      e instanceof Error ? e.message : e,
    );
    process.exit(1);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const report = await runScaleHealthCheck(supabase, {
    probeBaseUrl: probe ? baseUrl : undefined,
  });

  if (probe && !baseUrl) {
    report.alerts.push({
      level: 'warn',
      code: 'PROBE_SKIPPED',
      message: '--probe ignorado: NEXT_PUBLIC_APP_URL não definida.',
    });
  }

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatScaleHealthReportTable(report));
  }

  const hasCritical = report.alerts.some((a) => a.level === 'critical');
  const hasWarn = report.alerts.some((a) => a.level === 'warn');
  process.exit(hasCritical ? 2 : hasWarn ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
