import {
  declaredVariantIds,
  GENERIC_BY_SLIDE_TYPE,
  listDeclaredVariants,
} from '@/lib/neurocanvas/declaredVariants';
import {
  buildVariantSimilarityReport,
  renderVariantSimilarityMarkdown,
} from '@/lib/neurocanvas/variantSimilarityAudit';

describe('declaredVariants', () => {
  it('lista genéricos por tipo de slide', () => {
    const declared = listDeclaredVariants();
    expect(declared.length).toBeGreaterThan(50);
    for (const id of GENERIC_BY_SLIDE_TYPE.concept_map) {
      expect(declared.some((d) => d.slideType === 'concept_map' && d.id === id)).toBe(true);
    }
    const ids = declaredVariantIds();
    expect(ids).toEqual([...ids].sort());
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cards aparece em logic_flow e danger_zone', () => {
    const declared = listDeclaredVariants();
    expect(declared.some((d) => d.key === 'logic_flow__cards')).toBe(true);
    expect(declared.some((d) => d.key === 'danger_zone__cards')).toBe(true);
  });
});

describe('variantSimilarityAudit', () => {
  it('gera clusters e markdown com candidatos a fusão', () => {
    const report = buildVariantSimilarityReport();
    expect(report.files_scanned).toBeGreaterThan(200);
    expect(report.clusters.length).toBeGreaterThan(50);
    const md = renderVariantSimilarityMarkdown(report);
    expect(md).toContain('# Variant similarity');
    expect(md).toContain('Candidatos a fusao');
  });
});
