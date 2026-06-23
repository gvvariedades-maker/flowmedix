#!/usr/bin/env tsx
/**
 * Gera slides premium via Gemini Flash + validação write spec v2.
 *
 * Uso:
 *   npm run ai:generate -- --lote=imunizacao-ai-pilot
 *   npm run ai:generate -- --lote=imunizacao-ai-pilot --write
 *   npm run ai:generate -- --lote=imunizacao-ai-pilot --only-slugs=slug-a,slug-b
 *   npm run ai:generate -- --lote=imunizacao-ai-pilot --max-attempts=2
 *
 * Pré-requisito: GOOGLE_API_KEY em .env.local
 * Modelo padrão: gemini-2.5-flash (override: GOOGLE_GEMINI_SLIDES_MODEL)
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import {
  generateSlidesForQuestao,
  getGeminiSlidesModelId,
} from '@/lib/ai';
import { hasFlag, parseArg, parseCsvArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

async function main() {
  const lote = requireArg('lote');
  const write = hasFlag('write');
  const dryRun = !write;
  const maxAttemptsRaw = parseArg('max-attempts');
  const maxAttempts = maxAttemptsRaw ? Number(maxAttemptsRaw) : 3;
  const onlySlugs = parseCsvArg('only-slugs');

  const questionsDir = loteQuestionsDir(lote);
  if (!existsSync(questionsDir)) {
    throw new Error(`Lote não encontrado: ${questionsDir}`);
  }

  let files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));
  if (onlySlugs?.length) {
    const set = new Set(onlySlugs);
    files = files.filter((f) => set.has(f.replace(/\.json$/, '')));
  }
  if (files.length === 0) {
    throw new Error(`Nenhum JSON em ${questionsDir}`);
  }

  const model = getGeminiSlidesModelId();
  console.log(`[ai:generate] lote=${lote} model=${model} dryRun=${dryRun} files=${files.length}`);

  const results = [];
  let approved = 0;
  let needsReview = 0;
  let failed = 0;

  for (const file of files.sort()) {
    const slug = file.replace(/\.json$/, '');
    const path = resolve(questionsDir, file);
    const questao = JSON.parse(readFileSync(path, 'utf8'));

    const out = await generateSlidesForQuestao(slug, questao, {
      maxAttempts,
      dryRun,
    });
    results.push(out);

    if (out.status === 'approved') {
      approved += 1;
      if (write && out.payload) {
        writeFileSync(path, JSON.stringify(out.payload, null, 2), 'utf8');
      }
    } else if (out.status === 'needs_review') {
      needsReview += 1;
    } else {
      failed += 1;
    }

    console.log(
      `  ${out.status.toUpperCase()} ${slug} score=${out.score} attempts=${out.attempts} tokens=${out.usage.promptTokens}+${out.usage.candidateTokens}`,
    );
    if (out.issues.length > 0) {
      for (const issue of out.issues.slice(0, 3)) {
        console.log(`    → ${issue}`);
      }
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    lote,
    model,
    dry_run: dryRun,
    total: files.length,
    approved,
    needs_review: needsReview,
    failed,
    results,
  };

  const outDir = resolve(process.cwd(), 'artifacts', 'ai-generation');
  mkdirSync(outDir, { recursive: true });
  const reportPath = resolve(outDir, `${lote}-report.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(
    `[ai:generate] approved=${approved} needs_review=${needsReview} failed=${failed} report=${reportPath}`,
  );
  process.exitCode = failed > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error('[ai:generate]', err);
  process.exitCode = 1;
});
