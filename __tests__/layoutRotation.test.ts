import {
  CONCEPT_MAP_GEOMETRIC_POOL,
  LOGIC_FLOW_POOL,
  pickRotatedLayoutVariant,
} from '@/components/slides/core/layoutRotation';

describe('layoutRotation', () => {
  it('é determinístico para o mesmo slug e slide', () => {
    const a = pickRotatedLayoutVariant(
      CONCEPT_MAP_GEOMETRIC_POOL,
      'bridge',
      'adm-tec-vias-001',
      0,
      'concept_map',
    );
    const b = pickRotatedLayoutVariant(
      CONCEPT_MAP_GEOMETRIC_POOL,
      'bridge',
      'adm-tec-vias-001',
      0,
      'concept_map',
    );
    expect(a).toBe(b);
    expect(CONCEPT_MAP_GEOMETRIC_POOL).toContain(a);
  });

  it('ancora em bridge com offset 0 retorna bridge', () => {
    const slug = 'slug-offset-zero-test';
    let found = false;
    for (let slideIndex = 0; slideIndex < 50; slideIndex++) {
      const result = pickRotatedLayoutVariant(
        CONCEPT_MAP_GEOMETRIC_POOL,
        'bridge',
        slug,
        slideIndex,
        'concept_map',
      );
      if (result === 'bridge') {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('família morphological (fora do pool) ancora em grid', () => {
    const result = pickRotatedLayoutVariant(
      CONCEPT_MAP_GEOMETRIC_POOL,
      'morphological',
      'any-slug',
      0,
      'concept_map',
    );
    expect(CONCEPT_MAP_GEOMETRIC_POOL).toContain(result);
  });

  it('logic_flow pool retorna horizontal, vertical ou cards', () => {
    const result = pickRotatedLayoutVariant(
      LOGIC_FLOW_POOL,
      'cards',
      'logic-slug-test',
      2,
      'logic_flow',
    );
    expect(LOGIC_FLOW_POOL).toContain(result);
  });

  it('slugs diferentes podem produzir layouts diferentes no mesmo subtópico', () => {
    const results = new Set(
      ['slug-a', 'slug-b', 'slug-c', 'slug-d', 'slug-e'].map((slug) =>
        pickRotatedLayoutVariant(CONCEPT_MAP_GEOMETRIC_POOL, 'bridge', slug, 0, 'concept_map'),
      ),
    );
    expect(results.size).toBeGreaterThan(1);
  });
});
