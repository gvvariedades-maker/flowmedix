import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { buildBlockerAnalysisReport } from '@/lib/neurocanvas/blockerAnalysis';
import {
  buildCatalogAuditReport,
  renderCatalogAuditMarkdown,
} from '@/lib/neurocanvas/catalogAudit';
import {
  buildCanonicalCatalog,
  readQuestionJsonFile,
} from '@/lib/neurocanvas/canonicalCatalog';
import { buildDuplicateAnalysisReport } from '@/lib/neurocanvas/duplicateAnalysis';
import { buildResolverAuditReport } from '@/lib/neurocanvas/resolverAudit';
import { materializeCatalogFixture } from '@/__tests__/lib/neurocanvas/fixtures/catalogFixture';

describe('neurocanvas catalogAudit (fixtures)', () => {
  const fixture = materializeCatalogFixture();
  const roots = { catalogRoot: fixture.catalogRoot, repoRoot: fixture.repoRoot };

  afterAll(() => fixture.cleanup());

  it('renderCatalogAuditMarkdown inclui seções principais', () => {
    const report = buildCatalogAuditReport({ ...roots, limit: 5 });
    const md = renderCatalogAuditMarkdown(report);
    expect(md).toContain('# NeuroCanvas — auditoria de catálogo');
    expect(report.questions.unique_slugs).toBeGreaterThan(0);
    expect(report.selection.mode).toBe('canonical');
  });
});

describe('neurocanvas canonicalCatalog (fixtures)', () => {
  const fixture = materializeCatalogFixture();
  const roots = { catalogRoot: fixture.catalogRoot, repoRoot: fixture.repoRoot };

  afterAll(() => fixture.cleanup());

  it('seleção canônica é estável e registra dedupe_schema_version', () => {
    const a = buildCanonicalCatalog(roots);
    const b = buildCanonicalCatalog(roots);
    expect(a.dedupe_schema.dedupe_schema_version).toBe(1);
    expect(a.selections.size).toBeGreaterThan(0);
    expect(a.selections.size).toBe(b.selections.size);
    expect(a.unresolved_slugs).toEqual(b.unresolved_slugs);
    expect(a.selections.has('q-singleton')).toBe(true);
    expect(a.unresolved_slugs).toContain('q-divergent-unresolved');
    expect(a.unresolved_slugs).toContain('q-manifest-conflict');
  });

  it('lê JSON com BOM UTF-8', () => {
    const catalog = buildCanonicalCatalog(roots);
    const sel = catalog.selections.get('q-bom');
    expect(sel).toBeDefined();
    const raw = readQuestionJsonFile(sel!.path);
    expect((raw.question_data as { instruction: string }).instruction).toContain('BOM');
  });
});

describe('neurocanvas duplicateAnalysis (fixtures)', () => {
  const fixture = materializeCatalogFixture();
  const roots = { catalogRoot: fixture.catalogRoot, repoRoot: fixture.repoRoot };

  afterAll(() => fixture.cleanup());

  it('classifica grupos duplicados', () => {
    const report = buildDuplicateAnalysisReport(roots);
    expect(report.summary.total_files).toBeGreaterThan(report.summary.unique_slugs);
    expect(report.summary.duplicate_groups).toBeGreaterThan(0);
    expect(report.summary.byte_identical_groups).toBeGreaterThan(0);
  });
});

describe('neurocanvas blockerAnalysis (fixtures)', () => {
  const fixture = materializeCatalogFixture();
  const roots = { catalogRoot: fixture.catalogRoot, repoRoot: fixture.repoRoot };

  afterAll(() => fixture.cleanup());

  it('partição exaustiva soma slugs em disco', () => {
    const { partition } = buildBlockerAnalysisReport(roots);
    const sum = Object.values(partition.by_category).reduce((a, b) => a + b, 0);
    expect(sum).toBe(partition.total_disk_slugs);
    expect(partition.reconciliation.sum_equals_disk).toBe(true);
    expect(partition.divergent_groups.sum_equals_total).toBe(true);
    expect(partition.by_category.singleton_disk).toBeGreaterThan(0);
    expect(partition.by_category.duplicate_byte_identical).toBeGreaterThan(0);
  });
});

describe('neurocanvas resolverAudit (fixtures)', () => {
  const fixture = materializeCatalogFixture();
  const roots = { catalogRoot: fixture.catalogRoot, repoRoot: fixture.repoRoot };

  afterAll(() => fixture.cleanup());

  it('resolve catálogo canônico em amostra mínima', () => {
    const report = buildResolverAuditReport({ mode: 'catalog', limit: 3, ...roots });
    expect(report.questions_processed).toBe(3);
    expect(report.summary.slides_resolved).toBe(12);
    const decisions = new Set(report.rows.map((r) => r.decision));
    expect(decisions.size).toBeGreaterThan(0);
  });

  it('distribui decisões bespoke/family/generic quando possível', () => {
    const report = buildResolverAuditReport({
      mode: 'catalog',
      limit: 10,
      ...roots,
    });
    const kinds = new Set(report.rows.map((r) => r.decision));
    expect(
      kinds.has('generic_semantic') || kinds.has('family_rotation') || kinds.has('bespoke_affinity'),
    ).toBe(true);
  });
});

describe('neurocanvas catalog ausente (CLI contract)', () => {
  it('auditoria canônica sem catálogo produz baseline vazia', () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'avant-neurocanvas-empty-'));
    const catalogRoot = join(repoRoot, 'data', 'catalog-migration');
    const catalog = buildCanonicalCatalog({ catalogRoot, repoRoot });
    expect(catalog.selections.size).toBe(0);
    const report = buildCatalogAuditReport({ catalogRoot, repoRoot, canonical: true });
    expect(report.questions.unique_slugs).toBe(0);
    expect(report.limitations.some((l) => l.includes('ausente'))).toBe(true);
  });
});
