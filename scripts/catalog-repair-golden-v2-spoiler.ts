#!/usr/bin/env tsx
/**
 * Repair pedagogy v2: remove rows/itens de gabarito do golden_rule e concept_map.
 *
 *   npm run catalog:repair-golden-v2-spoiler -- --lote=perioperatoria-g01 --dry-run
 *   npm run catalog:repair-golden-v2-spoiler -- --lote=perioperatoria-g01 --write
 *   npm run catalog:repair-golden-v2-spoiler -- --subtopico="Assistência Perioperatória (Inclui SRPA)" --write
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';
import { hasFlag, parseArg, parseCsvArg } from '@/lib/catalogMigration/cliArgs';
import { repairGoldenV2SpoilerInPayload } from '@/lib/catalogMigration/repairGoldenV2Spoiler';
import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const CATALOG_ROOT = resolve(process.cwd(), 'data/catalog-migration');

function loadRegistryLotes(subtopico: string): string[] {
  const registryPath = resolve(CATALOG_ROOT, 'handcraft-registry.json');
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
    pacotes?: Record<
      string,
      { pacote_prefix?: string; lote_pattern?: string; total_slugs?: number; lote_size?: number }
    >;
  };
  const key = Object.keys(registry.pacotes ?? {}).find(
    (k) => k.toLowerCase() === subtopico.toLowerCase(),
  );
  const pkg = key ? registry.pacotes?.[key] : undefined;
  if (!pkg?.pacote_prefix) {
    throw new Error(`Pacote não encontrado no registry: ${subtopico}`);
  }
  const prefix = pkg.pacote_prefix;
  const total = pkg.total_slugs ?? 0;
  const size = pkg.lote_size ?? 8;
  const lotCount = Math.ceil(total / size) || 1;
  const lotes: string[] = [];
  for (let i = 1; i <= lotCount; i++) {
    lotes.push(`${prefix}-g${String(i).padStart(2, '0')}`);
  }
  return lotes;
}

function resolveLotes(): string[] {
  const lote = parseArg('lote');
  const lotesCsv = parseCsvArg('lotes');
  const subtopico = parseArg('subtopico');
  if (lote) return [lote];
  if (lotesCsv?.length) return lotesCsv;
  if (subtopico) return loadRegistryLotes(subtopico);
  throw new Error('Informe --lote=, --lotes= ou --subtopico=');
}

function repairLote(lote: string, write: boolean): {
  lote: string;
  scanned: number;
  changed: number;
  ready_after: number;
  still_fail: string[];
} {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) {
    throw new Error(`Pasta questions ausente: ${dir} — rode catalog:export-lote antes.`);
  }

  const stillFail: string[] = [];
  let changed = 0;
  let readyAfter = 0;
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const path = join(dir, file);
    const payload = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    const repair = repairGoldenV2SpoilerInPayload(payload);

    if (repair.changed && write) {
      writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
      changed += 1;
    } else if (repair.changed) {
      changed += 1;
    }

    if (write && repair.changed) {
      const readiness = auditQuestaoReadiness(payload as never, {
        slug,
        strict: true,
        strictV2Pedagogy: true,
      });
      if (readiness.ready_100) readyAfter += 1;
      else stillFail.push(slug);
    }
  }

  return {
    lote,
    scanned: files.length,
    changed,
    ready_after: readyAfter,
    still_fail: stillFail,
  };
}

function main(): void {
  const write = hasFlag('write');
  const lotes = resolveLotes();
  const report: unknown[] = [];

  for (const lote of lotes) {
    const result = repairLote(lote, write);
    report.push(result);
    console.log(
      `[catalog:repair-golden-v2-spoiler] ${lote} scanned=${result.scanned} ${write ? 'changed' : 'would_change'}=${result.changed}` +
        (write
          ? ` ready_v2=${result.ready_after}/${result.scanned} still_fail=${result.still_fail.length}`
          : ''),
    );
    if (result.still_fail.length > 0) {
      for (const slug of result.still_fail.slice(0, 5)) {
        console.log(`  still_fail: ${slug}`);
      }
    }
  }

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, 'catalog-repair-golden-v2-spoiler.json');
  writeFileSync(
    outPath,
    JSON.stringify({ mode: write ? 'write' : 'dry-run', lotes, report }, null, 2),
    'utf8',
  );
  console.log(`[catalog:repair-golden-v2-spoiler] report=${outPath}`);
}

main();
