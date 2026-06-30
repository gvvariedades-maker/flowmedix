#!/usr/bin/env tsx
/**
 * Expande `Pipeline completo: <subtópico>` em briefing Markdown (agente professor).
 *
 *   npm run pipeline:brief -- --subtopico="Imunização"
 *   npm run pipeline:brief -- --message="Pipeline completo: CME\nSó qualidade"
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  buildPipelineBrief,
  parsePipelineCompletoTrigger,
} from '@/lib/catalogMigration/pipelinePlaybook';

function main(): void {
  const message = parseArg('message');
  const subtopicoArg = parseArg('subtopico');
  const slugArg = parseArg('slug');

  let subtopico = subtopicoArg;
  let slug = slugArg;
  let handcraftOnly = false;
  let qualityOnly = false;

  if (message) {
    const parsed = parsePipelineCompletoTrigger(message);
    if (!parsed) {
      console.error('[pipeline:brief] --message deve começar com Pipeline completo:');
      process.exitCode = 1;
      return;
    }
    subtopico = parsed.subtopico;
    slug = slug ?? parsed.slug;
    handcraftOnly = parsed.handcraftOnly ?? false;
    qualityOnly = parsed.qualityOnly ?? false;
  }

  if (!subtopico?.trim()) {
    console.error('[pipeline:brief] Informe --subtopico= ou --message="Pipeline completo: ..."');
    process.exitCode = 1;
    return;
  }

  const brief = buildPipelineBrief(subtopico, {
    slug: slug?.trim() || undefined,
    handcraftOnly,
    qualityOnly,
  });

  console.log(brief);

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const safeName = subtopico
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .slice(0, 60);
  const outPath = resolve(artifactsDir, `pipeline-brief-${safeName}.md`);
  writeFileSync(outPath, brief, 'utf8');
  console.log(`\n[pipeline:brief] salvo em ${outPath}`);
}

main();
