#!/usr/bin/env tsx
/**
 * Mescla lotes inferidos pelo agente → relatório catalog:infer-subtopico.
 *
 *   npx tsx scripts/catalog-merge-agent-infer.ts --manifest=artifacts/catalog-pe-pending/manifest.json --min-confidence=0.85
 */

import { loadEnvConfig } from '@next/env';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import { isCanonicalSubtopico } from '@/lib/catalogMigration/canonicalSubtopicos';
import { isInferenceApplicable } from '@/lib/catalogMigration/inferSubtopicoFromEnunciado';
import type { InferProposalRow, InferReport } from './catalog-infer-subtopico-cli';

type AgentInferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

type BatchInferFile = {
  batch: string;
  bucket: string;
  inferences: AgentInferRow[];
};

type Manifest = {
  bucket: string;
  batch_files: string[];
};

function main() {
  const manifestPath = requireArg('manifest');
  const minConfidence = Number(parseArg('min-confidence') ?? '0.85');
  const outReport = parseArg('report');

  if (!Number.isFinite(minConfidence) || minConfidence < 0 || minConfidence > 1) {
    throw new Error('--min-confidence deve estar entre 0 e 1');
  }

  const manifest = JSON.parse(readFileSync(resolve(process.cwd(), manifestPath), 'utf8')) as Manifest;
  const proposals: InferProposalRow[] = [];
  let errors = 0;

  for (const rel of manifest.batch_files) {
    const inferredPath = rel.replace(/\.json$/, '-inferred.json');
    const full = resolve(process.cwd(), inferredPath);
    if (!existsSync(full)) {
      throw new Error(`Lote inferido ausente: ${inferredPath}`);
    }

    const batch = JSON.parse(readFileSync(full, 'utf8')) as BatchInferFile;
    const exportBatch = JSON.parse(
      readFileSync(resolve(process.cwd(), rel), 'utf8'),
    ) as { items: { modulo_slug: string; from: string }[] };

    const fromBySlug = new Map(exportBatch.items.map((i) => [i.modulo_slug, i.from]));

    for (const inf of batch.inferences) {
      const from = fromBySlug.get(inf.modulo_slug) ?? manifest.bucket;
      if (!isCanonicalSubtopico(inf.suggested_subtopico)) {
        errors++;
        proposals.push({
          modulo_slug: inf.modulo_slug,
          from,
          suggested: from,
          confidence: 0,
          keep_current: true,
          rationale: 'subtópico inválido',
          applicable: false,
          error: `invalid subtopico: ${inf.suggested_subtopico}`,
        });
        continue;
      }

      const inference = {
        suggested_subtopico: inf.suggested_subtopico,
        confidence: inf.confidence,
        keep_current: inf.keep_current,
        rationale: inf.rationale,
      };
      const applicable = isInferenceApplicable(inference, from, minConfidence);

      proposals.push({
        modulo_slug: inf.modulo_slug,
        from,
        suggested: inf.suggested_subtopico,
        confidence: inf.confidence,
        keep_current: inf.keep_current,
        rationale: `[agent] ${inf.rationale}`,
        applicable,
        source: 'heuristic',
      });
    }
  }

  let inferred = 0;
  let keepCurrent = 0;
  let sameSubtopico = 0;
  let applicable = 0;
  for (const p of proposals) {
    if (p.error) continue;
    inferred++;
    if (p.keep_current) keepCurrent++;
    if (p.suggested.trim() === p.from.trim()) sameSubtopico++;
    if (p.applicable) applicable++;
  }

  const report: InferReport = {
    generated_at: new Date().toISOString(),
    mode: 'infer',
    bucket: manifest.bucket,
    min_confidence_apply: minConfidence,
    limit: null,
    inference_source: 'mixed',
    summary: {
      scanned: proposals.length,
      inferred,
      errors,
      keep_current: keepCurrent,
      same_subtopico: sameSubtopico,
      applicable,
    },
    proposals,
  };

  const reportPath =
    outReport ??
    resolve(
      process.cwd(),
      `artifacts/catalog-infer-agent-${manifest.bucket
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}.json`,
    );

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report.summary, report: reportPath }, null, 2));
}

main();
