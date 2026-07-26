import { createHash } from 'node:crypto';

import {
  buildCanonicalCatalog,
  CANONICAL_PRECEDENCE_RULES,
  type DuplicateGroupClass,
  type SlugDuplicateGroup,
  walkAllCatalogQuestionPaths,
  groupQuestionPathsBySlug,
  analyzeCatalogFile,
} from '@/lib/neurocanvas/canonicalCatalog';
import { DEDUPE_SCHEMA, type DedupeSchemaSpec } from '@/lib/neurocanvas/dedupeSchema';
import { resolveAuditRoots, type NeurocanvasAuditRoots } from '@/lib/neurocanvas/auditRoots';

export type DuplicateAnalysisReport = {
  generated_at: string;
  dedupe_schema: DedupeSchemaSpec;
  summary: {
    total_files: number;
    unique_slugs: number;
    duplicate_groups: number;
    files_in_duplicate_groups: number;
    byte_identical_groups: number;
    semantic_identical_groups: number;
    divergent_groups: number;
    invalid_groups: number;
    singleton_slugs: number;
    divergent_slugs: number;
    unresolved_slugs: number;
    resolved_divergent_groups: number;
    impact: {
      slides_at_risk: number;
      metadata_at_risk: number;
      resolver_at_risk: number;
    };
  };
  precedence_rules: readonly string[];
  groups: SlugDuplicateGroup[];
  divergent_details: Array<{
    slug: string;
    paths: string[];
    differing_fields: string[];
    byte_hashes: string[];
    semantic_hashes: string[];
  }>;
  limitations: string[];
};

function countImpactFields(groups: SlugDuplicateGroup[]): DuplicateAnalysisReport['summary']['impact'] {
  let slides = 0;
  let meta = 0;
  let resolver = 0;
  for (const g of groups) {
    if (g.classification !== 'divergent') continue;
    for (const field of g.differing_fields ?? []) {
      if (field.includes('reverse_study_slides') || field.includes('study_slides')) slides += 1;
      else if (field.startsWith('meta.')) meta += 1;
      else if (field.startsWith('question_data.')) resolver += 1;
    }
    if (!g.differing_fields?.length) slides += 1;
  }
  return {
    slides_at_risk: slides,
    metadata_at_risk: meta,
    resolver_at_risk: resolver,
  };
}

export function buildDuplicateAnalysisReport(
  options?: Partial<NeurocanvasAuditRoots>,
): DuplicateAnalysisReport {
  const { catalogRoot } = resolveAuditRoots(options);
  const paths = walkAllCatalogQuestionPaths(catalogRoot);
  const groups = groupQuestionPathsBySlug(paths);
  const catalog = buildCanonicalCatalog({ catalogRoot });

  const duplicateGroups: SlugDuplicateGroup[] = [];
  let filesInDup = 0;

  const counts: Record<DuplicateGroupClass, number> = {
    byte_identical: 0,
    semantic_identical: 0,
    divergent: 0,
    invalid: 0,
  };

  for (const [slug, filePaths] of groups) {
    if (filePaths.length <= 1) continue;
    filesInDup += filePaths.length;

    const entries = filePaths.map(analyzeCatalogFile);
    const valid = entries.filter((e) => !e.parse_error && e.byte_sha256 && e.semantic_sha256);
    const byteHashes = [...new Set(valid.map((e) => e.byte_sha256!))];
    const semanticHashes = [...new Set(valid.map((e) => e.semantic_sha256!))];

    let classification: DuplicateGroupClass = 'divergent';
    if (entries.some((e) => e.parse_error) && valid.length === 0) classification = 'invalid';
    else if (byteHashes.length === 1) classification = 'byte_identical';
    else if (semanticHashes.length === 1) classification = 'semantic_identical';
    else classification = 'divergent';

    counts[classification] += 1;

    const fromCatalog = catalog.duplicate_groups.find((g) => g.slug === slug);
    duplicateGroups.push(
      fromCatalog ?? {
        slug,
        file_count: filePaths.length,
        classification,
        paths: filePaths,
        byte_hashes: byteHashes,
        semantic_hashes: semanticHashes,
      },
    );
  }

  const divergentDetails = duplicateGroups
    .filter((g) => g.classification === 'divergent')
    .map((g) => ({
      slug: g.slug,
      paths: g.paths,
      differing_fields: g.differing_fields ?? [],
      byte_hashes: g.byte_hashes,
      semantic_hashes: g.semantic_hashes,
    }));

  return {
    generated_at: new Date().toISOString(),
    dedupe_schema: DEDUPE_SCHEMA,
    summary: {
      total_files: paths.length,
      unique_slugs: groups.size,
      duplicate_groups: duplicateGroups.length,
      files_in_duplicate_groups: filesInDup,
      byte_identical_groups: counts.byte_identical,
      semantic_identical_groups: counts.semantic_identical,
      divergent_groups: counts.divergent,
      invalid_groups: counts.invalid,
      singleton_slugs: [...groups.values()].filter((p) => p.length === 1).length,
      divergent_slugs: catalog.content_divergent_slugs.length,
      unresolved_slugs: catalog.unresolved_slugs.length,
      resolved_divergent_groups: duplicateGroups.filter(
        (g) => g.classification === 'divergent' && g.resolution === 'resolved',
      ).length,
      impact: countImpactFields(duplicateGroups),
    },
    precedence_rules: CANONICAL_PRECEDENCE_RULES,
    groups: duplicateGroups.sort((a, b) => a.slug.localeCompare(b.slug)),
    divergent_details: divergentDetails,
    limitations: [
      `dedupe_schema_version: ${DEDUPE_SCHEMA.dedupe_schema_version}`,
      'Comparação semântica conforme dedupe_schema (campos incluídos/removidos no JSON).',
      'Divergência sem evidência documentada única → unresolved; slug fora da baseline e da coorte.',
      'gNN sem manifest.parent/registry NÃO vence por recência ou ordem de filesystem.',
    ],
  };
}

export function stableSlideHash(slug: string, slideIndex: number, slideType: string): string {
  return createHash('sha256')
    .update(`${slug}:${slideIndex}:${slideType}`, 'utf8')
    .digest('hex');
}

export function renderDuplicateAnalysisMarkdown(report: DuplicateAnalysisReport): string {
  const s = report.summary;
  const topDivergent = report.divergent_details.slice(0, 15);

  return [
    '# NeuroCanvas — análise de duplicatas',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    '## Resumo',
    '',
    '| Métrica | Valor |',
    '|---------|------:|',
    `| Arquivos totais | ${s.total_files} |`,
    `| Slugs únicos | ${s.unique_slugs} |`,
    `| Grupos duplicados (≥2 arquivos) | ${s.duplicate_groups} |`,
    `| Arquivos em grupos duplicados | ${s.files_in_duplicate_groups} |`,
    `| Slugs singleton | ${s.singleton_slugs} |`,
    `| Grupos byte-identical | ${s.byte_identical_groups} |`,
    `| Grupos semantic-identical | ${s.semantic_identical_groups} |`,
    `| Grupos divergentes | ${s.divergent_groups} |`,
    `| Grupos inválidos | ${s.invalid_groups} |`,
    `| Slugs divergentes (conteúdo) | ${s.divergent_slugs} |`,
    `| Slugs não resolvidos (blocker) | ${s.unresolved_slugs} |`,
    `| Grupos divergentes resolvidos por manifest | ${s.resolved_divergent_groups} |`,
    '',
    '## dedupe_schema',
    '',
    `Versão: **${report.dedupe_schema.dedupe_schema_version}**`,
    '',
    '### Campos incluídos',
    '',
    ...report.dedupe_schema.fields_included.map((f) => `- ${f}`),
    '',
    '### Campos removidos',
    '',
    ...report.dedupe_schema.fields_removed.map((f) => `- ${f}`),
    '',
    '### Normalização',
    '',
    ...report.dedupe_schema.normalization_applied.map((f) => `- ${f}`),
    '',
    `Algoritmo: \`${report.dedupe_schema.algorithm}\``,
    '',
    '## Impacto estimado (divergentes)',
    '',
    `| slides | ${s.impact.slides_at_risk} campos distintos |`,
    `| meta | ${s.impact.metadata_at_risk} campos distintos |`,
    `| question_data/resolver | ${s.impact.resolver_at_risk} campos distintos |`,
    '',
    '## Precedência canônica proposta',
    '',
    ...report.precedence_rules.map((r) => `- ${r}`),
    '',
    topDivergent.length
      ? [
          '## Amostra divergências',
          '',
          ...topDivergent.map(
            (d) =>
              `### ${d.slug}\n\n- paths: ${d.paths.length}\n- fields: ${d.differing_fields.slice(0, 8).join(', ') || 'n/d'}\n`,
          ),
        ].join('\n')
      : '## Divergências\n\nNenhuma divergência semântica entre cópias duplicadas.\n',
    '',
    '## Limitações',
    '',
    ...report.limitations.map((l) => `- ${l}`),
    '',
  ].join('\n');
}
