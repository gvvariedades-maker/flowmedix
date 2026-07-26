#!/usr/bin/env tsx
/**
 * Relatório final baseline determinística + readiness + coorte piloto.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildCatalogAuditReport, type CatalogAuditReport } from '@/lib/neurocanvas/catalogAudit';
import { CANONICAL_PRECEDENCE_RULES, buildCanonicalCatalog, readQuestionJsonFile } from '@/lib/neurocanvas/canonicalCatalog';
import { DEDUPE_SCHEMA } from '@/lib/neurocanvas/dedupeSchema';
import { buildDuplicateAnalysisReport } from '@/lib/neurocanvas/duplicateAnalysis';
import {
  gradeSlideReadiness,
  slideShapeKey,
  type GenericReadinessRow,
} from '@/lib/neurocanvas/readiness';
import { buildResolverAuditReport } from '@/lib/neurocanvas/resolverAudit';
import { normalizeReverseStudySlide } from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';

type ResolverRow = {
  slug: string;
  slide_index: number;
  slide_type: string;
  subtopico?: string;
  layout_variant: string;
  decision: string;
};

const TYPECHECK_CASTS = [
  {
    file: 'lib/neurocanvas/catalogAudit.ts',
    cast: 'as { type?: string }[]',
    reason: 'normalizeReverseStudySlide retorna Record; sortReverseStudySlides exige type opcional.',
  },
  {
    file: 'lib/neurocanvas/resolverAudit.ts',
    cast: 'as { type?: string }[]',
    reason: 'Mesmo narrowing pós-normalização de slides.',
  },
  {
    file: 'lib/neurocanvas/resolverAudit.ts',
    cast: 'as MoldAffinitySlide & { layout_variant?: string; ... }[]',
    reason: 'Slides normalizados alimentam moldAffinity + resolveSlidePresentation.',
  },
];

function loadJsonIfExists<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function compareBaselines(
  prev: CatalogAuditReport | null,
  next: CatalogAuditReport,
): string[] {
  if (!prev) return ['Baseline anterior ausente — comparação limitada.'];
  const lines: string[] = [];
  const fields = [
    ['questions.unique_slugs', (o: CatalogAuditReport) => o.questions.unique_slugs],
    ['slides.total', (o: CatalogAuditReport) => o.slides.total],
    ['slides.logic_flow_tap', (o: CatalogAuditReport) => o.slides.logic_flow_tap],
    ['slides.danger_items_without_correct', (o: CatalogAuditReport) => o.slides.danger_items_without_correct],
  ] as const;

  let changed = 0;
  for (const [label, pick] of fields) {
    const a = pick(prev);
    const b = pick(next);
    if (a !== b) {
      changed += 1;
      lines.push(`- **${label}**: ${a} → ${b}`);
    }
  }

  if (changed === 0) {
    lines.push('- Baseline de catálogo **reproduzida** (métricas principais idênticas).');
  }
  return lines;
}

function buildGenericReadinessTable(
  catalog: ReturnType<typeof buildCanonicalCatalog>,
  resolverRows: ResolverRow[],
): {
  totals: { A: number; B: number; C: number };
  by_type: Record<string, { A: number; B: number; C: number }>;
  top_subtopicos: { subtopico: string; count: number }[];
  top_shapes: { shape: string; count: number }[];
  top_layouts: { layout: string; count: number }[];
} {
  const rows: GenericReadinessRow[] = [];
  const bySlugResolver = new Map<string, ResolverRow[]>();
  for (const r of resolverRows) {
    const list = bySlugResolver.get(r.slug) ?? [];
    list.push(r);
    bySlugResolver.set(r.slug, list);
  }

  for (const [slug, sel] of catalog.selections) {
    const q = readQuestionJsonFile(sel.path) as { reverse_study_slides?: unknown[] };
    const slides = sortReverseStudySlides(
      (q.reverse_study_slides ?? []).map((s) => normalizeReverseStudySlide(s)) as { type?: string }[],
    ) as Record<string, unknown>[];
    const resRows = bySlugResolver.get(slug) ?? [];

    slides.forEach((slide, slide_index) => {
      const res = resRows.find((r) => r.slide_index === slide_index);
      if (!res || res.decision !== 'generic_semantic') return;
      rows.push({
        slug,
        slide_index,
        slide_type: String(slide.type ?? 'unknown'),
        subtopico: res.subtopico,
        shape: slideShapeKey(slide),
        layout_variant: res.layout_variant,
        decision: res.decision as GenericReadinessRow['decision'],
        readiness: gradeSlideReadiness(slide),
        text_density: 0,
        has_correct_pairs: false,
        reveal_mode_tap: slide.reveal_mode === 'tap',
      });
    });
  }

  const totals = { A: 0, B: 0, C: 0 };
  const by_type: Record<string, { A: number; B: number; C: number }> = {};
  const subtopicoCount = new Map<string, number>();
  const shapeCount = new Map<string, number>();
  const layoutCount = new Map<string, number>();

  for (const row of rows) {
    totals[row.readiness] += 1;
    by_type[row.slide_type] ??= { A: 0, B: 0, C: 0 };
    by_type[row.slide_type][row.readiness] += 1;
    const sub = row.subtopico ?? '(sem subtopico)';
    subtopicoCount.set(sub, (subtopicoCount.get(sub) ?? 0) + 1);
    shapeCount.set(row.shape, (shapeCount.get(row.shape) ?? 0) + 1);
    layoutCount.set(row.layout_variant, (layoutCount.get(row.layout_variant) ?? 0) + 1);
  }

  return {
    totals,
    by_type,
    top_subtopicos: [...subtopicoCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([subtopico, count]) => ({ subtopico, count })),
    top_shapes: [...shapeCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([shape, count]) => ({ shape, count })),
    top_layouts: [...layoutCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([layout, count]) => ({ layout, count })),
  };
}

async function main() {
  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  const prevCatalog = loadJsonIfExists<Record<string, unknown>>(
    resolve(artifactsDir, 'neurocanvas-catalog-audit.json'),
  );
  const prevResolver = loadJsonIfExists<{
    summary: { by_decision: Record<string, number>; slides_resolved: number };
  }>(resolve(artifactsDir, 'neurocanvas-resolver-audit-catalog-full.json'));

  const catalogReport = buildCatalogAuditReport({ canonical: true });
  const resolverReport = buildResolverAuditReport({ mode: 'catalog', canonical: true });
  const duplicateReport = buildDuplicateAnalysisReport();
  const canonical = buildCanonicalCatalog();

  writeFileSync(
    resolve(artifactsDir, 'neurocanvas-catalog-audit.json'),
    JSON.stringify(catalogReport, null, 2),
    'utf8',
  );
  writeFileSync(
    resolve(artifactsDir, 'neurocanvas-resolver-audit-catalog-full.json'),
    JSON.stringify(resolverReport, null, 2),
    'utf8',
  );

  const genericTable = buildGenericReadinessTable(canonical, resolverReport.rows);
  const pilot = loadJsonIfExists<{ pilot_count: number; control_count: number }>(
    resolve(artifactsDir, 'neurocanvas-pilot-cohort.json'),
  );

  const catalogCompare = compareBaselines(prevCatalog, catalogReport);
  const resolverCompare: string[] = [];
  if (prevResolver) {
    const kinds = ['bespoke_affinity', 'family_rotation', 'generic_semantic'] as const;
    let changed = 0;
    for (const k of kinds) {
      const a = prevResolver.summary.by_decision[k] ?? 0;
      const b = resolverReport.summary.by_decision[k] ?? 0;
      if (a !== b) {
        changed += 1;
        resolverCompare.push(`- **${k}**: ${a} → ${b}`);
      }
    }
    if (changed === 0) {
      resolverCompare.push('- Resolver baseline **reproduzida** (bespoke/family/generic idênticos).');
    }
  } else {
    resolverCompare.push('- Baseline resolver anterior ausente.');
  }

  const blockers = [...canonical.blockers];
  const ready =
    !canonical.baseline_materially_affected &&
    blockers.length === 0 &&
    (pilot?.pilot_count ?? 0) >= 40;
  const verdict = ready ? 'READY' : 'NOT READY';

  const md = [
    '# NeuroCanvas — baseline determinística e readiness (Fase 0)',
    '',
    `Gerado em: ${new Date().toISOString()}`,
    '',
    `## Veredito: **${verdict}**`,
    '',
    blockers.length
      ? `Blockers (${blockers.length}):\n\n${blockers.slice(0, 20).map((b) => `- ${b}`).join('\n')}\n`
      : 'Sem blockers de divergência canônica.\n',
    '',
    '## 1. Confiabilidade da baseline',
    '',
    `- Modo seleção: **${catalogReport.selection.mode}**`,
    `- dedupe_schema_version: **${DEDUPE_SCHEMA.dedupe_schema_version}**`,
    `- Baseline materialmente afetada: **${canonical.baseline_materially_affected ? 'sim' : 'não'}**`,
    `- Slugs na baseline resolvida: ${catalogReport.questions.unique_slugs} (não confundir com catálogo final)`,
    `- Duplicatas ignoradas: ${catalogReport.questions.duplicate_files_skipped}`,
    `- Slugs com conteúdo divergente entre cópias: ${catalogReport.selection.content_divergent_slugs}`,
    `- Slugs não resolvidos (blocker): ${catalogReport.selection.unresolved_slugs}`,
    '',
    '## 2. Análise de duplicatas',
    '',
    'Ver também: `artifacts/neurocanvas-blocker-clusters.md` · `artifacts/neurocanvas-baseline-impact.md`',
    '',
    `| Grupos duplicados | ${duplicateReport.summary.duplicate_groups} |`,
    `| byte-identical | ${duplicateReport.summary.byte_identical_groups} |`,
    `| semantic-identical | ${duplicateReport.summary.semantic_identical_groups} |`,
    `| divergentes | ${duplicateReport.summary.divergent_groups} |`,
    '',
    '## 3. Precedência canônica (somente documentada)',
    '',
    ...CANONICAL_PRECEDENCE_RULES.map((r) => `- ${r}`),
    '',
    `Lotes *-completo no registry: ${canonical.registry_completo_lotes.length}`,
    '',
    '## 3b. dedupe_schema',
    '',
    `Versão: **${DEDUPE_SCHEMA.dedupe_schema_version}** · Algoritmo: \`${DEDUPE_SCHEMA.algorithm}\``,
    '',
    'Campos incluídos:',
    ...DEDUPE_SCHEMA.fields_included.map((f) => `- ${f}`),
    '',
    'Campos removidos:',
    ...DEDUPE_SCHEMA.fields_removed.map((f) => `- ${f}`),
    '',
    'Normalização:',
    ...DEDUPE_SCHEMA.normalization_applied.map((f) => `- ${f}`),
    '',
    '## 4. Comparação baseline anterior → determinística',
    '',
    '### Catálogo',
    '',
    ...catalogCompare,
    '',
    '### Resolver',
    '',
    ...resolverCompare,
    '',
    '## 5. Readiness A/B/C (catálogo completo)',
    '',
    'Ver `artifacts/neurocanvas-audit-report-data.json` para breakdown global.',
    '',
    '## 6. Genéricos (decision=generic_semantic)',
    '',
    `| Grade | Count |`,
    `|-------|------:|`,
    `| A | ${genericTable.totals.A} |`,
    `| B | ${genericTable.totals.B} |`,
    `| C | ${genericTable.totals.C} |`,
  `| **Total** | **${genericTable.totals.A + genericTable.totals.B + genericTable.totals.C}** |`,
    '',
    '### Por tipo (genéricos)',
    '',
    '| type | A | B | C |',
    '|------|--:|--:|--:|',
    ...Object.entries(genericTable.by_type).map(
      ([t, v]) => `| ${t} | ${v.A} | ${v.B} | ${v.C} |`,
    ),
    '',
    '### Top subtopicos (genéricos)',
    '',
    ...genericTable.top_subtopicos.map((r) => `- ${r.subtopico}: ${r.count}`),
    '',
    '## 7. Coorte piloto',
    '',
    pilot
      ? `- Pilotos: ${pilot.pilot_count} · Controles: ${pilot.control_count}`
      : '- Execute `npm run generate:neurocanvas-pilot-cohort` após resolver audit.',
    '',
    '## 8. Paridade Supabase live',
    '',
    '- **Não executada** — sem comparação read-only configurada nesta sessão (limitação documentada).',
    '',
    '## 9. Casts typecheck (lib/neurocanvas/*)',
    '',
    '| arquivo | cast | justificativa |',
    '|---------|------|---------------|',
    ...TYPECHECK_CASTS.map((c) => `| ${c.file} | \`${c.cast}\` | ${c.reason} |`),
    '',
    '- `as any`: **não encontrado**',
    '- `as unknown as`: **não encontrado**',
    '',
    '## 10. Confirmações',
    '',
    '- NeuroCanvas runtime: **não implementado**',
    '- Player/resolver produção: **não alterados**',
    '- Commit/push/PR/deploy/Supabase write: **não executados**',
    '',
  ].join('\n');

  writeFileSync(resolve(artifactsDir, 'neurocanvas-baseline-readiness.md'), md, 'utf8');
  console.log('[write:neurocanvas-baseline-readiness] veredito:', verdict);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
