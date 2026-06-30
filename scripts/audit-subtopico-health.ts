#!/usr/bin/env tsx
/**
 * Health audit contínuo pós-venda (L5 + P0 aging).
 *
 * Uso:
 *   npm run audit:subtopico-health -- --subtopico="Enfermagem em Central de Material e Esterilização (CME)"
 *   npm run audit:subtopico-health -- --all-production-ready
 *   npm run audit:subtopico-health -- --subtopico="..." --recover
 *   npm run audit:subtopico-health -- --subtopico="..." --no-write-registry
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import {
  applyContinuousAuditToRegistry,
  runContinuousAudit,
} from '@/lib/catalogMigration/continuousQuality';
import {
  findPacoteBySubtopico,
  listProductionReadyPacotes,
  loadHandcraftRegistry,
  saveHandcraftRegistry,
} from '@/lib/catalogMigration/handcraftRegistry';
import { normalizeProductionStatus } from '@/lib/catalogMigration/shipGate';
import { createServerSupabase } from '@/lib/supabase/server';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function auditOne(
  subtopico: string,
  options: { recover: boolean; writeRegistry: boolean },
): Promise<{ pass: boolean; blocked: boolean }> {
  const registry = loadHandcraftRegistry();
  const found = findPacoteBySubtopico(registry, subtopico);
  if (!found) {
    throw new Error(`Subtópico não encontrado no registry: ${subtopico}`);
  }

  const { key, pacote } = found;
  const status = normalizeProductionStatus(pacote.production_status);

  if (status === 'none' || status === 'monitoring') {
    console.warn(
      `[audit:subtopico-health] WARN: ${subtopico} production_status=${status} — health só pós-venda`,
    );
  }

  const supabase = await createServerSupabase();
  const report = await runContinuousAudit(subtopico, pacote, supabase);

  const outDir = resolve(
    process.cwd(),
    'artifacts/subtopico-health',
    pacote.pacote_prefix,
  );
  mkdirSync(outDir, { recursive: true });
  const dated = resolve(outDir, `${todayKey()}.json`);
  const latest = resolve(outDir, 'latest.json');
  writeFileSync(dated, JSON.stringify(report, null, 2), 'utf8');
  writeFileSync(latest, JSON.stringify(report, null, 2), 'utf8');

  if (options.writeRegistry) {
    applyContinuousAuditToRegistry(registry, key, report, { recover: options.recover });
    saveHandcraftRegistry(registry);
  }

  console.log(`[audit:subtopico-health] subtopico="${subtopico}" pass=${report.pass} blocked=${report.blocked}`);
  if (report.content_health.alerts.length > 0) {
    for (const a of report.content_health.alerts) console.log(`  alert: ${a}`);
  }
  console.log(`[audit:subtopico-health] report=${latest}`);

  return { pass: report.pass, blocked: report.blocked };
}

async function main(): Promise<void> {
  const allReady = hasFlag('all-production-ready');
  const recover = hasFlag('recover');
  const writeRegistryArg = parseArg('write-registry');
  const writeRegistry =
    writeRegistryArg === 'false' ? false : !hasFlag('no-write-registry');

  let exitCode = 0;

  if (allReady) {
    const registry = loadHandcraftRegistry();
    const targets = listProductionReadyPacotes(registry);
    if (targets.length === 0) {
      console.log('[audit:subtopico-health] nenhum pacote production_ready/blocked');
      return;
    }
    for (const { key } of targets) {
      const result = await auditOne(key, { recover, writeRegistry });
      if (!result.pass || result.blocked) exitCode = 1;
    }
  } else {
    const subtopico = parseArg('subtopico') ?? requireArg('subtopico');
    const result = await auditOne(subtopico, { recover, writeRegistry });
    if (!result.pass || result.blocked) exitCode = 1;
  }

  process.exitCode = exitCode;
}

main().catch((err) => {
  console.error('[audit:subtopico-health]', err);
  process.exitCode = 1;
});
