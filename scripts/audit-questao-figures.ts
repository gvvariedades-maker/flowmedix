#!/usr/bin/env tsx
/**
 * Inventário de questões que referenciam figura/tirinha/charge/HQ sem asset válido.
 *
 * Uso:
 *   npm run figures:audit -- --disciplina=portugues
 *   npm run figures:audit -- --subtopico="Classes de palavras"
 *   npm run figures:audit -- --lote=classes-de-palavras-g01
 *   npm run figures:audit -- --json
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  detectMissingFigure,
  instructionReferencesFigure,
} from '@/lib/catalogMigration/figureContract';
import { loadAllPortuguesQuestions } from '@/lib/catalogMigration/linguaPortuguesaFigures';
import { hasValidQuestaoFigures, hasUsefulFigureTranscription } from '@/lib/questaoFigures';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

type FigureAuditRow = {
  slug: string;
  lote?: string;
  subtopico?: string;
  status: 'ok_figures' | 'ok_transcribed' | 'missing' | 'no_reference';
  instruction_snippet: string;
};

function snippet(instruction: string, max = 120): string {
  const oneLine = instruction.replace(/\s+/g, ' ').trim();
  return oneLine.length <= max ? oneLine : `${oneLine.slice(0, max - 1)}…`;
}

function auditPayload(slug: string, payload: unknown, lote?: string): FigureAuditRow {
  const q = payload as {
    meta?: { subtopico?: string };
    question_data?: {
      instruction?: string;
      text_fragment?: string | null;
      figure_policy?: string;
      figures?: unknown[];
    };
  };
  const instruction = String(q.question_data?.instruction ?? '');
  const subtopico = q.meta?.subtopico;

  if (!instructionReferencesFigure(instruction)) {
    return {
      slug,
      lote,
      subtopico,
      status: 'no_reference',
      instruction_snippet: snippet(instruction),
    };
  }

  if (hasValidQuestaoFigures(q.question_data?.figures as never)) {
    return {
      slug,
      lote,
      subtopico,
      status: 'ok_figures',
      instruction_snippet: snippet(instruction),
    };
  }

  if (
    q.question_data?.figure_policy === 'transcribed' &&
    hasUsefulFigureTranscription(q.question_data?.text_fragment)
  ) {
    return {
      slug,
      lote,
      subtopico,
      status: 'ok_transcribed',
      instruction_snippet: snippet(instruction),
    };
  }

  const missing = detectMissingFigure(q);
  return {
    slug,
    lote,
    subtopico,
    status: missing ? 'missing' : 'ok_transcribed',
    instruction_snippet: snippet(instruction),
  };
}

function loadFromLote(lote: string): { slug: string; payload: unknown; lote: string }[] {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) throw new Error(`Lote não encontrado: ${dir}`);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const slug = f.replace(/\.json$/, '');
      const payload = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      return { slug, payload, lote };
    });
}

function loadFromSubtopico(subtopico: string): { slug: string; payload: unknown; lote: string }[] {
  return loadAllPortuguesQuestions().filter(({ payload }) => {
    const st = (payload as { meta?: { subtopico?: string } })?.meta?.subtopico;
    return st?.toLowerCase() === subtopico.toLowerCase();
  });
}

async function main(): Promise<void> {
  const lote = parseArg('lote');
  const subtopico = parseArg('subtopico');
  const disciplina = parseArg('disciplina');
  const jsonOnly = hasFlag('json');

  let rows: FigureAuditRow[] = [];
  let reportKey = 'report';

  if (lote) {
    reportKey = lote;
    rows = loadFromLote(lote).map(({ slug, payload, lote: l }) => auditPayload(slug, payload, l));
  } else if (subtopico) {
    reportKey = subtopico;
    rows = loadFromSubtopico(subtopico).map(({ slug, payload, lote: l }) =>
      auditPayload(slug, payload, l),
    );
  } else if (disciplina?.toLowerCase() === 'portugues') {
    reportKey = 'lingua-portuguesa';
    rows = loadAllPortuguesQuestions().map(({ slug, payload, lote: l }) =>
      auditPayload(slug, payload, l),
    );
  } else {
    throw new Error('Informe --lote=, --subtopico= ou --disciplina=portugues');
  }

  const needs = rows.filter((r) => r.status === 'missing');
  const report = {
    generated_at: new Date().toISOString(),
    scope: reportKey,
    total: rows.length,
    missing: needs.length,
    ok_figures: rows.filter((r) => r.status === 'ok_figures').length,
    ok_transcribed: rows.filter((r) => r.status === 'ok_transcribed').length,
    no_reference: rows.filter((r) => r.status === 'no_reference').length,
    rows,
  };

  const outPath = resolve(
    process.cwd(),
    'artifacts',
    `figures-audit-${reportKey.replace(/[^\w-]+/g, '-').toLowerCase()}.json`,
  );
  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`Figures audit [${reportKey}] — total=${report.total} missing=${report.missing}`);
  console.log(
    `  ok_figures=${report.ok_figures} ok_transcribed=${report.ok_transcribed} no_reference=${report.no_reference}`,
  );
  if (needs.length) {
    console.log('\nMISSING:');
    for (const row of needs) {
      console.log(`  - ${row.slug} [${row.lote}]`);
      console.log(`    ${row.instruction_snippet}`);
    }
  }
  console.log(`\nRelatório: ${outPath}`);
  process.exit(needs.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
