#!/usr/bin/env tsx
/**
 * Preflight read-only para neurocanvas:parity-local.
 * Aborta antes de qualquer auditoria que sobrescreva artifacts/ quando não há catálogo real.
 *
 * Valida presença de JSON em questions/ — não completude editorial.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { CATALOG_MIGRATION_ROOT } from '@/lib/catalogMigration/paths';

export type CatalogPreflightResult = {
  ok: boolean;
  catalogRoot: string;
  questionFiles: number;
};

/** Conta arquivos .json em diretórios questions/ sob catalogRoot. */
export function countQuestionJsonFilesUnder(catalogRoot: string): number {
  if (!existsSync(catalogRoot)) {
    return 0;
  }

  let count = 0;

  function walk(dir: string): void {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const ent of entries) {
      const full = join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'questions') {
          for (const file of readdirSync(full)) {
            if (file.endsWith('.json')) count += 1;
          }
        } else {
          walk(full);
        }
      }
    }
  }

  walk(catalogRoot);
  return count;
}

/** Avalia preflight: ok quando há ao menos um JSON em questions/ (qualquer lote). */
export function evaluateCatalogPreflight(catalogRoot: string): CatalogPreflightResult {
  const questionFiles = countQuestionJsonFilesUnder(catalogRoot);
  return {
    ok: questionFiles > 0,
    catalogRoot,
    questionFiles,
  };
}

export function resolvePreflightCatalogRoot(override?: string): string {
  const raw = override?.trim();
  if (raw) {
    return resolve(raw);
  }
  return CATALOG_MIGRATION_ROOT;
}

function main(): void {
  const catalogRoot = resolvePreflightCatalogRoot(parseArg('catalog-root'));
  const result = evaluateCatalogPreflight(catalogRoot);

  if (!result.ok) {
    console.error('[preflight:neurocanvas-parity] ABORT: catálogo real ausente.');
    console.error(
      `[preflight:neurocanvas-parity] Esperado: ${catalogRoot}/**/questions/*.json`,
    );
    console.error(
      '[preflight:neurocanvas-parity] Exporte o catálogo local antes de rodar neurocanvas:parity-local.',
    );
    console.error(
      '[preflight:neurocanvas-parity] Nota: valida presença de JSON, não completude editorial.',
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[preflight:neurocanvas-parity] OK: ${result.questionFiles} arquivo(s) em ${catalogRoot}/**/questions/`,
  );
}

if (require.main === module) {
  main();
}
