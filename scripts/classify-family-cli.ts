#!/usr/bin/env tsx
/**
 * Classifica meta.family via funil canônico (classifyFamily).
 *
 * Uso:
 *   npm run classify:family -- --file=examples/questao-premium-cpcon-vias-im-vf.json
 *   npm run classify:family -- --file=data/.../slug.json --json
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  classifyFamily,
  FAMILY_GOLDEN_FILE,
  FAMILY_LABELS,
  inferFamilyMismatch,
  type FamilyId,
  type QuestionOption,
} from '@/lib/catalogMigration/classifyFamily';
import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';

type QuestaoPayload = {
  meta?: { family?: string };
  question_data?: {
    instruction?: string;
    text_fragment?: string;
    options?: { id?: string; text?: string; is_correct?: boolean }[];
  };
};

function loadOptions(payload: QuestaoPayload): QuestionOption[] {
  return (payload.question_data?.options ?? []).map((o, i) => ({
    id: o.id ?? String.fromCharCode(65 + i),
    text: o.text ?? '',
    is_correct: Boolean(o.is_correct),
  }));
}

function main(): void {
  const file = parseArg('file');
  if (!file) {
    console.error('Uso: npm run classify:family -- --file=<path.json> [--json]');
    process.exit(1);
  }

  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) {
    console.error(`Arquivo não encontrado: ${path}`);
    process.exit(1);
  }

  const payload = JSON.parse(readFileSync(path, 'utf8')) as QuestaoPayload;
  const instruction = String(payload.question_data?.instruction ?? '');
  const textFragment = String(payload.question_data?.text_fragment ?? '');
  const options = loadOptions(payload);

  const family = classifyFamily(instruction, '', options, textFragment);
  const declared = payload.meta?.family?.trim() as FamilyId | undefined;
  const mismatch = declared
    ? inferFamilyMismatch(declared, instruction, options, textFragment)
    : null;

  const result = {
    file,
    family,
    label: FAMILY_LABELS[family],
    golden: FAMILY_GOLDEN_FILE[family],
    declared: declared ?? null,
    mismatch,
    text_fragment_chars: textFragment.trim().length,
  };

  if (hasFlag('json')) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`family: ${family} — ${FAMILY_LABELS[family]}`);
  console.log(`golden: examples/${FAMILY_GOLDEN_FILE[family]}`);
  if (textFragment.trim()) {
    console.log(`text_fragment: ${result.text_fragment_chars} chars`);
  }
  if (declared) {
    if (mismatch) {
      console.log(`⚠ meta.family="${declared}" diverge (inferido: ${mismatch})`);
    } else {
      console.log(`✓ meta.family alinhada`);
    }
  }
}

main();
