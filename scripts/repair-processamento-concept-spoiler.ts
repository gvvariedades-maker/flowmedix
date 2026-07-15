#!/usr/bin/env tsx
/**
 * Remove spoiler "Gabarito letra X" do concept_map (golden-v1 L2).
 *
 *   npm run repair:processamento-concept-spoiler -- --lote=processamento-completo --write
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

function repairGoldenRule(payload: Record<string, unknown>): boolean {
  const slides = (payload.reverse_study_slides ?? payload.study_slides) as
    | Record<string, unknown>[]
    | undefined;
  if (!Array.isArray(slides)) return false;

  let changed = false;
  for (const slide of slides) {
    if (slide.type !== 'golden_rule' || !Array.isArray(slide.rows)) continue;
    for (const row of slide.rows as { label?: string; value?: string }[]) {
      const label = row.label?.trim() ?? '';
      if (!/gabarito|combina[çc]/i.test(label)) continue;
      const cleaned = label
        .replace(/\s*\(gabarito[^)]*\)/gi, '')
        .replace(/\s*—?\s*gabarito\s*[a-e]?/gi, '')
        .replace(/gabarito\s*[a-e]?/gi, '')
        .replace(/combina[çc][aã]o/gi, '')
        .trim();
      const value = row.value?.trim() ?? '';
      row.label =
        cleaned.length >= 3
          ? cleaned
          : value.length > 48
            ? `${value.slice(0, 45)}…`
            : value || 'Parâmetro normativo';
      changed = true;
    }
  }
  return changed;
}

function repairConceptMap(payload: Record<string, unknown>): boolean {
  const slides = (payload.reverse_study_slides ?? payload.study_slides) as
    | Record<string, unknown>[]
    | undefined;
  if (!Array.isArray(slides)) return false;

  let changed = false;
  for (const slide of slides) {
    if (slide.type !== 'concept_map' || !Array.isArray(slide.items)) continue;
    for (const item of slide.items as { label?: string; detail?: string }[]) {
      if (!item.label || !/^gabarito\b/i.test(item.label.trim())) continue;
      const detail = item.detail?.trim() ?? '';
      item.label = detail.length > 48 ? `${detail.slice(0, 45)}…` : detail || 'Núcleo da prova';
      changed = true;
    }
  }
  return changed;
}

function main(): void {
  const lote = parseArg('lote') ?? 'processamento-completo';
  const write = process.argv.includes('--write');
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) throw new Error(`Lote não encontrado: ${dir}`);

  let repaired = 0;
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const path = join(dir, name);
    const payload = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    let changed = false;
    if (repairConceptMap(payload)) changed = true;
    if (repairGoldenRule(payload)) changed = true;
    if (!changed) continue;
    repaired += 1;
    if (write) writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(`[repair:processamento-concept-spoiler] ${write ? 'fixed' : 'would_fix'} ${name}`);
  }
  console.log(`[repair:processamento-concept-spoiler] done repaired=${repaired} write=${write}`);
}

main();
