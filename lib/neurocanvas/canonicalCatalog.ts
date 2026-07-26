import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, normalize } from 'node:path';

import { CATALOG_MIGRATION_ROOT } from '@/lib/catalogMigration/paths';
import { resolveAuditRoots, type NeurocanvasAuditRoots } from '@/lib/neurocanvas/auditRoots';
import { DEDUPE_SCHEMA, DEDUPE_SCHEMA_VERSION, type DedupeSchemaSpec } from '@/lib/neurocanvas/dedupeSchema';
import {
  buildSlugAuthorityIndex,
  getDocumentedPathsForSlug,
  pickDocumentedWinner,
  pickIdenticalContentWinner,
  type DocumentedEvidence,
  type SlugAuthorityIndex,
} from '@/lib/neurocanvas/slugAuthority';
import { canonicalJson } from '@/lib/neurocanvas/canonicalJson';
import { normalizeReverseStudySlide } from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';

/** Somente regras sustentadas por manifest, registry ou contrato documentado. */
export const CANONICAL_PRECEDENCE_RULES = [
  '1. slug listado em manifest.slugs[] de lote *-completo referenciado em handcraft-registry.json.',
  '2. slug listado em manifest.slugs[] de lote gNN com manifest.parent apontando para completo do registry.',
  '3. slug listado em manifest.slugs[] de lote gNN com lote-meta.parent apontando para completo do registry.',
  '4. Cópias byte/semantic idênticas: preferir path documentado acima; senão singleton efetivo.',
  '5. Conteúdo divergente SEM evidência documentada única → não escolher; marcar unresolved.',
  'PROIBIDO: gNN “mais recente”, ordem lexicográfica ou heurística de filesystem como autoridade.',
] as const;

export type CanonicalSelectionReason =
  | 'only_copy'
  | 'registry_completo_manifest'
  | 'handcraft_gnn_parent_manifest'
  | 'lote_meta_parent_only'
  | 'identical_content_documented'
  | 'identical_content_singleton';

export type DuplicateGroupClass =
  | 'byte_identical'
  | 'semantic_identical'
  | 'divergent'
  | 'invalid';

export type CatalogFileEntry = {
  path: string;
  lote: string | null;
  byte_sha256: string | null;
  semantic_sha256: string | null;
  parse_error?: string;
};

export type SlugDuplicateGroup = {
  slug: string;
  file_count: number;
  classification: DuplicateGroupClass;
  paths: string[];
  byte_hashes: string[];
  semantic_hashes: string[];
  differing_fields?: string[];
  parse_errors?: string[];
  resolution?: 'resolved' | 'unresolved';
  resolution_reason?: string;
};

export type SlugCanonicalSelection = {
  slug: string;
  path: string;
  lote: string | null;
  reason: CanonicalSelectionReason;
  duplicate_count: number;
  classification: DuplicateGroupClass | 'singleton';
  content_divergent: boolean;
  differing_fields?: string[];
  evidence_detail?: string;
};

export type CanonicalCatalogResult = {
  dedupe_schema: DedupeSchemaSpec;
  authority_index_summary: {
    registry_completo_lotes: number;
    manifest_lotes_indexed: number;
  };
  selections: Map<string, SlugCanonicalSelection>;
  duplicate_groups: SlugDuplicateGroup[];
  content_divergent_slugs: string[];
  unresolved_slugs: string[];
  invalid_slugs: string[];
  registry_completo_lotes: string[];
  blockers: string[];
  baseline_materially_affected: boolean;
};

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

export function deriveLoteFromPath(filePath: string): string | null {
  const norm = normalize(filePath).replace(/\\/g, '/');
  const m = norm.match(/catalog-migration\/([^/]+)\/questions\//);
  return m?.[1] ?? null;
}

export { loadRegistryCompletoLotes } from '@/lib/neurocanvas/slugAuthority';

export function walkAllCatalogQuestionPaths(catalogRoot: string = CATALOG_MIGRATION_ROOT): string[] {
  const out: string[] = [];

  const walk = (dir: string): void => {
    if (!existsSync(dir)) return;
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'questions') {
          for (const f of readdirSync(p)) {
            if (f.endsWith('.json')) out.push(normalize(join(p, f)));
          }
        } else {
          walk(p);
        }
      }
    }
  };

  walk(catalogRoot);
  return out.sort((a, b) => a.localeCompare(b));
}

export function slugFromQuestionPath(filePath: string): string {
  const base = filePath.split(/[/\\]/).pop() ?? filePath;
  return base.replace(/\.json$/, '');
}

export function groupQuestionPathsBySlug(paths: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const p of paths) {
    const slug = slugFromQuestionPath(p);
    const list = groups.get(slug) ?? [];
    list.push(p);
    groups.set(slug, list);
  }
  for (const [slug, list] of groups) {
    groups.set(slug, [...list].sort((a, b) => a.localeCompare(b)));
  }
  return groups;
}

export function normalizeQuestionForComparison(raw: Record<string, unknown>): Record<string, unknown> {
  const meta = (raw.meta ?? {}) as Record<string, unknown>;
  const qd = (raw.question_data ?? {}) as Record<string, unknown>;
  const slidesRaw = raw.reverse_study_slides ?? raw.study_slides;
  const slides = Array.isArray(slidesRaw)
    ? sortReverseStudySlides(
        slidesRaw.map((s) => normalizeReverseStudySlide(s)) as { type?: string }[],
      )
    : [];

  const options = Array.isArray(qd.options)
    ? [...(qd.options as { id: string; text: string; is_correct?: boolean }[])]
        .map((o) => ({
          id: String(o.id),
          text: String(o.text ?? ''),
          is_correct: Boolean(o.is_correct),
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    : [];

  return {
    meta: {
      banca: meta.banca ?? null,
      topico: meta.topico ?? null,
      subtopico: meta.subtopico ?? null,
      family: meta.family ?? null,
      pedagogical_branch: meta.pedagogical_branch ?? null,
      content_standard: meta.content_standard ?? null,
    },
    question_data: {
      instruction: typeof qd.instruction === 'string' ? qd.instruction : '',
      text_fragment: typeof qd.text_fragment === 'string' ? qd.text_fragment : null,
      options,
    },
    reverse_study_slides: slides,
  };
}

function diffFieldPaths(a: unknown, b: unknown, prefix = ''): string[] {
  if (a === b) return [];
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return prefix ? [prefix] : ['root'];
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return [prefix ? `${prefix}.length` : 'length'];
    const out: string[] = [];
    for (let i = 0; i < a.length; i += 1) {
      out.push(...diffFieldPaths(a[i], b[i], prefix ? `${prefix}[${i}]` : `[${i}]`));
    }
    return out;
  }
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const keys = [...new Set([...Object.keys(aObj), ...Object.keys(bObj)])].sort();
  const out: string[] = [];
  for (const key of keys) {
    const next = prefix ? `${prefix}.${key}` : key;
    out.push(...diffFieldPaths(aObj[key], bObj[key], next));
  }
  return out;
}

export function readQuestionJsonFile(path: string): Record<string, unknown> {
  const text = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(text) as Record<string, unknown>;
}

export function analyzeCatalogFile(path: string): CatalogFileEntry {
  try {
    const rawText = readFileSync(path, 'utf8');
    const raw = readQuestionJsonFile(path);
    const normalized = normalizeQuestionForComparison(raw);
    return {
      path,
      lote: deriveLoteFromPath(path),
      byte_sha256: sha256Hex(rawText),
      semantic_sha256: sha256Hex(canonicalJson(normalized)),
    };
  } catch (err) {
    return {
      path,
      lote: deriveLoteFromPath(path),
      byte_sha256: null,
      semantic_sha256: null,
      parse_error: err instanceof Error ? err.message : String(err),
    };
  }
}

function reasonFromEvidence(
  evidence: DocumentedEvidence | null,
  duplicateCount: number,
  identicalSingleton: boolean,
): CanonicalSelectionReason {
  if (duplicateCount <= 1) return 'only_copy';
  if (evidence === 'registry_completo_manifest') return 'registry_completo_manifest';
  if (evidence === 'handcraft_gnn_parent_manifest') return 'handcraft_gnn_parent_manifest';
  if (evidence === 'lote_meta_parent_only') return 'lote_meta_parent_only';
  if (identicalSingleton) return 'identical_content_singleton';
  return 'identical_content_documented';
}

export function buildCanonicalCatalog(
  options?: { strict?: boolean } & Partial<NeurocanvasAuditRoots>,
): CanonicalCatalogResult {
  const { catalogRoot } = resolveAuditRoots(options);
  const authorityIndex: SlugAuthorityIndex = buildSlugAuthorityIndex(catalogRoot);
  const paths = walkAllCatalogQuestionPaths(catalogRoot);
  const groups = groupQuestionPathsBySlug(paths);

  const selections = new Map<string, SlugCanonicalSelection>();
  const duplicate_groups: SlugDuplicateGroup[] = [];
  const content_divergent_slugs: string[] = [];
  const unresolved_slugs: string[] = [];
  const invalid_slugs: string[] = [];
  const blockers: string[] = [];

  for (const [slug, filePaths] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const entries = filePaths.map(analyzeCatalogFile);
    const parseErrors = entries.filter((e) => e.parse_error);
    if (parseErrors.length === entries.length) {
      invalid_slugs.push(slug);
      blockers.push(`slug ${slug}: todos os arquivos inválidos`);
      if (filePaths.length > 1) {
        duplicate_groups.push({
          slug,
          file_count: filePaths.length,
          classification: 'invalid',
          paths: filePaths,
          byte_hashes: [],
          semantic_hashes: [],
          parse_errors: parseErrors.map((e) => `${e.path}: ${e.parse_error}`),
          resolution: 'unresolved',
          resolution_reason: 'parse_error',
        });
      }
      continue;
    }

    const valid = entries.filter(
      (e): e is CatalogFileEntry & { byte_sha256: string; semantic_sha256: string } =>
        !e.parse_error && Boolean(e.byte_sha256) && Boolean(e.semantic_sha256),
    );

    const byteHashes = [...new Set(valid.map((e) => e.byte_sha256))];
    const semanticHashes = [...new Set(valid.map((e) => e.semantic_sha256))];
    const semanticHashByPath = new Map(valid.map((e) => [e.path, e.semantic_sha256]));

    let classification: DuplicateGroupClass | 'singleton' = 'singleton';
    let groupClass: DuplicateGroupClass | undefined;
    if (filePaths.length > 1) {
      if (parseErrors.length > 0) groupClass = 'invalid';
      else if (byteHashes.length === 1) groupClass = 'byte_identical';
      else if (semanticHashes.length === 1) groupClass = 'semantic_identical';
      else groupClass = 'divergent';
      classification = groupClass;

      let differing_fields: string[] | undefined;
      if (groupClass === 'divergent') {
        const normA = normalizeQuestionForComparison(readQuestionJsonFile(valid[0]!.path));
        const normB = normalizeQuestionForComparison(readQuestionJsonFile(valid[1]!.path));
        differing_fields = [...new Set(diffFieldPaths(normA, normB))].slice(0, 40);
      }

      duplicate_groups.push({
        slug,
        file_count: filePaths.length,
        classification: groupClass,
        paths: filePaths,
        byte_hashes: byteHashes,
        semantic_hashes: semanticHashes,
        differing_fields,
        parse_errors: parseErrors.length
          ? parseErrors.map((e) => `${e.path}: ${e.parse_error}`)
          : undefined,
      });
    }

    if (classification === 'divergent') {
      content_divergent_slugs.push(slug);
    }

    let winnerPath: string;
    let reason: CanonicalSelectionReason;
    let evidenceDetail: string;

    if (classification === 'divergent') {
      const pick = pickDocumentedWinner(slug, filePaths, semanticHashByPath, authorityIndex);
      const lastGroup = duplicate_groups[duplicate_groups.length - 1];
      if (pick.status === 'unresolved') {
        unresolved_slugs.push(slug);
        blockers.push(`slug ${slug}: ${pick.reason}`);
        if (lastGroup) {
          lastGroup.resolution = 'unresolved';
          lastGroup.resolution_reason = pick.reason;
        }
        if (options?.strict) {
          throw new Error(`Divergência canônica não resolvida: ${slug}`);
        }
        continue;
      }
      winnerPath = pick.winner.path;
      reason = reasonFromEvidence(pick.winner.evidence, filePaths.length, false);
      evidenceDetail = pick.reason;
      if (lastGroup) {
        lastGroup.resolution = 'resolved';
        lastGroup.resolution_reason = pick.reason;
      }
    } else {
      const pick = pickIdenticalContentWinner(slug, filePaths, authorityIndex);
      winnerPath = pick.path;
      const documented = getDocumentedEvidence(pick.path, slug, authorityIndex);
      reason = reasonFromEvidence(
        documented,
        filePaths.length,
        !pick.documented && filePaths.length > 1,
      );
      evidenceDetail = pick.reason;
      if (filePaths.length > 1) {
        const lastGroup = duplicate_groups[duplicate_groups.length - 1];
        if (lastGroup) {
          lastGroup.resolution = 'resolved';
          lastGroup.resolution_reason = pick.reason;
        }
      }
    }

    selections.set(slug, {
      slug,
      path: winnerPath,
      lote: deriveLoteFromPath(winnerPath),
      reason,
      duplicate_count: filePaths.length,
      classification,
      content_divergent: classification === 'divergent',
      differing_fields:
        classification === 'divergent'
          ? duplicate_groups[duplicate_groups.length - 1]?.differing_fields
          : undefined,
      evidence_detail: evidenceDetail,
    });
  }

  const totalSlugs = groups.size;
  const baseline_materially_affected =
    unresolved_slugs.length > 0 || unresolved_slugs.length / totalSlugs > 0.01;

  return {
    dedupe_schema: DEDUPE_SCHEMA,
    authority_index_summary: {
      registry_completo_lotes: authorityIndex.registry_completo_lotes.size,
      manifest_lotes_indexed: authorityIndex.lotes.size,
    },
    selections,
    duplicate_groups,
    content_divergent_slugs,
    unresolved_slugs,
    invalid_slugs,
    registry_completo_lotes: [...authorityIndex.registry_completo_lotes].sort(),
    blockers,
    baseline_materially_affected,
  };
}

function getDocumentedEvidence(
  path: string,
  slug: string,
  index: SlugAuthorityIndex,
): DocumentedEvidence | null {
  const hits = getDocumentedPathsForSlug(slug, [path], index);
  return hits[0]?.evidence ?? null;
}

export function loadCanonicalQuestionJson(slug: string, catalog?: CanonicalCatalogResult): unknown {
  const resolved = catalog ?? buildCanonicalCatalog();
  const sel = resolved.selections.get(slug);
  if (!sel) {
    throw new Error(`Slug sem fonte canônica: ${slug}`);
  }
  return readQuestionJsonFile(sel.path);
}

export function iterateCanonicalQuestions(
  cb: (slug: string, path: string) => void,
  catalog?: CanonicalCatalogResult,
): void {
  const resolved = catalog ?? buildCanonicalCatalog();
  for (const [slug, sel] of [...resolved.selections.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    cb(slug, sel.path);
  }
}

export { DEDUPE_SCHEMA_VERSION };
