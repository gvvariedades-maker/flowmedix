/**
 * L6 — segundo par de olhos na âncora do lote.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';
import { lintSlugAlignment, slugAlignmentHasErrors } from '@/lib/catalogMigration/slugAlignment';
import {
  lintNumericFactcheck,
  numericFactcheckHasErrors,
} from '@/lib/catalogMigration/numericFactcheck';
import {
  lintRedeFrioFactcheck,
  redeFrioFactcheckHasErrors,
} from '@/lib/catalogMigration/redeFrioFactcheck';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

export type AnchorSecondReviewStatus = 'pending' | 'pass' | 'fail';

export type AnchorSecondReviewMeta = {
  reviewed_at: string | null;
  reviewer: string | null;
  method: 'agent' | 'human' | null;
  status: AnchorSecondReviewStatus;
  artifact: string;
};

export type LoteMetaFile = {
  lote: string;
  anchor_slug?: string;
  anchor_second_review?: AnchorSecondReviewMeta;
  subtopico?: string;
};

export type AnchorReviewChecklistItem = {
  id: number;
  label: string;
  pass: boolean | null;
  notes?: string;
};

export const ANCHOR_REVIEW_CHECKLIST: { id: number; label: string }[] = [
  { id: 1, label: 'Enunciado legível e sem artefatos de PDF (enumeração 1) 2))' },
  { id: 2, label: 'meta.banca/ano/subtópico coerentes com a prova' },
  { id: 3, label: 'Gabarito is_correct alinhado ao comando da questão' },
  { id: 4, label: 'danger_zone: cada letra com justificativa distinta' },
  { id: 5, label: 'concept_map: ≥3 itens ancorados no enunciado' },
  { id: 6, label: 'golden_rule: parâmetro/regra citável (rows ou content)' },
  { id: 7, label: 'logic_flow: reveal_mode tap, passos de julgamento (não recicla options)' },
  { id: 8, label: 'Sem vocabulário IPCS/CVC sem âncora no enunciado' },
  { id: 9, label: 'meta.pedagogical_branch coerente com molde L3' },
  { id: 10, label: 'Fontes tier A/B com covers substantivos' },
  { id: 11, label: 'Claims numéricos com fonte ou exam_vs_current documentado' },
  { id: 12, label: 'Captures PNG: enunciado e slides legíveis em mobile' },
  { id: 13, label: 'Didática: aluno entende por que o gabarito é X' },
  { id: 14, label: 'Pegadinhas ensinam distratores, não texto genérico' },
  { id: 15, label: 'Pronto para piloto humano no player (/estudar)' },
];

export function loadLoteMeta(lote: string): LoteMetaFile | null {
  const path = resolve(process.cwd(), `data/catalog-migration/${lote}/lote-meta.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as LoteMetaFile;
}

export function saveLoteMeta(lote: string, meta: LoteMetaFile): void {
  const path = resolve(process.cwd(), `data/catalog-migration/${lote}/lote-meta.json`);
  writeFileSync(path, JSON.stringify(meta, null, 2) + '\n', 'utf8');
}

export function loadAnchorPayload(lote: string, anchorSlug: string): unknown | null {
  const file = resolve(loteQuestionsDir(lote), `${anchorSlug}.json`);
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file, 'utf8'));
  }
  const examples = resolve(process.cwd(), `examples/${anchorSlug}.json`);
  if (existsSync(examples)) {
    return JSON.parse(readFileSync(examples, 'utf8'));
  }
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');
  for (const dir of readdirSync(migrationRoot)) {
    const candidate = resolve(loteQuestionsDir(dir), `${anchorSlug}.json`);
    if (existsSync(candidate)) {
      return JSON.parse(readFileSync(candidate, 'utf8'));
    }
  }
  return null;
}

export function runAnchorAutomatedChecks(
  payload: unknown,
  anchorSlug: string,
): {
  readiness_ok: boolean;
  alignment_ok: boolean;
  numeric_ok: boolean;
  automated_pass: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const readiness = auditQuestaoReadiness(payload as never, { slug: anchorSlug, strict: true });
  if (!readiness.ready_100) {
    for (const c of readiness.checks.filter((x) => x.severity === 'error')) {
      issues.push(`[${c.tier}] ${c.code}: ${c.message}`);
    }
  }

  const alignment = lintSlugAlignment(payload, { strict: true });
  if (slugAlignmentHasErrors(alignment)) {
    for (const i of alignment.filter((x) => x.severity === 'error')) {
      issues.push(`[align] ${i.code}: ${i.message}`);
    }
  }

  const numeric = lintNumericFactcheck(payload);
  if (numericFactcheckHasErrors(numeric)) {
    for (const i of numeric.filter((x) => x.severity === 'error')) {
      issues.push(`[numeric] ${i.code}: ${i.message}`);
    }
  }

  const redeFrio = lintRedeFrioFactcheck(payload as never);
  if (redeFrioFactcheckHasErrors(redeFrio)) {
    for (const i of redeFrio) {
      issues.push(`[rede-frio] ${i.code}: ${i.message}`);
    }
  }

  return {
    readiness_ok: readiness.ready_100,
    alignment_ok: !slugAlignmentHasErrors(alignment),
    numeric_ok: !numericFactcheckHasErrors(numeric),
    automated_pass:
      readiness.ready_100 &&
      !slugAlignmentHasErrors(alignment) &&
      !numericFactcheckHasErrors(numeric) &&
      !redeFrioFactcheckHasErrors(redeFrio),
    issues,
  };
}

export function defaultChecklist(): AnchorReviewChecklistItem[] {
  return ANCHOR_REVIEW_CHECKLIST.map((item) => ({
    ...item,
    pass: null,
    notes: '',
  }));
}

export function anchorArtifactPath(lote: string): string {
  return `artifacts/anchor-review/${lote}.json`;
}

/** L6 — bloqueia apply em massa se âncora do lote não tiver segundo par de olhos. */
export function requireAnchorReviewPass(
  lote: string,
  options: { skip?: boolean } = {},
): { anchor_slug?: string; skipped: boolean } {
  if (options.skip) return { skipped: true };

  const meta = loadLoteMeta(lote);
  if (!meta?.anchor_slug) return { skipped: true };

  const review = meta.anchor_second_review;
  if (review?.status !== 'pass') {
    throw new Error(
      `L6 anchor_second_review.status deve ser "pass" antes de apply (lote=${lote}, anchor=${meta.anchor_slug}). ` +
        `Rode: npm run audit:anchor-review -- --lote=${lote} --record-pass --reviewer=<revisor>`,
    );
  }

  return { anchor_slug: meta.anchor_slug, skipped: false };
}

export function writeAnchorReviewArtifact(
  lote: string,
  data: Record<string, unknown>,
): string {
  const rel = anchorArtifactPath(lote);
  const full = resolve(process.cwd(), rel);
  mkdirSync(resolve(full, '..'), { recursive: true });
  writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return rel;
}
