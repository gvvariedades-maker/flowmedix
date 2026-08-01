#!/usr/bin/env tsx
/**
 * F2b/F2c — portão do leitor cego sobre as âncoras de `examples/` (padrão) ou o catálogo.
 *
 *   npm run audit:blind-reader                      # âncoras, chama o modelo
 *   npm run audit:blind-reader -- --dry-run         # só escreve os prompts, sem API
 *   npm run audit:blind-reader -- --limit=20        # recorte para amostragem
 *   npm run audit:blind-reader -- --file=examples/questao-premium-x.json
 *   npm run audit:blind-reader -- --catalog --limit=200
 *   npm run audit:blind-reader -- --strict          # exit 1 se houver fail_leak
 *
 * F2c (calibração — NÃO vincula a production_ready; isso é F4):
 *   1. Rodar sem --strict nas ~155+ âncoras → artifacts/blind-reader-gate.{json,md}
 *   2. Amostrar ~20: npx tsx scripts/_blind-reader-pick-calibration.ts
 *   3. Revisar textos: npx tsx scripts/_blind-reader-dump-calibration-views.ts
 *   4. Julgamentos humanos: data/catalog-migration/blind-reader-calibration-judgments.json
 *   5. Relatório: artifacts/blind-reader-calibration-report.md
 *
 * Report-only por padrão: calibrar em ~20 âncoras antes de barrar lote de ninguém.
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { detectUnifiedPedagogy } from '@/lib/catalogMigration/unifiedPedagogyDetector';
import {
  BLIND_READER_SYSTEM_PROMPT,
  buildBlindReaderUserPrompt,
  buildBlindReaderView,
  correctLetterOf,
  geminiBlindReaderCall,
  renderBlindReaderMarkdown,
  runBlindReaderOnQuestion,
  skippedResult,
  summarizeBlindReaderResults,
  type BlindReaderQuestionPayload,
  type BlindReaderResult,
} from '@/lib/neurocanvas/blindReaderGate';
import {
  iterateCanonicalQuestions,
  readQuestionJsonFile,
} from '@/lib/neurocanvas/canonicalCatalog';
import {
  gradePedagogicalNote,
  summarizePedagogicalNotes,
  type PedagogicalNote,
} from '@/lib/neurocanvas/pedagogicalNote';

type Target = { slug: string; path: string };

function anchorTargets(): Target[] {
  const dir = resolve(process.cwd(), 'examples');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort()
    .map((f) => ({ slug: f.replace(/\.json$/, ''), path: join(dir, f) }));
}

function catalogTargets(): Target[] {
  const out: Target[] = [];
  iterateCanonicalQuestions((slug, path) => out.push({ slug, path }));
  return out;
}

function resolveTargets(): { corpus: string; targets: Target[] } {
  const file = parseArg('file');
  if (file) {
    const path = resolve(process.cwd(), file);
    const slug = file.replace(/\\/g, '/').split('/').pop()!.replace(/\.json$/, '');
    return { corpus: `file:${file}`, targets: [{ slug, path }] };
  }

  const useCatalog = hasFlag('catalog');
  let targets = useCatalog ? catalogTargets() : anchorTargets();

  const slug = parseArg('slug');
  if (slug) targets = targets.filter((t) => t.slug === slug);

  const limitRaw = parseArg('limit');
  if (limitRaw) {
    const n = Number(limitRaw);
    if (!Number.isFinite(n) || n <= 0) throw new Error('--limit deve ser um número positivo');
    targets = targets.slice(0, Math.floor(n));
  }

  return { corpus: useCatalog ? 'catalog' : 'examples', targets };
}

async function main() {
  const { corpus, targets } = resolveTargets();
  const dryRun = hasFlag('dry-run');
  const strict = hasFlag('strict');

  if (targets.length === 0) {
    console.error('[audit:blind-reader] nenhum alvo — verifique --file / --slug / --catalog');
    process.exitCode = 1;
    return;
  }

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  if (dryRun) {
    const prompts = targets.flatMap((target) => {
      const payload = readQuestionJsonFile(target.path) as BlindReaderQuestionPayload;
      const view = buildBlindReaderView(payload, target.slug);
      if (!view) return [];
      return [
        {
          slug: target.slug,
          correct_letter: correctLetterOf(payload),
          surfaces: view.surfaces,
          user: buildBlindReaderUserPrompt(view),
        },
      ];
    });

    const outPrompts = resolve(artifactsDir, 'blind-reader-prompts.json');
    writeFileSync(
      outPrompts,
      JSON.stringify(
        { corpus, generated_at: new Date().toISOString(), system_prompt: BLIND_READER_SYSTEM_PROMPT, prompts },
        null,
        2,
      ),
      'utf8',
    );
    console.log(`[audit:blind-reader] dry-run: ${prompts.length}/${targets.length} com concept_map`);
    console.log('[audit:blind-reader] prompts=', outPrompts);
    return;
  }

  const results: BlindReaderResult[] = [];
  const notes: PedagogicalNote[] = [];

  for (const target of targets) {
    let payload: BlindReaderQuestionPayload;
    try {
      payload = readQuestionJsonFile(target.path) as BlindReaderQuestionPayload;
    } catch (err) {
      console.warn(`[audit:blind-reader] JSON ilegível: ${target.path} (${String(err)})`);
      continue;
    }

    const view = buildBlindReaderView(payload, target.slug);
    const result = view
      ? await runBlindReaderOnQuestion(payload, {
          slug: target.slug,
          call: geminiBlindReaderCall,
        })
      : skippedResult(target.slug);

    results.push(result);
    notes.push(
      gradePedagogicalNote({
        slug: target.slug,
        findings: detectUnifiedPedagogy(payload),
        blindReader: result,
      }),
    );

    if (result.blocking) {
      console.log(`[audit:blind-reader] fail_leak ${target.slug} → ${result.gabarito}`);
    }
  }

  const summary = summarizeBlindReaderResults(results, corpus);

  const outJson = resolve(artifactsDir, 'blind-reader-gate.json');
  const outMd = resolve(artifactsDir, 'blind-reader-gate.md');

  writeFileSync(
    outJson,
    JSON.stringify(
      {
        ...summary,
        system_prompt: BLIND_READER_SYSTEM_PROMPT,
        pedagogical_notes: notes,
        pedagogical_summary: summarizePedagogicalNotes(notes),
      },
      null,
      2,
    ),
    'utf8',
  );
  writeFileSync(outMd, renderBlindReaderMarkdown(summary), 'utf8');

  console.log(`[audit:blind-reader] corpus=${corpus} alvos=${summary.total} julgadas=${summary.judged}`);
  console.log(`[audit:blind-reader] fail_leak=${summary.blocking} warn=${summary.verdicts.warn_unsupported_hit}`);
  console.log('[audit:blind-reader] json=', outJson);
  console.log('[audit:blind-reader] md=', outMd);
  if (corpus === 'examples' && !strict) {
    console.log(
      '[audit:blind-reader] F2c: calibração humana em data/catalog-migration/blind-reader-calibration-judgments.json' +
        ' · relatório artifacts/blind-reader-calibration-report.md — não use --strict até F4.',
    );
  }

  if (strict && summary.blocking > 0) {
    console.error('[audit:blind-reader] --strict: concept_map entregando gabarito.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
