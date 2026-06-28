#!/usr/bin/env tsx
/**
 * Expande `Handcraft: <subtópico>` em briefing Markdown (mesmo conteúdo que o agente executa).
 *
 *   npm run handcraft:brief -- --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)"
 *   npm run handcraft:brief -- --subtopico="..." --slug=modulo-slug-...
 *   npm run handcraft:brief -- --message="Handcraft: CME\nSlug: foo-1"
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  buildHandcraftBrief,
  parseHandcraftTrigger,
} from '@/lib/catalogMigration/handcraftPlaybook';

function main(): void {
  const message = parseArg('message');
  const subtopicoArg = parseArg('subtopico');
  const slugArg = parseArg('slug');
  const modeArg = parseArg('mode');

  let subtopico = subtopicoArg;
  let slug = slugArg;

  if (message) {
    const parsed = parseHandcraftTrigger(message);
    if (!parsed) {
      console.error('[handcraft:brief] --message deve começar com Handcraft:');
      process.exitCode = 1;
      return;
    }
    subtopico = parsed.subtopico;
    slug = slug ?? parsed.slug;
  }

  if (!subtopico?.trim()) {
    console.error('[handcraft:brief] Informe --subtopico= ou --message="Handcraft: ..."');
    process.exitCode = 1;
    return;
  }

  const brief = buildHandcraftBrief(subtopico, {
    slug: slug?.trim() || undefined,
    mode: modeArg?.trim() || undefined,
  });

  console.log(brief);

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const safeName = subtopico
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .slice(0, 60);
  const outPath = resolve(artifactsDir, `handcraft-brief-${safeName}.md`);
  writeFileSync(outPath, brief, 'utf8');
  console.log(`\n[handcraft:brief] salvo em ${outPath}`);
}

main();
