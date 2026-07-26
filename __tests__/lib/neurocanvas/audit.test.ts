import { buildBlockerAnalysisReport } from '@/lib/neurocanvas/blockerAnalysis';
import {
  buildCatalogAuditReport,
  renderCatalogAuditMarkdown,
} from '@/lib/neurocanvas/catalogAudit';
import { buildCanonicalCatalog } from '@/lib/neurocanvas/canonicalCatalog';
import { buildDuplicateAnalysisReport } from '@/lib/neurocanvas/duplicateAnalysis';
import { buildResolverAuditReport } from '@/lib/neurocanvas/resolverAudit';

describe('neurocanvas catalogAudit', () => {
  it('renderCatalogAuditMarkdown inclui seções principais', () => {
    const report = buildCatalogAuditReport({ includeExamples: true, limit: 5 });
    const md = renderCatalogAuditMarkdown(report);
    expect(md).toContain('# NeuroCanvas — auditoria de catálogo');
    expect(report.questions.unique_slugs).toBeGreaterThan(0);
    expect(report.selection.mode).toBe('canonical');
  });
});

describe('neurocanvas canonicalCatalog', () => {
  it('seleção canônica é estável e registra dedupe_schema_version', () => {
    const a = buildCanonicalCatalog();
    const b = buildCanonicalCatalog();
    expect(a.dedupe_schema.dedupe_schema_version).toBe(1);
    expect(a.selections.size).toBeGreaterThan(0);
    expect(a.selections.size).toBe(b.selections.size);
    expect(a.unresolved_slugs).toEqual(b.unresolved_slugs);
  });
});

describe('neurocanvas duplicateAnalysis', () => {
  it('classifica grupos duplicados', () => {
    const report = buildDuplicateAnalysisReport();
    expect(report.summary.total_files).toBeGreaterThan(report.summary.unique_slugs);
    expect(report.summary.duplicate_groups).toBeGreaterThan(0);
  });
});

describe('neurocanvas blockerAnalysis', () => {
  it('partição exaustiva soma slugs em disco', () => {
    const { partition } = buildBlockerAnalysisReport();
    const sum = Object.values(partition.by_category).reduce((a, b) => a + b, 0);
    expect(sum).toBe(partition.total_disk_slugs);
    expect(partition.reconciliation.sum_equals_disk).toBe(true);
    expect(partition.divergent_groups.sum_equals_total).toBe(true);
  });
});

describe('neurocanvas resolverAudit', () => {
  it('resolve visual anchors sem lançar', () => {
    const report = buildResolverAuditReport({ mode: 'anchors' });
    expect(report.questions_processed).toBeGreaterThan(0);
    expect(report.summary.slides_resolved).toBeGreaterThan(0);
    const total = report.summary.slides_resolved;
    const sum = Object.values(report.summary.by_decision).reduce((a, b) => a + b, 0);
    expect(sum).toBe(total);
  });

  it('resolve catálogo canônico sem lançar', () => {
    const report = buildResolverAuditReport({ mode: 'catalog', limit: 20 });
    expect(report.questions_processed).toBe(20);
    expect(report.summary.slides_resolved).toBe(80);
  });
});
