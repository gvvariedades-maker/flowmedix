import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildCanonicalCatalog,
  groupQuestionPathsBySlug,
  walkAllCatalogQuestionPaths,
} from '@/lib/neurocanvas/canonicalCatalog';
import {
  buildResolverAuditReport,
  type ResolverDecisionKind,
  type ResolverAuditReport,
} from '@/lib/neurocanvas/resolverAudit';

export type ResolverBucket = 'bespoke' | 'family' | 'generic';

export type ResolverPartitionRow = {
  decision: ResolverDecisionKind;
  count: number;
  pct: number;
  bucket: ResolverBucket | 'residual';
};

export type BaselineResolverSnapshot = {
  label: string;
  source: string;
  questions: number;
  slides: number;
  partition: ResolverPartitionRow[];
  bespoke_zero_slots_detail: Array<{
    slug: string;
    slide_index: number;
    slide_type: string;
    subtopic_design_variant?: string;
    layout_variant: string;
    resolved_bucket: ResolverBucket;
    note: string;
  }>;
  classification_function: string;
  sum_check: { total: number; sum_decisions: number; matches: boolean };
};

export type ResolverReconciliationReport = {
  generated_at: string;
  explanation_family_27_8_vs_25_6: string;
  baselines: {
    fs_first_full: BaselineResolverSnapshot;
    canonical_partial: BaselineResolverSnapshot;
    baseline_impact_hardcoded_previous: BaselineResolverSnapshot | null;
  };
  delta_fs_first_vs_canonical: {
    questions_abs: number;
    slides_abs: number;
    family_abs: number;
    family_pct_pts: number;
    generic_abs: number;
    generic_count_exact: number;
  };
  generic_grade_a_exact_count: number;
};

function pct(n: number, total: number): number {
  return Math.round((n / (total || 1)) * 1000) / 10;
}

function bucketForDecision(decision: ResolverDecisionKind): ResolverBucket | 'residual' {
  if (decision === 'bespoke_affinity') return 'bespoke';
  if (decision === 'family_rotation') return 'family';
  if (decision === 'generic_semantic') return 'generic';
  return 'residual';
}

function partitionFromReport(
  report: ResolverAuditReport,
  label: string,
  source: string,
): BaselineResolverSnapshot {
  const total = report.summary.slides_resolved;
  const by = report.summary.by_decision;
  const order: ResolverDecisionKind[] = [
    'bespoke_affinity',
    'family_rotation',
    'generic_semantic',
    'bespoke_zero_slots',
    'mold_fallback',
    'explicit_json',
  ];

  const partition: ResolverPartitionRow[] = order.map((decision) => ({
    decision,
    count: by[decision] ?? 0,
    pct: pct(by[decision] ?? 0, total),
    bucket: bucketForDecision(decision),
  }));

  const zeroSlots = report.rows.filter((r) => r.decision === 'bespoke_zero_slots');
  const zeroDetail = zeroSlots.map((r) => {
    const resolvedBucket: ResolverBucket =
      r.layout_variant === 'bridge' || r.layout_variant === 'grid' || r.decision === 'bespoke_zero_slots'
        ? 'generic'
        : r.decision === 'family_rotation'
          ? 'family'
          : 'bespoke';
    return {
      slug: r.slug,
      slide_index: r.slide_index,
      slide_type: r.slide_type,
      subtopic_design_variant: r.subtopic_design_variant,
      layout_variant: r.layout_variant,
      resolved_bucket: resolvedBucket,
      note:
        'Mapa de design aponta bespoke sem slots; afinidade rejeita antes da seleção — layout genérico sem mold_fallback.',
    };
  });

  const sumDecisions = partition.reduce((a, p) => a + p.count, 0);

  return {
    label,
    source,
    questions: report.questions_processed,
    slides: total,
    partition,
    bespoke_zero_slots_detail: zeroDetail,
    classification_function:
      'buildResolverAuditReport → resolveQuestionSlides → classifyDecision (lib/neurocanvas/resolverAudit.ts); runtime: resolveSlidePresentation + enrichPresentationContext',
    sum_check: {
      total,
      sum_decisions: sumDecisions,
      matches: sumDecisions === total,
    },
  };
}

function buildFsFirstReport(): ResolverAuditReport {
  return buildResolverAuditReport({ mode: 'catalog', canonical: false });
}

function buildCanonicalReport(): ResolverAuditReport {
  return buildResolverAuditReport({ mode: 'catalog', canonical: true });
}

function loadHardcodedPrevious(): BaselineResolverSnapshot | null {
  const prevPath = resolve('artifacts/neurocanvas-resolver-audit-catalog-full.fs-first-snapshot.json');
  if (existsSync(prevPath)) {
    const p = JSON.parse(readFileSync(prevPath, 'utf8')) as ResolverAuditReport;
    return partitionFromReport(p, 'baseline_impact_snapshot', prevPath);
  }

  const auditPath = resolve('artifacts/neurocanvas-resolver-audit-catalog-full.json');
  if (!existsSync(auditPath)) return null;

  const p = JSON.parse(readFileSync(auditPath, 'utf8')) as ResolverAuditReport;
  if (p.source !== 'catalog_full' || p.questions_processed < 5000) return null;

  const by = p.summary.by_decision;
  const hardcodedFamily = 5787;
  const hardcodedBespoke = 14121;
  const hardcodedGeneric = 2197;
  const total = p.summary.slides_resolved;

  return {
    label: 'baseline_impact_hardcoded_previous',
    source: 'lib/neurocanvas/baselineImpact.ts fallback (relatório consolidado 5.651 filesystem-first)',
    questions: p.questions_processed,
    slides: total,
    partition: [
      { decision: 'bespoke_affinity', count: hardcodedBespoke, pct: pct(hardcodedBespoke, total), bucket: 'bespoke' },
      { decision: 'family_rotation', count: hardcodedFamily, pct: pct(hardcodedFamily, total), bucket: 'family' },
      { decision: 'generic_semantic', count: hardcodedGeneric, pct: pct(hardcodedGeneric, total), bucket: 'generic' },
      { decision: 'bespoke_zero_slots', count: by.bespoke_zero_slots ?? 0, pct: pct(by.bespoke_zero_slots ?? 0, total), bucket: 'residual' },
      { decision: 'mold_fallback', count: by.mold_fallback ?? 0, pct: pct(by.mold_fallback ?? 0, total), bucket: 'residual' },
      { decision: 'explicit_json', count: by.explicit_json ?? 0, pct: pct(by.explicit_json ?? 0, total), bucket: 'residual' },
    ],
    bespoke_zero_slots_detail: [],
    classification_function: 'valores hardcoded em baselineImpact.ts (family=5787) — inconsistente com reexecução fs-first',
    sum_check: {
      total,
      sum_decisions: hardcodedBespoke + hardcodedFamily + hardcodedGeneric + (by.bespoke_zero_slots ?? 0) + (by.mold_fallback ?? 0) + (by.explicit_json ?? 0),
      matches: false,
    },
  };
}

export function buildResolverReconciliationReport(): ResolverReconciliationReport {
  const fsFirst = buildFsFirstReport();
  const canonical = buildCanonicalReport();
  const fsSnap = partitionFromReport(fsFirst, 'fs_first_full', 'buildResolverAuditReport({ canonical: false })');
  const canSnap = partitionFromReport(canonical, 'canonical_partial', 'buildResolverAuditReport({ canonical: true })');
  const hardcoded = loadHardcodedPrevious();

  const fsFamily = fsFirst.summary.by_decision.family_rotation;
  const hardFamily = hardcoded?.partition.find((p) => p.decision === 'family_rotation')?.count ?? 5787;
  const fsGeneric = fsFirst.summary.by_decision.generic_semantic;
  const canGeneric = canonical.summary.by_decision.generic_semantic;

  const catalog = buildCanonicalCatalog();
  const diskSlugs = groupQuestionPathsBySlug(walkAllCatalogQuestionPaths()).size;

  const explanation = [
    `A auditoria consolidada (filesystem-first, ${fsFirst.questions_processed} questões / ${fsFirst.summary.slides_resolved} slides) reporta family_rotation=${fsFamily} (${pct(fsFamily, fsFirst.summary.slides_resolved)}%).`,
    `O impacto baseline (baselineImpact.ts) cita family=${hardFamily} (${pct(hardFamily, fsFirst.summary.slides_resolved)}%) como "anterior" — delta de ${fsFamily - hardFamily} slides (${(pct(fsFamily, fsFirst.summary.slides_resolved) - pct(hardFamily, fsFirst.summary.slides_resolved)).toFixed(1)} p.p.).`,
    'Causa: o fallback hardcoded em baselineImpact.ts usa family=5787, mas a reexecução fs-first atual produz family=' +
      `${fsFamily}. Os hardcodes não somam o total de slides (faltam categorias residuais), enquanto a auditoria fs-first inclui bespoke_zero_slots explicitamente.`,
    `A baseline canônica parcial (${canonical.questions_processed} questões / ${canonical.summary.slides_resolved} slides) exclui ${catalog.unresolved_slugs.length} slugs unresolved — family cai para ${canonical.summary.by_decision.family_rotation} (${pct(canonical.summary.by_decision.family_rotation, canonical.summary.slides_resolved)}%).`,
    `Escopo em disco: ${diskSlugs} slugs únicos; canônico resolvido: ${catalog.selections.size}; blockers: ${catalog.unresolved_slugs.length}.`,
  ].join(' ');

  return {
    generated_at: new Date().toISOString(),
    explanation_family_27_8_vs_25_6: explanation,
    baselines: {
      fs_first_full: fsSnap,
      canonical_partial: canSnap,
      baseline_impact_hardcoded_previous: hardcoded,
    },
    delta_fs_first_vs_canonical: {
      questions_abs: canonical.questions_processed - fsFirst.questions_processed,
      slides_abs: canonical.summary.slides_resolved - fsFirst.summary.slides_resolved,
      family_abs: canonical.summary.by_decision.family_rotation - fsFamily,
      family_pct_pts:
        pct(canonical.summary.by_decision.family_rotation, canonical.summary.slides_resolved) -
        pct(fsFamily, fsFirst.summary.slides_resolved),
      generic_abs: canGeneric - fsGeneric,
      generic_count_exact: canGeneric,
    },
    generic_grade_a_exact_count: canGeneric,
  };
}

export function renderResolverReconciliationMarkdown(report: ResolverReconciliationReport): string {
  const renderBaseline = (b: BaselineResolverSnapshot) => {
    const lines = [
      `### ${b.label}`,
      '',
      `- Fonte: \`${b.source}\``,
      `- Questões: ${b.questions} · Slides: ${b.slides}`,
      `- Função: ${b.classification_function}`,
      `- Soma decisões = total: **${b.sum_check.matches ? 'sim' : 'não'}** (${b.sum_check.sum_decisions} / ${b.sum_check.total})`,
      '',
      '| decision | count | % | bucket |',
      '|----------|------:|--:|--------|',
      ...b.partition.map(
        (p) => `| ${p.decision} | ${p.count} | ${p.pct}% | ${p.bucket} |`,
      ),
    ];
    if (b.bespoke_zero_slots_detail.length) {
      lines.push('', '#### bespoke_zero_slots', '');
      lines.push('| slug | idx | type | design variant | layout | nota |');
      lines.push('|------|----:|------|----------------|--------|------|');
      for (const z of b.bespoke_zero_slots_detail) {
        lines.push(
          `| ${z.slug} | ${z.slide_index} | ${z.slide_type} | ${z.subtopic_design_variant ?? '—'} | ${z.layout_variant} | ${z.note} |`,
        );
      }
    }
    return lines.join('\n');
  };

  return [
    '# NeuroCanvas — reconciliação do resolver (G0.2)',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    '## 1. Causa family 27,8% vs 25,6%',
    '',
    report.explanation_family_27_8_vs_25_6,
    '',
    '## 2. Baselines',
    '',
    renderBaseline(report.baselines.fs_first_full),
    '',
    renderBaseline(report.baselines.canonical_partial),
    '',
    report.baselines.baseline_impact_hardcoded_previous
      ? renderBaseline(report.baselines.baseline_impact_hardcoded_previous)
      : '### baseline_impact_hardcoded_previous\n\nNão disponível.',
    '',
    '## 3. Delta fs-first → canônica parcial',
    '',
    `| Métrica | Δ |`,
    `|---------|--:|`,
    `| Questões | ${report.delta_fs_first_vs_canonical.questions_abs} |`,
    `| Slides | ${report.delta_fs_first_vs_canonical.slides_abs} |`,
    `| family (abs) | ${report.delta_fs_first_vs_canonical.family_abs} |`,
    `| family (p.p.) | ${report.delta_fs_first_vs_canonical.family_pct_pts} |`,
    `| generic (abs) | ${report.delta_fs_first_vs_canonical.generic_abs} |`,
    '',
    `**Genéricos exatos na baseline canônica (${report.baselines.canonical_partial.slides} slides): ${report.delta_fs_first_vs_canonical.generic_count_exact}** (${pct(report.delta_fs_first_vs_canonical.generic_count_exact, report.baselines.canonical_partial.slides)}%)`,
    '',
  ].join('\n');
}
