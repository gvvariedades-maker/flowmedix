#!/usr/bin/env tsx
/**
 * G0.4 Lane Reconciliation — Manifest Conflict L1 (6 casos).
 *
 * 1. Remove slug de manifests registry_completo mis-tag (autoridade única).
 * 2. Alinha todas as cópias em disco ao JSON canônico do lote autoridade.
 *
 * Não altera baseline G0.4 nem production_ready.
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
import { dirname, isAbsolute, resolve, sep } from 'node:path';

import { CATALOG_MIGRATION_ROOT } from '@/lib/catalogMigration/paths';
import { canonicalJson } from '@/lib/neurocanvas/canonicalJson';
import {
  buildCanonicalCatalog,
  normalizeQuestionForComparison,
  readQuestionJsonFile,
} from '@/lib/neurocanvas/canonicalCatalog';
import { buildEditorialQueue } from '@/lib/neurocanvas/editorialQueue';

import {
  MANIFEST_CONFLICT_L1_DECISIONS,
  type ManifestConflictL1Decision,
} from './neurocanvas-g04-manifest-conflict-l1-decisions';
import { serializePayload } from './neurocanvas-g04-apply-editorial';

function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function semanticHashOfFile(path: string): string {
  const raw = readQuestionJsonFile(path);
  return sha256Hex(canonicalJson(normalizeQuestionForComparison(raw)));
}

function writeAtomic(path: string, contents: string): void {
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, contents, 'utf8');
  renameSync(tmp, path);
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

function canonicalQuestionPath(catalogRoot: string, lote: string, slug: string): string {
  return resolve(catalogRoot, lote, 'questions', `${slug}.json`);
}

export type ManifestConflictApplyLine = {
  slug: string;
  case_id: string;
  manifest_removed: string[];
  copies_written: string[];
  copies_skipped: string[];
};

export function applyManifestConflictL1(options?: {
  catalogRoot?: string;
  decisions?: ManifestConflictL1Decision[];
  dryRun?: boolean;
}): ManifestConflictApplyLine[] {
  const catalogRoot = options?.catalogRoot ?? CATALOG_MIGRATION_ROOT;
  const decisions = options?.decisions ?? MANIFEST_CONFLICT_L1_DECISIONS;
  const dryRun = options?.dryRun ?? false;

  const catalog = buildCanonicalCatalog({ catalogRoot });
  const lines: ManifestConflictApplyLine[] = [];

  for (const decision of decisions) {
    const group = catalog.duplicate_groups.find((g) => g.slug === decision.slug);
    if (!group) {
      throw new Error(`slug ${decision.slug} não encontrado no catálogo`);
    }

    const authorityPath = canonicalQuestionPath(catalogRoot, decision.canonical_lote, decision.slug);
    if (!existsSync(authorityPath)) {
      throw new Error(`autoridade ausente: ${authorityPath}`);
    }

    const authoritySemantic = semanticHashOfFile(authorityPath);
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

    for (const path of group.paths) {
      const abs = isAbsolute(path) ? path : resolve(catalogRoot, path);
      const rel = abs.includes('catalog-migration')
        ? `data/catalog-migration/${abs.split(`${sep}catalog-migration${sep}`)[1]?.replace(/\\/g, '/') ?? abs}`
        : abs.replace(/\\/g, '/');
      if (!existsSync(abs)) continue;

      const current = semanticHashOfFile(abs);
      if (current === authoritySemantic) {
        copiesSkipped.push(rel);
        continue;
      }

      if (!dryRun) {
        writeAtomic(abs, serialized);
        const after = semanticHashOfFile(abs);
        if (after !== authoritySemantic) {
          throw new Error(`${rel}: hash pós-alinhamento ${after} ≠ autoridade ${authoritySemantic}`);
        }
      }
      copiesWritten.push(rel);
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

  const lines = applyManifestConflictL1({ dryRun });
  const mode = dryRun ? 'dry-run' : 'apply';
  console.log(`[G0.4-manifest-L1] mode=${mode} casos=${lines.length}`);

  for (const line of lines) {
    console.log(`\n${line.case_id} · ${line.slug}`);
    console.log(`  manifests removidos: ${line.manifest_removed.length}`);
    for (const m of line.manifest_removed) console.log(`    - ${m}`);
    console.log(`  cópias alinhadas: ${line.copies_written.length} · puladas: ${line.copies_skipped.length}`);
    for (const p of line.copies_written) console.log(`    ESCRITO ${p}`);
  }

  if (!dryRun) {
    const catalog = buildCanonicalCatalog();
    const mc = buildEditorialQueueManifestConflictCount();
    console.log(
      `\n[G0.4-manifest-L1] unresolved=${catalog.unresolved_slugs.length} manifest_conflict_lane=${mc}`,
    );
  }
}

/** Conta manifest_conflict_lane após apply. */
function buildEditorialQueueManifestConflictCount(): number {
  const report = buildEditorialQueue();
  return report.reconciliation.manifest_conflict_lane_count;
}

const invokedAsCli = /neurocanvas-g04-manifest-conflict-l1-apply\.[cm]?tsx?$/.test(
  process.argv[1] ?? '',
);
if (invokedAsCli) main();
