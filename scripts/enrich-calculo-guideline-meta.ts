#!/usr/bin/env tsx
/**
 * Preenche meta.sources + content_review.guideline_snapshot em questões Cálculo.
 *
 * Uso:
 *   npm run enrich:calculo-guideline-meta -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-g01 --write
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { CALCULO_EQUIVALENCIAS_BR } from '@/lib/guidelines/calculoMedicamentos';

const SUBTOPICO = 'Cálculo de Administração de Medicamentos e Infusões';

const CALC_SOURCE = {
  id: CALCULO_EQUIVALENCIAS_BR.id,
  tier: 'A' as const,
  issuer: CALCULO_EQUIVALENCIAS_BR.issuer,
  title: CALCULO_EQUIVALENCIAS_BR.title,
  year: CALCULO_EQUIVALENCIAS_BR.year,
  url: CALCULO_EQUIVALENCIAS_BR.url,
  covers: ['equivalências gts/mL', 'U-100', 'regra de três', 'gts/min', 'diluição'],
};

function loadTargets(): { path: string; slug: string }[] {
  const file = parseArg('file');
  const lote = parseArg('lote');

  if (file) {
    const path = resolve(process.cwd(), file);
    const slug = file.replace(/^.*[/\\]/, '').replace(/\.json$/, '');
    return [{ path, slug }];
  }

  if (!lote) throw new Error('Informe --file= ou --lote=');

  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) throw new Error(`Lote não encontrado: ${dir}`);

  return readdirSync(dir)
    .filter((n) => n.endsWith('.json'))
    .sort()
    .map((n) => ({ path: join(dir, n), slug: n.replace(/\.json$/, '') }));
}

function enrich(payload: Record<string, unknown>): { payload: Record<string, unknown>; changed: boolean } {
  const meta = (payload.meta ?? {}) as Record<string, unknown>;
  const contentReview = (meta.content_review ?? {}) as Record<string, unknown>;
  let changed = false;

  if (meta.subtopico !== SUBTOPICO) {
    meta.subtopico = SUBTOPICO;
    changed = true;
  }
  if (meta.content_standard !== 'golden-v1') {
    meta.content_standard = 'golden-v1';
    changed = true;
  }
  if (!Array.isArray(meta.sources) || meta.sources.length === 0) {
    meta.sources = [CALC_SOURCE];
    changed = true;
  }
  if (!contentReview.guideline_snapshot) {
    contentReview.guideline_snapshot = CALCULO_EQUIVALENCIAS_BR.snapshot;
    changed = true;
  }
  if (!contentReview.reviewed_at) {
    contentReview.reviewed_at = '2026-07-15';
    changed = true;
  }
  if (!contentReview.reviewer) {
    contentReview.reviewer = 'handcraft';
    changed = true;
  }
  if (!contentReview.exam_vs_current) {
    contentReview.exam_vs_current = 'none';
    changed = true;
  }

  meta.content_review = contentReview;
  payload.meta = meta;
  return { payload, changed };
}

function main(): void {
  const write = process.argv.includes('--write');
  const targets = loadTargets();
  let enriched = 0;

  for (const { path, slug } of targets) {
    const payload = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    const { payload: next, changed } = enrich(payload);
    if (changed) {
      enriched += 1;
      if (write) writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    }
    console.log(`${changed ? 'OK' : 'SKIP'} ${slug}`);
  }

  console.log(`[enrich:calculo] scanned=${targets.length} enriched=${enriched} write=${write}`);
}

main();
