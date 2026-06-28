#!/usr/bin/env tsx
/**
 * Preenche meta.pedagogical_branch nos JSONs de um lote (inferência L2.5).
 *
 *   npm run catalog:patch-pedagogical-branch -- --lote=saude-adolescente-completo
 *   npm run catalog:patch-pedagogical-branch -- --lote=saude-adolescente-completo --dry-run
 */
import { loadEnvConfig } from '@next/env';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

loadEnvConfig(process.cwd());

import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { hasFlag, requireArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { resolvePedagogicalBranch } from '@/lib/slides/pedagogicalBranch';
import type { MoldAffinitySlide } from '@/lib/slides/moldAffinity';

type QuestaoFile = {
  meta?: {
    subtopico?: string;
    family?: FamilyId;
    pedagogical_branch?: string;
  };
  question_data?: { instruction?: string };
  reverse_study_slides?: unknown;
  study_slides?: unknown;
};

function slidesOf(q: QuestaoFile): MoldAffinitySlide[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? (s as MoldAffinitySlide[]) : [];
}

function main() {
  const lote = requireArg('lote');
  const dryRun = hasFlag('dry-run');
  const dir = loteQuestionsDir(lote);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  let patched = 0;
  let skipped = 0;

  for (const file of files) {
    const path = join(dir, file);
    const payload = JSON.parse(readFileSync(path, 'utf8')) as QuestaoFile;
    const subtopico = payload.meta?.subtopico;
    const instruction = String(payload.question_data?.instruction ?? '');
    const slides = slidesOf(payload);
    const familyId = payload.meta?.family;

    const branch = resolvePedagogicalBranch(subtopico, instruction, slides, undefined, familyId);
    if (!branch) {
      console.warn(`[patch-pedagogical-branch] SKIP ${file}: sem ramo inferido`);
      skipped += 1;
      continue;
    }

    const current = payload.meta?.pedagogical_branch?.trim();
    if (current === branch) {
      console.log(`[patch-pedagogical-branch] OK ${file} (já ${branch})`);
      continue;
    }

    if (!dryRun) {
      payload.meta = { ...payload.meta, pedagogical_branch: branch };
      writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    }
    console.log(
      `[patch-pedagogical-branch] ${dryRun ? 'DRY' : 'PATCH'} ${file}: ${current ?? '—'} → ${branch}`,
    );
    patched += 1;
  }

  console.log(
    `[patch-pedagogical-branch] lote=${lote} patched=${patched} skipped=${skipped} dryRun=${dryRun}`,
  );
}

main();
