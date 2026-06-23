#!/usr/bin/env tsx
/**
 * Valida goldens golden-v1: examples/questao-premium-*.json e/ou lote em data/catalog-migration/.
 *
 * Uso:
 *   npm run validate:goldens
 *   npm run validate:goldens -- --lote=perioperatoria-g01
 *   npm run validate:goldens -- --lote=perioperatoria-g01 --strict
 *
 * --strict: issues do lintGoldenContent viram falha (não só Zod).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { lintGoldenContent } from '@/lib/goldenContentStandard';
import { QuestaoCompletaSchema } from '@/lib/validations';

const EXAMPLES_DIR = join(process.cwd(), 'examples');

type Target = { label: string; data: unknown };

function loadTargets(): Target[] {
  const lote = parseArg('lote');
  const strictLoteOnly = Boolean(lote);
  const targets: Target[] = [];

  if (!strictLoteOnly) {
    for (const file of readdirSync(EXAMPLES_DIR)
      .filter((f) => f.startsWith('questao-premium-') && f.endsWith('.json'))
      .sort()) {
      targets.push({
        label: `examples/${file}`,
        data: JSON.parse(readFileSync(join(EXAMPLES_DIR, file), 'utf8')),
      });
    }
  }

  if (lote) {
    const dir = loteQuestionsDir(lote);
    if (!existsSync(dir)) {
      throw new Error(`Lote não encontrado: ${dir}`);
    }
    for (const file of readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()) {
      targets.push({
        label: `lote/${lote}/${file}`,
        data: JSON.parse(readFileSync(join(dir, file), 'utf8')),
      });
    }
  }

  return targets;
}

function main(): void {
  const strict = Boolean(parseArg('strict') ?? process.argv.includes('--strict'));
  const targets = loadTargets();

  let checked = 0;
  let failed = 0;

  for (const { label, data } of targets) {
    const record = data as { meta?: { content_standard?: string } };
    const zod = QuestaoCompletaSchema.safeParse(data);
    const isGoldenV1 = record?.meta?.content_standard === 'golden-v1';
    const goldenIssues = isGoldenV1 ? lintGoldenContent(data) : [];

    const problems: string[] = [];
    if (!zod.success) problems.push(`zod: ${zod.error.issues[0]?.message ?? 'inválido'}`);
    if (!isGoldenV1 && label.includes('lote/')) {
      problems.push('meta: content_standard deve ser golden-v1 no lote de handcraft');
    }
    for (const issue of goldenIssues) {
      if (strict || issue.severity === 'error') {
        problems.push(`${issue.code}: ${issue.message}`);
      }
    }

    if (isGoldenV1) checked++;
    if (problems.length > 0) {
      failed++;
      console.error(`FAIL ${label}`);
      for (const p of problems) console.error(`   ${p}`);
    }
  }

  console.log(`\ngolden-v1 verificados: ${checked} · falhas: ${failed} · total: ${targets.length}`);
  if (failed > 0) process.exit(1);
}

main();
