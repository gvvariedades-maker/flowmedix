#!/usr/bin/env tsx
/**
 * Backfill automático de figuras raster — todos os pacotes Língua Portuguesa.
 *
 * Fluxo: audit missing → extract PDF (PyMuPDF, todos os volumes) → upload → patch JSON.
 *
 * Uso:
 *   npm run figures:backfill-pt -- --dry-run
 *   npm run figures:backfill-pt -- --write --slug=<slug>
 *   npm run figures:backfill-pt -- --write --from-audit
 */
import { loadEnvConfig } from '@next/env';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { detectMissingFigure } from '@/lib/catalogMigration/figureContract';
import {
  extractTecIdFromSlug,
  findAllQuestionJsonPaths,
  listPortuguesPdfPaths,
  loadAllPortuguesQuestions,
} from '@/lib/catalogMigration/linguaPortuguesaFigures';
import { buildPublicQuestaoFigureUrl } from '@/lib/questaoFiguresStorage';

const ROOT = process.cwd();
const FIG_ROOT = resolve(ROOT, 'artifacts/questao-figures');

type AuditReport = {
  rows: Array<{ slug: string; status: string }>;
};

function loadMissingSlugs(): string[] {
  const auditPath = parseArg('audit');
  const path =
    auditPath ?? resolve(ROOT, 'artifacts/figures-audit-lingua-portuguesa.json');
  if (!existsSync(path)) {
    throw new Error(
      `Relatório de audit ausente: ${path}. Rode: npm run figures:audit -- --disciplina=portugues`,
    );
  }
  const report = JSON.parse(readFileSync(path, 'utf8')) as AuditReport;
  return report.rows.filter((r) => r.status === 'missing').map((r) => r.slug);
}

function defaultAlt(slug: string, instruction: string): string {
  const plain = cleanInstruction(instruction).replace(/\s+/g, ' ').trim().slice(0, 200);
  return plain || `Figura da questão ${slug}`;
}

function cleanInstruction(instruction: string): string {
  return instruction
    .replace(/\n\n\(HQ em quadrinhos[^)]*\)\n\n/gi, '\n\n')
    .replace(/\n\n\([^)]*adaptad[oa][^)]*\)\n\n/gi, '\n\n')
    .replace(
      /Leia o texto a seguir para responder à questão\./i,
      'Leia a HQ abaixo para responder à questão.',
    )
    .trim();
}

function extractRaster(tecId: string, outDir: string): boolean {
  const pdfOverride = parseArg('pdf');
  const pdfs = pdfOverride ? [resolve(ROOT, pdfOverride)] : listPortuguesPdfPaths();

  for (const pdfPath of pdfs) {
    if (!existsSync(pdfPath)) {
      console.warn(`PDF ausente: ${pdfPath}`);
      continue;
    }
    try {
      execSync(
        `python scripts/tools/extract_questao_figures_from_pdf.py --tec-id=${tecId} --pdf="${pdfPath}" --out-dir="${outDir}"`,
        { stdio: 'pipe', cwd: ROOT },
      );
    } catch {
      // tenta próximo volume
    }
    if (existsSync(resolve(outDir, `${tecId}.webp`))) {
      return true;
    }
  }
  return false;
}

function uploadRaster(tecId: string, webpPath: string, alt: string): void {
  execSync(
    `npm run figures:upload -- --tec-id=${tecId} --file="${webpPath}" --alt="${alt.replace(/"/g, '\\"')}"`,
    { stdio: 'inherit', cwd: ROOT },
  );
}

function patchQuestion(slug: string, tecId: string, alt: string, dryRun: boolean): boolean {
  const paths = findAllQuestionJsonPaths(slug);
  if (!paths.length) {
    console.warn(`SKIP patch ${slug}: JSON não encontrado`);
    return false;
  }

  let ok = true;
  for (const path of paths) {
    const payload = JSON.parse(readFileSync(path, 'utf8')) as {
      question_data?: Record<string, unknown>;
    };
    if (!payload.question_data) payload.question_data = {};

    const instruction = String(payload.question_data.instruction ?? '');
    const url = buildPublicQuestaoFigureUrl(tecId, 'f1');
    payload.question_data.figure_policy = 'required';
    payload.question_data.figures = [{ id: 'f1', url, alt, kind: 'crop' }];
    delete payload.question_data.text_fragment;
    if (instruction) {
      payload.question_data.instruction = cleanInstruction(instruction);
    }

    const missing = detectMissingFigure(payload);
    if (missing) {
      console.warn(`STILL MISSING ${slug} @ ${path}: ${missing.message}`);
      ok = false;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] PATCH ${path}`);
      continue;
    }

    writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(`PATCHED ${path}`);
  }
  return ok;
}

function main(): void {
  const dryRun = hasFlag('dry-run') || !hasFlag('write');
  const slugArg = parseArg('slug');
  const fromAudit = hasFlag('from-audit');

  let slugs: string[] = [];
  if (slugArg) {
    slugs = [slugArg];
  } else if (fromAudit) {
    slugs = loadMissingSlugs();
  } else {
    throw new Error('Informe --slug=, --from-audit ou ambos com --write');
  }

  if (!slugs.length) {
    console.log('Nenhum slug missing para backfill.');
    return;
  }

  let extracted = 0;
  let uploaded = 0;
  let patched = 0;
  let failed = 0;

  for (const slug of slugs) {
    const tecId = parseArg('tec-id') ?? extractTecIdFromSlug(slug);
    if (!tecId) {
      console.warn(`SKIP ${slug}: sem tec_id no slug`);
      failed += 1;
      continue;
    }

    const outDir = resolve(FIG_ROOT, 'pt-backfill');
    const webpPath = resolve(outDir, `${tecId}.webp`);

    if (!existsSync(webpPath)) {
      if (dryRun) {
        console.log(`[dry-run] EXTRACT tec ${tecId} -> ${outDir}`);
      } else {
        const ok = extractRaster(tecId, outDir);
        if (!ok) {
          console.warn(`SKIP ${slug}: raster não extraído (tec ${tecId}) — transcrever manualmente`);
          failed += 1;
          continue;
        }
      }
    }
    extracted += 1;

    const ref = loadAllPortuguesQuestions().find((q) => q.slug === slug);
    const instruction = String(
      (ref?.payload as { question_data?: { instruction?: string } })?.question_data?.instruction ??
        '',
    );
    const alt = defaultAlt(slug, instruction);

    if (!dryRun && existsSync(webpPath)) {
      uploadRaster(tecId, webpPath, alt);
      uploaded += 1;
    }

    if (patchQuestion(slug, tecId, alt, dryRun)) {
      patched += 1;
    } else {
      failed += 1;
    }
  }

  console.log(
    `\nResumo: slugs=${slugs.length} extracted=${extracted} uploaded=${uploaded} patched=${patched} failed=${failed} dryRun=${dryRun}`,
  );
}

main();
