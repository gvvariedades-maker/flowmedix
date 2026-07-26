import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { CATALOG_MIGRATION_ROOT } from '@/lib/catalogMigration/paths';

export type LoteManifestIndex = {
  lote: string;
  manifest_path: string;
  slugs: Set<string>;
  parent_lote: string | null;
  lote_meta_parent: string | null;
};

export type SlugAuthorityIndex = {
  registry_completo_lotes: Set<string>;
  registry_manifest_paths: string[];
  lotes: Map<string, LoteManifestIndex>;
  slug_to_manifest_lotes: Map<string, string[]>;
};

function extractLoteNameFromRef(ref: string): string | null {
  const norm = ref.replace(/\\/g, '/');
  const fromPath = norm.match(/catalog-migration\/([^/]+)\//);
  if (fromPath?.[1]) return fromPath[1];
  if (!norm.includes('/')) return norm;
  return null;
}

export function loadRegistryCompletoLotes(): Set<string> {
  const registryPath = resolve(CATALOG_MIGRATION_ROOT, 'handcraft-registry.json');
  const lotes = new Set<string>();
  if (!existsSync(registryPath)) return lotes;

  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
    pacotes?: Record<string, { manifest?: string }>;
  };

  for (const pkg of Object.values(registry.pacotes ?? {})) {
    const manifest = pkg.manifest?.replace(/\\/g, '/');
    if (!manifest) continue;
    const m = manifest.match(/catalog-migration\/([^/]+)\//);
    if (m?.[1]) lotes.add(m[1]);
  }
  return lotes;
}

function readLoteMetaParent(loteDir: string): string | null {
  const metaPath = join(loteDir, 'lote-meta.json');
  if (!existsSync(metaPath)) return null;
  try {
    const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as { parent?: string };
    return meta.parent ?? null;
  } catch {
    return null;
  }
}

export function buildSlugAuthorityIndex(): SlugAuthorityIndex {
  const registry_completo_lotes = loadRegistryCompletoLotes();
  const registry_manifest_paths: string[] = [];
  const registryPath = resolve(CATALOG_MIGRATION_ROOT, 'handcraft-registry.json');
  if (existsSync(registryPath)) {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
      pacotes?: Record<string, { manifest?: string }>;
    };
    for (const pkg of Object.values(registry.pacotes ?? {})) {
      if (pkg.manifest) registry_manifest_paths.push(pkg.manifest.replace(/\\/g, '/'));
    }
  }

  const lotes = new Map<string, LoteManifestIndex>();
  const slug_to_manifest_lotes = new Map<string, string[]>();

  if (!existsSync(CATALOG_MIGRATION_ROOT)) {
    return { registry_completo_lotes, registry_manifest_paths, lotes, slug_to_manifest_lotes };
  }

  for (const ent of readdirSync(CATALOG_MIGRATION_ROOT, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const lote = ent.name;
    const loteDir = join(CATALOG_MIGRATION_ROOT, lote);
    const manifestPath = join(loteDir, 'manifest.json');
    if (!existsSync(manifestPath)) continue;

    let parsed: { slugs?: string[]; parent?: string } = {};
    try {
      parsed = JSON.parse(readFileSync(manifestPath, 'utf8')) as typeof parsed;
    } catch {
      continue;
    }

    const slugs = new Set(parsed.slugs ?? []);
    const parent_lote = parsed.parent ? extractLoteNameFromRef(parsed.parent) : null;
    const lote_meta_parent = readLoteMetaParent(loteDir);

    lotes.set(lote, {
      lote,
      manifest_path: manifestPath,
      slugs,
      parent_lote,
      lote_meta_parent,
    });

    for (const slug of slugs) {
      const list = slug_to_manifest_lotes.get(slug) ?? [];
      list.push(lote);
      slug_to_manifest_lotes.set(slug, list);
    }
  }

  return {
    registry_completo_lotes,
    registry_manifest_paths,
    lotes,
    slug_to_manifest_lotes,
  };
}

export type DocumentedEvidence =
  | 'registry_completo_manifest'
  | 'handcraft_gnn_parent_manifest'
  | 'lote_meta_parent_only';

export type DocumentedPath = {
  path: string;
  lote: string;
  evidence: DocumentedEvidence;
  evidence_detail: string;
};

function parentPointsToRegistryCompleto(
  parentRef: string | null,
  index: SlugAuthorityIndex,
): string | null {
  if (!parentRef) return null;
  const parentLote = extractLoteNameFromRef(parentRef);
  if (!parentLote) return null;
  if (index.registry_completo_lotes.has(parentLote)) return parentLote;
  return null;
}

export function getDocumentedPathsForSlug(
  slug: string,
  paths: string[],
  index: SlugAuthorityIndex,
): DocumentedPath[] {
  const documented: DocumentedPath[] = [];

  for (const path of paths) {
    const lote = path.replace(/\\/g, '/').match(/catalog-migration\/([^/]+)\/questions\//)?.[1];
    if (!lote) continue;

    const manifest = index.lotes.get(lote);
    if (!manifest?.slugs.has(slug)) continue;

    if (index.registry_completo_lotes.has(lote)) {
      documented.push({
        path,
        lote,
        evidence: 'registry_completo_manifest',
        evidence_detail: `slug em manifest.slugs[] do lote ${lote} (handcraft-registry.json)`,
      });
      continue;
    }

    const parentFromManifest = parentPointsToRegistryCompleto(manifest.parent_lote, index);
    if (parentFromManifest) {
      documented.push({
        path,
        lote,
        evidence: 'handcraft_gnn_parent_manifest',
        evidence_detail: `manifest.parent → ${parentFromManifest}; slug listado em ${lote}`,
      });
      continue;
    }

    const parentFromMeta = parentPointsToRegistryCompleto(manifest.lote_meta_parent, index);
    if (parentFromMeta) {
      documented.push({
        path,
        lote,
        evidence: 'lote_meta_parent_only',
        evidence_detail: `lote-meta.parent → ${parentFromMeta}; slug listado em ${lote}`,
      });
    }
  }

  return documented.sort((a, b) => a.path.localeCompare(b.path));
}

const EVIDENCE_RANK: Record<DocumentedEvidence, number> = {
  registry_completo_manifest: 0,
  handcraft_gnn_parent_manifest: 1,
  lote_meta_parent_only: 2,
};

export function pickDocumentedWinner(
  slug: string,
  paths: string[],
  semanticHashByPath: Map<string, string>,
  index: SlugAuthorityIndex,
):
  | { status: 'resolved'; winner: DocumentedPath; reason: string }
  | { status: 'unresolved'; reason: string; documented: DocumentedPath[] } {
  const documented = getDocumentedPathsForSlug(slug, paths, index);

  if (documented.length === 0) {
    return {
      status: 'unresolved',
      reason: 'slug sem cópia listada em manifest/registry/contrato documentado',
      documented: [],
    };
  }

  const bestRank = Math.min(...documented.map((d) => EVIDENCE_RANK[d.evidence]));
  const topTier = documented.filter((d) => EVIDENCE_RANK[d.evidence] === bestRank);
  const hashes = [...new Set(topTier.map((d) => semanticHashByPath.get(d.path)).filter(Boolean))];

  if (topTier.length === 1) {
    const winner = topTier[0]!;
    return { status: 'resolved', winner, reason: winner.evidence_detail };
  }

  if (hashes.length === 1) {
    const winner = topTier.sort((a, b) => a.path.localeCompare(b.path))[0]!;
    return {
      status: 'resolved',
      winner,
      reason: `${winner.evidence_detail} (conteúdo idêntico entre ${topTier.length} cópias documentadas)`,
    };
  }

  return {
    status: 'unresolved',
    reason: `${topTier.length} cópias documentadas no mesmo tier (${topTier[0]?.evidence}) com conteúdo divergente`,
    documented: topTier,
  };
}

export function pickIdenticalContentWinner(
  slug: string,
  paths: string[],
  index: SlugAuthorityIndex,
): { path: string; documented: boolean; reason: string } {
  const documented = getDocumentedPathsForSlug(slug, paths, index);
  if (documented.length > 0) {
    const best = documented.sort(
      (a, b) => EVIDENCE_RANK[a.evidence] - EVIDENCE_RANK[b.evidence] || a.path.localeCompare(b.path),
    )[0]!;
    return { path: best.path, documented: true, reason: best.evidence_detail };
  }
  const fallback = [...paths].sort((a, b) => a.localeCompare(b))[0]!;
  return {
    path: fallback,
    documented: false,
    reason: 'cópias idênticas sem manifest documentado (singleton efetivo)',
  };
}
