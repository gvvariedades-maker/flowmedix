import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { CATALOG_MIGRATION_ROOT, loteQuestionsDir } from '@/lib/catalogMigration/paths';

type LoteMeta = {
  anchor_slug?: string;
  subtopico?: string;
};

type GoldenAnchorsFile = {
  anchors: Record<
    string,
    { slug_catalog?: string | null; file?: string; pedagogical_branch?: string }
  >;
};

export type LoteReviewTarget = {
  slug: string;
  source: 'local' | 'supabase';
  reason: string;
};

function readLoteMeta(lote: string): LoteMeta | null {
  const metaPath = resolve(CATALOG_MIGRATION_ROOT, lote, 'lote-meta.json');
  if (!existsSync(metaPath)) return null;
  return JSON.parse(readFileSync(metaPath, 'utf8')) as LoteMeta;
}

function firstQuestionSlug(lote: string): string | null {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();
  if (files.length === 0) return null;
  return files[0]!.replace(/\.json$/, '');
}

/** Resolve slug para capture L4 a partir do lote (âncora explícita → 1º JSON). */
export function resolveLoteReviewSlug(lote: string): LoteReviewTarget {
  const meta = readLoteMeta(lote);
  if (meta?.anchor_slug?.trim()) {
    return {
      slug: meta.anchor_slug.trim(),
      source: 'local',
      reason: 'lote-meta.anchor_slug',
    };
  }

  const first = firstQuestionSlug(lote);
  if (first) {
    return { slug: first, source: 'local', reason: 'primeiro JSON do lote' };
  }

  throw new Error(`Lote sem questions/ ou anchor_slug: ${lote}`);
}

/** Resolve slug a partir de chave em *-golden-anchors.json (ex.: calendario_infantil). */
export function resolveAnchorKeyReviewSlug(
  anchorsPath: string,
  anchorKey: string,
): LoteReviewTarget {
  const full = resolve(process.cwd(), anchorsPath);
  if (!existsSync(full)) {
    throw new Error(`Registry de âncoras não encontrado: ${full}`);
  }
  const registry = JSON.parse(readFileSync(full, 'utf8')) as GoldenAnchorsFile;
  const entry = registry.anchors[anchorKey];
  if (!entry) {
    throw new Error(`Âncora desconhecida: ${anchorKey}`);
  }
  const slug = entry.slug_catalog?.trim();
  if (!slug) {
    throw new Error(`Âncora ${anchorKey} sem slug_catalog — use --slug explícito`);
  }
  return { slug, source: 'local', reason: `golden-anchors.${anchorKey}` };
}
