#!/usr/bin/env tsx
/**
 * Mapeia drift taxonômico do segmento URL `promocao-a-saude-e-prevencao-de-agravos`:
 * - slugs no manifest do pacote Promoção que infer/titulo_aula apontam para outro subtópico
 * - slugs com segmento promocao em lotes handcraft de OUTROS pacotes (URL legada)
 * - overlap com manifests de outros pacotes (ex.: Imunização)
 *
 * Uso:
 *   npm run audit:promocao-slug-drift
 *   npm run audit:promocao-slug-drift -- --write
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { createServerSupabase } from '@/lib/supabase/server';

const PROMOCAO = 'Promoção à Saúde e Prevenção de Agravos';
const PROMOCAO_SEGMENT = 'promocao-a-saude-e-prevencao-de-agravos';
const CATALOG_ROOT = resolve('data/catalog-migration');
const MANIFEST_PATH = resolve(
  'data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json',
);
const INFER_REPORT = resolve(
  'artifacts/catalog-infer-subtopico-promocao-a-saude-e-prevencao-de-agravos.json',
);
const OUT_PATH = resolve('data/catalog-migration/promocao-a-saude-taxonomy-drift.json');

type CrossPackageRef = {
  slug: string;
  lote: string;
  pacote_subtopico: string;
  role?: 'slug' | 'anchor_slug' | 'golden_reference';
};

type InferMove = {
  slug: string;
  from: string;
  suggested: string;
  confidence: number;
  rationale: string;
};

type DriftReport = {
  generated_at: string;
  subtopico: string;
  slug_segment: string;
  manifest_slugs: number;
  catalog_rows_titulo_promocao: number;
  missing_meta_subtopico: string[];
  infer_summary: {
    available: boolean;
    scanned: number;
    same_subtopico: number;
    applicable_moves: number;
    errors: number;
    by_destination: Record<string, number>;
  };
  manifest_infer_exits: InferMove[];
  cross_package_slug_refs: CrossPackageRef[];
  manifest_overlap_other_pacotes: { pacote: string; manifest_path: string; slugs: string[] }[];
  gate_blockers: string[];
  next_steps: string[];
};

const PACOTE_BY_LOTE_PREFIX: Record<string, string> = {
  'enfermagem-do-trabalho': 'Enfermagem do Trabalho',
  'saude-da-crianca': 'Saúde da Criança',
  'saude-adolescente': 'Saúde do Adolescente',
  'saude-da-mulher': 'Saúde da Mulher',
  'historia-enfermagem': 'História da Enfermagem',
  'doencas-bacterianas': 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
  'urgencias': 'Urgências e Emergências',
  'imunizacao': 'Imunização',
};

function readJson<T>(path: string): T {
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw) as T;
}

function loadManifestSlugs(path: string): string[] {
  if (!existsSync(path)) return [];
  return readJson<{ slugs?: string[] }>(path).slugs ?? [];
}

function inferPacoteFromLote(loteDir: string): string {
  for (const [prefix, subtopico] of Object.entries(PACOTE_BY_LOTE_PREFIX)) {
    if (loteDir.startsWith(prefix)) return subtopico;
  }
  return '(desconhecido)';
}

function scanCrossPackageRefs(): CrossPackageRef[] {
  const refs: CrossPackageRef[] = [];
  const seen = new Set<string>();

  for (const entry of readdirSync(CATALOG_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('promocao-a-saude')) continue;

    const metaPath = join(CATALOG_ROOT, entry.name, 'lote-meta.json');
    if (!existsSync(metaPath)) continue;

    const meta = readJson<{
      slugs?: string[];
      branch_by_slug?: Record<string, string>;
      anchor_slug?: string;
      golden_reference?: string;
    }>(metaPath);
    const pacote = inferPacoteFromLote(entry.name);

    const add = (slug: string | undefined, role: CrossPackageRef['role']) => {
      if (!slug || !slug.includes(PROMOCAO_SEGMENT)) return;
      const key = `${slug}|${entry.name}|${role}`;
      if (seen.has(key)) return;
      seen.add(key);
      refs.push({ slug, lote: entry.name, pacote_subtopico: pacote, role });
    };

    if (Array.isArray(meta.slugs)) {
      for (const slug of meta.slugs) add(slug, 'slug');
    }
    const branchBySlug = meta.branch_by_slug;
    if (branchBySlug && typeof branchBySlug === 'object') {
      for (const slug of Object.keys(branchBySlug)) add(slug, 'slug');
    }
    add(meta.anchor_slug, 'anchor_slug');
    if (meta.golden_reference) {
      const m = meta.golden_reference.match(/([^/\\]+)\.json$/);
      if (m) add(m[1], 'golden_reference');
    }
  }

  return refs.sort((a, b) => a.slug.localeCompare(b.slug) || a.lote.localeCompare(b.lote));
}

function scanManifestOverlaps(manifestSlugs: Set<string>) {
  const overlaps: DriftReport['manifest_overlap_other_pacotes'] = [];
  const targets = [
    {
      pacote: 'Imunização',
      manifest_path: 'data/catalog-migration/imunizacao-completo/manifest.json',
    },
  ];

  for (const t of targets) {
    const slugs = loadManifestSlugs(resolve(t.manifest_path)).filter((s) => manifestSlugs.has(s));
    if (slugs.length > 0) overlaps.push({ ...t, slugs });
  }

  return overlaps;
}

function loadInferMoves(manifestSlugs: Set<string>): {
  summary: DriftReport['infer_summary'];
  exits: InferMove[];
} {
  const emptySummary: DriftReport['infer_summary'] = {
    available: false,
    scanned: 0,
    same_subtopico: 0,
    applicable_moves: 0,
    errors: 0,
    by_destination: {},
  };

  if (!existsSync(INFER_REPORT)) {
    return { summary: emptySummary, exits: [] };
  }

  const report = readJson<{
    summary: {
      scanned: number;
      same_subtopico: number;
      applicable: number;
      errors: number;
    };
    proposals: {
      modulo_slug: string;
      from: string;
      suggested: string;
      confidence: number;
      rationale: string;
      keep_current: boolean;
      applicable: boolean;
      error?: string;
    }[];
  }>(INFER_REPORT);

  const moves = report.proposals.filter(
    (p) =>
      manifestSlugs.has(p.modulo_slug) &&
      p.applicable &&
      !p.keep_current &&
      p.suggested !== p.from &&
      !p.error,
  );

  const byDest: Record<string, number> = {};
  for (const p of moves) {
    byDest[p.suggested] = (byDest[p.suggested] ?? 0) + 1;
  }

  return {
    summary: {
      available: true,
      scanned: report.summary.scanned,
      same_subtopico: report.summary.same_subtopico,
      applicable_moves: moves.length,
      errors: report.summary.errors,
      by_destination: byDest,
    },
    exits: moves.map((p) => ({
      slug: p.modulo_slug,
      from: p.from,
      suggested: p.suggested,
      confidence: p.confidence,
      rationale: p.rationale,
    })),
  };
}

async function fetchPromocaoRows() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('modulos_estudo')
    .select('modulo_slug, titulo_aula, conteudo_json')
    .eq('titulo_aula', PROMOCAO);

  if (error) throw new Error(`Falha ao ler modulos_estudo: ${error.message}`);
  return data ?? [];
}

async function main() {
  const write = hasFlag('write');
  const manifestSlugs = loadManifestSlugs(MANIFEST_PATH);
  const manifestSet = new Set(manifestSlugs);

  const rows = await fetchPromocaoRows();
  const missingMeta = rows
    .filter((r) => {
      const meta = (r.conteudo_json as { meta?: { subtopico?: string } } | null)?.meta;
      return !meta?.subtopico?.trim();
    })
    .map((r) => r.modulo_slug as string);

  const { summary: inferSummary, exits: manifestExits } = loadInferMoves(manifestSet);
  const crossRefs = scanCrossPackageRefs();
  const overlaps = scanManifestOverlaps(manifestSet);

  const gateBlockers: string[] = [];
  if (missingMeta.length > 0) {
    gateBlockers.push(`missing_meta_subtopico=${missingMeta.length}`);
  }
  if (inferSummary.available && inferSummary.applicable_moves > 0) {
    gateBlockers.push(
      `infer_sugere_saida=${inferSummary.applicable_moves} slug(s) do manifest para outros subtópicos`,
    );
  }
  if (overlaps.some((o) => o.slugs.length > 0)) {
    gateBlockers.push('manifest_overlap_com_outros_pacotes');
  }

  const report: DriftReport = {
    generated_at: new Date().toISOString(),
    subtopico: PROMOCAO,
    slug_segment: PROMOCAO_SEGMENT,
    manifest_slugs: manifestSlugs.length,
    catalog_rows_titulo_promocao: rows.length,
    missing_meta_subtopico: missingMeta,
    infer_summary: inferSummary,
    manifest_infer_exits: manifestExits,
    cross_package_slug_refs: crossRefs,
    manifest_overlap_other_pacotes: overlaps,
    gate_blockers: gateBlockers,
    next_steps: [
      'npm run audit:subtopico-inventory -- "--subtopico=Promoção à Saúde e Prevenção de Agravos"',
      'npm run audit:taxonomy-gate -- "--subtopico=Promoção à Saúde e Prevenção de Agravos"',
      'npm run catalog:infer-subtopico -- "--subtopico=Promoção à Saúde e Prevenção de Agravos" --dry-run',
      'Revisar tier amarelo/vermelho; catalog:infer-subtopico --apply somente com pedido explícito',
      'Remover do manifest Promoção slugs que saírem para outro pacote (manifest_infer_exits)',
      'Cross-package: manter meta.subtopico canônico do pacote dono — não renomear modulo_slug (padrão Adolescente/Vias)',
      'Corrigir missing_meta_subtopico antes de re-rodar taxonomy-gate',
    ],
  };

  console.log(`[audit:promocao-slug-drift] manifest=${report.manifest_slugs}`);
  console.log(`[audit:promocao-slug-drift] catalog titulo_promocao=${report.catalog_rows_titulo_promocao}`);
  console.log(`[audit:promocao-slug-drift] missing_meta=${report.missing_meta_subtopico.length}`);
  if (report.missing_meta_subtopico.length) {
    for (const s of report.missing_meta_subtopico) console.log(`  - ${s}`);
  }
  console.log(`[audit:promocao-slug-drift] cross_package_refs=${crossRefs.length}`);
  console.log(`[audit:promocao-slug-drift] manifest_infer_exits=${manifestExits.length}`);
  if (inferSummary.available) {
    console.log(`[audit:promocao-slug-drift] infer same_subtopico=${inferSummary.same_subtopico}`);
  }
  console.log(`[audit:promocao-slug-drift] gate_blockers=${gateBlockers.length}`);

  if (write) {
    mkdirSync(resolve('data/catalog-migration'), { recursive: true });
    writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(`[audit:promocao-slug-drift] wrote ${OUT_PATH}`);
  } else {
    console.log(`[audit:promocao-slug-drift] use --write para gravar ${OUT_PATH}`);
  }
}

main().catch((err) => {
  console.error('[audit:promocao-slug-drift]', err);
  process.exit(1);
});
