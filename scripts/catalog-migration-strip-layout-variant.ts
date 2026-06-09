#!/usr/bin/env tsx
/**
 * Remove layout_variant dos JSONs em data/catalog-migration (pastas questions).
 * Visual passa a ser resolvido no player (subtópico + rotação por slug).
 *
 * Uso:
 *   npm run catalog:strip-layout-variant
 *   npm run catalog:strip-layout-variant -- --dry-run
 *   npm run catalog:strip-layout-variant -- --lote=visual-preview-10
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  stripLayoutVariantFromQuestaoPayload,
  type StripLayoutVariantStats,
} from '@/lib/catalogMigration/stripLayoutVariant';

const ROOT = join(process.cwd(), 'data', 'catalog-migration');

function collectQuestionFiles(lote?: string): string[] {
  if (lote) {
    const dir = loteQuestionsDir(lote);
    try {
      return readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => join(dir, f));
    } catch {
      console.error(`Lote não encontrado: ${dir}`);
      process.exit(1);
    }
  }

  const files: string[] = [];
  for (const entry of readdirSync(ROOT)) {
    const questionsDir = join(ROOT, entry, 'questions');
    try {
      if (!statSync(questionsDir).isDirectory()) continue;
    } catch {
      continue;
    }
    for (const f of readdirSync(questionsDir)) {
      if (f.endsWith('.json')) files.push(join(questionsDir, f));
    }
  }
  return files.sort();
}

function main() {
  const dryRun = hasFlag('--dry-run');
  const lote = parseArg('--lote');
  const files = collectQuestionFiles(lote);

  const stats: StripLayoutVariantStats = {
    filesTouched: 0,
    slidesStripped: 0,
    filesSkipped: 0,
  };

  for (const filePath of files) {
    const raw = JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, unknown>;
    const { payload, stripped } = stripLayoutVariantFromQuestaoPayload(raw);

    if (stripped === 0) {
      stats.filesSkipped += 1;
      continue;
    }

    stats.filesTouched += 1;
    stats.slidesStripped += stripped;

    if (!dryRun) {
      writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    }

    console.log(
      `${dryRun ? '[dry-run] ' : ''}${relative(process.cwd(), filePath)} — ${stripped} slide(s)`,
    );
  }

  console.log(
    `\n${dryRun ? 'Simulação' : 'Concluído'}: ${stats.filesTouched} arquivo(s), ${stats.slidesStripped} layout_variant removido(s), ${stats.filesSkipped} sem alteração.`,
  );
}

main();
