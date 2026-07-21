#!/usr/bin/env tsx
/**
 * Brief Markdown de âncoras faltantes (agente na frente).
 *
 *   npm run anchor:brief -- --subtopico="Farmacodinâmica e Farmacocinética"
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  buildAnchorBriefMarkdown,
  evaluateGoldenAnchorGate,
} from '@/lib/catalogMigration/goldenAnchorGate';
import {
  loadHandcraftPlaybook,
  resolveRegistryPackage,
} from '@/lib/catalogMigration/handcraftPlaybook';

function main(): void {
  const subtopico = parseArg('subtopico');
  if (!subtopico?.trim()) {
    console.error('[anchor:brief] Informe --subtopico="<nome canônico>"');
    process.exitCode = 1;
    return;
  }

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
  });

  const brief = buildAnchorBriefMarkdown(report, pkg);
  console.log(brief);

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const safeName = canonical
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .slice(0, 60);
  const outPath = resolve(artifactsDir, `anchor-brief-${safeName}.md`);
  writeFileSync(outPath, brief, 'utf8');

  const gatePath = resolve(process.cwd(), report.artifact);
  writeFileSync(gatePath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(`\n[anchor:brief] salvo em ${outPath}`);
  console.log(`[anchor:brief] gate=${report.gate} artifact=${report.artifact}`);

  process.exitCode = report.gate === 'block' ? 1 : 0;
}

main();
