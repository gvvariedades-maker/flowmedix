#!/usr/bin/env tsx
/**
 * Gate de golden âncoras de estilo antes do g01.
 *
 *   npm run audit:golden-anchor-gate -- --subtopico="Farmacodinâmica e Farmacocinética"
 *   npm run audit:golden-anchor-gate -- --subtopico="..." --skip-golden-anchor-gate
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  evaluateGoldenAnchorGate,
  printGoldenAnchorGateSummary,
} from '@/lib/catalogMigration/goldenAnchorGate';
import {
  loadHandcraftPlaybook,
  resolveRegistryPackage,
} from '@/lib/catalogMigration/handcraftPlaybook';

function main(): void {
  const subtopico = parseArg('subtopico');
  if (!subtopico?.trim()) {
    console.error('[audit:golden-anchor-gate] Informe --subtopico="<nome canônico>"');
    process.exitCode = 1;
    return;
  }

  const skip = hasFlag('skip-golden-anchor-gate');
  const resolved = resolveRegistryPackage(subtopico);
  const canonical = resolved?.canonicalName ?? subtopico.trim();
  const pkg = resolved?.pkg ?? null;
  const pacotePrefix = pkg?.pacote_prefix ?? 'unknown';
  const playbook = loadHandcraftPlaybook(canonical, pkg);

  const report = evaluateGoldenAnchorGate({
    subtopico: canonical,
    pacotePrefix,
    clusterReportPath: pkg?.cluster_report ?? null,
    playbook,
    skip,
  });

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(process.cwd(), report.artifact);
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  printGoldenAnchorGateSummary(report);

  process.exitCode = report.gate === 'block' ? 1 : 0;
}

main();
