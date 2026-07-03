/**
 * Patch em lote: meta.pedagogical_branch (+ family) nos JSONs locais.
 * Usado por catalog:patch-pedagogical-branch e catalog:apply-lote (pré-preflight).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { inferPedagogicalBranch } from '@/lib/slides/pedagogicalBranch';

import { loteQuestionsDir } from './paths';
import {
  patchPedagogicalMeta,
  type PatchableQuestaoPayload,
  type PatchPedagogicalMetaOptions,
} from './patchPedagogicalMeta';

export type PatchLotePedagogicalBranchOptions = PatchPedagogicalMetaOptions & {
  dryRun?: boolean;
  reconcileBranch?: boolean;
};

export type PatchLotePedagogicalBranchResult = {
  lote: string;
  scanned: number;
  patched: number;
  skipped: number;
  reconciled: number;
  still_mismatch: string[];
};

export function patchLotePedagogicalBranch(
  lote: string,
  options: PatchLotePedagogicalBranchOptions = {},
): PatchLotePedagogicalBranchResult {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) {
    throw new Error(`Pasta questions ausente: ${dir}`);
  }

  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  let patched = 0;
  let skipped = 0;
  let reconciled = 0;
  const stillMismatch: string[] = [];

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const path = join(dir, file);
    const payload = JSON.parse(readFileSync(path, 'utf8')) as PatchableQuestaoPayload;
    const branchBefore = payload.meta?.pedagogical_branch?.trim();
    const inferred = payload.meta?.subtopico
      ? inferPedagogicalBranch(
          payload.meta.subtopico,
          String(payload.question_data?.instruction ?? ''),
          (payload.reverse_study_slides ?? payload.study_slides ?? []) as never[],
          payload.meta.family,
        )
      : undefined;

    const willReconcile =
      Boolean(options.reconcileBranch) &&
      Boolean(branchBefore) &&
      Boolean(inferred) &&
      branchBefore !== inferred;

    const result = patchPedagogicalMeta(payload, {
      ...options,
      slug,
      reconcileBranch: options.reconcileBranch,
    });

    if (result.skippedReason && result.skippedReason !== 'unchanged') {
      skipped += 1;
    } else if (result.changed) {
      if (!options.dryRun) {
        writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
      }
      patched += 1;
      if (willReconcile) reconciled += 1;
    }

    const branchAfter = payload.meta?.pedagogical_branch?.trim();
    if (inferred && branchAfter && branchAfter !== inferred) {
      stillMismatch.push(slug);
    }
  }

  return {
    lote,
    scanned: files.length,
    patched,
    skipped,
    reconciled,
    still_mismatch: stillMismatch,
  };
}
