#!/usr/bin/env tsx
/**
 * Planeja lote handcraft calculo gNN a partir do manifest completo (slice por índice).
 *
 *   npx tsx scripts/plan-calculo-de-administracao-de-medicamentos-e-infusoes-batch.ts --batch=9 --start=64 --count=8
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const PREFIX = 'calculo-de-administracao-de-medicamentos-e-infusoes';
const COMPLETO_MANIFEST = resolve(
  process.cwd(),
  'data/catalog-migration/calculo-de-administracao-de-medicamentos-e-infusoes-completo/manifest.json',
);
const SUBTOPICO = 'Cálculo de Administração de Medicamentos e Infusões';

function main(): void {
  const batch = Number(requireArg('batch'));
  const start = Number(parseArg('start') ?? String((batch - 1) * 8));
  const count = Number(parseArg('count') ?? '8');
  const lote = `${PREFIX}-g${String(batch).padStart(2, '0')}`;

  if (!existsSync(COMPLETO_MANIFEST)) {
    throw new Error(`Manifest completo ausente: ${COMPLETO_MANIFEST}`);
  }

  const completo = JSON.parse(readFileSync(COMPLETO_MANIFEST, 'utf8')) as { slugs: string[] };
  const picked = completo.slugs.slice(start, start + count);
  if (picked.length === 0) {
    throw new Error(`Nenhum slug no slice start=${start} count=${count}`);
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const manifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'completo-manifest-slice',
    filters: {
      from_manifest: COMPLETO_MANIFEST,
      start_index: start,
      count,
      subtopico: SUBTOPICO,
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote,
    subtopico: SUBTOPICO,
    handcraft_batch: batch,
    slug_count: picked.length,
    status: 'planned',
    validate_command: `npm run validate:goldens -- --lote=${lote} --strict`,
    workflow: [
      `npx tsx scripts/plan-calculo-de-administracao-de-medicamentos-e-infusoes-batch.ts --batch=${batch} --start=${start} --count=${count}`,
      `npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
      `npx tsx scripts/handcraft-${lote}.ts`,
      `npm run audit:questao-readiness -- --lote=${lote} --strict-v2-pedagogy`,
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:calculo-g${String(batch).padStart(2, '0')}] lote=${lote} slugs=${picked.length} start=${start}`);
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:calculo] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

function requireArg(name: string): string {
  const v = parseArg(name);
  if (!v) throw new Error(`--${name} obrigatório`);
  return v;
}

main();
