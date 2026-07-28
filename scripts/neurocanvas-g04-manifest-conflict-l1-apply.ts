#!/usr/bin/env tsx
/**
 * G0.4 Lane Reconciliation — Manifest Conflict L1 (6 casos).
 *
 * Salvaguardas (paridade G0.4 apply):
 * - allowlist exata MANIFEST_CONFLICT_L1_AUTHORIZED_RELATIVE_PATHS
 * - hash guard: prior_semantic_sha256 ou expected (idempotente)
 * - QuestaoCompletaSchema + 4 slides canônicos na autoridade
 * - plano completo antes de qualquer escrita; escrita atômica
 * - sem Supabase, baseline G0.4 ou production_ready
 */
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve, sep } from 'node:path';

import { CATALOG_MIGRATION_ROOT } from '@/lib/catalogMigration/paths';
import { canonicalJson } from '@/lib/neurocanvas/canonicalJson';
import {
  buildCanonicalCatalog,
  normalizeQuestionForComparison,
  readQuestionJsonFile,
} from '@/lib/neurocanvas/canonicalCatalog';
import { buildEditorialQueue } from '@/lib/neurocanvas/editorialQueue';
import { QuestaoCompletaSchema } from '@/lib/validations';

import {
  CANONICAL_SLIDE_TYPES,
  relativeTargetPath,
  serializePayload,
  semanticHashOf,
} from './neurocanvas-g04-apply-editorial';
import {
  MANIFEST_CONFLICT_L1_AUTHORIZED_RELATIVE_PATHS,
  MANIFEST_CONFLICT_L1_DECISIONS,
  type ManifestConflictL1Decision,
} from './neurocanvas-g04-manifest-conflict-l1-decisions';

function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function semanticHashOfFile(path: string): string {
  const raw = readQuestionJsonFile(path);
  return sha256Hex(canonicalJson(normalizeQuestionForComparison(raw)));
}

function writeAtomic(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.tmp-${process.pid}-${Date.now()}`;
  try {
    writeFileSync(temp, contents, 'utf8');
    renameSync(temp, path);
  } catch (err) {
    if (existsSync(temp)) unlinkSync(temp);
    throw err;
  }
}

function removeSlugFromManifest(manifestPath: string, slug: string): boolean {
  const abs = resolve(process.cwd(), manifestPath);
  if (!existsSync(abs)) return false;
  const manifest = JSON.parse(readFileSync(abs, 'utf8')) as { slugs?: string[] };
  if (!Array.isArray(manifest.slugs) || !manifest.slugs.includes(slug)) return false;
  manifest.slugs = manifest.slugs.filter((s) => s !== slug);
  writeFileSync(abs, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return true;
}

export type ManifestAlignPlanEntry = {
  slug: string;
  case_id: string;
  relative_path: string;
  absolute_path: string;
  action: 'write' | 'skip_already_current';
  current_semantic_sha256: string | null;
  prior_semantic_sha256: string;
  expected_semantic_sha256: string;
};

export type ManifestConflictApplyLine = {
  slug: string;
  case_id: string;
  manifest_removed: string[];
  copies_written: string[];
  copies_skipped: string[];
};

const authorizedPaths = new Set<string>(MANIFEST_CONFLICT_L1_AUTHORIZED_RELATIVE_PATHS);

export function validateManifestConflictL1Decisions(
  decisions: readonly ManifestConflictL1Decision[] = MANIFEST_CONFLICT_L1_DECISIONS,
  catalogRoot: string = CATALOG_MIGRATION_ROOT,
): string[] {
  const errors: string[] = [];

  for (const decision of decisions) {
    const label = decision.slug;
    const authorityPath = resolve(
      catalogRoot,
      decision.canonical_lote,
      'questions',
      `${decision.slug}.json`,
    );
    if (!existsSync(authorityPath)) {
      errors.push(`${label}: autoridade ausente ${authorityPath}`);
      continue;
    }

    const raw = readQuestionJsonFile(authorityPath);
    const parsed = QuestaoCompletaSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push(`${label}: QuestaoCompletaSchema falhou na autoridade`);
    }

    const slidesRaw = (raw.reverse_study_slides ?? raw.study_slides) as unknown;
    if (!Array.isArray(slidesRaw) || slidesRaw.length !== 4) {
      errors.push(`${label}: autoridade sem 4 slides`);
    } else {
      const types = slidesRaw
        .map((s) => (s as { type?: unknown }).type)
        .filter((t): t is string => typeof t === 'string')
        .sort();
      const expected = [...CANONICAL_SLIDE_TYPES].sort();
      if (types.join(',') !== expected.join(',')) {
        errors.push(`${label}: tipos de slide inválidos na autoridade`);
      }
    }

    const authoritySemantic = semanticHashOf(raw);
    if (authoritySemantic !== decision.expected_semantic_sha256) {
      errors.push(
        `${label}: hash autoridade ${authoritySemantic} ≠ expected ${decision.expected_semantic_sha256}`,
      );
    }

    if (decision.align_targets.length === 0) {
      errors.push(`${label}: sem align_targets`);
    }
  }

  return errors;
}

export function planManifestConflictL1(options?: {
  catalogRoot?: string;
  decisions?: readonly ManifestConflictL1Decision[];
}): ManifestAlignPlanEntry[] {
  const catalogRoot = resolve(options?.catalogRoot ?? CATALOG_MIGRATION_ROOT);
  const decisions = options?.decisions ?? MANIFEST_CONFLICT_L1_DECISIONS;
  const entries: ManifestAlignPlanEntry[] = [];

  for (const decision of decisions) {
    const targetByLote = new Map(decision.align_targets.map((t) => [t.lote, t]));

    for (const target of decision.align_targets) {
      const relativePath = relativeTargetPath(target.lote, decision.slug);

      if (!authorizedPaths.has(relativePath)) {
        throw new Error(`path não autorizado: ${relativePath}`);
      }

      const absolutePath = resolve(catalogRoot, target.lote, 'questions', `${decision.slug}.json`);
      if (absolutePath !== catalogRoot && !absolutePath.startsWith(catalogRoot + sep)) {
        throw new Error(`path fora da raiz do catálogo: ${relativePath}`);
      }

      let current: string | null = null;
      if (existsSync(absolutePath)) {
        try {
          current = semanticHashOfFile(absolutePath);
        } catch (err) {
          throw new Error(
            `${relativePath}: ilegível — ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      let action: 'write' | 'skip_already_current';
      if (current === null) {
        action = 'write';
      } else if (current === decision.expected_semantic_sha256) {
        action = 'skip_already_current';
      } else if (current === target.prior_semantic_sha256) {
        action = 'write';
      } else {
        throw new Error(
          `${relativePath}: hash inesperado ${current}. Esperado prior ${target.prior_semantic_sha256} ou expected ${decision.expected_semantic_sha256}. Abortado.`,
        );
      }

      entries.push({
        slug: decision.slug,
        case_id: decision.case_id,
        relative_path: relativePath,
        absolute_path: absolutePath,
        action,
        current_semantic_sha256: current,
        prior_semantic_sha256: target.prior_semantic_sha256,
        expected_semantic_sha256: decision.expected_semantic_sha256,
      });
    }

    // Garantir que todos os paths autorizados para o slug estão nos targets
    for (const rel of MANIFEST_CONFLICT_L1_AUTHORIZED_RELATIVE_PATHS) {
      if (!rel.endsWith(`/questions/${decision.slug}.json`)) continue;
      const lote = rel.split('/')[0]!;
      if (!targetByLote.has(lote)) {
        throw new Error(`${decision.slug}: allowlist ${rel} sem align_target correspondente`);
      }
    }
  }

  return entries;
}

export function applyManifestConflictL1(options?: {
  catalogRoot?: string;
  decisions?: readonly ManifestConflictL1Decision[];
  dryRun?: boolean;
}): ManifestConflictApplyLine[] {
  const catalogRoot = resolve(options?.catalogRoot ?? CATALOG_MIGRATION_ROOT);
  const decisions = options?.decisions ?? MANIFEST_CONFLICT_L1_DECISIONS;
  const dryRun = options?.dryRun ?? false;

  const validationErrors = validateManifestConflictL1Decisions(decisions, catalogRoot);
  if (validationErrors.length) {
    throw new Error(`decisões inválidas:\n  - ${validationErrors.join('\n  - ')}`);
  }

  const plan = planManifestConflictL1({ catalogRoot, decisions });
  const lines: ManifestConflictApplyLine[] = [];

  for (const decision of decisions) {
    const authorityPath = resolve(
      catalogRoot,
      decision.canonical_lote,
      'questions',
      `${decision.slug}.json`,
    );
    const question = readQuestionJsonFile(authorityPath);
    const serialized = serializePayload(question);

    const manifestRemoved: string[] = [];
    if (!dryRun) {
      for (const manifestRel of decision.remove_from_manifests) {
        if (removeSlugFromManifest(manifestRel, decision.slug)) {
          manifestRemoved.push(manifestRel);
        }
      }
    } else {
      for (const manifestRel of decision.remove_from_manifests) {
        const abs = resolve(process.cwd(), manifestRel);
        if (!existsSync(abs)) continue;
        const manifest = JSON.parse(readFileSync(abs, 'utf8')) as { slugs?: string[] };
        if (manifest.slugs?.includes(decision.slug)) manifestRemoved.push(manifestRel);
      }
    }

    const copiesWritten: string[] = [];
    const copiesSkipped: string[] = [];
    const slugPlan = plan.filter((p) => p.slug === decision.slug);

    for (const entry of slugPlan) {
      if (entry.action === 'skip_already_current') {
        copiesSkipped.push(entry.relative_path);
        continue;
      }

      if (!dryRun) {
        writeAtomic(entry.absolute_path, serialized);
        const after = semanticHashOfFile(entry.absolute_path);
        if (after !== decision.expected_semantic_sha256) {
          throw new Error(
            `${entry.relative_path}: hash pós-alinhamento ${after} ≠ ${decision.expected_semantic_sha256}`,
          );
        }
      }
      copiesWritten.push(entry.relative_path);
    }

    lines.push({
      slug: decision.slug,
      case_id: decision.case_id,
      manifest_removed: manifestRemoved,
      copies_written: copiesWritten,
      copies_skipped: copiesSkipped,
    });
  }

  return lines;
}

function main(): void {
  const dryRun = process.argv.includes('--dry-run');
  const apply = process.argv.includes('--apply');
  if (!dryRun && !apply) {
    console.error('Uso: --dry-run | --apply');
    process.exitCode = 1;
    return;
  }

  try {
    const lines = applyManifestConflictL1({ dryRun });
    const mode = dryRun ? 'dry-run' : 'apply';
    console.log(`[G0.4-manifest-L1] mode=${mode} casos=${lines.length}`);

    for (const line of lines) {
      console.log(`\n${line.case_id} · ${line.slug}`);
      console.log(`  manifests removidos: ${line.manifest_removed.length}`);
      for (const m of line.manifest_removed) console.log(`    - ${m}`);
      console.log(
        `  cópias alinhadas: ${line.copies_written.length} · puladas: ${line.copies_skipped.length}`,
      );
      for (const p of line.copies_written) console.log(`    ESCRITO ${p}`);
    }

    if (!dryRun) {
      const catalog = buildCanonicalCatalog();
      const report = buildEditorialQueue();
      console.log(
        `\n[G0.4-manifest-L1] unresolved=${catalog.unresolved_slugs.length} manifest_conflict_lane=${report.reconciliation.manifest_conflict_lane_count}`,
      );
    }
  } catch (err) {
    console.error(`[G0.4-manifest-L1] ABORTADO: ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  }
}

const invokedAsCli = /neurocanvas-g04-manifest-conflict-l1-apply\.[cm]?tsx?$/.test(
  process.argv[1] ?? '',
);
if (invokedAsCli) main();
