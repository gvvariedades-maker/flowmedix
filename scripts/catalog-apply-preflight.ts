#!/usr/bin/env tsx
/**
 * Preflight L1 — validate:goldens strict + audit:questao-readiness no lote.
 *
 * Uso:
 *   npm run catalog:preflight -- --lote=processamento-g01
 *   npm run catalog:preflight -- --lote=processamento-g01 --capture
 *   npm run catalog:preflight -- --lote=processamento-g01 --report-pedagogy
 *   npm run catalog:preflight -- --all-lotes   # contagem das 8 assinaturas no catálogo
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

loadEnvConfig(process.cwd());

import { hasFlag, requireArg } from '@/lib/catalogMigration/cliArgs';
import { CATALOG_MIGRATION_ROOT, loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { runLotePreflight } from '@/lib/catalogMigration/preflightLote';
import {
  detectUnifiedPedagogy,
  emptySignatureCounts,
  PEDAGOGY_SIGNATURE_CODES,
  tallySignatures,
  type PedagogySignatureCode,
} from '@/lib/catalogMigration/unifiedPedagogyDetector';

function loadAnchorSlug(lote: string): string | undefined {
  const metaPath = resolve(process.cwd(), `data/catalog-migration/${lote}/lote-meta.json`);
  if (!existsSync(metaPath)) return undefined;
  const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as { anchor_slug?: string };
  return meta.anchor_slug;
}

function listLotes(): string[] {
  return readdirSync(CATALOG_MIGRATION_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(loteQuestionsDir(e.name)))
    .map((e) => e.name)
    .sort();
}

/** Modo report: só o detector unificado, no catálogo inteiro. Não bloqueia nada. */
function sweepCatalogPedagogy(): void {
  const lotes = listLotes();
  const counts = emptySignatureCounts();
  const perLote: {
    lote: string;
    slugs: number;
    slugs_with_findings: number;
    total_findings: number;
  }[] = [];

  // Quebra por slide+superfície: separa spoiler real de concept_map do exam_hint de
  // golden_rule (soft-lens), que cita letra por design.
  const byOrigin = new Map<string, number>();
  const samples = new Map<string, { slug: string; path: string; evidence?: string }[]>();

  let slugs = 0;
  let slugsWithFindings = 0;
  let totalFindings = 0;

  for (const lote of lotes) {
    const dir = loteQuestionsDir(lote);
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    let loteWith = 0;
    let loteFindings = 0;

    for (const file of files) {
      let raw: unknown;
      try {
        raw = JSON.parse(readFileSync(resolve(dir, file), 'utf8'));
      } catch {
        continue;
      }
      slugs += 1;
      const findings = detectUnifiedPedagogy(raw as never);
      if (findings.length === 0) continue;
      tallySignatures(findings, counts);
      loteWith += 1;
      loteFindings += findings.length;

      const slug = file.replace(/\.json$/, '');
      for (const f of findings) {
        const origin = `${f.code} · ${f.slide}.${f.key ?? '—'}`;
        byOrigin.set(origin, (byOrigin.get(origin) ?? 0) + 1);
        const bucket = samples.get(origin) ?? [];
        if (bucket.length < 5) {
          bucket.push({ slug, path: f.path, evidence: f.evidence });
          samples.set(origin, bucket);
        }
      }
    }

    slugsWithFindings += loteWith;
    totalFindings += loteFindings;
    perLote.push({
      lote,
      slugs: files.length,
      slugs_with_findings: loteWith,
      total_findings: loteFindings,
    });
  }

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, 'catalog-pedagogy-signatures.json');
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        mode: 'report',
        lotes: lotes.length,
        slugs,
        slugs_with_findings: slugsWithFindings,
        total_findings: totalFindings,
        counts,
        by_origin: Object.fromEntries([...byOrigin.entries()].sort((a, b) => b[1] - a[1])),
        samples: Object.fromEntries(samples),
        per_lote: perLote.filter((l) => l.total_findings > 0),
      },
      null,
      2,
    ),
    'utf8',
  );

  const pct = slugs > 0 ? ((slugsWithFindings / slugs) * 100).toFixed(1) : '0.0';
  console.log(`[catalog:preflight] modo report — detector pedagógico unificado`);
  console.log(`[catalog:preflight] lotes=${lotes.length} slugs=${slugs}`);
  console.log(`[catalog:preflight] slugs com achado=${slugsWithFindings} (${pct}%) achados=${totalFindings}`);
  for (const code of PEDAGOGY_SIGNATURE_CODES) {
    console.log(`  ${code.padEnd(34)} ${counts[code as PedagogySignatureCode]}`);
  }
  console.log('[catalog:preflight] por slide.superfície (top 15):');
  for (const [origin, n] of [...byOrigin.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${origin.padEnd(58)} ${n}`);
  }
  console.log(`[catalog:preflight] report=${outPath}`);
}

function main(): void {
  if (hasFlag('all-lotes')) {
    sweepCatalogPedagogy();
    return;
  }

  const lote = requireArg('lote');
  const strict = !hasFlag('no-strict');
  const strictV2Pedagogy = hasFlag('strict-v2-pedagogy');
  const capture = hasFlag('capture');
  const reportPedagogy = hasFlag('report-pedagogy');

  const report = runLotePreflight(lote, { strict, strictV2Pedagogy, reportPedagogy });

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, `catalog-preflight-${lote}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[catalog:preflight] lote=${lote} strict=${strict} strict_v2=${strictV2Pedagogy}`);
  console.log(`[catalog:preflight] passed=${report.passed}/${report.total} failed=${report.failed}`);
  for (const s of report.slugs.filter((x) => !x.ok)) {
    console.log(`  FAIL ${s.slug}`);
    for (const issue of s.issues.slice(0, 5)) {
      console.log(`    · ${issue}`);
    }
  }
  console.log(`[catalog:preflight] report=${outPath}`);

  if (report.pedagogy_report) {
    const p = report.pedagogy_report;
    console.log(
      `[catalog:preflight] pedagogia (report) slugs_com_achado=${p.slugs_with_findings} achados=${p.total_findings}`,
    );
    for (const code of PEDAGOGY_SIGNATURE_CODES) {
      const n = p.counts[code as PedagogySignatureCode];
      if (n > 0) console.log(`  ${code.padEnd(34)} ${n}`);
    }
  }

  if (capture) {
    const anchor = loadAnchorSlug(lote);
    if (anchor) {
      console.log(`[catalog:preflight] capture anchor_slug=${anchor}`);
      const result = spawnSync(
        'npx',
        ['tsx', 'scripts/capture-questao-review.ts', `--slug=${anchor}`],
        { stdio: 'inherit', shell: true, cwd: process.cwd() },
      );
      if (result.status !== 0) {
        console.warn('[catalog:preflight] capture falhou (não bloqueia preflight)');
      }
    } else {
      console.warn('[catalog:preflight] --capture ignorado: anchor_slug ausente em lote-meta.json');
    }
  }

  process.exitCode = report.failed > 0 ? 1 : 0;
}

main();
